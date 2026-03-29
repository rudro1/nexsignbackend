
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

const mongoose = require('mongoose');

// ── Party sub-schema ─────────────────────────────────────────────
const partySchema = new mongoose.Schema({
  name:          { type: String, default: '' },
  email:         { type: String, lowercase: true, trim: true, default: '' },
  designation:   { type: String, default: '' },
  color:         { type: String, default: '#0ea5e9' },
  status:        { type: String, enum: ['pending', 'sent', 'opened', 'signed', 'declined'], default: 'pending' },
  token:         { type: String },
  signedAt:      { type: Date },
  emailSentAt:   { type: Date },
  linkOpenedAt:  { type: Date },
  linkOpenCount: { type: Number, default: 0 },
  ip:            { type: String, default: '' },
  userAgent:     { type: String, default: '' },
  location:      { type: String, default: '' },
  postalCode:    { type: String, default: '' },
  address:       { type: String, default: '' },
  clientTime:    { type: String, default: '' },
}, { _id: false });

// ── CC recipient sub-schema ──────────────────────────────────────
const ccSchema = new mongoose.Schema({
  email:       { type: String, lowercase: true, trim: true, required: true },
  name:        { type: String, default: '' },
  designation: { type: String, default: '' },
}, { _id: false });

// ── Field sub-schema ─────────────────────────────────────────────
const fieldSchema = new mongoose.Schema({
  id:          { type: String, required: true },
  type:        { type: String, enum: ['signature', 'initials', 'text', 'date', 'checkbox'], default: 'text' },
  page:        { type: Number, default: 1 },
  x:           { type: Number, default: 0 },
  y:           { type: Number, default: 0 },
  width:       { type: Number, default: 20 },
  height:      { type: Number, default: 6 },
  partyIndex:  { type: Number, default: 0 },
  value:       { type: String, default: '' },
  fontFamily:  { type: String, default: 'Helvetica' },
  fontSize:    { type: Number, default: 14 },
  fontWeight:  { type: String, default: 'normal' },
  placeholder: { type: String, default: '' },
  required:    { type: Boolean, default: false },
}, { _id: false });

// ── Main Document schema ─────────────────────────────────────────
const documentSchema = new mongoose.Schema({
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title:       { type: String, required: true, trim: true, default: 'Untitled' },
  templateName:{ type: String, default: '' },

  // Files
  fileUrl:       { type: String, required: true },
  fileId:        { type: String, default: '' },
  signedFileUrl: { type: String, default: '' },   // ✅ Cloudinary URL of final signed PDF

  // Branding
  companyLogo: { type: String, default: '' },
  companyName: { type: String, default: '' },
  message:     { type: String, default: '' },

  // Signers
  parties: { type: [partySchema], default: [] },
  ccList:  { type: [ccSchema],   default: [] },
  fields:  { type: [fieldSchema], default: [] },

  // State
  status: {
    type:    String,
    enum:    ['draft', 'in_progress', 'completed', 'cancelled', 'expired'],
    default: 'draft',
    index:   true,
  },
  workflowType: {
    type:    String,
    enum:    ['sequential', 'parallel', 'template_instance'],
    default: 'sequential',
  },

  // Template
  isTemplate:       { type: Boolean, default: false, index: true },
  isParty1Signed:   { type: Boolean, default: false },
  sourceTemplateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', default: null },
  usageCount:       { type: Number, default: 0 },

  // Meta
  totalPages:  { type: Number, default: 1 },
  completedAt: { type: Date },               // ✅ set when all parties sign

}, {
  timestamps: true,    // adds createdAt + updatedAt
});

// Indexes
documentSchema.index({ owner: 1, status: 1 });
documentSchema.index({ owner: 1, isTemplate: 1 });
documentSchema.index({ 'parties.token': 1 }, { sparse: true });

module.exports = mongoose.model('Document', documentSchema);