import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Mail, KeyRound, Eye, EyeOff, ArrowRight } from 'lucide-react';

export const LoginForm = () => {
  const { login } = useAuth();
  const { login: adminLogin } = useAdminAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '';

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

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
      // First authenticate via standard login to check the role in MongoDB
      const res = await login(data.email, data.password);
      
      if (data.rememberMe) {
        localStorage.setItem('cocoveera_remember_email', data.email);
      } else {
        localStorage.removeItem('cocoveera_remember_email');
      }

      if (res.success) {
        // If the user's role is admin/manager/support, log them into the admin context
        if (['admin', 'manager', 'support'].includes(res.user?.role)) {
          try {
            await adminLogin(data.email, data.password);
            navigate('/admin/dashboard');
            return;
          } catch (adminErr) {
            console.error('Failed to log in as admin despite having admin role:', adminErr);
            // Fallback to standard dashboard if admin login fails
          }
        }

        if (redirect) {
          navigate(`/${redirect}`);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      if (err.message.includes('not verified') || err.message.toLowerCase().includes('otp')) {
        navigate(`/verify-otp?email=${encodeURIComponent(data.email)}`);
      } else {
        setApiError(err.message || 'Incorrect email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-stone-200/80 rounded-3xl p-8 shadow-soft text-stone-900 max-w-md w-full mx-auto">
      <div className="text-center mb-8">
        <span className="text-[#2E5E35] font-poppins text-[10px] font-bold uppercase tracking-widest">
          Secure Partner Portal
        </span>
        <h2 className="text-2xl font-poppins font-extrabold text-stone-900 mt-1">
          Welcome Back
        </h2>
        <p className="text-stone-500 text-xs mt-1.5 font-medium">
          Sign in to access your trade dashboard
        </p>
      </div>

      {apiError && (
        <div className="bg-red-50 text-red-650 text-xs p-3.5 rounded-xl border border-red-100 mb-5 font-semibold text-center">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-[10px] font-bold text-stone-900 uppercase tracking-wider mb-1.5">
            CORPORATE EMAIL ADDRESS
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <input
              type="email"
              {...register('email', {
                required: 'Email address is required',
                pattern: {
                  value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                  message: 'Please enter a valid email address',
                },
              })}
              className={`w-full bg-[#EEF2F6] border text-stone-900 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-primary/60 focus:bg-white transition-all placeholder:text-stone-450 ${
                errors.email ? 'border-red-300' : 'border-transparent'
              }`}
              placeholder="partner@company.com"
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

        {/* Remember Me */}
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
      </form>

      <p className="text-center text-xs text-stone-500 mt-6 font-semibold">
        New to Cocoveera?{' '}
        <span
          onClick={() => navigate('/register')}
          className="text-[#2E5E35] hover:text-[#1F4625] font-bold cursor-pointer underline decoration-dotted"
        >
          Register here
        </span>
      </p>
    </div>
  );
};

export default LoginForm;
