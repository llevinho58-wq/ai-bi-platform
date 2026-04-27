import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate, Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Insights from "./pages/Insights";
import Ask from "./pages/Ask";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import { api, auth } from "./lib/api";

function AppShell() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    if (!auth.isAuthed) { nav("/login"); return; }
    api.me().then(setUser).catch(() => { auth.logout(); nav("/login"); }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading…</div>;

  return (
    <div className="min-h-screen flex bg-navy-950">
      <Sidebar user={user} />
      <main className="flex-1 px-8 py-8 overflow-auto">
        <Outlet context={{ user, setUser }} />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Auth mode="login" />} />
      <Route path="/signup" element={<Auth mode="signup" />} />
      <Route path="/app" element={<AppShell />}>
        <Route index element={<Dashboard />} />
        <Route path="upload" element={<Upload />} />
        <Route path="insights" element={<Insights />} />
        <Route path="ask" element={<Ask />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
