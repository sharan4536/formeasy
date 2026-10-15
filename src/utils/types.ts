export interface UserProfile {
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  nationality: string;
  maritalStatus: string;
  fathersName: string;
  mothersName: string;
  guardianName?: string;
  permanentAddress: string;
  correspondenceAddress: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  aadhaarNumber: string;
  panNumber: string;
  passportNumber?: string;
  highestQualification?: string;
  institution?: string;
  registrationNumber?: string;
  occupation?: string;
  bankAccount: string;
  ifsc: string;
  bankName?: string;
  annualIncome: string;
  nominee?: string;
}

export interface ConnectedDevice {
  id: string;
  name: string;
  type: 'laptop' | 'desktop' | 'mobile' | 'tablet';
  browser: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isLoggedIn: boolean;
  token?: string;
  lastSynced: string;
  syncCode: string;
  devices: ConnectedDevice[];
}

export interface UserPreferences {
  autoFillPageOnLoad: boolean;
  autoFillOnFocus: boolean;
  showFloatingWidget: boolean;
  confirmSensitive: boolean;
  showTips: boolean;
  showWarnings: boolean;
  showExamples: boolean;
  geminiApiKey: string;
}

export interface DetectedField {
  element: HTMLElement;
  label: string;
  matchedKey: keyof UserProfile | null;
  value: string | null;
  type: string;
}
