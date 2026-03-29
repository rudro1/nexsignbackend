const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate Token Helper
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      email: user.email,
      role: user.role 
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: '7d' }
  );
};

// --- LOGIN ---
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    const token = generateToken(user);

    res.json({ 
      success: true,
      token, 
      user: { 
        id: user._id, 
        full_name: user.full_name, 
        email: user.email, 
        role: user.role
      }
    });

  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --- REGISTER ---
exports.register = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;
    
    if (!full_name || !email || !password || password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required and password must be at least 6 characters" 
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: "Email already registered" 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      full_name: full_name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: 'user' // Default role
    });

    const token = generateToken(user);

    res.status(201).json({ 
      success: true,
      token, 
      user: { 
        id: user._id, 
        full_name: user.full_name, 
        email: user.email, 
        role: user.role 
      }
    });

  } catch (error) {
    console.error("Register Error:", error.message);
    res.status(500).json({ success: false, message: "Registration failed" });
  }
};

// --- GOOGLE AUTH ---
exports.googleAuth = async (req, res) => {
  try {
    const { name, email, googleId } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      user = await User.create({
        full_name: name,
        email: cleanEmail,
        googleId,
        role: 'user'
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    const token = generateToken(user);

    res.json({ 
      success: true, 
      token, 
      user: { 
        id: user._id, 
        full_name: user.full_name, 
        email: user.email, 
        role: user.role
      } 
    });

  } catch (error) {
    console.error("Google Auth Error:", error.message);
    res.status(500).json({ success: false, message: "Google authentication failed" });
  }
};

// --- GET ME ---
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
