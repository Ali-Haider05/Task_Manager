import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
  ShieldCheck,
  CheckSquare2,
  PlayCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginDemo } = useAuth();
  const { showSuccess, showInfo } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
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
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
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
      await login(formData.email.trim(), formData.password);
      showSuccess('Login successful! Welcome back.');
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      const isNet = err.code === 'ERR_NETWORK' || !err.response;
      setIsNetworkError(isNet);

      const msg = isNet
        ? 'Cannot connect to backend server at ' +
          (import.meta.env.VITE_API_URL || 'http://localhost:5000/api') +
          '. Make sure your backend server is running, or test with Demo Mode below.'
        : err.response?.data?.message || 'Invalid email or password.';
      setApiError(msg);
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
        {/* Left: Branding & Abstract Visual */}
        <div className="bg-forest p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-forest-light/40 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-56 h-56 rounded-full bg-sage/20 blur-3xl pointer-events-none" />

          {/* Top Brand Logo */}
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

          {/* Middle Decorative Graphic & Value Proposition */}
          <div className="relative z-10 my-8 sm:my-12">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 shadow-subtle mb-6 max-w-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sage" />
                  <span className="text-xs font-semibold text-white tracking-wide">
                    Deep Focus Mode
                  </span>
                </div>
                <span className="text-[10px] text-sage/80 bg-forest-dark/50 px-2 py-0.5 rounded">
                  Active
                </span>
              </div>
              <div className="space-y-2">
                <div className="h-2 rounded bg-white/20 w-3/4" />
                <div className="h-2 rounded bg-white/10 w-1/2" />
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-sage">
                <span className="flex items-center gap-1">
                  <CheckSquare2 className="w-3.5 h-3.5" /> 8 Tasks Done
                </span>
                <span>94% Velocity</span>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-white tracking-tight leading-snug">
              Master your day with quiet clarity.
            </h3>
            <p className="text-sm text-sage/90 mt-2 leading-relaxed">
              Designed for professionals who value simplicity, focus, and purposeful task execution.
            </p>
          </div>

          {/* Bottom Security indicator */}
          <div className="relative z-10 pt-4 border-t border-forest-light/40 flex items-center gap-2 text-xs text-sage/80">
            <ShieldCheck className="w-4 h-4 text-sage" />
            <span>Secure, encrypted session management</span>
          </div>
        </div>

        {/* Right: Login Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-charcoal tracking-tight">
              Sign In
            </h1>
            <p className="text-sm text-muted mt-1.5">
              Welcome back! Please enter your details to access your workspace.
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
                <p className="font-semibold">Connecting to cloud server...</p>
                <p className="text-muted mt-0.5">
                  The backend service is spinning up after being idle. This can take up to 60 seconds.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
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
                  placeholder="name@example.com"
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

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-charcoal uppercase tracking-wider"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
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
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to TaskFlow</span>
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

          {/* Bottom link to Register */}
          <div className="mt-5 text-center text-xs text-muted">
            Don't have an account yet?{' '}
            <Link
              to="/register"
              className="font-semibold text-natural hover:text-forest underline underline-offset-2 transition-colors"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
