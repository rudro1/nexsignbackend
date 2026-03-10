// const mongoose = require('mongoose');

// const documentSchema = new mongoose.Schema({
//   title: { 
//     type: String, 
//     required: true 
//   },
//   fileUrl: { 
//     type: String, 
//     required: true 
//   },
//   fileId: { 
//     type: String, 
//     required: true 
//   },
//   parties: [{
//     name: String,
//     email: String,
//     status: { 
//       type: String, 
//       enum: ['pending', 'sent', 'signed'], 
//       default: 'pending' 
//     },
//     token: String,
//     signedAt: Date
//   }],
//   fields: [{
//     id: String,
//     type: String,
//     party_index: Number,
//     page: Number,
//     x: Number,
//     y: Number,
//     width: Number,
//     height: Number,
//     value: String,
//     filled: Boolean
//   }],
//   totalPages: { 
//     type: Number, 
//     default: 1 
//   },
//   status: { 
//     type: String, 
//     enum: ['draft', 'in_progress', 'completed'], 
//     default: 'draft' 
//   },
//   owner: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'User' 
//   },
//   currentPartyIndex: { 
//     type: Number, 
//     default: 0 
//   },
//   createdAt: { 
//     type: Date, 
//     default: Date.now 
//   }
// });

// module.exports = mongoose.model('Document', documentSchema);

// const mongoose = require('mongoose');

// const documentSchema = new mongoose.Schema({
//   title: { 
//     type: String, 
//     required: true 
//   },
//   fileUrl: { 
//     type: String, 
//     required: true 
//   },
//   fileId: { 
//     type: String, 
//     required: true 
//   },
//   parties: [{
//     name: String,
//     email: String,
//     status: { 
//       type: String, 
//       enum: ['pending', 'sent', 'signed'], 
//       default: 'pending' 
//     },
//     token: String,
//     signedAt: Date
//   }],
//   // ✅ ফিক্স: Mixed টাইপ ব্যবহার করা হয়েছে যাতে CastError না আসে
//   // এটি ফ্রন্টএন্ড থেকে আসা যেকোনো অবজেক্ট স্ট্রাকচার গ্রহণ করবে
//   fields: {
//     type: [mongoose.Schema.Types.Mixed],
//     default: []
//   },
//   totalPages: { 
//     type: Number, 
//     default: 1 
//   },
//   status: { 
//     type: String, 
//     enum: ['draft', 'in_progress', 'completed'], 
//     default: 'draft' 
//   },
//   owner: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'User' 
//   },
//   currentPartyIndex: { 
//     type: Number, 
//     default: 0 
//   },
//   createdAt: { 
//     type: Date, 
//     default: Date.now 
//   }
// });

// module.exports = mongoose.model('Document', documentSchema);

// const mongoose = require('mongoose');

// const documentSchema = new mongoose.Schema({
//   title: { type: String, required: true, trim: true },
//   fileUrl: { type: String, required: true },
//   fileId: { type: String, required: true }, // Cloudinary Public ID
//   parties: [{
//     name: String,
//     email: { type: String, lowercase: true },
//     status: { type: String, enum: ['pending', 'sent', 'signed'], default: 'pending' },
//     token: { type: String, index: true }, // টোকেন দিয়ে সার্চ ফাস্ট করতে ইনডেক্স
//     signedAt: Date
//   }],
//   fields: {
//     type: [mongoose.Schema.Types.Mixed], // সিগনেচার কোঅর্ডিনেট এবং ডাটা এখানে থাকবে
//     default: []
//   },
//   totalPages: { type: Number, default: 1 },
//   status: { type: String, enum: ['draft', 'in_progress', 'completed'], default: 'draft' },
//   owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   currentPartyIndex: { type: Number, default: 0 },
//   createdAt: { type: Date, default: Date.now }
// });

// // মিক্সড টাইপ ডাটাবেসকে জানানোর জন্য একটি মিডলওয়্যার (খুবই গুরুত্বপূর্ণ)
// documentSchema.pre('save', function(next) {
//   if (this.isModified('fields')) {
//     this.markModified('fields');
//   }
//   next();
// });

// module.exports = mongoose.model('Document', documentSchema);

//ai

const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  fileUrl: { type: String, required: true },
  fileId: { type: String, required: true },
  parties: [{
    name: String,
    email: { type: String, lowercase: true },
    status: { type: String, enum: ['pending', 'sent', 'signed'], default: 'pending' },
    token: { type: String, index: true },
    signedAt: Date
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

module.exports = mongoose.model('Document', documentSchema);