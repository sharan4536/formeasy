import { useEffect, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import './content.css';
import { UserProfile, UserAccount, UserPreferences } from '../utils/types';
import { loadAllData, DEFAULT_PROFILE, DEFAULT_ACCOUNT, DEFAULT_PREFERENCES } from '../utils/storage';
import {
  scanPageForFormFields,
  matchElementToProfileKey,
  fillElementValue,
  autofillEntirePage,
  getElementIdentifier
} from '../utils/autofill';

let isHoveringPopup = false;

interface FloatingCardProps {
  label: string;
  explanation: any;
  style: React.CSSProperties;
  onClose: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onAutofillField: () => void;
  onAutofillAll: () => void;
  fieldValue: string | null;
  accountName?: string;
  totalFormFields: number;
}

const FloatingCard = ({
  label,
  explanation,
  style,
  onClose,
  onMouseEnter,
  onMouseLeave,
  onAutofillField,
  onAutofillAll,
  fieldValue,
  accountName,
  totalFormFields
}: FloatingCardProps) => {
  return (
    <div
      className="formeasy-floating-card"
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="formeasy-header">
        <div className="formeasy-header-brand">
          <span>✨</span> FormEasy
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {accountName && (
            <span className="formeasy-sync-badge" title="Synced across all your devices">
              ☁️ {accountName.split(' ')[0]}
            </span>
          )}
          <button onClick={onClose} className="formeasy-close" title="Close helper">×</button>
        </div>
      </div>

      <div className="formeasy-title">{label}</div>

      {explanation?.whatToEnter && (
        <div className="formeasy-section">
          <div className="formeasy-section-title">WHAT TO ENTER</div>
          <div className="formeasy-section-content">{explanation.whatToEnter}</div>
        </div>
      )}

      {explanation?.example && (
        <div className="formeasy-section">
          <div className="formeasy-section-title">EXAMPLE</div>
          <div className="formeasy-example">{explanation.example}</div>
        </div>
      )}

      {explanation?.tip && (
        <div className="formeasy-section formeasy-tip">
          <div className="formeasy-section-title">💡 HELPFUL TIP</div>
          <div className="formeasy-section-content">{explanation.tip}</div>
        </div>
      )}

      {explanation?.warning && (
        <div className="formeasy-section formeasy-warning">
          <div className="formeasy-section-title">⚠ WATCH OUT</div>
          <div className="formeasy-section-content">{explanation.warning}</div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="formeasy-actions">
        {fieldValue && (
          <button
            onClick={onAutofillField}
            className="formeasy-btn-primary"
            title="Fill this specific field from your synced account"
          >
            <span>⚡</span> Autofill: "{fieldValue.length > 20 ? fieldValue.slice(0, 18) + '...' : fieldValue}"
          </button>
        )}

        {totalFormFields > 1 && (
          <button
            onClick={onAutofillAll}
            className="formeasy-btn-secondary"
            title="Autofill all detected fields across this entire form"
          >
            <span>✨</span> Auto-Fill Entire Form ({totalFormFields} fields)
          </button>
        )}
      </div>
    </div>
  );
};

const FormEasyApp = () => {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [account, setAccount] = useState<UserAccount>(DEFAULT_ACCOUNT);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  
  const [activeField, setActiveField] = useState<{
    element: HTMLElement;
    label: string;
    rect: DOMRect;
    matchedKey: keyof UserProfile | null;
    value: string | null;
  } | null>(null);

  const [explanation, setExplanation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [detectedCount, setDetectedCount] = useState(0);
  const [showWidget, setShowWidget] = useState(true);

  const activeElementRef = useRef<HTMLElement | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  const showToast = (msg: string) => {
    clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Initial load of synced data
  useEffect(() => {
    loadAllData().then(({ profile: p, account: a, preferences: pr }) => {
      setProfile(p);
      setAccount(a);
      setPreferences(pr);

      // Check fields on page
      const fields = scanPageForFormFields(p);
      setDetectedCount(fields.length);

      // Automatic fill on page load if preference is enabled
      if (pr.autoFillPageOnLoad && fields.length > 0) {
        const res = autofillEntirePage(p);
        if (res.filledCount > 0) {
          showToast(`⚡ Automatically filled ${res.filledCount} fields from your synced account!`);
        }
      }
    });

    // Listen for storage changes across tabs or devices
    if (typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
      const handleStorageChange = (changes: any, areaName: string) => {
        if (areaName === 'sync' || areaName === 'local') {
          if (changes.formeasy_profile || changes.userProfile) {
            const newProf = changes.formeasy_profile?.newValue || changes.userProfile?.newValue;
            if (newProf) setProfile(newProf);
          }
          if (changes.formeasy_account) {
            setAccount(changes.formeasy_account.newValue);
          }
          if (changes.formeasy_prefs) {
            setPreferences(changes.formeasy_prefs.newValue);
          }
        }
      };

      chrome.storage.onChanged.addListener(handleStorageChange);
      return () => {
        chrome.storage.onChanged.removeListener(handleStorageChange);
      };
    }
  }, []);

  // Message listener for popup & background actions
  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.runtime?.onMessage) return;

    const messageHandler = (req: any, _sender: any, sendResponse: any) => {
      if (req.type === 'EXECUTE_AUTOFILL') {
        const result = autofillEntirePage(profile);
        showToast(`✨ FormEasy auto-filled ${result.filledCount} fields successfully!`);
        sendResponse({ success: true, count: result.filledCount });
        return true;
      }

      if (req.type === 'GET_PAGE_STATS') {
        const fields = scanPageForFormFields(profile);
        const matchable = fields.filter(f => f.matchedKey && f.value).length;
        sendResponse({ total: fields.length, matchable });
        return true;
      }
    };

    chrome.runtime.onMessage.addListener(messageHandler);
    return () => {
      chrome.runtime.onMessage.removeListener(messageHandler);
    };
  }, [profile]);

  // Focus & Blur Event Listeners
  useEffect(() => {
    let blurTimer: any;

    const handleFocus = (e: Event) => {
      clearTimeout(blurTimer);
      const target = e.target as HTMLElement;
      if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      const type = (target.getAttribute('type') || 'text').toLowerCase();
      if (['hidden', 'submit', 'button', 'reset', 'file'].includes(type)) return;

      const { label } = getElementIdentifier(target);
      const matchedKey = matchElementToProfileKey(target);

      let matchedVal: string | null = null;
      if (matchedKey) {
        if (matchedKey === 'fullName') {
          matchedVal = profile.fullName || `${profile.firstName} ${profile.lastName}`.trim();
        } else {
          matchedVal = profile[matchedKey] ? String(profile[matchedKey]) : null;
        }
      }

      if (activeElementRef.current === target) return;
      activeElementRef.current = target;

      setActiveField({
        element: target,
        label,
        rect: target.getBoundingClientRect(),
        matchedKey,
        value: matchedVal
      });

      setExplanation(null);
      setIsLoading(true);

      // Auto-fill on focus if preference enabled and field is currently empty
      if (preferences.autoFillOnFocus && matchedVal) {
        const inputEl = target as HTMLInputElement;
        if (!inputEl.value) {
          fillElementValue(target, matchedVal);
          showToast(`⚡ Autofilled ${label}`);
        }
      }

      // Fetch AI explanation
      let formCtx = '';
      const form = target.closest('form');
      if (form) {
        const heading = form.querySelector('h1, h2, h3, legend') || form.previousElementSibling;
        if (heading?.textContent) {
          formCtx = `Form Context: ${heading.textContent.trim()}`;
        }
      }

      chrome.runtime.sendMessage(
        { type: 'EXPLAIN_FIELD', payload: { label, context: formCtx } },
        (response) => {
          if (response && response.success) {
            setExplanation(response.data);
          }
          setIsLoading(false);
        }
      );
    };

    const handleBlur = (e: Event) => {
      blurTimer = setTimeout(() => {
        const focusEvent = e as FocusEvent;
        const container = document.getElementById('formeasy-root');

        if (
          isHoveringPopup ||
          (focusEvent.relatedTarget instanceof Node && container?.contains(focusEvent.relatedTarget))
        ) {
          return;
        }

        activeElementRef.current = null;
        setActiveField(null);
        setExplanation(null);
      }, 250);
    };

    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);

    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
      clearTimeout(blurTimer);
    };
  }, [profile, preferences]);

  const handleAutofillSingleField = () => {
    if (activeField?.element && activeField.value) {
      fillElementValue(activeField.element, activeField.value);
      showToast(`⚡ Filled ${activeField.label} with saved data!`);
    }
  };

  const handleAutofillAllFields = () => {
    const result = autofillEntirePage(profile);
    showToast(`✨ Automatically filled ${result.filledCount} of ${result.totalDetected} fields!`);
    setActiveField(null);
  };

  // Card placement
  let cardPosition: React.CSSProperties = { position: 'absolute', zIndex: 999999 };
  if (activeField) {
    const spaceRight = window.innerWidth - activeField.rect.right;
    const spaceBelow = window.innerHeight - activeField.rect.bottom;

    if (spaceRight > 360) {
      // Right side
      cardPosition = {
        position: 'absolute',
        top: activeField.rect.top + window.scrollY,
        left: activeField.rect.right + window.scrollX + 12,
        zIndex: 999999
      };
    } else if (spaceBelow > 300) {
      // Below
      cardPosition = {
        position: 'absolute',
        top: activeField.rect.bottom + window.scrollY + 8,
        left: Math.max(10, activeField.rect.left + window.scrollX),
        zIndex: 999999
      };
    } else {
      // Above
      cardPosition = {
        position: 'absolute',
        top: Math.max(10, activeField.rect.top + window.scrollY - 280),
        left: Math.max(10, activeField.rect.left + window.scrollX),
        zIndex: 999999
      };
    }
  }

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="formeasy-toast">
          <div className="formeasy-toast-icon">✓</div>
          <div>{toastMessage}</div>
        </div>
      )}

      {/* Floating Bottom Assistant Pill on Pages with Forms */}
      {showWidget && detectedCount > 0 && preferences.showFloatingWidget && (
        <div className="formeasy-floating-widget">
          <div className="formeasy-widget-pill">
            <span>✨</span>
            <span>FormEasy</span>
            <span className="formeasy-widget-count">{detectedCount} fields</span>
          </div>

          <button
            onClick={handleAutofillAllFields}
            className="formeasy-widget-autofill-btn"
            title="Instantly autofill all matching fields from your cloud account"
          >
            <span>⚡</span> Auto-Fill Form
          </button>

          <button
            onClick={() => setShowWidget(false)}
            className="formeasy-widget-close"
            title="Hide assistant for now"
          >
            ✕
          </button>
        </div>
      )}

      {/* Active Field Floating Card */}
      {activeField && (
        <FloatingCard
          label={activeField.label}
          explanation={isLoading ? { whatToEnter: "Analyzing field with AI..." } : explanation}
          style={cardPosition}
          onClose={() => {
            setActiveField(null);
            setExplanation(null);
          }}
          onMouseEnter={() => { isHoveringPopup = true; }}
          onMouseLeave={() => { isHoveringPopup = false; }}
          onAutofillField={handleAutofillSingleField}
          onAutofillAll={handleAutofillAllFields}
          fieldValue={activeField.value}
          accountName={account.isLoggedIn ? account.name : undefined}
          totalFormFields={detectedCount}
        />
      )}
    </>
  );
};

// Container setup
let container = document.getElementById('formeasy-root');
if (!container) {
  container = document.createElement('div');
  container.id = 'formeasy-root';
  document.body.appendChild(container);
}

const root = createRoot(container);
root.render(<FormEasyApp />);
