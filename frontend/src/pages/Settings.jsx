import { useEffect, useState } from "react";
import { api } from "../lib/api";

const PLANS = ["free", "pro", "enterprise"];

export default function Settings() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [plan, setPlan] = useState("free");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.me().then((u) => { setUser(u); setName(u.name); setPlan(u.plan); });
  }, []);

  const save = async (e) => {
    e.preventDefault();
    const u = await api.updateMe({ name, plan });
    setUser(u); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  if (!user) return <div className="text-slate-400">Loading…</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>

      <form onSubmit={save} className="card p-6 space-y-4">
        <div>
          <label className="text-sm text-slate-300">Name</label>
          <input className="input mt-1" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-slate-300">Email</label>
          <input className="input mt-1 opacity-60" value={user.email} disabled />
        </div>
        <div>
          <label className="text-sm text-slate-300">Plan</label>
          <select className="input mt-1" value={plan} onChange={(e) => setPlan(e.target.value)}>
            {PLANS.map((p) => <option key={p} value={p}>{p[0].toUpperCase() + p.slice(1)}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button className="btn-primary">Save changes</button>
          {saved && <span className="text-sm text-emerald-400">Saved.</span>}
        </div>
      </form>

      <div className="card p-6">
        <div className="font-semibold">API</div>
        <p className="text-sm text-slate-400 mt-1">
          BizIQ uses Claude Sonnet 4 for AI features. Configure <code className="text-accent-400">ANTHROPIC_API_KEY</code> on
          the backend to enable insights and Q&A.
        </p>
      </div>
    </div>
  );
}
