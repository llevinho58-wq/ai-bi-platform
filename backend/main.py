import json
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
import io

from models import init_db, get_db, User, Dataset, Insight
from auth import hash_password, verify_password, create_token, current_user
import analytics
import ai
import pdf_report

app = FastAPI(title="BizIQ API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()


# ---------- schemas ----------
class SignupIn(BaseModel):
    email: EmailStr
    name: str
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class AskIn(BaseModel):
    question: str


class SettingsIn(BaseModel):
    name: str | None = None
    plan: str | None = None


# ---------- auth ----------
@app.post("/api/auth/signup", response_model=TokenOut)
def signup(data: SignupIn, db: Session = Depends(get_db)):
    if db.query(User).filter_by(email=data.email).first():
        raise HTTPException(400, "Email already registered")
    u = User(email=data.email, name=data.name, password_hash=hash_password(data.password))
    db.add(u); db.commit(); db.refresh(u)
    return TokenOut(access_token=create_token(u.id), user=_user_dict(u))


@app.post("/api/auth/login", response_model=TokenOut)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    u = db.query(User).filter_by(email=form.username).first()
    if not u or not verify_password(form.password, u.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Bad email or password")
    return TokenOut(access_token=create_token(u.id), user=_user_dict(u))


@app.get("/api/auth/me")
def me(user: User = Depends(current_user)):
    return _user_dict(user)


@app.patch("/api/auth/me")
def update_me(data: SettingsIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    if data.name is not None:
        user.name = data.name
    if data.plan is not None:
        user.plan = data.plan
    db.commit()
    return _user_dict(user)


def _user_dict(u: User) -> dict:
    return {"id": u.id, "email": u.email, "name": u.name, "plan": u.plan}


# ---------- datasets ----------
@app.post("/api/datasets/upload")
async def upload(file: UploadFile = File(...), user: User = Depends(current_user), db: Session = Depends(get_db)):
    content = await file.read()
    try:
        df = analytics.parse_csv(content)
    except Exception as e:
        raise HTTPException(400, f"Could not parse CSV: {e}")

    schema = analytics.df_schema(df)
    records = analytics.df_to_records(df)

    ds = Dataset(
        user_id=user.id,
        name=file.filename or "dataset.csv",
        rows=len(df),
        columns_json=json.dumps(schema),
        data_json=json.dumps(records, default=str),
    )
    db.add(ds); db.commit(); db.refresh(ds)
    return {"id": ds.id, "name": ds.name, "rows": ds.rows, "schema": schema}


@app.get("/api/datasets")
def list_datasets(user: User = Depends(current_user), db: Session = Depends(get_db)):
    items = db.query(Dataset).filter_by(user_id=user.id).order_by(Dataset.created_at.desc()).all()
    return [{"id": d.id, "name": d.name, "rows": d.rows, "created_at": d.created_at.isoformat()} for d in items]


@app.get("/api/datasets/{ds_id}")
def get_dataset(ds_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    ds = _own_dataset(ds_id, user, db)
    return {
        "id": ds.id,
        "name": ds.name,
        "rows": ds.rows,
        "schema": json.loads(ds.columns_json or "[]"),
        "preview": json.loads(ds.data_json or "[]")[:100],
    }


@app.delete("/api/datasets/{ds_id}")
def delete_dataset(ds_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    ds = _own_dataset(ds_id, user, db)
    db.delete(ds); db.commit()
    return {"ok": True}


# ---------- analytics ----------
@app.get("/api/datasets/{ds_id}/dashboard")
def dashboard(ds_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    ds = _own_dataset(ds_id, user, db)
    import pandas as pd
    df = pd.DataFrame(json.loads(ds.data_json or "[]"))
    if df.empty:
        return {"metrics": {}, "charts": []}
    return {
        "metrics": analytics.compute_metrics(df),
        "charts": analytics.auto_charts(df),
    }


@app.get("/api/dashboard/summary")
def summary(user: User = Depends(current_user), db: Session = Depends(get_db)):
    """Aggregate top-line metrics across the user's most recent dataset."""
    ds = db.query(Dataset).filter_by(user_id=user.id).order_by(Dataset.created_at.desc()).first()
    if not ds:
        return {"metrics": {"revenue": 0, "users": 0, "churn": 0, "aov": 0}, "charts": [], "dataset": None}
    import pandas as pd
    df = pd.DataFrame(json.loads(ds.data_json or "[]"))
    return {
        "dataset": {"id": ds.id, "name": ds.name, "rows": ds.rows},
        "metrics": analytics.compute_metrics(df),
        "charts": analytics.auto_charts(df),
    }


# ---------- AI ----------
@app.post("/api/datasets/{ds_id}/insights")
def insights(ds_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    ds = _own_dataset(ds_id, user, db)
    schema = json.loads(ds.columns_json or "[]")
    records = json.loads(ds.data_json or "[]")
    text = ai.generate_insights(records, schema)
    db.add(Insight(dataset_id=ds.id, kind="summary", answer=text)); db.commit()
    return {"insights": text}


@app.post("/api/datasets/{ds_id}/ask")
def ask(ds_id: int, body: AskIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    ds = _own_dataset(ds_id, user, db)
    schema = json.loads(ds.columns_json or "[]")
    records = json.loads(ds.data_json or "[]")
    text = ai.answer_question(records, schema, body.question)
    db.add(Insight(dataset_id=ds.id, kind="qa", question=body.question, answer=text)); db.commit()
    return {"answer": text}


# ---------- PDF ----------
@app.get("/api/datasets/{ds_id}/report")
def report(ds_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    ds = _own_dataset(ds_id, user, db)
    import pandas as pd
    df = pd.DataFrame(json.loads(ds.data_json or "[]"))
    metrics = analytics.compute_metrics(df) if not df.empty else {}
    schema = json.loads(ds.columns_json or "[]")
    last = (
        db.query(Insight)
        .filter_by(dataset_id=ds.id, kind="summary")
        .order_by(Insight.created_at.desc())
        .first()
    )
    insights_text = last.answer if last else ai.generate_insights(
        json.loads(ds.data_json or "[]"), schema
    )
    pdf = pdf_report.build_report(ds.name, metrics, insights_text, schema, ds.rows)
    return StreamingResponse(
        io.BytesIO(pdf),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="biziq-{ds.id}.pdf"'},
    )


def _own_dataset(ds_id: int, user: User, db: Session) -> Dataset:
    ds = db.query(Dataset).get(ds_id)
    if not ds or ds.user_id != user.id:
        raise HTTPException(404, "Dataset not found")
    return ds
