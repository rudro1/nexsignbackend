'use strict';

const User = require('../models/User');
const jwt  = require('jsonwebtoken');

// ═══════════════════════════════════════════════════════════════
// HELPER — Generate JWT
// ═══════════════════════════════════════════════════════════════
function generateToken(user, expiresIn = '7d') {
  return jwt.sign(
    {
      id:    String(user._id),
      email: user.email,
      role:  user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn },
  );
}

// ═══════════════════════════════════════════════════════════════
// HELPER — Safe user response (no sensitive fields)
// ═══════════════════════════════════════════════════════════════
function userResponse(user) {
  return {
    id:               String(user._id),
    full_name:        user.full_name,
    email:            user.email,
    role:             user.role,
    avatar:           user.avatar           || null,
    company_name:     user.company_name     || null,
    company_logo:     user.company_logo     || null,
    designation:      user.designation      || null,
    phone:            user.phone            || null,
    is_email_verified:user.is_email_verified|| false,
    stats:            user.stats            || {},
    last_login:       user.last_login       || null,
    createdAt:        user.createdAt,
  };
}

// ═══════════════════════════════════════════════════════════════
// HELPER — Get device + IP info from request
// ═══════════════════════════════════════════════════════════════
function getRequestMeta(req) {
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.ip ||
    req.socket?.remoteAddress ||
    'Unknown';

  const ua = req.headers['user-agent'] || '';

  return { ip, userAgent: ua };
}

// ═══════════════════════════════════════════════════════════════
// POST /auth/register
// ═══════════════════════════════════════════════════════════════
exports.register = async (req, res) => {
  try {
    const {
      full_name,
      email,
      password,
      company_name,
      designation,
      phone,
    } = req.body;

    // ── Validation ─────────────────────────────────────────────
    if (!full_name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        code:    'VALIDATION_ERROR',
        message: 'Full name, email and password are required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        code:    'WEAK_PASSWORD',
        message: 'Password must be at least 6 characters.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // ── Duplicate check ────────────────────────────────────────
    const existing = await User.findOne({ email: cleanEmail })
      .select('_id')
      .lean();

    if (existing) {
      return res.status(409).json({
        success: false,
        code:    'EMAIL_EXISTS',
        message: 'This email is already registered.',
      });
    }

    // ── Create user ────────────────────────────────────────────
    // Password hashing → User model pre-save hook handles it
    const user = await User.create({
      full_name:    full_name.trim(),
      email:        cleanEmail,
      password,
      role:         'user',
      company_name: company_name?.trim() || null,
      designation:  designation?.trim()  || null,
      phone:        phone?.trim()        || null,
    });

    // ── Update last login ──────────────────────────────────────
    const { ip, userAgent } = getRequestMeta(req);
    user.last_login        = new Date();
    user.last_login_ip     = ip;
    user.last_login_device = userAgent.substring(0, 200);
    await user.save();

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user:    userResponse(user),
    });

  } catch (err) {
    console.error('[authController] Register error:', err.message);

    // MongoDB duplicate key
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        code:    'EMAIL_EXISTS',
        message: 'This email is already registered.',
      });
    }

    return res.status(500).json({
      success: false,
      code:    'SERVER_ERROR',
      message: 'Registration failed. Please try again.',
    });
  }
};

// ═══════════════════════════════════════════════════════════════
// POST /auth/login
// ═══════════════════════════════════════════════════════════════
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ── Validation ─────────────────────────────────────────────
    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        code:    'VALIDATION_ERROR',
        message: 'Email and password are required.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // ── Find user (include password) ───────────────────────────
    const user = await User.findByEmailWithPassword(cleanEmail);

    if (!user) {
      return res.status(401).json({
        success: false,
        code:    'INVALID_CREDENTIALS',
        message: 'Invalid email or password.',
      });
    }

    // ── Account status check ───────────────────────────────────
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        code:    'ACCOUNT_DISABLED',
        message: 'Your account has been disabled. Contact support.',
      });
    }

    // ── Password check ─────────────────────────────────────────
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        code:    'INVALID_CREDENTIALS',
        message: 'Invalid email or password.',
      });
    }

    // ── Update last login ──────────────────────────────────────
    const { ip, userAgent } = getRequestMeta(req);
    user.last_login        = new Date();
    user.last_login_ip     = ip;
    user.last_login_device = userAgent.substring(0, 200);
    await user.save();

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user:    userResponse(user),
    });

  } catch (err) {
    console.error('[authController] Login error:', err.message);
    return res.status(500).json({
      success: false,
      code:    'SERVER_ERROR',
      message: 'Login failed. Please try again.',
    });
  }
};

// ═══════════════════════════════════════════════════════════════
// POST /auth/google
// ═══════════════════════════════════════════════════════════════
exports.googleAuth = async (req, res) => {
  try {
    const { name, email, googleId, avatar } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({
        success: false,
        code:    'VALIDATION_ERROR',
        message: 'Google authentication data is incomplete.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const { ip, userAgent } = getRequestMeta(req);

    // ── Find or create user ────────────────────────────────────
    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      // New user via Google
      user = await User.create({
        full_name: name?.trim() || 'Google User',
        email:     cleanEmail,
        googleId,
        avatar:    avatar || null,
        role:      'user',
        is_email_verified: true, // Google verified
      });
    } else {
      // Existing user — update Google info
      let changed = false;

      if (!user.googleId) {
        user.googleId = googleId;
        changed = true;
      }
      if (avatar && !user.avatar) {
        user.avatar = avatar;
        changed = true;
      }
      if (!user.is_email_verified) {
        user.is_email_verified = true;
        changed = true;
      }

      if (changed) await user.save();
    }

    // ── Account status check ───────────────────────────────────
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        code:    'ACCOUNT_DISABLED',
        message: 'Your account has been disabled. Contact support.',
      });
    }

    // ── Update last login ──────────────────────────────────────
    user.last_login        = new Date();
    user.last_login_ip     = ip;
    user.last_login_device = userAgent.substring(0, 200);
    await user.save();

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Google authentication successful.',
      token,
      user:    userResponse(user),
    });

  } catch (err) {
    console.error('[authController] Google auth error:', err.message);

    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        code:    'EMAIL_EXISTS',
        message: 'This email is already registered with a different method.',
      });
    }

    return res.status(500).json({
      success: false,
      code:    'SERVER_ERROR',
      message: 'Google authentication failed.',
    });
  }
};

// ═══════════════════════════════════════════════════════════════
// GET /auth/me
// ═══════════════════════════════════════════════════════════════
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -email_verification_token -password_reset_token -password_reset_expires')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        code:    'USER_NOT_FOUND',
        message: 'User not found.',
      });
    }

    return res.json({
      success: true,
      user:    userResponse(user),
    });

  } catch (err) {
    console.error('[authController] GetMe error:', err.message);
    return res.status(500).json({
      success: false,
      code:    'SERVER_ERROR',
      message: 'Failed to fetch user data.',
    });
  }
};

// ═══════════════════════════════════════════════════════════════
// PUT /auth/profile
// Update profile info
// ═══════════════════════════════════════════════════════════════
exports.updateProfile = async (req, res) => {
  try {
    const {
      full_name,
      company_name,
      company_logo,
      designation,
      phone,
      avatar,
    } = req.body;

    // ── Build update object ────────────────────────────────────
    const updates = {};
    if (full_name?.trim())    updates.full_name    = full_name.trim();
    if (company_name !== undefined) updates.company_name = company_name?.trim() || null;
    if (company_logo !== undefined) updates.company_logo = company_logo || null;
    if (designation  !== undefined) updates.designation  = designation?.trim()  || null;
    if (phone        !== undefined) updates.phone        = phone?.trim()        || null;
    if (avatar       !== undefined) updates.avatar       = avatar || null;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        code:    'NO_CHANGES',
        message: 'No fields to update.',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true },
    ).select('-password -email_verification_token -password_reset_token');

    if (!user) {
      return res.status(404).json({
        success: false,
        code:    'USER_NOT_FOUND',
        message: 'User not found.',
      });
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user:    userResponse(user),
    });

  } catch (err) {
    console.error('[authController] UpdateProfile error:', err.message);
    return res.status(500).json({
      success: false,
      code:    'SERVER_ERROR',
      message: 'Profile update failed.',
    });
  }
};

// ═══════════════════════════════════════════════════════════════
// PUT /auth/change-password
// ═══════════════════════════════════════════════════════════════
exports.changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        code:    'VALIDATION_ERROR',
        message: 'Current and new password are required.',
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        code:    'WEAK_PASSWORD',
        message: 'New password must be at least 6 characters.',
      });
    }

    // ── Get user with password ─────────────────────────────────
    const user = await User.findByEmailWithPassword(req.user.email);

    if (!user) {
      return res.status(404).json({
        success: false,
        code:    'USER_NOT_FOUND',
        message: 'User not found.',
      });
    }

    // ── Verify current password ────────────────────────────────
    const isMatch = await user.comparePassword(current_password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        code:    'WRONG_PASSWORD',
        message: 'Current password is incorrect.',
      });
    }

    // ── Update password (pre-save hook will hash it) ───────────
    user.password = new_password;
    await user.save();

    // ── Generate new token ─────────────────────────────────────
    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Password changed successfully.',
      token,
    });

  } catch (err) {
    console.error('[authController] ChangePassword error:', err.message);
    return res.status(500).json({
      success: false,
      code:    'SERVER_ERROR',
      message: 'Password change failed.',
    });
  }
};

// ═══════════════════════════════════════════════════════════════
// POST /auth/logout (optional — client clears token)
// ═══════════════════════════════════════════════════════════════
exports.logout = async (req, res) => {
  // JWT is stateless — client must clear token
  // If using cookies:
  res.clearCookie('nexsign_token');

  return res.json({
    success: true,
    message: 'Logged out successfully.',
  });
};