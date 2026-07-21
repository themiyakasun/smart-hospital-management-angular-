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

// JWT Secrets
const ACCESS_TOKEN_SECRET = 'temporary_access_token_secret_key_12345';
const REFRESH_TOKEN_SECRET = 'temporary_refresh_token_secret_key_67890';

// In-memory store for active refresh tokens
let refreshTokens = [];

// Helper function to read users from the JSON file
function readUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading users file:', err);
    return [];
  }
}

// Helper function to write users to the JSON file
function writeUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('Error writing users file:', err);
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

const authRouter = express.Router();

// Registration Endpoint
authRouter.post('/register', (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  // Basic validation
  if (!firstName || !lastName || !email || !password || !role) {
    return res
      .status(400)
      .json({ message: 'All fields are required: firstName, lastName, email, password, role' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const users = readUsers();

  // Check if user already exists
  if (users.find((u) => u.email === normalizedEmail)) {
    return res.status(400).json({ message: 'User with this email already exists' });
  }

  // Hash the password
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
  writeUsers(users);

  console.log(`[Register] Success: Registered user ${normalizedEmail} with role ${role}`);

  res.status(201).json({
    message: 'User registered successfully',
    user: {
      firstName,
      lastName,
      email: normalizedEmail,
      role,
    },
  });
});

// Login Endpoint
authRouter.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const users = readUsers();
  const user = users.find((u) => u.email === normalizedEmail);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // Generate tokens
  const accessToken = jwt.sign(
    { email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName },
    ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }, // Short-lived access token
  );

  const refreshToken = jwt.sign(
    { email: user.email },
    REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }, // Long-lived refresh token
  );

  // Save the refresh token
  refreshTokens.push(refreshToken);

  console.log(`[Login] Success: User ${normalizedEmail} logged in`);

  res.status(200).json({
    accessToken,
    refreshToken,
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  });
});

// Refresh Token Endpoint
authRouter.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required' });
  }

  // Verify that the token is active
  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ message: 'Refresh token is not active or invalid' });
  }

  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      // Remove invalid token
      refreshTokens = refreshTokens.filter((t) => t !== refreshToken);
      return res.status(403).json({ message: 'Invalid or expired refresh token' });
    }

    const users = readUsers();
    const user = users.find((u) => u.email === decoded.email);

    if (!user) {
      return res.status(403).json({ message: 'User no longer exists' });
    }

    // Rotate tokens (generate new access token & new refresh token)
    const newAccessToken = jwt.sign(
      { email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' },
    );

    const newRefreshToken = jwt.sign({ email: user.email }, REFRESH_TOKEN_SECRET, {
      expiresIn: '7d',
    });

    // Remove old and add new refresh token
    refreshTokens = refreshTokens.filter((t) => t !== refreshToken);
    refreshTokens.push(newRefreshToken);

    console.log(`[Token Refresh] Success: Rotated token for user ${user.email}`);

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  });
});

// Logout Endpoint
authRouter.post('/logout', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required to logout' });
  }

  refreshTokens = refreshTokens.filter((t) => t !== refreshToken);
  console.log('[Logout] Success: Refresh token invalidated');
  res.status(200).json({ message: 'Logged out successfully' });
});

// Mount the Auth Router
app.use('/api/auth', authRouter);

// A protected profile endpoint (Example of how to consume a JWT-secured route)
app.get('/api/profile', authenticateToken, (req, res) => {
  res.status(200).json({
    message: 'Profile data retrieved successfully',
    user: req.user,
  });
});

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(` Temporary Auth Backend running on port ${PORT}`);
  console.log(` URL: http://localhost:${PORT}`);
  console.log(` Endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/auth/register`);
  console.log(`   POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   POST http://localhost:${PORT}/api/auth/refresh`);
  console.log(`   POST http://localhost:${PORT}/api/auth/logout`);
  console.log(`   GET  http://localhost:${PORT}/api/profile (Protected)`);
  console.log(`==================================================`);
});
