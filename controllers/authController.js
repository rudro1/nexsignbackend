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
// HELPER — Safe user response
// ═══════════════════════════════════════════════════════════════
function userResponse(user) {
  return {
    id:                String(user._id),
    full_name:         user.full_name,
    email:             user.email,
    role:              user.role,
    avatar:            user.avatar            || null,
    company_name:      user.company_name      || null,
    company_logo:      user.company_logo      || null,
    designation:       user.designation       || null,
    phone:             user.phone             || null,
    is_email_verified: user.is_email_verified || false,
    stats:             user.stats             || {},
    last_login:        user.last_login        || null,
    createdAt:         user.createdAt,
  };
}

// ═══════════════════════════════════════════════════════════════
// HELPER — Get IP + UA
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
      full_name, email, password,
      company_name, designation, phone,
    } = req.body;

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

    const existing = await User.findOne({ email: cleanEmail })
      .select('_id').lean();

    if (existing) {
      return res.status(409).json({
        success: false,
        code:    'EMAIL_EXISTS',
        message: 'This email is already registered.',
      });
    }

    const user = await User.create({
      full_name:    full_name.trim(),
      email:        cleanEmail,
      password,
      role:         'user',
      company_name: company_name?.trim() || null,
      designation:  designation?.trim()  || null,
      phone:        phone?.trim()        || null,
      is_email_verified: false,
    });

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

    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        code:    'VALIDATION_ERROR',
        message: 'Email and password are required.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user       = await User.findByEmailWithPassword(cleanEmail);

    if (!user) {
      return res.status(401).json({
        success: false,
        code:    'INVALID_CREDENTIALS',
        message: 'Invalid email or password.',
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        code:    'ACCOUNT_DISABLED',
        message: 'Your account has been disabled. Contact support.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        code:    'INVALID_CREDENTIALS',
        message: 'Invalid email or password.',
      });
    }

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
// POST /auth/google  ← FIXED
// ═══════════════════════════════════════════════════════════════
exports.googleAuth = async (req, res) => {
  try {
    const {
      name,
      email,
      photoURL,
      googleId,
    } = req.body;

    // ✅ শুধু email required
    if (!email?.trim()) {
      return res.status(400).json({
        success: false,
        code:    'VALIDATION_ERROR',
        message: 'Email is required.',
      });
    }

    const cleanEmail        = email.toLowerCase().trim();
    const { ip, userAgent } = getRequestMeta(req);
    const userAvatar        = photoURL || null;

    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      // ✅ New user — password ছাড়াই create
      const createData = {
        full_name:         name?.trim() ||
                           cleanEmail.split('@')[0] ||
                           'Google User',
        email:             cleanEmail,
        role:              'user',
        is_email_verified: true,
        is_active:         true,
      };

      if (googleId)    createData.googleId = googleId;
      if (userAvatar)  createData.avatar   = userAvatar;

      user = await User.create(createData);

    } else {
      // ✅ Existing user — update
      let changed = false;

      if (googleId && !user.googleId) {
        user.googleId = googleId;
        changed = true;
      }
      if (userAvatar && !user.avatar) {
        user.avatar = userAvatar;
        changed = true;
      }
      if (!user.is_email_verified) {
        user.is_email_verified = true;
        changed = true;
      }
      if (changed) await user.save();
    }

    if (user.is_active === false) {
      return res.status(403).json({
        success: false,
        code:    'ACCOUNT_DISABLED',
        message: 'Account disabled. Contact support.',
      });
    }

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
    console.error('[googleAuth] Error:', err.message);

    // ✅ Duplicate key → still login
    if (err.code === 11000) {
      try {
        const cleanEmail = req.body.email?.toLowerCase().trim();
        const user = await User.findOne({ email: cleanEmail });

        if (user && user.is_active !== false) {
          user.last_login = new Date();
          await user.save();
          const token = generateToken(user);
          return res.json({
            success: true,
            message: 'Google authentication successful.',
            token,
            user:    userResponse(user),
          });
        }
      } catch (e) {
        console.error('Recovery failed:', e.message);
      }
    }

    return res.status(500).json({
      success: false,
      code:    'SERVER_ERROR',
      message: 'Google authentication failed.',
    });
  }
};

// ═══════════════════════════════════════════════════════════════
// POST /auth/sync-password
// Firebase password reset এর পর backend sync
// ═══════════════════════════════════════════════════════════════
exports.syncPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        code:    'VALIDATION_ERROR',
        message: 'Email and password required.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user       = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        code:    'USER_NOT_FOUND',
        message: 'User not found.',
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        code:    'ACCOUNT_DISABLED',
        message: 'Account disabled.',
      });
    }

    // Update password
    user.password  = password;
    user.last_login = new Date();
    await user.save();

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Password synced successfully.',
      token,
      user:    userResponse(user),
    });

  } catch (err) {
    console.error('[authController] SyncPassword error:', err.message);
    return res.status(500).json({
      success: false,
      code:    'SERVER_ERROR',
      message: 'Password sync failed.',
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
// ═══════════════════════════════════════════════════════════════
exports.updateProfile = async (req, res) => {
  try {
    const {
      full_name, company_name, company_logo,
      designation, phone, avatar,
    } = req.body;

    const updates = {};
    if (full_name?.trim())          updates.full_name    = full_name.trim();
    if (company_name !== undefined)  updates.company_name = company_name?.trim() || null;
    if (company_logo !== undefined)  updates.company_logo = company_logo || null;
    if (designation  !== undefined)  updates.designation  = designation?.trim() || null;
    if (phone        !== undefined)  updates.phone        = phone?.trim() || null;
    if (avatar       !== undefined)  updates.avatar       = avatar || null;

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

    const user = await User.findByEmailWithPassword(req.user.email);

    if (!user) {
      return res.status(404).json({
        success: false,
        code:    'USER_NOT_FOUND',
        message: 'User not found.',
      });
    }

    const isMatch = await user.comparePassword(current_password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        code:    'WRONG_PASSWORD',
        message: 'Current password is incorrect.',
      });
    }

    user.password = new_password;
    await user.save();

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
// POST /auth/logout
// ═══════════════════════════════════════════════════════════════
exports.logout = async (req, res) => {
  res.clearCookie('nexsign_token');
  return res.json({
    success: true,
    message: 'Logged out successfully.',
  });
};