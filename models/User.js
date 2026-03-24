// // const mongoose = require('mongoose');

// // const userSchema = new mongoose.Schema({
// //   full_name: { 
// //     type: String, 
// //     required: [true, 'Full name is required'],
// //     trim: true 
// //   },
// //   email: { 
// //     type: String, 
// //     required: [true, 'Email is required'],
// //     unique: true,
// //     lowercase: true,
// //     trim: true,
// //     match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
// //   },
// //   password: { 
// //     type: String, 
// //     required: [true, 'Password is required'],
// //     minlength: [6, 'Password must be at least 6 characters']
// //   },
// //   role: { 
// //     type: String, 
// //     // ✅ এখানে 'super_admin' থাকা বাধ্যতামূলক
// //     enum: ['user', 'admin', 'super_admin'], 
// //     default: 'user' 
// //   },
// //   createdAt: { 
// //     type: Date, 
// //     default: Date.now 
// //   }
// // });

// // // ✅ এটিই সবচাইতে গুরুত্বপূর্ণ লাইন। কোনো ব্র্যাকেট ছাড়া সরাসরি এভাবে লিখুন:
// // module.exports = mongoose.model('User', userSchema);

// // const mongoose = require('mongoose');
// // const bcrypt = require('bcryptjs'); // এটি নিশ্চিত করুন ইনস্টল আছে

// // const userSchema = new mongoose.Schema({
// //   full_name: { 
// //     type: String, 
// //     required: [true, 'Full name is required'],
// //     trim: true 
// //   },
// //   email: { 
// //     type: String, 
// //     required: [true, 'Email is required'],
// //     unique: true,
// //     lowercase: true,
// //     trim: true,
// //     match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
// //   },
// //   password: { 
// //     type: String, 
// //     required: function() { return !this.googleId; }, // যদি গুগল লগইন না হয় তবে পাসওয়ার্ড লাগবে // [true, 'Password is required'],
// //     minlength: [6, 'Password must be at least 6 characters'],
// //     default: "google_login_user" // ✅ added
// //   },
// //   role: { 
// //     type: String, 
// //     enum: ['user', 'admin', 'super_admin'], 
// //     default: 'user' 
// //   },
// //   createdAt: { 
// //     type: Date, 
// //     default: Date.now 
// //   },
  
// // });

// // // ✅ পাসওয়ার্ড চেক করার জন্য এই মেথডটি যোগ করুন (এটি ছাড়া লগইন হবে না)
// // userSchema.methods.comparePassword = async function(enteredPassword) {
// //   return await bcrypt.compare(enteredPassword, this.password);
// // };

// // module.exports = mongoose.model('User', userSchema);

// // // ✅ এটিই সবচাইতে গুরুত্বপূর্ণ লাইন। কোনো ব্র্যাকেট ছাড়া সরাসরি এভাবে লিখুন:
// // module.exports = mongoose.model('User', userSchema);

// // const mongoose = require('mongoose');
// // const bcrypt = require('bcryptjs');

// // const userSchema = new mongoose.Schema({
// //   full_name: { 
// //     type: String, 
// //     required: [true, 'Full name is required'],
// //     trim: true 
// //   },
// //   email: { 
// //     type: String, 
// //     required: [true, 'Email is required'],
// //     unique: true,
// //     lowercase: true,
// //     trim: true,
// //     match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
// //   },
// //   password: { 
// //     type: String, 
// //     required: function() { return !this.googleId; }, 
// //     minlength: [6, 'Password must be at least 6 characters'],
// //     // Google login ইউজারদের জন্য একটি র‍্যান্ডম পাসওয়ার্ড জেনারেট করা ভালো, 
// //     // তবে ডিফল্ট ভ্যালু হিসেবে "google_login_user" রাখা সিকিউর নয়।
// //   },
// //   googleId: { type: String }, // এটি যোগ করা জরুরি যেহেতু পাসওয়ার্ডে চেক করছেন
// //   role: { 
// //     type: String, 
// //     enum: ['user', 'admin', 'super_admin'], 
// //     default: 'user' 
// //   },
// //   createdAt: { 
// //     type: Date, 
// //     default: Date.now 
// //   },
// // });

// // /**
// //  * ১. পাসওয়ার্ড সেভ করার আগে অটোমেটিক হ্যাশ করা (Crucial Fix)
// //  */
// // userSchema.pre('save', async function(next) {
// //   // যদি পাসওয়ার্ড মডিফাই না হয় (যেমন শুধু নাম আপডেট করলে), তবে হ্যাশ করার দরকার নেই
// //   if (!this.isModified('password')) return next();

// //   try {
// //     const salt = await bcrypt.genSalt(10);
// //     this.password = await bcrypt.hash(this.password, salt);
// //     next();
// //   } catch (error) {
// //     next(error);
// //   }
// // });

// // /**
// //  * ২. পাসওয়ার্ড চেক করার মেথড
// //  */
// // userSchema.methods.comparePassword = async function(enteredPassword) {
// //   // যদি ইউজার গুগল দিয়ে লগইন করে এবং পাসওয়ার্ড না থাকে
// //   if (!this.password) return false;
// //   return await bcrypt.compare(enteredPassword, this.password);
// // };

// // // ৩. ইনডেক্সিং (Scalability-র জন্য জরুরি)
// // userSchema.index({ email: 1 });

// // module.exports = mongoose.model('User', userSchema);

// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const userSchema = new mongoose.Schema({
//   full_name: { 
//     type: String, 
//     required: [true, 'Full name required'], 
//     trim: true, 
//     maxlength: 100 
//   },
//   email: { 
//     type: String, 
//     required: [true, 'Email required'], 
//     unique: true, 
//     lowercase: true, 
//     trim: true,
//     match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format']
//   },
//   password: { 
//     type: String, 
//     required: [function() { return !this.googleId; }, 'Password required for email login'],
//     minlength: [8, 'Password must be 8+ characters'],
//     select: false,
//     set: value => value ? bcrypt.hashSync(value, 12) : value // ✅ Instant Hash
//   },
//   googleId: { 
//     type: String, 
//     sparse: true, 
//     unique: true,
//     index: true 
//   },
//   role: { 
//     type: String, 
//     enum: ['user', 'admin', 'super_admin'], 
//     default: 'user',
//     index: true 
//   },
//   // ✅ Security & Features
//   isEmailVerified: { type: Boolean, default: false },
//   isActive: { type: Boolean, default: true, index: true },
//   loginAttempts: { type: Number, default: 0 },
//   lockUntil: { type: Date },
//   lastLogin: Date,
//   tokens: [{
//     token: String,
//     expires: Date,
//     createdAt: { type: Date, default: Date.now }
//   }],
//   preferences: {
//     theme: { type: String, default: 'light' },
//     language: { type: String, default: 'en' },
//     notifications: { type: Boolean, default: true }
//   },
//   createdAt: { type: Date, default: Date.now, index: true },
//   updatedAt: Date
// }, {
//   timestamps: true
// });

// // ✅ Indexes (Lightning Fast)
// userSchema.index({ email: 1 });
// userSchema.index({ googleId: 1 });
// userSchema.index({ role: 1, isActive: 1 });
// userSchema.index({ lockUntil: 1 });

// // ✅ Password Hashing (Enhanced)
// userSchema.pre('save', async function(next) {
//   if (this.isModified('password') && this.password) {
//     this.password = await bcrypt.hash(this.password, 12); // Stronger salt
//   }
//   this.updatedAt = new Date();
//   next();
// });

// // ✅ Password Compare
// userSchema.methods.comparePassword = async function(candidatePassword) {
//   if (!this.password) return false;
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// // ✅ JWT Token Methods
// userSchema.methods.generateAuthToken = function() {
//   const token = require('jsonwebtoken').sign(
//     { 
//       _id: this._id,
//       email: this.email,
//       role: this.role 
//     },
//     process.env.JWT_SECRET,
//     { expiresIn: '7d' }
//   );
  
//   this.tokens = this.tokens.concat({ token, expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
//   return this.save().then(() => token);
// };

// // ✅ Remove Expired Tokens
// userSchema.methods.clearExpiredTokens = function() {
//   const now = new Date();
//   this.tokens = this.tokens.filter(t => t.expires > now);
//   return this.save();
// };

// // ✅ Check if Locked
// userSchema.methods.isLocked = function() {
//   return this.lockUntil && this.lockUntil > new Date();
// };

// // ✅ Virtual for Full Profile
// userSchema.virtual('profile').get(function() {
//   return {
//     id: this._id,
//     full_name: this.full_name,
//     email: this.email,
//     role: this.role,
//     isActive: this.isActive,
//     preferences: this.preferences
//   };
// });

// // ✅ JSON Output (No Sensitive Data)
// userSchema.methods.toJSON = function() {
//   const obj = this.toObject();
//   delete obj.password;
//   delete obj.tokens;
//   delete obj.__v;
//   return obj;
// };

// // ✅ Pre-find (Active Users Only)
// userSchema.pre(/^find/, function(next) {
//   this.where({ isActive: true });
//   next();
// });

// module.exports = mongoose.model('User', userSchema);



const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const userSchema = new mongoose.Schema({
full_name: { type: String, required: true, trim: true },
email: { type: String, required: true, unique: true, lowercase: true, trim: true },
password: {
type: String,
required: function() { return !this.googleId; },
minlength: 6,
select: false // ডাটাবেস কোয়েরিতে এটি অটোমেটিক আসবে না
},
googleId: { type: String, sparse: true, unique: true },
role: { type: String, enum: ['user', 'admin', 'super_admin'], default: 'user' },
createdAt: { type: Date, default: Date.now }
});


userSchema.pre('save', async function(next) {
if (!this.isModified('password') || !this.password) return next();
this.password = await bcrypt.hash(this.password, 10);
next();
});


userSchema.methods.comparePassword = async function(password) {
if (!this.password) return false;
return await bcrypt.compare(password, this.password);
};


module.exports = mongoose.model('User', userSchema);