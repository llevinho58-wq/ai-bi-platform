import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BarChart3 } from "lucide-react";
import { api, auth } from "../lib/api";

export default function Auth({ mode }) {
  const isSignup = mode === "signup";
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const res = isSignup
        ? await api.signup(form)
        : await api.login(form.email, form.password);
      auth.token = res.access_token;
      nav("/app");
    } catch (e) {
      setErr(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950 px-6">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-500 to-purple-500 flex items-center justify-center">
            <BarChart3 size={20} />
          </div>
          <span className="font-bold text-xl">BizIQ</span>
        </Link>

        <div className="card p-8">
          <h1 className="text-2xl font-bold">{isSignup ? "Create your account" : "Welcome back"}</h1>
          <p className="text-slate-400 text-sm mt-1">
            {isSignup ? "Start analyzing your data in minutes." : "Log in to your dashboard."}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {isSignup && (
              <div>
                <label className="text-sm text-slate-300">Name</label>
                <input className="input mt-1" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
            )}
            <div>
              <label className="text-sm text-slate-300">Email</label>
              <input type="email" className="input mt-1" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-slate-300">Password</label>
              <input type="password" className="input mt-1" required minLength={6} value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>

            {err && <div className="text-sm text-rose-400">{err}</div>}

            <button disabled={loading} className="btn-primary w-full">
              {loading ? "Please wait…" : isSignup ? "Create account" : "Log in"}
            </button>
          </form>

          <div className="mt-6 text-sm text-center text-slate-400">
            {isSignup ? (
              <>Already have an account? <Link to="/login" className="text-accent-400">Log in</Link></>
            ) : (
              <>New here? <Link to="/signup" className="text-accent-400">Create an account</Link></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
