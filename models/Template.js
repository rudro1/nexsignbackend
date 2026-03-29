// server/models/Template.js
const mongoose = require('mongoose');

// ─── Field Schema (PDF drag-drop fields) ─────────────────────────
const FieldSchema = new mongoose.Schema({
  id:          { type: String, required: true },
  type:        { type: String, enum: ['signature', 'initial', 'date', 'text', 'checkbox', 'number'], required: true },
  page:        { type: Number, required: true, min: 1 },
  x:           { type: Number, required: true },
  y:           { type: Number, required: true },
  width:       { type: Number, required: true },
  height:      { type: Number, required: true },
  fontFamily:  { type: String, default: 'Helvetica' },
  fontSize:    { type: Number, default: 14 },
  required:    { type: Boolean, default: true },
  placeholder: { type: String, default: '' },
}, { _id: false });

// ─── CC Schema ────────────────────────────────────────────────────
const CCSchema = new mongoose.Schema({
  name:        { type: String, default: '' },
  email:       { type: String, required: true, lowercase: true, trim: true },
  designation: { type: String, default: '' },
}, { _id: false });

// ─── Recipient Schema (employees) ────────────────────────────────
const RecipientSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  email:       { type: String, required: true, lowercase: true, trim: true },
  designation: { type: String, default: '' },
  // Per-recipient custom data (optional)
  customData:  { type: Map, of: String, default: {} },
}, { _id: false });

// ─── Main Template Schema ─────────────────────────────────────────
const TemplateSchema = new mongoose.Schema({

  // ── Basic info ──────────────────────────────────────────────
  title: {
    type:      String,
    required:  [true, 'Template title is required'],
    trim:      true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },

  description: {
    type:      String,
    trim:      true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default:   '',
  },

  // ── Owner (Boss) ────────────────────────────────────────────
  owner: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
    index:    true,
  },

  // ── PDF file (original — boss signs this first) ─────────────
  fileUrl: {
    type:     String,
    required: [true, 'PDF file URL is required'],
  },

  // Cloudinary public_id for deletion
  filePublicId: {
    type:    String,
    default: '',
  },

  // ── Boss signature (embedded permanently into base PDF) ──────
  bossSignature: {
    dataUrl:    { type: String, default: null },  // PNG data URL
    signedAt:   { type: Date,   default: null },
    ipAddress:  { type: String, default: '' },
    location:   { type: String, default: '' },
    deviceInfo: { type: Object, default: {} },
  },

  // Boss-signed PDF (after boss signs → becomes base for employees)
  bossSignedFileUrl: {
    type:    String,
    default: null,
  },

  // ── PDF fields (drag-drop placement) ────────────────────────
  // Fields assigned to boss (partyIndex: -1 or 'boss')
  bossFields: {
    type:    [FieldSchema],
    default: [],
  },

  // Fields assigned to each employee (partyIndex: 0)
  employeeFields: {
    type:    [FieldSchema],
    default: [],
  },

  // ── Recipients (employees) ───────────────────────────────────
  recipients: {
    type:    [RecipientSchema],
    default: [],
    validate: {
      validator: function(arr) {
        // Max 500 recipients per template
        return arr.length <= 500;
      },
      message: 'Template cannot have more than 500 recipients',
    },
  },

  // ── CC list ──────────────────────────────────────────────────
  ccList: {
    type:    [CCSchema],
    default: [],
  },

  // ── Template status ──────────────────────────────────────────
  status: {
    type:    String,
    enum:    ['draft', 'boss_pending', 'active', 'completed', 'archived'],
    default: 'draft',
    index:   true,
    /*
      draft        → template created, not sent yet
      boss_pending → boss needs to sign first
      active       → boss signed, employees can sign
      completed    → all employees signed
      archived     → manually archived
    */
  },

  // ── Signing config ───────────────────────────────────────────
  signingConfig: {
    // Does boss need to sign first?
    bossSignsFirst:  { type: Boolean, default: true },
    // Expiry days for employee signing links
    expiryDays:      { type: Number,  default: 30, min: 1, max: 365 },
    // Allow employee to decline?
    allowDecline:    { type: Boolean, default: true },
    // Send reminder after N days
    reminderDays:    { type: Number,  default: 3 },
    // Email subject override
    emailSubject:    { type: String,  default: '' },
    // Custom message to employees
    emailMessage:    { type: String,  default: '' },
  },

  // ── Stats (denormalized for fast dashboard) ──────────────────
  stats: {
    totalRecipients: { type: Number, default: 0 },
    signed:          { type: Number, default: 0 },
    pending:         { type: Number, default: 0 },
    declined:        { type: Number, default: 0 },
    viewed:          { type: Number, default: 0 },
  },

  // ── Total pages in PDF ───────────────────────────────────────
  totalPages: {
    type:    Number,
    default: 1,
    min:     1,
  },

  // ── Soft delete ──────────────────────────────────────────────
  isDeleted: {
    type:    Boolean,
    default: false,
    index:   true,
  },

  deletedAt: {
    type:    Date,
    default: null,
  },

}, {
  timestamps: true, // createdAt, updatedAt
  toJSON:     { virtuals: true },
  toObject:   { virtuals: true },
});

// ════════════════════════════════════════════════════════════════
// INDEXES
// ════════════════════════════════════════════════════════════════
TemplateSchema.index({ owner: 1, status: 1 });
TemplateSchema.index({ owner: 1, createdAt: -1 });
TemplateSchema.index({ status: 1, isDeleted: 1 });

// ════════════════════════════════════════════════════════════════
// VIRTUALS
// ════════════════════════════════════════════════════════════════

// Progress percentage
TemplateSchema.virtual('progress').get(function () {
  const total = this.stats?.totalRecipients || 0;
  if (!total) return 0;
  return Math.round((this.stats.signed / total) * 100);
});

// Is boss signed?
TemplateSchema.virtual('isBossSigned').get(function () {
  return !!this.bossSignature?.dataUrl || !!this.bossSignedFileUrl;
});

// Recipient count
TemplateSchema.virtual('recipientCount').get(function () {
  return this.recipients?.length || 0;
});

// ════════════════════════════════════════════════════════════════
// PRE-SAVE HOOKS
// ════════════════════════════════════════════════════════════════

// Auto-update stats.totalRecipients
TemplateSchema.pre('save', function (next) {
  if (this.isModified('recipients')) {
    this.stats.totalRecipients = this.recipients.length;
    this.stats.pending = this.recipients.length - this.stats.signed - this.stats.declined;
  }
  next();
});

// ════════════════════════════════════════════════════════════════
// STATIC METHODS
// ════════════════════════════════════════════════════════════════

// Get all active templates for a user (not deleted)
TemplateSchema.statics.findByOwner = function (ownerId) {
  return this.find({
    owner:     ownerId,
    isDeleted: false,
  }).sort({ createdAt: -1 });
};

// Soft delete
TemplateSchema.methods.softDelete = function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Update stats after a session changes
TemplateSchema.methods.recalculateStats = async function () {
  const TemplateSession = mongoose.model('TemplateSession');
  const sessions = await TemplateSession.find({ template: this._id });

  this.stats.signed   = sessions.filter(s => s.status === 'signed').length;
  this.stats.declined = sessions.filter(s => s.status === 'declined').length;
  this.stats.viewed   = sessions.filter(s => s.viewedAt).length;
  this.stats.pending  = this.stats.totalRecipients
    - this.stats.signed
    - this.stats.declined;

  // Auto-complete if all signed
  if (
    this.stats.totalRecipients > 0 &&
    this.stats.signed === this.stats.totalRecipients
  ) {
    this.status = 'completed';
  }

  return this.save();
};

module.exports = mongoose.model('Template', TemplateSchema);