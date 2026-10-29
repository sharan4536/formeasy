import { getFieldExplanation } from '../utils/explanations';
import { getCloudApiEndpoint } from '../utils/cloudApi';
import { UserAccount, UserPreferences } from '../utils/types';

interface ExplainFieldPayload {
  label: string;
  context?: string;
}

interface SaveProfilePayload {
  profile: Record<string, unknown>;
}

chrome.runtime.onInstalled.addListener(() => {
  // Extension installed or updated
});

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === 'SAVE_PROFILE_CLOUD') {
    handleSaveProfileCloud(request.payload as SaveProfilePayload, sendResponse);
    return true;
  }

  if (request.type === 'GET_PROFILE_CLOUD') {
    handleGetProfileCloud(sendResponse);
    return true;
  }

  if (request.type === 'EXPLAIN_FIELD') {
    handleExplainField(request.payload as ExplainFieldPayload, sendResponse);
    return true;
  }

  if (request.type === 'TRIGGER_AUTOFILL_ACTIVE_TAB') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'EXECUTE_AUTOFILL' }, (res) => {
          sendResponse(res || { success: true });
        });
      } else {
        sendResponse({ success: false, error: 'No active tab found' });
      }
    });
    return true;
  }
});

async function handleSaveProfileCloud(
  payload: SaveProfilePayload,
  sendResponse: (res: unknown) => void
) {
  const { profile } = payload || {};
  chrome.storage.sync.get(['formeasy_account'], async (accRes) => {
    const account = accRes.formeasy_account as UserAccount | undefined;
    try {
      const endpoint = await getCloudApiEndpoint();
      const res = await fetch(`${endpoint}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(account?.token ? { Authorization: `Bearer ${account.token}` } : {})
        },
        body: JSON.stringify({
          profile,
          email: account?.email
        })
      });
      const data = await res.json();
      sendResponse({ success: res.ok, data });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown network error';
      sendResponse({ success: false, error: message });
    }
  });
}

async function handleGetProfileCloud(sendResponse: (res: unknown) => void) {
  chrome.storage.sync.get(['formeasy_account'], async (accRes) => {
    const account = accRes.formeasy_account as UserAccount | undefined;
    try {
      const endpoint = await getCloudApiEndpoint();
      const url = account?.email
        ? `${endpoint}/api/user/profile?email=${encodeURIComponent(account.email)}`
        : `${endpoint}/api/user/profile`;
      const res = await fetch(url, {
        method: 'GET',
        headers: account?.token ? { Authorization: `Bearer ${account.token}` } : {}
      });
      const data = await res.json();
      sendResponse({ success: res.ok, profile: data.profile });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown network error';
      sendResponse({ success: false, error: message });
    }
  });
}

async function handleExplainField(
  payload: ExplainFieldPayload,
  sendResponse: (res: unknown) => void
) {
  const { label, context } = payload;

  chrome.storage.sync.get(['geminiApiKey', 'formeasy_prefs'], async (result) => {
    const prefs = result.formeasy_prefs as UserPreferences | undefined;
    const apiKey = (result.geminiApiKey as string | undefined) || prefs?.geminiApiKey;

    // Use built-in offline explanation engine if no API key is provided
    if (!apiKey) {
      const fallback = getFieldExplanation(label, undefined, context);
      sendResponse({ success: true, data: fallback });
      return;
    }

    try {
      const prompt = `You are FormEasy, an AI assistant that explains online form fields in simple language.
Explain what information the user should enter in this field.

Field Label: "${label}"
Form Context: "${context || 'General Form'}"

Respond in JSON format:
{
  "whatToEnter": "Simple, direct explanation (1-2 sentences).",
  "example": "A realistic example input.",
  "tip": "Helpful tip for finding or formatting this information.",
  "warning": "Optional common mistake to avoid."
}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
          })
        }
      );

      if (!res.ok) {
        const fallback = getFieldExplanation(label, undefined, context);
        sendResponse({ success: true, data: fallback });
        return;
      }

      const data = await res.json();
      const textStr = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(textStr);
      sendResponse({ success: true, data: parsed });
    } catch {
      const fallback = getFieldExplanation(label, undefined, context);
      sendResponse({ success: true, data: fallback });
    }
  });
}
