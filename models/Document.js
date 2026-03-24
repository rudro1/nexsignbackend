
// // const mongoose = require('mongoose');

// // const documentSchema = new mongoose.Schema({
// //   title: { type: String, required: true, trim: true },
// //   fileUrl: { type: String, required: true },
// //   fileId: { type: String, required: true },
// //   ccEmails: [{ 
// //     type: String, 
// //     lowercase: true, 
// //     trim: true 
// //   }],

// //   senderMeta: { 
// //     type: mongoose.Schema.Types.Mixed, 
// //     default: null 
// //   },
// //  parties: [{
// //   name: { type: String, required: true },
// //   email: { type: String, lowercase: true, required: true },
// //   status: { 
// //     type: String, 
// //   enum: ['pending', 'sent', 'signed', 'completed'],
// //     default: 'pending' 
// //   },
// //   token: { type: String, index: true, sparse: true }, // sparse: true দিলে ড্রাফটে এরর হবে না
// //   signedAt: Date,
// //   device: { type: String, default: 'Unknown Device' }, // ডিফল্ট ভ্যালু যোগ করুন
// //   ipAddress: { type: String, default: 'N/A' },        // ডিফল্ট ভ্যালু যোগ করুন
// //   location: { type: String, default: 'Unknown' },     // ডিফল্ট ভ্যালু যোগ করুন
// // }],
// //   fields: {
// //     type: [mongoose.Schema.Types.Mixed],
// //     default: []
// //   },
// //   totalPages: { type: Number, default: 1 },
// //   status: { type: String, enum: ['draft', 'in_progress', 'completed'], default: 'draft' },
// //   owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
// //   currentPartyIndex: { type: Number, default: 0 },
// // }, { 
// //   // 🌟 এটি যুক্ত করুন: এটি updatedAt এবং createdAt অটো হ্যান্ডেল করবে
// //   timestamps: true 
// // });
// // // 🚀 হাই-পারফরম্যান্সের জন্য অতিরিক্ত ইনডেক্সিং
// // documentSchema.index({ "parties.token": 1 }); // দ্রুত টোকেন খোঁজার জন্য
// // documentSchema.index({ owner: 1, status: 1 }); // ড্যাশবোর্ড ফিল্টারিং ফাস্ট করতে
// // module.exports = mongoose.model('Document', documentSchema);

// const mongoose = require('mongoose');

// const documentSchema = new mongoose.Schema({
//   title: { type: String, required: true, trim: true },
//   fileUrl: { type: String, required: true },
//   fileId: { type: String, required: true },
//   ccEmails: [{ 
//     type: String, 
//     lowercase: true, 
//     trim: true 
//   }],
//   senderMeta: { 
//     type: mongoose.Schema.Types.Mixed, 
//     default: null 
//   },
//   parties: [{
//     name: { type: String, required: true },
//     email: { type: String, lowercase: true, required: true },
//     status: { 
//       type: String, 
//       enum: ['pending', 'sent', 'signed', 'completed'],
//       default: 'pending' 
//     },
//     token: { type: String, index: true, sparse: true },
//     signedAt: Date,
//     // 🌟 অডিট লগ অনুযায়ী ইনডেক্সিং ও ডিফল্ট ভ্যালু ফিক্স
//     device: { type: String, default: 'Unknown Device' },
//     ipAddress: { type: String, default: 'N/A' },
//     location: { type: String, default: 'Unknown' }, // এখানে "City, Division, Country" স্টোর হবে
//     postalCode: { type: String }, // পোস্টাল কোড আলাদা রাখার জন্য
//     timeZone: { type: String },   // "Asia/Dhaka" এর মতো জোন সেভ রাখার জন্য
//   }],
//   fields: {
//     type: [mongoose.Schema.Types.Mixed],
//     default: []
//   },
//   totalPages: { type: Number, default: 1 },
//   status: { type: String, enum: ['draft', 'in_progress', 'completed'], default: 'draft' },
//   owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   currentPartyIndex: { type: Number, default: 0 },
// }, { 
//   timestamps: true 
// });

// // ইনডেক্সিং
// documentSchema.index({ "parties.token": 1 });
// documentSchema.index({ owner: 1, status: 1 });

// module.exports = mongoose.model('Document', documentSchema);
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  fileUrl: { type: String, required: true },
  fileId: { type: String, required: true },
  
  // ✅ টেমপ্লেট লজিক ফিক্স: এটি ছাড়া টেমপ্লেট ট্যাব কাজ করবে না
  isTemplate: { 
    type: Boolean, 
    default: false,
    index: true 
  },

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
    // এখানে মিক্সড টাইপ রাখা হয়েছে যাতে JSON স্ট্রিং বা অবজেক্ট দুইটাই হ্যান্ডেল করা যায়
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  totalPages: { type: Number, default: 1 },
  status: { 
    type: String, 
    enum: ['draft', 'in_progress', 'completed'], 
    default: 'draft' 
  },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  currentPartyIndex: { type: Number, default: 0 },
}, { 
  timestamps: true 
});

// --- ইনডেক্সিং ---
documentSchema.index({ "parties.token": 1 });
documentSchema.index({ owner: 1, status: 1 });
// টেমপ্লেট দ্রুত খোঁজার জন্য ইনডেক্স
documentSchema.index({ owner: 1, isTemplate: 1 });
// আপনার module.exports এর ঠিক উপরে এটি যোগ করতে পারেন
documentSchema.pre('save', function(next) {
  if (this.fields && Array.isArray(this.fields)) {
    this.fields = this.fields.map(field => {
      if (typeof field === 'string') {
        try {
          return JSON.parse(field);
        } catch (e) {
          return field;
        }
      }
      return field;
    });
  }
  next();
});
module.exports = mongoose.model('Document', documentSchema);