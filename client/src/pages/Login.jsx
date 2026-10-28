import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LogIn, Lock, Mail, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sendPhoneOtp, verifyPhoneOtp } from '../services/phoneAuth';
import { useToast } from '../context/ToastContext';

export const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otpConfirmation, setOtpConfirmation] = useState(null);
  const [otpCode, setOtpCode] = useState('');
  const [remember, setRemember] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { login, loginWithPhoneToken } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const isEmailLogin = identifier.includes('@');
    try {
      if (isEmailLogin) {
        const res = await login(identifier, password);
        if (res.success) navigate(redirect);
      } else if (!otpConfirmation) {
        const confirmation = await sendPhoneOtp(identifier);
        setOtpConfirmation(confirmation);
        addToast('Verification code sent. Check your phone.', 'success');
      } else {
        const phoneIdToken = await verifyPhoneOtp(otpConfirmation, otpCode);
        const res = await loginWithPhoneToken(phoneIdToken);
        if (res.success) navigate(redirect);
      }
    } catch (error) {
      const messages = {
        'auth/invalid-phone-number': 'Enter the phone number with country code, for example +919876543210.',
        'auth/too-many-requests': 'Too many verification attempts. Please wait and try again.',
        'auth/operation-not-allowed': 'Phone sign-in is not enabled in Firebase yet.',
        'auth/invalid-verification-code': 'That code is incorrect. Check the SMS and try again.',
        'auth/code-expired': 'That code expired. Request a new verification code.'
      };
      addToast(messages[error.code] || error.message || 'Phone verification failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };
  const isEmailLogin = identifier.includes('@');
  const handleResendOtp = async () => {
    setSubmitting(true);
    try {
      setOtpConfirmation(await sendPhoneOtp(identifier));
      setOtpCode('');
      addToast('A new verification code was sent.', 'success');
    } catch (error) {
      addToast(error.message || 'Could not resend the verification code.', 'error');
    } finally {
      setSubmitting(false);
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

          <div id="recaptcha-container" />
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-white/90 mb-2 uppercase tracking-widest text-[11px] font-bold">
                {isEmailLogin ? 'Email Address' : 'Phone Number'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setOtpConfirmation(null);
                    setOtpCode('');
                  }}
                  placeholder="Email or phone, e.g. +919876543210"
                  className="w-full bg-white/20 border border-white/20 pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-white/60 text-white placeholder-white/50 text-sm"
                />
                {isEmailLogin
                  ? <Mail className="w-4 h-4 text-white/60 absolute left-4 top-4" />
                  : <Phone className="w-4 h-4 text-white/60 absolute left-4 top-4" />}
              </div>
            </div>

            {isEmailLogin && <div>
              <label className="block text-white/90 mb-2 uppercase tracking-widest text-[11px] font-bold">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required={isEmailLogin}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-white/20 border border-white/20 pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-white/60 text-white placeholder-white/50 text-sm"
                />
                <Lock className="w-4 h-4 text-white/60 absolute left-4 top-4" />
              </div>
            </div>}

            {!isEmailLogin && otpConfirmation && (
              <div>
                <label className="block text-white/90 mb-2 uppercase tracking-widest text-[11px] font-bold">
                  SMS Verification Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  className="w-full bg-white/20 border border-white/20 px-4 py-3.5 rounded-xl focus:outline-none focus:border-white/60 text-white placeholder-white/50 text-sm"
                />
                <button type="button" onClick={handleResendOtp} disabled={submitting} className="mt-2 text-xs text-white underline disabled:opacity-50">
                  Resend verification code
                </button>
              </div>
            )}

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
              <span>
                {submitting
                  ? (isEmailLogin ? 'Authenticating...' : (otpConfirmation ? 'Verifying code...' : 'Sending code...'))
                  : (isEmailLogin ? 'Sign In' : (otpConfirmation ? 'Verify Code & Sign In' : 'Send Login Code'))}
              </span>
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
