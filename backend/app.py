from flask import Flask, request, jsonify
from flask_cors import CORS
from pydantic import ValidationError
import os
import sys
import json
import requests as http_requests
from dotenv import load_dotenv

# Load .env from the project root (one level up from backend/)
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Ensure backend module can be resolved
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from models import db, Task, ActivityLog
from schemas import TaskCreate, TaskResponse, ActivityLogResponse
from services import TaskService
from middleware import register_request_logger

app = Flask(__name__)
CORS(app)

# PostgreSQL connection from environment or default
database_uri = os.environ.get('DATABASE_URL', 'postgresql://localhost/tasklift')
app.config['SQLALCHEMY_DATABASE_URI'] = database_uri
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()

# Register request logging middleware
register_request_logger(app)

with app.app_context():
    try:
        db.create_all()
    except Exception as e:
        print(f"Warning: Could not create tables automatically. "
              f"Make sure PostgreSQL is running and DB exists! Error: {e}")


# ─── Routes ───────────────────────────────────────────────────────────────────


@app.route('/tasks', methods=['POST'])
def create_task():
    try:
        data = request.get_json()

        # Validate with Pydantic — invalid strategy triggers ValidationError
        validated = TaskCreate(**data)

        # Calculate priority score via Strategy Pattern
        task_dict = TaskService.prepare_task_data(validated.model_dump())

        # Persist task
        new_task = Task(**task_dict)
        db.session.add(new_task)
        db.session.flush()  # Get the ID before committing

        # Create audit log entry
        log = ActivityLog(
            task_id=new_task.id,
            action='created',
            details=(
                f"Task created with strategy='{validated.strategy}', "
                f"impact={validated.impact}, effort={validated.effort}, "
                f"priority_score={new_task.priority_score}"
            )
        )
        db.session.add(log)
        db.session.commit()

        response = TaskResponse.model_validate(new_task)
        return jsonify(response.model_dump(mode='json')), 201

    except ValidationError as e:
        errors = [
            {"loc": list(err["loc"]), "msg": err["msg"], "type": err["type"]}
            for err in e.errors()
        ]
        return jsonify({
            "error": "Validation failed",
            "details": errors
        }), 422

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route('/tasks', methods=['GET'])
def get_tasks():
    try:
        tasks = Task.query.order_by(Task.priority_score.desc()).all()
        response = [
            TaskResponse.model_validate(t).model_dump(mode='json') for t in tasks
        ]
        return jsonify(response), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/tasks/<int:task_id>/logs', methods=['GET'])
def get_task_logs(task_id):
    try:
        task = Task.query.get(task_id)
        if not task:
            return jsonify({"error": "Task not found"}), 404

        logs = (
            ActivityLog.query
            .filter_by(task_id=task_id)
            .order_by(ActivityLog.timestamp.desc())
            .all()
        )
        response = [
            ActivityLogResponse.model_validate(log).model_dump(mode='json')
            for log in logs
        ]
        return jsonify(response), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    try:
        task = Task.query.get(task_id)
        if not task:
            return jsonify({"error": "Task not found"}), 404
        db.session.delete(task)
        db.session.commit()
        return jsonify({"message": "Task deleted"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route('/tasks/<int:task_id>/done', methods=['PATCH'])
def mark_task_done(task_id):
    try:
        task = Task.query.get(task_id)
        if not task:
            return jsonify({"error": "Task not found"}), 404
        task.is_done = not task.is_done
        log = ActivityLog(
            task_id=task.id,
            action='marked_done' if task.is_done else 'marked_undone',
            details=f"Task marked as {'done' if task.is_done else 'not done'}"
        )
        db.session.add(log)
        db.session.commit()
        response = TaskResponse.model_validate(task)
        return jsonify(response.model_dump(mode='json')), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


PARSE_SYSTEM_PROMPT = """You are a task parsing assistant for a task management app called TaskLift Pro.
A user will give you a vague, informal description of something they need to do.
Your job is to extract and structure it into a task.

Return ONLY a valid JSON object with this exact structure — no extra text, no markdown, no backticks:
{
  "title": "Short clear task title (max 60 chars, sentence case, no period)",
  "description": "More detailed expanded explanation of what needs to be done",
  "impact": <integer 1-5>,
  "effort": <integer 1-5>,
  "strategy": "balanced" | "urgent" | "roi"
}

Impact scale (how valuable/critical is this?):
  5 = critical (production down, security issue, blocking everything)
  4 = high (major bug, important feature, customer-facing issue)
  3 = medium (notable improvement, moderate bug, internal tooling)
  2 = low (minor enhancement, cosmetic improvement)
  1 = minimal (nice-to-have, future idea, very low priority)

Effort scale (how much work does this take?):
  5 = very high (weeks, major architecture change, research required)
  4 = high (several days, significant engineering, cross-team)
  3 = medium (1-2 days, moderate complexity)
  2 = low (a few hours, straightforward implementation)
  1 = trivial (minutes, one-liner, copy-paste fix)

Strategy selection rules:
  - "urgent": time-sensitive, blocking, production issues, security, bugs, hard deadlines
  - "roi": high impact for low effort (Impact >= 4 and Effort <= 2), quick wins, optimizations
  - "balanced": everything else — features, planning, documentation, refactoring

Edge case rules:
  - If the input is completely nonsensical, in a language with no extractable task, or describes no actionable work, return exactly:
    {"error": "I couldn't find a clear task in that. Try describing what you need to get done — for example: 'the login button is broken' or 'add dark mode to the dashboard'."}
  - If the input describes multiple tasks, focus on the most prominent one and mention others in the description.
  - If the input is a single word with no context, ask for more detail via the error field.
  - Never invent details that aren't implied by the input."""


@app.route('/parse-task', methods=['POST'])
def parse_task():
    try:
        data = request.get_json(silent=True)
        if not data or 'text' not in data:
            return jsonify({"error": "Missing 'text' field in request body"}), 400

        raw_text = str(data.get('text', '')).strip()

        if not raw_text:
            return jsonify({"error": "Please describe what you need to do."}), 400

        if len(raw_text) < 4:
            return jsonify({"error": "That's too short for me to understand. Can you elaborate a bit?"}), 400

        groq_api_key = os.environ.get('GROQ_API_KEY')
        if not groq_api_key:
            return jsonify({"error": "AI parsing is not enabled. Set the GROQ_API_KEY environment variable."}), 503

        try:
            groq_response = http_requests.post(
                'https://api.groq.com/openai/v1/chat/completions',
                headers={
                    'Authorization': f'Bearer {groq_api_key}',
                    'Content-Type': 'application/json'
                },
                json={
                    'model': 'llama-3.3-70b-versatile',
                    'messages': [
                        {'role': 'system', 'content': PARSE_SYSTEM_PROMPT},
                        {'role': 'user', 'content': raw_text[:1000]}  # Hard cap input length
                    ],
                    'temperature': 0.15,
                    'max_tokens': 400,
                },
                timeout=15
            )
        except http_requests.exceptions.Timeout:
            return jsonify({"error": "AI service timed out. Please try again."}), 504
        except http_requests.exceptions.RequestException:
            return jsonify({"error": "Failed to reach AI service. Check your internet connection."}), 502

        if not groq_response.ok:
            return jsonify({"error": f"AI service returned an error ({groq_response.status_code}). Try again."}), 502

        try:
            content = groq_response.json()['choices'][0]['message']['content'].strip()
            # Strip accidental markdown code fences if the model adds them
            if content.startswith('```'):
                content = content.split('```')[1]
                if content.startswith('json'):
                    content = content[4:]
            parsed = json.loads(content)
        except (json.JSONDecodeError, KeyError, IndexError):
            return jsonify({"error": "AI returned an unexpected response format. Please try again."}), 502

        # If the AI returned an explicit error for bad input, pass it through
        if 'error' in parsed:
            return jsonify({"error": parsed['error']}), 422

        # Validate and sanitise all fields defensively
        title = str(parsed.get('title') or 'New Task').strip()[:60]
        description = str(parsed.get('description') or '').strip()[:500]

        try:
            impact = max(1, min(5, int(parsed.get('impact', 3))))
        except (TypeError, ValueError):
            impact = 3

        try:
            effort = max(1, min(5, int(parsed.get('effort', 3))))
        except (TypeError, ValueError):
            effort = 3

        strategy = str(parsed.get('strategy', 'balanced')).lower().strip()
        if strategy not in ('balanced', 'urgent', 'roi'):
            strategy = 'balanced'

        if not title:
            title = 'New Task'

        return jsonify({
            'title': title,
            'description': description,
            'impact': impact,
            'effort': effort,
            'strategy': strategy,
        }), 200

    except Exception as e:
        return jsonify({"error": "An unexpected error occurred. Please try again."}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5001)
