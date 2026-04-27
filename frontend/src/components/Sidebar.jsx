import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Upload, Sparkles, MessageSquare, FileText, Settings, LogOut, BarChart3,
} from "lucide-react";
import { auth } from "../lib/api";

const links = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/upload", label: "Upload Data", icon: Upload },
  { to: "/app/insights", label: "AI Insights", icon: Sparkles },
  { to: "/app/ask", label: "Ask Your Data", icon: MessageSquare },
  { to: "/app/reports", label: "Reports", icon: FileText },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ user }) {
  const nav = useNavigate();
  return (
    <aside className="w-64 shrink-0 bg-navy-900 border-r border-navy-800 flex flex-col">
      <div className="px-6 py-6 flex items-center gap-2 border-b border-navy-800">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-500 to-purple-500 flex items-center justify-center">
          <BarChart3 size={20} />
        </div>
        <div>
          <div className="font-bold text-lg leading-none">BizIQ</div>
          <div className="text-xs text-slate-400 mt-0.5">AI Intelligence</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                isActive
                  ? "bg-accent-600/15 text-accent-400 border border-accent-600/30"
                  : "text-slate-400 hover:text-slate-100 hover:bg-navy-800"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-navy-800">
        <div className="px-3 py-2 mb-2">
          <div className="text-sm font-medium truncate">{user?.name || "—"}</div>
          <div className="text-xs text-slate-500 truncate">{user?.email}</div>
        </div>
        <button
          onClick={() => { auth.logout(); nav("/login"); }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-slate-100 hover:bg-navy-800 rounded-lg"
        >
          <LogOut size={16} /> Log out
        </button>
      </div>
    </aside>
  );
}
