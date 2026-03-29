const mongoose = require('mongoose');

// ── CC List Schema ────────────────────────────────────────
const ccSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'CC name is required'],
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      required: [true, 'CC email is required'],
    },
    designation: {
      type: String,
      trim: true,
      default: null,
    },
    notifiedAt: {
      type: Date,
      default: null,
    },
    finalPdfSentAt: {
      type: Date,
      default: null,
    },
  },
  { _id: true }
);

// ── Party Schema ──────────────────────────────────────────
const partySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      required: true,
    },
    designation: {
      type: String,
      trim: true,
      default: null,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    color: {
      type: String,
      default: '#3B82F6', // Tailwind blue-500
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'viewed', 'signed', 'declined'],
      default: 'pending',
    },
    token: {
      type: String,
      index: true,
      sparse: true,
      select: false, // token বাইরে যাবে না
    },
    tokenExpiresAt: {
      type: Date,
      default: null,
    },

    // ── Email Tracking ──────────────────────────────
    emailSentAt: {
      type: Date,
      default: null,
    },
    emailOpenedAt: {
      type: Date,
      default: null,
    },
    emailOpenCount: {
      type: Number,
      default: 0,
    },
    linkClickedAt: {
      type: Date,
      default: null,
    },
    linkClickCount: {
      type: Number,
      default: 0,
    },

    // ── Signing Info ────────────────────────────────
    signedAt: {
      type: Date,
      default: null,
    },
    declinedAt: {
      type: Date,
      default: null,
    },
    declineReason: {
      type: String,
      default: null,
    },

    // ── Device & Location (Audit) ───────────────────
    device: {
      type: String,
      default: null, // "iPhone 6", "Samsung Galaxy S23"
    },
    browser: {
      type: String,
      default: null, // "Safari 17", "Chrome 120"
    },
    os: {
      type: String,
      default: null, // "iOS 12.5", "Android 13"
    },
    ipAddress: {
      type: String,
      default: null,
    },
    city: {
      type: String,
      default: null, // "Rajshahi"
    },
    region: {
      type: String,
      default: null, // "Rajshahi Division"
    },
    country: {
      type: String,
      default: null, // "Bangladesh"
    },
    postalCode: {
      type: String,
      default: null, // "6400"
    },
    timezone: {
      type: String,
      default: null, // "Asia/Dhaka"
    },
    localSignedTime: {
      type: String,
      default: null, // "2:30 PM BST+6"
    },
    userAgent: {
      type: String,
      default: null,
      select: false,
    },
    latitude: {
      type: String,
      default: null,
    },
    longitude: {
      type: String,
      default: null,
    },
  },
  { _id: true }
);

// ── Field Schema (PDF Fields) ─────────────────────────────
const fieldSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['text', 'signature', 'date', 'checkbox'],
      required: true,
    },
    partyIndex: {
      type: Number,
      required: true,
    },
    partyEmail: {
      type: String,
      default: null,
    },
    page: {
      type: Number,
      required: true,
      default: 1,
    },

    // ── Position (percentage based - responsive) ────
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },

    // ── Styling ─────────────────────────────────────
    fontSize: { type: Number, default: 14 },
    fontFamily: {
      type: String,
      default: 'Inter',
    },
    fontWeight: {
      type: String,
      enum: ['normal', 'bold'],
      default: 'normal',
    },
    color: {
      type: String,
      default: '#000000',
    },
    backgroundColor: {
      type: String,
      default: 'transparent',
    },
    label: {
      type: String,
      default: null,
    },
    placeholder: {
      type: String,
      default: null,
    },
    required: {
      type: Boolean,
      default: true,
    },

    // ── Filled Value (after signing) ─────────────────
    value: {
      type: String,
      default: null,
    },
    filledAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

// ── Main Document Schema ──────────────────────────────────
const documentSchema = new mongoose.Schema(
  {
    // ── Basic Info ──────────────────────────────────────
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    message: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },

    // ── Company Info ────────────────────────────────────
    companyName: {
      type: String,
      trim: true,
      default: '',
    },
    companyLogo: {
      type: String,
      default: null, // Cloudinary URL
    },

    // ── File Info ───────────────────────────────────────
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    fileId: {
      type: String,
      required: [true, 'File ID is required'],
    },
    fileName: {
      type: String,
      default: null,
    },
    fileSize: {
      type: Number,
      default: null, // bytes
    },
    totalPages: {
      type: Number,
      default: 1,
    },

    // ── Signed PDF ──────────────────────────────────────
    signedFileUrl: {
      type: String,
      default: null,
    },
    signedFileId: {
      type: String,
      default: null,
    },

    // ── Owner ───────────────────────────────────────────
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // ── Workflow ────────────────────────────────────────
    workflowType: {
      type: String,
      enum: ['sequential', 'parallel', 'template_instance'],
      default: 'sequential',
    },
    status: {
      type: String,
      enum: ['draft', 'in_progress', 'completed', 'cancelled', 'declined'],
      default: 'draft',
      index: true,
    },
    currentPartyIndex: {
      type: Number,
      default: 0,
    },

    // ── Parties & CC ────────────────────────────────────
    parties: {
      type: [partySchema],
      default: [],
    },
    ccList: {
      type: [ccSchema],
      default: [],
    },

    // ── Fields (PDF Drag & Drop) ─────────────────────────
    fields: {
      type: [fieldSchema],
      default: [],
    },

    // ── Template Related ─────────────────────────────────
    isTemplate: {
      type: Boolean,
      default: false,
      index: true,
    },
    templateName: {
      type: String,
      trim: true,
      default: null,
    },
    sourceTemplateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      default: null,
    },
    usageCount: {
      type: Number,
      default: 0,
    },

    // ── One-to-Many Template ─────────────────────────────
    isMasterTemplate: {
      type: Boolean,
      default: false,
    },
    masterTemplateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      default: null,
    },
    bossSignedPdfUrl: {
      type: String,
      default: null, // Boss sign embed করা PDF
    },
    bossSignedAt: {
      type: Date,
      default: null,
    },
    masterStatus: {
      type: String,
      enum: [
        'draft',
        'boss_pending',
        'boss_signed',
        'distributing',
        'active',
        'completed',
      ],
      default: null,
    },

    // ── Sender Meta ──────────────────────────────────────
    senderMeta: {
      name: { type: String, default: null },
      email: { type: String, default: null },
      designation: { type: String, default: null },
      ip: { type: String, default: null },
      device: { type: String, default: null },
      browser: { type: String, default: null },
      city: { type: String, default: null },
      timezone: { type: String, default: null },
    },

    // ── Timestamps ───────────────────────────────────────
    sentAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null, // Document expiry
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes (Performance) ─────────────────────────────────
documentSchema.index({ owner: 1, status: 1 });
documentSchema.index({ owner: 1, createdAt: -1 });
documentSchema.index({ 'parties.token': 1 });
documentSchema.index({ 'parties.email': 1 });
documentSchema.index({ 'parties.status': 1 });
documentSchema.index({ status: 1, createdAt: -1 });
documentSchema.index({ isTemplate: 1, owner: 1 });
documentSchema.index({ isMasterTemplate: 1 });
documentSchema.index({ masterTemplateId: 1 });
documentSchema.index({ workflowType: 1, status: 1 });

// ── Virtual: Completion Percentage ───────────────────────
documentSchema.virtual('completionPercentage').get(function () {
  if (!this.parties || this.parties.length === 0) return 0;
  const signed = this.parties.filter((p) => p.status === 'signed').length;
  return Math.round((signed / this.parties.length) * 100);
});

// ── Virtual: Is Expired ───────────────────────────────────
documentSchema.virtual('isExpired').get(function () {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

// ── Method: Get Next Pending Party ───────────────────────
documentSchema.methods.getNextPendingParty = function () {
  return this.parties.find(
    (p) => p.status === 'pending' || p.status === 'sent'
  );
};

// ── Method: Check All Signed ──────────────────────────────
documentSchema.methods.isAllSigned = function () {
  return this.parties.every((p) => p.status === 'signed');
};

// ── Method: Get Party by Token ────────────────────────────
documentSchema.methods.getPartyByToken = function (token) {
  return this.parties.find((p) => p.token === token);
};

// ── Method: Dashboard Stats Format ───────────────────────
documentSchema.methods.getDashboardFormat = function () {
  return {
    _id: this._id,
    title: this.title,
    companyName: this.companyName,
    companyLogo: this.companyLogo,
    status: this.status,
    workflowType: this.workflowType,
    totalParties: this.parties.length,
    signedParties: this.parties.filter((p) => p.status === 'signed').length,
    completionPercentage: this.completionPercentage,
    currentPartyIndex: this.currentPartyIndex,
    createdAt: this.createdAt,
    completedAt: this.completedAt,
    isTemplate: this.isTemplate,
    isMasterTemplate: this.isMasterTemplate,
  };
};

// ── Pre-save: Auto update status ──────────────────────────
documentSchema.pre('save', function (next) {
  if (this.parties && this.parties.length > 0) {
    const allSigned = this.parties.every((p) => p.status === 'signed');
    if (allSigned && this.status === 'in_progress') {
      this.status = 'completed';
      this.completedAt = new Date();
    }
  }
  next();
});

module.exports = mongoose.model('Document', documentSchema);