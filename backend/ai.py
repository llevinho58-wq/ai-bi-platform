import os
import json
from anthropic import Anthropic

MODEL = "claude-sonnet-4-5"
_client: Anthropic | None = None


def client() -> Anthropic:
    global _client
    if _client is None:
        _client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY", ""))
    return _client


def _data_preview(records: list[dict], schema: list[dict], n: int = 50) -> str:
    return json.dumps({"schema": schema, "sample_rows": records[:n], "total_rows": len(records)}, default=str)


def generate_insights(records: list[dict], schema: list[dict]) -> str:
    """Top-level narrative insights for a dataset."""
    if not os.getenv("ANTHROPIC_API_KEY"):
        return "Set ANTHROPIC_API_KEY to enable AI insights."

    msg = client().messages.create(
        model=MODEL,
        max_tokens=1200,
        system=(
            "You are a senior business intelligence analyst. Given a dataset preview, "
            "produce a concise executive summary: 3-5 key findings, notable trends, "
            "and 2-3 concrete recommendations. Use crisp bullet points."
        ),
        messages=[{
            "role": "user",
            "content": f"Analyze this business dataset and surface insights:\n\n{_data_preview(records, schema)}",
        }],
    )
    return msg.content[0].text


def answer_question(records: list[dict], schema: list[dict], question: str) -> str:
    """Natural-language Q&A grounded in the dataset."""
    if not os.getenv("ANTHROPIC_API_KEY"):
        return "Set ANTHROPIC_API_KEY to enable AI Q&A."

    msg = client().messages.create(
        model=MODEL,
        max_tokens=900,
        system=(
            "You are a data analyst answering questions about a user's dataset. "
            "Ground every answer in the provided rows. If the data cannot answer the "
            "question, say so. Show numbers and call out caveats when sample is small."
        ),
        messages=[{
            "role": "user",
            "content": f"Dataset:\n{_data_preview(records, schema, n=200)}\n\nQuestion: {question}",
        }],
    )
    return msg.content[0].text
