# BizIQ — AI Business Intelligence Platform

Production-grade AI BI platform. Upload CSVs, auto-generate charts, ask Claude questions about your data, export PDF reports.

## Stack
- **Backend**: FastAPI, SQLite, JWT auth, Anthropic Claude API
- **Frontend**: React + Vite, Tailwind CSS, Recharts, React Router

## Quick Start

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate   # (Windows: venv\Scripts\activate)
pip install -r requirements.txt
export ANTHROPIC_API_KEY=sk-ant-...
export JWT_SECRET=change-me
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Visit http://localhost:5173

## Features
1. Landing page with pricing
2. Signup/login (JWT)
3. Dashboard with metric cards (Revenue, Users, Churn, AOV)
4. CSV upload + parsing
5. Auto-generated charts (Recharts)
6. AI insights via Claude (`claude-sonnet-4-20250514`)
7. Natural language Q&A on your data
8. PDF report export
9. Settings page

## Project Layout
```
backend/
  main.py            # FastAPI app + all routes
  models.py          # SQLAlchemy models
  auth.py            # JWT + password hashing
  ai.py              # Claude API integration
  analytics.py       # CSV parsing + metric computation
  pdf_report.py      # PDF generation
  requirements.txt
frontend/
  src/
    pages/           # Landing, Login, Signup, Dashboard, Upload, Insights, Ask, Reports, Settings
    components/      # Sidebar, MetricCard, ChartCard, etc.
    lib/api.js       # API client
  index.html
  vite.config.js
  tailwind.config.js
```
