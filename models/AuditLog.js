// const mongoose = require('mongoose');

// const auditLogSchema = new mongoose.Schema({
//   document_id: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'Document', 
//     required: true 
//   },
//   action: { 
//     type: String, 
//     enum: ["created", "sent", "opened", "signed", "completed", "cancelled"],
//     required: true 
//   },
//   party_name: { type: String },
//   party_email: { type: String },
//   details: { type: String },
//   timestamp: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('AuditLog', auditLogSchema);
// const mongoose = require('mongoose');

// const auditLogSchema = new mongoose.Schema({
//   document_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
//   action: { 
//     type: String, 
//     enum: ['created', 'sent', 'opened', 'signed', 'completed', 'cancelled'], 
//     required: true 
//   },
//   party_name: String,
//   party_email: String,
//   ip_address: String, // অতিরিক্ত সিকিউরিটির জন্য আইপি ট্র্যাক করা ভালো
//   details: String,
//   timestamp: { type: Date, default: Date.now }
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
    // 'updated' এবং 'draft_saved' যোগ করা হয়েছে যাতে ভ্যালিডেশন এরর না আসে
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
  details: { type: String },
  timestamp: { type: Date, default: Date.now, index: true ,immutable: true}
});

module.exports = mongoose.model('AuditLog', auditLogSchema);