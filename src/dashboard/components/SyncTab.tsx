import React from 'react';
import { UserAccount } from '../../utils/types';
import {
  Cloud,
  Smartphone,
  Laptop,
  Monitor,
  RefreshCw,
  User,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface SyncTabProps {
  account: UserAccount;
  isSyncing: boolean;
  onSyncNow: () => void;
  onOpenAuthModal: () => void;
}

export const SyncTab: React.FC<SyncTabProps> = ({
  account,
  isSyncing,
  onSyncNow,
  onOpenAuthModal
}) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Account Overview Card */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-blue-500/30">
            {account.name
              ? account.name.charAt(0).toUpperCase()
              : account.email
              ? account.email.charAt(0).toUpperCase()
              : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">
                {account.name || (account.isLoggedIn ? account.email : 'Local Vault (Guest)')}
              </h2>
              <span
                className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border flex items-center gap-1.5 ${
                  account.isLoggedIn
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : 'bg-amber-100 text-amber-800 border-amber-200'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    account.isLoggedIn ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
                {account.isLoggedIn ? 'Cloud Connected' : 'Local Storage Only'}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              {account.email || 'Sign in to access your profile from any browser or device.'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Last Synced:{' '}
              {account.lastSynced ? new Date(account.lastSynced).toLocaleString() : 'Never'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onSyncNow}
            disabled={isSyncing}
            className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs rounded-lg border border-blue-200 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync Now</span>
          </button>
          <button
            onClick={onOpenAuthModal}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
          >
            <User className="w-3.5 h-3.5" />
            <span>{account.isLoggedIn ? 'Switch Account' : 'Sign In / Register'}</span>
          </button>
        </div>
      </div>

      {/* Cloud Sync Architecture Card */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <Cloud className="w-6 h-6 text-sky-400" />
          <h3 className="text-lg font-bold">Multi-Device Synchronization</h3>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed max-w-3xl mb-6">
          FormEasy syncs your profile securely across devices. When using a library computer,
          work laptop, or personal machine, log in to access your identity vault and autofill forms
          instantly.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-700/80">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-sky-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Save Once</h4>
              <p className="text-xs text-slate-400 mt-1">
                Store your verified identity details once in your personal vault.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-sky-400 shrink-0">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Cloud Encrypted</h4>
              <p className="text-xs text-slate-400 mt-1">
                Data is replicated via Chrome Sync and FormEasy Cloud Server.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-sky-400 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Universal Autofill</h4>
              <p className="text-xs text-slate-400 mt-1">
                One-click filling on college, government, and commercial portals.
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
            <h3 className="font-bold text-base text-slate-900">
              Connected Devices ({account.devices?.length || 0})
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">Synced in real-time</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {account.devices && account.devices.length > 0 ? (
            account.devices.map(dev => (
              <div
                key={dev.id}
                className={`p-4 rounded-xl border transition-all ${
                  dev.isCurrent
                    ? 'border-blue-500 bg-blue-50/40 shadow-sm'
                    : 'border-slate-200 bg-slate-50 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
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
                      Current Device
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-700 rounded-full">
                      Synced
                    </span>
                  )}
                </div>
                <div className="font-bold text-sm text-slate-900">{dev.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{dev.browser}</div>
                <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{dev.lastActive}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-8 px-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Smartphone className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <div className="text-xs font-semibold text-slate-700">No external devices connected</div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Sign in on other computers to see them synchronized here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
