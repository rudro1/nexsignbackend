
// const mongoose = require('mongoose');

// const auditLogSchema = new mongoose.Schema({
//   document_id: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'Document', 
//     required: true,
//     index: true 
//   },
//   action: { 
//     type: String, 
//     // 'updated' এবং 'draft_saved' যোগ করা হয়েছে যাতে ভ্যালিডেশন এরর না আসে
//     enum: ['created', 'updated', 'draft_saved', 'sent', 'opened', 'signed', 'completed', 'cancelled', 'expired'], 
//     required: true 
//   },
//   performed_by: {
//     name: String,
//     email: { type: String, lowercase: true, trim: true },
//     role: { type: String, enum: ['owner', 'signer', 'system'], default: 'signer' }
//   },
//   ip_address: { type: String },
//   user_agent: { type: String }, 
//   details: { type: String },
//   timestamp: { type: Date, default: Date.now, index: true ,immutable: true}
// });

// module.exports = mongoose.model('AuditLog', auditLogSchema);
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  document_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Document', 
    required: true,
    index: true 
  },
  action: { 
    type: String, 
    enum: ['created', 'updated', 'draft_saved', 'sent', 'opened', 'signed', 'completed', 'cancelled', 'expired'], 
    required: true 
  },
  performed_by: {
    name: String,
    email: { type: String, lowercase: true, trim: true },
    role: { type: String, enum: ['owner', 'signer', 'system'], default: 'signer' }
  },
  ip_address: { type: String },
  user_agent: { type: String }, 
  // 🌟 নতুন যোগ করা হয়েছে সঠিক লোকেশন এবং টাইমের জন্য
  location: { type: String, default: 'Unknown' }, // City, Division, Country
  postal_code: { type: String },
  client_time: { type: String }, // ইউজারের জোন অনুযায়ী সময় (যেমন: 10:30 PM)
  
  details: { type: String },
  timestamp: { type: Date, default: Date.now, index: true, immutable: true }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);