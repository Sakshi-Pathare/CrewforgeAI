import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  Phone, 
  Briefcase, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { PageType, User as UserType } from '../types';
import { registerUser } from '../services/api';

interface RegisterPageProps {
  onNavigate: (page: PageType) => void;
  onRegisterSuccess: (user: UserType) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onNavigate,
  onRegisterSuccess,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'Organizer' | 'Freelancer'>('Organizer');
  const [primaryRole, setPrimaryRole] = useState('Photographer');
  const [city, setCity] = useState('Pune');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Validations
    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    const res = await registerUser({
      name: name.trim(),
      email: email.trim(),
      password,
      role,
      phone: phone.trim(),
      city: city.trim(),
      primaryRole: role === 'Freelancer' ? primaryRole : undefined,
    });
    setIsLoading(false);

    if (res.success && res.user) {
      onRegisterSuccess(res.user);
    } else {
      setErrorMessage(res.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="max-w-[1100px] mx-auto py-8 px-4 animate-in fade-in duration-150">
      <button
        onClick={() => onNavigate('login')}
        className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-[#563CF0] hover:text-[#472FD6] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Sign In</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white rounded-3xl border border-[#EAEFF8] shadow-card overflow-hidden">
        {/* Left Side: Brand Visuals */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#101D4B] via-[#1A285A] to-[#563CF0] p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#7545F5]/30 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>

          <div className="relative z-10">
            <div className="mb-8">
              <img
                src="/brand/crewforge-logo-white.png"
                alt="CrewForge"
                className="h-11 w-auto object-contain max-w-[220px]"
              />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-[12px] font-semibold mb-6 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#A5B4FB]" />
              <span>Join Crew Forge AI</span>
            </div>
            <h2 className="text-[28px] font-black tracking-tight leading-snug">
              Smart crew matching for modern event producers.
            </h2>
            <p className="text-[14px] text-white/80 mt-3 leading-relaxed">
              Create an account as an <strong>Organizer</strong> to staff upcoming events, or as a <strong>Freelancer</strong> to get matched with high-paying productions.
            </p>
          </div>

          <div className="relative z-10 mt-8 space-y-3 text-[13px] text-white/90">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span>Direct database persistence with MongoDB Atlas</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span>Explainable AI recommendations with skill scoring</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span>Instant standby backup activation & contingency</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-7 p-10">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <img src="/brand/crewforge-icon.png" alt="CrewForge" className="w-8 h-8 object-contain" />
                <span className="text-[20px] font-black text-[#142653] tracking-tight">CrewForge</span>
              </div>
              <h1 className="text-[24px] font-black text-[#142653] tracking-tight">
                Create your account
              </h1>
              <p className="text-[14px] text-[#5F6D82] mt-1">
                Fill in your details below to get started.
              </p>
            </div>

            {errorMessage && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-[13px] animate-in fade-in">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection Tabs */}
              <div>
                <label className="block text-[13px] font-bold text-[#142653] mb-1.5">
                  I am registering as an:
                </label>
                <div className="grid grid-cols-2 gap-3 p-1 rounded-2xl bg-[#F2F5FD] border border-[#EAEFF8]">
                  <button
                    type="button"
                    onClick={() => setRole('Organizer')}
                    className={`py-2.5 rounded-xl text-[13.5px] font-bold transition-all ${
                      role === 'Organizer'
                        ? 'bg-white text-[#563CF0] shadow-sm'
                        : 'text-[#5F6D82] hover:text-[#142653]'
                    }`}
                  >
                    Event Organizer
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('Freelancer')}
                    className={`py-2.5 rounded-xl text-[13.5px] font-bold transition-all ${
                      role === 'Freelancer'
                        ? 'bg-white text-[#563CF0] shadow-sm'
                        : 'text-[#5F6D82] hover:text-[#142653]'
                    }`}
                  >
                    Crew Freelancer
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-[13px] font-bold text-[#142653] mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8A95A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Varsharani Patil"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DFE5F2] focus:border-[#563CF0] focus:ring-2 focus:ring-[#563CF0]/10 text-[14px] text-[#142653] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email & Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      placeholder="name@mail.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DFE5F2] focus:border-[#563CF0] focus:ring-2 focus:ring-[#563CF0]/10 text-[14px] text-[#142653] outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-[#142653] mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#8A95A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98220 00000"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DFE5F2] focus:border-[#563CF0] focus:ring-2 focus:ring-[#563CF0]/10 text-[14px] text-[#142653] outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Freelancer Role Selection */}
              {role === 'Freelancer' && (
                <div>
                  <label className="block text-[13px] font-bold text-[#142653] mb-1.5">
                    Primary Specialization
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-[#8A95A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={primaryRole}
                      onChange={(e) => setPrimaryRole(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DFE5F2] focus:border-[#563CF0] focus:ring-2 focus:ring-[#563CF0]/10 text-[14px] text-[#142653] outline-none transition-all bg-white"
                    >
                      <option value="Photographer">Photographer</option>
                      <option value="Sound Engineer">Sound Engineer</option>
                      <option value="Event Anchor">Event Anchor</option>
                      <option value="Lighting Technician">Lighting Technician</option>
                      <option value="Makeup Artist">Makeup Artist</option>
                      <option value="Security Lead">Security Lead</option>
                      <option value="Stage Designer">Stage Designer</option>
                      <option value="Videographer">Videographer</option>
                      <option value="DJ & Music Curator">DJ & Music Curator</option>
                      <option value="Drone Operator">Drone Operator</option>
                      <option value="Hospitality Lead">Hospitality Lead</option>
                      <option value="Event Manager">Event Manager</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      placeholder="Min 6 chars"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DFE5F2] focus:border-[#563CF0] focus:ring-2 focus:ring-[#563CF0]/10 text-[14px] text-[#142653] outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-[#142653] mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8A95A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DFE5F2] focus:border-[#563CF0] focus:ring-2 focus:ring-[#563CF0]/10 text-[14px] text-[#142653] outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-[#563CF0] hover:bg-[#472FD6] text-white font-bold text-[14px] shadow-btn flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-4"
              >
                {isLoading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-[#F0F3F9] text-center">
              <p className="text-[13.5px] text-[#5F6D82]">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="font-bold text-[#563CF0] hover:underline"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

