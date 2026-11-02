import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Shield,
  User,
  ArrowLeft
} from 'lucide-react';
import { PageType, User as UserType } from '../types';
import { loginUser } from '../services/api';

interface LoginPageProps {
  onNavigate: (page: PageType) => void;
  onLoginSuccess: (user: UserType) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigate,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    const res = await loginUser({ email, password });
    setIsLoading(false);

    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setErrorMessage(res.message || 'Invalid email or password.');
    }
  };

  // Quick autofill buttons for testing convenience
  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
  };

  return (
    <div className="max-w-[1100px] mx-auto py-8 px-4 animate-in fade-in duration-150">
      <button
        onClick={() => onNavigate('dashboard')}
        className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-[#563CF0] hover:text-[#472FD6] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Application</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white rounded-3xl border border-[#EAEFF8] shadow-card overflow-hidden">
        {/* Left Side: Brand & Visuals */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#101D4B] via-[#1A285A] to-[#563CF0] p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#7545F5]/30 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-[12px] font-semibold mb-6 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#A5B4FB]" />
              <span>AI-Powered Event Staffing</span>
            </div>
            <h2 className="text-[28px] font-black tracking-tight leading-snug">
              Assemble the perfect event crew in minutes.
            </h2>
            <p className="text-[14px] text-white/80 mt-3 leading-relaxed">
              Sign in to manage active productions, review explainable AI recommendations, and coordinate standby backup crew.
            </p>
          </div>

          <div className="relative z-10 mt-12 pt-8 border-t border-white/10 space-y-3">
            <p className="text-[12px] font-bold text-white/60 uppercase tracking-wider">Demo Accounts (Seeded)</p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('varsharani@eventco.in', 'Organizer@123')}
                className="w-full text-left px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[12.5px] transition-colors flex items-center justify-between"
              >
                <span>👤 Organizer: <strong>varsharani@eventco.in</strong></span>
                <span className="text-[11px] text-white/60">Fill</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('riya.deshmukh@crewforge.ai', 'Freelancer@123')}
                className="w-full text-left px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[12.5px] transition-colors flex items-center justify-between"
              >
                <span>📷 Freelancer: <strong>riya.deshmukh@crewforge.ai</strong></span>
                <span className="text-[11px] text-white/60">Fill</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin@crewforge.ai', 'Admin@123')}
                className="w-full text-left px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[12.5px] transition-colors flex items-center justify-between"
              >
                <span>🛡️ Admin: <strong>admin@crewforge.ai</strong></span>
                <span className="text-[11px] text-white/60">Fill</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="lg:col-span-7 p-10 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div>
              <h1 className="text-[26px] font-black text-[#142653] tracking-tight">
                Sign in to Crew Forge
              </h1>
              <p className="text-[14px] text-[#5F6D82] mt-1">
                Enter your account credentials to access your dashboard.
              </p>
            </div>

            {errorMessage && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-[13px] animate-in fade-in">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-[#142653] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8A95A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@organization.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DFE5F2] focus:border-[#563CF0] focus:ring-2 focus:ring-[#563CF0]/10 text-[14px] text-[#142653] outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#142653] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8A95A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DFE5F2] focus:border-[#563CF0] focus:ring-2 focus:ring-[#563CF0]/10 text-[14px] text-[#142653] outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-[#563CF0] hover:bg-[#472FD6] text-white font-bold text-[14px] shadow-btn flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-[#F0F3F9] text-center">
              <p className="text-[13.5px] text-[#5F6D82]">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  className="font-bold text-[#563CF0] hover:underline"
                >
                  Create an account
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

