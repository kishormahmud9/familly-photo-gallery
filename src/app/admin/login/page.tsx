'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Camera,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  X,
  KeyRound,
  CheckCircle2,
  ArrowLeft,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('from') || '/admin';

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1); // 1: Email, 2: OTP, 3: New Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown for resending OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (forgotStep === 2 && resendTimer > 0) {
      setCanResend(false);
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [forgotStep, resendTimer]);

  // If already authenticated, redirect to admin
  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((res) => {
        if (res.ok) window.location.href = '/admin';
      })
      .catch(() => {});
  }, []);

  // Handle Login Submit
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

      // Hard redirect so HTTP-only auth cookie triggers fresh server page load
      window.location.href = redirectTo;
    } catch {
      setError('Unable to connect. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  // Open Forgot Modal
  const handleOpenForgotModal = () => {
    setForgotEmail(email.trim());
    setForgotStep(1);
    setOtpDigits(['', '', '', '', '', '']);
    setNewPassword('');
    setConfirmPassword('');
    setForgotError(null);
    setIsForgotModalOpen(true);
  };

  // Close Forgot Modal
  const handleCloseForgotModal = () => {
    setIsForgotModalOpen(false);
    setForgotError(null);
  };

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!forgotEmail.trim()) {
      setForgotError('Please enter your email address.');
      return;
    }

    setForgotLoading(true);
    setForgotError(null);

    try {
      const res = await fetch('/api/auth/forgot-password/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim().toLowerCase() }),
      });

      const body = await res.json();

      if (!res.ok || !body.success) {
        setForgotError(body.message || 'Failed to send OTP code.');
        return;
      }

      setForgotStep(2);
      setResendTimer(60);
      setCanResend(false);
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } catch {
      setForgotError('Unable to connect to server. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Handle OTP digit inputs
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    setForgotError(null);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split('');
      setOtpDigits(digits);
      setForgotError(null);
      otpInputRefs.current[5]?.focus();
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpCode = otpDigits.join('');
    if (otpCode.length !== 6) {
      setForgotError('Please enter all 6 digits of the OTP.');
      return;
    }

    setForgotLoading(true);
    setForgotError(null);

    try {
      const res = await fetch('/api/auth/forgot-password/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim().toLowerCase(), otp: otpCode }),
      });

      const body = await res.json();

      if (!res.ok || !body.success) {
        setForgotError(body.message || 'Invalid or expired OTP.');
        return;
      }

      setForgotStep(3);
    } catch {
      setForgotError('Unable to verify OTP. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 8) {
      setForgotError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }

    setForgotLoading(true);
    setForgotError(null);

    try {
      const res = await fetch('/api/auth/forgot-password/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail.trim().toLowerCase(),
          otp: otpDigits.join(''),
          newPassword,
          confirmPassword,
        }),
      });

      const body = await res.json();

      if (!res.ok || !body.success) {
        setForgotError(body.message || 'Failed to reset password.');
        return;
      }

      setIsForgotModalOpen(false);
      setEmail(forgotEmail.trim());
      setPassword('');
      setSuccessMessage('Password reset successfully! You can now sign in with your new password.');
    } catch {
      setForgotError('Unable to reset password. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md relative"
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

        {/* Success Alert */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-sans"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </motion.div>
        )}

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
                  setSuccessMessage(null);
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
            <div className="flex items-center justify-between">
              <label
                htmlFor="admin-password"
                className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400"
              >
                Password
              </label>
              <button
                type="button"
                onClick={handleOpenForgotModal}
                className="text-[11px] font-sans text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                  setSuccessMessage(null);
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

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {isForgotModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={handleCloseForgotModal}
                className="absolute right-5 top-5 text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Step 1: Request OTP */}
              {forgotStep === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-serif font-bold text-white">Reset Password</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Enter your admin email address below. We will send a 6-digit OTP verification code to your inbox.
                    </p>
                  </div>

                  {forgotError && (
                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-sans">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{forgotError}</span>
                    </div>
                  )}

                  <form onSubmit={handleRequestOtp} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                        Admin Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => {
                            setForgotEmail(e.target.value);
                            setForgotError(null);
                          }}
                          placeholder="admin@example.com"
                          required
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-950 border border-white/10 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-400/60 transition-colors"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-sm font-mono transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {forgotLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending OTP...
                        </>
                      ) : (
                        'Send 6-Digit OTP'
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* Step 2: Enter OTP */}
              {forgotStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      className="inline-flex items-center gap-1.5 text-xs font-sans text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer mb-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back to Email
                    </button>
                    <h3 className="text-lg font-serif font-bold text-white">Enter OTP Verification Code</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      We have sent a 6-digit OTP code to <strong className="text-amber-400">{forgotEmail}</strong>.
                    </p>
                  </div>

                  {forgotError && (
                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-sans">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{forgotError}</span>
                    </div>
                  )}

                  <form onSubmit={handleVerifyOtp} className="space-y-5">
                    {/* 6 Input boxes */}
                    <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => {
                            otpInputRefs.current[idx] = el;
                          }}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="w-11 h-13 text-center text-xl font-mono font-bold bg-zinc-950 border border-white/10 rounded-xl text-amber-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                      <span>
                        {resendTimer > 0 ? (
                          <>Resend in <span className="text-amber-400">{resendTimer}s</span></>
                        ) : (
                          'OTP Expired'
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => canResend && handleRequestOtp(e)}
                        disabled={!canResend || forgotLoading}
                        className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 disabled:opacity-40 disabled:hover:text-amber-400 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Resend OTP
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={forgotLoading || otpDigits.join('').length !== 6}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-sm font-mono transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {forgotLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Verifying OTP...
                        </>
                      ) : (
                        'Verify OTP'
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* Step 3: Set New Password */}
              {forgotStep === 3 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 flex items-center justify-center">
                      <Lock className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-serif font-bold text-white">Create New Password</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      OTP verified! Enter a new secure password for your admin account.
                    </p>
                  </div>

                  {forgotError && (
                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-sans">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{forgotError}</span>
                    </div>
                  )}

                  <form onSubmit={handleResetPassword} className="space-y-4">
                    {/* New Password */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            setForgotError(null);
                          }}
                          placeholder="At least 8 characters"
                          required
                          className="w-full pl-10 pr-12 py-3 rounded-xl bg-zinc-950 border border-white/10 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-400/60 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword((v) => !v)}
                          tabIndex={-1}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setForgotError(null);
                          }}
                          placeholder="Repeat new password"
                          required
                          className="w-full pl-10 pr-12 py-3 rounded-xl bg-zinc-950 border border-white/10 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-400/60 transition-colors"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-sm font-mono transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {forgotLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Updating Password...
                        </>
                      ) : (
                        'Save New Password'
                      )}
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

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
