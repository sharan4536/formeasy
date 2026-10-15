import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import { UserAccount, UserPreferences } from '../utils/types';
import { loadAllData, savePreferences, DEFAULT_ACCOUNT, DEFAULT_PREFERENCES } from '../utils/storage';
import { Sparkles, Zap, LayoutDashboard, Settings, Smartphone, CheckCircle, RefreshCw } from 'lucide-react';

const Popup = () => {
  const [account, setAccount] = useState<UserAccount>(DEFAULT_ACCOUNT);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [pageStats, setPageStats] = useState<{ total: number; matchable: number }>({ total: 0, matchable: 0 });
  const [isScanning, setIsScanning] = useState(false);
  const [autofillSuccess, setAutofillSuccess] = useState<number | null>(null);

  useEffect(() => {
    loadAllData().then(({ account: a, preferences: p }) => {
      setAccount(a);
      setPreferences(p);
      scanCurrentTab();
    });
  }, []);

  const scanCurrentTab = () => {
    setIsScanning(true);
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_PAGE_STATS' }, (res) => {
            if (res) {
              setPageStats({ total: res.total || 0, matchable: res.matchable || 0 });
            }
            setIsScanning(false);
          });
        } else {
          setIsScanning(false);
        }
      });
    } else {
      setIsScanning(false);
    }
  };

  const handleAutofillPage = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'EXECUTE_AUTOFILL' }, (res) => {
            if (res && res.success) {
              setAutofillSuccess(res.count || 0);
              setTimeout(() => setAutofillSuccess(null), 3000);
            }
          });
        }
      });
    }
  };

  const toggleAutoFillOnFocus = async () => {
    const updated = { ...preferences, autoFillOnFocus: !preferences.autoFillOnFocus };
    setPreferences(updated);
    await savePreferences(updated);
  };

  const openDashboard = (tab?: string) => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      const url = chrome.runtime.getURL('dashboard.html') + (tab ? `#${tab}` : '');
      chrome.tabs.create({ url });
    }
  };

  const openOptions = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime?.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    }
  };

  return (
    <div className="w-80 bg-white border border-gray-200 rounded-xl shadow-lg p-4 font-sans text-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 leading-tight">FormEasy</h1>
            <p className="text-[11px] text-gray-500">Universal Form Assistant</p>
          </div>
        </div>

        {/* Sync Status Badge */}
        <div 
          onClick={() => openDashboard('sync')} 
          className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-[10px] font-medium cursor-pointer hover:bg-emerald-100 transition-colors"
          title="Click to view synced devices"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Synced</span>
        </div>
      </div>

      {/* Account Info Pill */}
      <div className="mt-3 p-2.5 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2 truncate">
          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold uppercase">
            {account.name ? account.name.charAt(0) : 'U'}
          </div>
          <div className="truncate">
            <div className="text-xs font-semibold text-gray-800 truncate">{account.name || 'User Account'}</div>
            <div className="text-[10px] text-gray-500 truncate">{account.email}</div>
          </div>
        </div>
        <button 
          onClick={() => openDashboard('sync')}
          className="text-[10px] text-blue-600 font-medium hover:underline flex items-center gap-1 shrink-0 ml-1"
        >
          <Smartphone className="w-3 h-3" />
          <span>{account.devices.length} dev</span>
        </button>
      </div>

      {/* Page Form Status */}
      <div className="mt-3 p-3 bg-blue-50/60 rounded-lg border border-blue-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-700">Current Webpage</span>
          <button 
            onClick={scanCurrentTab}
            disabled={isScanning} 
            className="text-[10px] text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
          >
            <RefreshCw className={`w-2.5 h-2.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>Scan</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-white p-2 rounded border border-blue-100/80">
            <div className="text-base font-bold text-gray-900">{pageStats.total}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Detected</div>
          </div>
          <div className="bg-white p-2 rounded border border-blue-100/80">
            <div className="text-base font-bold text-blue-600">{pageStats.matchable}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Ready to Fill</div>
          </div>
        </div>
      </div>

      {/* Primary Action: 1-Click Autofill */}
      <div className="mt-3">
        <button
          onClick={handleAutofillPage}
          disabled={pageStats.matchable === 0 && pageStats.total === 0}
          className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {autofillSuccess !== null ? (
            <>
              <CheckCircle className="w-4 h-4 text-emerald-300" />
              <span>Filled {autofillSuccess} Fields!</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Auto-Fill Entire Page</span>
            </>
          )}
        </button>
      </div>

      {/* Quick Preferences Toggle */}
      <div className="mt-3 py-2 border-t border-b border-gray-100 flex items-center justify-between text-xs">
        <span className="text-gray-600 font-medium">Auto-fill on field focus</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={preferences.autoFillOnFocus} 
            onChange={toggleAutoFillOnFocus} 
            className="sr-only peer" 
          />
          <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* Secondary Actions */}
      <div className="mt-3 space-y-1.5">
        <button
          onClick={() => openDashboard()}
          className="w-full py-2 px-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 border border-gray-200 transition-colors"
        >
          <LayoutDashboard className="w-3.5 h-3.5 text-gray-500" />
          <span>Open Dashboard & Vault</span>
        </button>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
        <button onClick={openOptions} className="hover:text-gray-700 flex items-center gap-1">
          <Settings className="w-3 h-3" />
          <span>Settings</span>
        </button>
        <span className="text-[10px] text-emerald-600 font-medium">Cross-Device Ready</span>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<Popup />);
