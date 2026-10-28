import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, User, Mail, Phone, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { sendPhoneOtp, verifyPhoneOtp } from '../services/phoneAuth';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [otpConfirmation, setOtpConfirmation] = useState(null);
  const [otpCode, setOtpCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      addToast('Passwords do not match. Please re-enter.', 'error');
      return;
    }
    if (password.length < 6) {
      addToast('Password must be at least 6 characters long.', 'error');
      return;
    }
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      addToast('Enter a valid phone number with 7 to 15 digits.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (!otpConfirmation) {
        const confirmation = await sendPhoneOtp(phone);
        setOtpConfirmation(confirmation);
        addToast('Verification code sent. Check your phone.', 'success');
        return;
      }

      const phoneIdToken = await verifyPhoneOtp(otpConfirmation, otpCode);
      const res = await register(name, email, phone, password, phoneIdToken);
      if (res.success) navigate('/');
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

  const handleResendOtp = async () => {
    setSubmitting(true);
    try {
      setOtpConfirmation(await sendPhoneOtp(phone));
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
      className="min-h-[85vh] flex items-center justify-center relative py-16 bg-stone-900 bg-cover bg-center"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=80')"
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

      <div className="relative w-full max-w-md mx-auto px-6 z-10">
        <div className="bg-white/10 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl border border-white/20">
          
          <div className="text-center mb-8">
            <h2 className="font-headline-lg text-white text-3xl font-bold mb-2">Create Account</h2>
            <p className="text-white/80 text-sm">Join us to start personalizing your bespoke space.</p>
          </div>

          <div id="recaptcha-container" />
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/90 mb-1.5 uppercase tracking-widest text-[11px] font-bold">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Arjun Sharma"
                  className="w-full bg-white/20 border border-white/20 pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-white/60 text-white placeholder-white/50 text-sm"
                />
                <User className="w-4 h-4 text-white/60 absolute left-4 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-white/90 mb-1.5 uppercase tracking-widest text-[11px] font-bold">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="arjun@example.com"
                  className="w-full bg-white/20 border border-white/20 pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-white/60 text-white placeholder-white/50 text-sm"
                />
                <Mail className="w-4 h-4 text-white/60 absolute left-4 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-white/90 mb-1.5 uppercase tracking-widest text-[11px] font-bold">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setOtpConfirmation(null);
                    setOtpCode('');
                  }}
                  placeholder="+919876543210"
                  className="w-full bg-white/20 border border-white/20 pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-white/60 text-white placeholder-white/50 text-sm"
                />
                <Phone className="w-4 h-4 text-white/60 absolute left-4 top-3.5" />
              </div>
            </div>

            {otpConfirmation && (
              <div>
                <label className="block text-white/90 mb-1.5 uppercase tracking-widest text-[11px] font-bold">
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
                  className="w-full bg-white/20 border border-white/20 px-4 py-3 rounded-xl focus:outline-none focus:border-white/60 text-white placeholder-white/50 text-sm"
                />
                <button type="button" onClick={handleResendOtp} disabled={submitting} className="mt-2 text-xs text-white underline disabled:opacity-50">
                  Resend verification code
                </button>
              </div>
            )}

            <div>
              <label className="block text-white/90 mb-1.5 uppercase tracking-widest text-[11px] font-bold">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full bg-white/20 border border-white/20 pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-white/60 text-white placeholder-white/50 text-sm"
                />
                <Lock className="w-4 h-4 text-white/60 absolute left-4 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-white/90 mb-1.5 uppercase tracking-widest text-[11px] font-bold">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="Re-type your password"
                  className="w-full bg-white/20 border border-white/20 pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-white/60 text-white placeholder-white/50 text-sm"
                />
                <Lock className="w-4 h-4 text-white/60 absolute left-4 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-950 text-white py-4 rounded-xl font-bold hover:bg-emerald-900 shadow-xl transition-all flex justify-center items-center gap-2 text-sm disabled:opacity-50 mt-4"
            >
              <span>
                {submitting
                  ? (otpConfirmation ? 'Verifying code...' : 'Sending code...')
                  : (otpConfirmation ? 'Verify Code & Create Account' : 'Send Code to Verify Phone')}
              </span>
              <UserPlus className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center mt-8 text-white/80 text-xs">
            Already have an account?{' '}
            <Link to="/login" className="text-white font-bold underline hover:text-emerald-300">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
