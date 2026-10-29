import { UserProfile, DetectedField } from './types';

// Map of 2-digit Indian State Codes from GSTIN to State Names
export const GST_STATE_MAP: Record<string, string> = {
  '01': 'Jammu and Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '26': 'Dadra and Nagar Haveli and Daman and Diu',
  '27': 'Maharashtra',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman and Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
  '38': 'Ladakh'
};

interface MatchRule {
  key: keyof UserProfile;
  keywords: string[];
}

/**
 * HIGH-PRECISION ORDERED MATCH RULES
 * Specific compound labels are evaluated before generic labels to prevent false collisions.
 */
const MATCH_RULES: MatchRule[] = [
  // 1. Relationships & External Parties
  {
    key: 'fathersName',
    keywords: ['father', 'father name', 'fathers name', 'father full name', 'parent father']
  },
  {
    key: 'mothersName',
    keywords: ['mother', 'mother name', 'mothers name', 'mother full name', 'parent mother']
  },
  {
    key: 'guardianName',
    keywords: ['guardian', 'guardian name', 'guardians name']
  },
  {
    key: 'nominee',
    keywords: ['nominee', 'nominee name', 'nominee full name']
  },
  {
    key: 'authorizedSignatory',
    keywords: ['authorized signatory', 'authorised signatory', 'signatory name', 'name of signatory', 'signatory', 'promoter', 'proprietor']
  },

  // 2. Commercial / Business Names (Checked BEFORE personal names)
  {
    key: 'businessName',
    keywords: [
      'legal name of business', 'legal name of the business', 'legal business name',
      'legal name', 'business name', 'company name', 'firm name', 'enterprise name',
      'entity name', 'organization name', 'organisation name', 'name of taxpayer',
      'taxpayer name', 'name of business', 'employer name'
    ]
  },
  {
    key: 'tradeName',
    keywords: ['trade name', 'trading name', 'brand name', 'business trade name', 'tradename']
  },
  {
    key: 'bankName',
    keywords: ['bank name', 'name of bank', 'banking institution']
  },

  // 3. Tax Identifiers
  {
    key: 'gstNumber',
    keywords: [
      'gstin', 'gst number', 'gstin uin', 'gst in', 'goods and services tax',
      'taxpayer gstin', 'supplier gstin', 'recipient gstin', 'uin', 'provisional id'
    ]
  },
  {
    key: 'panNumber',
    keywords: [
      'pan number', 'pan card', 'permanent account number', 'pan no', 'tax id', 'taxpayer pan', 'pan'
    ]
  },
  {
    key: 'aadhaarNumber',
    keywords: ['aadhaar', 'aadhar', 'aadhaar number', 'uidai', 'national id', 'social security', 'ssn']
  },
  {
    key: 'passportNumber',
    keywords: ['passport', 'passport number', 'passport no']
  },

  // 4. Personal Names (Checked AFTER Father/Mother/Bank/Business)
  {
    key: 'firstName',
    keywords: ['first name', 'fname', 'given name', 'forename']
  },
  {
    key: 'lastName',
    keywords: ['last name', 'surname', 'family name']
  },
  {
    key: 'fullName',
    keywords: [
      'full name', 'applicant name', 'candidate name', 'student name', 'your name',
      'person name', 'complete name', 'name of applicant', 'name of candidate'
    ]
  },

  // 5. Addresses (Specific addresses first)
  {
    key: 'permanentAddress',
    keywords: ['permanent address', 'perm address', 'home address', 'native address']
  },
  {
    key: 'businessAddress',
    keywords: ['business address', 'office address', 'principal place of business', 'work address', 'principal place']
  },
  {
    key: 'correspondenceAddress',
    keywords: [
      'correspondence address', 'current address', 'present address', 'mailing address',
      'communication address', 'address line 1', 'address line 2', 'address'
    ]
  },

  // 6. Geography & Locations
  {
    key: 'pincode',
    keywords: ['pincode', 'pin code', 'postal code', 'zip code', 'zipcode', 'postal']
  },
  {
    key: 'state',
    keywords: ['state', 'state ut', 'province', 'region', 'domicile']
  },
  {
    key: 'city',
    keywords: ['city', 'district', 'town', 'taluk', 'sub district']
  },
  {
    key: 'country',
    keywords: ['country', 'nationality', 'nation', 'citizenship']
  },

  // 7. Contact Details
  {
    key: 'emergencyContact',
    keywords: ['emergency contact', 'emergency phone', 'alt phone', 'alternate mobile', 'parent phone']
  },
  {
    key: 'phone',
    keywords: [
      'mobile number', 'phone number', 'contact number', 'mobile no', 'phone no',
      'contact no', 'mobile', 'phone', 'telephone', 'cell', 'mob'
    ]
  },
  {
    key: 'email',
    keywords: ['email address', 'email', 'e mail', 'user email', 'mail']
  },

  // 8. Banking & Financial
  {
    key: 'bankAccount',
    keywords: ['bank account', 'account number', 'account no', 'acc no', 'acct no']
  },
  {
    key: 'ifsc',
    keywords: ['ifsc code', 'ifsc', 'routing number', 'sort code', 'swift']
  },
  {
    key: 'annualIncome',
    keywords: ['annual income', 'family income', 'salary', 'annual family income', 'gross income']
  },

  // 9. Personal Demographics
  {
    key: 'dob',
    keywords: ['date of birth', 'birth date', 'birthdate', 'dob']
  },
  {
    key: 'gender',
    keywords: ['gender', 'sex']
  },
  {
    key: 'bloodGroup',
    keywords: ['blood group', 'blood']
  },
  {
    key: 'maritalStatus',
    keywords: ['marital status', 'civil status', 'marital']
  },

  // 10. Education & Career
  {
    key: 'highestQualification',
    keywords: ['highest qualification', 'qualification', 'degree', 'education']
  },
  {
    key: 'institution',
    keywords: ['institution', 'college', 'university', 'institute', 'school']
  },
  {
    key: 'registrationNumber',
    keywords: ['registration number', 'roll number', 'roll no', 'reg no', 'enrollment number', 'enrollment']
  },
  {
    key: 'occupation',
    keywords: ['occupation', 'profession', 'job', 'designation', 'employment']
  },
  {
    key: 'branch',
    keywords: ['branch', 'department', 'major', 'discipline', 'stream', 'field of study', 'specialization']
  },
  {
    key: 'cgpa',
    keywords: ['cgpa', 'gpa', 'percentage', 'marks', 'aggregate score', 'score', 'grade']
  },
  {
    key: 'yearOfPassing',
    keywords: ['year of passing', 'passing year', 'graduation year', 'batch', 'passout']
  },
  {
    key: 'linkedin',
    keywords: ['linkedin', 'linkedin url', 'linkedin profile']
  },
  {
    key: 'github',
    keywords: ['github', 'github url', 'github profile']
  },
  {
    key: 'portfolio',
    keywords: ['portfolio', 'website', 'personal website', 'portfolio url']
  },
  {
    key: 'skills',
    keywords: ['skills', 'tech skills', 'key skills', 'competencies']
  },

  // 11. Portal Extras
  {
    key: 'portalUsername',
    keywords: ['gstin username', 'portal username', 'username', 'user name', 'login id', 'user id']
  },
  {
    key: 'turnover',
    keywords: ['aggregate turnover', 'annual turnover', 'turnover', 'gross turnover']
  }
];

/**
 * Extracts visible label or identifier for a DOM element
 */
export function getElementIdentifier(el: HTMLElement): { text: string; label: string } {
  let labelText = '';

  // 1. Label tag with for="id"
  if (el.id) {
    try {
      const labelNode = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
      if (labelNode && labelNode.textContent) {
        labelText = labelNode.textContent.trim();
      }
    } catch {}
  }

  // 2. Parent label element
  if (!labelText) {
    const parentLabel = el.closest('label');
    if (parentLabel && parentLabel.textContent) {
      labelText = parentLabel.textContent.trim();
    }
  }

  // 3. Search inside parent container (.form-group, table row, grid cell, etc.)
  if (!labelText) {
    const container = el.closest('.form-group, .form-item, .form-row, .input-group, .form-field, .col-md-6, .col-md-4, .col-md-3, tr, td, div');
    if (container) {
      const lbl = container.querySelector('label, [class*="label"], .control-label, dt, th');
      if (lbl && lbl.textContent && !lbl.contains(el)) {
        labelText = lbl.textContent.trim();
      }
    }
  }

  // 4. Nearby sibling text or preceding table cell
  if (!labelText) {
    const prev = el.previousElementSibling;
    if (prev && prev.textContent && prev.textContent.trim().length < 80) {
      labelText = prev.textContent.trim();
    } else {
      const td = el.closest('td');
      if (td && td.previousElementSibling && td.previousElementSibling.textContent) {
        labelText = td.previousElementSibling.textContent.trim();
      }
    }
  }

  // 5. Aria-labelledby
  const labelledBy = el.getAttribute('aria-labelledby');
  if (!labelText && labelledBy) {
    const node = document.getElementById(labelledBy);
    if (node && node.textContent) {
      labelText = node.textContent.trim();
    }
  }

  // 6. Attributes
  const placeholder = el.getAttribute('placeholder') || '';
  const ariaLabel = el.getAttribute('aria-label') || '';
  const titleAttr = el.getAttribute('title') || '';
  const nameAttr = el.getAttribute('name') || '';
  const idAttr = el.id || '';
  const autocomplete = el.getAttribute('autocomplete') || '';

  const cleanLabel = (labelText || placeholder || ariaLabel || titleAttr || nameAttr || idAttr || 'Field')
    .replace(/[*:]/g, '')
    .trim();

  // Normalized search haystack: replace special separators with space for clean token matching
  const rawHaystack = `${idAttr} ${nameAttr} ${autocomplete} ${placeholder} ${ariaLabel} ${titleAttr} ${labelText}`.toLowerCase();
  const normalizedHaystack = rawHaystack.replace(/[-_/:.]/g, ' ');

  return {
    text: normalizedHaystack,
    label: cleanLabel
  };
}

/**
 * Matches a form element to a profile key based on rules, government portal overrides, or value patterns
 */
export function matchElementToProfileKey(el: HTMLElement, val?: string): keyof UserProfile | null {
  const { text, label } = getElementIdentifier(el);
  const lowerLabel = label.toLowerCase();
  const lowerText = text.toLowerCase();
  const rawId = el.id.toLowerCase();
  const rawName = (el.getAttribute('name') || '').toLowerCase();

  // Disambiguate corporate/business forms where id="lname" means "Legal Name of Business"
  if (
    lowerText.includes('legal name') ||
    lowerLabel.includes('legal name') ||
    ((rawId === 'lname' || rawName === 'lname') && (lowerText.includes('business') || lowerText.includes('taxpayer') || lowerLabel.includes('business')))
  ) {
    return 'businessName';
  }

  // Disambiguate explicit bank account input attributes
  if (rawId === 'bankaccount' || rawName === 'bankaccount' || rawId === 'bank-account') {
    return 'bankAccount';
  }


  // ----------------------------------------------------
  // STANDARD ORDERED KEYWORD MATCHING
  // ----------------------------------------------------
  for (const rule of MATCH_RULES) {
    // Safety check for fullName: never match if text refers to another entity
    if (rule.key === 'fullName') {
      if (
        lowerText.includes('father') ||
        lowerText.includes('mother') ||
        lowerText.includes('guardian') ||
        lowerText.includes('bank') ||
        lowerText.includes('company') ||
        lowerText.includes('business') ||
        lowerText.includes('trade') ||
        lowerText.includes('nominee') ||
        lowerText.includes('first') ||
        lowerText.includes('last') ||
        lowerText.includes('surname')
      ) {
        continue;
      }
    }

    for (const kw of rule.keywords) {
      const escaped = kw.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      // Require word boundary so 'pan' doesn't match 'company', 'dob' doesn't match 'adobe', etc.
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (regex.test(text)) {
        return rule.key;
      }
    }
  }

  // ----------------------------------------------------
  // VALUE PATTERN INTELLIGENCE (REGEX FORMAT MATCHING)
  // ----------------------------------------------------
  const testVal = (val || (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement ? el.value : '')).trim();
  if (testVal) {
    // 15-char GSTIN pattern
    if (/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(testVal)) {
      return 'gstNumber';
    }
    // 10-char PAN
    if (/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(testVal)) {
      return 'panNumber';
    }
    // 12-digit Aadhaar
    if (/^[0-9]{12}$/.test(testVal.replace(/\s+/g, ''))) {
      return 'aadhaarNumber';
    }
    // 11-char IFSC
    if (/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(testVal)) {
      return 'ifsc';
    }
  }

  return null;
}

/**
 * Intelligent value getter that provides smart fallbacks & derivations
 * (e.g. deriving PAN from GSTIN, deriving state from GSTIN, splitting fullName into firstName/lastName)
 */
export function getEffectiveValueForElement(key: keyof UserProfile, profile: UserProfile): string {
  const directVal = profile[key];
  if (typeof directVal === 'string' && directVal.trim().length > 0) {
    return directVal.trim();
  }

  // 1. Derivation: PAN from 15-char GSTIN (Chars 3 to 12)
  if (key === 'panNumber' && profile.gstNumber) {
    const cleanGst = profile.gstNumber.trim().toUpperCase();
    if (/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(cleanGst)) {
      return cleanGst.substring(2, 12);
    }
  }

  // 2. Derivation: State from GSTIN 2-digit state code
  if (key === 'state' && profile.gstNumber) {
    const code = profile.gstNumber.trim().substring(0, 2);
    if (GST_STATE_MAP[code]) {
      return GST_STATE_MAP[code];
    }
  }

  // 3. Derivation: Full Name from First + Last Name
  if (key === 'fullName') {
    const fn = (profile.firstName || '').trim();
    const ln = (profile.lastName || '').trim();
    if (fn || ln) return `${fn} ${ln}`.trim();
    if (profile.businessName) return profile.businessName;
  }

  // 4. Derivation: First Name from Full Name
  if (key === 'firstName' && profile.fullName) {
    const parts = profile.fullName.trim().split(/\s+/);
    return parts[0] || '';
  }

  // 5. Derivation: Last Name from Full Name
  if (key === 'lastName' && profile.fullName) {
    const parts = profile.fullName.trim().split(/\s+/);
    if (parts.length > 1) {
      return parts.slice(1).join(' ');
    }
  }

  // 6. Derivation: Business Name fallback to Trade Name or Full Name
  if (key === 'businessName') {
    if (profile.tradeName) return profile.tradeName;
    if (profile.fullName) return profile.fullName;
  }

  // 7. Derivation: Trade Name fallback to Business Name
  if (key === 'tradeName') {
    if (profile.businessName) return profile.businessName;
  }

  // 8. Derivation: Address cross-fallbacks
  if (key === 'correspondenceAddress' && profile.permanentAddress) {
    return profile.permanentAddress;
  }
  if (key === 'permanentAddress' && profile.correspondenceAddress) {
    return profile.correspondenceAddress;
  }
  if (key === 'businessAddress') {
    if (profile.permanentAddress) return profile.permanentAddress;
    if (profile.correspondenceAddress) return profile.correspondenceAddress;
  }

  // 9. Derivation: Phone fallback
  if (key === 'phone' && profile.emergencyContact) {
    return profile.emergencyContact;
  }

  return '';
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

    // Skip elements that are truly display: none
    const style = window.getComputedStyle ? window.getComputedStyle(el) : null;
    if (style && style.display === 'none') {
      continue;
    }

    const { label } = getElementIdentifier(el);
    const matchedKey = matchElementToProfileKey(el);

    let value: string | null = null;
    if (matchedKey) {
      const derived = getEffectiveValueForElement(matchedKey, profile);
      value = derived || null;
    } else if (profile.customFields) {
      // Check in dynamic custom fields
      const { text } = getElementIdentifier(el);
      for (const [cKey, cVal] of Object.entries(profile.customFields)) {
        if (text.includes(cKey.toLowerCase()) || text.includes(cKey.replace(/([A-Z])/g, ' $1').toLowerCase())) {
          value = cVal;
          break;
        }
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
 * Supports: React, Angular, AngularJS, Vue, Radio Buttons, Checkboxes, Select Dropdowns, HTML5 Dates
 */
export function fillElementValue(el: HTMLElement, value: string): boolean {
  if (!el || value === undefined || value === null) return false;
  const strVal = String(value).trim();
  if (!strVal) return false;

  const tag = el.tagName.toUpperCase();
  const type = (el.getAttribute('type') || 'text').toLowerCase();

  try {
    // ----------------------------------------------------
    // 1. RADIO BUTTONS (e.g. Taxpayer, Gender, Marital Status)
    // ----------------------------------------------------
    if (type === 'radio') {
      const radio = el as HTMLInputElement;
      const groupName = radio.name;
      const radios = groupName
        ? Array.from(document.querySelectorAll<HTMLInputElement>(`input[type="radio"][name="${CSS.escape(groupName)}"]`))
        : [radio];

      const lowerTarget = strVal.toLowerCase();

      for (const r of radios) {
        const { label } = getElementIdentifier(r);
        const rVal = (r.value || '').toLowerCase();
        const rLabel = label.toLowerCase();

        // Check if radio value or label matches target
        if (
          rVal === lowerTarget ||
          rLabel === lowerTarget ||
          rLabel.includes(lowerTarget) ||
          lowerTarget.includes(rVal) ||
          // GST Portal: "I am a Taxpayer"
          (lowerTarget.includes('taxpayer') && (rVal.includes('tp') || rLabel.includes('taxpayer')))
        ) {
          r.checked = true;
          r.dispatchEvent(new Event('click', { bubbles: true }));
          r.dispatchEvent(new Event('input', { bubbles: true }));
          r.dispatchEvent(new Event('change', { bubbles: true }));
          highlightFilledElement(r);
          return true;
        }
      }
      return false;
    }

    // ----------------------------------------------------
    // 2. CHECKBOXES
    // ----------------------------------------------------
    if (type === 'checkbox') {
      const checkbox = el as HTMLInputElement;
      const shouldCheck = ['true', 'yes', '1', 'on'].includes(strVal.toLowerCase()) || 
        checkbox.value.toLowerCase() === strVal.toLowerCase();

      if (shouldCheck) {
        checkbox.checked = true;
        checkbox.dispatchEvent(new Event('click', { bubbles: true }));
        checkbox.dispatchEvent(new Event('input', { bubbles: true }));
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        highlightFilledElement(checkbox);
        return true;
      }
      return false;
    }

    // ----------------------------------------------------
    // 3. SELECT DROPDOWNS (with AngularJS & React compatibility)
    // ----------------------------------------------------
    if (tag === 'SELECT') {
      const select = el as HTMLSelectElement;
      let matchedIndex = -1;
      const lowerTarget = strVal.toLowerCase();
      const cleanTarget = lowerTarget.replace(/[^a-z0-9]/g, '');

      for (let i = 0; i < select.options.length; i++) {
        const opt = select.options[i];
        const optVal = opt.value.trim().toLowerCase();
        const optText = opt.text.trim().toLowerCase();
        const cleanOpt = optText.replace(/[^a-z0-9]/g, '');

        // 1. Exact match
        if (optVal === lowerTarget || optText === lowerTarget) {
          matchedIndex = i;
          break;
        }
        // 2. Clean alphanumeric match (e.g. "27maharashtra" vs "maharashtra")
        if (cleanOpt.length > 0 && (cleanOpt === cleanTarget || cleanOpt.includes(cleanTarget) || cleanTarget.includes(cleanOpt))) {
          matchedIndex = i;
          break;
        }
      }

      if (matchedIndex >= 0) {
        select.selectedIndex = matchedIndex;
        select.value = select.options[matchedIndex].value;

        // Native React setter for Select
        const selectSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')?.set;
        if (selectSetter) {
          selectSetter.call(select, select.options[matchedIndex].value);
        }

        // AngularJS ng-model update
        try {
          const win = window as any;
          if (win.angular) {
            const ngEl = win.angular.element(select);
            if (ngEl && ngEl.controller) {
              const ngModel = ngEl.controller('ngModel');
              if (ngModel) {
                ngModel.$setViewValue(select.options[matchedIndex].value);
                ngModel.$render();
              }
            }
          }
        } catch {}

        select.dispatchEvent(new Event('input', { bubbles: true }));
        select.dispatchEvent(new Event('change', { bubbles: true }));
        highlightFilledElement(select);
        return true;
      }
      return false;
    }

    // ----------------------------------------------------
    // 4. DATE INPUTS (<input type="date">)
    // ----------------------------------------------------
    let formattedVal = strVal;
    if (type === 'date') {
      // Must format to YYYY-MM-DD
      const dateParts = strVal.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/) || 
                        strVal.match(/(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
      if (dateParts) {
        if (dateParts[1].length === 4) {
          // YYYY-MM-DD
          const y = dateParts[1];
          const m = dateParts[2].padStart(2, '0');
          const d = dateParts[3].padStart(2, '0');
          formattedVal = `${y}-${m}-${d}`;
        } else {
          // DD-MM-YYYY
          const d = dateParts[1].padStart(2, '0');
          const m = dateParts[2].padStart(2, '0');
          const y = dateParts[3];
          formattedVal = `${y}-${m}-${d}`;
        }
      }
    }

    // ----------------------------------------------------
    // 5. TEXT / TEXTAREA / EMAIL / TEL / NUMBER INPUTS
    // ----------------------------------------------------
    const inputEl = el as HTMLInputElement | HTMLTextAreaElement;

    // Focus first to initiate framework event listeners
    inputEl.focus();
    inputEl.dispatchEvent(new Event('focus', { bubbles: true }));

    // Satisfy React value tracker
    const tracker = (inputEl as any)._valueTracker;
    if (tracker) {
      tracker.setValue('');
    }

    // Prototype setter for native React/Angular input binding
    const proto = tag === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
    const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;

    if (nativeSetter) {
      nativeSetter.call(inputEl, formattedVal);
    } else {
      inputEl.value = formattedVal;
    }

    // Dispatch full suite of user typing events
    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    inputEl.dispatchEvent(new Event('change', { bubbles: true }));
    inputEl.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'a' }));
    inputEl.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'a' }));

    // AngularJS ng-model integration (crucial for GST & Indian Govt portals)
    try {
      const win = window as any;
      if (win.angular) {
        const ngEl = win.angular.element(inputEl);
        if (ngEl) {
          const ngModel = ngEl.controller ? ngEl.controller('ngModel') : null;
          if (ngModel) {
            ngModel.$setViewValue(formattedVal);
            ngModel.$render();
          }
          if (ngEl.triggerHandler) {
            ngEl.triggerHandler('input');
            ngEl.triggerHandler('change');
          }
        }
      }
    } catch {}

    // Blur after microtask to run validation
    setTimeout(() => {
      inputEl.dispatchEvent(new Event('blur', { bubbles: true }));
    }, 20);

    highlightFilledElement(inputEl);
    return true;
  } catch (err) {
    console.error('FormEasy fillElementValue error:', err);
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
    if (field.value) {
      const ok = fillElementValue(field.element, field.value);
      if (ok) filledCount++;
    }
  }

  return { filledCount, totalDetected: fields.length };
}

// ----------------------------------------------------
// SMART AUTO-RECORD & NEW DATA LEARNING ENGINE
// ----------------------------------------------------

export interface CapturedFieldChange {
  key: string;
  label: string;
  oldValue: string;
  newValue: string;
  isNew: boolean; // true if this field was not previously entered/stored
  isCustom: boolean;
}

/**
 * Evaluates an input field against current profile data and
 * returns the captured change details.
 */
export function detectFieldChange(
  el: HTMLElement,
  profile: UserProfile
): CapturedFieldChange | null {
  const type = (el.getAttribute('type') || 'text').toLowerCase();
  // Skip sensitive security fields from arbitrary auto-recording
  if (['password', 'hidden', 'submit', 'button', 'reset', 'file', 'image'].includes(type)) {
    return null;
  }

  let value = '';
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
    value = el.value.trim();
  }

  // Require at least 2 non-whitespace characters
  if (!value || value.length < 2) return null;

  const { label } = getElementIdentifier(el);
  const matchedKey = matchElementToProfileKey(el, value);

  let key: string = (matchedKey as string) || '';
  let isCustom = false;

  if (!key) {
    const rawKey = label && label !== 'Field' ? label : (el.getAttribute('name') || el.id || 'customField');
    key = rawKey
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
      .replace(/[^a-zA-Z0-9]/g, '');
    isCustom = true;
  }

  if (!key || key.length < 2) return null;

  // Retrieve existing stored value (if any)
  let existingVal = '';
  if (isCustom) {
    existingVal = (profile.customFields && profile.customFields[key]) || '';
  } else {
    existingVal = profile[key] ? String(profile[key]).trim() : '';
  }

  // Check if this info was NOT previously entered (empty/blank) OR has been updated
  if (!existingVal || existingVal.toLowerCase() !== value.toLowerCase()) {
    return {
      key,
      label: label || key,
      oldValue: existingVal,
      newValue: value,
      isNew: !existingVal,
      isCustom
    };
  }

  return null;
}

/**
 * Merges a captured field change into the user's profile and maintains the learnedHistory log
 */
export function recordFieldChange(
  currentProfile: UserProfile,
  change: CapturedFieldChange,
  sourceUrl?: string
): UserProfile {
  const updated: UserProfile = { ...currentProfile };

  const directProfileKeys = [
    'firstName', 'lastName', 'fullName', 'email', 'phone', 'dob', 'gender', 'bloodGroup',
    'nationality', 'maritalStatus', 'fathersName', 'mothersName', 'guardianName',
    'permanentAddress', 'correspondenceAddress', 'city', 'state', 'pincode', 'country',
    'aadhaarNumber', 'panNumber', 'passportNumber', 'highestQualification', 'institution',
    'registrationNumber', 'occupation', 'bankAccount', 'ifsc', 'bankName', 'annualIncome', 'nominee',
    'emergencyContact', 'branch', 'cgpa', 'yearOfPassing', 'linkedin', 'github', 'portfolio', 'skills',
    'gstNumber', 'businessName', 'tradeName', 'businessAddress', 'portalUsername', 'turnover', 'authorizedSignatory'
  ];

  if (directProfileKeys.includes(change.key)) {
    updated[change.key] = change.newValue;
  } else {
    updated.customFields = {
      ...(updated.customFields || {}),
      [change.key]: change.newValue
    };
  }

  // Record history
  const history = [...(updated.learnedHistory || [])];
  const historyEntry = {
    id: 'lrn_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
    key: change.key,
    label: change.label,
    value: change.newValue,
    timestamp: new Date().toISOString(),
    sourceUrl: sourceUrl || (typeof window !== 'undefined' ? window.location.hostname || 'Web Form' : 'Web Form')
  };

  const existingIdx = history.findIndex(h => h.key === change.key);
  if (existingIdx >= 0) {
    history[existingIdx] = historyEntry;
  } else {
    history.unshift(historyEntry);
  }
  updated.learnedHistory = history.slice(0, 50);

  return updated;
}

/**
 * Scans an entire form (e.g. upon form submission) and returns all newly entered / changed fields
 */
export function scanFormForNewChanges(
  form: HTMLFormElement,
  profile: UserProfile
): CapturedFieldChange[] {
  const elements = Array.from(form.elements) as HTMLElement[];
  const changes: CapturedFieldChange[] = [];
  const seenKeys = new Set<string>();

  for (const el of elements) {
    const change = detectFieldChange(el, profile);
    if (change && !seenKeys.has(change.key)) {
      seenKeys.add(change.key);
      changes.push(change);
    }
  }

  return changes;
}
