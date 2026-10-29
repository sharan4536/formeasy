import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import { UserProfile, UserAccount, UserPreferences } from '../utils/types';
import {
  loadAllData,
  saveProfile,
  savePreferences,
  DEFAULT_PROFILE,
  DEFAULT_ACCOUNT,
  DEFAULT_PREFERENCES
} from '../utils/storage';
import { fetchProfileFromCloud } from '../utils/cloudApi';
import {
  Sparkles,
  Save,
  User,
  Cloud,
  History,
  Sliders,
  Check
} from 'lucide-react';
import { ProfileTab } from './components/ProfileTab';
import { SyncTab } from './components/SyncTab';
import { LearnedTab } from './components/LearnedTab';
import { PreferencesTab } from './components/PreferencesTab';
import { PlaygroundTab } from './components/PlaygroundTab';
import { AuthModal } from './components/AuthModal';

type TabType = 'profile' | 'sync' | 'learned' | 'preferences' | 'playground';

const Dashboard: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [account, setAccount] = useState<UserAccount>(DEFAULT_ACCOUNT);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  const [saved, setSaved] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showMaskedAadhaar, setShowMaskedAadhaar] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '') as TabType;
    if (['profile', 'sync', 'learned', 'preferences', 'playground'].includes(hash)) {
      setActiveTab(hash);
    }

    loadAllData().then(async ({ profile: p, account: a, preferences: pr }) => {
      setProfile(p);
      setAccount(a);
      setPreferences(pr);

      // Attempt background cloud sync if logged in
      if (a.isLoggedIn && a.token) {
        try {
          const cloudRes = await fetchProfileFromCloud(a.token, a.email);
          if (cloudRes.success && cloudRes.profile) {
            setProfile(cloudRes.profile);
            await saveProfile(cloudRes.profile);
          }
        } catch {
          // Fall back gracefully to local storage
        }
      }
    });
  }, []);

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handlePreferenceChange = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveAll = async () => {
    setIsSyncing(true);
    await saveProfile(profile);
    await savePreferences(preferences);
    setIsSyncing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleAuthSuccess = (newAccount: UserAccount, newProfile: UserProfile) => {
    setAccount(newAccount);
    setProfile(newProfile);
  };

  const tabs = [
    { id: 'profile' as TabType, label: 'Identity Vault', icon: User },
    { id: 'sync' as TabType, label: 'Cloud Sync', icon: Cloud },
    { id: 'learned' as TabType, label: 'Captured Data', icon: History },
    { id: 'preferences' as TabType, label: 'Settings', icon: Sliders },
    { id: 'playground' as TabType, label: 'Live Demo', icon: Sparkles }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-slate-900 tracking-tight">FormEasy</span>
                <span className="px-1.5 py-0.5 text-[10px] bg-blue-50 text-blue-700 rounded-md font-semibold border border-blue-200">
                  Assistant
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Universal Form Filling & Vault</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAuthModal(true)}
              className="text-xs text-slate-600 hover:text-slate-900 font-medium px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  account.isLoggedIn ? 'bg-emerald-500' : 'bg-amber-400'
                }`}
              />
              <span className="truncate max-w-[140px]">
                {account.isLoggedIn ? account.name || account.email : 'Local Storage'}
              </span>
            </button>

            <button
              onClick={handleSaveAll}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors"
            >
              {saved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
              <span>{saved ? 'Saved' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-6xl mx-auto px-6">
          <nav className="flex space-x-1 border-t border-slate-100">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    window.location.hash = tab.id;
                  }}
                  className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
                    isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 pt-8">
        {activeTab === 'profile' && (
          <ProfileTab
            profile={profile}
            onChange={handleProfileChange}
            onSave={handleSaveAll}
            showMaskedAadhaar={showMaskedAadhaar}
            onToggleMaskAadhaar={() => setShowMaskedAadhaar(v => !v)}
          />
        )}

        {activeTab === 'sync' && (
          <SyncTab
            account={account}
            isSyncing={isSyncing}
            onSyncNow={handleSaveAll}
            onOpenAuthModal={() => setShowAuthModal(true)}
          />
        )}

        {activeTab === 'learned' && (
          <LearnedTab
            profile={profile}
            preferences={preferences}
            onUpdateProfile={setProfile}
            onSaveProfile={saveProfile}
          />
        )}

        {activeTab === 'preferences' && (
          <PreferencesTab
            preferences={preferences}
            onPreferenceChange={handlePreferenceChange}
            onSave={handleSaveAll}
            saved={saved}
          />
        )}

        {activeTab === 'playground' && (
          <PlaygroundTab
            profile={profile}
            account={account}
            onUpdateProfile={setProfile}
            onSaveProfile={saveProfile}
          />
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<Dashboard />);
