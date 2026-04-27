import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";

const COLORS = ["#3b82f6", "#a78bfa", "#22d3ee", "#34d399", "#fbbf24", "#f87171"];
const axisStyle = { fill: "#94a3b8", fontSize: 12 };
const tooltipStyle = {
  contentStyle: { background: "#0b1124", border: "1px solid #1c2547", borderRadius: 8, color: "#e2e8f0" },
  cursor: { fill: "rgba(59,130,246,0.06)" },
};

export default function ChartCard({ chart }) {
  if (!chart) return null;
  return (
    <div className="card p-5">
      <h3 className="font-semibold mb-4">{chart.title}</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          {chart.type === "line" ? (
            <LineChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c2547" />
              <XAxis dataKey={chart.xKey} tick={axisStyle} />
              <YAxis tick={axisStyle} />
              <Tooltip {...tooltipStyle} />
              <Line type="monotone" dataKey={chart.yKey} stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          ) : chart.type === "bar" ? (
            <BarChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c2547" />
              <XAxis dataKey={chart.xKey} tick={axisStyle} />
              <YAxis tick={axisStyle} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey={chart.yKey} fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          ) : (
            <PieChart>
              <Pie data={chart.data} dataKey="value" nameKey="name" outerRadius={100} label>
                {chart.data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
