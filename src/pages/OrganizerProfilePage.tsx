import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Edit3, 
  Save, 
  ArrowLeft, 
  PlusCircle, 
  Calendar, 
  Users, 
  Camera, 
  X,
  ShieldCheck
} from 'lucide-react';
import { PageType, User } from '../types';
import { getMyProfile, updateMyProfile, updateProfilePhoto } from '../services/api';

interface OrganizerProfilePageProps {
  currentUser: User | null;
  onNavigate: (page: PageType) => void;
  onUserUpdated?: (user: User) => void;
}

export const OrganizerProfilePage: React.FC<OrganizerProfilePageProps> = ({
  currentUser,
  onNavigate,
  onUserUpdated,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile data state
  const [user, setUser] = useState<User | null>(currentUser);
  const [completionPercentage, setCompletionPercentage] = useState<number>(0);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  // Form input state
  const [name, setName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [organizationDescription, setOrganizationDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Fetch live organizer profile from backend
  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await getMyProfile();
      if (data && data.user) {
        setUser(data.user);
        setCompletionPercentage(data.completionPercentage || 0);
        setMissingFields(data.missingFields || []);

        setName(data.user.name || '');
        setOrganizationName(data.user.organizationName || 'Pinnacle Events & Media Pvt Ltd');
        setOrganizationDescription(data.user.organizationDescription || 'Premier event management and production company specializing in large-scale corporate summits, concerts, and college festivals.');
        setPhone(data.user.phone || '+91 98220 54321');
        setCity(data.user.city || 'Pune');
        setAvatarUrl(data.user.avatar || '');
      }
    } catch (err: any) {
      console.warn('Could not load organizer profile from server:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStatusMessage(null);

    if (!name.trim()) {
      setStatusMessage({ type: 'error', text: 'Contact person / Full Name is required.' });
      return;
    }

    if (!organizationName.trim()) {
      setStatusMessage({ type: 'error', text: 'Organization name is required.' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        organizationName: organizationName.trim(),
        organizationDescription: organizationDescription.trim(),
        phone: phone.trim(),
        city: city.trim(),
        avatar: avatarUrl.trim(),
      };

      const res = await updateMyProfile(payload);
      if (res && res.success) {
        setStatusMessage({ type: 'success', text: 'Organization profile updated successfully!' });
        setIsEditing(false);
        if (res.user) {
          setUser(res.user);
          onUserUpdated?.(res.user);
        }
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
      setStatusMessage({ type: 'success', text: 'Organization logo updated!' });
      loadProfile();
    } else {
      setStatusMessage({ type: 'error', text: 'Failed to update logo.' });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl border-2 border-[#563CF0]/20 border-t-[#563CF0] animate-spin"></div>
          <img src="/brand/crewforge-icon.png" alt="CrewForge" className="w-8 h-8 object-contain animate-pulse" />
        </div>
        <p className="mt-4 text-[14px] font-medium text-[#5F6D82]">Loading Organization Profile...</p>
      </div>
    );
  }

  const orgLogo = avatarUrl || user?.avatar || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=240&auto=format&fit=crop&q=80';

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
              <span>Edit Organization</span>
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

      {/* Hero Header Card: Organization Overview & Completion */}
      <div className="bg-white rounded-3xl border border-[#EAEFF8] p-7 shadow-card relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Logo and Basic Details */}
          <div className="lg:col-span-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative group shrink-0">
              <img
                src={orgLogo}
                alt={organizationName || 'Organization'}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-[#EDE9FE] shadow-md bg-white"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=240&auto=format&fit=crop&q=80';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPhotoModal(true)}
                className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-[#563CF0] text-white hover:bg-[#472FD6] shadow-md transition-colors"
                title="Change Logo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[24px] font-extrabold text-[#101D4B] tracking-tight">
                  {organizationName || 'Organization Name'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EDE9FE] text-[#563CF0]">
                  Verified Organizer
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#ECFDF5] text-[#059669]">
                  Enterprise Tier
                </span>
              </div>

              <p className="text-[14.5px] font-medium text-[#5F6D82]">
                Key Contact: <strong className="text-[#101D4B]">{name || user?.name}</strong>
              </p>

              <div className="flex flex-wrap items-center gap-4 text-[12.5px] text-[#5F6D82] pt-1">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#8A95A5]" />
                  <span>{city || 'Pune, India'}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#8A95A5]" />
                  <span>{user?.email || 'organizer@crewforge.ai'}</span>
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

          {/* Profile Strength & Verification */}
          <div className="lg:col-span-4 bg-[#F2F5FD] rounded-2xl p-5 border border-[#E0E7FF] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#563CF0]" />
                <span className="text-[13px] font-bold text-[#101D4B]">Organizer Verification</span>
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
                  Complete these items to verify your production firm:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {missingFields.map((field, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[10.5px] font-medium bg-white text-[#563CF0] border border-[#DDD6FE]"
                    >
                      + {field}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#059669]">
                <ShieldCheck className="w-4 h-4" />
                <span>Organization verified & complete</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content: View vs Edit */}
      {isEditing ? (
        /* Edit Form */
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-3xl border border-[#EAEFF8] p-7 shadow-card space-y-5">
                <h3 className="text-[16px] font-bold text-[#101D4B] flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#563CF0]" />
                  <span>Company Details</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12.5px] font-bold text-[#101D4B] mb-1.5">
                      Organization / Production Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      placeholder="e.g. Pinnacle Events & Media"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#D5DCE8] text-[13.5px] text-[#101D4B] focus:border-[#563CF0] focus:ring-2 focus:ring-[#563CF0]/10 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[12.5px] font-bold text-[#101D4B] mb-1.5">
                      Contact Person Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Varsharani"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#D5DCE8] text-[13.5px] text-[#101D4B] focus:border-[#563CF0] focus:ring-2 focus:ring-[#563CF0]/10 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[12.5px] font-bold text-[#101D4B] mb-1.5">
                      Contact Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 98220 54321"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#D5DCE8] text-[13.5px] text-[#101D4B] focus:border-[#563CF0] focus:ring-2 focus:ring-[#563CF0]/10 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[12.5px] font-bold text-[#101D4B] mb-1.5">
                      Headquarters / City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Pune"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#D5DCE8] text-[13.5px] text-[#101D4B] focus:border-[#563CF0] focus:ring-2 focus:ring-[#563CF0]/10 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12.5px] font-bold text-[#101D4B] mb-1.5">
                    Organization Overview & Description (min 15 characters)
                  </label>
                  <textarea
                    rows={4}
                    value={organizationDescription}
                    onChange={(e) => setOrganizationDescription(e.target.value)}
                    placeholder="Describe your event portfolio, kinds of shows produced, and team requirements..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D5DCE8] text-[13.5px] text-[#101D4B] focus:border-[#563CF0] focus:ring-2 focus:ring-[#563CF0]/10 outline-none resize-none"
                  ></textarea>
                  <div className="flex justify-between items-center text-[11.5px] text-[#8A95A5] mt-1">
                    <span>{organizationDescription.length} characters (15 required)</span>
                    {organizationDescription.length >= 15 ? (
                      <span className="text-emerald-600 font-semibold">✓ Meets verification criteria</span>
                    ) : (
                      <span className="text-amber-600">Needs {15 - organizationDescription.length} more characters</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl border border-[#EAEFF8] p-6 shadow-card space-y-4">
                <h3 className="text-[15px] font-bold text-[#101D4B]">Account Information</h3>
                <div className="space-y-3 text-[13px]">
                  <div>
                    <p className="text-[#8A95A5] text-[11.5px] uppercase font-bold">Official Email</p>
                    <p className="font-semibold text-[#101D4B] mt-0.5">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-[#8A95A5] text-[11.5px] uppercase font-bold">Role Privilege</p>
                    <p className="font-semibold text-[#563CF0] mt-0.5">Event Organizer & Producer</p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3.5 rounded-2xl bg-[#563CF0] hover:bg-[#472FD6] text-white font-bold text-[14px] shadow-lg shadow-indigo-950/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Organization Profile'}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        /* View Mode */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl border border-[#EAEFF8] p-7 shadow-card space-y-4">
              <h3 className="text-[16px] font-bold text-[#101D4B] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#563CF0]" />
                <span>About the Organization</span>
              </h3>
              <p className="text-[14px] text-[#475569] leading-relaxed whitespace-pre-line">
                {organizationDescription || (
                  <span className="text-[#8A95A5] italic">
                    No description provided yet. Click &apos;Edit Organization&apos; to add company information.
                  </span>
                )}
              </p>
            </div>

            {/* Quick Actions for Organizers */}
            <div className="bg-white rounded-3xl border border-[#EAEFF8] p-7 shadow-card space-y-4">
              <h3 className="text-[16px] font-bold text-[#101D4B] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#563CF0]" />
                <span>Event Production Quick Actions</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => onNavigate('create-event')}
                  className="p-5 rounded-2xl bg-[#F8FAFD] hover:bg-[#F0EEFF] border border-[#E2E8F0] hover:border-[#563CF0]/30 transition-all text-left flex items-start gap-4 group"
                >
                  <div className="p-3 rounded-xl bg-[#563CF0] text-white group-hover:scale-105 transition-transform">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-[#101D4B] group-hover:text-[#563CF0] transition-colors">
                      Create New Event
                    </h4>
                    <p className="text-[12px] text-[#5F6D82] mt-1">
                      Specify date, roles needed, budget, and trigger AI crew matching.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('find-crew')}
                  className="p-5 rounded-2xl bg-[#F8FAFD] hover:bg-[#F0EEFF] border border-[#E2E8F0] hover:border-[#563CF0]/30 transition-all text-left flex items-start gap-4 group"
                >
                  <div className="p-3 rounded-xl bg-[#101D4B] text-white group-hover:scale-105 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-[#101D4B] group-hover:text-[#563CF0] transition-colors">
                      Browse Freelancers
                    </h4>
                    <p className="text-[12px] text-[#5F6D82] mt-1">
                      Explore top-rated sound engineers, anchors, photographers, and security.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-[#EAEFF8] p-6 shadow-card space-y-4">
              <h3 className="text-[15px] font-bold text-[#101D4B] flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-[#563CF0]" />
                <span>Primary Contact Person</span>
              </h3>

              <div className="space-y-2.5 text-[13px]">
                <div className="flex justify-between py-1.5 border-b border-[#F0F3F9]">
                  <span className="text-[#5F6D82]">Name</span>
                  <span className="font-semibold text-[#101D4B]">{name || user?.name}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F0F3F9]">
                  <span className="text-[#5F6D82]">Official Email</span>
                  <span className="font-semibold text-[#101D4B]">{user?.email}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F0F3F9]">
                  <span className="text-[#5F6D82]">Phone</span>
                  <span className="font-semibold text-[#101D4B]">{phone || 'Not added'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#5F6D82]">Operational City</span>
                  <span className="font-semibold text-[#101D4B]">{city || 'Pune'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logo Update Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#EAEFF8] space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-[#101D4B]">Update Organization Logo</h3>
              <button onClick={() => setShowPhotoModal(false)} className="p-1 hover:bg-[#F3F5FA] rounded-lg">
                <X className="w-5 h-5 text-[#8A95A5]" />
              </button>
            </div>

            <p className="text-[13px] text-[#5F6D82]">
              Paste an image URL to represent your organization logo:
            </p>

            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
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
                {saving ? 'Updating...' : 'Save Logo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default OrganizerProfilePage;

