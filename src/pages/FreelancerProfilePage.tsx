import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Star, 
  Award, 
  Clock, 
  DollarSign, 
  Globe, 
  CheckCircle2, 
  AlertCircle, 
  Edit3, 
  Save, 
  ArrowLeft, 
  Sparkles, 
  Calendar, 
  Plus, 
  X,
  ExternalLink,
  Camera,
  Trash2,
  Upload,
  FileCheck,
  FileText
} from 'lucide-react';
import { PageType, User, FreelancerProfileDetail, CertificateItem } from '../types';
import { 
  getMyProfile, 
  updateMyProfile, 
  updateProfilePhoto,
  addCertificate,
  updateCertificate,
  deleteCertificate
} from '../services/api';

interface FreelancerProfilePageProps {
  currentUser: User | null;
  onNavigate: (page: PageType) => void;
  onUserUpdated?: (user: User) => void;
}

const PRESET_SKILLS = [
  'Sound Engineering',
  'Stage Lighting',
  'Photography',
  'Videography',
  'Event Anchoring',
  'Stage Management',
  'DJ & Audio Mixing',
  'Security & Crowd Safety',
  'Hospitality Lead',
  'Live Streaming & Video Tech',
  'Artist Coordination',
  'Catering Operations'
];

export const FreelancerProfilePage: React.FC<FreelancerProfilePageProps> = ({
  currentUser,
  onNavigate,
  onUserUpdated
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile data state
  const [user, setUser] = useState<User | null>(currentUser);
  const [profile, setProfile] = useState<FreelancerProfileDetail | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState<number>(0);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  // Edit form state
  const [name, setName] = useState('');
  const [headline, setHeadline] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [location, setLocation] = useState('');
  const [primaryRole, setPrimaryRole] = useState('');
  const [experienceYears, setExperienceYears] = useState<number>(1);
  const [completedEvents, setCompletedEvents] = useState<number>(0);
  const [pricePerEvent, setPricePerEvent] = useState<number>(4500);
  const [rateType, setRateType] = useState<'per-event' | 'hourly' | 'daily'>('per-event');
  const [bio, setBio] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [certifications, setCertifications] = useState<string[]>([]);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [customCertInput, setCustomCertInput] = useState('');
  const [languages, setLanguages] = useState<string[]>(['English', 'Hindi']);
  const [customLangInput, setCustomLangInput] = useState('');
  const [availabilityNote, setAvailabilityNote] = useState('');
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Certificate Modal / Form State
  const [showCertModal, setShowCertModal] = useState(false);
  const [editingCertId, setEditingCertId] = useState<string | null>(null);
  const [certName, setCertName] = useState('');
  const [certOrg, setCertOrg] = useState('');
  const [certDate, setCertDate] = useState('');
  const [certUrl, setCertUrl] = useState('');
  const [certFile, setCertFile] = useState<string>('');
  const [certFileName, setCertFileName] = useState<string>('');
  const [certError, setCertError] = useState<string | null>(null);
  const [certSaving, setCertSaving] = useState(false);
  const [certDeletingId, setCertDeletingId] = useState<string | null>(null);

  // Fetch live profile from backend
  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await getMyProfile();
      if (data && data.user) {
        setUser(data.user);
        setProfile(data.profile || null);
        setCompletionPercentage(data.completionPercentage || 0);
        setMissingFields(data.missingFields || []);

        // Populate form
        setName(data.user.name || '');
        setHeadline(data.profile?.headline || data.user.headline || data.profile?.primaryRole || '');
        setPhone(data.user.phone || '');
        setCity(data.user.city || data.profile?.city || 'Pune');
        setLocation(data.profile?.location || (data.user.city ? `${data.user.city}, Maharashtra` : 'Pune, Maharashtra'));
        setPrimaryRole(data.profile?.primaryRole || 'Event Specialist');
        setExperienceYears(data.profile?.experienceYears || 2);
        setCompletedEvents(data.profile?.completedEvents || 0);
        setPricePerEvent(data.profile?.pricePerEvent || 4500);
        setRateType(data.profile?.rateType || 'per-event');
        setBio(data.profile?.bio || '');
        setPortfolioUrl(data.profile?.portfolioUrl || '');
        setAvatarUrl(data.user.avatar || '');
        setSkills(data.profile?.skills || ['Event Operations']);
        setCertifications(data.profile?.certifications || []);
        const loadedCerts: CertificateItem[] = (data.profile?.certificates && data.profile.certificates.length > 0)
          ? data.profile.certificates
          : (data.profile?.certifications || []).map((c: string, idx: number) => ({
              id: `cert-legacy-${idx}`,
              name: c,
              issuingOrganization: 'Verified Issuer',
            }));
        setCertificates(loadedCerts);
        setLanguages(data.profile?.languages || ['English', 'Hindi']);
        setAvailabilityNote(data.profile?.availabilityNote || 'Available on weekends and evenings');
      }
    } catch (err: any) {
      console.warn('Could not load profile from server:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setCustomSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleOpenAddCert = () => {
    setEditingCertId(null);
    setCertName('');
    setCertOrg('');
    setCertDate('');
    setCertUrl('');
    setCertFile('');
    setCertFileName('');
    setCertError(null);
    setShowCertModal(true);
  };

  const handleOpenEditCert = (c: CertificateItem) => {
    setEditingCertId(c._id || c.id || null);
    setCertName(c.name || '');
    setCertOrg(c.issuingOrganization || '');
    setCertDate(c.issueDate || '');
    setCertUrl(c.credentialUrl || '');
    setCertFile(c.fileData || '');
    setCertFileName(c.fileName || '');
    setCertError(null);
    setShowCertModal(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setCertError('File size exceeds 2MB limit. Please upload a smaller PDF or image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setCertFile(event.target?.result as string);
      setCertFileName(file.name);
      setCertError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCert = async (e: React.FormEvent) => {
    e.preventDefault();
    setCertError(null);

    if (!certName.trim()) {
      setCertError('Certificate Name is required.');
      return;
    }
    if (!certOrg.trim()) {
      setCertError('Issuing Organization is required.');
      return;
    }

    let formattedUrl = certUrl.trim();
    if (formattedUrl && !/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    setCertSaving(true);
    try {
      const certData: CertificateItem = {
        name: certName.trim(),
        issuingOrganization: certOrg.trim(),
        issueDate: certDate.trim(),
        credentialUrl: formattedUrl,
        fileData: certFile,
        fileName: certFileName,
      };

      if (editingCertId && !editingCertId.startsWith('cert-legacy')) {
        const res = await updateCertificate(editingCertId, certData);
        if (res.success && res.certificates) {
          setCertificates(res.certificates);
          setShowCertModal(false);
          setStatusMessage({ type: 'success', text: 'Certificate updated and saved to MongoDB!' });
        } else {
          setCertError(res.message || 'Failed to update certificate.');
        }
      } else {
        const res = await addCertificate(certData);
        if (res.success && res.certificates) {
          setCertificates(res.certificates);
          setShowCertModal(false);
          setStatusMessage({ type: 'success', text: 'Certificate added and saved to MongoDB!' });
        } else {
          setCertError(res.message || 'Failed to save certificate.');
        }
      }
    } catch (err: any) {
      setCertError(err.message || 'Error communicating with certificate service.');
    } finally {
      setCertSaving(false);
    }
  };

  const handleDeleteCert = async (c: CertificateItem) => {
    const certId = c._id || c.id;
    if (!certId) return;

    if (!window.confirm(`Are you sure you want to delete "${c.name}"?`)) return;

    setCertDeletingId(certId);
    try {
      if (c._id) {
        const res = await deleteCertificate(c._id);
        if (res.success && res.certificates) {
          setCertificates(res.certificates);
          setStatusMessage({ type: 'success', text: 'Certificate removed from profile.' });
        } else {
          setStatusMessage({ type: 'error', text: res.message || 'Failed to delete certificate.' });
        }
      } else {
        setCertificates(prev => prev.filter(item => (item._id || item.id) !== certId));
        setStatusMessage({ type: 'success', text: 'Certificate removed.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to delete certificate.' });
    } finally {
      setCertDeletingId(null);
    }
  };

  const handleAddCert = () => {
    handleOpenAddCert();
  };

  const handleRemoveCert = (cert: string) => {
    setCertifications(certifications.filter(c => c !== cert));
  };

  const handleAddLang = () => {
    const trimmed = customLangInput.trim();
    if (trimmed && !languages.includes(trimmed)) {
      setLanguages([...languages, trimmed]);
      setCustomLangInput('');
    }
  };

  const handleRemoveLang = (lang: string) => {
    setLanguages(languages.filter(l => l !== lang));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStatusMessage(null);

    if (!name.trim()) {
      setStatusMessage({ type: 'error', text: 'Full Name is required.' });
      return;
    }

    if (skills.length === 0) {
      setStatusMessage({ type: 'error', text: 'Please select at least one skill.' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        avatar: avatarUrl.trim(),
        city: city.trim(),
        headline: headline.trim(),
        primaryRole: primaryRole.trim() || 'Event Specialist',
        skills,
        experienceYears: Number(experienceYears) || 0,
        completedEvents: Number(completedEvents) || 0,
        pricePerEvent: Number(pricePerEvent) || 0,
        rateType,
        location: location.trim() || (city ? `${city}, Maharashtra` : 'Pune, Maharashtra'),
        bio: bio.trim(),
        portfolioUrl: portfolioUrl.trim(),
        certificates,
        certifications: certificates.map(c => `${c.name} (${c.issuingOrganization})`),
        languages,
        availabilityNote: availabilityNote.trim(),
      };

      const res = await updateMyProfile(payload);
      if (res && res.success) {
        setStatusMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
        if (res.user) {
          setUser(res.user);
          onUserUpdated?.(res.user);
        }
        if (res.profile) setProfile(res.profile);
        if (res.completionPercentage !== undefined) setCompletionPercentage(res.completionPercentage);
        if (res.missingFields) setMissingFields(res.missingFields);
      } else {
        setStatusMessage({ type: 'error', text: res?.message || 'Failed to update profile.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error updating profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpdate = async () => {
    if (!avatarUrl.trim()) return;
    setSaving(true);
    const ok = await updateProfilePhoto(avatarUrl.trim());
    setSaving(false);
    if (ok) {
      setShowPhotoModal(false);
      setStatusMessage({ type: 'success', text: 'Profile photo updated!' });
      loadProfile();
    } else {
      setStatusMessage({ type: 'error', text: 'Failed to update profile photo.' });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl border-2 border-[#563CF0]/20 border-t-[#563CF0] animate-spin"></div>
          <img src="/brand/crewforge-icon.png" alt="CrewForge" className="w-8 h-8 object-contain animate-pulse" />
        </div>
        <p className="mt-4 text-[14px] font-medium text-[#5F6D82]">Loading your Freelancer Profile...</p>
      </div>
    );
  }

  const userAvatar = avatarUrl || user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=240&auto=format&fit=crop&q=80';

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('dashboard')}
          className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-[#563CF0] hover:text-[#472FD6] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => { setIsEditing(false); loadProfile(); }}
                className="px-4 py-2 rounded-xl text-[13px] font-semibold text-[#5F6D82] bg-white border border-[#D5DCE8] hover:bg-[#F3F5FA] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 rounded-xl text-[13px] font-semibold text-white bg-[#563CF0] hover:bg-[#472FD6] transition-colors shadow-sm inline-flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-5 py-2 rounded-xl text-[13px] font-semibold text-white bg-[#563CF0] hover:bg-[#472FD6] transition-colors shadow-sm inline-flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* Status Alerts */}
      {statusMessage && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 text-[13.5px] font-medium border ${
          statusMessage.type === 'success' 
            ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]' 
            : 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
        }`}>
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-[#EF4444] shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Hero Card: Profile Overview & Completion Score */}
      <div className="bg-white rounded-3xl border border-[#EAEFF8] p-7 shadow-card relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Avatar and Basic Details */}
          <div className="lg:col-span-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative group shrink-0">
              <img
                src={userAvatar}
                alt={name || 'Freelancer'}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-[#EDE9FE] shadow-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=240&auto=format&fit=crop&q=80';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPhotoModal(true)}
                className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-[#563CF0] text-white hover:bg-[#472FD6] shadow-md transition-colors"
                title="Change Photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[24px] font-extrabold text-[#101D4B] tracking-tight">
                  {name || user?.name || 'Freelancer'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EDE9FE] text-[#563CF0]">
                  Freelancer
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#ECFDF5] text-[#059669]">
                  Verified Talent
                </span>
              </div>

              <p className="text-[15px] font-medium text-[#563CF0]">
                {headline || primaryRole || 'Event Operations Specialist'}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-[12.5px] text-[#5F6D82] pt-1">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#8A95A5]" />
                  <span>{location || city || 'Pune, India'}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#8A95A5]" />
                  <span>{user?.email || 'email@example.com'}</span>
                </span>
                {phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#8A95A5]" />
                    <span>{phone}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Profile Completion Dynamic Widget */}
          <div className="lg:col-span-4 bg-[#F2F5FD] rounded-2xl p-5 border border-[#E0E7FF] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#563CF0]" />
                <span className="text-[13px] font-bold text-[#101D4B]">Profile Strength</span>
              </div>
              <span className={`text-[15px] font-black ${
                completionPercentage >= 80 ? 'text-[#059669]' : completionPercentage >= 50 ? 'text-[#D97706]' : 'text-[#DC2626]'
              }`}>
                {completionPercentage}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-[#E2E8F0] rounded-full overflow-hidden mb-3">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  completionPercentage >= 80 
                    ? 'bg-gradient-to-r from-[#10B981] to-[#059669]' 
                    : completionPercentage >= 50 
                    ? 'bg-gradient-to-r from-[#F59E0B] to-[#D97706]' 
                    : 'bg-gradient-to-r from-[#EF4444] to-[#DC2626]'
                }`}
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>

            {missingFields.length > 0 ? (
              <div>
                <p className="text-[11.5px] font-medium text-[#5F6D82] mb-2">
                  Complete these items to boost AI matching ranking:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {missingFields.slice(0, 3).map((field, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[10.5px] font-medium bg-white text-[#563CF0] border border-[#DDD6FE]"
                    >
                      + {field}
                    </span>
                  ))}
                  {missingFields.length > 3 && (
                    <span className="text-[10.5px] font-medium text-[#8A95A5] self-center">
                      +{missingFields.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#059669]">
                <CheckCircle2 className="w-4 h-4" />
                <span>All profile items 100% complete!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content: View Mode vs Edit Mode */}
      {isEditing ? (
        /* Edit Mode Form */
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 Cols: Core Info */}
            <div className="lg:col-span-8 space-y-6">
              {/* Basic Details Box */}
              <div className="bg-white rounded-3xl border border-[#EAEFF8] p-7 shadow-card space-y-5">
                <h3 className="text-[16px] font-bold text-[#101D4B] flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-[#563CF0]" />
                  <span>Personal & Role Information</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12.5px] font-bold text-[#101D4B] mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Riya Deshmukh"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#D5DCE8] text-[13.5px] text-[#101D4B] focus:border-[#563CF0] focus:ring-2 focus:ring-[#563CF0]/10 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[12.5px] font-bold text-[#101D4B] mb-1.5">
                      Professional Headline
                    </label>
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="e.g. Lead Concert Photographer & Visual Editor"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#D5DCE8] text-[13.5px] text-[#101D4B] focus:border-[#563CF0] focus:ring-2 focus:ring-[#563CF0]/10 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[12.5px] font-bold text-[#101D4B] mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 98220 12345"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#D5DCE8] text-[13.5px] text-[#101D4B] focus:border-[#563CF0] focus:ring-2 focus:ring-[#563CF0]/10 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[12.5px] font-bold text-[#101D4B] mb-1.5">
                      City / Operational Base
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        setLocation(`${e.target.value}, Maharashtra`);
                      }}
                      placeholder="e.g. Pune"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#D5DCE8] text-[13.5px] text-[#101D4B] focus:border-[#563CF0] focus:ring-2 focus:ring-[#563CF0]/10 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12.5px] font-bold text-[#101D4B] mb-1.5">
                    Professional Bio / Summary (min 20 characters)
                  </label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe your event background, gear, specializations, and what makes your crew delivery reliable..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D5DCE8] text-[13.5px] text-[#101D4B] focus:border-[#563CF0] focus:ring-2 focus:ring-[#563CF0]/10 outline-none resize-none"
                  ></textarea>
                  <div className="flex justify-between items-center text-[11.5px] text-[#8A95A5] mt-1">
                    <span>{bio.length} characters (20 required for 10% profile boost)</span>
                    {bio.length >= 20 ? (
                      <span className="text-emerald-600 font-semibold">✓ Meets criteria</span>
                    ) : (
                      <span className="text-amber-600">Needs {20 - bio.length} more characters</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills Multi-Selection Card */}
              <div className="bg-white rounded-3xl border border-[#EAEFF8] p-7 shadow-card space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[16px] font-bold text-[#101D4B] flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#563CF0]" />
                    <span>Skills & Specializations</span>
                  </h3>
                  <span className="text-[12px] font-semibold text-[#563CF0] bg-[#EDE9FE] px-2.5 py-0.5 rounded-full">
                    {skills.length} Selected
                  </span>
                </div>

                {/* Selected Skills Chips */}
                <div>
                  <label className="block text-[12px] font-bold text-[#5F6D82] uppercase tracking-wider mb-2">
                    Active Skills (Click × to remove)
                  </label>
                  <div className="flex flex-wrap gap-2 min-h-[40px] p-3 rounded-2xl bg-[#F8FAFD] border border-[#E2E8F0]">
                    {skills.length === 0 ? (
                      <span className="text-[13px] text-[#8A95A5]">No skills added yet. Select from presets below or type custom skill.</span>
                    ) : (
                      skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#563CF0] text-white text-[12.5px] font-medium shadow-xs"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="hover:bg-white/20 p-0.5 rounded-md transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Add Custom Skill */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill(customSkillInput);
                      }
                    }}
                    placeholder="Type a custom skill and click Add..."
                    className="flex-1 px-4 py-2 rounded-xl border border-[#D5DCE8] text-[13px] text-[#101D4B] outline-none focus:border-[#563CF0]"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkill(customSkillInput)}
                    className="px-4 py-2 rounded-xl bg-[#563CF0] text-white text-[13px] font-semibold hover:bg-[#472FD6] transition-colors"
                  >
                    Add
                  </button>
                </div>

                {/* Preset Suggestions */}
                <div>
                  <label className="block text-[12px] font-bold text-[#5F6D82] uppercase tracking-wider mb-2">
                    Popular Event Production Skills (Click to add)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_SKILLS.map((preset, idx) => {
                      const isSelected = skills.includes(preset);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => isSelected ? handleRemoveSkill(preset) : handleAddSkill(preset)}
                          className={`text-[12px] font-medium px-3 py-1.5 rounded-xl border transition-colors ${
                            isSelected
                              ? 'bg-[#EDE9FE] border-[#563CF0] text-[#563CF0]'
                              : 'bg-white border-[#E2E8F0] text-[#5F6D82] hover:border-[#CBD5E1] hover:text-[#101D4B]'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '} {preset}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Certifications & Languages */}
              <div className="bg-white rounded-3xl border border-[#EAEFF8] p-7 shadow-card space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[16px] font-bold text-[#101D4B] flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#563CF0]" />
                    <span>Certifications & Verified Credentials</span>
                  </h3>
                  <button
                    type="button"
                    onClick={handleOpenAddCert}
                    className="px-3.5 py-1.5 rounded-xl bg-[#EDE9FE] text-[#563CF0] hover:bg-[#563CF0] hover:text-white text-[12.5px] font-semibold transition-colors inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Certificate</span>
                  </button>
                </div>

                {/* Certificates List in Edit Mode */}
                <div className="space-y-3">
                  {certificates.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {certificates.map((c, i) => (
                        <div
                          key={c._id || c.id || i}
                          className="p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#E2E8F0] flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-[13.5px] font-bold text-[#101D4B] truncate">{c.name}</p>
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#EDE9FE] text-[#563CF0]">
                                {c.issuingOrganization}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 mt-1 text-[11.5px] text-[#5F6D82]">
                              {c.issueDate && <span>Issued: {c.issueDate}</span>}
                              {c.credentialUrl && (
                                <a
                                  href={c.credentialUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#563CF0] hover:underline flex items-center gap-1"
                                >
                                  <span>Verify Credential</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                              {c.fileData && (
                                <span className="text-emerald-600 font-medium flex items-center gap-1">
                                  <FileCheck className="w-3 h-3" /> Document Uploaded
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenEditCert(c)}
                              className="p-1.5 rounded-lg hover:bg-white text-[#563CF0] hover:shadow-xs transition-all"
                              title="Edit Certificate"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={certDeletingId === (c._id || c.id)}
                              onClick={() => handleDeleteCert(c)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                              title="Delete Certificate"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-[#F8FAFD] border border-dashed border-[#CBD5E1] text-center">
                      <p className="text-[12.5px] text-[#8A95A5]">No certifications added yet.</p>
                      <button
                        type="button"
                        onClick={handleOpenAddCert}
                        className="mt-2 text-[12.5px] font-semibold text-[#563CF0] hover:underline"
                      >
                        + Add your first certificate
                      </button>
                    </div>
                  )}
                </div>

                {/* Languages */}
                <div>
                  <label className="block text-[12.5px] font-bold text-[#101D4B] mb-1.5">
                    Languages Spoken
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {languages.map((l, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#E0F2FE] text-[#0369A1] text-[12px] font-medium">
                        <span>{l}</span>
                        <button type="button" onClick={() => handleRemoveLang(l)}><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customLangInput}
                      onChange={(e) => setCustomLangInput(e.target.value)}
                      placeholder="e.g. Marathi, Gujarati, German"
                      className="flex-1 px-4 py-2 rounded-xl border border-[#D5DCE8] text-[13px] text-[#101D4B] outline-none focus:border-[#563CF0]"
                    />
                    <button
                      type="button"
                      onClick={handleAddLang}
                      className="px-4 py-2 rounded-xl bg-white border border-[#D5DCE8] text-[#101D4B] text-[13px] font-semibold hover:bg-[#F3F5FA]"
                    >
                      Add Language
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Rates, Experience & Portfolio */}
            <div className="lg:col-span-4 space-y-6">
              {/* Pricing & Commercials Card */}
              <div className="bg-white rounded-3xl border border-[#EAEFF8] p-6 shadow-card space-y-4">
                <h3 className="text-[16px] font-bold text-[#101D4B] flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#563CF0]" />
                  <span>Fee & Rate Configuration</span>
                </h3>

                <div>
                  <label className="block text-[12.5px] font-bold text-[#101D4B] mb-1">
                    Event Rate (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-[14px] font-bold text-[#8A95A5]">₹</span>
                    <input
                      type="number"
                      value={pricePerEvent}
                      onChange={(e) => setPricePerEvent(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-8 pr-4 py-2 rounded-xl border border-[#D5DCE8] text-[14px] font-bold text-[#101D4B] outline-none focus:border-[#563CF0]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12.5px] font-bold text-[#101D4B] mb-1">
                    Billing Structure
                  </label>
                  <select
                    value={rateType}
                    onChange={(e) => setRateType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5DCE8] text-[13px] text-[#101D4B] outline-none focus:border-[#563CF0] bg-white"
                  >
                    <option value="per-event">Per Event Show</option>
                    <option value="daily">Daily Day-Rate</option>
                    <option value="hourly">Hourly Production Rate</option>
                  </select>
                </div>
              </div>

              {/* Experience Stats Card */}
              <div className="bg-white rounded-3xl border border-[#EAEFF8] p-6 shadow-card space-y-4">
                <h3 className="text-[16px] font-bold text-[#101D4B] flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#563CF0]" />
                  <span>Production Track Record</span>
                </h3>

                <div>
                  <label className="block text-[12.5px] font-bold text-[#101D4B] mb-1">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Math.max(0, Number(e.target.value)))}
                    className="w-full px-4 py-2 rounded-xl border border-[#D5DCE8] text-[13.5px] text-[#101D4B] outline-none focus:border-[#563CF0]"
                  />
                </div>

                <div>
                  <label className="block text-[12.5px] font-bold text-[#101D4B] mb-1">
                    Completed Events Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={completedEvents}
                    onChange={(e) => setCompletedEvents(Math.max(0, Number(e.target.value)))}
                    className="w-full px-4 py-2 rounded-xl border border-[#D5DCE8] text-[13.5px] text-[#101D4B] outline-none focus:border-[#563CF0]"
                  />
                </div>

                <div>
                  <label className="block text-[12.5px] font-bold text-[#101D4B] mb-1">
                    Portfolio / Showreel URL
                  </label>
                  <input
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://behance.net/yourprofile"
                    className="w-full px-4 py-2 rounded-xl border border-[#D5DCE8] text-[13px] text-[#101D4B] outline-none focus:border-[#563CF0]"
                  />
                </div>

                <div>
                  <label className="block text-[12.5px] font-bold text-[#101D4B] mb-1">
                    General Availability Notes
                  </label>
                  <textarea
                    rows={2}
                    value={availabilityNote}
                    onChange={(e) => setAvailabilityNote(e.target.value)}
                    placeholder="e.g. Available for outstation bookings with 48h notice"
                    className="w-full px-4 py-2 rounded-xl border border-[#D5DCE8] text-[12.5px] text-[#101D4B] outline-none focus:border-[#563CF0] resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 rounded-2xl bg-[#563CF0] hover:bg-[#472FD6] text-white font-bold text-[14px] shadow-lg shadow-indigo-950/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* View Mode Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 8 Cols: About, Skills, Experience */}
          <div className="lg:col-span-8 space-y-6">
            {/* Bio & Intro Card */}
            <div className="bg-white rounded-3xl border border-[#EAEFF8] p-7 shadow-card space-y-4">
              <h3 className="text-[16px] font-bold text-[#101D4B] flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-[#563CF0]" />
                <span>About Me</span>
              </h3>
              <p className="text-[14px] text-[#475569] leading-relaxed whitespace-pre-line">
                {bio || (
                  <span className="text-[#8A95A5] italic">
                    No bio added yet. Click &apos;Edit Profile&apos; above to describe your event expertise, gear, and track record.
                  </span>
                )}
              </p>

              {portfolioUrl && (
                <div className="pt-3 border-t border-[#F0F3F9]">
                  <a
                    href={portfolioUrl.startsWith('http') ? portfolioUrl : `https://${portfolioUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#563CF0] hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Showreel & Portfolio</span>
                  </a>
                </div>
              )}
            </div>

            {/* Skills & Badges */}
            <div className="bg-white rounded-3xl border border-[#EAEFF8] p-7 shadow-card space-y-4">
              <h3 className="text-[16px] font-bold text-[#101D4B] flex items-center gap-2">
                <Award className="w-4 h-4 text-[#563CF0]" />
                <span>Skills & Production Capabilities</span>
              </h3>

              <div className="flex flex-wrap gap-2.5">
                {skills.length > 0 ? (
                  skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3.5 py-1.5 rounded-xl bg-[#F0EEFF] text-[#563CF0] text-[13px] font-semibold border border-[#E0D8FF]"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-[13px] text-[#8A95A5] italic">No skills listed yet.</p>
                )}
              </div>
            </div>

            {/* Spoken Languages & Certifications */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl border border-[#EAEFF8] p-6 shadow-card space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[14px] font-bold text-[#101D4B] flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#563CF0]" />
                    <span>Certifications & Licenses</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleOpenAddCert}
                    className="text-[12px] font-semibold text-[#563CF0] hover:text-[#472FD6] flex items-center gap-1 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {certificates.length > 0 ? (
                  <div className="space-y-2.5">
                    {certificates.map((c, i) => (
                      <div
                        key={c._id || c.id || i}
                        className="p-3 rounded-2xl bg-[#F8FAFD] border border-[#E2E8F0] flex items-start justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[13px] font-bold text-[#101D4B]">{c.name}</span>
                            <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-md bg-[#EDE9FE] text-[#563CF0]">
                              {c.issuingOrganization}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-[#5F6D82]">
                            {c.issueDate && <span>Issued: {c.issueDate}</span>}
                            {c.credentialUrl && (
                              <a
                                href={c.credentialUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#563CF0] hover:underline flex items-center gap-1"
                              >
                                <span>Verify</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            {c.fileData && (
                              <span className="text-emerald-600 font-medium flex items-center gap-0.5">
                                <FileCheck className="w-3 h-3" /> Document
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 mt-0.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditCert(c)}
                            className="p-1 rounded-md text-[#563CF0] hover:bg-white transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={certDeletingId === (c._id || c.id)}
                            onClick={() => handleDeleteCert(c)}
                            className="p-1 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-[12.5px] text-[#8A95A5] italic">No certifications added yet.</p>
                    <button
                      type="button"
                      onClick={handleOpenAddCert}
                      className="mt-1.5 text-[12px] font-semibold text-[#563CF0] hover:underline"
                    >
                      + Add a certificate to boost your match score
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-3xl border border-[#EAEFF8] p-6 shadow-card space-y-3">
                <h4 className="text-[14px] font-bold text-[#101D4B] flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#563CF0]" />
                  <span>Spoken Languages</span>
                </h4>
                {languages.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {languages.map((l, i) => (
                      <span key={i} className="px-3 py-1 rounded-lg bg-[#F1F5F9] text-[#334155] text-[12.5px] font-medium">
                        {l}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12.5px] text-[#8A95A5] italic">Languages not specified.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right 4 Cols: Performance Metrics & Commercials */}
          <div className="lg:col-span-4 space-y-6">
            {/* Commercials Card */}
            <div className="bg-white rounded-3xl border border-[#EAEFF8] p-6 shadow-card space-y-4">
              <h3 className="text-[15px] font-bold text-[#101D4B] flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#563CF0]" />
                <span>Pricing & Availability</span>
              </h3>

              <div className="bg-[#F8FAFD] p-4 rounded-2xl border border-[#E2E8F0]">
                <p className="text-[11px] font-bold text-[#8A95A5] uppercase tracking-wider">Event Fee</p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-[28px] font-extrabold text-[#101D4B]">₹{pricePerEvent.toLocaleString('en-IN')}</span>
                  <span className="text-[12px] font-medium text-[#5F6D82]">/ {rateType.replace('-', ' ')}</span>
                </div>
              </div>

              <div className="space-y-2 text-[12.5px]">
                <div className="flex justify-between py-1.5 border-b border-[#F0F3F9]">
                  <span className="text-[#5F6D82]">Availability Status</span>
                  <span className="font-semibold text-emerald-600">Available for Bookings</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F0F3F9]">
                  <span className="text-[#5F6D82]">Experience</span>
                  <span className="font-semibold text-[#101D4B]">{experienceYears} Years</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#5F6D82]">Completed Shows</span>
                  <span className="font-semibold text-[#101D4B]">{completedEvents || profile?.completedEvents || 40}+ Events</span>
                </div>
              </div>

              {availabilityNote && (
                <div className="pt-2 text-[12px] text-[#5F6D82] bg-[#F2F5FD] p-3 rounded-xl">
                  <strong>Note:</strong> {availabilityNote}
                </div>
              )}
            </div>

            {/* Platform Trust & Reliability Metric */}
            <div className="bg-gradient-to-br from-[#101D4B] to-[#1A285A] text-white rounded-3xl p-6 shadow-card space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#563CF0]/30 rounded-full blur-2xl pointer-events-none"></div>

              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-semibold text-white/70">Reliability Score</p>
                  <p className="text-[26px] font-black text-white mt-0.5">
                    {profile?.reliabilityScore || 96}%
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                  <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                </div>
              </div>

              <p className="relative z-10 text-[12px] text-white/80 leading-relaxed">
                Calculated by Crew Forge AI based on verified attendance, punctuality, and client feedback across 40+ productions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Add / Edit Modal */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#EAEFF8] p-6 animate-in fade-in zoom-in-95 duration-150 my-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#F0F3F9]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] flex items-center justify-center text-[#563CF0]">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-[#101D4B]">
                    {editingCertId ? 'Edit Certificate' : 'Add Professional Certificate'}
                  </h3>
                  <p className="text-[12px] text-[#5F6D82]">
                    Saved directly to your verified MongoDB profile
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCertModal(false)}
                className="p-1.5 rounded-full hover:bg-[#F3F5FA] text-[#8A95A5] hover:text-[#101D4B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {certError && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[12.5px] font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{certError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCert} className="mt-5 space-y-4">
              <div>
                <label className="block text-[12.5px] font-bold text-[#101D4B] mb-1">
                  Certificate / License Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={certName}
                  onChange={(e) => setCertName(e.target.value)}
                  placeholder="e.g. Dante Certified Audio Tech Level 2, FAA Part 107 Pilot"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D5DCE8] text-[13px] text-[#101D4B] outline-none focus:border-[#563CF0]"
                />
              </div>

              <div>
                <label className="block text-[12.5px] font-bold text-[#101D4B] mb-1">
                  Issuing Organization <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={certOrg}
                  onChange={(e) => setCertOrg(e.target.value)}
                  placeholder="e.g. Audinate, Federal Aviation Administration, Shure, InfoComm"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D5DCE8] text-[13px] text-[#101D4B] outline-none focus:border-[#563CF0]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12.5px] font-bold text-[#101D4B] mb-1">
                    Issue Date
                  </label>
                  <input
                    type="text"
                    value={certDate}
                    onChange={(e) => setCertDate(e.target.value)}
                    placeholder="e.g. March 2024 or 2024-03"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D5DCE8] text-[13px] text-[#101D4B] outline-none focus:border-[#563CF0]"
                  />
                </div>

                <div>
                  <label className="block text-[12.5px] font-bold text-[#101D4B] mb-1">
                    Verification / Credential URL
                  </label>
                  <input
                    type="text"
                    value={certUrl}
                    onChange={(e) => setCertUrl(e.target.value)}
                    placeholder="https://verify.cert.com/..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D5DCE8] text-[13px] text-[#101D4B] outline-none focus:border-[#563CF0]"
                  />
                </div>
              </div>

              {/* Document Attachment Upload */}
              <div>
                <label className="block text-[12.5px] font-bold text-[#101D4B] mb-1">
                  Certificate Document (PDF or Image, max 2MB)
                </label>
                <div className="border-2 border-dashed border-[#D5DCE8] hover:border-[#563CF0] rounded-2xl p-4 text-center cursor-pointer transition-colors relative bg-[#F8FAFD]">
                  <input
                    type="file"
                    accept=".pdf,image/png,image/jpeg,image/webp"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                    <Upload className="w-5 h-5 text-[#563CF0]" />
                    <p className="text-[12.5px] font-semibold text-[#101D4B]">
                      {certFileName ? (
                        <span className="text-[#563CF0] flex items-center gap-1 justify-center">
                          <FileCheck className="w-4 h-4" /> {certFileName}
                        </span>
                      ) : (
                        'Click to upload certificate PDF or image'
                      )}
                    </p>
                    <p className="text-[11px] text-[#8A95A5]">
                      {certFile ? 'Document attached • Click to replace' : 'PNG, JPG, or PDF up to 2MB'}
                    </p>
                  </div>
                </div>
                {certFile && (
                  <button
                    type="button"
                    onClick={() => { setCertFile(''); setCertFileName(''); }}
                    className="text-[11px] text-red-500 hover:underline mt-1 inline-block"
                  >
                    Remove uploaded file
                  </button>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0F3F9]">
                <button
                  type="button"
                  onClick={() => setShowCertModal(false)}
                  className="px-4 py-2 rounded-xl text-[13px] font-semibold text-[#5F6D82] hover:bg-[#F3F5FA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={certSaving}
                  className="px-5 py-2 rounded-xl bg-[#563CF0] hover:bg-[#472FD6] text-white text-[13px] font-semibold shadow-sm inline-flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{certSaving ? 'Saving...' : (editingCertId ? 'Update Certificate' : 'Save Certificate')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo URL Change Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#EAEFF8] space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-[#101D4B]">Update Profile Photo</h3>
              <button onClick={() => setShowPhotoModal(false)} className="p-1 hover:bg-[#F3F5FA] rounded-lg">
                <X className="w-5 h-5 text-[#8A95A5]" />
              </button>
            </div>

            <p className="text-[13px] text-[#5F6D82]">
              Paste an image URL (e.g. Unsplash or hosted photo) to update your avatar:
            </p>

            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full px-4 py-2.5 rounded-xl border border-[#D5DCE8] text-[13px] outline-none focus:border-[#563CF0]"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPhotoModal(false)}
                className="px-4 py-2 rounded-xl text-[13px] font-semibold text-[#5F6D82] hover:bg-[#F3F5FA]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePhotoUpdate}
                disabled={saving}
                className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-[#563CF0] hover:bg-[#472FD6]"
              >
                {saving ? 'Updating...' : 'Save Photo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default FreelancerProfilePage;

