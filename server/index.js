import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

const DB_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'cloud_db.json');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const EMPTY_PROFILE = {
  firstName: '',
  lastName: '',
  fullName: '',
  email: '',
  phone: '',
  dob: '',
  gender: '',
  bloodGroup: '',
  nationality: '',
  maritalStatus: '',
  fathersName: '',
  mothersName: '',
  guardianName: '',
  permanentAddress: '',
  correspondenceAddress: '',
  city: '',
  state: '',
  pincode: '',
  country: '',
  aadhaarNumber: '',
  panNumber: '',
  passportNumber: '',
  highestQualification: '',
  institution: '',
  registrationNumber: '',
  occupation: '',
  bankAccount: '',
  ifsc: '',
  bankName: '',
  annualIncome: '',
  nominee: '',
  emergencyContact: '',
  branch: '',
  cgpa: '',
  yearOfPassing: '',
  linkedin: '',
  github: '',
  portfolio: '',
  skills: '',
  gstNumber: '',
  businessName: '',
  tradeName: '',
  businessAddress: '',
  portalUsername: '',
  turnover: '',
  authorizedSignatory: '',
  customFields: {},
  learnedHistory: []
};

if (!fs.existsSync(DB_FILE)) {
  const initialDb = { users: [] };
  fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
}

function readDb() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database file:', err);
    return { users: [] };
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}

function findUser(req) {
  const authHeader = req.headers.authorization;
  const db = readDb();
  let user = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    user = db.users.find(u => u.token === token);
  }

  if (!user && req.query.email) {
    user = db.users.find(u => u.email.toLowerCase() === req.query.email.toLowerCase());
  }

  if (!user && req.body?.email) {
    user = db.users.find(u => u.email.toLowerCase() === req.body.email.toLowerCase());
  }

  return user;
}

// Routes

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'FormEasy Cloud Sync API is active',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, name, deviceName } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const db = readDb();
  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
  }

  const token = 'tok_' + Math.random().toString(36).substring(2, 12);
  const newUser = {
    id: 'usr_' + Date.now().toString(36),
    email: email.toLowerCase().trim(),
    password,
    name: name || email.split('@')[0],
    token,
    lastSynced: new Date().toISOString(),
    profile: {
      ...EMPTY_PROFILE,
      email: email.toLowerCase().trim(),
      firstName: name ? name.split(' ')[0] : '',
      lastName: name && name.split(' ').length > 1 ? name.split(' ').slice(1).join(' ') : '',
      fullName: name || ''
    },
    devices: [
      {
        id: 'dev_' + Date.now().toString(36),
        name: deviceName || 'Primary Browser',
        type: 'laptop',
        browser: 'Chrome Client',
        lastActive: 'Active now',
        isCurrent: true
      }
    ]
  };

  db.users.push(newUser);
  writeDb(db);

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    token: newUser.token,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      lastSynced: newUser.lastSynced,
      devices: newUser.devices
    },
    profile: newUser.profile
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password, deviceName } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const db = readDb();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const deviceLabel = deviceName || 'Device (' + (req.headers['user-agent']?.includes('Mac') ? 'macOS' : 'PC') + ')';
  user.devices.forEach(d => { d.isCurrent = false; });

  const existingDevice = user.devices.find(d => d.name === deviceLabel);
  if (existingDevice) {
    existingDevice.lastActive = 'Active now';
    existingDevice.isCurrent = true;
  } else {
    user.devices.unshift({
      id: 'dev_' + Date.now().toString(36),
      name: deviceLabel,
      type: 'laptop',
      browser: 'Chrome Client',
      lastActive: 'Active now',
      isCurrent: true
    });
  }

  user.lastSynced = new Date().toISOString();
  writeDb(db);

  res.json({
    success: true,
    message: 'Login successful',
    token: user.token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      lastSynced: user.lastSynced,
      devices: user.devices
    },
    profile: user.profile
  });
});

app.get('/api/user/profile', (req, res) => {
  let user = findUser(req);
  const db = readDb();
  if (!user && db.users.length > 0) {
    user = db.users[0];
  }

  if (!user) {
    return res.json({
      success: true,
      email: '',
      profile: EMPTY_PROFILE,
      lastSynced: new Date().toISOString(),
      devices: []
    });
  }

  res.json({
    success: true,
    email: user.email,
    profile: user.profile,
    lastSynced: user.lastSynced,
    devices: user.devices
  });
});

app.put('/api/user/profile', (req, res) => {
  const { profile } = req.body;
  if (!profile) {
    return res.status(400).json({ success: false, message: 'Profile payload is required' });
  }

  const db = readDb();
  let user = findUser(req);

  if (!user && profile.email) {
    user = db.users.find(u => u.email.toLowerCase() === profile.email.toLowerCase().trim());
  }

  if (!user && db.users.length > 0) {
    user = db.users[0];
  }

  // Provision initial profile record if no user exists
  if (!user) {
    const defaultEmail = (profile.email || 'user@formeasy.app').toLowerCase().trim();
    user = {
      id: 'usr_' + Date.now().toString(36),
      email: defaultEmail,
      password: 'password123',
      name: profile.fullName || (profile.firstName ? `${profile.firstName} ${profile.lastName}`.trim() : 'User'),
      token: 'tok_' + Math.random().toString(36).substring(2, 12),
      lastSynced: new Date().toISOString(),
      profile: { ...EMPTY_PROFILE, ...profile },
      devices: [{
        id: 'dev_primary',
        name: 'Browser Client (' + (req.headers['user-agent']?.includes('Mac') ? 'macOS' : 'PC') + ')',
        type: 'laptop',
        browser: 'Chrome Client',
        lastActive: 'Active now',
        isCurrent: true
      }]
    };
    db.users.push(user);
    writeDb(db);

    return res.json({
      success: true,
      message: 'Profile saved successfully',
      lastSynced: user.lastSynced,
      profile: user.profile
    });
  }

  const targetUser = db.users.find(u => u.id === user.id);
  if (targetUser) {
    targetUser.profile = { ...targetUser.profile, ...profile };
    targetUser.lastSynced = new Date().toISOString();
    writeDb(db);

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      lastSynced: targetUser.lastSynced,
      profile: targetUser.profile
    });
  }

  res.status(404).json({ success: false, message: 'User not found' });
});

app.get('/api/user/devices', (req, res) => {
  const user = findUser(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  res.json({
    success: true,
    devices: user.devices || []
  });
});

app.listen(PORT, () => {
  console.log(`FormEasy Sync Server running at http://localhost:${PORT}`);
});
