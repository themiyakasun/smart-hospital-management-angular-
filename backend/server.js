const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const USERS_FILE = path.join(__dirname, 'users.json');
const DEPARTMENTS_FILE = path.join(__dirname, 'departments.json');
const DOCTORS_FILE = path.join(__dirname, 'doctors.json');

// JWT Secrets
const ACCESS_TOKEN_SECRET = 'temporary_access_token_secret_key_12345';
const REFRESH_TOKEN_SECRET = 'temporary_refresh_token_secret_key_67890';

// In-memory store for active refresh tokens
let refreshTokens = [];

// Initial Seed Data
const INITIAL_DEPARTMENTS = [
  { id: 'dep-1', name: 'Cardiology', description: 'Specializing in heart, blood vessels, and cardiovascular health.' },
  { id: 'dep-2', name: 'Neurology', description: 'Expert diagnosis and care for disorders of the brain and nervous system.' },
  { id: 'dep-3', name: 'Pediatrics', description: 'Comprehensive medical care for infants, children, and adolescents.' },
  { id: 'dep-4', name: 'Orthopedics', description: 'Treatment for bones, joints, ligaments, tendons, and muscle conditions.' }
];

const INITIAL_DOCTORS = [
  {
    id: 'doc-1',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    email: 'sarah.jenkins@hospital.com',
    phone: '+1-555-0192',
    specialization: 'Cardiologist',
    departmentId: 'dep-1',
    departmentName: 'Cardiology',
    availability: [
      { day: 'Monday', startTime: '09:00', endTime: '13:00' },
      { day: 'Wednesday', startTime: '14:00', endTime: '18:00' }
    ]
  },
  {
    id: 'doc-2',
    firstName: 'Robert',
    lastName: 'Chen',
    email: 'robert.chen@hospital.com',
    phone: '+1-555-0144',
    specialization: 'Neurologist',
    departmentId: 'dep-2',
    departmentName: 'Neurology',
    availability: [
      { day: 'Tuesday', startTime: '10:00', endTime: '16:00' },
      { day: 'Thursday', startTime: '10:00', endTime: '16:00' }
    ]
  }
];

// File Storage Helpers
function readData(filePath, initialData = []) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return initialData;
  }
}

function writeData(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// Middleware to verify access tokens (for protected routes)
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired access token' });
    }
    req.user = user;
    next();
  });
}

// ==========================================
// 1. AUTHENTICATION ROUTER (/api/auth)
// ==========================================
const authRouter = express.Router();

authRouter.post('/register', (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  if (!firstName || !lastName || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required: firstName, lastName, email, password, role' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const users = readData(USERS_FILE, []);

  if (users.find((u) => u.email === normalizedEmail)) {
    return res.status(400).json({ message: 'User with this email already exists' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id: Date.now().toString(),
    firstName,
    lastName,
    email: normalizedEmail,
    password: hashedPassword,
    role,
  };

  users.push(newUser);
  writeData(USERS_FILE, users);

  console.log(`[Auth:Register] Success for ${normalizedEmail} (${role})`);

  res.status(201).json({
    message: 'User registered successfully',
    user: { firstName, lastName, email: normalizedEmail, role }
  });
});

authRouter.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const users = readData(USERS_FILE, []);
  const user = users.find((u) => u.email === normalizedEmail);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const accessToken = jwt.sign(
    { email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName },
    ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { email: user.email },
    REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );

  refreshTokens.push(refreshToken);

  console.log(`[Auth:Login] Success for ${normalizedEmail}`);

  res.status(200).json({
    accessToken,
    refreshToken,
    user: { firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role }
  });
});

authRouter.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required' });
  }

  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ message: 'Refresh token is invalid or inactive' });
  }

  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      refreshTokens = refreshTokens.filter((t) => t !== refreshToken);
      return res.status(403).json({ message: 'Expired refresh token' });
    }

    const users = readData(USERS_FILE, []);
    const user = users.find((u) => u.email === decoded.email);

    if (!user) {
      return res.status(403).json({ message: 'User no longer exists' });
    }

    const newAccessToken = jwt.sign(
      { email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );

    const newRefreshToken = jwt.sign({ email: user.email }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

    refreshTokens = refreshTokens.filter((t) => t !== refreshToken);
    refreshTokens.push(newRefreshToken);

    console.log(`[Auth:Refresh] Rotated tokens for ${user.email}`);

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  });
});

authRouter.post('/logout', (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    refreshTokens = refreshTokens.filter((t) => t !== refreshToken);
  }
  console.log('[Auth:Logout] Token invalidated');
  res.status(200).json({ message: 'Logged out successfully' });
});

app.use('/api/auth', authRouter);

// ==========================================
// 2. DEPARTMENTS ROUTER (/api/departments)
// ==========================================
const departmentsRouter = express.Router();

// Get all departments
departmentsRouter.get('/', (req, res) => {
  const departments = readData(DEPARTMENTS_FILE, INITIAL_DEPARTMENTS);
  res.status(200).json(departments);
});

// Get department by ID
departmentsRouter.get('/:id', (req, res) => {
  const departments = readData(DEPARTMENTS_FILE, INITIAL_DEPARTMENTS);
  const department = departments.find(d => d.id === req.params.id);

  if (!department) {
    return res.status(404).json({ message: 'Department not found' });
  }
  res.status(200).json(department);
});

// Create department
departmentsRouter.post('/', (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Department name is required' });
  }

  const departments = readData(DEPARTMENTS_FILE, INITIAL_DEPARTMENTS);
  const newDepartment = {
    id: `dep-${Date.now()}`,
    name,
    description: description || ''
  };

  departments.push(newDepartment);
  writeData(DEPARTMENTS_FILE, departments);

  console.log(`[Department:Create] Added ${name}`);
  res.status(201).json(newDepartment);
});

// Update department
departmentsRouter.put('/:id', (req, res) => {
  const { name, description } = req.body;
  const departments = readData(DEPARTMENTS_FILE, INITIAL_DEPARTMENTS);
  const index = departments.findIndex(d => d.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: 'Department not found' });
  }

  departments[index] = {
    ...departments[index],
    ...(name && { name }),
    ...(description !== undefined && { description })
  };

  writeData(DEPARTMENTS_FILE, departments);

  // Update denormalized departmentName in doctors
  const doctors = readData(DOCTORS_FILE, INITIAL_DOCTORS);
  let updatedDoctors = false;
  doctors.forEach(doc => {
    if (doc.departmentId === req.params.id && name) {
      doc.departmentName = name;
      updatedDoctors = true;
    }
  });
  if (updatedDoctors) {
    writeData(DOCTORS_FILE, doctors);
  }

  res.status(200).json(departments[index]);
});

// Delete department
departmentsRouter.delete('/:id', (req, res) => {
  let departments = readData(DEPARTMENTS_FILE, INITIAL_DEPARTMENTS);
  const exists = departments.some(d => d.id === req.params.id);

  if (!exists) {
    return res.status(404).json({ message: 'Department not found' });
  }

  departments = departments.filter(d => d.id !== req.params.id);
  writeData(DEPARTMENTS_FILE, departments);

  res.status(200).json({ message: 'Department deleted successfully' });
});

app.use('/api/departments', departmentsRouter);

// ==========================================
// 3. DOCTORS ROUTER (/api/doctors)
// ==========================================
const doctorsRouter = express.Router();

// Get all doctors (supports query filters: ?departmentId=... or ?specialization=...)
doctorsRouter.get('/', (req, res) => {
  let doctors = readData(DOCTORS_FILE, INITIAL_DOCTORS);
  const { departmentId, specialization } = req.query;

  if (departmentId) {
    doctors = doctors.filter(d => d.departmentId === departmentId);
  }
  if (specialization) {
    doctors = doctors.filter(d => d.specialization.toLowerCase() === String(specialization).toLowerCase());
  }

  res.status(200).json(doctors);
});

// Get doctor by ID
doctorsRouter.get('/:id', (req, res) => {
  const doctors = readData(DOCTORS_FILE, INITIAL_DOCTORS);
  const doctor = doctors.find(d => d.id === req.params.id);

  if (!doctor) {
    return res.status(404).json({ message: 'Doctor not found' });
  }

  res.status(200).json(doctor);
});

// Create new doctor
doctorsRouter.post('/', (req, res) => {
  const { firstName, lastName, email, phone, specialization, departmentId, availability } = req.body;

  if (!firstName || !lastName || !email || !specialization || !departmentId) {
    return res.status(400).json({
      message: 'Required fields: firstName, lastName, email, specialization, departmentId'
    });
  }

  const departments = readData(DEPARTMENTS_FILE, INITIAL_DEPARTMENTS);
  const department = departments.find(d => d.id === departmentId);

  if (!department) {
    return res.status(400).json({ message: `Invalid departmentId '${departmentId}'. Department does not exist.` });
  }

  const doctors = readData(DOCTORS_FILE, INITIAL_DOCTORS);
  const newDoctor = {
    id: `doc-${Date.now()}`,
    firstName,
    lastName,
    email: email.toLowerCase().trim(),
    phone: phone || '',
    specialization,
    departmentId,
    departmentName: department.name,
    availability: Array.isArray(availability) ? availability : []
  };

  doctors.push(newDoctor);
  writeData(DOCTORS_FILE, doctors);

  console.log(`[Doctor:Create] Added Dr. ${firstName} ${lastName} (${specialization}) to ${department.name}`);
  res.status(201).json(newDoctor);
});

// Update doctor
doctorsRouter.put('/:id', (req, res) => {
  const doctors = readData(DOCTORS_FILE, INITIAL_DOCTORS);
  const index = doctors.findIndex(d => d.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: 'Doctor not found' });
  }

  const { firstName, lastName, email, phone, specialization, departmentId, availability } = req.body;

  let departmentName = doctors[index].departmentName;
  if (departmentId && departmentId !== doctors[index].departmentId) {
    const departments = readData(DEPARTMENTS_FILE, INITIAL_DEPARTMENTS);
    const department = departments.find(d => d.id === departmentId);
    if (!department) {
      return res.status(400).json({ message: `Invalid departmentId '${departmentId}'.` });
    }
    departmentName = department.name;
  }

  doctors[index] = {
    ...doctors[index],
    ...(firstName && { firstName }),
    ...(lastName && { lastName }),
    ...(email && { email: email.toLowerCase().trim() }),
    ...(phone !== undefined && { phone }),
    ...(specialization && { specialization }),
    ...(departmentId && { departmentId, departmentName }),
    ...(availability !== undefined && { availability: Array.isArray(availability) ? availability : [] })
  };

  writeData(DOCTORS_FILE, doctors);
  res.status(200).json(doctors[index]);
});

// Delete doctor
doctorsRouter.delete('/:id', (req, res) => {
  let doctors = readData(DOCTORS_FILE, INITIAL_DOCTORS);
  const exists = doctors.some(d => d.id === req.params.id);

  if (!exists) {
    return res.status(404).json({ message: 'Doctor not found' });
  }

  doctors = doctors.filter(d => d.id !== req.params.id);
  writeData(DOCTORS_FILE, doctors);

  res.status(200).json({ message: 'Doctor deleted successfully' });
});

app.use('/api/doctors', doctorsRouter);

// Profile Endpoint
app.get('/api/profile', authenticateToken, (req, res) => {
  res.status(200).json({
    message: 'Profile data retrieved successfully',
    user: req.user,
  });
});

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(` Temporary Smart Hospital Backend running on port ${PORT}`);
  console.log(` URL: http://localhost:${PORT}`);
  console.log(` Auth Endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/auth/register`);
  console.log(`   POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   POST http://localhost:${PORT}/api/auth/refresh`);
  console.log(`   POST http://localhost:${PORT}/api/auth/logout`);
  console.log(` Department Endpoints:`);
  console.log(`   GET/POST http://localhost:${PORT}/api/departments`);
  console.log(`   GET/PUT/DELETE http://localhost:${PORT}/api/departments/:id`);
  console.log(` Doctor Endpoints:`);
  console.log(`   GET/POST http://localhost:${PORT}/api/doctors`);
  console.log(`   GET/PUT/DELETE http://localhost:${PORT}/api/doctors/:id`);
  console.log(`==================================================`);
});
