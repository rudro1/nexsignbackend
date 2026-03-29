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
    index: true
  },
  performed_by: {
    name: { type: String, trim: true, maxlength: 100 },
    email: { type: String, lowercase: true, trim: true },
    role: { 
      type: String, 
      enum: ['owner', 'signer', 'admin', 'super_admin', 'system'], 
      default: 'signer' 
    },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  ip_address: { 
    type: String, 
    maxlength: 45
  },
  user_agent: { 
    type: String, 
    maxlength: 500 
  },
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
  client_time: { type: String },
  timezone: { type: String },
  details: { 
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  document_title: { type: String, maxlength: 200 },
  document_status: { type: String },
  timestamp: { 
    type: Date, 
    default: Date.now, 
    index: true 
  }
}, {
  timestamps: true
});

// TTL Index (Auto Cleanup Old Logs - 2 Years)
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 63072000 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
