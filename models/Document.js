const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  fileUrl: { type: String, required: true },
  fileId: { type: String, required: true },
  ccEmails: [{ 
    type: String, 
    lowercase: true, 
    trim: true 
  }],
  senderMeta: { 
    type: mongoose.Schema.Types.Mixed, 
    default: null 
  },
  parties: [{
    name: { type: String, required: true },
    email: { type: String, lowercase: true, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'sent', 'signed', 'completed'],
      default: 'pending' 
    },
    token: { type: String, index: true, sparse: true },
    signedAt: Date,
    device: { type: String, default: 'Unknown Device' },
    ipAddress: { type: String, default: 'N/A' },
    location: { type: String, default: 'Unknown' },
    postalCode: { type: String },
    timeZone: { type: String },
  }],
  fields: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  totalPages: { type: Number, default: 1 },
  status: { type: String, enum: ['draft', 'in_progress', 'completed'], default: 'draft' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  currentPartyIndex: { type: Number, default: 0 },
}, { 
  timestamps: true 
});

// Indexing for performance
documentSchema.index({ "parties.token": 1 });
documentSchema.index({ owner: 1, status: 1 });

module.exports = mongoose.model('Document', documentSchema);
