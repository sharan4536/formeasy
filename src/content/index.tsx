import React, { useEffect, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import './content.css';
import { UserProfile, UserAccount, UserPreferences } from '../utils/types';
import { loadAllData, saveProfile, DEFAULT_PROFILE, DEFAULT_ACCOUNT, DEFAULT_PREFERENCES } from '../utils/storage';
import {
  scanPageForFormFields,
  matchElementToProfileKey,
  fillElementValue,
  autofillEntirePage,
  getElementIdentifier,
  detectFieldChange,
  recordFieldChange,
  scanFormForNewChanges
} from '../utils/autofill';
import { getFieldExplanation, FieldExplanation } from '../utils/explanations';

let isHoveringPopup = false;

interface FloatingCardProps {
  label: string;
  explanation: FieldExplanation | null;
  style: React.CSSProperties;
  onClose: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onAutofillField: () => void;
  onAutofillAll: () => void;
  fieldValue: string | null;
  accountName?: string;
  totalFormFields: number;
  isPreview?: boolean;
}

const FloatingCard: React.FC<FloatingCardProps> = ({
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
  totalFormFields,
  isPreview
}) => {
  return (
    <div
      className="formeasy-floating-card"
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="formeasy-header">
        <div className="formeasy-header-brand">
          FormEasy
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="formeasy-hover-indicator">
            {isPreview ? 'Preview' : 'Active Field'}
          </span>
          {accountName && (
            <span className="formeasy-sync-badge">
              Synced: {accountName.split(' ')[0]}
            </span>
          )}
          <button onClick={onClose} className="formeasy-close" title="Close helper">
            &times;
          </button>
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
          <div className="formeasy-section-title">TIP</div>
          <div className="formeasy-section-content">{explanation.tip}</div>
        </div>
      )}

      {explanation?.warning && (
        <div className="formeasy-section formeasy-warning">
          <div className="formeasy-section-title">NOTE</div>
          <div className="formeasy-section-content">{explanation.warning}</div>
        </div>
      )}

      <div className="formeasy-actions">
        {fieldValue && (
          <button
            onClick={onAutofillField}
            className="formeasy-btn-primary"
            title="Autofill this field"
          >
            Autofill: &quot;{fieldValue.length > 22 ? fieldValue.slice(0, 20) + '...' : fieldValue}&quot;
          </button>
        )}

        {totalFormFields > 1 && (
          <button
            onClick={onAutofillAll}
            className="formeasy-btn-secondary"
            title="Autofill all detected fields"
          >
            Autofill All Fields ({totalFormFields})
          </button>
        )}
      </div>
    </div>
  );
};

const FormEasyApp: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [account, setAccount] = useState<UserAccount>(DEFAULT_ACCOUNT);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);

  const [activeField, setActiveField] = useState<{
    element: HTMLElement;
    label: string;
    rect: DOMRect;
    matchedKey: keyof UserProfile | null;
    value: string | null;
    isHover?: boolean;
  } | null>(null);

  const [explanation, setExplanation] = useState<FieldExplanation | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [detectedCount, setDetectedCount] = useState(0);
  const [showWidget, setShowWidget] = useState(true);

  const profileRef = useRef<UserProfile>(profile);
  const preferencesRef = useRef<UserPreferences>(preferences);
  const activeElementRef = useRef<HTMLElement | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  useEffect(() => {
    preferencesRef.current = preferences;
  }, [preferences]);

  const showToast = (msg: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Initial load
  useEffect(() => {
    loadAllData().then(({ profile: p, account: a, preferences: pr }) => {
      setProfile(p);
      setAccount(a);
      setPreferences(pr);
      profileRef.current = p;
      preferencesRef.current = pr;

      const fields = scanPageForFormFields(p);
      setDetectedCount(fields.length);

      if (pr.autoFillPageOnLoad && fields.length > 0) {
        const res = autofillEntirePage(p);
        if (res.filledCount > 0) {
          showToast(`Autofilled ${res.filledCount} fields`);
        }
      }
    });

    if (typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
      const handleStorageChange = (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
        if (areaName === 'sync' || areaName === 'local') {
          if (changes.formeasy_profile || changes.userProfile) {
            const newProf = (changes.formeasy_profile?.newValue || changes.userProfile?.newValue) as UserProfile;
            if (newProf) {
              setProfile(newProf);
              profileRef.current = newProf;
              const fields = scanPageForFormFields(newProf);
              setDetectedCount(fields.length);
            }
          }
          if (changes.formeasy_account) {
            setAccount(changes.formeasy_account.newValue as UserAccount);
          }
          if (changes.formeasy_prefs) {
            const newPrefs = changes.formeasy_prefs.newValue as UserPreferences;
            setPreferences(newPrefs);
            preferencesRef.current = newPrefs;
          }
        }
      };

      chrome.storage.onChanged.addListener(handleStorageChange);
      return () => {
        chrome.storage.onChanged.removeListener(handleStorageChange);
      };
    }
  }, []);

  // Extension runtime message handler
  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.runtime?.onMessage) return;

    const messageHandler = (
      req: { type: string },
      _sender: chrome.runtime.MessageSender,
      sendResponse: (response?: unknown) => void
    ) => {
      if (req.type === 'EXECUTE_AUTOFILL') {
        const result = autofillEntirePage(profileRef.current);
        showToast(`Autofilled ${result.filledCount} fields`);
        sendResponse({ success: true, count: result.filledCount });
        return true;
      }

      if (req.type === 'GET_PAGE_STATS') {
        const fields = scanPageForFormFields(profileRef.current);
        const matchable = fields.filter(f => f.matchedKey && f.value).length;
        sendResponse({ total: fields.length, matchable });
        return true;
      }
    };

    chrome.runtime.onMessage.addListener(messageHandler);
    return () => {
      chrome.runtime.onMessage.removeListener(messageHandler);
    };
  }, []);

  // Field change detection and persistence
  const checkAndRecordField = (target: HTMLElement) => {
    if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
    const type = (target.getAttribute('type') || 'text').toLowerCase();
    if (['password', 'hidden', 'submit', 'button', 'reset', 'file', 'image'].includes(type)) return;

    const change = detectFieldChange(target, profileRef.current);
    if (change && preferencesRef.current.autoRecordNewData !== false) {
      const updated = recordFieldChange(profileRef.current, change, window.location.href);
      profileRef.current = updated;
      setProfile(updated);
      saveProfile(updated);

      if (preferencesRef.current.notifyOnAutoRecord !== false) {
        showToast(
          change.isNew
            ? `Saved ${change.label} to vault`
            : `Updated ${change.label} in vault`
        );
      }
    }
  };

  // Event listeners for page interaction
  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout>;

    const findTargetInput = (target: HTMLElement | null): HTMLElement | null => {
      if (!target) return null;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
        return target;
      }
      if (target.tagName === 'LABEL') {
        const forId = target.getAttribute('for');
        if (forId) {
          const el = document.getElementById(forId);
          if (el && ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)) return el;
        }
        return target.querySelector('input, textarea, select');
      }
      const group = target.closest('.form-group, .form-item, .form-field, .input-group');
      if (group && !target.closest('button, .btn-submit, .btn')) {
        return group.querySelector('input, textarea, select');
      }
      return null;
    };

    const activateField = (target: HTMLElement, isHover = false) => {
      if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      const type = (target.getAttribute('type') || 'text').toLowerCase();
      if (['hidden', 'submit', 'button', 'reset', 'file', 'image'].includes(type)) return;

      const { label } = getElementIdentifier(target);
      const matchedKey = matchElementToProfileKey(target);

      let matchedVal: string | null = null;
      if (matchedKey) {
        if (matchedKey === 'fullName') {
          matchedVal = profileRef.current.fullName || `${profileRef.current.firstName || ''} ${profileRef.current.lastName || ''}`.trim();
        } else {
          matchedVal = profileRef.current[matchedKey] ? String(profileRef.current[matchedKey]) : null;
        }
      } else if (profileRef.current.customFields) {
        const { text } = getElementIdentifier(target);
        for (const [cKey, cVal] of Object.entries(profileRef.current.customFields)) {
          if (text.includes(cKey.toLowerCase())) {
            matchedVal = cVal;
            break;
          }
        }
      }

      if (activeElementRef.current === target && activeField) {
        return;
      }
      activeElementRef.current = target;

      let formCtx = '';
      const form = target.closest('form');
      if (form) {
        const heading = form.querySelector('h1, h2, h3, legend') || form.previousElementSibling;
        if (heading?.textContent) {
          formCtx = `Form Context: ${heading.textContent.trim()}`;
        }
      }

      const instantExp = getFieldExplanation(label, type, formCtx);

      setActiveField({
        element: target,
        label,
        rect: target.getBoundingClientRect(),
        matchedKey,
        value: matchedVal,
        isHover
      });

      setExplanation(instantExp);

      // Autofill on focus if configured
      if (!isHover && preferencesRef.current.autoFillOnFocus && matchedVal) {
        const inputEl = target as HTMLInputElement;
        if (!inputEl.value) {
          fillElementValue(target, matchedVal);
        }
      }

      // Query generative explanation if configured
      if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        chrome.runtime.sendMessage(
          { type: 'EXPLAIN_FIELD', payload: { label, context: formCtx } },
          (response) => {
            if (response && response.success && response.data) {
              setExplanation(response.data);
            }
          }
        );
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const container = document.getElementById('formeasy-root');
      if (container && container.contains(target)) {
        clearTimeout(hideTimer);
        isHoveringPopup = true;
        return;
      }

      const input = findTargetInput(target);
      if (!input) return;

      const type = (input.getAttribute('type') || 'text').toLowerCase();
      if (['hidden', 'submit', 'button', 'reset', 'file', 'image'].includes(type)) return;

      clearTimeout(hideTimer);
      activateField(input, true);
    };

    const handleMouseOut = (e: MouseEvent) => {
      if (!activeElementRef.current) return;

      const target = e.target as HTMLElement;
      if (target !== activeElementRef.current && !activeElementRef.current.contains(target)) {
        return;
      }

      const related = e.relatedTarget as HTMLElement;
      const container = document.getElementById('formeasy-root');

      if (related && container && container.contains(related)) {
        clearTimeout(hideTimer);
        return;
      }

      if (related && activeElementRef.current.contains(related)) {
        return;
      }

      if (document.activeElement === activeElementRef.current) {
        return;
      }

      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        if (isHoveringPopup) return;
        if (activeElementRef.current && document.activeElement === activeElementRef.current) return;

        activeElementRef.current = null;
        setActiveField(null);
        setExplanation(null);
      }, 350);
    };

    const handleFocus = (e: Event) => {
      clearTimeout(hideTimer);
      const target = e.target as HTMLElement;
      activateField(target, false);
    };

    const handleBlur = (e: Event) => {
      const target = e.target as HTMLElement;
      checkAndRecordField(target);

      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
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
      }, 300);
    };

    const handleSubmit = (e: Event) => {
      const form = e.target as HTMLFormElement;
      if (!form || form.tagName !== 'FORM') return;

      const changes = scanFormForNewChanges(form, profileRef.current);
      if (changes.length > 0 && preferencesRef.current.autoRecordNewData !== false) {
        let updated = { ...profileRef.current };
        for (const change of changes) {
          updated = recordFieldChange(updated, change, window.location.href);
        }
        profileRef.current = updated;
        setProfile(updated);
        saveProfile(updated);

        if (preferencesRef.current.notifyOnAutoRecord !== false) {
          showToast(`Saved ${changes.length} entries to vault`);
        }
      }
    };

    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('mouseout', handleMouseOut, true);
    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);
    document.addEventListener('submit', handleSubmit, true);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver, true);
      document.removeEventListener('mouseout', handleMouseOut, true);
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
      document.removeEventListener('submit', handleSubmit, true);
      clearTimeout(hideTimer);
    };
  }, [profile, preferences]);

  const handleAutofillSingleField = () => {
    if (activeField?.element && activeField.value) {
      fillElementValue(activeField.element, activeField.value);
      showToast(`Filled ${activeField.label}`);
    }
  };

  const handleAutofillAllFields = () => {
    const result = autofillEntirePage(profileRef.current);
    showToast(`Autofilled ${result.filledCount} fields`);
    setActiveField(null);
  };

  let cardPosition: React.CSSProperties = { position: 'absolute', zIndex: 2147483647 };
  if (activeField) {
    const currentRect = activeField.element.getBoundingClientRect();
    const spaceBelow = window.innerHeight - currentRect.bottom;

    if (spaceBelow >= 260) {
      cardPosition = {
        position: 'absolute',
        top: currentRect.bottom + window.scrollY + 6,
        left: Math.max(12, Math.min(window.innerWidth - 370, currentRect.left + window.scrollX)),
        zIndex: 2147483647
      };
    } else {
      cardPosition = {
        position: 'absolute',
        top: Math.max(10, currentRect.top + window.scrollY - 310),
        left: Math.max(12, Math.min(window.innerWidth - 370, currentRect.left + window.scrollX)),
        zIndex: 2147483647
      };
    }
  }

  return (
    <>
      {toastMessage && (
        <div className="formeasy-toast">
          <div className="formeasy-toast-icon">&#10003;</div>
          <div>{toastMessage}</div>
        </div>
      )}

      {showWidget && detectedCount > 0 && preferences.showFloatingWidget && (
        <div className="formeasy-floating-widget">
          <div className="formeasy-widget-pill">
            <span>FormEasy</span>
            <span className="formeasy-widget-count">{detectedCount} fields</span>
          </div>

          <button
            onClick={handleAutofillAllFields}
            className="formeasy-widget-autofill-btn"
            title="Autofill all matching fields"
          >
            Auto-Fill Form
          </button>

          <button
            onClick={() => setShowWidget(false)}
            className="formeasy-widget-close"
            title="Hide assistant"
          >
            &times;
          </button>
        </div>
      )}

      {activeField && (
        <FloatingCard
          label={activeField.label}
          explanation={explanation}
          style={cardPosition}
          onClose={() => {
            activeElementRef.current = null;
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
          isPreview={activeField.isHover}
        />
      )}
    </>
  );
};

let container = document.getElementById('formeasy-root');
if (!container) {
  container = document.createElement('div');
  container.id = 'formeasy-root';
  document.body.appendChild(container);
}

const root = createRoot(container);
root.render(<FormEasyApp />);
