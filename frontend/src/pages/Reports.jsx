import { useEffect, useState } from "react";
import { FileText, Download } from "lucide-react";
import { api, auth } from "../lib/api";

export default function Reports() {
  const [datasets, setDatasets] = useState([]);
  useEffect(() => { api.listDatasets().then(setDatasets); }, []);

  const download = async (id, name) => {
    const res = await fetch(api.reportUrl(id), {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${name}.pdf`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="text-accent-400" /> Reports
        </h1>
        <p className="text-sm text-slate-400 mt-1">Export a polished PDF report for any dataset.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {datasets.length === 0 && <div className="text-slate-500">No datasets to report on.</div>}
        {datasets.map((d) => (
          <div key={d.id} className="card p-5 flex items-center justify-between">
            <div>
              <div className="font-semibold">{d.name}</div>
              <div className="text-xs text-slate-500 mt-1">{d.rows.toLocaleString()} rows</div>
            </div>
            <button onClick={() => download(d.id, d.name)} className="btn-primary text-sm">
              <Download size={16} /> PDF
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
