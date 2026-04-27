import { useEffect, useState } from "react";
import { Upload as UpIcon, FileText, Trash2 } from "lucide-react";
import { api } from "../lib/api";

export default function Upload() {
  const [datasets, setDatasets] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const refresh = () => api.listDatasets().then(setDatasets).catch((e) => setErr(e.message));
  useEffect(() => { refresh(); }, []);

  const onFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true); setErr("");
    try { await api.uploadCsv(f); await refresh(); }
    catch (ex) { setErr(ex.message); }
    finally { setBusy(false); e.target.value = ""; }
  };

  const remove = async (id) => {
    if (!confirm("Delete this dataset?")) return;
    await api.deleteDataset(id); refresh();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Upload Data</h1>
        <p className="text-sm text-slate-400 mt-1">CSV files only. Headers in the first row.</p>
      </div>

      <label className="card p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-accent-500/60 transition border-dashed">
        <UpIcon className="text-accent-400" size={32} />
        <div className="mt-3 font-medium">{busy ? "Uploading…" : "Click to upload a CSV"}</div>
        <div className="text-xs text-slate-500 mt-1">Max ~5MB · headers in row 1</div>
        <input type="file" accept=".csv" className="hidden" onChange={onFile} disabled={busy} />
      </label>

      {err && <div className="text-sm text-rose-400">{err}</div>}

      <div className="card">
        <div className="px-5 py-3 border-b border-navy-700 text-sm font-semibold">Your datasets</div>
        <div className="divide-y divide-navy-800">
          {datasets.length === 0 && <div className="px-5 py-8 text-center text-slate-500">No datasets yet.</div>}
          {datasets.map((d) => (
            <div key={d.id} className="px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-accent-400" />
                <div>
                  <div className="font-medium">{d.name}</div>
                  <div className="text-xs text-slate-500">
                    {d.rows.toLocaleString()} rows · {new Date(d.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
              <button onClick={() => remove(d.id)} className="text-slate-500 hover:text-rose-400 p-2">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
