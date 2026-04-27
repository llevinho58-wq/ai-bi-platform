import io
import json
import pandas as pd
from typing import Any

NUMERIC_HINTS = ("revenue", "sales", "amount", "price", "total", "value", "aov")
USER_HINTS = ("user", "customer", "signup", "active")
CHURN_HINTS = ("churn", "cancel", "lost")


def parse_csv(content: bytes) -> pd.DataFrame:
    return pd.read_csv(io.BytesIO(content))


def df_schema(df: pd.DataFrame) -> list[dict]:
    out = []
    for col in df.columns:
        dtype = str(df[col].dtype)
        if "int" in dtype or "float" in dtype:
            kind = "number"
        elif "datetime" in dtype:
            kind = "date"
        else:
            kind = "string"
        out.append({"name": col, "type": kind})
    return out


def df_to_records(df: pd.DataFrame, limit: int = 5000) -> list[dict]:
    return json.loads(df.head(limit).to_json(orient="records"))


def _find_col(df: pd.DataFrame, hints: tuple[str, ...]) -> str | None:
    for c in df.columns:
        cl = c.lower()
        if any(h in cl for h in hints):
            return c
    return None


def compute_metrics(df: pd.DataFrame) -> dict[str, Any]:
    """Heuristic top-line metrics used on the dashboard."""
    metrics = {"revenue": None, "users": None, "churn": None, "aov": None}

    rev_col = _find_col(df, NUMERIC_HINTS)
    if rev_col and pd.api.types.is_numeric_dtype(df[rev_col]):
        metrics["revenue"] = float(df[rev_col].sum())
        metrics["aov"] = float(df[rev_col].mean())

    user_col = _find_col(df, USER_HINTS)
    if user_col:
        if pd.api.types.is_numeric_dtype(df[user_col]):
            metrics["users"] = int(df[user_col].sum())
        else:
            metrics["users"] = int(df[user_col].nunique())

    churn_col = _find_col(df, CHURN_HINTS)
    if churn_col and pd.api.types.is_numeric_dtype(df[churn_col]):
        total = df[churn_col].count()
        if total:
            metrics["churn"] = float(df[churn_col].sum() / total)

    # Fallbacks so dashboard always has something to show
    if metrics["users"] is None:
        metrics["users"] = int(len(df))
    return metrics


def auto_charts(df: pd.DataFrame) -> list[dict]:
    """Produce chart-ready data structures from the dataframe."""
    charts: list[dict] = []
    numeric_cols = [c for c in df.columns if pd.api.types.is_numeric_dtype(df[c])]
    cat_cols = [c for c in df.columns if not pd.api.types.is_numeric_dtype(df[c])]

    # Time series if we can find a date-like column
    date_col = None
    for c in df.columns:
        if "date" in c.lower() or "month" in c.lower() or "day" in c.lower():
            date_col = c
            break

    if date_col and numeric_cols:
        try:
            tmp = df[[date_col, numeric_cols[0]]].copy()
            tmp[date_col] = pd.to_datetime(tmp[date_col], errors="coerce")
            tmp = tmp.dropna().sort_values(date_col)
            tmp[date_col] = tmp[date_col].dt.strftime("%Y-%m-%d")
            charts.append({
                "type": "line",
                "title": f"{numeric_cols[0]} over time",
                "xKey": date_col,
                "yKey": numeric_cols[0],
                "data": json.loads(tmp.head(200).to_json(orient="records")),
            })
        except Exception:
            pass

    # Bar: top categories by first numeric col
    if cat_cols and numeric_cols:
        try:
            grp = (
                df.groupby(cat_cols[0])[numeric_cols[0]]
                .sum()
                .sort_values(ascending=False)
                .head(10)
                .reset_index()
            )
            charts.append({
                "type": "bar",
                "title": f"Top {cat_cols[0]} by {numeric_cols[0]}",
                "xKey": cat_cols[0],
                "yKey": numeric_cols[0],
                "data": json.loads(grp.to_json(orient="records")),
            })
        except Exception:
            pass

    # Pie: distribution of first categorical
    if cat_cols:
        try:
            counts = df[cat_cols[0]].value_counts().head(6).reset_index()
            counts.columns = ["name", "value"]
            charts.append({
                "type": "pie",
                "title": f"{cat_cols[0]} distribution",
                "data": json.loads(counts.to_json(orient="records")),
            })
        except Exception:
            pass

    return charts
