import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './content.css';

let isHoveringPopup = false;

const FloatingCard = ({ label, explanation, style, onClose, onMouseEnter, onMouseLeave, onAutofill, autofillAvailable }: any) => {
  return (
    <div 
      className="formeasy-floating-card"
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="formeasy-header">
        <span>✨ FormEasy</span>
        <button onClick={onClose} className="formeasy-close">×</button>
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
          <div className="formeasy-section-content">{explanation.example}</div>
        </div>
      )}
      
      {explanation?.tip && (
        <div className="formeasy-section formeasy-tip">
          <div className="formeasy-section-title">💡 TIP</div>
          <div className="formeasy-section-content">{explanation.tip}</div>
        </div>
      )}
      
      {explanation?.warning && (
        <div className="formeasy-section formeasy-warning">
          <div className="formeasy-section-title">⚠ COMMON MISTAKE</div>
          <div className="formeasy-section-content">{explanation.warning}</div>
        </div>
      )}

      {autofillAvailable && (
        <button 
          onClick={onAutofill}
          className="mt-3 w-full py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium text-xs rounded border border-blue-200 flex items-center justify-center gap-1 transition-colors"
        >
          <span>⚡</span> Autofill from Dashboard
        </button>
      )}
    </div>
  );
};

const FormEasyApp = () => {
  const [activeField, setActiveField] = useState<{ element: HTMLElement; label: string; rect: DOMRect } | null>(null);
  const [explanation, setExplanation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const activeElementRef = { current: null as HTMLElement | null };

  useEffect(() => {
    chrome.storage.local.get(['userProfile'], (res) => {
      if (res.userProfile) setUserProfile(res.userProfile);
    });
  }, []);

  useEffect(() => {
    let timeoutId: any;

    const findLabelForElement = (el: HTMLElement) => {
      let labelText = '';
      if (el.id) {
        const labelNode = document.querySelector(`label[for="${el.id}"]`);
        if (labelNode) labelText = labelNode.textContent || '';
      }
      if (!labelText) {
        const parentLabel = el.closest('label');
        if (parentLabel) labelText = parentLabel.textContent || '';
      }
      if (!labelText && (el as HTMLInputElement).placeholder) {
        labelText = (el as HTMLInputElement).placeholder;
      }
      if (!labelText && el.getAttribute('aria-label')) {
        labelText = el.getAttribute('aria-label') || '';
      }
      // Very basic nearby text detection fallback
      if (!labelText) {
         const prev = el.previousElementSibling;
         if (prev && prev.textContent && prev.textContent.length < 50) {
            labelText = prev.textContent;
         }
      }
      return labelText.trim();
    };

    const handleFocus = (e: Event) => {
      clearTimeout(timeoutId);
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
        // Skip hidden or button inputs
        const type = target.getAttribute('type');
        if (type === 'hidden' || type === 'submit' || type === 'button') return;

        const label = findLabelForElement(target);
        if (label) {
          if (activeElementRef.current === target) return;
          activeElementRef.current = target;
          
          let formCtx = '';
          const form = target.closest('form');
          if (form) {
             const h1 = form.previousElementSibling;
             if (h1 && ['H1','H2','H3'].includes(h1.tagName)) formCtx = `Form Context: ${h1.textContent}`;
             const heading = form.querySelector('h1, h2, h3');
             if (heading && !formCtx) formCtx = `Form Context: ${heading.textContent}`;
          }

          setActiveField({
            element: target,
            label,
            rect: target.getBoundingClientRect()
          });
          setExplanation(null);
          setIsLoading(true);
          
          chrome.runtime.sendMessage({ type: 'EXPLAIN_FIELD', payload: { label, context: formCtx } }, (response) => {
            if (response && response.success) {
              setExplanation(response.data);
            }
            setIsLoading(false);
          });
        }
      }
    };

    const handleBlur = (e: Event) => {
      // Delay to allow clicking inside the popup or checking hover state
      timeoutId = setTimeout(() => {
        const focusEvent = e as FocusEvent;
        const container = document.getElementById('formeasy-root');
        
        // If focusing to another input or inside the popup, let focusin handle it or keep it open
        if (
          isHoveringPopup || 
          (focusEvent.relatedTarget instanceof Node && container?.contains(focusEvent.relatedTarget))
        ) {
          return;
        }
        
        activeElementRef.current = null;
        setActiveField(null);
        setExplanation(null);
      }, 200);
    };


    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);

    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
      clearTimeout(timeoutId);
    };
  }, []);

  if (!activeField) return null;

  // Calculate position: right next to the field, or above/below if no space
  const left = activeField.rect.right + window.scrollX + 10;
  const top = activeField.rect.top + window.scrollY;

  const autofillKey = explanation?.autofillKey;
  const hasAutofillData = autofillKey && userProfile && userProfile[autofillKey];

  return (
    <FloatingCard 
      label={activeField.label}
      explanation={isLoading ? { whatToEnter: "Thinking..." } : explanation}
      style={{ top, left, position: 'absolute', zIndex: 999999 }}
      onClose={() => {
        setActiveField(null);
        setExplanation(null);
      }}
      onMouseEnter={() => { isHoveringPopup = true; }}
      onMouseLeave={() => { isHoveringPopup = false; }}
      autofillAvailable={hasAutofillData}
      onAutofill={() => {
        if (activeField.element && hasAutofillData) {
          const el = activeField.element as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
          const val = userProfile[autofillKey];
          
          let setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
          if (el.tagName === 'TEXTAREA') {
            setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
          } else if (el.tagName === 'SELECT') {
            setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value")?.set;
          }
          
          if (setter) {
            setter.call(el, val);
          } else {
            el.value = val;
          }
          
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
          
          // Focus back on the input to ensure user sees it
          el.focus();
        }
      }}
    />
  );
};

// Create a container for the React app
const container = document.createElement('div');
container.id = 'formeasy-root';
document.body.appendChild(container);

const root = createRoot(container);
root.render(<FormEasyApp />);
