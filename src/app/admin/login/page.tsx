'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Camera, Lock, Mail, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

// Inner component that uses useSearchParams — must be wrapped in <Suspense>
function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('from') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, redirect to admin
  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((res) => {
        if (res.ok) router.replace('/admin');
      })
      .catch(() => {});
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const body = await res.json();

      if (!res.ok || !body.success) {
        setError(body.message || 'Invalid email or password.');
        return;
      }

      // Successful login — navigate to intended destination
      router.replace(redirectTo);
    } catch {
      setError('Unable to connect. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      {/* Brand Header */}
      <div className="text-center mb-8 space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-400 text-zinc-950 shadow-lg shadow-amber-400/20 mx-auto">
          <Camera className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-serif font-bold text-white">Archive Admin</h1>
          <p className="text-xs font-mono text-amber-400 mt-1 uppercase tracking-widest">
            Family Photo Gallery
          </p>
        </div>
      </div>

      {/* Login Card */}
      <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-serif font-bold text-white">Administrator Sign In</h2>
          <p className="text-xs font-sans text-zinc-400">
            Access the photo archive management dashboard
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-sans"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="admin-email"
              className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder="admin@example.com"
                autoComplete="email"
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-950 border border-white/10 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-400/60 transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="admin-password"
              className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isLoading}
                className="w-full pl-10 pr-12 py-3 rounded-xl bg-zinc-950 border border-white/10 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-400/60 transition-colors disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            id="admin-login-submit"
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-sm font-mono transition-all shadow-lg shadow-amber-400/10 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              'Sign In to Dashboard'
            )}
          </button>
        </form>

        <p className="text-center text-[11px] font-sans text-zinc-600">
          Protected admin area. Unauthorized access is prohibited.
        </p>
      </div>

      <p className="text-center text-xs font-mono text-zinc-600 mt-6">
        Family Photo Gallery — Archive Management System
      </p>
    </motion.div>
  );
}

// Outer page component — wraps form in Suspense required by useSearchParams
export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading...
          </div>
        }
      >
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
