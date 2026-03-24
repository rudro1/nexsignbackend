
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
// // //  parties: [{
// // //   name: { type: String, required: true },
// // //   email: { type: String, lowercase: true, required: true },
// // //   status: { 
// // //     type: String, 
// // //   enum: ['pending', 'sent', 'signed', 'completed'],
// // //     default: 'pending' 
// // //   },
// // //   token: { type: String, index: true, sparse: true }, // sparse: true দিলে ড্রাফটে এরর হবে না
// // //   signedAt: Date,
// // //   device: { type: String, default: 'Unknown Device' }, // ডিফল্ট ভ্যালু যোগ করুন
// // //   ipAddress: { type: String, default: 'N/A' },        // ডিফল্ট ভ্যালু যোগ করুন
// // //   location: { type: String, default: 'Unknown' },     // ডিফল্ট ভ্যালু যোগ করুন
// // // }],
// // //   fields: {
// // //     type: [mongoose.Schema.Types.Mixed],
// // //     default: []
// // //   },
// // //   totalPages: { type: Number, default: 1 },
// // //   status: { type: String, enum: ['draft', 'in_progress', 'completed'], default: 'draft' },
// // //   owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
// // //   currentPartyIndex: { type: Number, default: 0 },
// // // }, { 
// // //   // 🌟 এটি যুক্ত করুন: এটি updatedAt এবং createdAt অটো হ্যান্ডেল করবে
// // //   timestamps: true 
// // // });
// // // // 🚀 হাই-পারফরম্যান্সের জন্য অতিরিক্ত ইনডেক্সিং
// // // documentSchema.index({ "parties.token": 1 }); // দ্রুত টোকেন খোঁজার জন্য
// // // documentSchema.index({ owner: 1, status: 1 }); // ড্যাশবোর্ড ফিল্টারিং ফাস্ট করতে
// // // module.exports = mongoose.model('Document', documentSchema);

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
// //   parties: [{
// //     name: { type: String, required: true },
// //     email: { type: String, lowercase: true, required: true },
// //     status: { 
// //       type: String, 
// //       enum: ['pending', 'sent', 'signed', 'completed'],
// //       default: 'pending' 
// //     },
// //     token: { type: String, index: true, sparse: true },
// //     signedAt: Date,
// //     // 🌟 অডিট লগ অনুযায়ী ইনডেক্সিং ও ডিফল্ট ভ্যালু ফিক্স
// //     device: { type: String, default: 'Unknown Device' },
// //     ipAddress: { type: String, default: 'N/A' },
// //     location: { type: String, default: 'Unknown' }, // এখানে "City, Division, Country" স্টোর হবে
// //     postalCode: { type: String }, // পোস্টাল কোড আলাদা রাখার জন্য
// //     timeZone: { type: String },   // "Asia/Dhaka" এর মতো জোন সেভ রাখার জন্য
// //   }],
// //   fields: {
// //     type: [mongoose.Schema.Types.Mixed],
// //     default: []
// //   },
// //   totalPages: { type: Number, default: 1 },
// //   status: { type: String, enum: ['draft', 'in_progress', 'completed'], default: 'draft' },
// //   owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
// //   currentPartyIndex: { type: Number, default: 0 },
// // }, { 
// //   timestamps: true 
// // });

// // // ইনডেক্সিং
// // documentSchema.index({ "parties.token": 1 });
// // documentSchema.index({ owner: 1, status: 1 });

// // module.exports = mongoose.model('Document', documentSchema);
// // const mongoose = require('mongoose');

// // const documentSchema = new mongoose.Schema({
// //   title: { type: String, required: true, trim: true },
// //   fileUrl: { type: String, required: true },
// //   fileId: { type: String, required: true },
  
// //   // ✅ টেমপ্লেট লজিক ফিক্স: এটি ছাড়া টেমপ্লেট ট্যাব কাজ করবে না
// //   isTemplate: { 
// //     type: Boolean, 
// //     default: false,
// //     index: true 
// //   },

// //   ccEmails: [{ 
// //     type: String, 
// //     lowercase: true, 
// //     trim: true 
// //   }],
// //   senderMeta: { 
// //     type: mongoose.Schema.Types.Mixed, 
// //     default: null 
// //   },
// //   parties: [{
// //     name: { type: String, required: true },
// //     email: { type: String, lowercase: true, required: true },
// //     status: { 
// //       type: String, 
// //       enum: ['pending', 'sent', 'signed', 'completed'],
// //       default: 'pending' 
// //     },
// //     token: { type: String, index: true, sparse: true },
// //     signedAt: Date,
// //     device: { type: String, default: 'Unknown Device' },
// //     ipAddress: { type: String, default: 'N/A' },
// //     location: { type: String, default: 'Unknown' }, 
// //     postalCode: { type: String }, 
// //     timeZone: { type: String },   
// //   }],
// //   fields: {
// //     // এখানে মিক্সড টাইপ রাখা হয়েছে যাতে JSON স্ট্রিং বা অবজেক্ট দুইটাই হ্যান্ডেল করা যায়
// //     type: [mongoose.Schema.Types.Mixed],
// //     default: []
// //   },
// //   totalPages: { type: Number, default: 1 },
// //   status: { 
// //     type: String, 
// //     enum: ['draft', 'in_progress', 'completed'], 
// //     default: 'draft' 
// //   },
// //   owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
// //   currentPartyIndex: { type: Number, default: 0 },
// // }, { 
// //   timestamps: true 
// // });

// // // --- ইনডেক্সিং ---
// // documentSchema.index({ "parties.token": 1 });
// // documentSchema.index({ owner: 1, status: 1 });
// // // টেমপ্লেট দ্রুত খোঁজার জন্য ইনডেক্স
// // documentSchema.index({ owner: 1, isTemplate: 1 });
// // // আপনার module.exports এর ঠিক উপরে এটি যোগ করতে পারেন
// // documentSchema.pre('save', function(next) {
// //   if (this.fields && Array.isArray(this.fields)) {
// //     this.fields = this.fields.map(field => {
// //       if (typeof field === 'string') {
// //         try {
// //           return JSON.parse(field);
// //         } catch (e) {
// //           return field;
// //         }
// //       }
// //       return field;
// //     });
// //   }
// //   next();
// // });
// // module.exports = mongoose.model('Document', documentSchema);

// const mongoose = require('mongoose');

// const documentSchema = new mongoose.Schema({
//   title: { 
//     type: String, 
//     required: [true, 'Title required'], 
//     trim: true, 
//     maxlength: 200 
//   },
//   fileUrl: { 
//     type: String, 
//     required: [true, 'File URL required'],
//     match: /^https:\/\/res\.cloudinary\.com\/.*$/ 
//   },
//   fileId: { 
//     type: String, 
//     required: [true, 'Cloudinary ID required'],
//     maxlength: 500 
//   },
  
//   // ✅ Template System
//   isTemplate: { 
//     type: Boolean, 
//     default: false,
//     index: true 
//   },
//   templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Template' },

//   ccEmails: [{ 
//     type: String, 
//     lowercase: true, 
//     trim: true,
//     match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ 
//   }],
  
//   senderMeta: { 
//     type: mongoose.Schema.Types.Mixed, 
//     default: () => ({})
//   },
  
//   parties: [{
//     name: { 
//       type: String, 
//       required: true, 
//       trim: true, 
//       maxlength: 100 
//     },
//     email: { 
//       type: String, 
//       lowercase: true, 
//       required: true,
//       match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ 
//     },
//     status: { 
//       type: String, 
//       enum: ['pending', 'sent', 'signed', 'declined', 'completed'],
//       default: 'pending' 
//     },
//     token: { 
//       type: String, 
//       index: true, 
//       sparse: true,
//       expires: '7d' // Token expires in 7 days
//     },
//     signedAt: Date,
//     device: { type: String, default: 'Unknown Device', maxlength: 100 },
//     ipAddress: { type: String, default: 'N/A', maxlength: 45 },
//     location: { type: String, default: 'Unknown', maxlength: 100 },
//     postalCode: { type: String, maxlength: 20 },
//     timeZone: { type: String, maxlength: 50 },
//     fieldsSigned: { type: [Number], default: [] } // Which fields they signed
//   }],
  
//   fields: {
//     type: [mongoose.Schema.Types.Mixed],
//     default: [],
//     validate: {
//       validator: function(v) {
//         return Array.isArray(v) && v.every(f => f.page && f.x && f.y);
//       },
//       message: 'Fields must be valid array'
//     }
//   },
  
//   totalPages: { 
//     type: Number, 
//     min: 1, 
//     default: 1 
//   },
  
//   status: { 
//     type: String, 
//     enum: ['draft', 'sent', 'in_progress', 'completed', 'cancelled', 'expired', 'deleted'],
//     default: 'draft',
//     index: true 
//   },
  
//   owner: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'User',
//     required: true,
//     index: true 
//   },
  
//   currentPartyIndex: { 
//     type: Number, 
//     min: 0, 
//     default: 0 
//   },
  
//   // ✅ Enterprise Features
//   expiresAt: { type: Date, index: true }, // Auto expire
//   remindersSent: { type: Number, default: 0, max: 3 },
//   lastActivity: { type: Date, default: Date.now },
//   downloadCount: { type: Number, default: 0 },
//   viewCount: { type: Number, default: 0 }
  
// }, { 
//   timestamps: true,
//   toJSON: { virtuals: true },
//   toObject: { virtuals: true }
// });

// // ✅ Indexes (Lightning Fast Queries)
// documentSchema.index({ "parties.token": 1 });
// documentSchema.index({ owner: 1, status: 1 });
// documentSchema.index({ owner: 1, isTemplate: 1 });
// documentSchema.index({ status: 1, expiresAt: 1 });
// documentSchema.index({ "parties.email": 1 });
// documentSchema.index({ createdAt: -1 });

// // ✅ Auto Cleanup Expired Documents (30 days)
// documentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// // ✅ Pre-save Hooks
// documentSchema.pre('save', function(next) {
//   // ✅ Normalize Fields
//   if (this.fields && Array.isArray(this.fields)) {
//     this.fields = this.fields.map(field => {
//       if (typeof field === 'string') {
//         try {
//           return JSON.parse(field);
//         } catch (e) {
//           console.warn('Invalid field JSON:', field);
//           return null;
//         }
//       }
//       return field;
//     }).filter(Boolean);
//   }
  
//   // ✅ Set Expires (7 days from creation if not set)
//   if (!this.expiresAt) {
//     this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
//   }
  
//   // ✅ Update lastActivity
//   this.lastActivity = new Date();
  
//   next();
// });

// // ✅ Virtual for Progress
// documentSchema.virtual('progress').get(function() {
//   const totalParties = this.parties.length;
//   const signedParties = this.parties.filter(p => p.status === 'signed').length;
//   return totalParties ? Math.round((signedParties / totalParties) * 100) : 0;
// });

// // ✅ Query Middleware (Soft Delete)
// documentSchema.pre(/^find/, function(next) {
//   this.where({ status: { $ne: 'deleted' } });
//   next();
// });

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