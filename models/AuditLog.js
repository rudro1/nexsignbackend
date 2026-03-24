
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
    enum: [
      'created', 'draft_saved', 'sent', 'opened', 'viewed', 
      'signed', 'declined', 'completed', 'cancelled', 'expired', 
      'deleted', 'restored', 'admin_deleted', 'download'
    ], 
    required: true,
    index: true // ✅ FAST Search
  },
  performed_by: {
    name: { type: String, trim: true, maxlength: 100 },
    email: { type: String, lowercase: true, trim: true },
    role: { 
      type: String, 
      enum: ['owner', 'signer', 'admin', 'super_admin', 'system'], 
      default: 'signer' 
    },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // ✅ Track User
  },
  ip_address: { 
    type: String, 
    maxlength: 45 // IPv6 Support
  },
  user_agent: { 
    type: String, 
    maxlength: 500 
  },
  // 🌍 Enhanced Location Tracking
  location: { 
    type: String, 
    default: 'Unknown',
    maxlength: 100 
  },
  coordinates: {
    lat: Number,
    lng: Number
  },
  postal_code: { type: String, maxlength: 20 },
  client_time: { type: String }, // "10:30 PM +06"
  timezone: { type: String }, // "Asia/Dhaka"
  
  // ✅ Extra Audit Fields
  details: { 
    type: mongoose.Schema.Types.Mixed, // Flexible JSON
    default: {}
  },
  document_title: { type: String, maxlength: 200 }, // Snapshot
  document_status: { type: String },
  
  // ✅ Security & Retention
  timestamp: { 
    type: Date, 
    default: Date.now, 
    index: true 
  }
}, {
  timestamps: true // createdAt/updatedAt auto
});

// ✅ TTL Index (Auto Cleanup Old Logs - 2 Years)
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 63072000 }); // 2 years

// ✅ Compound Index for Fast Queries
auditLogSchema.index({ document_id: 1, action: 1, timestamp: -1 });
auditLogSchema.index({ 'performed_by.email': 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);