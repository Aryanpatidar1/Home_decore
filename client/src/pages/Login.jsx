import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LogIn, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);
    if (res.success) {
      navigate(redirect);
    }
  };

  return (
    <div
      className="min-h-[85vh] flex items-center justify-center relative py-20 bg-stone-900 bg-cover bg-center"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=80')"
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

      <div className="relative w-full max-w-md mx-auto px-6 z-10">
        <div className="bg-white/10 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl border border-white/20">
          
          <div className="text-center mb-8">
            <h2 className="font-headline-lg text-white text-3xl font-bold mb-2">Welcome Back</h2>
            <p className="text-white/80 text-sm">Sign in to continue your spatial curation journey.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-white/90 mb-2 uppercase tracking-widest text-[11px] font-bold">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-white/20 border border-white/20 pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-white/60 text-white placeholder-white/50 text-sm"
                />
                <Mail className="w-4 h-4 text-white/60 absolute left-4 top-4" />
              </div>
            </div>

            <div>
              <label className="block text-white/90 mb-2 uppercase tracking-widest text-[11px] font-bold">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-white/20 border border-white/20 pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-white/60 text-white placeholder-white/50 text-sm"
                />
                <Lock className="w-4 h-4 text-white/60 absolute left-4 top-4" />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-white/90">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-white/20 bg-white/10 text-emerald-800"
                />
                <span>Remember me</span>
              </label>
              <span className="text-stone-300">Demo: user@example.com / password123</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-900 text-white py-4 rounded-xl font-bold hover:bg-emerald-800 shadow-xl transition-all flex justify-center items-center gap-2 text-sm disabled:opacity-50 mt-2"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
              <LogIn className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center mt-8 text-white/80 text-xs">
            Don't have an account?{' '}
            <Link to="/register" className="text-white font-bold underline hover:text-emerald-300">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
