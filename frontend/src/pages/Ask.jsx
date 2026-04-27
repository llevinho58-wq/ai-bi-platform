import { useEffect, useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { api } from "../lib/api";

export default function Ask() {
  const [datasets, setDatasets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [q, setQ] = useState("");
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.listDatasets().then((d) => { setDatasets(d); if (d[0]) setSelected(d[0].id); });
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!q.trim() || !selected) return;
    const question = q.trim();
    setQ(""); setBusy(true);
    setHistory((h) => [...h, { role: "user", text: question }]);
    try {
      const r = await api.ask(selected, question);
      setHistory((h) => [...h, { role: "ai", text: r.answer }]);
    } catch (e) {
      setHistory((h) => [...h, { role: "ai", text: `Error: ${e.message}` }]);
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="text-accent-400" /> Ask Your Data
        </h1>
        <p className="text-sm text-slate-400 mt-1">Natural language questions, grounded in your dataset.</p>
      </div>

      <select className="input max-w-xs" value={selected || ""} onChange={(e) => setSelected(Number(e.target.value))}>
        {datasets.length === 0 && <option>No datasets</option>}
        {datasets.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
      </select>

      <div className="card flex-1 p-5 overflow-y-auto space-y-4 min-h-[300px]">
        {history.length === 0 && (
          <div className="text-slate-500 text-center py-8">
            Try: "What are the top 3 trends?" or "Which segment has the highest revenue?"
          </div>
        )}
        {history.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 whitespace-pre-wrap ${
              m.role === "user" ? "bg-accent-600 text-white" : "bg-navy-800 text-slate-200 border border-navy-700"
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {busy && <div className="text-slate-500 text-sm">Claude is thinking…</div>}
      </div>

      <form onSubmit={submit} className="flex gap-2">
        <input className="input flex-1" placeholder="Ask anything about your data…" value={q}
          onChange={(e) => setQ(e.target.value)} disabled={!selected || busy} />
        <button className="btn-primary" disabled={!selected || busy}>
          <Send size={16} /> Send
        </button>
      </form>
    </div>
  );
}
