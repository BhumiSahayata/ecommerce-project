import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import Logo from "../components/Logo";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "USER" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) { toast.error("Please fill all fields"); return; }
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      await API.post("/auth/register", form);
      const loginRes = await API.post("/auth/login", { email: form.email, password: form.password });
      const d = loginRes.data;
      if (d.token) {
        login({ id: d.id, name: d.name, email: d.email, role: d.role }, d.token);
        toast.success(`Welcome, ${d.name}! 🎉`);
        navigate(d.role === "MERCHANT" ? "/merchant" : "/products");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-16"
      style={{ background: 'var(--bg-base)' }}
    >
      <div className="w-full max-w-md animate-fade-up">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <Logo size="lg" />
          </div>
          <h1 className="font-display text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Create account</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Join ShopEase — it's free</p>
        </div>

        <div
          className="rounded-2xl p-8"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div className="space-y-4">
            {/* Role selector */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>I want to...</label>
              <div className="grid grid-cols-2 gap-3">
                {[{ role: "USER", emoji: "🛍️", label: "Shop" }, { role: "MERCHANT", emoji: "🏪", label: "Sell" }].map(r => (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => setForm({ ...form, role: r.role })}
                    className="py-3 px-4 rounded-xl text-sm font-semibold transition-all border-2"
                    style={{
                      borderColor: form.role === r.role ? 'var(--brand)' : 'var(--border-default)',
                      background: form.role === r.role ? 'var(--brand-subtle)' : 'var(--bg-raised)',
                      color: form.role === r.role ? 'var(--brand)' : 'var(--text-secondary)',
                    }}
                  >
                    {r.emoji} {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
              <input name="name" type="text" placeholder="Your full name" value={form.name} onChange={handleChange} className="input-base" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email</label>
              <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} className="input-base" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPass ? "text" : "password"}
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  onKeyDown={e => e.key === "Enter" && handleRegister()}
                  className="input-base pr-12"
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {showPass
                      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                    }
                  </svg>
                </button>
              </div>
            </div>

            <button
              onClick={handleRegister}
              disabled={loading}
              className="btn-brand w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} />Creating account...</>
              ) : "Create Account"}
            </button>
          </div>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{" "}
            <Link to="/login" className="font-semibold" style={{ color: 'var(--brand)' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}