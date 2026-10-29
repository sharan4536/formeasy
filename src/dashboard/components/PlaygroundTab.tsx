import React, { useState } from 'react';
import { UserProfile, UserAccount } from '../../utils/types';
import { recordFieldChange } from '../../utils/autofill';
import {
  Sparkles,
  Database,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';

interface PlaygroundTabProps {
  profile: UserProfile;
  account: UserAccount;
  onUpdateProfile: (updated: UserProfile) => void;
  onSaveProfile: (updated: UserProfile) => void;
}

export const PlaygroundTab: React.FC<PlaygroundTabProps> = ({
  profile,
  account,
  onUpdateProfile,
  onSaveProfile
}) => {
  const [filled, setFilled] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    permanentAddress: '',
    annualIncome: '',
    bankAccount: '',
    ifsc: '',
    emergencyContact: '',
    linkedin: ''
  });

  const handleTestAutofill = () => {
    setFormData({
      fullName: profile.fullName || `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
      email: profile.email || '',
      phone: profile.phone || '',
      dob: profile.dob || '',
      gender: profile.gender || '',
      permanentAddress: profile.permanentAddress || '',
      annualIncome: profile.annualIncome || '',
      bankAccount: profile.bankAccount || '',
      ifsc: profile.ifsc || '',
      emergencyContact: profile.emergencyContact || '',
      linkedin: profile.linkedin || ''
    });
    setFilled(true);
  };

  const handleClear = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      dob: '',
      gender: '',
      permanentAddress: '',
      annualIncome: '',
      bankAccount: '',
      ifsc: '',
      emergencyContact: '',
      linkedin: ''
    });
    setFilled(false);
  };

  const handleRecordNew = () => {
    let updated = { ...profile };
    let capturedCount = 0;

    for (const [key, val] of Object.entries(formData)) {
      if (val && val.trim().length > 1 && (!profile[key] || profile[key] !== val)) {
        const change = {
          key,
          label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
          oldValue: profile[key] || '',
          newValue: val.trim(),
          isNew: !profile[key],
          isCustom: false
        };
        updated = recordFieldChange(updated, change, 'Playground Demo Form');
        capturedCount++;
      }
    }

    if (capturedCount > 0) {
      onUpdateProfile(updated);
      onSaveProfile(updated);
      setNotice(`Recorded ${capturedCount} entries to your vault.`);
      setTimeout(() => setNotice(null), 3000);
    } else {
      setNotice('No new or changed values detected.');
      setTimeout(() => setNotice(null), 3000);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-lg text-slate-900">Autofill Interactive Demo</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Test one-click autofilling and auto-capture using your active profile vault.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRecordNew}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Database className="w-4 h-4" />
              <span>Capture Entries</span>
            </button>

            {filled && (
              <button
                onClick={handleClear}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}

            <button
              onClick={handleTestAutofill}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>1-Click Autofill</span>
            </button>
          </div>
        </div>

        {notice && (
          <div className="my-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {filled && (
          <div className="my-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Form fields populated from active account ({account.email || 'Local Vault'}).</span>
          </div>
        )}

        {/* Demo Form */}
        <div className="mt-6 space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-2">
            Sample Scholarship Application
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Applicant name"
                className={`w-full px-3 py-2 text-sm bg-white border rounded-lg transition-all ${
                  filled ? 'border-emerald-500 bg-emerald-50/20 font-medium' : 'border-slate-300'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Email address"
                className={`w-full px-3 py-2 text-sm bg-white border rounded-lg transition-all ${
                  filled ? 'border-emerald-500 bg-emerald-50/20 font-medium' : 'border-slate-300'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Mobile number"
                className={`w-full px-3 py-2 text-sm bg-white border rounded-lg transition-all ${
                  filled ? 'border-emerald-500 bg-emerald-50/20 font-medium' : 'border-slate-300'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={formData.dob}
                onChange={e => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                className={`w-full px-3 py-2 text-sm bg-white border rounded-lg transition-all ${
                  filled ? 'border-emerald-500 bg-emerald-50/20 font-medium' : 'border-slate-300'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={e => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                className={`w-full px-3 py-2 text-sm bg-white border rounded-lg transition-all ${
                  filled ? 'border-emerald-500 bg-emerald-50/20 font-medium' : 'border-slate-300'
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
                value={formData.permanentAddress}
                onChange={e => setFormData(prev => ({ ...prev, permanentAddress: e.target.value }))}
                placeholder="Residential address"
                className={`w-full px-3 py-2 text-sm bg-white border rounded-lg transition-all ${
                  filled ? 'border-emerald-500 bg-emerald-50/20 font-medium' : 'border-slate-300'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Income</label>
              <input
                type="text"
                value={formData.annualIncome}
                onChange={e => setFormData(prev => ({ ...prev, annualIncome: e.target.value }))}
                placeholder="e.g. 500000"
                className={`w-full px-3 py-2 text-sm bg-white border rounded-lg transition-all ${
                  filled ? 'border-emerald-500 bg-emerald-50/20 font-medium' : 'border-slate-300'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Account</label>
              <input
                type="text"
                value={formData.bankAccount}
                onChange={e => setFormData(prev => ({ ...prev, bankAccount: e.target.value }))}
                placeholder="Account number"
                className={`w-full px-3 py-2 text-sm bg-white border rounded-lg font-mono transition-all ${
                  filled ? 'border-emerald-500 bg-emerald-50/20 font-medium' : 'border-slate-300'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">IFSC Code</label>
              <input
                type="text"
                value={formData.ifsc}
                onChange={e => setFormData(prev => ({ ...prev, ifsc: e.target.value }))}
                placeholder="IFSC"
                className={`w-full px-3 py-2 text-sm bg-white border rounded-lg font-mono uppercase transition-all ${
                  filled ? 'border-emerald-500 bg-emerald-50/20 font-medium' : 'border-slate-300'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact</label>
              <input
                type="tel"
                value={formData.emergencyContact}
                onChange={e => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                placeholder="10-digit mobile"
                className={`w-full px-3 py-2 text-sm bg-white border rounded-lg transition-all ${
                  filled ? 'border-emerald-500 bg-emerald-50/20 font-medium' : 'border-slate-300'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">LinkedIn Profile</label>
              <input
                type="text"
                value={formData.linkedin}
                onChange={e => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                placeholder="https://linkedin.com/in/..."
                className={`w-full px-3 py-2 text-sm bg-white border rounded-lg transition-all ${
                  filled ? 'border-emerald-500 bg-emerald-50/20 font-medium' : 'border-slate-300'
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
