// const express = require('express');
// const router = express.Router();
// const User = require('../models/User');
// const Document = require('../models/Document');
// const AuditLog = require('../models/AuditLog'); // ✅ নতুন মডেলটি ইম্পোর্ট করুন

// // ১. সব ইউজার গেট করা (ইমেইল এবং আইপি সহ)
// router.get('/users', async (req, res) => {
//   try {
//     // আপনি যদি ইউজার মডেলে lastIp সেভ করে থাকেন তবে সেটিও আসবে
//     const users = await User.find({}).select('-password').sort({ createdAt: -1 });
//     res.status(200).json(users);
//   } catch (error) {
//     res.status(500).json({ message: "ইউজার লিস্ট আনতে সমস্যা হয়েছে" });
//   }
// });

// // ২. সব ডকুমেন্ট গেট করা
// router.get('/documents', async (req, res) => {
//   try {
//     const documents = await Document.find({})
//       .populate('owner', 'full_name email')
//       .sort({ createdAt: -1 });
//     res.status(200).json(documents);
//   } catch (error) {
//     res.status(500).json({ message: "ডকুমেন্ট লিস্ট আনতে সমস্যা হয়েছে" });
//   }
// });

// // ✅ ৩. সব অডিট লগ গেট করা (অ্যাডমিন যেন আইপি এবং ইমেইল দেখতে পারে)
// router.get('/audit-logs', async (req, res) => {
//   try {
//     const logs = await AuditLog.find({})
//       .populate('document_id', 'title') // কোন ডকুমেন্টের ওপর একশন হয়েছে
//       .sort({ timestamp: -1 })
//       .limit(200); // শেষ ২০০টি রেকর্ড
//     res.status(200).json(logs);
//   } catch (error) {
//     res.status(500).json({ message: "অডিট লগ আনতে সমস্যা হয়েছে" });
//   }
// });

// // ৪. ইউজার ডিলিট করা
// router.delete('/users/:id', async (req, res) => {
//   try {
//     const userId = req.params.id;
//     const targetUser = await User.findById(userId);
    
//     if (targetUser && targetUser.role === 'super_admin') {
//       return res.status(403).json({ message: "সুপার অ্যাডমিনকে ডিলিট করা সম্ভব নয়!" });
//     }

//     await User.findByIdAndDelete(userId);
//     res.status(200).json({ message: "ইউজার সফলভাবে ডিলিট করা হয়েছে" });
//   } catch (error) {
//     res.status(500).json({ message: "ইউজার ডিলিট করতে সমস্যা হয়েছে" });
//   }
// });

// module.exports = router;
// const express = require('express');
// const router = express.Router();
// const User = require('../models/User');
// const Document = require('../models/Document');
// const AuditLog = require('../models/AuditLog');
// const auth = require('../middleware/auth');
// const adminAuth = require('../middleware/adminAuth');

// // ১. ইউজার লিস্ট
// router.get('/users', auth, adminAuth, async (req, res) => {
//   try {
//     const users = await User.find({}).select('-password').sort({ createdAt: -1 });
//     res.status(200).json(users);
//   } catch (error) {
//     res.status(500).json({ message: "ইউজার লিস্ট আনতে সমস্যা হয়েছে" });
//   }
// });

// // ২. ডকুমেন্ট লিস্ট (Populate Fix)
// router.get('/documents', auth, adminAuth, async (req, res) => {
//   try {
//     const documents = await Document.find({})
//       .populate({ path: 'owner', model: 'User', select: 'full_name email' })
//       .sort({ createdAt: -1 });
//     res.status(200).json(documents);
//   } catch (error) {
//     res.status(500).json({ message: "ডকুমেন্ট লিস্ট আনতে সমস্যা হয়েছে" });
//   }
// });

// // ৩. অডিট লগ (Populate Fix)
// router.get('/audit-logs', auth, adminAuth, async (req, res) => {
//   try {
//     const logs = await AuditLog.find({})
//       .populate({ path: 'document_id', model: 'Document', select: 'title' })
//       .sort({ timestamp: -1 })
//       .limit(200);
//     res.status(200).json(logs);
//   } catch (error) {
//     res.status(500).json({ message: "অডিট লগ আনতে সমস্যা হয়েছে" });
//   }
// });

// // ৪. ইউজার ডিলিট
// router.delete('/users/:id', auth, adminAuth, async (req, res) => {
//   try {
//     const userId = req.params.id;
//     const targetUser = await User.findById(userId);
    
//     if (targetUser && (targetUser.role === 'super_admin' || targetUser.role === 'admin')) {
//       return res.status(403).json({ message: "অ্যাডমিনকে ডিলিট করা সম্ভব নয়!" });
//     }

//     await User.findByIdAndDelete(userId);
//     res.status(200).json({ message: "ইউজার ডিলিট হয়েছে" });
//   } catch (error) {
//     res.status(500).json({ message: "ইউজার ডিলিট করতে সমস্যা হয়েছে" });
//   }
// });

// module.exports = router;
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Document = require('../models/Document');
const AuditLog = require('../models/AuditLog');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// ১. ইউজার লিস্ট (এটি মিসিং ছিল)
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password') // পাসওয়ার্ড বাদে সব আনবে
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json(users || []);
  } catch (error) {
    res.status(500).json({ message: "ইউজার লিস্ট আনতে সমস্যা হয়েছে" });
  }
});

// ২. ডকুমেন্ট লিস্ট
router.get('/documents', auth, adminAuth, async (req, res) => {
  try {
    const documents = await Document.find({})
      .populate({ path: 'owner', model: 'User', select: 'full_name email' })
      .sort({ createdAt: -1 })
      .limit(50) 
      .lean();

    const sanitizedDocs = documents.map(doc => ({
      ...doc,
      owner: doc.owner || { full_name: 'Unknown User', email: 'N/A' }
    }));

    res.status(200).json(sanitizedDocs);
  } catch (error) {
    res.status(500).json({ message: "ডকুমেন্ট লিস্ট আনতে সমস্যা হয়েছে" });
  }
});

// ৩. অডিট লগ
router.get('/audit-logs', auth, adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const logs = await AuditLog.find({})
      .populate({ path: 'document_id', model: 'Document', select: 'title' })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const sanitizedLogs = logs.map(log => ({
      ...log,
      document_id: log.document_id || { title: 'Deleted Document' }
    }));

    res.status(200).json(sanitizedLogs);
  } catch (error) {
    res.status(500).json({ message: "অডিট লগ আনতে সমস্যা হয়েছে" });
  }
});

module.exports = router;