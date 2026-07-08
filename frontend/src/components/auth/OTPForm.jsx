/**
 * File: frontend/src/components/auth/OTPForm.jsx
 * Purpose: Reusable React UI component for the frontend.
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, RefreshCw, Mail, ArrowLeft, Sprout } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../../services/authService';
import RegistrationSuccessAnimation from './RegistrationSuccessAnimation';

export const OTPForm = () => {
  const { verifyOtp, register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const phoneParam = searchParams.get('phone') || '';

  const [phone, setPhone] = useState(phoneParam);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isSuccessAnimated, setIsSuccessAnimated] = useState(false);
  const [showFullAnimation, setShowFullAnimation] = useState(false);
  const [userRole, setUserRole] = useState(null);
  
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    if (phoneParam) {
      setPhone(phoneParam);
    }
  }, [phoneParam]);

  // Timer for OTP countdown
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullOtp = otpValues.join('');
    if (fullOtp.length !== 6) {
      setApiError('Please fill in all 6 digits of the OTP code.');
      return;
    }

    setLoading(true);
    setApiError(null);
    setSuccessMsg(null);

    try {
      const res = await verifyOtp(phone, fullOtp);
      if (res.success) {
        setSuccessMsg('Account verified successfully!');
        setUserRole(res.user?.role);
        if (!localStorage.getItem('cocoveera_registration_animation_played')) {
          setShowFullAnimation(true);
        } else {
          setIsSuccessAnimated(true);
          setTimeout(() => {
            navigate(res.user.role === 'admin' ? '/admin' : '/address');
          }, 2500);
        }
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
      await authService.resendOTP(phone);
      setSuccessMsg('OTP code has been resent successfully. Please check your SMS/Email.');
    } catch (err) {
      setApiError(err.message || 'Failed to resend verification code.');
      setCanResend(true);
      setTimer(0);
    } finally {
      setLoading(false);
    }
  };

  if (showFullAnimation) {
    return (
      <RegistrationSuccessAnimation 
        onComplete={() => {
          navigate(userRole === 'admin' ? '/admin' : '/address', { replace: true });
        }} 
      />
    );
  }

  return (
    <div className="bg-stone-900/60 border border-stone-850 rounded-3xl p-8 backdrop-blur-md shadow-premium">
      {isSuccessAnimated ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center justify-center py-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
            className="w-28 h-28 bg-primary/20 rounded-full flex items-center justify-center mb-6 relative border border-primary/30"
          >
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.5 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 150 }}
            >
              <Sprout className="w-14 h-14 text-primary-light" />
            </motion.div>
            <motion.svg
              className="absolute inset-0 w-full h-full text-primary-light"
              viewBox="0 0 100 100"
              initial="hidden"
              animate="visible"
            >
              <motion.circle
                cx="50"
                cy="50"
                r="48"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                variants={{
                  hidden: { pathLength: 0, opacity: 0 },
                  visible: { 
                    pathLength: 1, 
                    opacity: 1,
                    transition: { delay: 0.2, duration: 1.5, ease: "easeInOut" }
                  }
                }}
              />
            </motion.svg>
          </motion.div>
          <motion.h3 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="text-2xl font-poppins font-extrabold text-white mb-2 text-center"
          >
            Verification Successful!
          </motion.h3>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.4 }}
            className="text-stone-400 text-sm font-medium text-center"
          >
            Redirecting to your dashboard...
          </motion.p>
        </motion.div>
      ) : (
        <>
          <div className="text-center mb-8">
            <span className="text-primary-light font-poppins text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1">
              <Mail className="w-3 h-3" />
              <span>Verification Pending</span>
            </span>
            <h2 className="text-2xl font-poppins font-extrabold text-white mt-1">
              Verify Account
            </h2>
            <p className="text-stone-400 text-xs mt-2 font-medium">
              Enter the 6-digit OTP verification code sent to: <br />
              <strong className="text-white mt-1.5 inline-block">{phone || 'your phone number'}</strong>
            </p>
          </div>

          {apiError && (
            <div className="bg-red-950/40 text-red-400 text-xs p-3.5 rounded-xl border border-red-900/50 mb-5 font-semibold text-center animate-fade-in">
              {apiError}
            </div>
          )}

          {successMsg && !isSuccessAnimated && (
            <div className="bg-primary/10 text-primary-light text-xs p-3.5 rounded-xl border border-primary/20 mb-5 font-semibold text-center animate-fade-in">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider text-center mb-3">
                Enter 6-Digit Code
              </label>

              {/* Digit Inputs */}
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
                    className="w-11 h-12 bg-stone-950 border border-stone-800 text-white rounded-xl text-center text-lg font-poppins font-bold focus:outline-none focus:border-primary-light focus:ring-1 focus:ring-primary-light transition-all"
                  />
                ))}
              </div>
            </div>

            {/* Resend Countdown */}
            <div className="text-center">
              {!canResend ? (
                <span className="text-[11px] text-stone-500 font-semibold">
                  Resend verification code in <strong className="text-stone-300 font-bold">{timer}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="flex items-center justify-center gap-1.5 text-xs text-primary-light hover:text-primary transition-colors font-bold mx-auto focus:outline-none"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Resend Verification Code</span>
                </button>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-poppins text-xs font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5 border border-primary/20 hover:border-primary/40 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify and Activate Account</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-white font-semibold transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default OTPForm;
