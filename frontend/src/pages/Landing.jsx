import { Link } from "react-router-dom";
import { BarChart3, Sparkles, ShieldCheck, Zap, Check, ArrowRight } from "lucide-react";

const PLANS = [
  { name: "Starter", price: "$0", period: "forever",
    features: ["1 dataset", "Basic charts", "100 AI queries / mo", "Community support"], cta: "Start free" },
  { name: "Pro", price: "$49", period: "per month", featured: true,
    features: ["Unlimited datasets", "All chart types", "10,000 AI queries / mo", "PDF reports", "Priority support"], cta: "Start 14-day trial" },
  { name: "Enterprise", price: "Custom", period: "annual",
    features: ["SSO + audit logs", "Dedicated infra", "Unlimited AI queries", "SLA + onboarding", "24/7 support"], cta: "Talk to sales" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-navy-950">
      {/* Nav */}
      <header className="border-b border-navy-800/60 backdrop-blur sticky top-0 z-10 bg-navy-950/80">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-purple-500 flex items-center justify-center">
              <BarChart3 size={18} />
            </div>
            <span className="font-bold text-lg">BizIQ</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-ghost text-sm">Log in</Link>
            <Link to="/signup" className="btn-primary text-sm">Get started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-navy-700 bg-navy-900 text-xs text-slate-300 mb-8">
          <Sparkles size={14} className="text-accent-400" />
          Powered by Claude Sonnet 4
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
          The <span className="gradient-text">AI BI Platform</span><br />for modern teams
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-400">
          Drop a CSV. Get charts, metrics, and an executive summary in seconds. Then ask
          your data anything in plain English.
        </p>
        <div className="mt-10 flex items-center justify-center gap-3">
          <Link to="/signup" className="btn-primary">Start free <ArrowRight size={16} /></Link>
          <a href="#pricing" className="btn-ghost">View pricing</a>
        </div>

        {/* feature strip */}
        <div className="mt-20 grid md:grid-cols-3 gap-4 text-left">
          {[
            { icon: Zap, title: "Instant insights", desc: "Auto-detected metrics, charts, and trends the moment you upload." },
            { icon: Sparkles, title: "Natural language Q&A", desc: "Ask questions in plain English. Claude answers grounded in your data." },
            { icon: ShieldCheck, title: "Built for trust", desc: "JWT auth, scoped datasets, and audit-ready PDF reports." },
          ].map(({ icon: I, title, desc }) => (
            <div key={title} className="card p-6">
              <I className="text-accent-400" size={22} />
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="text-slate-400 text-sm mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center">Simple, transparent pricing</h2>
        <p className="text-slate-400 text-center mt-3">Pick a plan that grows with your data.</p>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {PLANS.map((p) => (
            <div key={p.name}
              className={`card p-7 relative ${p.featured ? "border-accent-500/60 shadow-glow" : ""}`}>
              {p.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-accent-600 text-xs font-semibold">
                  Most popular
                </div>
              )}
              <div className="font-semibold">{p.name}</div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{p.price}</span>
                <span className="text-slate-400 text-sm">/ {p.period}</span>
              </div>
              <ul className="mt-6 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check size={16} className="text-accent-400 mt-0.5 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/signup"
                className={`mt-7 w-full ${p.featured ? "btn-primary" : "btn-ghost"}`}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-navy-800 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} BizIQ. Built with Claude.
      </footer>
    </div>
  );
}
