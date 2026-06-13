const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isDbConnected } = require('../services/dbHelper');
const { JWT_SECRET } = require('../middleware/authMiddleware');

// In-memory fallback users list if DB is disconnected
const memoryUsers = [];

/**
 * Helper to generate tokens
 */
function generateTokens(userId) {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1d' });
  const refreshToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

/**
 * Handle POST /api/auth/signup
 */
async function handleSignup(req, res) {
  const { name, email, password, confirmPassword, phone } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: 'Please fill in all required fields.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    let emailExists = false;
    if (isDbConnected()) {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) emailExists = true;
    } else {
      emailExists = memoryUsers.some(u => u.email === normalizedEmail);
    }

    if (emailExists) {
      return res.status(400).json({ error: 'A user with this email already exists.' });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let newUser;
    if (isDbConnected()) {
      newUser = await User.create({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        phone
      });
    } else {
      newUser = {
        _id: 'mem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        name,
        email: normalizedEmail,
        password: hashedPassword,
        phone
      };
      memoryUsers.push(newUser);
    }

    const { accessToken, refreshToken } = generateTokens(newUser._id.toString());

    if (isDbConnected()) {
      newUser.refresh_token = refreshToken;
      await newUser.save();
    } else {
      newUser.refresh_token = refreshToken;
    }

    res.json({
      success: true,
      token: accessToken,
      refreshToken,
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone
      }
    });

  } catch (err) {
    console.error('[auth] Signup error:', err.message);
    res.status(500).json({ error: err.message || 'Signup failed' });
  }
}

/**
 * Handle POST /api/auth/login
 */
async function handleLogin(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter both email and password.' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    let user = null;
    if (isDbConnected()) {
      user = await User.findOne({ email: normalizedEmail });
    } else {
      user = memoryUsers.find(u => u.email === normalizedEmail);
    }

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const { accessToken, refreshToken } = generateTokens(user._id.toString());

    if (isDbConnected()) {
      user.refresh_token = refreshToken;
      await user.save();
    } else {
      user.refresh_token = refreshToken;
    }

    res.json({
      success: true,
      token: accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });

  } catch (err) {
    console.error('[auth] Login error:', err.message);
    res.status(500).json({ error: err.message || 'Login failed' });
  }
}

/**
 * Handle POST /api/auth/refresh
 */
async function handleRefresh(req, res) {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ error: 'Refresh token is required.' });
  }

  try {
    const decoded = jwt.verify(refresh_token, JWT_SECRET);
    const userId = decoded.userId;

    let user = null;
    if (isDbConnected()) {
      user = await User.findById(userId);
    } else {
      user = memoryUsers.find(u => u._id === userId);
    }

    if (!user || user.refresh_token !== refresh_token) {
      return res.status(401).json({ error: 'Invalid refresh token.' });
    }

    const tokens = generateTokens(userId);

    if (isDbConnected()) {
      user.refresh_token = tokens.refreshToken;
      await user.save();
    } else {
      user.refresh_token = tokens.refreshToken;
    }

    res.json({
      success: true,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });

  } catch (err) {
    res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
}

/**
 * Handle POST /api/auth/logout
 */
async function handleLogout(req, res) {
  const { refresh_token } = req.body;
  if (!refresh_token) {
    return res.json({ success: true, message: 'Logged out successfully.' });
  }

  try {
    if (isDbConnected()) {
      await User.findOneAndUpdate({ refresh_token }, { $unset: { refresh_token: 1 } });
    } else {
      const user = memoryUsers.find(u => u.refresh_token === refresh_token);
      if (user) {
        user.refresh_token = null;
      }
    }
  } catch (err) {
    console.warn('[auth] Error clearing refresh token:', err.message);
  }

  res.json({ success: true, message: 'Logged out successfully.' });
}

/**
 * Handle POST /api/auth/forgot-password
 */
async function handleForgotPassword(req, res) {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  let userExists = false;

  if (isDbConnected()) {
    const user = await User.findOne({ email: normalizedEmail });
    if (user) userExists = true;
  } else {
    userExists = memoryUsers.some(u => u.email === normalizedEmail);
  }

  if (!userExists) {
    return res.status(404).json({ error: 'No account with that email was found.' });
  }

  // Development reset token
  const resetToken = jwt.sign({ email: normalizedEmail }, JWT_SECRET, { expiresIn: '1h' });
  const resetLink = `/reset-password?token=${resetToken}`;

  res.json({
    success: true,
    message: 'Reset instructions generated successfully.',
    resetLink // Returned directly for the frontend demo to implement forgot-password flow
  });
}

/**
 * Handle GET /api/auth/me
 */
async function handleMe(req, res) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    let user = null;
    if (isDbConnected()) {
      user = await User.findById(userId).select('-password');
    } else {
      user = memoryUsers.find(u => u._id === userId);
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (err) {
    res.status(401).json({ error: 'Session expired or invalid.' });
  }
}

module.exports = {
  handleSignup,
  handleLogin,
  handleRefresh,
  handleLogout,
  handleForgotPassword,
  handleMe
};
