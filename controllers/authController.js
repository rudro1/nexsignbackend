// // // const User = require('../models/User');
// // // const jwt = require('jsonwebtoken');
// // // const bcrypt = require('bcryptjs'); // পাসওয়ার্ড এনক্রিপশনের জন্য

// // // // ১. রেজিস্ট্রেশন লজিক
// // // // exports.register = async (req, res) => {
// // // //   try {
// // // //     const { full_name, email, password } = req.body;

// // // //     // ইউজার অলরেডি আছে কি না চেক করা
// // // //     let user = await User.findOne({ email });
// // // //     if (user) {
// // // //       return res.status(400).json({ message: "এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে।" });
// // // //     }

// // // //     // নতুন ইউজার তৈরি (আপনার User মডেলে যদি bcrypt প্রি-সেভ হুক না থাকে তবে এখানে হ্যাশ করতে হবে)
// // // //     user = new User({
// // // //       full_name,
// // // //       email,
// // // //       password // আপনার মডেলে পাসওয়ার্ড হ্যাশ করার লজিক থাকা উচিত
// // // //     });

// // // //     await user.save();

// // // //     // টোকেন জেনারেট করা
// // // //     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// // // //     res.status(201).json({
// // // //       message: "অ্যাকাউন্ট তৈরি সফল হয়েছে",
// // // //       token,
// // // //       user: {
// // // //         id: user._id,
// // // //         full_name: user.full_name,
// // // //         email: user.email
// // // //       }
// // // //     });
// // // //   } catch (error) {
// // // //     console.error(error);
// // // //     res.status(500).json({ message: "সার্ভারে সমস্যা হয়েছে।" });
// // // //   }
// // // // };

// // // exports.register = async (req, res) => {
// // //   try {
// // //     const { full_name, email, password } = req.body;

// // //     let user = await User.findOne({ email: email.toLowerCase() });
// // //     if (user) {
// // //       return res.status(400).json({ message: "এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে।" });
// // //     }

// // //     // ✅ ডাটাবেজে সেভ করার আগে পাসওয়ার্ড হ্যাশ করা জরুরি
// // //     const salt = await bcrypt.genSalt(10);
// // //     const hashedPassword = await bcrypt.hash(password, salt);

// // //     user = new User({
// // //       full_name,
// // //       email: email.toLowerCase(),
// // //       password: hashedPassword // হ্যাশ করা পাসওয়ার্ড সেভ হচ্ছে
// // //     });

// // //     await user.save();

// // //     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// // //     res.status(201).json({
// // //       message: "অ্যাকাউন্ট তৈরি সফল হয়েছে",
// // //       token,
// // //       user: { id: user._id, full_name: user.full_name, email: user.email }
// // //     });
// // //   } catch (error) {
// // //     console.error(error);
// // //     res.status(500).json({ message: "সার্ভারে সমস্যা হয়েছে।" });
// // //   }
// // // };

// // // // ২. লগইন লজিক
// // // exports.login = async (req, res) => {
// // //   try {
// // //     const { email, password } = req.body;
    
// // //     // ইউজার খুঁজে বের করা
// // //     const user = await User.findOne({ email });
// // //     if (!user) {
// // //       return res.status(400).json({ message: "সঠিক ইমেইল বা পাসওয়ার্ড দিন।" });
// // //     }

// // //     // পাসওয়ার্ড চেক করা (bcrypt.compare ব্যবহার করুন)
// // //     const isMatch = await bcrypt.compare(password, user.password);
// // //     if (!isMatch) {
// // //       return res.status(400).json({ message: "সঠিক ইমেইল বা পাসওয়ার্ড দিন।" });
// // //     }

// // //     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// // //     res.json({ 
// // //       message: "লগইন সফল হয়েছে", 
// // //       token, 
// // //       user: {
// // //         id: user._id,
// // //         full_name: user.full_name,
// // //         email: user.email
// // //       } 
// // //     });
// // //   } catch (error) {
// // //     res.status(500).json({ message: "সার্ভারে সমস্যা হয়েছে।" });
// // //   }
// // // };
// // const User = require('../models/User'); // পাথ ঠিক আছে কি না নিশ্চিত করুন
// // const jwt = require('jsonwebtoken');
// // const bcrypt = require('bcryptjs');

// // const User = require('../models/User'); // পাথ ঠিক আছে কি না নিশ্চিত করুন
// // const jwt = require('jsonwebtoken');
// // const bcrypt = require('bcryptjs');

// // import User from '../models/User.js';
// // import jwt from 'jsonwebtoken';
// // import bcrypt from 'bcryptjs';

// // // ১. রেজিস্ট্রেশন (পাসওয়ার্ড হ্যাশ করে সেভ করবে)
// // exports.register = async (req, res) => {
// //   try {
// //     const { full_name, email, password } = req.body;
    
// //     if (!full_name || !email || !password) {
// //       return res.status(400).json({ message: "সবগুলো তথ্য প্রদান করুন।" });
// //     }

// //     const cleanEmail = email.toLowerCase().trim();

// //     // ✅ চেক: ইমেইল আগে থেকেই আছে কি না
// //     const existingUser = await User.findOne({ email: cleanEmail });
// //     if (existingUser) {
// //       return res.status(400).json({ message: "এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে।" });
// //     }

// //     // পাসওয়ার্ড হ্যাশ করা
// //     const salt = await bcrypt.genSalt(10);
// //     const hashedPassword = await bcrypt.hash(password, salt);

// //     // ✅ আপনার দেওয়া স্পেশাল ইমেইল চেক
// //     const isSuperAdmin = cleanEmail === 'bisalsaha42@gmail.com';

// //     const user = new User({
// //       full_name,
// //       email: cleanEmail,
// //       password: hashedPassword,
// //       role: isSuperAdmin ? 'super_admin' : 'user'
// //     });

// //     await user.save();

// //     // টোকেন জেনারেট (রোলসহ)
// //     const token = jwt.sign(
// //       { id: user._id, role: user.role }, 
// //       process.env.JWT_SECRET, 
// //       { expiresIn: '7d' }
// //     );

// //     res.status(201).json({
// //       message: "অ্যাকাউন্ট তৈরি সফল হয়েছে",
// //       token,
// //       user: { 
// //         id: user._id, 
// //         full_name: user.full_name, 
// //         email: user.email,
// //         role: user.role 
// //       }
// //     });
// //   } catch (error) {
// //     console.error("Register Error Detail:", error); // টার্মিনালে আসল এরর দেখতে
// //     res.status(500).json({ message: "সার্ভারে সমস্যা হয়েছে।", error: error.message });
// //   }
// // };

// // // ২. লগইন (হ্যাশ করা পাসওয়ার্ড চেক করবে)
// // exports.login = async (req, res) => {
// //   try {
// //     const { email, password } = req.body;
// //     const cleanEmail = email.toLowerCase().trim();
    
// //     const user = await User.findOne({ email: cleanEmail });
// //     if (!user) {
// //       return res.status(400).json({ message: "সঠিক ইমেইল বা পাসওয়ার্ড দিন।" });
// //     }

// //     const isMatch = await bcrypt.compare(password, user.password);
// //     if (!isMatch) {
// //       return res.status(400).json({ message: "সঠিক ইমেইল বা পাসওয়ার্ড দিন।" });
// //     }

// //     const token = jwt.sign(
// //       { id: user._id, role: user.role }, 
// //       process.env.JWT_SECRET, 
// //       { expiresIn: '7d' }
// //     );

// //     res.json({ 
// //       token, 
// //       user: { 
// //         id: user._id, 
// //         full_name: user.full_name, 
// //         email: user.email,
// //         role: user.role 
// //       } 
// //     });
// //   } catch (error) {
// //     console.error("Login Error Detail:", error);
// //     res.status(500).json({ message: "সার্ভারে সমস্যা হয়েছে।" });
// //   }
// // };





// // // ৩. Google Login
// // exports.googleAuth = async (req, res) => {
// //   try {
// //     const { name, email, photoURL } = req.body;

// //     if (!email) {
// //       return res.status(400).json({ message: "Email is required" });
// //     }

// //     let user = await User.findOne({ email });

// //     if (!user) {
// //       user = await User.create({
// //         full_name: name,
// //         email: email,
// //         photo: photoURL,
// //         role: "user",
// //         status: "active"
// //       });
// //     }

// //     const token = jwt.sign(
// //       { id: user._id, role: user.role },
// //       process.env.JWT_SECRET,
// //       { expiresIn: "7d" }
// //     );

// //     res.json({
// //       token,
// //       user
// //     });

// //   } catch (error) {
// //     console.error(error);
// //     res.status(500).json({ message: "Google authentication failed" });
// //   }
// // };


// // import User from '../models/User.js';
// // import jwt from 'jsonwebtoken';
// // import bcrypt from 'bcryptjs';


// // // ================= REGISTER =================
// // export const register = async (req, res) => {
// //   try {
// //     const { full_name, email, password } = req.body;

// //     if (!full_name || !email || !password) {
// //       return res.status(400).json({ message: "সবগুলো তথ্য প্রদান করুন।" });
// //     }

// //     const cleanEmail = email.toLowerCase().trim();

// //     // email exist check
// //     const existingUser = await User.findOne({ email: cleanEmail });
// //     if (existingUser) {
// //       return res.status(400).json({
// //         message: "এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে।"
// //       });
// //     }

// //     // password hash
// //     const salt = await bcrypt.genSalt(10);
// //     const hashedPassword = await bcrypt.hash(password, salt);

// //     // super admin check
// //     const isSuperAdmin = cleanEmail === "bisalsaha42@gmail.com";

// //     const user = new User({
// //       full_name,
// //       email: cleanEmail,
// //       password: hashedPassword,
// //       role: isSuperAdmin ? "super_admin" : "user"
// //     });

// //     await user.save();

// //     // JWT token
// //     const token = jwt.sign(
// //       { id: user._id, role: user.role },
// //       process.env.JWT_SECRET,
// //       { expiresIn: "7d" }
// //     );

// //     res.status(201).json({
// //       message: "অ্যাকাউন্ট তৈরি সফল হয়েছে",
// //       token,
// //       user: {
// //         id: user._id,
// //         full_name: user.full_name,
// //         email: user.email,
// //         role: user.role
// //       }
// //     });

// //   } catch (error) {
// //     console.error("Register Error:", error);
// //     res.status(500).json({
// //       message: "সার্ভারে সমস্যা হয়েছে",
// //       error: error.message
// //     });
// //   }
// // };



// // // ================= LOGIN =================
// // export const login = async (req, res) => {
// //   try {
// //     const { email, password } = req.body;

// //     const cleanEmail = email.toLowerCase().trim();

// //     const user = await User.findOne({ email: cleanEmail });

// //     if (!user) {
// //       return res.status(400).json({
// //         message: "সঠিক ইমেইল বা পাসওয়ার্ড দিন।"
// //       });
// //     }

// //     const isMatch = await bcrypt.compare(password, user.password);

// //     if (!isMatch) {
// //       return res.status(400).json({
// //         message: "সঠিক ইমেইল বা পাসওয়ার্ড দিন।"
// //       });
// //     }

// //     const token = jwt.sign(
// //       { id: user._id, role: user.role },
// //       process.env.JWT_SECRET,
// //       { expiresIn: "7d" }
// //     );

// //     res.json({
// //       token,
// //       user: {
// //         id: user._id,
// //         full_name: user.full_name,
// //         email: user.email,
// //         role: user.role
// //       }
// //     });

// //   } catch (error) {
// //     console.error("Login Error:", error);
// //     res.status(500).json({
// //       message: "সার্ভারে সমস্যা হয়েছে।"
// //     });
// //   }
// // };



// // // ================= GOOGLE AUTH =================
// // export const googleAuth = async (req, res) => {
// //   try {

// //     const { name, email, photoURL } = req.body;

// //     if (!email) {
// //       return res.status(400).json({
// //         message: "Email is required"
// //       });
// //     }

// //     let user = await User.findOne({ email });

// //     // create user if not exist
// //     if (!user) {
// //       user = await User.create({
// //         full_name: name,
// //         email,
// //         photo: photoURL,
// //         role: "user",
// //         status: "active"
// //       });
// //     }

// //     const token = jwt.sign(
// //       { id: user._id, role: user.role },
// //       process.env.JWT_SECRET,
// //       { expiresIn: "7d" }
// //     );

// //     res.json({
// //       token,
// //       user
// //     });

// //   } catch (error) {
// //     console.error("Google Auth Error:", error);

// //     res.status(500).json({
// //       message: "Google authentication failed"
// //     });
// //   }
// // };


// // const User = require('../models/User');
// // const jwt = require('jsonwebtoken');

// // const generateToken = (user) => {
// //   return jwt.sign(
// //     { id: user._id, role: user.role }, 
// //     process.env.JWT_SECRET || 'fallback_secret', // Secret নিশ্চিত করুন
// //     { expiresIn: '7d' }
// //   );
// // };

// // // REGISTER
// // exports.register = async (req, res) => {
// //   try {
// //     const { full_name, email, password } = req.body;
// //     const cleanEmail = email.toLowerCase().trim();

// //     const existingUser = await User.findOne({ email: cleanEmail });
// //     if (existingUser) return res.status(400).json({ message: "ইমেইলটি ইতিমধ্যে ব্যবহৃত।" });
// //     const existingUser = await User.findOne({ email: cleanEmail });
// //     if (existingUser) return res.status(400).json({ message: "Email already exists" });

// //     const salt = await bcrypt.genSalt(10);
// //     const hashedPassword = await bcrypt.hash(password, salt);

// //     const user = new User({
// //       full_name,
// //       email: cleanEmail,
// //       password, // মডেলে হ্যাশ হবে
// //       role: cleanEmail === 'bisalsaha42@gmail.com' ? 'super_admin' : 'user'
// //     });

// //     await user.save();
// //     const token = generateToken(user);

// //     res.status(201).json({ token, user: { id: user._id, full_name, email: cleanEmail, role: user.role } });
// //   } catch (error) {
// //     res.status(500).json({ message: "রেজিস্ট্রেশনে সমস্যা হয়েছে।", error: error.message });
// //   }
// // };

// //       password: hashedPassword,
// //       role: cleanEmail === "bisalsaha42@gmail.com" ? "super_admin" : "user"
// //     });

// //     await user.save();
// //     const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
// //     res.status(201).json({ token, user });
// //   } catch (error) {
// //     res.status(500).json({ message: error.message });
// //   }
// // };

// // // LOGIN
// // exports.login = async (req, res) => {
// //   try {
// //     const { email, password } = req.body;
// //     const user = await User.findOne({ email: email.toLowerCase().trim() });

// //     if (!user || !(await user.comparePassword(password))) {
// //       return res.status(401).json({ message: "ভুল ইমেইল বা পাসওয়ার্ড।" });
// //     }

// //     const token = generateToken(user);
    
// //     // 🌟 এখানে email: user.email যোগ করা হয়েছে
// //     res.json({ 
// //       token, 
// //       user: { 
// //         id: user._id, 
// //         full_name: user.full_name, 
// //         email: user.email, // এই লাইনটি যোগ করুন
// //         role: user.role 
// //       } 
// //     });
// //   } catch (error) {
// //     res.status(500).json({ message: "লগইনে সমস্যা হয়েছে।" });
// //   }
// // };
// const User = require('../models/User');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');

// /**
//  * কমন টোকেন জেনারেটর ফাংশন
//  * এটি ভালো কারণ টোকেন লজিক এক জায়গায় থাকলে মেইনটেইন করা সহজ হয়।
//  */
// const generateToken = (user) => {
//   return jwt.sign(
//     { id: user._id, role: user.role }, 
//     process.env.JWT_SECRET || 'fallback_secret', 
//     { expiresIn: '7d' }
//   );
// };

// // --- REGISTER (নতুন ইউজার তৈরি) ---
// exports.register = async (req, res) => {
//   try {
//     const { full_name, email, password } = req.body;
//     const cleanEmail = email.toLowerCase().trim();

//     // ১. চেক করা ইমেইলটি আগে থেকে আছে কি না
//     const existingUser = await User.findOne({ email: cleanEmail });
//     if (existingUser) {
//         return res.status(400).json({ message: "ইমেইলটি ইতিমধ্যে ব্যবহৃত।" });
//     }

//     // ২. পাসওয়ার্ড হ্যাশিং (মডেলে সেভ করার আগে সিকিউরিটি)
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const user = new User({
//       full_name,
//       email: cleanEmail,
//       password: hashedPassword, 
//       role: cleanEmail === 'bisalsaha42@gmail.com' ? 'super_admin' : 'user'
//     });

//     await user.save();
//     const token = generateToken(user);

//     res.status(201).json({ 
//       token, 
//       user: { id: user._id, full_name: user.full_name, email: user.email, role: user.role } 
//     });
//   } catch (error) {
//     res.status(500).json({ message: "রেজিস্ট্রেশনে সমস্যা হয়েছে।", error: error.message });
//   }
// };

// // --- LOGIN (ইমেইল ও পাসওয়ার্ড দিয়ে লগইন) ---
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email: email.toLowerCase().trim() });

//     // ইউজার চেক এবং পাসওয়ার্ড ম্যাচিং (Model এর comparePassword মেথড ব্যবহার করে)
//     if (!user || !(await user.comparePassword(password))) {
//       return res.status(401).json({ message: "ভুল ইমেইল বা পাসওয়ার্ড।" });
//     }

//     const token = generateToken(user);
    
//     res.json({ 
//       token, 
//       user: { 
//         id: user._id, 
//         full_name: user.full_name, 
//         email: user.email, 
//         role: user.role 
//       } 
//     });
//   } catch (error) {
//     res.status(500).json({ message: "লগইনে সমস্যা হয়েছে।" });
//   }
// };

// // --- GOOGLE AUTH (গুগল দিয়ে লগইন বা অ্যাকাউন্ট তৈরি) ---
// exports.googleAuth = async (req, res) => {
//   try {
//     const { name, email } = req.body;
//     const cleanEmail = email.toLowerCase().trim();
    
//     let user = await User.findOne({ email: cleanEmail });

//     // ইউজার না থাকলে নতুন প্রোফাইল তৈরি (এটি ভালো কারণ ইউজারের সময় বাঁচে)
//     if (!user) {
//       user = await User.create({
//         full_name: name,
//         email: cleanEmail,
//         password: Math.random().toString(36).slice(-10), // র‍্যান্ডম পাসওয়ার্ড
//         role: cleanEmail === "bisalsaha42@gmail.com" ? "super_admin" : "user"
//       });
//     }

//     const token = generateToken(user);
    
//     res.json({ 
//       token, 
//       user: { 
//         id: user._id, 
//         full_name: user.full_name, 
//         email: user.email, 
//         role: user.role 
//       } 
//     });
//   } catch (error) {
//     console.error("Google Auth Error:", error);
//     res.status(500).json({ message: "গুগল অথেন্টিকেশন ব্যর্থ হয়েছে।" });
//   }
// };
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role }, 
    process.env.JWT_SECRET, 
    { expiresIn: '7d' }
  );
};

// --- LOGIN ---
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "ইমেইল এবং পাসওয়ার্ড প্রয়োজন।" });

    // ফিক্স: .select('+password') অবশ্যই দিতে হবে কারণ মডেলে password: { select: false } আছে
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Worng Email or Password" });
    }

    const token = generateToken(user);
    res.json({ 
      success: true,
      token, 
      user: { id: user._id, full_name: user.full_name, email: user.email, role: user.role } 
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Unable to login" });
  }
};

// --- REGISTER ---
exports.register = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
        return res.status(400).json({ message: "This Email already in use" });
    }

    // ২. পাসওয়ার্ড হ্যাশিং (মডেলে সেভ করার আগে সিকিউরিটি)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      full_name,
      email: cleanEmail,
      password, // মডেল অটোমেটিক হ্যাশ করবে
      role: cleanEmail === 'bisalsaha42@gmail.com' ? 'super_admin' : 'user'
    });

    await user.save();
    const token = generateToken(user);

    res.status(201).json({ 
      success: true,
      token, 
      user: { id: user._id, full_name: user.full_name, email: user.email, role: user.role } 
    });
  } catch (error) {
    res.status(500).json({ message: "রেজিস্ট্রেশনে সমস্যা হয়েছে।", error: error.message });
  }
};

// --- LOGIN (ইমেইল ও পাসওয়ার্ড দিয়ে লগইন) ---
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // ইউজার চেক এবং পাসওয়ার্ড ম্যাচিং (Model এর comparePassword মেথড ব্যবহার করে)
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "ভুল ইমেইল বা পাসওয়ার্ড।" });
    }

    const token = generateToken(user);
    
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        full_name: user.full_name, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (error) {
    res.status(500).json({ message: "লগইনে সমস্যা হয়েছে।" });
  }
};

// --- GOOGLE AUTH ---
exports.googleAuth = async (req, res) => {
  try {
    const { name, email, googleId, photoURL } = req.body;
    const cleanEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: cleanEmail });


    if (!user) {
      user = await User.create({
        full_name: name,
        email: cleanEmail,
        googleId,
        photoURL,
        password: Math.random().toString(36).slice(-10), 
        role: cleanEmail === "bisalsaha42@gmail.com" ? "super_admin" : "user"
      });
    }

    

// authController.js এর শেষে syncPassword ফাংশনটি ঠিক করুন
// --- Sync Password Function ---
exports.syncPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) return res.status(404).json({ message: "User not found" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;
    await user.save();

    const token = generateToken(user);
    res.status(200).json({
      token,
      user: { id: user._id, full_name: user.full_name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};































    const token = generateToken(user);
    res.json({ success: true, token, user: { id: user._id, full_name: user.full_name, email: user.email, role: user.role } });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ message: "গুগল অথেন্টিকেশন ব্যর্থ হয়েছে।" });
  }
};