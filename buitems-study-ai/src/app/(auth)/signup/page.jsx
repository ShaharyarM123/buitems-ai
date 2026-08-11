//5th edit

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { X, Sparkles, ShieldCheck } from 'lucide-react';
import LoadingScreen from '@/components/LoadingScreen';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

    try {
      const res = await fetch(`${backendUrl}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Signup failed');

      if (data.token) {
        localStorage.setItem('token', data.token);
        document.cookie = `token=${data.token}; path=/; max-age=604800; SameSite=Lax`;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans bg-white text-zinc-900 flex items-center justify-center relative overflow-hidden p-4 sm:p-6 lg:p-8 selection:bg-emerald-500 selection:text-white">
      
      {/* 🚀 FULLSCREEN LOADING OVERLAY */}
      {loading && <LoadingScreen message="Setting up your account & workspace..." />}

      <style jsx global>{`
        @keyframes fadeInSlide {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeInSlide 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-emerald-100/60 blur-[180px] rounded-full pointer-events-none" />

      {/* Main Container Card (Split Screen Style) */}
      <div className="relative w-full max-w-5xl bg-zinc-50 border border-zinc-200 rounded-3xl shadow-2xl backdrop-blur-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 animate-fade-in">
        
        {/* Close (X) Button */}
        <Link 
          href="/"
          className="absolute top-6 right-6 z-20 p-2 rounded-full bg-white hover:bg-zinc-100 text-zinc-600 hover:text-black transition-colors border border-zinc-200 shadow-sm"
        >
          <X className="w-5 h-5" />
        </Link>

        {/* LEFT BRANDING PANEL */}
        <div className="lg:col-span-6 p-8 sm:p-12 hidden lg:flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-emerald-50/60 via-white to-zinc-50 border-r border-zinc-200">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.08),transparent_60%)] pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-zinc-900">BUITEMS AI</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 mb-4 leading-snug">
              Create account & <br />
              <span className="text-emerald-600">join the future!</span>
            </h1>
            <p className="text-sm text-zinc-600 max-w-sm leading-relaxed">
              Build and share intelligent study frameworks, collaborate with peers, and ace your semester exams effortlessly.
            </p>
          </div>

          <div className="relative z-10 pt-8 border-t border-zinc-200 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900">Instant Access</div>
              <div className="text-[11px] text-zinc-500">Free student workspace enabled</div>
            </div>
          </div>
        </div>

        {/* RIGHT FORM PANEL */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center bg-zinc-50">
          <div className="max-w-md w-full mx-auto">
            
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight mb-2">Create Account</h2>
              <p className="text-xs sm:text-sm text-zinc-500">Enter your details to get started.</p>
            </div>

            {error && (
              <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-600 font-semibold rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider text-zinc-700">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mir Shaharyar"
                  className="w-full px-4 py-3.5 rounded-xl bg-white border border-zinc-300 text-zinc-900 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all font-medium placeholder:text-zinc-400 shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider text-zinc-700">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@buitems.edu.pk"
                  className="w-full px-4 py-3.5 rounded-xl bg-white border border-zinc-300 text-zinc-900 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all font-medium placeholder:text-zinc-400 shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider text-zinc-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 rounded-xl bg-white border border-zinc-300 text-zinc-900 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all font-medium placeholder:text-zinc-400 shadow-sm"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-sm transition-all shadow-md active:scale-95 mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Creating account...' : 'Sign Up'}</span>
              </button>
            </form>

            <div className="text-center mt-8 text-xs text-zinc-500">
              Already have an account?{' '}
              <Link href="/login" className="text-emerald-600 hover:underline font-bold">
                Login
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}



