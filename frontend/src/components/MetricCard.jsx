import { TrendingUp, TrendingDown } from "lucide-react";

export default function MetricCard({ label, value, delta, icon: Icon, format = "number" }) {
  const display = format === "currency"
    ? value == null ? "—" : `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
    : format === "percent"
    ? value == null ? "—" : `${(Number(value) * 100).toFixed(1)}%`
    : value == null ? "—" : Number(value).toLocaleString();

  const positive = (delta || 0) >= 0;
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-slate-400">{label}</span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-accent-600/15 text-accent-400 flex items-center justify-center">
            <Icon size={16} />
          </div>
        )}
      </div>
      <div className="mt-3 text-3xl font-semibold">{display}</div>
      {delta != null && (
        <div className={`mt-2 flex items-center gap-1 text-xs ${positive ? "text-emerald-400" : "text-rose-400"}`}>
          {positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {Math.abs(delta).toFixed(1)}% vs last period
        </div>
      )}
    </div>
  );
}
