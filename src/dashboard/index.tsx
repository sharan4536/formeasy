import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import { UserProfile, UserAccount, UserPreferences } from '../utils/types';
import {
  loadAllData,
  saveProfile,
  saveAccount,
  savePreferences,
  DEFAULT_PROFILE,
  DEFAULT_ACCOUNT,
  DEFAULT_PREFERENCES,
  exportCloudPayload,
  importCloudPayload,
  loginOrRegisterAccount
} from '../utils/storage';
import {
  Sparkles,
  Save,
  User,
  ShieldCheck,
  Smartphone,
  Laptop,
  Monitor,
  Cloud,
  Check,
  RefreshCw,
  Copy,
  FileText,
  CheckCircle2,
  CreditCard,
  Home,
  Briefcase,
  GraduationCap,
  Sliders,
  LogOut,
  Upload,
  Download,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

type TabType = 'profile' | 'sync' | 'preferences' | 'playground';

const Dashboard = () => {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [account, setAccount] = useState<UserAccount>(DEFAULT_ACCOUNT);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  
  const [saved, setSaved] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedSyncCode, setCopiedSyncCode] = useState(false);
  const [showMaskedAadhaar, setShowMaskedAadhaar] = useState(false);
  
  // Account switch modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authName, setAuthName] = useState('');
  const [authSuccess, setAuthSuccess] = useState(false);

  // Playground state
  const [playgroundFilled, setPlaygroundFilled] = useState(false);
  const [playgroundData, setPlaygroundData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    permanentAddress: '',
    annualIncome: '',
    bankAccount: '',
    ifsc: ''
  });

  useEffect(() => {
    // Check URL hash for initial tab
    const hash = window.location.hash.replace('#', '');
    if (['profile', 'sync', 'preferences', 'playground'].includes(hash)) {
      setActiveTab(hash as TabType);
    }

    loadAllData().then(({ profile: p, account: a, preferences: pr }) => {
      setProfile(p);
      setAccount(a);
      setPreferences(pr);
    });
  }, []);

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProfile(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'firstName' || name === 'lastName') {
        const fn = name === 'firstName' ? value : prev.firstName;
        const ln = name === 'lastName' ? value : prev.lastName;
        updated.fullName = `${fn} ${ln}`.trim();
      }
      return updated;
    });
  };

  const handlePreferencesChange = (name: keyof UserPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveAll = async () => {
    setIsSyncing(true);
    await saveProfile(profile);
    await savePreferences(preferences);
    const updatedAccount = { ...account, lastSynced: new Date().toISOString() };
    await saveAccount(updatedAccount);
    setAccount(updatedAccount);

    setTimeout(() => {
      setIsSyncing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, 400);
  };

  const copyCorrespondenceFromPermanent = () => {
    setProfile(prev => ({
      ...prev,
      correspondenceAddress: prev.permanentAddress
    }));
  };

  const handleCopySyncCode = () => {
    navigator.clipboard.writeText(account.syncCode);
    setCopiedSyncCode(true);
    setTimeout(() => setCopiedSyncCode(false), 2000);
  };

  const handleExportBackup = () => {
    const json = exportCloudPayload(profile, account, preferences);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `formeasy-vault-${account.email.split('@')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const content = evt.target?.result as string;
      const success = await importCloudPayload(content);
      if (success) {
        const refreshed = await loadAllData();
        setProfile(refreshed.profile);
        setAccount(refreshed.account);
        setPreferences(refreshed.preferences);
        alert('Cloud profile successfully restored!');
      } else {
        alert('Invalid backup file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleAccountLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail) return;

    const result = await loginOrRegisterAccount(authEmail, authName);
    if (result.success) {
      setAccount(result.account);
      setProfile(result.profile);
      setAuthSuccess(true);
      setTimeout(() => {
        setAuthSuccess(false);
        setShowAuthModal(false);
      }, 1000);
    }
  };

  const handlePlaygroundFill = () => {
    setPlaygroundData({
      fullName: profile.fullName || `${profile.firstName} ${profile.lastName}`.trim(),
      email: profile.email,
      phone: profile.phone,
      dob: profile.dob,
      gender: profile.gender,
      permanentAddress: profile.permanentAddress,
      annualIncome: profile.annualIncome,
      bankAccount: profile.bankAccount,
      ifsc: profile.ifsc
    });
    setPlaygroundFilled(true);
  };

  const handlePlaygroundClear = () => {
    setPlaygroundData({
      fullName: '',
      email: '',
      phone: '',
      dob: '',
      gender: '',
      permanentAddress: '',
      annualIncome: '',
      bankAccount: '',
      ifsc: ''
    });
    setPlaygroundFilled(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">FormEasy</span>
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                  Review 3 Edition
                </span>
              </div>
              <p className="text-xs text-slate-500">Universal Form Filling & Cloud Identity Vault</p>
            </div>
          </div>

          {/* Account Sync Pill & Primary Save Action */}
          <div className="flex items-center gap-4">
            {/* Account Status Pill */}
            <div 
              onClick={() => setActiveTab('sync')} 
              className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full cursor-pointer hover:bg-emerald-100 transition-colors"
              title="Click to view cross-device sync status"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-semibold text-emerald-800">
                {account.email}
              </span>
              <span className="text-[11px] text-emerald-600 bg-emerald-100/60 px-1.5 py-0.5 rounded-full font-medium">
                {account.devices.length} Devices Synced
              </span>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveAll}
              disabled={isSyncing}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] text-white font-semibold text-sm rounded-lg shadow-sm shadow-blue-500/30 transition-all"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Syncing...</span>
                </>
              ) : saved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Saved to Cloud!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </>
              )}
            </button>

            {/* Account Switcher Button */}
            <button
              onClick={() => {
                setAuthEmail(account.email);
                setAuthName(account.name);
                setShowAuthModal(true);
              }}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              title="Switch or Link Account"
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-6 flex space-x-1 border-t border-slate-100">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Form Details</span>
          </button>

          <button
            onClick={() => setActiveTab('sync')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'sync'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Multi-Device Sync ({account.devices.length})</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </button>

          <button
            onClick={() => setActiveTab('preferences')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'preferences'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Autofill Preferences</span>
          </button>

          <button
            onClick={() => setActiveTab('playground')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'playground'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Test Form Playground</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 pt-8">
        {/* ========================================================================= */}
        {/* TAB 1: PROFILE & FORM DETAILS */}
        {/* ========================================================================= */}
        {activeTab === 'profile' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Banner */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <span>Your Personal Identity Vault</span>
                  <span className="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-800 rounded-md font-semibold">
                    Synced across any device
                  </span>
                </h2>
                <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                  Fill in your official details once. Whenever you visit college admissions, scholarship portals, government schemes, or job applications, FormEasy will automatically detect the fields and fill them in 1 click!
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveAll}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save All Changes</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* SECTION A: Basic Personal Details */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <User className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-base text-slate-900">1. Basic Personal Information</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={profile.firstName}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={profile.lastName}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name (As per 10th / Aadhaar record)
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={profile.fullName || `${profile.firstName} ${profile.lastName}`.trim()}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile / Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      name="dob"
                      value={profile.dob}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                    <select
                      name="gender"
                      value={profile.gender}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                    <input
                      type="text"
                      name="bloodGroup"
                      placeholder="e.g. O+"
                      value={profile.bloodGroup}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nationality</label>
                    <input
                      type="text"
                      name="nationality"
                      value={profile.nationality}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Marital Status</label>
                    <select
                      name="maritalStatus"
                      value={profile.maritalStatus}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    >
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION B: Family & Guardian Information */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-base text-slate-900">2. Family & Guardian Information</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Father's Name</label>
                    <input
                      type="text"
                      name="fathersName"
                      value={profile.fathersName}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mother's Name</label>
                    <input
                      type="text"
                      name="mothersName"
                      value={profile.mothersName}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Legal Guardian Name</label>
                    <input
                      type="text"
                      name="guardianName"
                      value={profile.guardianName || ''}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nominee Name</label>
                    <input
                      type="text"
                      name="nominee"
                      value={profile.nominee || ''}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Identification / Gov Numbers */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Official Identification Numbers
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowMaskedAadhaar(!showMaskedAadhaar)}
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                    >
                      {showMaskedAadhaar ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showMaskedAadhaar ? 'Hide Numbers' : 'View Numbers'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Aadhaar / SSN / National ID
                      </label>
                      <input
                        type={showMaskedAadhaar ? 'text' : 'password'}
                        name="aadhaarNumber"
                        value={profile.aadhaarNumber}
                        onChange={handleProfileChange}
                        placeholder="12-digit number"
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        PAN / Tax ID Number
                      </label>
                      <input
                        type={showMaskedAadhaar ? 'text' : 'password'}
                        name="panNumber"
                        value={profile.panNumber}
                        onChange={handleProfileChange}
                        placeholder="ABCDE1234F"
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono uppercase transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION C: Address & Location */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Home className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-bold text-base text-slate-900">3. Address & Location</h3>
                  </div>
                  <button
                    type="button"
                    onClick={copyCorrespondenceFromPermanent}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200"
                  >
                    Same as Permanent
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Permanent Address *</label>
                  <textarea
                    rows={2}
                    name="permanentAddress"
                    value={profile.permanentAddress}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Correspondence / Current Address *
                  </label>
                  <textarea
                    rows={2}
                    name="correspondenceAddress"
                    value={profile.correspondenceAddress}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">City / District</label>
                    <input
                      type="text"
                      name="city"
                      value={profile.city}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">State / Province</label>
                    <input
                      type="text"
                      name="state"
                      value={profile.state}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Pincode / ZIP</label>
                    <input
                      type="text"
                      name="pincode"
                      value={profile.pincode}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION D: Academic, Professional & Banking */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <GraduationCap className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-base text-slate-900">4. Academic & Banking Details</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Highest Qualification</label>
                    <input
                      type="text"
                      name="highestQualification"
                      value={profile.highestQualification || ''}
                      onChange={handleProfileChange}
                      placeholder="e.g. B.Tech / M.Sc"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Registration / Roll No</label>
                    <input
                      type="text"
                      name="registrationNumber"
                      value={profile.registrationNumber || ''}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">College / University</label>
                    <input
                      type="text"
                      name="institution"
                      value={profile.institution || ''}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Occupation</label>
                    <input
                      type="text"
                      name="occupation"
                      value={profile.occupation || ''}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Financial Section */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-slate-600" />
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Banking & Financial Details
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Account Number</label>
                      <input
                        type="text"
                        name="bankAccount"
                        value={profile.bankAccount}
                        onChange={handleProfileChange}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">IFSC / Routing Code</label>
                      <input
                        type="text"
                        name="ifsc"
                        value={profile.ifsc}
                        onChange={handleProfileChange}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono uppercase transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Family Income (INR)</label>
                    <input
                      type="text"
                      name="annualIncome"
                      value={profile.annualIncome}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MULTI-DEVICE SYNC & ACCOUNT (The highlight of Review 3) */}
        {/* ========================================================================= */}
        {activeTab === 'sync' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Account Overview Card */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-blue-500/30">
                  {account.name ? account.name.charAt(0) : 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-slate-900">{account.name}</h2>
                    <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Cloud Connected
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">{account.email}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Last Synced: {new Date(account.lastSynced).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveAll}
                  disabled={isSyncing}
                  className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs rounded-lg border border-blue-200 flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Sync Now</span>
                </button>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Switch Account</span>
                </button>
              </div>
            </div>

            {/* How Multi-Device Cloud Sync Works Explainer */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <Cloud className="w-6 h-6 text-sky-400" />
                <h3 className="text-lg font-bold">How Any-Device Automatic Sync Works</h3>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed max-w-3xl mb-6">
                Whenever you use FormEasy on another device (such as a college desktop, a personal laptop, or another computer), simply log into your FormEasy account or Chrome account. All your stored personal details, financial records, and autofill rules are securely retrieved and ready to autofill any form instantaneously!
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-700/80">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-sky-400 shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Save Once</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Save your profile details into the FormEasy Vault on any machine.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-sky-400 shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Cloud Synchronized</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Data is replicated across `chrome.storage.sync` and FormEasy Cloud Vault.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-sky-400 shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Autofill Anywhere</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Open any application form on any device. FormEasy fills it automatically!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Connected Devices Grid */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-base text-slate-900">Connected Devices ({account.devices.length})</h3>
                </div>
                <span className="text-xs text-slate-500 font-medium">All devices synced in real-time</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {account.devices.map(dev => (
                  <div
                    key={dev.id}
                    className={`p-4 rounded-xl border transition-all ${
                      dev.isCurrent
                        ? 'border-blue-500 bg-blue-50/40 shadow-sm'
                        : 'border-slate-200 bg-slate-50 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                        {dev.type === 'laptop' ? (
                          <Laptop className="w-5 h-5 text-blue-600" />
                        ) : dev.type === 'desktop' ? (
                          <Monitor className="w-5 h-5 text-indigo-600" />
                        ) : (
                          <Smartphone className="w-5 h-5 text-emerald-600" />
                        )}
                      </div>
                      {dev.isCurrent ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-600 text-white rounded-full">
                          This Device
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-700 rounded-full">
                          Synced
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-sm text-slate-900">{dev.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{dev.browser}</div>
                    <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>{dev.lastActive}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instant Cross-Device Demo Token & Backup Tools */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Quick Sync Code Generator */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-base text-slate-900">Cross-Device Sync Code</h3>
                </div>
                <p className="text-xs text-slate-600">
                  Use this unique Sync Code to immediately connect another browser or test session to this exact profile during your review presentation.
                </p>

                <div className="flex items-center gap-2">
                  <div className="flex-1 px-4 py-2.5 bg-slate-100 border border-slate-300 rounded-lg font-mono text-sm font-bold text-slate-800 tracking-wider">
                    {account.syncCode}
                  </div>
                  <button
                    onClick={handleCopySyncCode}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    {copiedSyncCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedSyncCode ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>

              {/* Cloud Vault Backup & Import */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-base text-slate-900">Cloud Vault Backup & Restore</h3>
                </div>
                <p className="text-xs text-slate-600">
                  Export an encrypted JSON snapshot of your data or load an existing profile snapshot on any computer.
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleExportBackup}
                    className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg border border-slate-300 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Vault JSON</span>
                  </button>

                  <label className="flex-1 py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-lg border border-blue-200 flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Import Vault JSON</span>
                    <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: AUTOFILL PREFERENCES & RULES */}
        {/* ========================================================================= */}
        {activeTab === 'preferences' && (
          <div className="space-y-8 animate-fadeIn max-w-4xl">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="font-bold text-lg text-slate-900">Automatic Form Filling Rules</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Customize how aggressively FormEasy fills out forms when navigating online.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <div className="font-semibold text-sm text-slate-900">Auto-fill on Field Focus</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Automatically populate matching saved data as soon as you click into any empty field.
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.autoFillOnFocus}
                      onChange={e => handlePreferencesChange('autoFillOnFocus', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <div className="font-semibold text-sm text-slate-900">Floating FormEasy Assistant Widget</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Show the 1-click "⚡ Auto-Fill Form" pill in the corner of web pages containing forms.
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.showFloatingWidget}
                      onChange={e => handlePreferencesChange('showFloatingWidget', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <div className="font-semibold text-sm text-slate-900">Auto-fill Entire Form upon Page Load</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Instantly fills all recognized form fields as soon as an eligible page finishes loading.
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.autoFillPageOnLoad}
                      onChange={e => handlePreferencesChange('autoFillPageOnLoad', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Gemini AI Settings */}
              <div className="pt-6 border-t border-slate-200 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <h4 className="font-bold text-base text-slate-900">Google Gemini AI Assistance</h4>
                </div>
                <p className="text-xs text-slate-500">
                  FormEasy uses Google Gemini 2.5 Flash to decipher ambiguous government form jargon (like domicile, cadastral, issuing authority, nominee clauses) in plain language.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Google Gemini API Key
                  </label>
                  <input
                    type="password"
                    value={preferences.geminiApiKey}
                    onChange={e => handlePreferencesChange('geminiApiKey', e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: LIVE INTERACTIVE TEST PLAYGROUND */}
        {/* ========================================================================= */}
        {activeTab === 'playground' && (
          <div className="space-y-6 animate-fadeIn max-w-4xl">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <h3 className="font-bold text-lg text-slate-900">Live Auto-Fill Demonstration</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Test the automatic fill feature directly inside the dashboard to demonstrate for the 3rd Review committee!
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {playgroundFilled && (
                    <button
                      onClick={handlePlaygroundClear}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all"
                    >
                      Reset Form
                    </button>
                  )}
                  <button
                    onClick={handlePlaygroundFill}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all transform active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>⚡ Test 1-Click Auto-Fill</span>
                  </button>
                </div>
              </div>

              {playgroundFilled && (
                <div className="my-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>All 10 matching fields successfully filled from your active account ({account.email})!</span>
                </div>
              )}

              {/* Sample University Scholarship Form */}
              <div className="mt-6 space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-2">
                  Sample: National Merit Scholarship Application
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      id="pg-fullname"
                      value={playgroundData.fullName}
                      onChange={e => setPlaygroundData(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="Applicant full name"
                      className={`w-full px-3 py-2 text-sm bg-white border rounded-lg transition-all ${
                        playgroundFilled ? 'border-emerald-500 ring-2 ring-emerald-100 bg-emerald-50/20 font-medium' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      id="pg-email"
                      value={playgroundData.email}
                      onChange={e => setPlaygroundData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Official email"
                      className={`w-full px-3 py-2 text-sm bg-white border rounded-lg transition-all ${
                        playgroundFilled ? 'border-emerald-500 ring-2 ring-emerald-100 bg-emerald-50/20 font-medium' : 'border-slate-300'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      id="pg-phone"
                      value={playgroundData.phone}
                      onChange={e => setPlaygroundData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="10-digit number"
                      className={`w-full px-3 py-2 text-sm bg-white border rounded-lg transition-all ${
                        playgroundFilled ? 'border-emerald-500 ring-2 ring-emerald-100 bg-emerald-50/20 font-medium' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      id="pg-dob"
                      value={playgroundData.dob}
                      onChange={e => setPlaygroundData(prev => ({ ...prev, dob: e.target.value }))}
                      className={`w-full px-3 py-2 text-sm bg-white border rounded-lg transition-all ${
                        playgroundFilled ? 'border-emerald-500 ring-2 ring-emerald-100 bg-emerald-50/20 font-medium' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                    <select
                      id="pg-gender"
                      value={playgroundData.gender}
                      onChange={e => setPlaygroundData(prev => ({ ...prev, gender: e.target.value }))}
                      className={`w-full px-3 py-2 text-sm bg-white border rounded-lg transition-all ${
                        playgroundFilled ? 'border-emerald-500 ring-2 ring-emerald-100 bg-emerald-50/20 font-medium' : 'border-slate-300'
                      }`}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Permanent Address</label>
                    <input
                      type="text"
                      id="pg-address"
                      value={playgroundData.permanentAddress}
                      onChange={e => setPlaygroundData(prev => ({ ...prev, permanentAddress: e.target.value }))}
                      placeholder="Street, locality, house no"
                      className={`w-full px-3 py-2 text-sm bg-white border rounded-lg transition-all ${
                        playgroundFilled ? 'border-emerald-500 ring-2 ring-emerald-100 bg-emerald-50/20 font-medium' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Family Income</label>
                    <input
                      type="text"
                      id="pg-income"
                      value={playgroundData.annualIncome}
                      onChange={e => setPlaygroundData(prev => ({ ...prev, annualIncome: e.target.value }))}
                      placeholder="e.g. 650000"
                      className={`w-full px-3 py-2 text-sm bg-white border rounded-lg transition-all ${
                        playgroundFilled ? 'border-emerald-500 ring-2 ring-emerald-100 bg-emerald-50/20 font-medium' : 'border-slate-300'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Account Number</label>
                    <input
                      type="text"
                      id="pg-account"
                      value={playgroundData.bankAccount}
                      onChange={e => setPlaygroundData(prev => ({ ...prev, bankAccount: e.target.value }))}
                      placeholder="Bank account"
                      className={`w-full px-3 py-2 text-sm bg-white border rounded-lg font-mono transition-all ${
                        playgroundFilled ? 'border-emerald-500 ring-2 ring-emerald-100 bg-emerald-50/20 font-medium' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">IFSC Code</label>
                    <input
                      type="text"
                      id="pg-ifsc"
                      value={playgroundData.ifsc}
                      onChange={e => setPlaygroundData(prev => ({ ...prev, ifsc: e.target.value }))}
                      placeholder="IFSC"
                      className={`w-full px-3 py-2 text-sm bg-white border rounded-lg font-mono uppercase transition-all ${
                        playgroundFilled ? 'border-emerald-500 ring-2 ring-emerald-100 bg-emerald-50/20 font-medium' : 'border-slate-300'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* AUTHENTICATION / ACCOUNT MODAL */}
      {/* ========================================================================= */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">Sign in to FormEasy Account</h3>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 my-3">
              Log into your account on this device. All your saved profile records will sync across any machine automatically.
            </p>

            <form onSubmit={handleAccountLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Account Email</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={e => setAuthEmail(e.target.value)}
                  placeholder="your.email@university.edu"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={authName}
                  onChange={e => setAuthName(e.target.value)}
                  placeholder="e.g. Sharangosh Reddy"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password / Security PIN</label>
                <input
                  type="password"
                  defaultValue="••••••••"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {authSuccess && (
                <div className="p-2 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Account authenticated and synced!</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                >
                  Sign In & Sync Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<Dashboard />);
