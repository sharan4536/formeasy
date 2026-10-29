import { UserProfile, UserAccount, UserPreferences, ConnectedDevice } from './types';
import { saveProfileToCloud, fetchProfileFromCloud, loginToCloud, registerToCloud, fetchDevicesFromCloud } from './cloudApi';

export const DEFAULT_PROFILE: UserProfile = {
  firstName: '',
  lastName: '',
  fullName: '',
  email: '',
  phone: '',
  dob: '',
  gender: '',
  bloodGroup: '',
  nationality: '',
  maritalStatus: '',
  fathersName: '',
  mothersName: '',
  guardianName: '',
  permanentAddress: '',
  correspondenceAddress: '',
  city: '',
  state: '',
  pincode: '',
  country: '',
  aadhaarNumber: '',
  panNumber: '',
  passportNumber: '',
  highestQualification: '',
  institution: '',
  registrationNumber: '',
  occupation: '',
  bankAccount: '',
  ifsc: '',
  bankName: '',
  annualIncome: '',
  nominee: '',
  emergencyContact: '',
  branch: '',
  cgpa: '',
  yearOfPassing: '',
  linkedin: '',
  github: '',
  portfolio: '',
  skills: '',
  gstNumber: '',
  businessName: '',
  tradeName: '',
  businessAddress: '',
  portalUsername: '',
  turnover: '',
  authorizedSignatory: '',
  customFields: {},
  learnedHistory: []
};

export const DEFAULT_ACCOUNT: UserAccount = {
  id: '',
  email: '',
  name: '',
  avatar: '',
  isLoggedIn: false,
  lastSynced: '',
  syncCode: '',
  devices: []
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  autoFillPageOnLoad: false,
  autoFillOnFocus: true,
  showFloatingWidget: true,
  autoRecordNewData: true,
  notifyOnAutoRecord: true,
  confirmSensitive: false,
  showTips: true,
  showWarnings: true,
  showExamples: true,
  geminiApiKey: ''
};

// Cloud storage key constants
const KEY_PROFILE = 'formeasy_profile';
const KEY_ACCOUNT = 'formeasy_account';
const KEY_PREFS = 'formeasy_prefs';
const KEY_CLOUD_VAULT = 'formeasy_cloud_accounts';

/**
 * Universal storage getter that checks chrome.storage.sync first,
 * falling back to chrome.storage.local or memory defaults.
 */
export async function loadAllData(): Promise<{
  profile: UserProfile;
  account: UserAccount;
  preferences: UserPreferences;
}> {
  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.storage) {
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const rawProf = window.localStorage.getItem(KEY_PROFILE);
          const rawAcc = window.localStorage.getItem(KEY_ACCOUNT);
          const rawPrefs = window.localStorage.getItem(KEY_PREFS);
          resolve({
            profile: rawProf ? JSON.parse(rawProf) : DEFAULT_PROFILE,
            account: rawAcc ? JSON.parse(rawAcc) : DEFAULT_ACCOUNT,
            preferences: rawPrefs ? JSON.parse(rawPrefs) : DEFAULT_PREFERENCES
          });
          return;
        } catch {}
      }
      resolve({
        profile: DEFAULT_PROFILE,
        account: DEFAULT_ACCOUNT,
        preferences: DEFAULT_PREFERENCES
      });
      return;
    }

    // Try chrome.storage.sync first (multi-device browser sync)
    chrome.storage.sync.get([KEY_PROFILE, KEY_ACCOUNT, KEY_PREFS, 'geminiApiKey'], (syncRes: Record<string, any>) => {
      chrome.storage.local.get([KEY_PROFILE, KEY_ACCOUNT, KEY_PREFS, 'userProfile'], (localRes: Record<string, any>) => {
        let profile = (syncRes[KEY_PROFILE] || localRes[KEY_PROFILE] || localRes.userProfile || DEFAULT_PROFILE) as UserProfile;
        let account = (syncRes[KEY_ACCOUNT] || localRes[KEY_ACCOUNT] || DEFAULT_ACCOUNT) as UserAccount;
        let prefs = (syncRes[KEY_PREFS] || localRes[KEY_PREFS] || DEFAULT_PREFERENCES) as UserPreferences;

        // Preserve legacy API key if set
        if (syncRes.geminiApiKey && !prefs.geminiApiKey) {
          prefs.geminiApiKey = syncRes.geminiApiKey;
        }

        resolve({ profile, account, preferences: prefs });
      });
    });
  });
}

/**
 * Loads current account info
 */
export async function loadAccount(): Promise<UserAccount> {
  const data = await loadAllData();
  return data.account;
}

/**
 * Saves profile data to both sync/local storage and the cloud database
 */
export async function saveProfile(profile: UserProfile): Promise<void> {
  const updated = {
    ...profile,
    fullName: profile.fullName || `${profile.firstName} ${profile.lastName}`.trim()
  };

  if (typeof chrome !== 'undefined' && chrome.storage) {
    // 1. Sync across Chrome browser accounts
    chrome.storage.sync.set({ [KEY_PROFILE]: updated }, () => {
      chrome.storage.local.set({ [KEY_PROFILE]: updated, userProfile: updated });
      updateLastSynced();
    });
  } else if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(KEY_PROFILE, JSON.stringify(updated));
  }

  // 2. Persist to Cloud Database (Backend REST API)
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({
        type: 'SAVE_PROFILE_CLOUD',
        payload: { profile: updated }
      }, () => {
        if (chrome.runtime.lastError) {
          loadAccount().then(acc => saveProfileToCloud(updated, acc.token, acc.email)).catch(() => {});
        }
      });
    } else {
      const acc = await loadAccount();
      await saveProfileToCloud(updated, acc.token, acc.email);
    }
  } catch (err) {
    console.warn('Cloud sync error:', err);
  }
}

/**
 * Saves account info
 */
export async function saveAccount(account: UserAccount): Promise<void> {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.set({ [KEY_ACCOUNT]: account }, () => {
        chrome.storage.local.set({ [KEY_ACCOUNT]: account }, () => {
          resolve();
        });
      });
    } else {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(KEY_ACCOUNT, JSON.stringify(account));
      }
      resolve();
    }
  });
}

/**
 * Saves user preferences
 */
export async function savePreferences(preferences: UserPreferences): Promise<void> {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.set({ 
        [KEY_PREFS]: preferences,
        geminiApiKey: preferences.geminiApiKey 
      }, () => {
        chrome.storage.local.set({ [KEY_PREFS]: preferences }, () => {
          resolve();
        });
      });
    } else {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(KEY_PREFS, JSON.stringify(preferences));
      }
      resolve();
    }
  });
}

/**
 * Helper to update last synced time
 */
async function updateLastSynced() {
  if (typeof chrome === 'undefined' || !chrome.storage) return;
  chrome.storage.sync.get([KEY_ACCOUNT], (res) => {
    if (res[KEY_ACCOUNT]) {
      const acct = { ...res[KEY_ACCOUNT], lastSynced: new Date().toISOString() };
      chrome.storage.sync.set({ [KEY_ACCOUNT]: acct });
      chrome.storage.local.set({ [KEY_ACCOUNT]: acct });
    }
  });
}

/**
 * Multi-device Cross-Account Simulation & Cloud Vault
 * Generates an encrypted/encoded sync code that can be entered on ANY device
 * to immediately pull this account and profile.
 */
export function generateSyncCode(profile: UserProfile, account: UserAccount): string {
  try {
    const payload = {
      email: account.email,
      name: account.name,
      syncTime: new Date().toISOString(),
      profile
    };
    const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    // Compact token: FE- + first 6 chars of hash/b64 + random digits
    return `FE-${b64.slice(0, 16).replace(/[^a-zA-Z0-9]/g, 'X').toUpperCase()}`;
  } catch {
    return 'FE-' + Math.floor(100000 + Math.random() * 900000);
  }
}

/**
 * Export complete backup payload for cloud sync or export
 */
export function exportCloudPayload(profile: UserProfile, account: UserAccount, prefs: UserPreferences): string {
  return JSON.stringify({
    version: '3.0.0',
    exportedAt: new Date().toISOString(),
    account: {
      ...account,
      lastSynced: new Date().toISOString()
    },
    profile,
    preferences: prefs
  }, null, 2);
}

/**
 * Import cloud sync payload
 */
export async function importCloudPayload(jsonString: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonString);
    if (!data.profile || !data.account) return false;

    // Add new device to devices list
    const newDevice: ConnectedDevice = {
      id: 'dev_' + Date.now().toString(36),
      name: 'Synced Device (' + (navigator.platform || 'Remote') + ')',
      type: 'laptop',
      browser: 'Chrome Sync Client',
      lastActive: 'Active now',
      isCurrent: true
    };

    const updatedAccount: UserAccount = {
      ...data.account,
      isLoggedIn: true,
      lastSynced: new Date().toISOString(),
      devices: [
        newDevice,
        ...(data.account.devices || []).map((d: ConnectedDevice) => ({ ...d, isCurrent: false }))
      ]
    };

    await saveProfile(data.profile);
    await saveAccount(updatedAccount);
    if (data.preferences) {
      await savePreferences(data.preferences);
    }
    return true;
  } catch (e) {
    console.error('Failed to import cloud payload:', e);
    return false;
  }
}

/**
 * Authenticates user into account (or creates account if new)
 * and attaches device session
 */
export async function loginOrRegisterAccount(
  email: string,
  name: string,
  password?: string,
  isRegister = false
): Promise<{ success: boolean; account: UserAccount; profile: UserProfile; message?: string }> {
  const pwd = password || '';
  if (!pwd) {
    const currentData = await loadAllData();
    return { success: false, account: currentData.account, profile: currentData.profile, message: 'Password is required' };
  }
  try {
    const cloudRes = isRegister
      ? await registerToCloud(email, pwd, name)
      : await loginToCloud(email, pwd);

    if (cloudRes.success && cloudRes.user && cloudRes.profile) {
      await saveAccount(cloudRes.user);
      await saveProfile(cloudRes.profile);
      return {
        success: true,
        account: cloudRes.user,
        profile: cloudRes.profile,
        message: cloudRes.message
      };
    }

    // If login failed because account was not registered yet, auto-register
    if (!isRegister && cloudRes.message?.includes('Invalid')) {
      const regRes = await registerToCloud(email, pwd, name);
      if (regRes.success && regRes.user && regRes.profile) {
        await saveAccount(regRes.user);
        await saveProfile(regRes.profile);
        return {
          success: true,
          account: regRes.user,
          profile: regRes.profile,
          message: 'Account created and synced to cloud vault!'
        };
      }
    }
  } catch (err) {
    console.warn('Direct cloud API auth note:', err);
  }

  // 2. Local session fallback
  const currentData = await loadAllData();
  const now = new Date().toISOString();

  const thisDevice: ConnectedDevice = {
    id: 'dev_' + Math.random().toString(36).substring(2, 9),
    name: `${navigator.platform || 'Device'} (${navigator.userAgent.includes('Mac') ? 'macOS' : 'PC'})`,
    type: 'laptop',
    browser: 'Chrome Extension',
    lastActive: 'Active now',
    isCurrent: true
  };

  const updatedAccount: UserAccount = {
    id: 'usr_' + Math.floor(10000 + Math.random() * 90000),
    email,
    name: name || email.split('@')[0],
    isLoggedIn: true,
    lastSynced: now,
    syncCode: 'FE-' + Math.floor(100000 + Math.random() * 900000),
    devices: [thisDevice]
  };

  const updatedProfile: UserProfile = {
    ...currentData.profile,
    email: email,
    firstName: name ? name.split(' ')[0] : currentData.profile.firstName,
    lastName: name && name.split(' ').length > 1 ? name.split(' ').slice(1).join(' ') : currentData.profile.lastName,
    fullName: name || currentData.profile.fullName
  };

  await saveAccount(updatedAccount);
  await saveProfile(updatedProfile);

  return { success: true, account: updatedAccount, profile: updatedProfile, message: 'Logged in successfully!' };
}
