export interface FieldExplanation {
  whatToEnter: string;
  example: string;
  tip?: string;
  warning?: string;
}

export const FIELD_EXPLANATIONS: Record<string, FieldExplanation> = {
  // 1. Identity & Official IDs
  aadhaar: {
    whatToEnter: "Enter your 12-digit Unique Identification Number (UIDAI Aadhaar) without spaces or hyphens.",
    example: "1234 5678 9012",
    tip: "You can find this on your physical Aadhaar card, mAadhaar app, or downloaded e-Aadhaar PDF.",
    warning: "Ensure your mobile number linked to this Aadhaar is active to receive authentication OTPs."
  },
  pan: {
    whatToEnter: "Enter your 10-character alphanumeric Permanent Account Number issued by the Income Tax Department.",
    example: "ABCDE1234F",
    tip: "The 4th letter indicates status ('P' for Individual, 'C' for Company, 'H' for HUF, 'F' for Firm).",
    warning: "Always enter in capital letters. Incorrect PAN can result in higher TDS or application rejection."
  },
  passport: {
    whatToEnter: "Enter your 8-character Indian or International Passport number as printed on the photo page.",
    example: "A1234567 or Z9876543",
    tip: "Check that your passport has at least 6 months validity from the date of application.",
    warning: "Do not confuse the booklet number or file reference number with the passport number."
  },
  voter: {
    whatToEnter: "Enter your 10-character Electoral Photo Identity Card (EPIC) voter ID number.",
    example: "ABC1234567",
    tip: "Found on the front of your voter card or via the National Voters' Service Portal (voter.eci.gov.in).",
    warning: "Ensure your name and constituency in the electoral roll match your current domicile."
  },
  ration: {
    whatToEnter: "Enter your state food civil supplies department Ration Card or National Food Security Act (NFSA) card number.",
    example: "e.g. 12-digit Ration Card ID",
    tip: "Used as proof of income and BPL/APL family category verification.",
    warning: "Ensure the candidate's name is listed as an active family member on the card."
  },

  // 2. Personal & Family Information
  fullname: {
    whatToEnter: "Enter your complete legal name exactly as printed on your Class 10 board certificate or Aadhaar.",
    example: "e.g. Sharath Reddy or Dr. Ananya Sharma",
    tip: "Do not add titles/honorifics like Mr., Ms., Shri unless explicitly requested in a separate field.",
    warning: "A spelling discrepancy between your application name and ID card may trigger document verification rejection."
  },
  firstname: {
    whatToEnter: "Enter your first or given name as recorded in your official identification documents.",
    example: "e.g. Sharath or Priya",
    tip: "If you only have a single legal name with no surname, enter it here and check if '.' is allowed for surname.",
    warning: "Ensure the spelling matches your 10th marksheet and national identity cards."
  },
  lastname: {
    whatToEnter: "Enter your family surname or last name.",
    example: "e.g. Reddy or Sharma",
    tip: "If your government documents do not have a surname, some portals accept your father's initial or repeating the given name.",
    warning: "Must be consistent with your official educational marksheets."
  },
  email: {
    whatToEnter: "Enter your active primary email address. All official communications, hall tickets, and confirmation tokens will be sent here.",
    example: "e.g. student.name@gmail.com",
    tip: "Use a personal email that you will retain access to after graduating from your current institution.",
    warning: "Double-check for typos (.con vs .com). Verification links will expire if not opened promptly."
  },
  phone: {
    whatToEnter: "Enter your active 10-digit primary mobile number without '+91' or leading zero.",
    example: "9876543210",
    tip: "Keep this SIM card active in your phone; critical OTPs and SMS dispatch alerts are delivered here.",
    warning: "Do not provide landline or secondary numbers that cannot receive instant SMS text messages."
  },
  dob: {
    whatToEnter: "Enter your exact Date of Birth as recorded in your Class 10 (SSC / Matriculation) certificate.",
    example: "01/01/2000 (DD/MM/YYYY)",
    tip: "Use the calendar picker or enter in standard format. In government portals, 10th certificate DOB supersedes all others.",
    warning: "Even a single day difference with your 10th certificate will cause scrutiny failure during counseling."
  },
  gender: {
    whatToEnter: "Select your legal gender identity as officially recorded in government records.",
    example: "Male / Female / Other",
    tip: "Some scholarships and fee concessions are exclusively reserved for female or transgender candidates.",
    warning: "Ensure consistency across all submitted photo proofs."
  },
  bloodgroup: {
    whatToEnter: "Select or enter your medical blood group with Rh factor.",
    example: "O+ / B+ / A+ / AB+ / O-",
    tip: "Required for student safety, medical insurance coverage, and campus emergency services.",
    warning: "If uncertain, verify with a previous medical checkup report or donor card."
  },
  nationality: {
    whatToEnter: "Enter your country of legal citizenship.",
    example: "Indian",
    tip: "For Indian scholarships, citizen of India is usually mandatory.",
    warning: "OCI / PIO cardholders should verify specific eligibility guidelines before applying."
  },
  marital: {
    whatToEnter: "Select your current legal marital status.",
    example: "Single / Married / Divorced / Widowed",
    tip: "Affects dependency status and family annual income assessment.",
    warning: "If married, spouse income may also be taken into account for income criteria."
  },
  father: {
    whatToEnter: "Enter your father's full name as recorded in your secondary school certificate.",
    example: "e.g. Ramesh Reddy",
    tip: "Do not prefix with 'Late' or 'Shri' unless the form specifies it in instructions.",
    warning: "Spelling must exactly match your Class 10 marksheet."
  },
  mother: {
    whatToEnter: "Enter your mother's full legal name as per official school or family records.",
    example: "e.g. Lakshmi Reddy",
    tip: "Enter her maiden or legal name as documented in your birth certificate.",
    warning: "Must be consistent with certificates submitted for fee reimbursement or caste validation."
  },
  guardian: {
    whatToEnter: "Enter the legal guardian's name only if candidate is under care of a non-parent legal guardian.",
    example: "e.g. Uncle / Legal Custodian Full Name",
    tip: "Leave blank or enter father's name if living with biological parents.",
    warning: "May require legal guardianship affidavit in government benefit schemes."
  },

  // 3. Address & Location
  permanentaddress: {
    whatToEnter: "Enter complete domicile residential address including house/flat number, street, locality, and landmark.",
    example: "Plot 42, Green Park Avenue, Near Water Tank",
    tip: "Must match the address shown on your Domicile / Nativity Certificate or Aadhaar Card.",
    warning: "Physical certificates or awards are dispatched to permanent address if postal delivery fails."
  },
  correspondenceaddress: {
    whatToEnter: "Enter current mailing address where physical letters and courier dispatches can reach you currently.",
    example: "Room 204, Campus Hostel B, Central University",
    tip: "If you reside at your permanent house, you can copy the permanent address here.",
    warning: "Ensure someone is available to receive registered post at this address."
  },
  address: {
    whatToEnter: "Enter full residential address with building name, street, locality, and area.",
    example: "House No. 12, Gandhi Nagar, Main Road",
    tip: "Include a recognizable landmark to assist postal delivery personnel.",
    warning: "Do not leave door number or street details blank."
  },
  city: {
    whatToEnter: "Enter your residential city, town, or administrative municipality.",
    example: "Hyderabad / Bengaluru / Pune / New Delhi",
    tip: "Spell the official modern name of the city recognized by postal departments.",
    warning: "Do not confuse district name with city name if residing in a rural mandal/taluka."
  },
  state: {
    whatToEnter: "Select or enter your Indian State or Union Territory of domicile.",
    example: "Telangana / Maharashtra / Karnataka",
    tip: "State determines your eligibility for state quota scholarships (e.g. Post-Matric, E-Pass).",
    warning: "Applying under wrong domicile state will immediately invalidate state-sponsored schemes."
  },
  pincode: {
    whatToEnter: "Enter your 6-digit postal area PIN code without spaces.",
    example: "500081 or 110001",
    tip: "Entering the correct pincode auto-populates district and post office in most modern portals.",
    warning: "Must be exactly 6 numeric digits matching your registered delivery post office."
  },
  country: {
    whatToEnter: "Enter or select the country of your current residence.",
    example: "India",
    tip: "Defaults to India for national scholarship and subsidy portals.",
    warning: "Ensure consistency with citizenship declarations."
  },

  // 4. Banking & Financial Details
  bankaccount: {
    whatToEnter: "Enter your active individual savings bank account number.",
    example: "e.g. 12-to-18 digit account number",
    tip: "Ensure your account is Aadhaar-seeded on NPCI mapper for Direct Benefit Transfer (DBT).",
    warning: "Do NOT use minor restricted accounts, loan accounts, or joint accounts where candidate is not primary."
  },
  bankname: {
    whatToEnter: "Enter the official name of the scheduled commercial or regional rural bank.",
    example: "State Bank of India / HDFC Bank / Canara Bank",
    tip: "Public sector banks and major private banks are preferred for DBT subsidy transfers.",
    warning: "Cooperative banks without core banking or RTGS/NEFT may face transfer delays."
  },
  ifsc: {
    whatToEnter: "Enter the 11-character Indian Financial System Code identifying your specific bank branch.",
    example: "SBIN0000456 or HDFC0001234",
    tip: "Printed clearly on your passbook front page and cheque leaf. The 5th character is always the digit zero (0).",
    warning: "Entering wrong branch IFSC may route your scholarship disbursement to an incorrect branch."
  },
  income: {
    whatToEnter: "Enter the total gross annual income of your entire family from all sources (salary, agriculture, business).",
    example: "₹2,50,000",
    tip: "Must match the exact rupee amount certified in your Tehsildar/MRO official Income Certificate.",
    warning: "Discrepancy with ration card or IT returns could lead to scrutiny or legal recovery."
  },
  nominee: {
    whatToEnter: "Enter the full legal name and relationship of the nominee to receive benefits in unforeseen circumstances.",
    example: "e.g. Jane Doe (Mother) or John Doe (Father)",
    tip: "The nominee should have their own bank account and valid government photo identification.",
    warning: "Nominee must be 18 years or older unless an appointed legal guardian is also declared."
  },
  emergency: {
    whatToEnter: "Enter a 10-digit mobile number of a family member or local guardian for urgent contact.",
    example: "9876543210",
    tip: "Choose someone who is easily reachable during daytime college/work hours.",
    warning: "Do not enter your own primary mobile number as the emergency contact."
  },

  // 5. Academic & Professional Qualifications
  college: {
    whatToEnter: "Enter the full registered name of your educational institution, college, or university.",
    example: "National Institute of Technology / Indian Institute of Technology",
    tip: "Ensure your institution is AISHE (All India Survey on Higher Education) approved.",
    warning: "Do not use short slang abbreviations if official full name is recognized."
  },
  institution: {
    whatToEnter: "Enter the official name of your school, polytechnic, college, or university.",
    example: "Delhi Technological University",
    tip: "Check whether your campus is an autonomous institute, constituent college, or affiliated unit.",
    warning: "Selecting the wrong affiliate college may misroute the scholarship verification workflow."
  },
  degree: {
    whatToEnter: "Enter or select your degree or program of study.",
    example: "B.Tech Computer Science / B.Sc Physics / MBA / M.Tech",
    tip: "Specify both degree level (Undergraduate, Postgraduate, Diploma) and your major branch.",
    warning: "Scheme eligibility often hinges strictly on degree level and course duration."
  },
  branch: {
    whatToEnter: "Enter your academic engineering branch, specialization, or departmental stream.",
    example: "Computer Science & Engineering / Electrical / Mechanical",
    tip: "Must match the program printed on your semester grade cards and ID badge.",
    warning: "Do not confuse minor specializations with primary accredited branch."
  },
  rollno: {
    whatToEnter: "Enter your official student Hall Ticket Number, University Roll Number, or Enrollment ID.",
    example: "e.g. 21CS045 or 2021BTECHS001",
    tip: "This is used by the college nodal officer to verify your bona fide student status.",
    warning: "Do not provide temporary admission slip or fee receipt numbers if roll number is issued."
  },
  cgpa: {
    whatToEnter: "Enter your cumulative grade point average (CGPA) on a 10-point scale or aggregate percentage.",
    example: "8.75 or 85.4%",
    tip: "Calculate up to the latest completed semester without counting backlogs.",
    warning: "Overstating CGPA leads to immediate disqualification during original marksheet physical audit."
  },
  gradyear: {
    whatToEnter: "Enter your expected completion year or graduation batch.",
    example: "2026 or 2027",
    tip: "Calculated based on standard program duration from your year of matriculation.",
    warning: "Ensure this aligns with your year of admission and degree duration."
  },
  qualification: {
    whatToEnter: "Select or enter your highest successfully completed educational qualification.",
    example: "Bachelor's Degree / Higher Secondary (10+2) / Diploma",
    tip: "Only mention degrees for which you possess provisional or final passing certificates.",
    warning: "If currently pursuing, declare your previous completed prerequisite qualifying exam."
  },
  linkedin: {
    whatToEnter: "Enter your complete LinkedIn profile URL.",
    example: "https://www.linkedin.com/in/yourprofile",
    tip: "Keep your summary, education, and notable achievements up to date for review committee inspection.",
    warning: "Ensure your profile visibility is set to public so reviewers can open the link without login issues."
  },
  github: {
    whatToEnter: "Enter your GitHub developer username or portfolio repository URL.",
    example: "https://github.com/yourusername",
    tip: "Showcases open-source contributions, technical projects, and coding credentials.",
    warning: "Pin your best projects with clear README files."
  },

  // 6. Commercial, Business & GST Details
  gst: {
    whatToEnter: "Enter your 15-character Goods and Services Tax Identification Number (GSTIN).",
    example: "27AAPFU0939F1ZV or 36ABCDE1234F1Z5",
    tip: "The first 2 digits represent your state code, followed by your 10-digit PAN number.",
    warning: "Ensure all 15 characters match your official GST Certificate (Form GST REG-06)."
  },
  business: {
    whatToEnter: "Enter the legal registered name of your commercial enterprise or firm.",
    example: "Acme Technologies Private Limited / Sharma Trading Co.",
    tip: "Must match the exact name on your PAN card or Certificate of Incorporation / Partnership Deed.",
    warning: "Avoid using brand nicknames unless Trade Name is requested in a separate field."
  },
  tradename: {
    whatToEnter: "Enter the trade name or commercial brand name under which your enterprise operates.",
    example: "Acme Supermart / FastPay Services",
    tip: "If your trade name is identical to your legal entity name, enter the legal name.",
    warning: "Must be listed in your official GST registration filings."
  },
  portalusername: {
    whatToEnter: "Enter your registered portal login ID or taxpayer username.",
    example: "e.g. taxpayer_2026 or admin_user",
    tip: "Case-sensitive in many government tax portals.",
    warning: "Never enter your secret account password in username fields."
  },
  turnover: {
    whatToEnter: "Enter your annual aggregate business turnover for the preceding financial year.",
    example: "₹45,00,000",
    tip: "Used to determine MSME classification and GST composition scheme eligibility.",
    warning: "Must reconcile with audited financial statements or GSTR-9 annual returns."
  }
};

/**
 * Normalizes label text and extracts clean alphanumeric keywords
 */
function normalizeText(text: string): string {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Returns a high-precision, instant explanation for any form field label, attribute, or context.
 * Guaranteed to return an actionable, complete explanation object synchronously (zero latency).
 */
export function getFieldExplanation(
  rawLabel: string,
  fieldType?: string,
  context?: string
): FieldExplanation {
  const norm = normalizeText(rawLabel);
  const normCtx = normalizeText(context || '');
  const combined = `${norm} ${normCtx}`;

  // 1. High-precision rule checks
  if (norm.includes('aadhaar') || norm.includes('uidai') || norm.includes('aadhar')) {
    return FIELD_EXPLANATIONS.aadhaar;
  }
  if (/\bpan\b/.test(combined) && !norm.includes('company')) {
    return FIELD_EXPLANATIONS.pan;
  }
  if (norm.includes('gstin') || norm.includes('gst') || norm.includes('goods and service')) {
    return FIELD_EXPLANATIONS.gst;
  }
  if (norm.includes('ifsc') || norm.includes('branch code')) {
    return FIELD_EXPLANATIONS.ifsc;
  }
  if (norm.includes('father')) {
    return FIELD_EXPLANATIONS.father;
  }
  if (norm.includes('mother')) {
    return FIELD_EXPLANATIONS.mother;
  }
  if (norm.includes('guardian')) {
    return FIELD_EXPLANATIONS.guardian;
  }
  if (norm.includes('nominee')) {
    return FIELD_EXPLANATIONS.nominee;
  }
  if (norm.includes('emergency')) {
    return FIELD_EXPLANATIONS.emergency;
  }
  if (norm.includes('permanent') && norm.includes('address')) {
    return FIELD_EXPLANATIONS.permanentaddress;
  }
  if ((norm.includes('correspondence') || norm.includes('current') || norm.includes('present') || norm.includes('mailing')) && norm.includes('address')) {
    return FIELD_EXPLANATIONS.correspondenceaddress;
  }
  if (norm.includes('address')) {
    return FIELD_EXPLANATIONS.address;
  }
  if (norm.includes('pincode') || norm.includes('pin code') || norm.includes('postal code') || norm.includes('zip code')) {
    return FIELD_EXPLANATIONS.pincode;
  }
  if (norm.includes('city') || norm.includes('town')) {
    return FIELD_EXPLANATIONS.city;
  }
  if (norm.includes('state') || norm.includes('province') || norm.includes('domicile')) {
    return FIELD_EXPLANATIONS.state;
  }
  if (norm.includes('country') || norm.includes('nation')) {
    return FIELD_EXPLANATIONS.country;
  }
  if (norm.includes('bank') && (norm.includes('account') || norm.includes('a c') || norm.includes('acct') || norm.includes('number'))) {
    return FIELD_EXPLANATIONS.bankaccount;
  }
  if (norm.includes('bank') && (norm.includes('name') || norm.includes('branch'))) {
    return FIELD_EXPLANATIONS.bankname;
  }
  if (norm.includes('income') || norm.includes('salary') || norm.includes('earnings') || norm.includes('revenue')) {
    return FIELD_EXPLANATIONS.income;
  }
  if (norm.includes('dob') || norm.includes('birth') || norm.includes('date of birth')) {
    return FIELD_EXPLANATIONS.dob;
  }
  if (norm.includes('gender') || norm.includes('sex')) {
    return FIELD_EXPLANATIONS.gender;
  }
  if (norm.includes('blood')) {
    return FIELD_EXPLANATIONS.bloodgroup;
  }
  if (norm.includes('marital') || norm.includes('married')) {
    return FIELD_EXPLANATIONS.marital;
  }
  if (norm.includes('nationality')) {
    return FIELD_EXPLANATIONS.nationality;
  }
  if (norm.includes('first name') || norm.includes('given name')) {
    return FIELD_EXPLANATIONS.firstname;
  }
  if (norm.includes('last name') || norm.includes('surname') || norm.includes('family name')) {
    return FIELD_EXPLANATIONS.lastname;
  }
  if (norm.includes('name') && !norm.includes('user') && !norm.includes('trade') && !norm.includes('biz') && !norm.includes('business') && !norm.includes('firm')) {
    return FIELD_EXPLANATIONS.fullname;
  }
  if (norm.includes('email') || norm.includes('mail')) {
    return FIELD_EXPLANATIONS.email;
  }
  if (norm.includes('phone') || norm.includes('mobile') || norm.includes('cell') || norm.includes('contact') || norm.includes('whatsapp')) {
    return FIELD_EXPLANATIONS.phone;
  }
  if (norm.includes('linkedin')) {
    return FIELD_EXPLANATIONS.linkedin;
  }
  if (norm.includes('github') || norm.includes('portfolio') || norm.includes('website')) {
    return FIELD_EXPLANATIONS.github;
  }
  if (norm.includes('college') || norm.includes('university') || norm.includes('institute') || norm.includes('school')) {
    return FIELD_EXPLANATIONS.college;
  }
  if (norm.includes('degree') || norm.includes('course') || norm.includes('stream') || norm.includes('major')) {
    return FIELD_EXPLANATIONS.degree;
  }
  if (norm.includes('branch') || norm.includes('discipline')) {
    return FIELD_EXPLANATIONS.branch;
  }
  if (norm.includes('roll') || norm.includes('hall ticket') || norm.includes('registration no') || norm.includes('enrollment') || norm.includes('student id')) {
    return FIELD_EXPLANATIONS.rollno;
  }
  if (norm.includes('cgpa') || norm.includes('gpa') || norm.includes('percentage') || norm.includes('marks') || norm.includes('score')) {
    return FIELD_EXPLANATIONS.cgpa;
  }
  if (norm.includes('grad') || norm.includes('passing') || norm.includes('batch') || norm.includes('year of completion')) {
    return FIELD_EXPLANATIONS.gradyear;
  }
  if (norm.includes('passport')) {
    return FIELD_EXPLANATIONS.passport;
  }
  if (norm.includes('voter') || norm.includes('epic')) {
    return FIELD_EXPLANATIONS.voter;
  }
  if (norm.includes('ration')) {
    return FIELD_EXPLANATIONS.ration;
  }
  if (norm.includes('trade') && norm.includes('name')) {
    return FIELD_EXPLANATIONS.tradename;
  }
  if (norm.includes('business') || norm.includes('enterprise') || norm.includes('firm') || norm.includes('company')) {
    return FIELD_EXPLANATIONS.business;
  }
  if (norm.includes('username') || norm.includes('login') || norm.includes('user id')) {
    return FIELD_EXPLANATIONS.portalusername;
  }
  if (norm.includes('turnover')) {
    return FIELD_EXPLANATIONS.turnover;
  }

  // 2. Type-based Fallback
  const cleanTitle = rawLabel ? rawLabel.trim() : 'This Field';
  if (fieldType === 'email') {
    return {
      whatToEnter: `Enter a valid email address for ${cleanTitle}.`,
      example: "user@example.com",
      tip: "Ensure you have access to this inbox to receive verification links.",
      warning: "Double-check for spelling mistakes before submitting."
    };
  }
  if (fieldType === 'tel') {
    return {
      whatToEnter: `Enter a valid 10-digit telephone or mobile number for ${cleanTitle}.`,
      example: "9876543210",
      tip: "Provide a number that can receive SMS notifications and OTP verification.",
      warning: "Do not add leading zeros or country codes unless required."
    };
  }
  if (fieldType === 'date') {
    return {
      whatToEnter: `Select or enter the appropriate date for ${cleanTitle}.`,
      example: "YYYY-MM-DD",
      tip: "Use the calendar picker or enter in standard date format.",
      warning: "Ensure the date matches your official supporting records."
    };
  }
  if (fieldType === 'number') {
    return {
      whatToEnter: `Enter the numerical value for ${cleanTitle}.`,
      example: "e.g. 100",
      tip: "Enter only numeric digits without special symbols unless instructed.",
      warning: "Verify the decimal points or unit of measurement if applicable."
    };
  }
  if (fieldType === 'url') {
    return {
      whatToEnter: `Enter the complete web link (URL) for ${cleanTitle}.`,
      example: "https://example.com",
      tip: "Copy and paste directly from your browser address bar to prevent errors.",
      warning: "Ensure the link includes the 'https://' protocol."
    };
  }

  // 3. Universal Smart Fallback
  return {
    whatToEnter: `Enter your official ${cleanTitle} as per your authorized documentation.`,
    example: `e.g. Valid ${cleanTitle}`,
    tip: `Ensure this information aligns with all government identity cards and certificates.`,
    warning: `Discrepancies in ${cleanTitle} may delay form verification or require manual resubmission.`
  };
}
