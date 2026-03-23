
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
  token: { type: String, index: true, sparse: true }, // sparse: true দিলে ড্রাফটে এরর হবে না
  signedAt: Date,
  device: { type: String, default: 'Unknown Device' }, // ডিফল্ট ভ্যালু যোগ করুন
  ipAddress: { type: String, default: 'N/A' },        // ডিফল্ট ভ্যালু যোগ করুন
  location: { type: String, default: 'Unknown' },     // ডিফল্ট ভ্যালু যোগ করুন
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
  // 🌟 এটি যুক্ত করুন: এটি updatedAt এবং createdAt অটো হ্যান্ডেল করবে
  timestamps: true 
});
// 🚀 হাই-পারফরম্যান্সের জন্য অতিরিক্ত ইনডেক্সিং
documentSchema.index({ "parties.token": 1 }); // দ্রুত টোকেন খোঁজার জন্য
documentSchema.index({ owner: 1, status: 1 }); // ড্যাশবোর্ড ফিল্টারিং ফাস্ট করতে
module.exports = mongoose.model('Document', documentSchema);