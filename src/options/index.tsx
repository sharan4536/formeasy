import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import { UserPreferences, UserAccount } from '../utils/types';
import { loadAllData, savePreferences, DEFAULT_PREFERENCES, DEFAULT_ACCOUNT } from '../utils/storage';
import { Sparkles, Save, Check, Key, Sliders, Shield, Cloud, Smartphone } from 'lucide-react';

const Options = () => {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [account, setAccount] = useState<UserAccount>(DEFAULT_ACCOUNT);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadAllData().then(({ preferences: p, account: a }) => {
      setPreferences(p);
      setAccount(a);
    });
  }, []);

  const handleSave = async () => {
    await savePreferences(preferences);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleToggle = (key: keyof UserPreferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-3xl mx-auto p-8 font-sans text-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">FormEasy Settings</h1>
            <p className="text-xs text-slate-500">Configure AI models, auto-fill behaviors, and cloud account sync</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors"
        >
          {saved ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </>
          )}
        </button>
      </div>

      <div className="space-y-6">
        {/* Account Sync Card */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Connected Account & Cloud Sync</h2>
                <p className="text-xs text-slate-500">
                  {account.isLoggedIn && account.email ? (
                    <>Logged in as <span className="font-semibold text-slate-800">{account.email}</span> • {account.devices?.length || 0} devices connected</>
                  ) : (
                    <>Not signed in • Local vault active</>
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (typeof chrome !== 'undefined' && chrome.tabs) {
                  chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html#sync') });
                }
              }}
              className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Manage Devices</span>
            </button>
          </div>
        </section>

        {/* AI API Key Section */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Key className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Google Gemini AI Engine</h2>
          </div>
          <p className="text-xs text-slate-500">
            FormEasy uses Gemini 2.5 Flash to automatically interpret complex form field definitions in plain language.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Gemini API Key
            </label>
            <input
              type="password"
              value={preferences.geminiApiKey}
              onChange={(e) => setPreferences({ ...preferences, geminiApiKey: e.target.value })}
              placeholder="AIzaSy..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </section>

        {/* Autofill Behaviors */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">Automatic Filling Behaviors</h2>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-slate-800">Auto-fill on Field Focus</span>
                <p className="text-[11px] text-slate-500">Automatically enter your stored data as soon as an input receives focus.</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.autoFillOnFocus}
                onChange={() => handleToggle('autoFillOnFocus')}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-slate-800">Show Floating Form Assistant</span>
                <p className="text-[11px] text-slate-500">Display the 1-click auto-fill pill on pages with recognized forms.</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.showFloatingWidget}
                onChange={() => handleToggle('showFloatingWidget')}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-slate-800">Auto-fill entire form when page loads</span>
                <p className="text-[11px] text-slate-500">Pre-populates all recognized inputs without requiring a button click.</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.autoFillPageOnLoad}
                onChange={() => handleToggle('autoFillPageOnLoad')}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </label>
          </div>
        </section>

        {/* Guidance Display */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Shield className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">AI Explanations & Advice</h2>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <label className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.showExamples}
                onChange={() => handleToggle('showExamples')}
                className="rounded text-blue-600"
              />
              <span className="font-medium text-slate-700">Show Examples</span>
            </label>

            <label className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.showTips}
                onChange={() => handleToggle('showTips')}
                className="rounded text-blue-600"
              />
              <span className="font-medium text-slate-700">Show Tips</span>
            </label>

            <label className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.showWarnings}
                onChange={() => handleToggle('showWarnings')}
                className="rounded text-blue-600"
              />
              <span className="font-medium text-slate-700">Show Warnings</span>
            </label>
          </div>
        </section>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<Options />);
