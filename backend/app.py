from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import create_engine, Column, Integer, String, Float, Date, ForeignKey, desc
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
from dateutil import parser as date_parser
from datetime import datetime, timedelta
import os

# ---------- Setup ----------
app = Flask(__name__)
CORS(app)

DB_PATH = os.path.join(os.path.dirname(__file__), 'app.db')
engine = create_engine(f'sqlite:///{DB_PATH}', echo=False, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# ---------- Models ----------
class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    transactions = relationship("Transaction", back_populates="user")

class Transaction(Base):
    __tablename__ = 'transactions'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    date = Column(Date, nullable=False)
    description = Column(String, default='')
    amount = Column(Float, nullable=False)
    category = Column(String, default='Other')
    type = Column(String, default='expense')  # 'income' or 'expense'

    user = relationship("User", back_populates="transactions")

Base.metadata.create_all(engine)

# ---------- Simple AI/ML Categorizer ----------
KEYWORD_CATEGORY_MAP = {
    'restaurant': 'Food',
    'food': 'Food',
    'grocery': 'Food',
    'supermarket': 'Food',
    'uber': 'Travel',
    'ola': 'Travel',
    'taxi': 'Travel',
    'flight': 'Travel',
    'airlines': 'Travel',
    'rent': 'Rent',
    'salary': 'Income',
    'payroll': 'Income',
    'bonus': 'Income',
    'electricity': 'Utilities',
    'water': 'Utilities',
    'wifi': 'Utilities',
    'internet': 'Utilities',
    'recharge': 'Utilities',
    'movie': 'Entertainment',
    'netflix': 'Entertainment',
    'prime': 'Entertainment',
    'shopping': 'Shopping',
    'amazon': 'Shopping',
    'flipkart': 'Shopping',
}

def auto_categorize(description: str, amount: float, tx_type: str) -> str:
    if tx_type == 'income':
        return 'Income'
    desc = (description or '').lower()
    for kw, cat in KEYWORD_CATEGORY_MAP.items():
        if kw in desc:
            return cat
    # Heuristic: large regular amounts might be Rent
    if amount >= 5000 and 'rent' in desc or amount >= 10000:
        return 'Rent'
    return 'Other'

# ---------- Helpers ----------
def to_dict(tx: Transaction):
    return {
        'id': tx.id,
        'user_id': tx.user_id,
        'date': tx.date.isoformat(),
        'description': tx.description,
        'amount': tx.amount,
        'category': tx.category,
        'type': tx.type,
    }

# ---------- Routes ----------
@app.get('/health')
def health():
    return {'status': 'ok'}

@app.post('/auth/signup')
def signup():
    data = request.get_json(force=True)
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    db = SessionLocal()
    try:
        if db.query(User).filter_by(email=email).first():
            return jsonify({'error': 'Email already registered'}), 400
        user = User(email=email, password_hash=generate_password_hash(password))
        db.add(user)
        db.commit()
        db.refresh(user)
        return jsonify({'message': 'Signup successful', 'user_id': user.id})
    finally:
        db.close()

@app.post('/auth/login')
def login():
    data = request.get_json(force=True)
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    db = SessionLocal()
    try:
        user = db.query(User).filter_by(email=email).first()
        if not user or not check_password_hash(user.password_hash, password):
            return jsonify({'error': 'Invalid credentials'}), 401
        return jsonify({'message': 'Login successful', 'user_id': user.id})
    finally:
        db.close()

@app.post('/transactions')
def add_transaction():
    data = request.get_json(force=True)
    user_id = data.get('user_id')
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    date_str = data.get('date')
    description = data.get('description') or ''
    amount = float(data.get('amount') or 0)
    tx_type = (data.get('type') or 'expense').lower()
    if tx_type not in ['income', 'expense']:
        return jsonify({'error': "type must be 'income' or 'expense'"}), 400
    try:
        tx_date = date_parser.parse(date_str).date() if date_str else datetime.utcnow().date()
    except Exception:
        return jsonify({'error': 'Invalid date format'}), 400

    category = data.get('category') or auto_categorize(description, amount, tx_type)

    db = SessionLocal()
    try:
        # Ensure user exists
        if not db.query(User).filter_by(id=user_id).first():
            return jsonify({'error': 'User not found'}), 404
        tx = Transaction(
            user_id=user_id,
            date=tx_date,
            description=description,
            amount=amount,
            category=category,
            type=tx_type,
        )
        db.add(tx)
        db.commit()
        db.refresh(tx)
        return jsonify({'message': 'Transaction added', 'transaction': to_dict(tx)})
    finally:
        db.close()

@app.get('/transactions')
def list_transactions():
    user_id = request.args.get('user_id', type=int)
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    limit = request.args.get('limit', default=50, type=int)
    db = SessionLocal()
    try:
        q = (
            db.query(Transaction)
            .filter(Transaction.user_id == user_id)
            .order_by(desc(Transaction.date), desc(Transaction.id))
            .limit(limit)
        )
        return jsonify([to_dict(tx) for tx in q.all()])
    finally:
        db.close()

@app.get('/summary')
def summary():
    user_id = request.args.get('user_id', type=int)
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    db = SessionLocal()
    try:
        incomes = db.query(Transaction).filter_by(user_id=user_id, type='income').all()
        expenses = db.query(Transaction).filter_by(user_id=user_id, type='expense').all()
        total_income = sum(t.amount for t in incomes)
        total_expense = sum(t.amount for t in expenses)
        return jsonify({'total_income': total_income, 'total_expense': total_expense})
    finally:
        db.close()

@app.get('/budget/generate')
def generate_budget():
    user_id = request.args.get('user_id', type=int)
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    db = SessionLocal()
    try:
        since = datetime.utcnow().date() - timedelta(days=30)
        txs = (
            db.query(Transaction)
            .filter(Transaction.user_id == user_id, Transaction.date >= since, Transaction.type == 'expense')
            .all()
        )
        totals = {}
        total_expense = 0.0
        for t in txs:
            totals[t.category] = totals.get(t.category, 0.0) + t.amount
            total_expense += t.amount

        if total_expense <= 0:
            # Default simple budget if no data
            breakdown = [
                {'category': 'Savings', 'percent': 20},
                {'category': 'Food', 'percent': 30},
                {'category': 'Rent', 'percent': 40},
                {'category': 'Other', 'percent': 10},
            ]
            recs = [
                'Not enough expense data in last 30 days. Using a default 50/30/20-style plan.',
                'Track your expenses for a week to get more personalized recommendations.'
            ]
            return jsonify({'breakdown': breakdown, 'recommendations': recs})

        # Compute percentages
        breakdown = []
        for cat, amt in sorted(totals.items(), key=lambda x: -x[1]):
            breakdown.append({'category': cat, 'percent': round(100 * amt / total_expense, 1)})

        # Ensure Savings present as suggestion (e.g., 20%)
        allocated = sum(b['percent'] for b in breakdown)
        savings_pct = 20
        if allocated + savings_pct > 100:
            # Scale down others proportionally to fit Savings
            scale = (100 - savings_pct) / max(allocated, 1)
            for b in breakdown:
                b['percent'] = round(b['percent'] * scale, 1)
        breakdown.append({'category': 'Savings', 'percent': savings_pct})

        # Simple explainable recommendations
        top_cat = breakdown[0]['category'] if breakdown else 'Other'
        recs = []
        recs.append(f"Your highest spending category is {top_cat}. Consider setting weekly limits or using cash-only for this category.")
        if any(b['category'] == 'Travel' and b['percent'] > 15 for b in breakdown):
            recs.append('Your travel expenses are higher than typical. Consider pooling rides or using public transit where feasible.')
        else:
            recs.append('Aim to save at least 20% by automating transfers right after payday.')

        return jsonify({'breakdown': breakdown, 'recommendations': recs})
    finally:
        db.close()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
