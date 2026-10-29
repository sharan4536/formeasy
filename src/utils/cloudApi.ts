import { UserProfile, UserAccount, ConnectedDevice } from './types';

export const DEFAULT_CLOUD_API = 'http://localhost:5050';

/**
 * Returns the configured cloud API endpoint
 */
export async function getCloudApiEndpoint(): Promise<string> {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.get(['formeasy_cloud_endpoint'], (res: Record<string, any>) => {
        resolve(res?.formeasy_cloud_endpoint || DEFAULT_CLOUD_API);
      });
    } else {
      resolve(DEFAULT_CLOUD_API);
    }
  });
}

/**
 * Sets a custom cloud API endpoint (e.g. deployed cloud server on Render/Railway)
 */
export async function setCloudApiEndpoint(endpoint: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.set({ formeasy_cloud_endpoint: endpoint }, () => resolve());
    } else {
      resolve();
    }
  });
}

/**
 * Health check to verify cloud server connectivity
 */
export async function checkCloudServerHealth(): Promise<boolean> {
  try {
    const base = await getCloudApiEndpoint();
    const res = await fetch(`${base}/api/health`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Logs in with email & password to retrieve user data from the cloud
 */
export async function loginToCloud(
  email: string,
  password: string,
  deviceName?: string
): Promise<{ success: boolean; user?: UserAccount; profile?: UserProfile; message: string }> {
  try {
    const base = await getCloudApiEndpoint();
    const defaultDevice = deviceName || `${navigator.platform || 'Device'} (Chrome)`;

    const res = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        deviceName: defaultDevice
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, message: data.message || 'Login failed' };
    }

    const userAccount: UserAccount = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      isLoggedIn: true,
      token: data.token,
      lastSynced: data.user.lastSynced || new Date().toISOString(),
      syncCode: 'FE-' + Math.floor(100000 + Math.random() * 900000),
      devices: data.user.devices || []
    };

    return {
      success: true,
      user: userAccount,
      profile: data.profile,
      message: 'Logged in successfully! Data synchronized from cloud.'
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Could not reach cloud server: ${err.message || 'Network error'}`
    };
  }
}

/**
 * Registers a new account in the cloud vault
 */
export async function registerToCloud(
  email: string,
  password: string,
  name: string,
  deviceName?: string
): Promise<{ success: boolean; user?: UserAccount; profile?: UserProfile; message: string }> {
  try {
    const base = await getCloudApiEndpoint();
    const defaultDevice = deviceName || `${navigator.platform || 'Device'} (Chrome)`;

    const res = await fetch(`${base}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        name,
        deviceName: defaultDevice
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, message: data.message || 'Registration failed' };
    }

    const userAccount: UserAccount = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      isLoggedIn: true,
      token: data.token,
      lastSynced: data.user.lastSynced || new Date().toISOString(),
      syncCode: 'FE-' + Math.floor(100000 + Math.random() * 900000),
      devices: data.user.devices || []
    };

    return {
      success: true,
      user: userAccount,
      profile: data.profile,
      message: 'Account registered and synced in cloud vault.'
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Could not reach cloud server: ${err.message || 'Network error'}`
    };
  }
}

/**
 * Saves/updates profile in the cloud database
 */
export async function saveProfileToCloud(
  profile: UserProfile,
  token?: string,
  email?: string
): Promise<{ success: boolean; lastSynced?: string; message?: string }> {
  try {
    const base = await getCloudApiEndpoint();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${base}/api/user/profile`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ profile, email })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, lastSynced: data.lastSynced, message: 'Saved to cloud vault!' };
    }
    return { success: false, message: data.message || 'Failed to save to cloud' };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

/**
 * Fetches latest profile from cloud database
 */
export async function fetchProfileFromCloud(
  token?: string,
  email?: string
): Promise<{ success: boolean; profile?: UserProfile; lastSynced?: string }> {
  try {
    const base = await getCloudApiEndpoint();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const url = email ? `${base}/api/user/profile?email=${encodeURIComponent(email)}` : `${base}/api/user/profile`;
    const res = await fetch(url, { method: 'GET', headers });

    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, profile: data.profile, lastSynced: data.lastSynced };
    }
    return { success: false };
  } catch {
    return { success: false };
  }
}

/**
 * Fetches connected devices from the cloud
 */
export async function fetchDevicesFromCloud(
  token?: string,
  email?: string
): Promise<ConnectedDevice[]> {
  try {
    const base = await getCloudApiEndpoint();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const url = email ? `${base}/api/user/devices?email=${encodeURIComponent(email)}` : `${base}/api/user/devices`;
    const res = await fetch(url, { method: 'GET', headers });

    const data = await res.json();
    if (res.ok && data.success && Array.isArray(data.devices)) {
      return data.devices;
    }
    return [];
  } catch {
    return [];
  }
}
