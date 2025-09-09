# AI-Powered Personalized Financial Planning Assistant (Prototype)

Tech Stack
- Frontend: React Native (Expo) + react-native-chart-kit
- Backend: Flask (Python)
- Database: SQLite (local file)
- ML/AI: Keyword-based expense categorizer (simple, explainable)

Features (Demo Scope)
- Basic email/password signup & login (stored in SQLite)
- Add income/expense transactions (with auto-categorization)
- Dashboard: Total income vs expenses, latest transactions
- Generate budget: Analyzes last 30 days and proposes a breakdown + recommendations

Project Structure
- backend/
  - app.py
  - requirements.txt
  - README.md
- frontend/
  - App.js
  - screens/
    - LoginScreen.js, SignupScreen.js, DashboardScreen.js, AddExpenseScreen.js, BudgetScreen.js
  - utils/config.js (API base URL)
  - package.json, app.json, babel.config.js

How to Run (Windows)
Backend
1) Open a terminal in backend/
2) python -m venv .venv
3) .venv\\Scripts\\Activate.ps1
4) pip install -r requirements.txt
5) python app.py

Frontend
1) Open a new terminal in frontend/
2) npm install -g expo-cli (if you don't have it) or use npx
3) npm install
4) npm start (or npx expo start)

Notes
- If running on a mobile device via Expo Go, set your LAN IP in frontend/utils/config.js instead of 127.0.0.1.
- This is a prototype for demo & thesis illustration, not production-ready. Minimal security model (user_id token).
