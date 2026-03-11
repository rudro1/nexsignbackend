// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   full_name: { 
//     type: String, 
//     required: [true, 'Full name is required'],
//     trim: true 
//   },
//   email: { 
//     type: String, 
//     required: [true, 'Email is required'],
//     unique: true,
//     lowercase: true,
//     trim: true,
//     match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
//   },
//   password: { 
//     type: String, 
//     required: [true, 'Password is required'],
//     minlength: [6, 'Password must be at least 6 characters']
//   },
//   role: { 
//     type: String, 
//     // ✅ এখানে 'super_admin' থাকা বাধ্যতামূলক
//     enum: ['user', 'admin', 'super_admin'], 
//     default: 'user' 
//   },
//   createdAt: { 
//     type: Date, 
//     default: Date.now 
//   }
// });

// // ✅ এটিই সবচাইতে গুরুত্বপূর্ণ লাইন। কোনো ব্র্যাকেট ছাড়া সরাসরি এভাবে লিখুন:
// module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // এটি নিশ্চিত করুন ইনস্টল আছে

const userSchema = new mongoose.Schema({
  full_name: { 
    type: String, 
    required: [true, 'Full name is required'],
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: { 
    type: String, 
    enum: ['user', 'admin', 'super_admin'], 
    default: 'user' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// ✅ পাসওয়ার্ড চেক করার জন্য এই মেথডটি যোগ করুন (এটি ছাড়া লগইন হবে না)
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);