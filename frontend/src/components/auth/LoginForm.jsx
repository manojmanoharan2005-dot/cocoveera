/**
 * File: frontend/src/components/auth/LoginForm.jsx
 * Purpose: Reusable React UI component for the frontend.
 */
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Mail, KeyRound, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import SuccessAnimation from './SuccessAnimation';
import { motion, AnimatePresence } from 'framer-motion';

const formVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

export const LoginForm = () => {
  const { login } = useAuth();
  const { verifyAdminKey } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '';

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [mode, setMode] = useState('login'); // 'login' | 'forgot' | 'reset' | 'verifyAdmin'
  const [successMessage, setSuccessMessage] = useState(null);
  const [forgotEmail, setForgotEmail] = useState('');
  const [adminTempToken, setAdminTempToken] = useState(null);
  const [verificationKey, setVerificationKey] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  // Animation State
  const [showAnimation, setShowAnimation] = useState(false);

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-stone-200', textColor: 'text-stone-500' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-400', textColor: 'text-red-500' };
    if (score <= 4) return { score, label: 'Good', color: 'bg-amber-400', textColor: 'text-amber-600' };
    return { score, label: 'Strong', color: 'bg-[#2E7D32]', textColor: 'text-[#2E7D32]' };
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // Pre-fill email if Remember Me was checked
  useEffect(() => {
    const savedEmail = localStorage.getItem('cocoveera_remember_email');
    if (savedEmail) {
      setValue('email', savedEmail);
      setValue('rememberMe', true);
    }
  }, [setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError(null);
    try {
      const res = await login(data.email, data.password);
      
      if (data.rememberMe) {
        localStorage.setItem('cocoveera_remember_email', data.email);
      } else {
        localStorage.removeItem('cocoveera_remember_email');
      }

      if (res.requiresAdminVerification) {
        setAdminTempToken(res.tempToken);
        setMode('verifyAdmin');
        return;
      }

      if (res.success) {
        setShowAnimation(true);
      }
    } catch (err) {
      if (err.message.includes('not verified') || err.message.toLowerCase().includes('otp')) {
        navigate(`/verify-otp?email=${encodeURIComponent(data.email)}`);
      } else {
        setApiError(err.response?.data?.message || err.message || 'Incorrect email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setApiError(null);
    setSuccessMessage(null);
    setIsOtpVerified(false);
    try {
      const res = await authService.forgotPassword(forgotEmail);
      if (res.success) {
        setResetEmail(forgotEmail);
        setSuccessMessage('Password reset code (OTP) sent to your email.');
        setMode('reset');
      }
    } catch (err) {
      setApiError(err.response?.data?.message || err.message || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpCode = (e) => {
    e.preventDefault();
    if (resetOtp.length !== 6 || isNaN(resetOtp)) {
      setApiError('Please enter all 6 digits of the OTP.');
      return;
    }
    setApiError(null);
    setSuccessMessage('Code verified successfully. Please enter your new password.');
    setIsOtpVerified(true);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setApiError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setApiError(null);
    setSuccessMessage(null);
    try {
      const res = await authService.resetPassword(resetEmail, resetOtp, newPassword);
      if (res.success) {
        setSuccessMessage('Password reset successfully. Please log in with your new password.');
        setMode('login');
        setForgotEmail('');
        setResetOtp('');
        setNewPassword('');
        setConfirmNewPassword('');
        setIsOtpVerified(false);
      }
    } catch (err) {
      setApiError(err.response?.data?.message || err.message || 'Failed to reset password. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAdmin = async (e) => {
    e.preventDefault();
    if (!verificationKey) {
      setApiError('Please enter the verification key.');
      return;
    }
    setLoading(true);
    setApiError(null);
    try {
      const res = await verifyAdminKey(adminTempToken, verificationKey);
      if (res.success) {
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (err) {
      setApiError(err.response?.data?.message || err.message || 'Verification failed.');
      // If session expired or token invalid, reset to login
      if (err.response?.status === 401 && !err.response?.data?.message?.includes('Invalid')) {
        setMode('login');
      }
    } finally {
      setLoading(false);
    }
  };

  if (showAnimation) {
    return (
      <SuccessAnimation 
        type="login" 
        onComplete={() => {
          const fromState = location.state?.from;
          const fromPath = fromState 
            ? `${fromState.pathname}${fromState.search || ''}` 
            : (redirect ? `/${redirect}` : '/dashboard');
          navigate(fromPath, { replace: true });
        }} 
      />
    );
  }

  return (
    <div className="bg-white border border-stone-200/80 rounded-3xl p-8 shadow-soft text-stone-900 max-w-md w-full mx-auto">
      <div className="text-center mb-8">
        <img src="/logo.webp" alt="Cocoveera Logo" className="w-12 h-12 object-contain mx-auto mb-3 rounded-lg shadow-sm border border-stone-100" />
        <span className="text-[#2E5E35] font-poppins text-[10px] font-bold uppercase tracking-widest">
          Secure Portal
        </span>
        <h2 className="text-2xl font-poppins font-extrabold text-stone-900 mt-1">
          Welcome Back
        </h2>
        <p className="text-stone-500 text-xs mt-1.5 font-medium">
          Sign in to access your trade dashboard
        </p>
      </div>

      {apiError && (
        <div className="bg-red-50 text-red-650 text-xs p-3.5 rounded-xl border border-red-100 mb-5 font-semibold text-center animate-fade-in">
          {apiError}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 text-green-700 text-xs p-3.5 rounded-xl border border-green-100 mb-5 font-semibold text-center animate-fade-in">
          {successMessage}
        </div>
      )}

      {mode === 'login' && (
        <motion.form variants={formVariants} initial="hidden" animate="visible" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email or Phone */}
          <div>
            <label className="block text-[10px] font-extrabold text-stone-800 uppercase tracking-wider mb-1">
              EMAIL / MOBILE NUMBER
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                {...register('email', {
                  required: 'Email or Mobile Number is required',
                })}
                className={`w-full bg-[#F3F6F8] border text-stone-900 rounded-xl py-3.5 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-stone-400/80 ${
                  errors.email ? 'border-red-300' : 'border-transparent'
                }`}
                placeholder="you@email.com or +123456..."
              />
            </div>
            {errors.email && (
              <span className="text-[10px] font-bold text-red-500 mt-1 block">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-bold text-stone-900 uppercase tracking-wider mb-1.5">
              PASSWORD
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters long',
                  },
                })}
                className={`w-full bg-[#EEF2F6] border text-stone-900 rounded-xl py-3 pl-10 pr-11 text-xs font-semibold focus:outline-none focus:border-primary/60 focus:bg-white transition-all placeholder:text-stone-450 ${
                  errors.password ? 'border-red-300' : 'border-transparent'
                }`}
                placeholder="••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <span className="text-[10px] font-bold text-red-500 mt-1 block">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                {...register('rememberMe')}
                className="w-4 h-4 rounded bg-[#EEF2F6] border-transparent text-[#2E5E35] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#2E5E35]"
              />
              <span className="text-[11px] font-semibold text-stone-500 hover:text-stone-700">
                Remember email
              </span>
            </label>
            <button
              type="button"
              onClick={() => {
                setMode('forgot');
                setApiError(null);
                setSuccessMessage(null);
              }}
              className="text-[11px] font-bold text-[#2E5E35] hover:text-[#1F4625] transition-colors focus:outline-none"
            >
              Forgot password?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2E5E35] hover:bg-[#1F4625] text-white font-poppins text-xs font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5 mt-6 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Access Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </motion.form>
      )}

      {mode === 'forgot' && (
        <motion.form variants={formVariants} initial="hidden" animate="visible" onSubmit={handleForgotSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-extrabold text-stone-800 uppercase tracking-wider mb-1">
              EMAIL ADDRESS
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full bg-[#F3F6F8] border border-transparent text-stone-900 rounded-xl py-3.5 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2E5E35]/20 transition-all placeholder:text-stone-400"
                placeholder="you@email.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2E5E35] hover:bg-[#1F4625] text-white font-poppins text-xs font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5 mt-6 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Send Reset Code</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setApiError(null);
                setSuccessMessage(null);
              }}
              className="text-xs text-stone-500 hover:text-stone-700 font-semibold focus:outline-none"
            >
              Back to Login
            </button>
          </div>
        </motion.form>
      )}

      {mode === 'reset' && (
        <motion.form variants={formVariants} initial="hidden" animate="visible" onSubmit={isOtpVerified ? handleResetSubmit : handleVerifyOtpCode} className="space-y-4">
          <div>
            <label className="block text-[10px] font-extrabold text-stone-800 uppercase tracking-wider mb-1">
              RESET CODE (OTP)
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                maxLength={6}
                disabled={isOtpVerified}
                value={resetOtp}
                onChange={(e) => setResetOtp(e.target.value)}
                className={`w-full bg-[#F3F6F8] border border-transparent text-stone-900 rounded-xl py-3.5 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2E5E35]/20 transition-all placeholder:text-stone-400 ${
                  isOtpVerified ? 'opacity-65 cursor-not-allowed' : ''
                }`}
                placeholder="Enter 6-digit code"
              />
            </div>
          </div>

          {!isOtpVerified ? (
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2E5E35] hover:bg-[#1F4625] text-white font-poppins text-xs font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5 mt-6 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Verify Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          ) : (
            <>
              <div>
                <label className="block text-[10px] font-bold text-stone-900 uppercase tracking-wider mb-1.5">
                  NEW PASSWORD
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#F3F6F8] border border-transparent text-stone-900 rounded-xl py-3.5 pl-10 pr-11 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2E5E35]/20 transition-all placeholder:text-stone-400"
                    placeholder="•••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-600 focus:outline-none"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {newPassword && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden flex">
                      <div className={`h-full ${getPasswordStrength(newPassword).color} transition-all duration-300`} style={{ width: `${(getPasswordStrength(newPassword).score / 5) * 100}%` }}></div>
                    </div>
                    <span className={`text-[10px] font-extrabold uppercase tracking-wide ${getPasswordStrength(newPassword).textColor}`}>{getPasswordStrength(newPassword).label}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-900 uppercase tracking-wider mb-1.5">
                  CONFIRM NEW PASSWORD
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showConfirmNewPassword ? 'text' : 'password'}
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full bg-[#F3F6F8] border border-transparent text-stone-900 rounded-xl py-3.5 pl-10 pr-11 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2E5E35]/20 transition-all placeholder:text-stone-400"
                    placeholder="•••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-600 focus:outline-none"
                  >
                    {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {newPassword && confirmNewPassword && newPassword === confirmNewPassword && (
                  <span className="text-[10px] font-extrabold text-[#2E7D32] mt-1.5 flex items-center gap-1 uppercase tracking-wide">
                    <ShieldCheck className="w-3.5 h-3.5" /> Passwords match
                  </span>
                )}
                {newPassword && confirmNewPassword && newPassword !== confirmNewPassword && (
                  <span className="text-[10px] font-extrabold text-red-500 mt-1.5 flex items-center gap-1 uppercase tracking-wide animate-fade-in">
                    <AlertCircle className="w-3.5 h-3.5" /> Passwords do not match
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2E5E35] hover:bg-[#1F4625] text-white font-poppins text-xs font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5 mt-6 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Reset Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </>
          )}

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setApiError(null);
                setSuccessMessage(null);
                setIsOtpVerified(false);
              }}
              className="text-xs text-stone-500 hover:text-stone-700 font-semibold focus:outline-none"
            >
              Back to Login
            </button>
          </div>
        </motion.form>
      )}

      {mode === 'verifyAdmin' && (
        <motion.form variants={formVariants} initial="hidden" animate="visible" onSubmit={handleVerifyAdmin} className="space-y-4">
          <div className="text-center mb-6">
            <ShieldCheck className="w-12 h-12 text-[#2E5E35] mx-auto mb-3" />
            <h3 className="text-lg font-poppins font-extrabold text-stone-900">Admin Verification Required</h3>
            <p className="text-xs text-stone-500 mt-1 font-medium">Please enter your 2-Step Verification Key to continue.</p>
          </div>
          <div>
            <label className="block text-[10px] font-extrabold text-stone-800 uppercase tracking-wider mb-1">
              ADMIN VERIFICATION KEY
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={verificationKey}
                onChange={(e) => setVerificationKey(e.target.value)}
                className="w-full bg-[#F3F6F8] border border-transparent text-stone-900 rounded-xl py-3.5 pl-10 pr-11 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2E5E35]/20 transition-all placeholder:text-stone-400"
                placeholder="Enter Key"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2E5E35] hover:bg-[#1F4625] text-white font-poppins text-xs font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5 mt-6 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Verify & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setApiError(null);
                setAdminTempToken(null);
                setVerificationKey('');
              }}
              className="text-xs text-stone-500 hover:text-stone-700 font-semibold focus:outline-none"
            >
              Back to Login
            </button>
          </div>
        </motion.form>
      )}

      {mode === 'login' && (
        <p className="text-center text-xs text-stone-555 mt-6 font-semibold animate-fade-in">
          New to Cocoveera?{' '}
          <span
            onClick={() => navigate('/register', { state: location.state })}
            className="text-[#2E5E35] hover:text-[#1F4625] font-bold cursor-pointer underline decoration-dotted"
          >
            Register here
          </span>
        </p>
      )}
    </div>
  );
};

export default LoginForm;
