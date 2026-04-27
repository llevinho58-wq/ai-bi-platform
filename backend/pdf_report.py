import io
from datetime import datetime
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak,
)


def build_report(dataset_name: str, metrics: dict, insights: str, schema: list[dict], rows: int) -> bytes:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=LETTER, title=f"BizIQ Report — {dataset_name}")
    styles = getSampleStyleSheet()
    title = ParagraphStyle("title", parent=styles["Title"], textColor=colors.HexColor("#0f172a"))
    h2 = ParagraphStyle("h2", parent=styles["Heading2"], textColor=colors.HexColor("#1e3a8a"))

    story = [
        Paragraph("BizIQ Intelligence Report", title),
        Paragraph(f"<b>Dataset:</b> {dataset_name}", styles["Normal"]),
        Paragraph(f"<b>Generated:</b> {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", styles["Normal"]),
        Spacer(1, 18),

        Paragraph("Key Metrics", h2),
        Table(
            [["Metric", "Value"]] + [[k.upper(), _fmt(v)] for k, v in metrics.items()],
            colWidths=[200, 200],
            style=TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("PADDING", (0, 0), (-1, -1), 8),
            ]),
        ),
        Spacer(1, 18),

        Paragraph("AI Insights", h2),
        Paragraph((insights or "No insights generated.").replace("\n", "<br/>"), styles["BodyText"]),
        Spacer(1, 18),

        Paragraph("Schema", h2),
        Paragraph(f"{rows} rows · {len(schema)} columns", styles["Normal"]),
        Table(
            [["Column", "Type"]] + [[c["name"], c["type"]] for c in schema],
            colWidths=[260, 140],
            style=TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e3a8a")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ]),
        ),
    ]
    doc.build(story)
    return buf.getvalue()


def _fmt(v):
    if v is None:
        return "—"
    if isinstance(v, float):
        return f"{v:,.2f}"
    return f"{v:,}" if isinstance(v, int) else str(v)
