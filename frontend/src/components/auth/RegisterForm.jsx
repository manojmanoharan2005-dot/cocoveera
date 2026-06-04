/**
 * File: frontend/src/components/auth/RegisterForm.jsx
 * Purpose: Reusable React UI component for the frontend.
 */
import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, KeyRound, ArrowRight, ShieldCheck, RefreshCw, Globe, Link as LinkIcon, Eye, EyeOff, Briefcase } from 'lucide-react';
import { authService } from '../../services/authService';

const COUNTRY_CURRENCY_MAP = {
  'USA': 'USD',
  'India': 'INR',
  'Germany': 'EUR',
  'UK': 'GBP',
  'Australia': 'AUD',
  'Canada': 'CAD',
  'Japan': 'JPY',
  'Netherlands': 'EUR',
  'UAE': 'AED',
  'Singapore': 'SGD',
  'New Zealand': 'NZD'
};

const COUNTRIES = Object.keys(COUNTRY_CURRENCY_MAP);

export const RegisterForm = () => {
  const { register: authRegister, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  
  // Inline OTP states
  const [otpSent, setOtpSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      country: '',
      currency: '',
    },
  });

  const selectedCountry = watch('country');
  const passwordVal = watch('password');
  const confirmPasswordVal = watch('confirmPassword');
  const emailVal = watch('email');
  const nameVal = watch('name');

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
  const strength = getPasswordStrength(passwordVal);

  // Auto fill currency
  useEffect(() => {
    if (selectedCountry) {
      setValue('currency', COUNTRY_CURRENCY_MAP[selectedCountry] || '');
    }
  }, [selectedCountry, setValue]);

  // Load cache
  useEffect(() => {
    try {
      const cached = localStorage.getItem('cocoveera_register_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.name) setValue('name', parsed.name);
        if (parsed.email) setValue('email', parsed.email);
        if (parsed.country) {
          setValue('country', parsed.country);
          setValue('currency', COUNTRY_CURRENCY_MAP[parsed.country] || '');
        }
      }
    } catch (e) {
      console.error('Failed to parse cached register data:', e);
    }
  }, [setValue]);

  // Timer for resend
  useEffect(() => {
    let interval = null;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpSent, timer]);

  const handleRegisterSubmit = async (data) => {
    setLoading(true);
    setApiError(null);
    setSuccessMsg(null);

    // Save cache
    localStorage.setItem(
      'cocoveera_register_cache',
      JSON.stringify({
        name: data.name,
        email: data.email,
        country: data.country,
      })
    );

    try {
      const res = await authRegister(
        data.name,
        data.email,
        'N/A', // phone optional
        data.password,
        data.country,
        data.currency,
        'N/A' // Send N/A for companyName automatically
      );
      if (res.success) {
        setRegisteredEmail(data.email);
        setSuccessMsg('Registration request processed. Please enter the 6-digit OTP code sent to your email.');
        setOtpSent(true);
        setTimer(60);
        setCanResend(false);
      }
    } catch (err) {
      setApiError(err.message || 'Registration failed. Email might already exist.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;

    const newValues = [...otpValues];
    newValues[index] = value.substring(value.length - 1);
    setOtpValues(newValues);

    if (value && index < 5) {
      otpRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      const newValues = [...otpValues];
      if (!newValues[index] && index > 0) {
        otpRefs[index - 1].current.focus();
        newValues[index - 1] = '';
      } else {
        newValues[index] = '';
      }
      setOtpValues(newValues);
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('Text').trim();
    if (pastedData.length === 6 && !isNaN(pastedData)) {
      setOtpValues(pastedData.split(''));
      otpRefs[5].current.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const fullOtp = otpValues.join('');
    if (fullOtp.length !== 6) {
      setApiError('Please enter all 6 digits of the OTP.');
      return;
    }

    setLoading(true);
    setApiError(null);
    setSuccessMsg(null);

    try {
      const res = await verifyOtp(registeredEmail, fullOtp);
      if (res.success) {
        localStorage.removeItem('cocoveera_register_cache');
        setSuccessMsg('Verification successful. Welcome to Cocoveera!');
        const fromPath = location.state?.from || (res.user.role === 'admin' ? '/admin' : '/account/address');
        setTimeout(() => {
          navigate(fromPath, { replace: true });
        }, 1500);
      }
    } catch (err) {
      setApiError(err.message || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setLoading(true);
    setApiError(null);
    setSuccessMsg(null);
    
    setTimer(60);
    setCanResend(false);
    setOtpValues(['', '', '', '', '', '']);

    try {
      await authService.resendOTP(registeredEmail);
      setSuccessMsg('A new 6-digit OTP code has been sent successfully.');
    } catch (err) {
      setApiError(err.message || 'Failed to resend OTP.');
      setCanResend(true);
      setTimer(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-stone-200/85 rounded-3xl p-6 shadow-soft text-stone-900 max-w-md w-full mx-auto">
      <div className="text-center mb-6">
        <img src="/logo.webp" alt="Cocoveera Logo" className="w-12 h-12 object-contain mx-auto mb-3 rounded-lg shadow-sm border border-stone-100" />
        <h2 className="text-2xl font-extrabold font-poppins text-stone-900">Register</h2>
        <p className="text-xs text-stone-500 font-semibold mt-1">Create your account</p>
      </div>

      {apiError && (
        <div className="bg-red-50 text-red-650 text-xs p-3.5 rounded-xl border border-red-100 mb-5 font-semibold text-center animate-fade-in">
          {apiError}
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 text-green-700 text-xs p-3.5 rounded-xl border border-green-100 mb-5 font-semibold text-center animate-fade-in">
          {successMsg}
        </div>
      )}

      <form onSubmit={otpSent ? handleVerifyOtp : handleSubmit(handleRegisterSubmit)} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-[10px] font-bold text-stone-705 uppercase tracking-wider mb-1">
            FULL NAME
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              disabled={otpSent}
              {...register('name', { required: 'Full name is required' })}
              className={`w-full bg-[#EEF2F6] border text-stone-900 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-primary/60 focus:bg-white transition-all placeholder:text-stone-400 ${
                errors.name ? 'border-red-300' : 'border-transparent'
              } ${otpSent ? 'opacity-65 cursor-not-allowed' : ''}`}
              placeholder="e.g. John Grower"
            />
          </div>
          {errors.name && (
            <span className="text-[10px] font-bold text-red-500 mt-1 block">
              {errors.name.message}
            </span>
          )}
        </div>

        {/* Corporate Email */}
        <div>
          <label className="block text-[10px] font-bold text-stone-705 uppercase tracking-wider mb-1">
            EMAIL ADDRESS
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <input
              type="email"
              disabled={otpSent}
              {...register('email', {
                required: 'Email address is required',
                pattern: {
                  value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                  message: 'Please enter a valid email address',
                },
              })}
              className={`w-full bg-[#EEF2F6] border text-stone-900 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-primary/60 focus:bg-white transition-all placeholder:text-stone-400 ${
                errors.email ? 'border-red-300' : 'border-transparent'
              } ${otpSent ? 'opacity-65 cursor-not-allowed' : ''}`}
              placeholder="you@email.com"
            />
          </div>
          {errors.email && (
            <span className="text-[10px] font-bold text-red-500 mt-1 block">
              {errors.email.message}
            </span>
          )}
        </div>

        {/* Removed Company Name Field as requested */}

        {/* Country & Currency Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Country */}
          <div>
            <label className="block text-[10px] font-bold text-stone-705 uppercase tracking-wider mb-1">
              COUNTRY
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <select
                disabled={otpSent}
                {...register('country', { required: 'Country is required' })}
                className={`w-full bg-[#EEF2F6] border text-stone-900 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-primary/60 focus:bg-white transition-all appearance-none ${
                  errors.country ? 'border-red-300' : 'border-transparent'
                } ${otpSent ? 'opacity-65 cursor-not-allowed' : ''}`}
              >
                <option value="" className="text-stone-500">Select...</option>
                {COUNTRIES.map((country) => (
                  <option key={country} value={country} className="text-stone-900 bg-white">
                    {country}
                  </option>
                ))}
              </select>
            </div>
            {errors.country && (
              <span className="text-[10px] font-bold text-red-500 mt-1 block">
                {errors.country.message}
              </span>
            )}
          </div>

          {/* Currency */}
          <div>
            <label className="block text-[10px] font-bold text-stone-705 uppercase tracking-wider mb-1">
              CURRENCY
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="text"
                {...register('currency')}
                readOnly
                className="w-full bg-[#EEF2F6]/75 border border-transparent text-stone-550 rounded-xl py-3 pl-10 pr-4 text-xs font-bold focus:outline-none cursor-not-allowed"
                placeholder="Auto-filled"
              />
            </div>
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-[10px] font-bold text-stone-705 uppercase tracking-wider mb-1">
            PASSWORD
          </label>
          <div className="relative">
            <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <input
              type={showPassword ? 'text' : 'password'}
              disabled={otpSent}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Min 6 characters',
                },
              })}
              className={`w-full bg-[#EEF2F6] border text-stone-900 rounded-xl py-3 pl-10 pr-11 text-xs font-semibold focus:outline-none focus:border-primary/60 focus:bg-white transition-all placeholder:text-stone-400 ${
                errors.password ? 'border-red-300' : 'border-transparent'
              } ${otpSent ? 'opacity-65 cursor-not-allowed' : ''}`}
              placeholder="••••••"
            />
            {!otpSent && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            )}
          </div>
          {errors.password && (
            <span className="text-[10px] font-bold text-red-500 mt-1 block">
              {errors.password.message}
            </span>
          )}
          {passwordVal && !errors.password && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden flex">
                <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${(strength.score / 5) * 100}%` }}></div>
              </div>
              <span className={`text-[10px] font-extrabold uppercase tracking-wide ${strength.textColor}`}>{strength.label}</span>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-[10px] font-bold text-stone-750 uppercase tracking-wider mb-1">
            CONFIRM PASSWORD
          </label>
          <div className="relative">
            <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              disabled={otpSent}
              {...register('confirmPassword', {
                required: 'Confirm your password',
                validate: (value) => value === passwordVal || 'Passwords must match',
              })}
              className={`w-full bg-[#EEF2F6] border text-stone-900 rounded-xl py-3 pl-10 pr-11 text-xs font-semibold focus:outline-none focus:border-primary/60 focus:bg-white transition-all placeholder:text-stone-400 ${
                errors.confirmPassword ? 'border-red-300' : 'border-transparent'
              } ${otpSent ? 'opacity-65 cursor-not-allowed' : ''}`}
              placeholder="••••••"
            />
            {!otpSent && (
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-600 focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            )}
          </div>
          {errors.confirmPassword && (
            <span className="text-[10px] font-bold text-red-500 mt-1 block">
              {errors.confirmPassword.message}
            </span>
          )}
          {passwordVal && confirmPasswordVal && passwordVal === confirmPasswordVal && !errors.confirmPassword && (
            <span className="text-[10px] font-extrabold text-[#2E7D32] mt-1.5 flex items-center gap-1 uppercase tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5" /> Passwords match
            </span>
          )}
        </div>

        {/* INLINE OTP BOX (Hidden until registration succeeds) */}
        {otpSent && (
          <div className="bg-stone-50 border border-stone-200/60 rounded-2xl p-4.5 space-y-4 animate-slide-down mt-2">
            <div>
              <label className="block text-[10px] font-extrabold text-stone-800 uppercase tracking-wider text-center mb-2.5">
                ENTER 6-DIGIT EMAIL CODE
              </label>

              <div className="flex justify-center space-x-2.5">
                {otpValues.map((value, idx) => (
                  <input
                    key={idx}
                    ref={otpRefs[idx]}
                    type="text"
                    maxLength="1"
                    value={value}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
                    className="w-10 h-11 bg-white border border-stone-300 text-stone-900 rounded-xl text-center text-md font-poppins font-bold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                ))}
              </div>
            </div>

            {/* Countdown / Resend */}
            <div className="text-center">
              {!canResend ? (
                <span className="text-[10px] text-stone-500 font-bold">
                  Resend code in <strong className="text-stone-900 font-bold">{timer}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="flex items-center justify-center gap-1 text-[10px] text-[#2E5E35] hover:text-[#1F4625] transition-colors font-bold mx-auto focus:outline-none"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  <span>Resend Verification Code</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#2E5E35] hover:bg-[#1F4625] text-white font-poppins text-xs font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5 mt-6 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <span>{otpSent ? 'Verify and Activate Account' : 'Register Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {otpSent && (
          <button
            type="button"
            onClick={() => {
              setOtpSent(false);
              setSuccessMsg(null);
              setApiError(null);
            }}
            className="w-full text-center text-xs text-stone-500 hover:text-stone-700 font-semibold"
          >
            Edit Registration Details
          </button>
        )}
      </form>

      {!otpSent && (
        <p className="text-center text-xs text-stone-555 mt-6 font-semibold">
          Already trading with us?{' '}
          <span
            onClick={() => navigate('/login', { state: location.state })}
            className="text-[#2E5E35] hover:text-[#1F4625] font-bold cursor-pointer underline decoration-dotted"
          >
            Sign In
          </span>
        </p>
      )}
    </div>
  );
};

export default RegisterForm;
