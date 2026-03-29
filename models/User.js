const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email',
      ],
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      minlength: [6, 'Password must be at least 6 characters'],
      default: 'google_login_user',
      select: false, // password query তে automatically আসবে না
    },
    googleId: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'super_admin'],
      default: 'user',
    },

    // ── Profile ──────────────────────────────────────────
    avatar: {
      type: String,
      default: null, // Cloudinary URL
    },
    company_name: {
      type: String,
      trim: true,
      default: null,
    },
    company_logo: {
      type: String,
      default: null, // Cloudinary URL
    },
    designation: {
      type: String,
      trim: true,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },

    // ── Account Status ────────────────────────────────────
    is_active: {
      type: Boolean,
      default: true,
    },
    is_email_verified: {
      type: Boolean,
      default: false,
    },
    email_verification_token: {
      type: String,
      default: null,
      select: false,
    },
    password_reset_token: {
      type: String,
      default: null,
      select: false,
    },
    password_reset_expires: {
      type: Date,
      default: null,
      select: false,
    },

    // ── Usage Stats (Dashboard fast load এর জন্য) ─────────
    stats: {
      total_documents: { type: Number, default: 0 },
      completed_documents: { type: Number, default: 0 },
      pending_documents: { type: Number, default: 0 },
      total_templates: { type: Number, default: 0 },
    },

    // ── Last Login Info ───────────────────────────────────
    last_login: {
      type: Date,
      default: null,
    },
    last_login_ip: {
      type: String,
      default: null,
    },
    last_login_device: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt auto
  }
);

// ── Indexes (Fast query) ──────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// ── Pre-save: Hash password ───────────────────────────────
userSchema.pre('save', async function (next) {
  // Password change না হলে skip
  if (!this.isModified('password')) return next();
  // Google login user skip
  if (this.password === 'google_login_user') return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ── Method: Compare Password ──────────────────────────────
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ── Method: Get Public Profile (sensitive data বাদ) ───────
userSchema.methods.getPublicProfile = function () {
  return {
    _id: this._id,
    full_name: this.full_name,
    email: this.email,
    role: this.role,
    avatar: this.avatar,
    company_name: this.company_name,
    company_logo: this.company_logo,
    designation: this.designation,
    phone: this.phone,
    is_active: this.is_active,
    is_email_verified: this.is_email_verified,
    stats: this.stats,
    last_login: this.last_login,
    createdAt: this.createdAt,
  };
};

// ── Method: Update Stats ──────────────────────────────────
userSchema.methods.updateStats = async function (field, increment = 1) {
  const validFields = [
    'total_documents',
    'completed_documents',
    'pending_documents',
    'total_templates',
  ];
  if (!validFields.includes(field)) return;

  this.stats[field] = (this.stats[field] || 0) + increment;
  await this.save();
};

// ── Static: Find by Email (with password) ─────────────────
userSchema.statics.findByEmailWithPassword = function (email) {
  return this.findOne({ email }).select('+password');
};

module.exports = mongoose.model('User', userSchema);