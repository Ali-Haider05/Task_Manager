import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Check,
  PlayCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Register = () => {
  const navigate = useNavigate();
  const { register, loginDemo } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [slowServerNotice, setSlowServerNotice] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (apiError) setApiError('');
    if (isNetworkError) setIsNetworkError(false);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || loading) return;

    setLoading(true);
    setApiError('');
    setIsNetworkError(false);

    const slowTimer = setTimeout(() => {
      setSlowServerNotice(true);
    }, 4500);

    try {
      await register(formData.name.trim(), formData.email.trim(), formData.password);
      showSuccess('Registration successful! Please sign in with your credentials.');
      navigate('/login');
    } catch (err) {
      const isNet = err.code === 'ERR_NETWORK' || !err.response;
      setIsNetworkError(isNet);

      const msg = isNet
        ? 'Cannot reach backend at ' +
          (import.meta.env.VITE_API_URL || 'http://localhost:5000/api') +
          '. Make sure your backend server is running, or enter Demo Mode below.'
        : err.response?.data?.message ||
          'Registration failed. Please check your information and try again.';
      setApiError(msg);
      showError(msg);
    } finally {
      clearTimeout(slowTimer);
      setLoading(false);
      setSlowServerNotice(false);
    }
  };

  const handleDemoSignIn = () => {
    loginDemo();
    showInfo('Signed in using Demo Mode. All features & charts are active!');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl bg-white rounded-2xl border border-borderLight shadow-premium overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        {/* Left Branding & Highlights */}
        <div className="bg-forest p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden order-last lg:order-first">
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-forest-light/40 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-56 h-56 rounded-full bg-sage/20 blur-3xl pointer-events-none" />

          {/* Brand Logo */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sage flex items-center justify-center text-forest shadow-sm">
                <Sparkles className="w-5 h-5 text-forest" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white leading-tight">
                  TaskFlow
                </h2>
                <p className="text-xs text-sage tracking-wider uppercase">
                  Organize. Focus. Achieve.
                </p>
              </div>
            </div>
          </div>

          {/* Center Content */}
          <div className="relative z-10 my-8 sm:my-10">
            <h3 className="text-2xl font-bold text-white tracking-tight leading-snug">
              Elevate your daily execution.
            </h3>
            <p className="text-sm text-sage/90 mt-2 leading-relaxed mb-6">
              Join thousands of creators, engineers, and leaders who organize their priorities with clarity.
            </p>

            <ul className="space-y-3 text-xs sm:text-sm text-white/90">
              <li className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-sage-light/20 flex items-center justify-center text-sage">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Minimalist Kanban and status workflows</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-sage-light/20 flex items-center justify-center text-sage">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Real-time KPI metrics and status distribution</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-sage-light/20 flex items-center justify-center text-sage">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Smart overdue alerts and priority tags</span>
              </li>
            </ul>
          </div>

          {/* Bottom Trust note */}
          <div className="relative z-10 pt-4 border-t border-forest-light/40 flex items-center gap-2 text-xs text-sage/80">
            <ShieldCheck className="w-4 h-4 text-sage" />
            <span>Privacy-first architecture with strict token isolation</span>
          </div>
        </div>

        {/* Right Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-charcoal tracking-tight">
              Create Account
            </h1>
            <p className="text-sm text-muted mt-1.5">
              Start your journey to structured productivity today.
            </p>
          </div>

          {/* API Error Notification */}
          {apiError && (
            <div
              role="alert"
              className="mb-5 p-4 rounded-lg bg-red-50 border border-red-200 text-xs text-danger space-y-2 animate-slide-in-up"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed font-medium">{apiError}</div>
              </div>
              {isNetworkError && (
                <div className="pt-2 border-t border-red-200/60 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-charcoal">
                    Backend not running locally yet?
                  </span>
                  <button
                    type="button"
                    onClick={handleDemoSignIn}
                    className="font-bold underline text-forest hover:text-natural text-xs"
                  >
                    Click to Enter in Demo Mode →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Cold backend wake-up indicator */}
          {slowServerNotice && (
            <div className="mb-5 p-3.5 rounded-lg bg-amber-50 border border-warning/30 text-xs text-charcoal flex items-start gap-2.5 animate-slide-in-up">
              <Loader2 className="w-4 h-4 animate-spin text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Waking up backend server...</p>
                <p className="text-muted mt-0.5">
                  Free server tiers take up to 60 seconds to spin up from sleep.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Alex Morgan"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm text-charcoal bg-white placeholder:text-muted/60 focus:outline-none focus:ring-2 transition-all ${
                    errors.name
                      ? 'border-danger focus:ring-danger/20'
                      : 'border-borderLight focus:border-forest focus:ring-forest/10'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-danger">{errors.name}</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="alex@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm text-charcoal bg-white placeholder:text-muted/60 focus:outline-none focus:ring-2 transition-all ${
                    errors.email
                      ? 'border-danger focus:ring-danger/20'
                      : 'border-borderLight focus:border-forest focus:ring-forest/10'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-danger">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5"
              >
                Password (min. 6 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm text-charcoal bg-white placeholder:text-muted/60 focus:outline-none focus:ring-2 transition-all ${
                    errors.password
                      ? 'border-danger focus:ring-danger/20'
                      : 'border-borderLight focus:border-forest focus:ring-forest/10'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal p-0.5 rounded transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-danger">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm text-charcoal bg-white placeholder:text-muted/60 focus:outline-none focus:ring-2 transition-all ${
                    errors.confirmPassword
                      ? 'border-danger focus:ring-danger/20'
                      : 'border-borderLight focus:border-forest focus:ring-forest/10'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal p-0.5 rounded transition-colors"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-danger">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-forest hover:bg-forest-light text-white text-sm font-semibold shadow-subtle transition-all duration-150 disabled:opacity-50 active:scale-98"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-sage" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Your Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Button */}
          <div className="mt-4 pt-4 border-t border-borderLight/70">
            <button
              type="button"
              onClick={handleDemoSignIn}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-beige/50 hover:bg-beige text-charcoal text-xs font-semibold border border-borderLight transition-all active:scale-98"
            >
              <PlayCircle className="w-4 h-4 text-natural" />
              <span>Explore Demo Workspace (No Backend Required)</span>
            </button>
          </div>

          {/* Link to Login */}
          <div className="mt-5 text-center text-xs text-muted">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-natural hover:text-forest underline underline-offset-2 transition-colors"
            >
              Sign in instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
