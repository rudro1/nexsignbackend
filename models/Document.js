
// // // // const mongoose = require('mongoose');

// // // // const documentSchema = new mongoose.Schema({
// // // //   title: { type: String, required: true, trim: true },
// // // //   fileUrl: { type: String, required: true },
// // // //   fileId: { type: String, required: true },
// // // //   ccEmails: [{ 
// // // //     type: String, 
// // // //     lowercase: true, 
// // // //     trim: true 
// // // //   }],

// // // //   senderMeta: { 
// // // //     type: mongoose.Schema.Types.Mixed, 
// // // //     default: null 
// // // //   },
// // // //  parties: [{
// // // //   name: { type: String, required: true },
// // // //   email: { type: String, lowercase: true, required: true },
// // // //   status: { 
// // // //     type: String, 
// // // //   enum: ['pending', 'sent', 'signed', 'completed'],
// // // //     default: 'pending' 
// // // //   },
// // // //   token: { type: String, index: true, sparse: true }, // sparse: true দিলে ড্রাফটে এরর হবে না
// // // //   signedAt: Date,
// // // //   device: { type: String, default: 'Unknown Device' }, // ডিফল্ট ভ্যালু যোগ করুন
// // // //   ipAddress: { type: String, default: 'N/A' },        // ডিফল্ট ভ্যালু যোগ করুন
// // // //   location: { type: String, default: 'Unknown' },     // ডিফল্ট ভ্যালু যোগ করুন
// // // // }],
// // // //   fields: {
// // // //     type: [mongoose.Schema.Types.Mixed],
// // // //     default: []
// // // //   },
// // // //   totalPages: { type: Number, default: 1 },
// // // //   status: { type: String, enum: ['draft', 'in_progress', 'completed'], default: 'draft' },
// // // //   owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
// // // //   currentPartyIndex: { type: Number, default: 0 },
// // // // }, { 
// // // //   // 🌟 এটি যুক্ত করুন: এটি updatedAt এবং createdAt অটো হ্যান্ডেল করবে
// // // //   timestamps: true 
// // // // });
// // // // // 🚀 হাই-পারফরম্যান্সের জন্য অতিরিক্ত ইনডেক্সিং
// // // // documentSchema.index({ "parties.token": 1 }); // দ্রুত টোকেন খোঁজার জন্য
// // // // documentSchema.index({ owner: 1, status: 1 }); // ড্যাশবোর্ড ফিল্টারিং ফাস্ট করতে
// // // // module.exports = mongoose.model('Document', documentSchema);

// // // const mongoose = require('mongoose');

// // // const documentSchema = new mongoose.Schema({
// // //   title: { type: String, required: true, trim: true },
// // //   fileUrl: { type: String, required: true },
// // //   fileId: { type: String, required: true },
// // //   ccEmails: [{ 
// // //     type: String, 
// // //     lowercase: true, 
// // //     trim: true 
// // //   }],
// // //   senderMeta: { 
// // //     type: mongoose.Schema.Types.Mixed, 
// // //     default: null 
// // //   },
// // //   parties: [{
// // //     name: { type: String, required: true },
// // //     email: { type: String, lowercase: true, required: true },
// // //     status: { 
// // //       type: String, 
// // //       enum: ['pending', 'sent', 'signed', 'completed'],
// // //       default: 'pending' 
// // //     },
// // //     token: { type: String, index: true, sparse: true },
// // //     signedAt: Date,
// // //     // 🌟 অডিট লগ অনুযায়ী ইনডেক্সিং ও ডিফল্ট ভ্যালু ফিক্স
// // //     device: { type: String, default: 'Unknown Device' },
// // //     ipAddress: { type: String, default: 'N/A' },
// // //     location: { type: String, default: 'Unknown' }, // এখানে "City, Division, Country" স্টোর হবে
// // //     postalCode: { type: String }, // পোস্টাল কোড আলাদা রাখার জন্য
// // //     timeZone: { type: String },   // "Asia/Dhaka" এর মতো জোন সেভ রাখার জন্য
// // //   }],
// // //   fields: {
// // //     type: [mongoose.Schema.Types.Mixed],
// // //     default: []
// // //   },
// // //   totalPages: { type: Number, default: 1 },
// // //   status: { type: String, enum: ['draft', 'in_progress', 'completed'], default: 'draft' },
// // //   owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
// // //   currentPartyIndex: { type: Number, default: 0 },
// // // }, { 
// // //   timestamps: true 
// // // });

// // // // ইনডেক্সিং
// // // documentSchema.index({ "parties.token": 1 });
// // // documentSchema.index({ owner: 1, status: 1 });

// // // module.exports = mongoose.model('Document', documentSchema);
// // // const mongoose = require('mongoose');

// // // const documentSchema = new mongoose.Schema({
// // //   title: { type: String, required: true, trim: true },
// // //   fileUrl: { type: String, required: true },
// // //   fileId: { type: String, required: true },
  
// // //   // ✅ টেমপ্লেট লজিক ফিক্স: এটি ছাড়া টেমপ্লেট ট্যাব কাজ করবে না
// // //   isTemplate: { 
// // //     type: Boolean, 
// // //     default: false,
// // //     index: true 
// // //   },

// // //   ccEmails: [{ 
// // //     type: String, 
// // //     lowercase: true, 
// // //     trim: true 
// // //   }],
// // //   senderMeta: { 
// // //     type: mongoose.Schema.Types.Mixed, 
// // //     default: null 
// // //   },
// // //   parties: [{
// // //     name: { type: String, required: true },
// // //     email: { type: String, lowercase: true, required: true },
// // //     status: { 
// // //       type: String, 
// // //       enum: ['pending', 'sent', 'signed', 'completed'],
// // //       default: 'pending' 
// // //     },
// // //     token: { type: String, index: true, sparse: true },
// // //     signedAt: Date,
// // //     device: { type: String, default: 'Unknown Device' },
// // //     ipAddress: { type: String, default: 'N/A' },
// // //     location: { type: String, default: 'Unknown' }, 
// // //     postalCode: { type: String }, 
// // //     timeZone: { type: String },   
// // //   }],
// // //   fields: {
// // //     // এখানে মিক্সড টাইপ রাখা হয়েছে যাতে JSON স্ট্রিং বা অবজেক্ট দুইটাই হ্যান্ডেল করা যায়
// // //     type: [mongoose.Schema.Types.Mixed],
// // //     default: []
// // //   },
// // //   totalPages: { type: Number, default: 1 },
// // //   status: { 
// // //     type: String, 
// // //     enum: ['draft', 'in_progress', 'completed'], 
// // //     default: 'draft' 
// // //   },
// // //   owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
// // //   currentPartyIndex: { type: Number, default: 0 },
// // // }, { 
// // //   timestamps: true 
// // // });

// // // // --- ইনডেক্সিং ---
// // // documentSchema.index({ "parties.token": 1 });
// // // documentSchema.index({ owner: 1, status: 1 });
// // // // টেমপ্লেট দ্রুত খোঁজার জন্য ইনডেক্স
// // // documentSchema.index({ owner: 1, isTemplate: 1 });
// // // // আপনার module.exports এর ঠিক উপরে এটি যোগ করতে পারেন
// // // documentSchema.pre('save', function(next) {
// // //   if (this.fields && Array.isArray(this.fields)) {
// // //     this.fields = this.fields.map(field => {
// // //       if (typeof field === 'string') {
// // //         try {
// // //           return JSON.parse(field);
// // //         } catch (e) {
// // //           return field;
// // //         }
// // //       }
// // //       return field;
// // //     });
// // //   }
// // //   next();
// // // });
// // // module.exports = mongoose.model('Document', documentSchema);

// // const mongoose = require('mongoose');

// // const documentSchema = new mongoose.Schema({
// //   title: { 
// //     type: String, 
// //     required: [true, 'Title required'], 
// //     trim: true, 
// //     maxlength: 200 
// //   },
// //   fileUrl: { 
// //     type: String, 
// //     required: [true, 'File URL required'],
// //     match: /^https:\/\/res\.cloudinary\.com\/.*$/ 
// //   },
// //   fileId: { 
// //     type: String, 
// //     required: [true, 'Cloudinary ID required'],
// //     maxlength: 500 
// //   },
  
// //   // ✅ Template System
// //   isTemplate: { 
// //     type: Boolean, 
// //     default: false,
// //     index: true 
// //   },
// //   templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Template' },

// //   ccEmails: [{ 
// //     type: String, 
// //     lowercase: true, 
// //     trim: true,
// //     match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ 
// //   }],
  
// //   senderMeta: { 
// //     type: mongoose.Schema.Types.Mixed, 
// //     default: () => ({})
// //   },
  
// //   parties: [{
// //     name: { 
// //       type: String, 
// //       required: true, 
// //       trim: true, 
// //       maxlength: 100 
// //     },
// //     email: { 
// //       type: String, 
// //       lowercase: true, 
// //       required: true,
// //       match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ 
// //     },
// //     status: { 
// //       type: String, 
// //       enum: ['pending', 'sent', 'signed', 'declined', 'completed'],
// //       default: 'pending' 
// //     },
// //     token: { 
// //       type: String, 
// //       index: true, 
// //       sparse: true,
// //       expires: '7d' // Token expires in 7 days
// //     },
// //     signedAt: Date,
// //     device: { type: String, default: 'Unknown Device', maxlength: 100 },
// //     ipAddress: { type: String, default: 'N/A', maxlength: 45 },
// //     location: { type: String, default: 'Unknown', maxlength: 100 },
// //     postalCode: { type: String, maxlength: 20 },
// //     timeZone: { type: String, maxlength: 50 },
// //     fieldsSigned: { type: [Number], default: [] } // Which fields they signed
// //   }],
  
// //   fields: {
// //     type: [mongoose.Schema.Types.Mixed],
// //     default: [],
// //     validate: {
// //       validator: function(v) {
// //         return Array.isArray(v) && v.every(f => f.page && f.x && f.y);
// //       },
// //       message: 'Fields must be valid array'
// //     }
// //   },
  
// //   totalPages: { 
// //     type: Number, 
// //     min: 1, 
// //     default: 1 
// //   },
  
// //   status: { 
// //     type: String, 
// //     enum: ['draft', 'sent', 'in_progress', 'completed', 'cancelled', 'expired', 'deleted'],
// //     default: 'draft',
// //     index: true 
// //   },
  
// //   owner: { 
// //     type: mongoose.Schema.Types.ObjectId, 
// //     ref: 'User',
// //     required: true,
// //     index: true 
// //   },
  
// //   currentPartyIndex: { 
// //     type: Number, 
// //     min: 0, 
// //     default: 0 
// //   },
  
// //   // ✅ Enterprise Features
// //   expiresAt: { type: Date, index: true }, // Auto expire
// //   remindersSent: { type: Number, default: 0, max: 3 },
// //   lastActivity: { type: Date, default: Date.now },
// //   downloadCount: { type: Number, default: 0 },
// //   viewCount: { type: Number, default: 0 }
  
// // }, { 
// //   timestamps: true,
// //   toJSON: { virtuals: true },
// //   toObject: { virtuals: true }
// // });

// // // ✅ Indexes (Lightning Fast Queries)
// // documentSchema.index({ "parties.token": 1 });
// // documentSchema.index({ owner: 1, status: 1 });
// // documentSchema.index({ owner: 1, isTemplate: 1 });
// // documentSchema.index({ status: 1, expiresAt: 1 });
// // documentSchema.index({ "parties.email": 1 });
// // documentSchema.index({ createdAt: -1 });

// // // ✅ Auto Cleanup Expired Documents (30 days)
// // documentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// // // ✅ Pre-save Hooks
// // documentSchema.pre('save', function(next) {
// //   // ✅ Normalize Fields
// //   if (this.fields && Array.isArray(this.fields)) {
// //     this.fields = this.fields.map(field => {
// //       if (typeof field === 'string') {
// //         try {
// //           return JSON.parse(field);
// //         } catch (e) {
// //           console.warn('Invalid field JSON:', field);
// //           return null;
// //         }
// //       }
// //       return field;
// //     }).filter(Boolean);
// //   }
  
// //   // ✅ Set Expires (7 days from creation if not set)
// //   if (!this.expiresAt) {
// //     this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
// //   }
  
// //   // ✅ Update lastActivity
// //   this.lastActivity = new Date();
  
// //   next();
// // });

// // // ✅ Virtual for Progress
// // documentSchema.virtual('progress').get(function() {
// //   const totalParties = this.parties.length;
// //   const signedParties = this.parties.filter(p => p.status === 'signed').length;
// //   return totalParties ? Math.round((signedParties / totalParties) * 100) : 0;
// // });

// // // ✅ Query Middleware (Soft Delete)
// // documentSchema.pre(/^find/, function(next) {
// //   this.where({ status: { $ne: 'deleted' } });
// //   next();
// // });

// // module.exports = mongoose.model('Document', documentSchema);


// const mongoose = require('mongoose');


// const documentSchema = new mongoose.Schema({
// title: { type: String, required: true, trim: true },
// fileUrl: { type: String, required: true },
// fileId: { type: String, required: true },


// // ✅ টেমপ্লেট লজিক ফিক্স: এটি ছাড়া টেমপ্লেট ট্যাব কাজ করবে না
// isTemplate: {
// type: Boolean,
// default: false,
// index: true
// },

// // ✅ Backward compatible: existing docs may store ccEmails as string[]
// ccEmails: [{
// type: String,
// lowercase: true,
// trim: true
// }],

// // ✅ New: rich CC/HR recipients (email + designation for Audit Certificate + completion emails)
// // ccRecipients: [{
// //   type: {
// //     type: String,
// //     enum: ['cc', 'hr'],
// //     default: 'cc',
// //     index: true
// //   },
// //   name: { type: String, trim: true, default: '' },
// //   email: { type: String, lowercase: true, trim: true, required: true },
// //   designation: { type: String, trim: true, default: '' }
// // }],
// ccRecipients: [{
//    type: {
//       type: String,
//       enum: ['cc','hr'],
//       default: 'cc',
//       index: true
//     },
//     name:        { type: String, trim: true, default: '' },
//     email:       { type: String, lowercase: true, trim: true, required: true },
//     designation: { type: String, trim: true, default: '' }
//   }],
// senderMeta: {
// type: mongoose.Schema.Types.Mixed,
// default: null
// },
// parties: [{
// name: { type: String, required: true },
// email: { type: String, lowercase: true, required: true },
// status: {
// type: String,
// enum: ['pending', 'sent', 'signed', 'completed'],
// default: 'pending'
// },
// token: { type: String, index: true, sparse: true },
// signedAt: Date,
// device: { type: String, default: 'Unknown Device' },
// ipAddress: { type: String, default: 'N/A' },
// location: { type: String, default: 'Unknown' },
// postalCode: { type: String },
// timeZone: { type: String },

//  // ✅ Real-time monitoring per signer (email/open/link open/sign)
//  emailSentAt: { type: Date },
//  linkOpenedAt: { type: Date },        // first time they opened the signing link
//  lastLinkOpenedAt: { type: Date },    // last time they opened the signing link
//  linkOpenCount: { type: Number, default: 0 },
//  openedIpAddress: { type: String, default: 'N/A' },
//  openedUserAgent: { type: String, default: '' },
//  openedLocation: { type: String, default: 'Unknown' },
//  openedPostalCode: { type: String, default: '' },
//  signedIpAddress: { type: String, default: 'N/A' }, // keep signed metadata separate from "opened"
//  signedUserAgent: { type: String, default: '' },
//  signedLocation: { type: String, default: 'Unknown' },
//  signedPostalCode: { type: String, default: '' },

// }],
// fields: {
// // এখানে মিক্সড টাইপ রাখা হয়েছে যাতে JSON স্ট্রিং বা অবজেক্ট দুইটাই হ্যান্ডেল করা যায়
// type: [mongoose.Schema.Types.Mixed],
// default: []
// },
// totalPages: { type: Number, default: 1 },
// status: {
// type: String,
// enum: ['draft', 'in_progress', 'completed'],
// default: 'draft'
// },
// owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
// currentPartyIndex: { type: Number, default: 0 },

//  // ✅ Advanced audit trail for SaaS-grade monitoring + Audit Certificate
//  // NOTE: keep this embedded for fast dashboard reads; the separate AuditLog collection can still exist for long-term retention.
//  auditTrail: {
//    version: { type: Number, default: 1 },
//    events: [{
//      eventType: {
//        type: String,
//        enum: [
//          'document_created',
//          'document_updated',
//          'draft_saved',
//          'email_sent',
//          'email_opened',
//          'link_opened',
//          'signed',
//          'completed',
//          'audit_certificate_appended',
//          'completion_email_sent',
//          'pdf_generated',
//          'downloaded'
//        ],
//        required: true,
//        index: true
//      },
//      // actor can be owner/signer/system. For signer events, attach partyEmail + partyIndex
//      actorRole: { type: String, enum: ['owner', 'signer', 'system', 'cc', 'hr'], default: 'system' },
//      actorName: { type: String, trim: true, default: '' },
//      actorEmail: { type: String, lowercase: true, trim: true, default: '' },
//      partyIndex: { type: Number }, // signer index in parties[] (when applicable)
//      ipAddress: { type: String, default: '' },
//      userAgent: { type: String, default: '' },
//      location: {
//        country: { type: String, default: '' },
//        region: { type: String, default: '' },      // Region/State/Division
//        city: { type: String, default: '' },
//        postalCode: { type: String, default: '' }
//      },
//      timeZone: { type: String, default: '' }, // e.g. "Asia/Dhaka"
//      occurredAt: { type: Date, default: Date.now, index: true },
//      meta: { type: mongoose.Schema.Types.Mixed, default: null }
//    }]
//  },
// }, {
// timestamps: true
// });


// // --- ইনডেক্সিং ---
// documentSchema.index({ "parties.token": 1 });
// documentSchema.index({ owner: 1, status: 1 });
// // টেমপ্লেট দ্রুত খোঁজার জন্য ইনডেক্স
// documentSchema.index({ owner: 1, isTemplate: 1 });
// // Template list + usage history
// documentSchema.index({ isTemplate: 1, updatedAt: -1 });
// // Fast monitoring queries
// documentSchema.index({ "parties.email": 1 });
// documentSchema.index({ status: 1, updatedAt: -1 });
// // আপনার module.exports এর ঠিক উপরে এটি যোগ করতে পারেন
// documentSchema.pre('save', function(next) {
// if (this.fields && Array.isArray(this.fields)) {
// this.fields = this.fields.map(field => {
// if (typeof field === 'string') {
// try {
// return JSON.parse(field);
// } catch (e) {
// return field;
// }
// }
// return field;
// });
// }

// // ✅ Keep ccEmails in sync with ccRecipients (so older code that uses ccEmails still works)
// if (Array.isArray(this.ccRecipients) && this.ccRecipients.length) {
//   const fromRecipients = this.ccRecipients
//     .map(r => (r && r.email ? String(r.email).toLowerCase().trim() : ''))
//     .filter(Boolean);
//   if (fromRecipients.length) this.ccEmails = Array.from(new Set([...(this.ccEmails || []), ...fromRecipients]));
// }
// next();
// });
// module.exports = mongoose.model('Document', documentSchema);wrokable
/**
 * Document.js — NeXsign Enterprise
 * Added: usageCount, 'processing' status (for in-flight PDF generation),
 * full signer forensics, brandConfig, signingMode, ccRecipients
 */
// backend/routes/documents.js
'use strict';

const express        = require('express');
const router         = express.Router();
const multer         = require('multer');
const path           = require('path');
const fs             = require('fs');
const crypto         = require('crypto');
const mongoose       = require('mongoose');

const Document       = require('../models/Document');
const AuditLog       = require('../models/AuditLog');
const { protect }    = require('../middleware/authMiddleware');
const { embedSignaturesAndAuditLog } = require('../utils/pdfService');
const {
  sendSigningRequestEmail,
  sendCompletionEmail,
} = require('../utils/emailService');

// ══════════════════════════════════════════════════════════════════════════════
// STORAGE
// ══════════════════════════════════════════════════════════════════════════════
const UPLOADS_DIR = path.resolve(__dirname, '../uploads/originals');
const SIGNED_DIR  = path.resolve(__dirname, '../uploads/signed');

[UPLOADS_DIR, SIGNED_DIR].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename:    (_req, file, cb) => {
    const uid  = crypto.randomBytes(8).toString('hex');
    const safe = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${Date.now()}-${uid}-${safe}`);
  },
});

const upload = multer({
  storage,
  limits:     { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    file.mimetype === 'application/pdf'
      ? cb(null, true)
      : cb(new Error('Only PDF files are accepted.'), false),
});

// ══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════════
function getIp(req) {
  return (
    req.headers['cf-connecting-ip'] ||
    req.headers['x-real-ip'] ||
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    ''
  );
}

async function writeAudit(docId, action, performer, req, details = '') {
  try {
    await AuditLog.create({
      document_id:  docId,
      action,
      performed_by: performer,
      ip_address:   req ? getIp(req) : '',
      user_agent:   req?.headers?.['user-agent'] || '',
      client_time:  req?.body?.client_time || new Date().toISOString(),
      details,
    });
  } catch (e) {
    console.error('[AuditLog] write failed:', e.message);
  }
}

function unlinkSafe(p) {
  try { if (p && fs.existsSync(p)) fs.unlinkSync(p); } catch (_) {}
}

/**
 * Core: embed signatures + audit log into PDF → save to disk → update DB
 * Returns { signedBuffer, signedPath }
 */
async function finalizePdf(doc) {
  // Always reload latest fields from DB (in case of concurrent updates)
  const freshDoc = await Document.findById(doc._id).lean();

  const logs = await AuditLog
    .find({ document_id: freshDoc._id })
    .sort({ timestamp: 1 })
    .lean();

  const buffer = await embedSignaturesAndAuditLog(
    freshDoc.original_pdf_path,
    freshDoc.fields,          // ← fields WITH values already saved
    logs,
    {
      title:       freshDoc.title,
      documentId:  freshDoc._id,
      completedAt: freshDoc.completed_at || new Date(),
    }
  );

  const fileName   = `signed-${freshDoc._id}-${Date.now()}.pdf`;
  const signedPath = path.join(SIGNED_DIR, fileName);

  // Write to disk synchronously to guarantee it exists before emailing
  fs.writeFileSync(signedPath, buffer);

  // Update DB with signed path
  await Document.findByIdAndUpdate(freshDoc._id, {
    signed_pdf_path: signedPath,
  });

  console.log(`[finalizePdf] ✅ Saved signed PDF: ${signedPath}`);
  return { signedBuffer: buffer, signedPath };
}

// ══════════════════════════════════════════════════════════════════════════════
// ── POST /api/documents  (protected) — create document & send signing emails
// ══════════════════════════════════════════════════════════════════════════════
router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'PDF file is required.' });
    }

    let signers = [], fields = [];
    try {
      signers = JSON.parse(req.body.signers || '[]');
      fields  = JSON.parse(req.body.fields  || '[]');
    } catch {
      unlinkSafe(req.file?.path);
      return res.status(400).json({ message: 'Invalid JSON in signers/fields.' });
    }

    if (!signers.length) {
      unlinkSafe(req.file?.path);
      return res.status(400).json({ message: 'At least one signer is required.' });
    }

    const signersWithTokens = signers.map(s => ({
      name:          (s.name  || '').trim(),
      email:         (s.email || '').toLowerCase().trim(),
      role:          s.role   || 'signer',
      status:        'pending',
      token:         crypto.randomBytes(32).toString('hex'),
      token_expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }));

    const doc = await Document.create({
      title:             (req.body.title || 'Untitled Document').trim(),
      owner:             req.user._id,
      original_pdf_path: req.file.path,
      fields,
      signers:           signersWithTokens,
      status:            'pending',
    });

    const ownerActor = {
      name:  req.user.full_name || req.user.email,
      email: req.user.email,
      role:  'owner',
    };

    await writeAudit(doc._id, 'created', ownerActor, req,
      `Document "${doc.title}" created with ${fields.length} field(s).`);
    await writeAudit(doc._id, 'sent', ownerActor, req,
      `Signing request sent to: ${signersWithTokens.map(s => s.email).join(', ')}`);

    // Send emails — non-blocking
    const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5173';
    Promise.all(
      signersWithTokens
        .filter(s => s.role !== 'cc')
        .map(s =>
          sendSigningRequestEmail({
            to:          s.email,
            signerName:  s.name,
            senderName:  req.user.full_name || req.user.email,
            docTitle:    doc.title,
            signingLink: `${FRONTEND}/sign/${s.token}`,
          }).catch(e =>
            console.error(`[Email] Failed for ${s.email}:`, e.message)
          )
        )
    );

    return res.status(201).json({
      success:  true,
      message:  'Document created. Signing requests sent.',
      document: { _id: doc._id, title: doc.title, status: doc.status },
    });

  } catch (err) {
    console.error('[POST /documents]', err);
    unlinkSafe(req.file?.path);
    return res.status(500).json({ message: 'Failed to create document.' });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// ── GET /api/documents (protected) — paginated list for dashboard
// ══════════════════════════════════════════════════════════════════════════════
router.get('/', protect, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    const filter = {
      owner:       req.user._id,
      is_template: { $ne: true },
    };
    if (status && status !== 'all') filter.status = status;
    if (search?.trim()) {
      filter.title = { $regex: search.trim(), $options: 'i' };
    }

    const lim  = Math.min(100, Math.max(1, +limit));
    const skip = (Math.max(1, +page) - 1) * lim;

    const [docs, total] = await Promise.all([
      Document.find(filter)
        .select(
          'title status signers createdAt completed_at ' +
          'signed_pdf_path original_pdf_path'
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(lim)
        .lean(),
      Document.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data:    docs,
      pagination: {
        page:       +page,
        limit:      lim,
        total,
        totalPages: Math.ceil(total / lim),
      },
    });
  } catch (err) {
    console.error('[GET /documents]', err);
    return res.status(500).json({ message: 'Failed to fetch documents.' });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// ── GET /api/documents/stats (protected) — live stats for dashboard
// ══════════════════════════════════════════════════════════════════════════════
router.get('/stats', protect, async (req, res) => {
  try {
    const owner = req.user._id;
    const base  = { owner, is_template: { $ne: true } };

    const [total, pending, completed, draft, cancelled] = await Promise.all([
      Document.countDocuments(base),
      Document.countDocuments({ ...base, status: 'pending'   }),
      Document.countDocuments({ ...base, status: 'completed' }),
      Document.countDocuments({ ...base, status: 'draft'     }),
      Document.countDocuments({ ...base, status: 'cancelled' }),
    ]);

    return res.json({
      success: true,
      stats:   { total, pending, completed, draft, cancelled },
    });
  } catch (err) {
    console.error('[GET /documents/stats]', err);
    return res.status(500).json({ message: 'Failed to fetch stats.' });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// ── GET /api/documents/:id (protected) — single doc + audit logs
// ══════════════════════════════════════════════════════════════════════════════
router.get('/:id', protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid document ID.' });
    }

    const [doc, auditLogs] = await Promise.all([
      Document
        .findOne({ _id: req.params.id, owner: req.user._id })
        .populate('owner', 'email full_name')
        .lean(),
      AuditLog
        .find({ document_id: req.params.id })
        .sort({ timestamp: -1 })
        .limit(100)
        .lean(),
    ]);

    if (!doc) return res.status(404).json({ message: 'Document not found.' });

    return res.json({ success: true, document: doc, auditLogs });
  } catch (err) {
    console.error('[GET /documents/:id]', err);
    return res.status(500).json({ message: 'Failed to fetch document.' });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// ── GET /api/documents/:id/download (protected) — serve signed or original
// ══════════════════════════════════════════════════════════════════════════════
router.get('/:id/download', protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid document ID.' });
    }

    const doc = await Document
      .findOne({ _id: req.params.id, owner: req.user._id })
      .lean();

    if (!doc) return res.status(404).json({ message: 'Document not found.' });

    // ✅ Always serve signed PDF for completed docs
    const filePath = (doc.status === 'completed' && doc.signed_pdf_path)
      ? doc.signed_pdf_path
      : doc.original_pdf_path;

    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server.' });
    }

    const stat = fs.statSync(filePath);
    const name = encodeURIComponent(
      `${doc.status === 'completed' ? 'Signed_' : ''}${doc.title}.pdf`
    );

    res.setHeader('Content-Type',        'application/pdf');
    res.setHeader('Content-Length',      stat.size);
    res.setHeader('Content-Disposition', `inline; filename="${name}"`);
    res.setHeader('Cache-Control',       'private, max-age=3600');
    res.setHeader('Accept-Ranges',       'bytes');

    return fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error('[GET /documents/:id/download]', err);
    return res.status(500).json({ message: 'Download failed.' });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// ── DELETE /api/documents/:id (protected)
// ══════════════════════════════════════════════════════════════════════════════
router.delete('/:id', protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid document ID.' });
    }

    const doc = await Document.findOne({
      _id:   req.params.id,
      owner: req.user._id,
    });

    if (!doc) return res.status(404).json({ message: 'Document not found.' });

    unlinkSafe(doc.original_pdf_path);
    unlinkSafe(doc.signed_pdf_path);

    await Promise.all([
      Document.findByIdAndDelete(doc._id),
      AuditLog.deleteMany({ document_id: doc._id }),
    ]);

    return res.json({ success: true, message: 'Document deleted.' });
  } catch (err) {
    console.error('[DELETE /documents/:id]', err);
    return res.status(500).json({ message: 'Failed to delete document.' });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
//  PUBLIC SIGNING ROUTES — token-based, no JWT needed
// ══════════════════════════════════════════════════════════════════════════════

// ── GET /api/documents/sign/validate/:token ──────────────────────────────────
router.get('/sign/validate/:token', async (req, res) => {
  try {
    const { token } = req.params;

    if (!token || token.length < 32) {
      return res.status(400).json({ message: 'Malformed token.' });
    }

    // Lean + projection = fastest possible query
    const doc = await Document.findOne(
      { 'signers.token': token },
      {
        title:             1,
        status:            1,
        expires_at:        1,
        fields:            1,
        'signers.$':       1,   // only the matching signer
      }
    ).lean();

    if (!doc) {
      return res.status(404).json({ message: 'Invalid or expired signing link.' });
    }

    const signer = doc.signers[0];

    // Guard checks
    if (!signer) {
      return res.status(404).json({ message: 'Signer record not found.' });
    }
    if (signer.status === 'signed') {
      return res.status(410).json({ message: 'You have already signed this document.' });
    }
    if (doc.status === 'completed') {
      return res.status(410).json({ message: 'This document has already been completed.' });
    }
    if (doc.status === 'cancelled') {
      return res.status(410).json({ message: 'This document has been cancelled.' });
    }
    if (doc.expires_at && new Date() > new Date(doc.expires_at)) {
      return res.status(410).json({ message: 'This signing link has expired.' });
    }

    // Return only what the UI needs
    return res.json({
      success:  true,
      document: {
        _id:    doc._id,
        title:  doc.title,
        status: doc.status,
        fields: doc.fields.map(f => ({ ...f, value: '' })), // never leak saved values
      },
      signer: {
        name:  signer.name,
        email: signer.email,
        role:  signer.role,
      },
    });
  } catch (err) {
    console.error('[GET /sign/validate/:token]', err);
    return res.status(500).json({ message: 'Validation failed. Please try again.' });
  }
});

// ── GET /api/documents/sign/:token/pdf ───────────────────────────────────────
// Stream original PDF to the signer — fast, no auth overhead
router.get('/sign/:token/pdf', async (req, res) => {
  try {
    const { token } = req.params;

    const doc = await Document.findOne(
      { 'signers.token': token },
      { original_pdf_path: 1, title: 1, status: 1, 'signers.$': 1 }
    ).lean();

    if (!doc) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    const signer = doc.signers[0];
    if (!signer || signer.status === 'signed') {
      return res.status(410).json({ message: 'Already signed or invalid token.' });
    }

    const filePath = doc.original_pdf_path;
    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'PDF not found on server.' });
    }

    const stat = fs.statSync(filePath);
    res.setHeader('Content-Type',        'application/pdf');
    res.setHeader('Content-Length',      stat.size);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(doc.title)}.pdf"`);
    res.setHeader('Cache-Control',       'private, no-store');
    res.setHeader('Accept-Ranges',       'bytes');

    return fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error('[GET /sign/:token/pdf]', err);
    return res.status(500).json({ message: 'Failed to stream PDF.' });
  }
});

// ── POST /api/documents/sign/:token/open ─────────────────────────────────────
// Record "opened" — idempotent
router.post('/sign/:token/open', async (req, res) => {
  try {
    const { token } = req.params;

    const doc = await Document.findOne({ 'signers.token': token });
    if (!doc) return res.json({ success: true }); // silent — don't leak info

    const signerIndex = doc.signers.findIndex(s => s.token === token);
    if (signerIndex === -1) return res.json({ success: true });

    const signer = doc.signers[signerIndex];
    if (signer.status !== 'pending') return res.json({ success: true }); // idempotent

    // Update to 'opened'
    await Document.updateOne(
      { _id: doc._id, 'signers.token': token },
      { $set: { 'signers.$.status': 'opened' } }
    );

    await writeAudit(doc._id, 'opened', {
      name:  signer.name,
      email: signer.email,
      role:  'signer',
    }, req, `${signer.name} opened the document.`);

    return res.json({ success: true });
  } catch (err) {
    console.error('[POST /sign/:token/open]', err);
    return res.json({ success: true }); // never error — best effort
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// ── POST /api/documents/sign/:token/submit  ← THE CORE FIX
// ══════════════════════════════════════════════════════════════════════════════
router.post('/sign/:token/submit', async (req, res) => {
  try {
    const { token } = req.params;
    const { fields: submittedFields, client_time } = req.body;

    // ── Basic validation ───────────────────────────────────────────────────
    if (!Array.isArray(submittedFields) || submittedFields.length === 0) {
      return res.status(400).json({ message: 'No field data submitted.' });
    }

    // ── Load document (full, not lean — we need .save()) ──────────────────
    const doc = await Document.findOne({ 'signers.token': token });

    if (!doc) {
      return res.status(404).json({ message: 'Invalid signing token.' });
    }

    const signerIndex = doc.signers.findIndex(s => s.token === token);
    if (signerIndex === -1) {
      return res.status(404).json({ message: 'Signer not found.' });
    }

    const signer = doc.signers[signerIndex];

    // ── Guards ─────────────────────────────────────────────────────────────
    if (signer.status === 'signed') {
      return res.status(409).json({ message: 'You have already signed this document.' });
    }
    if (doc.status === 'completed') {
      return res.status(410).json({ message: 'Document is already completed.' });
    }
    if (doc.status === 'cancelled') {
      return res.status(410).json({ message: 'Document has been cancelled.' });
    }
    if (doc.expires_at && new Date() > new Date(doc.expires_at)) {
      return res.status(410).json({ message: 'Signing link has expired.' });
    }

    // ── Merge submitted field values into document.fields ──────────────────
    const valueMap = new Map(
      submittedFields.map(f => [String(f.id), f.value])
    );

    doc.fields = doc.fields.map(f => {
      const newVal = valueMap.get(String(f.id));
      if (newVal !== undefined) {
        return { ...f.toObject(), value: newVal };
      }
      return f;
    });

    // ── Mark this signer as signed ─────────────────────────────────────────
    const ip = getIp(req);
    doc.signers[signerIndex].status     = 'signed';
    doc.signers[signerIndex].signed_at  = new Date();
    doc.signers[signerIndex].ip_address = ip;
    doc.signers[signerIndex].user_agent = req.headers['user-agent'] || '';
    doc.signers[signerIndex].token      = undefined; // invalidate token

    // ── Check if ALL signers have signed ──────────────────────────────────
    const allSigned = doc.signers
      .filter(s => s.role === 'signer')
      .every(s => s.status === 'signed');

    if (allSigned) {
      doc.status       = 'completed';
      doc.completed_at = new Date();
    }

    // ── Save document with merged fields + signer status ──────────────────
    await doc.save();

    // ── Write "signed" audit log ───────────────────────────────────────────
    await writeAudit(doc._id, 'signed', {
      name:  signer.name,
      email: signer.email,
      role:  'signer',
    }, req,
      `${signer.name} signed the document. ` +
      `${submittedFields.length} field(s) submitted. IP: ${ip}`
    );

    // ── Respond immediately — don't make signer wait for PDF generation ────
    res.json({
      success:   true,
      completed: allSigned,
      message:   allSigned
        ? 'Document completed! All parties will receive the signed copy via email.'
        : 'Signature submitted successfully. Waiting for other signers.',
    });

    // ── Finalize PDF + send emails in background ───────────────────────────
    if (allSigned) {
      // Use setImmediate so the HTTP response flushes first
      setImmediate(async () => {
        try {
          // Write "completed" audit BEFORE generating PDF
          // so it appears in the audit page
          await writeAudit(doc._id, 'completed', {
            name:  'System',
            email: '',
            role:  'system',
          }, null,
            'All parties signed. Document finalized and sent to all recipients.'
          );

          // ✅ Generate signed PDF with embedded signatures + audit log
          const { signedBuffer } = await finalizePdf(doc);

          // ✅ Send completion email with signed PDF attached to ALL parties
          const fullDoc = await Document
            .findById(doc._id)
            .populate('owner', 'email full_name')
            .lean();

          // Build unique recipient list: all signers + owner
          const recipientMap = new Map();

          (fullDoc.signers || []).forEach(s => {
            if (s.email) recipientMap.set(s.email, s.name || s.email);
          });

          if (fullDoc.owner?.email) {
            recipientMap.set(
              fullDoc.owner.email,
              fullDoc.owner.full_name || fullDoc.owner.email
            );
          }

          const emailJobs = [];
          recipientMap.forEach((name, email) => {
            emailJobs.push(
              sendCompletionEmail({
                to:              email,
                name,
                docTitle:        fullDoc.title,
                documentId:      fullDoc._id,
                signedPdfBuffer: signedBuffer,  // ✅ attach signed PDF
              }).catch(e =>
                console.error(`[Email] completion failed for ${email}:`, e.message)
              )
            );
          });

          await Promise.all(emailJobs);

          console.log(
            `[Submit] ✅ Document ${doc._id} finalized. ` +
            `Emails sent to ${recipientMap.size} recipient(s).`
          );
        } catch (bgErr) {
          console.error('[Submit] Background finalize failed:', bgErr);
        }
      });
    }

  } catch (err) {
    console.error('[POST /sign/:token/submit]', err);
    return res.status(500).json({ message: 'Failed to submit signature. Please try again.' });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// TEMPLATE ROUTES (protected)
// ══════════════════════════════════════════════════════════════════════════════

// ── POST /api/documents/templates ────────────────────────────────────────────
router.post('/templates', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'PDF file is required.' });
    }

    let fields = [], party1 = {};
    try {
      fields = JSON.parse(req.body.fields || '[]');
      party1 = JSON.parse(req.body.party1 || '{}');
    } catch {
      unlinkSafe(req.file?.path);
      return res.status(400).json({ message: 'Invalid fields/party1 JSON.' });
    }

    const doc = await Document.create({
      title:             (req.body.title || 'Untitled Template').trim(),
      owner:             req.user._id,
      original_pdf_path: req.file.path,
      fields,
      signers: [{
        name:   party1.name  || req.user.full_name || 'Admin',
        email:  party1.email || req.user.email,
        role:   'owner',
        status: 'signed',
      }],
      is_template: true,
      status:      'draft',
    });

    await writeAudit(doc._id, 'created', {
      name:  req.user.full_name || req.user.email,
      email: req.user.email,
      role:  'owner',
    }, req, `Template "${doc.title}" created.`);

    return res.status(201).json({
      success:  true,
      message:  'Template created.',
      document: { _id: doc._id, title: doc.title },
    });
  } catch (err) {
    console.error('[POST /templates]', err);
    unlinkSafe(req.file?.path);
    return res.status(500).json({ message: 'Failed to create template.' });
  }
});

// ── GET /api/documents/templates ─────────────────────────────────────────────
router.get('/templates', protect, async (req, res) => {
  try {
    const templates = await Document
      .find({ owner: req.user._id, is_template: true })
      .select('title createdAt fields signers original_pdf_path')
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, data: templates });
  } catch (err) {
    console.error('[GET /templates]', err);
    return res.status(500).json({ message: 'Failed to fetch templates.' });
  }
});

// ── GET /api/documents/templates/:id/pdf ─────────────────────────────────────
router.get('/templates/:id/pdf', protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid template ID.' });
    }

    const doc = await Document
      .findOne({ _id: req.params.id, owner: req.user._id, is_template: true })
      .lean();

    if (!doc) return res.status(404).json({ message: 'Template not found.' });

    const filePath = doc.original_pdf_path;
    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Template PDF not found.' });
    }

    const stat = fs.statSync(filePath);
    res.setHeader('Content-Type',        'application/pdf');
    res.setHeader('Content-Length',      stat.size);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(doc.title)}.pdf"`);
    res.setHeader('Cache-Control',       'private, max-age=3600');

    return fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error('[GET /templates/:id/pdf]', err);
    return res.status(500).json({ message: 'Failed to stream template PDF.' });
  }
});

module.exports = router;