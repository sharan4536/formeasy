import { UserProfile, DetectedField } from './types';

interface MatchRule {
  key: keyof UserProfile;
  keywords: string[];
}

const MATCH_RULES: MatchRule[] = [
  {
    key: 'firstName',
    keywords: ['first_name', 'firstname', 'first-name', 'fname', 'first name', 'given name', 'given-name']
  },
  {
    key: 'lastName',
    keywords: ['last_name', 'lastname', 'last-name', 'lname', 'last name', 'family name', 'family-name', 'surname']
  },
  {
    key: 'fullName',
    keywords: ['full_name', 'fullname', 'full-name', 'applicant_name', 'candidate_name', 'student_name', 'your_name', 'name', 'person_name']
  },
  {
    key: 'email',
    keywords: ['email', 'e-mail', 'email_address', 'user_email', 'mail']
  },
  {
    key: 'phone',
    keywords: ['phone', 'mobile', 'contact_no', 'mobile_no', 'tel', 'telephone', 'phone_number', 'contact']
  },
  {
    key: 'dob',
    keywords: ['dob', 'date of birth', 'birth_date', 'birthdate', 'bday', 'date-of-birth', 'birth']
  },
  {
    key: 'gender',
    keywords: ['gender', 'sex']
  },
  {
    key: 'bloodGroup',
    keywords: ['blood', 'blood_group', 'bloodgroup', 'blood-group']
  },
  {
    key: 'nationality',
    keywords: ['nationality', 'citizenship']
  },
  {
    key: 'maritalStatus',
    keywords: ['marital', 'marital_status', 'civil status']
  },
  {
    key: 'fathersName',
    keywords: ['father', 'father_name', 'fathers_name', 'father name', 'fathers name']
  },
  {
    key: 'mothersName',
    keywords: ['mother', 'mother_name', 'mothers_name', 'mother name', 'mothers name']
  },
  {
    key: 'guardianName',
    keywords: ['guardian', 'guardian_name', 'guardian name']
  },
  {
    key: 'permanentAddress',
    keywords: ['permanent_address', 'perm_address', 'permanent address', 'perm-address', 'permanent-address', 'home address']
  },
  {
    key: 'correspondenceAddress',
    keywords: ['correspondence_address', 'corr_address', 'correspondence address', 'current address', 'mailing address', 'present address', 'corr-address', 'address']
  },
  {
    key: 'city',
    keywords: ['city', 'district', 'town']
  },
  {
    key: 'state',
    keywords: ['state', 'province', 'region', 'domicile']
  },
  {
    key: 'pincode',
    keywords: ['pincode', 'pin_code', 'pin code', 'pin', 'zip', 'zipcode', 'zip_code', 'postal', 'postal_code', 'postal code']
  },
  {
    key: 'country',
    keywords: ['country', 'nation']
  },
  {
    key: 'aadhaarNumber',
    keywords: ['aadhaar', 'aadhar', 'aadhaar_number', 'uid', 'ssn', 'national_id', 'social security']
  },
  {
    key: 'panNumber',
    keywords: ['pan', 'pan_number', 'pan_card', 'tax_id', 'taxid', 'tin']
  },
  {
    key: 'passportNumber',
    keywords: ['passport', 'passport_number', 'passport_no']
  },
  {
    key: 'highestQualification',
    keywords: ['qualification', 'highest_qualification', 'degree', 'education', 'highest qualification']
  },
  {
    key: 'institution',
    keywords: ['institution', 'college', 'university', 'institute', 'school']
  },
  {
    key: 'registrationNumber',
    keywords: ['registration', 'reg_no', 'reg-no', 'registration_number', 'roll_no', 'roll-no', 'roll number', 'enrollment']
  },
  {
    key: 'occupation',
    keywords: ['occupation', 'profession', 'job', 'designation', 'employment']
  },
  {
    key: 'bankAccount',
    keywords: ['account_no', 'account_number', 'bank_account', 'bank account', 'account number', 'acc_no', 'acct_no']
  },
  {
    key: 'ifsc',
    keywords: ['ifsc', 'ifsc_code', 'routing', 'routing_number', 'sort_code', 'swift']
  },
  {
    key: 'bankName',
    keywords: ['bank_name', 'bank name', 'name of bank']
  },
  {
    key: 'annualIncome',
    keywords: ['income', 'annual_income', 'annual income', 'family_income', 'annual family income', 'salary']
  },
  {
    key: 'nominee',
    keywords: ['nominee', 'nominee_name', 'nominee name']
  }
];

/**
 * Extracts visible label or identifier for a DOM element
 */
export function getElementIdentifier(el: HTMLElement): { text: string; label: string } {
  let labelText = '';

  // 1. Label tag with for="id"
  if (el.id) {
    const labelNode = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
    if (labelNode && labelNode.textContent) {
      labelText = labelNode.textContent.trim();
    }
  }

  // 2. Parent label element
  if (!labelText) {
    const parentLabel = el.closest('label');
    if (parentLabel && parentLabel.textContent) {
      labelText = parentLabel.textContent.trim();
    }
  }

  // 3. Aria-label or placeholder
  const placeholder = el.getAttribute('placeholder') || '';
  const ariaLabel = el.getAttribute('aria-label') || '';
  const nameAttr = el.getAttribute('name') || '';
  const idAttr = el.id || '';
  const autocomplete = el.getAttribute('autocomplete') || '';

  // 4. Nearby sibling text
  if (!labelText) {
    const prev = el.previousElementSibling;
    if (prev && prev.textContent && prev.textContent.trim().length < 60) {
      labelText = prev.textContent.trim();
    }
  }

  const cleanLabel = labelText || placeholder || ariaLabel || nameAttr || idAttr || 'Field';

  // Combined search haystack
  const haystack = `${idAttr} ${nameAttr} ${autocomplete} ${placeholder} ${ariaLabel} ${labelText}`.toLowerCase();

  return {
    text: haystack,
    label: cleanLabel
  };
}

/**
 * Matches a form element to a profile key
 */
export function matchElementToProfileKey(el: HTMLElement): keyof UserProfile | null {
  const { text } = getElementIdentifier(el);

  // Exact priority checks
  for (const rule of MATCH_RULES) {
    for (const kw of rule.keywords) {
      // Word boundary match or exact substring match
      const escaped = kw.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (regex.test(text) || text.includes(kw)) {
        return rule.key;
      }
    }
  }

  return null;
}

/**
 * Scans page and returns all detected autofillable fields
 */
export function scanPageForFormFields(profile: UserProfile): DetectedField[] {
  const inputs = Array.from(document.querySelectorAll<HTMLElement>('input, select, textarea'));
  const detected: DetectedField[] = [];

  for (const el of inputs) {
    const tag = el.tagName.toUpperCase();
    const type = (el.getAttribute('type') || 'text').toLowerCase();

    // Skip submit, reset, hidden, button, file
    if (['hidden', 'submit', 'button', 'reset', 'file', 'image'].includes(type)) {
      continue;
    }

    // Skip elements that are invisible
    if (el.offsetParent === null && el.offsetWidth === 0 && el.offsetHeight === 0) {
      continue;
    }

    const { label } = getElementIdentifier(el);
    const matchedKey = matchElementToProfileKey(el);

    let value: string | null = null;
    if (matchedKey) {
      // Special handling for full name vs first/last name
      if (matchedKey === 'fullName') {
        value = profile.fullName || `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
      } else {
        const val = profile[matchedKey];
        value = typeof val === 'string' ? val : '';
      }
    }

    detected.push({
      element: el,
      label,
      matchedKey,
      value,
      type: tag === 'SELECT' ? 'select' : tag === 'TEXTAREA' ? 'textarea' : type
    });
  }

  return detected;
}

/**
 * Populates a single DOM element with a value and triggers all framework events
 */
export function fillElementValue(el: HTMLElement, value: string): boolean {
  if (!el || value === undefined || value === null) return false;

  const tag = el.tagName.toUpperCase();

  try {
    if (tag === 'SELECT') {
      const select = el as HTMLSelectElement;
      let matchedIndex = -1;
      const lowerVal = value.trim().toLowerCase();

      for (let i = 0; i < select.options.length; i++) {
        const opt = select.options[i];
        const optVal = opt.value.trim().toLowerCase();
        const optText = opt.text.trim().toLowerCase();

        if (optVal === lowerVal || optText === lowerVal) {
          matchedIndex = i;
          break;
        }
        if (optText.includes(lowerVal) || lowerVal.includes(optText)) {
          matchedIndex = i;
        }
      }

      if (matchedIndex >= 0) {
        select.selectedIndex = matchedIndex;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        select.dispatchEvent(new Event('input', { bubbles: true }));
        highlightFilledElement(select);
        return true;
      }
      return false;
    }

    // Input or Textarea
    const inputEl = el as HTMLInputElement | HTMLTextAreaElement;
    
    // Prototype setter trick to satisfy React/Angular internal state
    const proto = tag === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
    const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;

    if (nativeSetter) {
      nativeSetter.call(inputEl, value);
    } else {
      inputEl.value = value;
    }

    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    inputEl.dispatchEvent(new Event('change', { bubbles: true }));
    inputEl.dispatchEvent(new Event('blur', { bubbles: true }));

    highlightFilledElement(inputEl);
    return true;
  } catch (err) {
    console.error('FormEasy autofill error:', err);
    return false;
  }
}

/**
 * Highlights element with green glow to visually indicate successful autofill
 */
function highlightFilledElement(el: HTMLElement) {
  const originalOutline = el.style.outline;
  const originalTransition = el.style.transition;
  const originalBg = el.style.backgroundColor;

  el.style.transition = 'all 0.3s ease';
  el.style.outline = '2px solid #22c55e';
  el.style.backgroundColor = '#f0fdf4';

  setTimeout(() => {
    el.style.outline = originalOutline;
    el.style.backgroundColor = originalBg;
    el.style.transition = originalTransition;
  }, 2200);
}

/**
 * Autofills all detected fields on the page in 1 click
 */
export function autofillEntirePage(profile: UserProfile): { filledCount: number; totalDetected: number } {
  const fields = scanPageForFormFields(profile);
  let filledCount = 0;

  for (const field of fields) {
    if (field.matchedKey && field.value) {
      const ok = fillElementValue(field.element, field.value);
      if (ok) filledCount++;
    }
  }

  return { filledCount, totalDetected: fields.length };
}
