import { useEffect, useState } from "react";
import { DollarSign, Users, TrendingDown, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import MetricCard from "../components/MetricCard";
import ChartCard from "../components/ChartCard";
import { api } from "../lib/api";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    api.summary().then(setData).catch((e) => setErr(e.message));
  }, []);

  if (err) return <div className="text-rose-400">{err}</div>;
  if (!data) return <div className="text-slate-400">Loading…</div>;

  if (!data.dataset) {
    return (
      <div className="card p-12 text-center">
        <h2 className="text-xl font-semibold">No data yet</h2>
        <p className="text-slate-400 mt-2">Upload a CSV to see your dashboard come alive.</p>
        <Link to="/app/upload" className="btn-primary mt-6 inline-flex">Upload CSV</Link>
      </div>
    );
  }

  const m = data.metrics || {};
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Overview</h1>
          <p className="text-sm text-slate-400 mt-1">
            Showing <span className="text-slate-200">{data.dataset.name}</span> · {data.dataset.rows.toLocaleString()} rows
          </p>
        </div>
        <Link to="/app/upload" className="btn-ghost text-sm">Upload another</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Revenue" value={m.revenue} format="currency" icon={DollarSign} delta={12.4} />
        <MetricCard label="Users" value={m.users} icon={Users} delta={8.1} />
        <MetricCard label="Churn" value={m.churn} format="percent" icon={TrendingDown} delta={-2.3} />
        <MetricCard label="AOV" value={m.aov} format="currency" icon={ShoppingCart} delta={4.7} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {(data.charts || []).map((c, i) => <ChartCard key={i} chart={c} />)}
      </div>
    </div>
  );
}
