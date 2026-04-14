# Instructions for AI Assistants

Hey Claude! When you're helping me write or refactor code in this repo, please stick to these ground rules so we don't make a mess of the architecture:

## 1. Keep the Boundaries Tight
I'm extremely strict about separation of concerns here. Please don't mix things up:
- Leave `app.py` alone aside from basic routing. Do not put business logic in route handlers.
- Keep data validation strictly inside Pydantic (`schemas.py`). Don't do manual `if request.data == None` checks inside the route. Rely on 422 errors doing their job.
- Put all the actual scoring math exclusively in `services.py`. 
- If you are asked to add a new scoring rule, use the Strategy Pattern format I've already set up. Just add a new static method and register it in the dictionary. No ugly `if/elif` chains, please.

## 2. Tech Stack Realities
- **DB:** We're tied to SQLAlchemy ORM. Assume we're running PostgreSQL in prod, so no SQLite-only hacks.
- **Frontend:** React 18 + Vite. Stick entirely to functional components and hooks. 
- **Styling:** We use Tailwind CSS v3. Do not write v4 syntax.

## 3. Don't Break Audit Trails
- If you modify or create a `Task`, make sure you also log what happened in the `ActivityLog` table. Do both inside the *same* database transaction via `db.session.flush()` so we don't end up with ghost tasks if an error occurs.
- If an exception hits, log it internally. Don't pass raw stack traces back to the frontend JSON.

## 4. KISS (Keep It Simple, Stupid)
- Simple, readable code wins over clever code every time. Avoid heavily nested comprehensions or one-liners just to save a few bytes.
- Heavily rely on Python's static type hinting to trap errors early.

Thanks!
