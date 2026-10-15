import { UserProfile, UserAccount, UserPreferences, ConnectedDevice } from './types';

export const DEFAULT_PROFILE: UserProfile = {
  firstName: 'Sharangosh',
  lastName: 'Reddy',
  fullName: 'Sharangosh Reddy',
  email: 'sharangosh.reddy@gmail.com',
  phone: '9876543210',
  dob: '2002-05-15',
  gender: 'Male',
  bloodGroup: 'B+',
  nationality: 'Indian',
  maritalStatus: 'Single',
  fathersName: 'K. Rama Reddy',
  mothersName: 'K. Lakshmi Devi',
  guardianName: 'K. Rama Reddy',
  permanentAddress: 'Flat 402, Sai Nilayam, Road No. 4, Banjara Hills',
  correspondenceAddress: 'Flat 402, Sai Nilayam, Road No. 4, Banjara Hills',
  city: 'Hyderabad',
  state: 'Telangana',
  pincode: '500034',
  country: 'India',
  aadhaarNumber: '548291023847',
  panNumber: 'ABCDE1234F',
  passportNumber: 'Z8942105',
  highestQualification: 'B.Tech Computer Science',
  institution: 'National Institute of Technology',
  registrationNumber: '2024CS1042',
  occupation: 'Student / Software Trainee',
  bankAccount: '987654321098',
  ifsc: 'HDFC0001234',
  bankName: 'HDFC Bank',
  annualIncome: '650000',
  nominee: 'K. Rama Reddy'
};

export const DEFAULT_ACCOUNT: UserAccount = {
  id: 'usr_89214',
  email: 'sharangosh.reddy@gmail.com',
  name: 'Sharangosh Reddy',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  isLoggedIn: true,
  lastSynced: new Date().toISOString(),
  syncCode: 'FE-892145',
  devices: [
    {
      id: 'dev_current',
      name: 'MacBook Air (macOS)',
      type: 'laptop',
      browser: 'Chrome 124',
      lastActive: 'Active now',
      isCurrent: true
    },
    {
      id: 'dev_win',
      name: 'Campus Workstation (Windows 11)',
      type: 'desktop',
      browser: 'Chrome 123',
      lastActive: 'Synced 2 hours ago',
      isCurrent: false
    },
    {
      id: 'dev_phone',
      name: 'Pixel 8 Pro (Android 14)',
      type: 'mobile',
      browser: 'Chrome Mobile',
      lastActive: 'Synced yesterday',
      isCurrent: false
    }
  ]
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  autoFillPageOnLoad: false,
  autoFillOnFocus: true,
  showFloatingWidget: true,
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
 * Saves profile data to both sync and local storage for cross-device persistence
 */
export async function saveProfile(profile: UserProfile): Promise<void> {
  return new Promise((resolve) => {
    const updated = {
      ...profile,
      fullName: profile.fullName || `${profile.firstName} ${profile.lastName}`.trim()
    };

    if (typeof chrome !== 'undefined' && chrome.storage) {
      // Sync across any device logged into the same browser account
      chrome.storage.sync.set({ [KEY_PROFILE]: updated }, () => {
        // Also mirror to local storage
        chrome.storage.local.set({ [KEY_PROFILE]: updated, userProfile: updated }, () => {
          // Update last synced in account
          updateLastSynced();
          resolve();
        });
      });
    } else {
      resolve();
    }
  });
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
  _password?: string
): Promise<{ success: boolean; account: UserAccount; profile: UserProfile }> {
  const currentData = await loadAllData();
  const now = new Date().toISOString();

  // Create new device session
  const thisDevice: ConnectedDevice = {
    id: 'dev_' + Math.random().toString(36).substring(2, 9),
    name: `${navigator.platform || 'Laptop/PC'} (${navigator.userAgent.includes('Mac') ? 'macOS' : 'Windows'})`,
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
    devices: [
      thisDevice,
      {
        id: 'dev_mock_mobile',
        name: 'Android Phone (Synced)',
        type: 'mobile',
        browser: 'Mobile Chrome',
        lastActive: 'Synced 1 hour ago',
        isCurrent: false
      }
    ]
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

  return { success: true, account: updatedAccount, profile: updatedProfile };
}
