# Backend (Flask + SQLite)

Quickstart

1. Create and activate a virtual environment (recommended)
   - Windows PowerShell
     python -m venv .venv
     .venv\\Scripts\\Activate.ps1

2. Install dependencies
   pip install -r requirements.txt

3. Run the server (creates app.db automatically)
   python app.py

APIs
- GET /health
- POST /auth/signup { email, password }
- POST /auth/login { email, password }
- POST /transactions { user_id, date(ISO), description, amount, type('income'|'expense'), category? }
- GET /transactions?user_id=1&limit=50
- GET /summary?user_id=1
- GET /budget/generate?user_id=1

Notes
- For demo, auth returns user_id. Use this ID on the frontend.
- CORS enabled for Expo.
