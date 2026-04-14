"""
Request logging middleware for Flask.
Prints every incoming API request to the console with color-coded output.
"""
from flask import request
from datetime import datetime, timezone


# ANSI color codes
class Colors:
    RESET = '\033[0m'
    BOLD = '\033[1m'
    DIM = '\033[2m'
    CYAN = '\033[36m'
    GREEN = '\033[32m'
    YELLOW = '\033[33m'
    MAGENTA = '\033[35m'
    BLUE = '\033[34m'
    WHITE = '\033[37m'


METHOD_COLORS = {
    'GET': Colors.GREEN,
    'POST': Colors.YELLOW,
    'PUT': Colors.BLUE,
    'DELETE': Colors.MAGENTA,
    'PATCH': Colors.CYAN,
}


def register_request_logger(app):
    """Register the before_request logger hook on the Flask app."""

    @app.before_request
    def log_request():
        now = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')
        method = request.method
        path = request.path
        method_color = METHOD_COLORS.get(method, Colors.WHITE)

        print(
            f"\n{Colors.DIM}───────────────────────────────────────{Colors.RESET}"
        )
        print(
            f"  {Colors.DIM}{now}{Colors.RESET}  "
            f"{method_color}{Colors.BOLD}{method}{Colors.RESET}  "
            f"{Colors.CYAN}{path}{Colors.RESET}"
        )

        # Log the JSON body if present
        if request.is_json:
            try:
                body = request.get_json(silent=True)
                if body:
                    print(f"  {Colors.DIM}Body:{Colors.RESET} {body}")
            except Exception:
                pass

        print(
            f"{Colors.DIM}───────────────────────────────────────{Colors.RESET}"
        )
