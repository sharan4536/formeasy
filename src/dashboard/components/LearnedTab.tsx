import React, { useState } from 'react';
import { UserProfile, UserPreferences } from '../../utils/types';
import { recordFieldChange } from '../../utils/autofill';
import {
  History,
  CheckCircle2,
  Sparkles,
  Database,
  PlusCircle,
  Trash2
} from 'lucide-react';

interface LearnedTabProps {
  profile: UserProfile;
  preferences: UserPreferences;
  onUpdateProfile: (updated: UserProfile) => void;
  onSaveProfile: (updated: UserProfile) => void;
}

export const LearnedTab: React.FC<LearnedTabProps> = ({
  profile,
  preferences,
  onUpdateProfile,
  onSaveProfile
}) => {
  const [simKey, setSimKey] = useState('');
  const [simVal, setSimVal] = useState('');
  const [simSource, setSimSource] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const handleSimulateRecord = () => {
    if (!simKey.trim() || !simVal.trim()) return;

    const change = {
      key: simKey.trim(),
      label: simKey.trim(),
      oldValue: '',
      newValue: simVal.trim(),
      isNew: true,
      isCustom: true
    };

    const updated = recordFieldChange(profile, change, simSource || 'Live Playground Form');
    onUpdateProfile(updated);
    onSaveProfile(updated);

    setNotice(`Auto-recorded "${change.label}" ("${change.newValue}") to vault.`);
    setSimKey('');
    setSimVal('');
    setTimeout(() => setNotice(null), 3500);
  };

  const handleDeleteLearnedItem = (id: string, key: string) => {
    const updatedHistory = (profile.learnedHistory || []).filter(h => h.id !== id);
    const updatedCustom = { ...(profile.customFields || {}) };
    delete updatedCustom[key];

    const updated: UserProfile = {
      ...profile,
      learnedHistory: updatedHistory,
      customFields: updatedCustom
    };

    onUpdateProfile(updated);
    onSaveProfile(updated);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-emerald-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <History className="w-5 h-5" />
              </span>
              <h3 className="font-bold text-lg text-white">Auto-Recorded Information</h3>
            </div>
            <p className="text-xs text-emerald-100/80 max-w-2xl leading-relaxed">
              When you type new details into web forms, FormEasy automatically captures,
              indexes, and synchronizes them to your cloud vault for future one-click autofilling.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl border border-white/15 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-200">
              Auto-Capture: {preferences.autoRecordNewData !== false ? 'Active' : 'Paused'}
            </span>
          </div>
        </div>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notice}</span>
          </div>
          <span className="text-[11px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md font-mono">
            Synced
          </span>
        </div>
      )}

      {/* Simulator Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h4 className="font-bold text-sm text-slate-900">
              Test Entry Simulator
            </h4>
          </div>
          <span className="text-xs text-slate-500">
            Simulate entering new details on an external form
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Field Name / Label
            </label>
            <input
              type="text"
              value={simKey}
              onChange={e => setSimKey(e.target.value)}
              placeholder="e.g. GitHub URL, CGPA, Alt Phone"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Entered Value
            </label>
            <input
              type="text"
              value={simVal}
              onChange={e => setSimVal(e.target.value)}
              placeholder="e.g. https://github.com/alex"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Source Form / Website
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={simSource}
                onChange={e => setSimSource(e.target.value)}
                placeholder="e.g. Admissions Portal"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <button
                onClick={handleSimulateRecord}
                disabled={!simKey.trim() || !simVal.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg shrink-0 flex items-center gap-1.5 transition-all shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Captured Fields List */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            <h4 className="font-bold text-base text-slate-900">
              Auto-Learned Fields ({profile.learnedHistory?.length || 0})
            </h4>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Saved to Vault & Synced
          </span>
        </div>

        {profile.learnedHistory && profile.learnedHistory.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {profile.learnedHistory.map(item => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{item.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Synced
                    </span>
                    <button
                      onClick={() => handleDeleteLearnedItem(item.id, item.key)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs font-mono text-blue-700 break-all select-all">
                  {item.value}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span className="truncate max-w-[200px]" title={item.sourceUrl}>
                    Source: {item.sourceUrl || 'Web Form'}
                  </span>
                  <span>
                    {new Date(item.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 px-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <History className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-800">No Auto-Recorded Fields Yet</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
              When you fill out forms online or use the simulator above, any new information
              will be organized and displayed here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
