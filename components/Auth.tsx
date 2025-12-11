
import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2, RefreshCw, Info, Smartphone, Key, HelpCircle, Copy, X, Users, Globe, Link, Cloud } from 'lucide-react';
import { AppView, UserProfile } from '../types';
import { authService } from '../services/authService';
import GoogleLoginBtn from './GoogleLoginBtn';


interface AuthProps {
  setView: (view: AppView) => void;
  setUser: (user: UserProfile) => void;
  initialError?: string | null;
}

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const Auth: React.FC<AuthProps> = ({ setView, setUser, initialError }) => {
  const [isLogin, setIsLogin] = useState(!initialError);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError || null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [showGoogleHelp, setShowGoogleHelp] = useState(false);

  // Signup Verification State
  const [isVerifyingSignup, setIsVerifyingSignup] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // Forgot Password State
  const [isForgot, setIsForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [resetToken, setResetToken] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Effect to handle initialError prop updates if any (though usually passed on mount)
  React.useEffect(() => {
    if (initialError) {
      setError(initialError);
      if (initialError.includes("Sign Up first")) {
        setIsLogin(false);
      }
    }
  }, [initialError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length > 6) score += 1;
    if (pass.length > 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submit triggered. isVerifyingSignup:", isVerifyingSignup, "isLogin:", isLogin, "isForgot:", isForgot, "ForgotStep:", forgotStep);
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isForgot) {
        if (forgotStep === 'email') {
          const { message, success } = await authService.requestForgotOtp(formData.email);
          if (success) {
            setSuccess(message);
            setForgotStep('otp');
            setOtpCode('');
          } else {
            setError(message);
          }
        } else if (forgotStep === 'otp') {
          const { message, success, resetToken } = await authService.verifyForgotOtp(formData.email, otpCode);
          if (success && resetToken) {
            setSuccess(message);
            setResetToken(resetToken);
            setForgotStep('reset');
          }
        } else if (forgotStep === 'reset') {
          if (formData.password !== formData.confirmPassword) throw new Error("Passwords do not match.");
          if (passwordStrength < 3) throw new Error("Password is too weak.");

          const { message, success } = await authService.resetPasswordWithOtp(formData.email, resetToken!, formData.password);

          if (success) {
            setSuccess("Password reset successfully! Please Sign In.");
            setTimeout(() => {
              setIsForgot(false);
              setForgotStep('email');
              setIsLogin(true);
              setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
            }, 2000);
          }
        }
        setLoading(false);
        return;
      }

      if (isVerifyingSignup) {
        console.log("Verifying OTP for:", formData.email, "Code:", otpCode);
        try {
          const user = await authService.verifyOtp(formData.email, otpCode, 'signup');
          setSuccess("Account verified! Redirecting...");
          setTimeout(() => {
            setUser(user);
            setView(AppView.DASHBOARD);
          }, 1000);
          return;
        } catch (verifyErr: any) {
          throw verifyErr;
        }
      }

      if (isLogin) {
        try {
          const user = await authService.login(formData.email, formData.password);
          setSuccess("Login successful. Redirecting...");
          setTimeout(() => {
            setUser(user);
            setView(AppView.DASHBOARD);
          }, 1000);
        } catch (err: any) {
          setError(err.message);
        }
      } else {
        if (formData.password !== formData.confirmPassword) throw new Error("Passwords do not match.");
        if (passwordStrength < 3) throw new Error("Password is too weak.");

        const newUser = await authService.signup(formData.fullName, formData.email, formData.password);
        if (newUser) {
          await authService.logout();
          setUser(null as any);
        }

        setSuccess("Account created. Please enter the code sent to your email.");
        setIsVerifyingSignup(true);
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    } finally {
      if (!success && !error) setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      // Store intent to check on return (to prevent accidental signup via login)
      const intent = isLogin ? 'login' : 'signup';
      console.log("🔍 [Auth.tsx] Setting auth_intent:", intent);
      localStorage.setItem('auth_intent', intent);

      // Pass !isLogin (true if signup) to control the prompt
      await authService.loginWithGoogle(!isLogin);
    } catch (e: any) {
      setError("Google Login Failed. Ensure it is enabled in Supabase.");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      if (isForgot) {
        await authService.requestForgotOtp(formData.email);
        setSuccess("New OTP sent!");
      } else {
        await authService.resendConfirmation(formData.email);
        setSuccess("New confirmation link sent!");
      }
      setError(null);
    } catch (e: any) {
      setError("Failed to resend: " + e.message);
    } finally {
      setResending(false);
    }
  };

  const isEmailConfirmationError = error && error.includes("Email not confirmed");
  const isInvalidCredentials = error && (error.includes("Invalid login") || error.includes("Invalid credentials"));
  const isAccountExists = error && error.includes("Account already exists");
  const isGoogleAccountError = error && error.includes("use Google Sign-In");

  // URL Detection

  // URL Detection
  const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const isLocalhost = currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1');
  const isCloudEnv = !isLocalhost && currentUrl.length > 0;

  // Calculate the callback URL for the user to copy
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
  const callbackUrl = `${supabaseUrl}/auth/v1/callback`;

  // Title Logic
  const getTitle = () => {
    if (isForgot) {
      if (forgotStep === 'email') return 'Reset Password';
      if (forgotStep === 'otp') return 'Enter Code';
      if (forgotStep === 'reset') return 'New Password';
    }
    return isVerifyingSignup ? 'Verify Account' : isLogin ? 'Welcome back' : 'Create account';
  };

  const getSubtitle = () => {
    if (isForgot) {
      if (forgotStep === 'email') return 'Enter email to receive OTP.';
      if (forgotStep === 'otp') return <span>6-digit code sent to <span className="text-cyan-400 font-bold">{formData.email}</span></span>;
      if (forgotStep === 'reset') return 'Set your new password.';
    }
    return isVerifyingSignup ? <span>Code sent to <span className="text-cyan-400 font-bold">{formData.email}</span></span> : isLogin ? 'Enter credentials.' : 'Initialize sequence.';
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-12 px-6 relative overflow-hidden bg-black">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-black border border-white/20 p-8 shadow-2xl relative">

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight uppercase">
              {getTitle()}
            </h2>
            <p className="text-zinc-500 font-mono text-sm">
              {getSubtitle()}
            </p>
          </div>

          {!isVerifyingSignup && !isForgot && (
            <div className="flex p-1 bg-black border border-white/20 mb-6">
              <button
                onClick={() => { setIsLogin(true); setError(null); setSuccess(null); }}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all ${isLogin ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'
                  }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setIsLogin(false); setError(null); setSuccess(null); }}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all ${!isLogin ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'
                  }`}
              >
                Sign Up
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* GOOGLE LOGIN + HELP - Visible for both Login and Signup, BUT NOT FORGOT PASSWORD */}
            {!success && !isVerifyingSignup && !isForgot && (
              <div className="flex flex-col gap-6">
                <GoogleLoginBtn
                  onSuccess={(user) => {
                    setSuccess("Google Login Successful!");
                    // App.tsx handles state update and redirect via onAuthStateChange
                  }}
                  onError={(msg) => {
                    setError(msg);
                    if (msg.includes("Sign Up first")) {
                      setIsLogin(false);
                    }
                  }}
                  setView={setView}
                  isSignup={!isLogin}
                />

                <div className="flex justify-between items-center px-1">
                  <button
                    type="button"
                    onClick={() => { setIsForgot(true); setForgotStep('email'); setError(null); setSuccess(null); }}
                    className="text-[10px] text-zinc-500 hover:text-white flex items-center gap-1 uppercase tracking-wider"
                  >
                    Forgot Password?
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGoogleHelp(!showGoogleHelp)}
                    className="text-[10px] text-zinc-500 hover:text-white flex items-center gap-1"
                  >
                    <HelpCircle className="w-3 h-3" /> Trouble signing in?
                  </button>
                </div>
              </div>
            )}

            {/* GOOGLE CONFIG HELP MODAL */}
            {showGoogleHelp && (
              <div className="bg-zinc-900 border border-orange-500/50 p-4 text-xs mt-2 relative animate-fade-in-up">
                <button onClick={() => setShowGoogleHelp(false)} className="absolute top-2 right-2 text-zinc-500 hover:text-white"><X className="w-3 h-3" /></button>
                <h4 className="font-bold text-orange-400 uppercase mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Having Trouble?
                </h4>

                <div className="text-zinc-400 space-y-2 leading-relaxed">
                  <p>If you're having trouble signing in, please try the following steps:</p>
                  <ul className="list-disc list-inside space-y-1 pl-1">
                    <li>Check your internet connection.</li>
                    <li>Disable any ad-blockers or privacy extensions.</li>
                    <li>Clear your browser cache and cookies.</li>
                    <li>Try using a different browser or device.</li>
                  </ul>
                  <p className="mt-2 text-zinc-500 italic">
                    If the issue persists, please contact our support team for assistance.
                  </p>
                </div>
              </div>
            )}

            {!success && !isVerifyingSignup && !isForgot && (
              <div className="flex items-center gap-4 py-2">
                <div className="h-px bg-white/10 flex-1" />
                <span className="text-[10px] text-zinc-600 font-bold uppercase">Or use email</span>
                <div className="h-px bg-white/10 flex-1" />
              </div>
            )}

            {error && (
              <div className="bg-red-900/10 border border-red-900/50 p-4 flex flex-col gap-2 text-sm text-red-400 font-mono">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
                {isInvalidCredentials && (
                  <div className="ml-6 mt-1 p-2 bg-black/50 border border-white/10 text-xs text-zinc-300">
                    <div className="flex gap-2 items-center mb-1 text-cyan-400 font-bold uppercase tracking-wider">
                      <Info className="w-3 h-3" /> Tip
                    </div>
                    <p className="mb-2">Forgot password? YOu can reset it via Supabase or contact support.</p>
                  </div>
                )}
                {isAccountExists && (
                  <div className="ml-6 mt-1 p-2 bg-black/50 border border-white/10 text-xs text-zinc-300">
                    <div className="flex gap-2 items-center mb-1 text-cyan-400 font-bold uppercase tracking-wider">
                      <User className="w-3 h-3" /> Account Found
                    </div>
                    <p className="mb-2">You already have an account with this email.</p>
                    <button
                      type="button"
                      onClick={() => { setIsLogin(true); setError(null); }}
                      className="text-xs bg-white text-black px-4 py-2 font-bold uppercase tracking-wide hover:bg-cyan-400 transition-colors w-full"
                    >
                      Sign In Now
                    </button>
                  </div>
                )}
                {isGoogleAccountError && (
                  <div className="ml-6 mt-1 p-2 bg-black/50 border border-white/10 text-xs text-zinc-300">
                    <div className="flex gap-2 items-center mb-1 text-orange-400 font-bold uppercase tracking-wider">
                      <Globe className="w-3 h-3" /> Google Account
                    </div>
                    <p className="mb-2">This email is linked to Google. Please sign in with Google instead of resetting password.</p>
                    {/* We can point them to the button above or provide one here, but simpler is just instruction */}
                  </div>
                )}
                {isEmailConfirmationError && (
                  <div className="ml-6 flex flex-col gap-2 mt-2">
                    <span className="text-xs text-zinc-400">
                      Link broken? You may need to verify from a valid IP.
                    </span>
                    {isLocalhost && (
                      <div className="p-3 bg-orange-900/20 border border-orange-500/30 text-orange-200 text-xs mt-1 mb-2">
                        <div className="flex items-center gap-2 mb-2 font-bold uppercase"><Smartphone className="w-3 h-3" /> Localhost Warning</div>
                        <p>Phone cannot open localhost links. Use your computer IP (e.g. 192.168.x.x).</p>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resending}
                      className="text-xs bg-white text-black px-4 py-3 font-bold uppercase tracking-wide hover:bg-cyan-400 transition-colors w-full flex items-center justify-center gap-2 mt-2"
                    >
                      {resending ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Mail className="w-3 h-3" />}
                      Resend Verification
                    </button>
                  </div>
                )}
              </div>
            )}

            {success && (
              <div className="bg-emerald-900/10 border border-emerald-900/50 p-4 flex items-center gap-2 text-sm text-emerald-400 font-mono">
                <CheckCircle2 className="w-4 h-4" /> {success}
              </div>
            )}

            {!isLogin && !isVerifyingSignup && !isForgot && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-white transition-colors" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required={!isLogin}
                    className="w-full bg-black border border-white/20 px-12 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-white transition-all font-mono text-sm"
                    placeholder="JOHN DOE"
                  />
                </div>
              </div>
            )}

            {/* Email Input: Valid for Login, Signup, AND Forgot Password Step 'email' */}
            {(!isVerifyingSignup && !isForgot) || (isForgot && forgotStep === 'email') ? (
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-white transition-colors" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isVerifyingSignup}
                    className="w-full bg-black border border-white/20 px-12 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-white transition-all font-mono text-sm disabled:opacity-50"
                    placeholder="name@example.com"
                  />
                </div>
              </div>
            ) : null}

            {/* OTP Code Input: Valid for Signup Verification AND Forgot Password Step 'otp' */}
            {(isVerifyingSignup || (isForgot && forgotStep === 'otp')) && (
              <div className="space-y-2 animate-fade-in-up">
                <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Verification Code</label>
                <div className="relative group">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-white transition-colors" />
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    required
                    className="w-full bg-black border border-white/20 px-12 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-white transition-all font-mono text-sm tracking-[0.5em]"
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="text-[10px] text-zinc-400 hover:text-white underline uppercase tracking-wider flex items-center gap-1"
                  >
                    {resending ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    Resend Code
                  </button>
                </div>
              </div>
            )}

            {/* Password Inputs: Valid for Signup AND Forgot Password Step 'reset' */}
            {(!isVerifyingSignup && !isForgot && !isLogin) || (isForgot && forgotStep === 'reset') ? (
              <>
                <div className="space-y-2 animate-fade-in-up">
                  <label className="text-xs font-bold text-zinc-500 uppercase ml-1">New Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-white transition-colors" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full bg-black border border-white/20 px-12 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-white transition-all font-mono text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="flex gap-1 mt-1 h-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`flex-1 transition-colors duration-300 ${passwordStrength >= level
                            ? (passwordStrength <= 2 ? 'bg-red-500' : passwordStrength <= 3 ? 'bg-yellow-500' : 'bg-emerald-500')
                            : 'bg-zinc-800'
                            }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2 animate-fade-in-up">
                  <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Confirm Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-white transition-colors" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full bg-black border border-white/20 px-12 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-white transition-all font-mono text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </>
            ) : null}

            {/* Login Password Input (Only for Login) */}
            {isLogin && !isForgot && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-white transition-colors" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full bg-black border border-white/20 px-12 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-white transition-all font-mono text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-400 text-black font-bold py-5 hover:bg-white hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] transition-all flex items-center justify-center gap-2 mt-6 uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="animate-pulse">Processing...</span>
              ) : (
                <>
                  {isForgot ? (
                    forgotStep === 'email' ? <>Send OTP <ArrowRight className="w-5 h-5" /></> :
                      forgotStep === 'otp' ? <>Verify Code <ArrowRight className="w-5 h-5" /></> :
                        <>Reset Password <ArrowRight className="w-5 h-5" /></>
                  ) : isVerifyingSignup ? (
                    <>Verify Account <ArrowRight className="w-5 h-5" /></>
                  ) : isLogin ? (
                    <>
                      Sign In <ArrowRight className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      Create Account <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </>
              )}
            </button>
            {isForgot && (
              <button
                type="button"
                onClick={() => { setIsForgot(false); setIsLogin(true); setError(null); setForgotStep('email'); }}
                className="w-full text-zinc-500 text-xs uppercase tracking-widest hover:text-white transition-all mt-4"
              >
                Back to Sign In
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};


export default Auth;
