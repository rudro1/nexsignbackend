// const User = require('../models/User');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs'); // পাসওয়ার্ড এনক্রিপশনের জন্য

// // ১. রেজিস্ট্রেশন লজিক
// // exports.register = async (req, res) => {
// //   try {
// //     const { full_name, email, password } = req.body;

// //     // ইউজার অলরেডি আছে কি না চেক করা
// //     let user = await User.findOne({ email });
// //     if (user) {
// //       return res.status(400).json({ message: "এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে।" });
// //     }

// //     // নতুন ইউজার তৈরি (আপনার User মডেলে যদি bcrypt প্রি-সেভ হুক না থাকে তবে এখানে হ্যাশ করতে হবে)
// //     user = new User({
// //       full_name,
// //       email,
// //       password // আপনার মডেলে পাসওয়ার্ড হ্যাশ করার লজিক থাকা উচিত
// //     });

// //     await user.save();

// //     // টোকেন জেনারেট করা
// //     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// //     res.status(201).json({
// //       message: "অ্যাকাউন্ট তৈরি সফল হয়েছে",
// //       token,
// //       user: {
// //         id: user._id,
// //         full_name: user.full_name,
// //         email: user.email
// //       }
// //     });
// //   } catch (error) {
// //     console.error(error);
// //     res.status(500).json({ message: "সার্ভারে সমস্যা হয়েছে।" });
// //   }
// // };

// exports.register = async (req, res) => {
//   try {
//     const { full_name, email, password } = req.body;

//     let user = await User.findOne({ email: email.toLowerCase() });
//     if (user) {
//       return res.status(400).json({ message: "এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে।" });
//     }

//     // ✅ ডাটাবেজে সেভ করার আগে পাসওয়ার্ড হ্যাশ করা জরুরি
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     user = new User({
//       full_name,
//       email: email.toLowerCase(),
//       password: hashedPassword // হ্যাশ করা পাসওয়ার্ড সেভ হচ্ছে
//     });

//     await user.save();

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

//     res.status(201).json({
//       message: "অ্যাকাউন্ট তৈরি সফল হয়েছে",
//       token,
//       user: { id: user._id, full_name: user.full_name, email: user.email }
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "সার্ভারে সমস্যা হয়েছে।" });
//   }
// };

// // ২. লগইন লজিক
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
    
//     // ইউজার খুঁজে বের করা
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: "সঠিক ইমেইল বা পাসওয়ার্ড দিন।" });
//     }

//     // পাসওয়ার্ড চেক করা (bcrypt.compare ব্যবহার করুন)
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "সঠিক ইমেইল বা পাসওয়ার্ড দিন।" });
//     }

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

//     res.json({ 
//       message: "লগইন সফল হয়েছে", 
//       token, 
//       user: {
//         id: user._id,
//         full_name: user.full_name,
//         email: user.email
//       } 
//     });
//   } catch (error) {
//     res.status(500).json({ message: "সার্ভারে সমস্যা হয়েছে।" });
//   }
// };
const User = require('../models/User'); // পাথ ঠিক আছে কি না নিশ্চিত করুন
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// ১. রেজিস্ট্রেশন (পাসওয়ার্ড হ্যাশ করে সেভ করবে)
exports.register = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;
    
    if (!full_name || !email || !password) {
      return res.status(400).json({ message: "সবগুলো তথ্য প্রদান করুন।" });
    }

    const cleanEmail = email.toLowerCase().trim();

    // ✅ চেক: ইমেইল আগে থেকেই আছে কি না
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: "এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে।" });
    }

    // পাসওয়ার্ড হ্যাশ করা
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ আপনার দেওয়া স্পেশাল ইমেইল চেক
    const isSuperAdmin = cleanEmail === 'bisalsaha42@gmail.com';

    const user = new User({
      full_name,
      email: cleanEmail,
      password: hashedPassword,
      role: isSuperAdmin ? 'super_admin' : 'user'
    });

    await user.save();

    // টোকেন জেনারেট (রোলসহ)
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: "অ্যাকাউন্ট তৈরি সফল হয়েছে",
      token,
      user: { 
        id: user._id, 
        full_name: user.full_name, 
        email: user.email,
        role: user.role 
      }
    });
  } catch (error) {
    console.error("Register Error Detail:", error); // টার্মিনালে আসল এরর দেখতে
    res.status(500).json({ message: "সার্ভারে সমস্যা হয়েছে।", error: error.message });
  }
};

// ২. লগইন (হ্যাশ করা পাসওয়ার্ড চেক করবে)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();
    
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(400).json({ message: "সঠিক ইমেইল বা পাসওয়ার্ড দিন।" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "সঠিক ইমেইল বা পাসওয়ার্ড দিন।" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

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
    console.error("Login Error Detail:", error);
    res.status(500).json({ message: "সার্ভারে সমস্যা হয়েছে।" });
  }
};