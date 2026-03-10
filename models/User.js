const mongoose = require('mongoose');

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
    // ✅ এখানে 'super_admin' থাকা বাধ্যতামূলক
    enum: ['user', 'admin', 'super_admin'], 
    default: 'user' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// ✅ এটিই সবচাইতে গুরুত্বপূর্ণ লাইন। কোনো ব্র্যাকেট ছাড়া সরাসরি এভাবে লিখুন:
module.exports = mongoose.model('User', userSchema);