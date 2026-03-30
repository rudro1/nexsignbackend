// // server/models/TemplateSession.js
// const mongoose = require('mongoose');

// // ─── Audit Entry Schema ───────────────────────────────────────────
// const AuditEntrySchema = new mongoose.Schema({
//   action:     {
//     type: String,
//     enum: [
//       'link_sent', 'link_opened', 'signing_started',
//       'signed', 'declined', 'expired', 'reminder_sent',
//     ],
//     required: true,
//   },
//   timestamp:  { type: Date,   default: Date.now },
//   ipAddress:  { type: String, default: '' },
//   userAgent:  { type: String, default: '' },
//   location: {
//     city:       { type: String, default: '' },
//     country:    { type: String, default: '' },
//     postalCode: { type: String, default: '' },
//     region:     { type: String, default: '' },
//     timezone:   { type: String, default: '' },
//     lat:        { type: Number, default: null },
//     lon:        { type: Number, default: null },
//   },
//   deviceInfo: {
//     browser:  { type: String, default: '' },
//     os:       { type: String, default: '' },
//     device:   { type: String, default: '' }, // iPhone 6, MacBook etc
//     isMobile: { type: Boolean, default: false },
//   },
//   localTime:  { type: String, default: '' }, // "2:30 PM, 12 Jan 2025"
//   note:       { type: String, default: '' }, // decline reason etc
// }, { _id: false });

// // ─── Field Value Schema ───────────────────────────────────────────
// const FieldValueSchema = new mongoose.Schema({
//   fieldId:    { type: String, required: true },
//   type:       { type: String, required: true },
//   value:      { type: String, default: '' },  // signature dataURL / text
// }, { _id: false });

// // ════════════════════════════════════════════════════════════════
// // MAIN SESSION SCHEMA
// // Each session = one employee's signing journey
// // ════════════════════════════════════════════════════════════════
// const TemplateSessionSchema = new mongoose.Schema({

//   // ── Relations ───────────────────────────────────────────────
//   template: {
//     type:     mongoose.Schema.Types.ObjectId,
//     ref:      'Template',
//     required: true,
//     index:    true,
//   },

//   // ── Recipient info (snapshot at send time) ───────────────────
//   recipientName:        { type: String, required: true, trim: true },
//   recipientEmail:       { type: String, required: true, lowercase: true, trim: true },
//   recipientDesignation: { type: String, default: '' },

//   // ── Unique signing token ─────────────────────────────────────
//   token: {
//     type:     String,
//     required: true,
//     unique:   true,
//     index:    true,
//   },

//   // ── Status ───────────────────────────────────────────────────
//   status: {
//     type:    String,
//     enum:    ['pending', 'viewed', 'signed', 'declined', 'expired'],
//     default: 'pending',
//     index:   true,
//   },

//   // ── Signature data ───────────────────────────────────────────
//   signatureDataUrl: {
//     type:    String,
//     default: null,  // PNG base64
//   },

//   // All field values filled by employee
//   fieldValues: {
//     type:    [FieldValueSchema],
//     default: [],
//   },

//   // ── Individual PDF for this employee ─────────────────────────
//   // Generated after employee signs
//   signedFileUrl: {
//     type:    String,
//     default: null,
//   },

//   signedFilePublicId: {
//     type:    String,
//     default: '',
//   },

//   // ── Timestamps ───────────────────────────────────────────────
//   sentAt:     { type: Date, default: Date.now },
//   viewedAt:   { type: Date, default: null },
//   signedAt:   { type: Date, default: null },
//   declinedAt: { type: Date, default: null },
//   expiresAt:  { type: Date, required: true },

//   // ── Decline reason ───────────────────────────────────────────
//   declineReason: {
//     type:    String,
//     default: '',
//   },

//   // ── Reminder tracking ────────────────────────────────────────
//   reminderCount: {
//     type:    Number,
//     default: 0,
//   },
//   lastReminderAt: {
//     type:    Date,
//     default: null,
//   },

//   // ── Full audit trail ─────────────────────────────────────────
//   auditLog: {
//     type:    [AuditEntrySchema],
//     default: [],
//   },

//   // ── Signing metadata (captured at sign time) ─────────────────
//   signingMeta: {
//     ipAddress:  { type: String, default: '' },
//     userAgent:  { type: String, default: '' },
//     localTime:  { type: String, default: '' },
//     location: {
//       city:       { type: String, default: '' },
//       country:    { type: String, default: '' },
//       postalCode: { type: String, default: '' },
//       region:     { type: String, default: '' },
//       timezone:   { type: String, default: '' },
//     },
//     deviceInfo: {
//       browser:  { type: String, default: '' },
//       os:       { type: String, default: '' },
//       device:   { type: String, default: '' },
//       isMobile: { type: Boolean, default: false },
//     },
//   },

// }, {
//   timestamps: true,
//   toJSON:     { virtuals: true },
//   toObject:   { virtuals: true },
// });

// // ════════════════════════════════════════════════════════════════
// // INDEXES
// // ════════════════════════════════════════════════════════════════
// TemplateSessionSchema.index({ template: 1, status: 1 });
// TemplateSessionSchema.index({ template: 1, recipientEmail: 1 });
// TemplateSessionSchema.index({ token: 1 });
// TemplateSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// // ════════════════════════════════════════════════════════════════
// // VIRTUALS
// // ════════════════════════════════════════════════════════════════

// // Is expired?
// TemplateSessionSchema.virtual('isExpired').get(function () {
//   return this.expiresAt && new Date() > this.expiresAt;
// });

// // Time since sent
// TemplateSessionSchema.virtual('daysSinceSent').get(function () {
//   const diff = Date.now() - this.sentAt.getTime();
//   return Math.floor(diff / (1000 * 60 * 60 * 24));
// });

// // Has signed
// TemplateSessionSchema.virtual('isSigned').get(function () {
//   return this.status === 'signed';
// });

// // ════════════════════════════════════════════════════════════════
// // METHODS
// // ════════════════════════════════════════════════════════════════

// // Add audit entry
// TemplateSessionSchema.methods.addAuditEntry = function (action, meta = {}) {
//   this.auditLog.push({
//     action,
//     timestamp:  new Date(),
//     ipAddress:  meta.ipAddress  || '',
//     userAgent:  meta.userAgent  || '',
//     location:   meta.location   || {},
//     deviceInfo: meta.deviceInfo || {},
//     localTime:  meta.localTime  || '',
//     note:       meta.note       || '',
//   });
//   return this;
// };

// // Mark as viewed
// TemplateSessionSchema.methods.markViewed = function (meta = {}) {
//   if (!this.viewedAt) {
//     this.viewedAt = new Date();
//     if (this.status === 'pending') this.status = 'viewed';
//     this.addAuditEntry('link_opened', meta);
//   }
//   return this.save();
// };

// // Mark as signed
// TemplateSessionSchema.methods.markSigned = function (signatureDataUrl, fieldValues = [], meta = {}) {
//   this.status           = 'signed';
//   this.signedAt         = new Date();
//   this.signatureDataUrl = signatureDataUrl;
//   this.fieldValues      = fieldValues;
//   this.signingMeta      = {
//     ipAddress:  meta.ipAddress  || '',
//     userAgent:  meta.userAgent  || '',
//     localTime:  meta.localTime  || '',
//     location:   meta.location   || {},
//     deviceInfo: meta.deviceInfo || {},
//   };
//   this.addAuditEntry('signed', meta);
//   return this.save();
// };

// // Mark as declined
// TemplateSessionSchema.methods.markDeclined = function (reason = '', meta = {}) {
//   this.status        = 'declined';
//   this.declinedAt    = new Date();
//   this.declineReason = reason;
//   this.addAuditEntry('declined', { ...meta, note: reason });
//   return this.save();
// };

// // Mark expired
// TemplateSessionSchema.methods.markExpired = function () {
//   this.status = 'expired';
//   this.addAuditEntry('expired');
//   return this.save();
// };

// // ════════════════════════════════════════════════════════════════
// // STATICS
// // ════════════════════════════════════════════════════════════════

// // Get all sessions for a template with stats
// TemplateSessionSchema.statics.getTemplateStats = async function (templateId) {
//   const sessions = await this.find({ template: templateId });
//   return {
//     total:    sessions.length,
//     signed:   sessions.filter(s => s.status === 'signed').length,
//     pending:  sessions.filter(s => s.status === 'pending' || s.status === 'viewed').length,
//     declined: sessions.filter(s => s.status === 'declined').length,
//     expired:  sessions.filter(s => s.status === 'expired').length,
//     viewed:   sessions.filter(s => s.viewedAt).length,
//   };
// };

// // Find by token
// TemplateSessionSchema.statics.findByToken = function (token) {
//   return this.findOne({ token }).populate('template');
// };

// module.exports = mongoose.model('TemplateSession', TemplateSessionSchema);

// server/models/TemplateSession.js
const mongoose = require('mongoose');

// ─── Audit Entry Schema ───────────────────────────────────────
const AuditEntrySchema = new mongoose.Schema({
  action: {
    type: String,
    enum: [
      'link_sent', 'link_opened', 'signing_started',
      'signed', 'declined', 'expired', 'reminder_sent',
    ],
    required: true,
  },
  timestamp:  { type: Date,   default: Date.now },
  ipAddress:  { type: String, default: '' },
  userAgent:  { type: String, default: '' },
  location: {
    city:       { type: String, default: '' },
    country:    { type: String, default: '' },
    postalCode: { type: String, default: '' },
    region:     { type: String, default: '' },
    timezone:   { type: String, default: '' },
    latitude:   { type: String, default: '' },
    longitude:  { type: String, default: '' },
  },
  deviceInfo: {
    browser:    { type: String,  default: '' },
    os:         { type: String,  default: '' },
    device:     { type: String,  default: '' },
    deviceType: { type: String,  default: 'desktop' },
    isMobile:   { type: Boolean, default: false },
  },
  localTime: { type: String, default: '' },
  note:      { type: String, default: '' },
}, { _id: false });

// ─── Field Value Schema ───────────────────────────────────────
const FieldValueSchema = new mongoose.Schema({
  fieldId: { type: String, required: true },
  type:    { type: String, required: true },
  value:   { type: String, default: '' },
}, { _id: false });

// ─── Signing Meta Schema ──────────────────────────────────────
const SigningMetaSchema = new mongoose.Schema({
  ipAddress: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  localTime: { type: String, default: '' },
  location: {
    city:       { type: String, default: '' },
    country:    { type: String, default: '' },
    postalCode: { type: String, default: '' },
    region:     { type: String, default: '' },
    timezone:   { type: String, default: '' },
    latitude:   { type: String, default: '' },
    longitude:  { type: String, default: '' },
    display:    { type: String, default: '' },
  },
  deviceInfo: {
    browser:    { type: String,  default: '' },
    os:         { type: String,  default: '' },
    device:     { type: String,  default: '' },
    deviceType: { type: String,  default: 'desktop' },
    isMobile:   { type: Boolean, default: false },
  },
}, { _id: false });

// ════════════════════════════════════════════════════
// MAIN SESSION SCHEMA
// One session = one employee's signing journey
// ════════════════════════════════════════════════════
const TemplateSessionSchema = new mongoose.Schema({

  // ── Relations ────────────────────────────────────
  template: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'Template',
    required: true,
    index:    true,
  },

  // ── Recipient info (snapshot at send time) ────────
  recipientName:        { type: String, required: true, trim: true },
  recipientEmail:       { type: String, required: true, lowercase: true, trim: true },
  recipientDesignation: { type: String, default: '' },

  // ── Unique signing token ──────────────────────────
  token: {
    type:    String,
    default: null, // null after signing (security)
    index:   true,
    sparse:  true, // ✅ sparse — null values ignore uniqueness
  },

  // ── Status ────────────────────────────────────────
  status: {
    type:    String,
    enum:    ['pending', 'viewed', 'signing', 'signed', 'declined', 'expired'],
    default: 'pending',
    index:   true,
    /*
      pending  → email sent, not opened
      viewed   → link opened
      signing  → actively filling fields
      signed   → completed
      declined → rejected
      expired  → token expired
    */
  },

  // ── Signature ─────────────────────────────────────
  // ✅ Cloudinary URL — NOT base64 dataUrl in DB
  signatureImageUrl:      { type: String, default: null },
  signatureImagePublicId: { type: String, default: '' },

  // All field values filled by employee
  fieldValues: {
    type:    [FieldValueSchema],
    default: [],
  },

  // ── Individual signed PDF ─────────────────────────
  // Generated after employee signs
  signedFileUrl:      { type: String, default: null },
  signedFilePublicId: { type: String, default: '' },

  // ── Timestamps ────────────────────────────────────
  sentAt:     { type: Date, default: Date.now  },
  viewedAt:   { type: Date, default: null      },
  signedAt:   { type: Date, default: null      },
  declinedAt: { type: Date, default: null      },
  expiresAt:  { type: Date, required: true     },

  // ── Decline reason ────────────────────────────────
  declineReason: { type: String, default: '' },

  // ── Reminder tracking ─────────────────────────────
  reminderCount:  { type: Number, default: 0    },
  lastReminderAt: { type: Date,   default: null  },

  // ── Signing metadata ──────────────────────────────
  // Captured at sign time — separate from auditLog
  signingMeta: {
    type:    SigningMetaSchema,
    default: null,
  },

  // ── Full audit trail ──────────────────────────────
  auditLog: {
    type:    [AuditEntrySchema],
    default: [],
  },

  // ── Soft delete ───────────────────────────────────
  // ✅ TTL index নেই — soft delete use করো
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date,    default: null  },

}, {
  timestamps: true,
  toJSON:     { virtuals: true },
  toObject:   { virtuals: true },
});

// ════════════════════════════════════════════════════
// INDEXES
// ════════════════════════════════════════════════════
TemplateSessionSchema.index({ template: 1, status: 1          });
TemplateSessionSchema.index({ template: 1, recipientEmail: 1  });
TemplateSessionSchema.index({ template: 1, createdAt: -1      });
// ✅ No TTL index — we handle expiry manually
// TTL would delete the session from DB which breaks audit trail

// ════════════════════════════════════════════════════
// VIRTUALS
// ════════════════════════════════════════════════════

TemplateSessionSchema.virtual('isExpired').get(function () {
  if (this.status === 'signed' || this.status === 'declined') return false;
  return !!(this.expiresAt && new Date() > this.expiresAt);
});

TemplateSessionSchema.virtual('daysSinceSent').get(function () {
  if (!this.sentAt) return 0;
  return Math.floor((Date.now() - this.sentAt.getTime()) / 86_400_000);
});

TemplateSessionSchema.virtual('isSigned').get(function () {
  return this.status === 'signed';
});

TemplateSessionSchema.virtual('isPending').get(function () {
  return this.status === 'pending' || this.status === 'viewed';
});

// Location display string
TemplateSessionSchema.virtual('locationDisplay').get(function () {
  const loc = this.signingMeta?.location;
  if (!loc) return 'Unknown';
  return [loc.city, loc.country, loc.postalCode]
    .filter(Boolean).join(', ') || 'Unknown';
});

// ════════════════════════════════════════════════════
// PRE-SAVE
// ════════════════════════════════════════════════════
TemplateSessionSchema.pre('save', function (next) {
  // ✅ Auto-expire check on save
  if (
    this.isModified('status') === false &&
    this.status !== 'signed' &&
    this.status !== 'declined' &&
    this.expiresAt &&
    new Date() > this.expiresAt
  ) {
    this.status = 'expired';
  }
  next();
});

// ════════════════════════════════════════════════════
// INSTANCE METHODS
// ════════════════════════════════════════════════════

// Add audit entry helper
TemplateSessionSchema.methods.addAuditEntry = function (action, meta = {}) {
  this.auditLog.push({
    action,
    timestamp:  new Date(),
    ipAddress:  meta.ipAddress  || '',
    userAgent:  meta.userAgent  || '',
    location:   meta.location   || {},
    deviceInfo: meta.deviceInfo || {},
    localTime:  meta.localTime  || new Date().toUTCString(),
    note:       meta.note       || '',
  });
  return this; // chainable
};

// Mark as viewed
TemplateSessionSchema.methods.markViewed = function (meta = {}) {
  if (!this.viewedAt) {
    this.viewedAt = new Date();
  }
  // Only update status if still pending
  if (this.status === 'pending') {
    this.status = 'viewed';
  }
  this.addAuditEntry('link_opened', meta);
  return this.save();
};

// Mark as signing (actively filling)
TemplateSessionSchema.methods.markSigning = function (meta = {}) {
  if (this.status === 'viewed' || this.status === 'pending') {
    this.status = 'signing';
    this.addAuditEntry('signing_started', meta);
  }
  return this.save();
};

// ✅ Mark as signed — NO dataUrl, use Cloudinary URL
TemplateSessionSchema.methods.markSigned = function ({
  signatureImageUrl,
  signatureImagePublicId,
  fieldValues = [],
  meta = {},
}) {
  this.status                  = 'signed';
  this.signedAt                = new Date();
  this.signatureImageUrl       = signatureImageUrl || null;
  this.signatureImagePublicId  = signatureImagePublicId || '';
  this.fieldValues             = fieldValues;
  this.token                   = null; // ✅ Invalidate token after signing

  // Save signing metadata
  this.signingMeta = {
    ipAddress:  meta.ipAddress  || '',
    userAgent:  meta.userAgent  || '',
    localTime:  meta.localTime  || new Date().toUTCString(),
    location:   meta.location   || {},
    deviceInfo: meta.deviceInfo || {},
  };

  this.addAuditEntry('signed', meta);
  return this.save();
};

// Mark as declined
TemplateSessionSchema.methods.markDeclined = function (reason = '', meta = {}) {
  this.status        = 'declined';
  this.declinedAt    = new Date();
  this.declineReason = reason;
  this.token         = null; // ✅ Invalidate token
  this.addAuditEntry('declined', { ...meta, note: reason });
  return this.save();
};

// Mark expired
TemplateSessionSchema.methods.markExpired = function () {
  this.status = 'expired';
  this.token  = null;
  this.addAuditEntry('expired', {
    localTime: new Date().toUTCString(),
  });
  return this.save();
};

// Add reminder
TemplateSessionSchema.methods.addReminder = function (meta = {}) {
  this.reminderCount  = (this.reminderCount || 0) + 1;
  this.lastReminderAt = new Date();
  this.addAuditEntry('reminder_sent', meta);
  return this.save();
};

// Soft delete
TemplateSessionSchema.methods.softDelete = function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// ════════════════════════════════════════════════════
// STATICS
// ════════════════════════════════════════════════════

// Stats for a template
TemplateSessionSchema.statics.getTemplateStats = async function (templateId) {
  const sessions = await this.find({
    template:  templateId,
    isDeleted: { $ne: true },
  });

  return {
    total:    sessions.length,
    signed:   sessions.filter(s => s.status === 'signed').length,
    pending:  sessions.filter(s =>
      s.status === 'pending' || s.status === 'viewed' || s.status === 'signing'
    ).length,
    declined: sessions.filter(s => s.status === 'declined').length,
    expired:  sessions.filter(s => s.status === 'expired').length,
    viewed:   sessions.filter(s => !!s.viewedAt).length,
  };
};

// Find by token (with template populated)
TemplateSessionSchema.statics.findByToken = function (token) {
  return this.findOne({
    token,
    isDeleted: { $ne: true },
  }).populate('template');
};

// Find all pending sessions for a template (for reminders)
TemplateSessionSchema.statics.findPendingByTemplate = function (templateId) {
  return this.find({
    template:  templateId,
    status:    { $in: ['pending', 'viewed'] },
    isDeleted: { $ne: true },
  });
};

// Bulk expire check
TemplateSessionSchema.statics.expireOldSessions = async function () {
  const now = new Date();
  const result = await this.updateMany(
    {
      status:    { $in: ['pending', 'viewed', 'signing'] },
      expiresAt: { $lt: now },
      isDeleted: { $ne: true },
    },
    {
      $set: { status: 'expired', token: null },
    },
  );
  return result.modifiedCount;
};

module.exports = mongoose.model('TemplateSession', TemplateSessionSchema);