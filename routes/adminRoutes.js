// // // const express = require('express');
// // // const router = express.Router();
// // // const User = require('../models/User');
// // // const Document = require('../models/Document');
// // // const AuditLog = require('../models/AuditLog'); // ✅ নতুন মডেলটি ইম্পোর্ট করুন

// // // // ১. সব ইউজার গেট করা (ইমেইল এবং আইপি সহ)
// // // router.get('/users', async (req, res) => {
// // //   try {
// // //     // আপনি যদি ইউজার মডেলে lastIp সেভ করে থাকেন তবে সেটিও আসবে
// // //     const users = await User.find({}).select('-password').sort({ createdAt: -1 });
// // //     res.status(200).json(users);
// // //   } catch (error) {
// // //     res.status(500).json({ message: "ইউজার লিস্ট আনতে সমস্যা হয়েছে" });
// // //   }
// // // });

// // // // ২. সব ডকুমেন্ট গেট করা
// // // router.get('/documents', async (req, res) => {
// // //   try {
// // //     const documents = await Document.find({})
// // //       .populate('owner', 'full_name email')
// // //       .sort({ createdAt: -1 });
// // //     res.status(200).json(documents);
// // //   } catch (error) {
// // //     res.status(500).json({ message: "ডকুমেন্ট লিস্ট আনতে সমস্যা হয়েছে" });
// // //   }
// // // });

// // // // ✅ ৩. সব অডিট লগ গেট করা (অ্যাডমিন যেন আইপি এবং ইমেইল দেখতে পারে)
// // // router.get('/audit-logs', async (req, res) => {
// // //   try {
// // //     const logs = await AuditLog.find({})
// // //       .populate('document_id', 'title') // কোন ডকুমেন্টের ওপর একশন হয়েছে
// // //       .sort({ timestamp: -1 })
// // //       .limit(200); // শেষ ২০০টি রেকর্ড
// // //     res.status(200).json(logs);
// // //   } catch (error) {
// // //     res.status(500).json({ message: "অডিট লগ আনতে সমস্যা হয়েছে" });
// // //   }
// // // });

// // // // ৪. ইউজার ডিলিট করা
// // // router.delete('/users/:id', async (req, res) => {
// // //   try {
// // //     const userId = req.params.id;
// // //     const targetUser = await User.findById(userId);
    
// // //     if (targetUser && targetUser.role === 'super_admin') {
// // //       return res.status(403).json({ message: "সুপার অ্যাডমিনকে ডিলিট করা সম্ভব নয়!" });
// // //     }

// // //     await User.findByIdAndDelete(userId);
// // //     res.status(200).json({ message: "ইউজার সফলভাবে ডিলিট করা হয়েছে" });
// // //   } catch (error) {
// // //     res.status(500).json({ message: "ইউজার ডিলিট করতে সমস্যা হয়েছে" });
// // //   }
// // // });

// // // module.exports = router;
// // // const express = require('express');
// // // const router = express.Router();
// // // const User = require('../models/User');
// // // const Document = require('../models/Document');
// // // const AuditLog = require('../models/AuditLog');
// // // const auth = require('../middleware/auth');
// // // const adminAuth = require('../middleware/adminAuth');

// // // // ১. ইউজার লিস্ট
// // // router.get('/users', auth, adminAuth, async (req, res) => {
// // //   try {
// // //     const users = await User.find({}).select('-password').sort({ createdAt: -1 });
// // //     res.status(200).json(users);
// // //   } catch (error) {
// // //     res.status(500).json({ message: "ইউজার লিস্ট আনতে সমস্যা হয়েছে" });
// // //   }
// // // });

// // // // ২. ডকুমেন্ট লিস্ট (Populate Fix)
// // // router.get('/documents', auth, adminAuth, async (req, res) => {
// // //   try {
// // //     const documents = await Document.find({})
// // //       .populate({ path: 'owner', model: 'User', select: 'full_name email' })
// // //       .sort({ createdAt: -1 });
// // //     res.status(200).json(documents);
// // //   } catch (error) {
// // //     res.status(500).json({ message: "ডকুমেন্ট লিস্ট আনতে সমস্যা হয়েছে" });
// // //   }
// // // });

// // // // ৩. অডিট লগ (Populate Fix)
// // // router.get('/audit-logs', auth, adminAuth, async (req, res) => {
// // //   try {
// // //     const logs = await AuditLog.find({})
// // //       .populate({ path: 'document_id', model: 'Document', select: 'title' })
// // //       .sort({ timestamp: -1 })
// // //       .limit(200);
// // //     res.status(200).json(logs);
// // //   } catch (error) {
// // //     res.status(500).json({ message: "অডিট লগ আনতে সমস্যা হয়েছে" });
// // //   }
// // // });

// // // // ৪. ইউজার ডিলিট
// // // router.delete('/users/:id', auth, adminAuth, async (req, res) => {
// // //   try {
// // //     const userId = req.params.id;
// // //     const targetUser = await User.findById(userId);
    
// // //     if (targetUser && (targetUser.role === 'super_admin' || targetUser.role === 'admin')) {
// // //       return res.status(403).json({ message: "অ্যাডমিনকে ডিলিট করা সম্ভব নয়!" });
// // //     }

// // //     await User.findByIdAndDelete(userId);
// // //     res.status(200).json({ message: "ইউজার ডিলিট হয়েছে" });
// // //   } catch (error) {
// // //     res.status(500).json({ message: "ইউজার ডিলিট করতে সমস্যা হয়েছে" });
// // //   }
// // // });

// // // module.exports = router;
// // // const express = require('express');
// // // const router = express.Router();
// // // const User = require('../models/User');
// // // const Document = require('../models/Document');
// // // const AuditLog = require('../models/AuditLog');
// // // const auth = require('../middleware/auth');
// // // const adminAuth = require('../middleware/adminAuth');

// // // // ১. ইউজার লিস্ট (এটি মিসিং ছিল)
// // // router.get('/users', auth, adminAuth, async (req, res) => {
// // //   try {
// // //     const users = await User.find({})
// // //       .select('-password') // পাসওয়ার্ড বাদে সব আনবে
// // //       .sort({ createdAt: -1 })
// // //       .lean();
// // //     res.status(200).json(users || []);
// // //   } catch (error) {
// // //     res.status(500).json({ message: "ইউজার লিস্ট আনতে সমস্যা হয়েছে" });
// // //   }
// // // });

// // // // ২. ডকুমেন্ট লিস্ট
// // // router.get('/documents', auth, adminAuth, async (req, res) => {
// // //   try {
// // //     const documents = await Document.find({})
// // //       .populate({ path: 'owner', model: 'User', select: 'full_name email' })
// // //       .sort({ createdAt: -1 })
// // //       .limit(50) 
// // //       .lean();

// // //     const sanitizedDocs = documents.map(doc => ({
// // //       ...doc,
// // //       owner: doc.owner || { full_name: 'Unknown User', email: 'N/A' }
// // //     }));

// // //     res.status(200).json(sanitizedDocs);
// // //   } catch (error) {
// // //     res.status(500).json({ message: "ডকুমেন্ট লিস্ট আনতে সমস্যা হয়েছে" });
// // //   }
// // // });

// // // // ৩. অডিট লগ
// // // router.get('/audit-logs', auth, adminAuth, async (req, res) => {
// // //   try {
// // //     const page = parseInt(req.query.page) || 1;
// // //     const limit = 10;
// // //     const skip = (page - 1) * limit;

// // //     const logs = await AuditLog.find({})
// // //       .populate({ path: 'document_id', model: 'Document', select: 'title' })
// // //       .sort({ timestamp: -1 })
// // //       .skip(skip)
// // //       .limit(limit)
// // //       .lean();

// // //     const sanitizedLogs = logs.map(log => ({
// // //       ...log,
// // //       document_id: log.document_id || { title: 'Deleted Document' }
// // //     }));

// // //     res.status(200).json(sanitizedLogs);
// // //   } catch (error) {
// // //     res.status(500).json({ message: "অডিট লগ আনতে সমস্যা হয়েছে" });
// // //   }
// // // });
// // // // ইউজার ডিলিট করার রাউট
// // // router.delete('/users/:id', auth, adminAuth, async (req, res) => {
// // //   try {
// // //     await User.findByIdAndDelete(req.params.id);
// // //     res.status(200).json({ message: "User deleted" });
// // //   } catch (error) {
// // //     res.status(500).json({ message: "Error deleting user" });
// // //   }
// // // });

// // // // ডকুমেন্ট ডিলিট করার রাউট (এটি ডিলিট করলে ইউজারদের থেকেও ডিলিট হয়ে যাবে)
// // // router.delete('/documents/:id', auth, adminAuth, async (req, res) => {
// // //   try {
// // //     await Document.findByIdAndDelete(req.params.id);
// // //     res.status(200).json({ message: "Document deleted from system" });
// // //   } catch (error) {
// // //     res.status(500).json({ message: "Error deleting document" });
// // //   }
// // // });

// // // module.exports = router;


// // const express = require('express');
// // const router = express.Router();
// // const User = require('../models/User');
// // const Document = require('../models/Document');
// // const AuditLog = require('../models/AuditLog');
// // const auth = require('../middleware/auth');
// // const adminAuth = require('../middleware/adminAuth');

// // // ১. ইউজার লিস্ট আনা
// // router.get('/users', auth, adminAuth, async (req, res) => {
// //   try {
// //     const users = await User.find({})
// //       .select('-password') // সিকিউরিটির জন্য পাসওয়ার্ড বাদ
// //       .sort({ createdAt: -1 })
// //       .lean();
// //     res.status(200).json(users || []);
// //   } catch (error) {
// //     res.status(500).json({ message: "ইউজার লিস্ট আনতে সমস্যা হয়েছে" });
// //   }
// // });

// // // ২. সকল ডকুমেন্ট লিস্ট আনা
// // router.get('/documents', auth, adminAuth, async (req, res) => {
// //   try {
// //     const documents = await Document.find({})
// //       .populate({ path: 'owner', select: 'full_name email' })
// //       .sort({ createdAt: -1 })
// //       .limit(50) 
// //       .lean();

// //     // ডাটা ক্লিনআপ (যদি ওনার ডিলিট হয়ে গিয়ে থাকে)
// //     const sanitizedDocs = documents.map(doc => ({
// //       ...doc,
// //       owner: doc.owner || { full_name: 'Unknown User', email: 'N/A' }
// //     }));

// //     res.status(200).json(sanitizedDocs);
// //   } catch (error) {
// //     res.status(500).json({ message: "ডকুমেন্ট লিস্ট আনতে সমস্যা হয়েছে" });
// //   }
// // });

// // // ৩. অডিট লগ দেখা (প্যাজিনেশন সহ)
// // router.get('/audit-logs', auth, adminAuth, async (req, res) => {
// //   try {
// //     const page = parseInt(req.query.page) || 1;
// //     const limit = 20;
// //     const skip = (page - 1) * limit;

// //     const logs = await AuditLog.find({})
// //       .populate({ path: 'document_id', select: 'title' })
// //       .sort({ timestamp: -1 })
// //       .skip(skip)
// //       .limit(limit)
// //       .lean();

// //     const sanitizedLogs = logs.map(log => ({
// //       ...log,
// //       document_id: log.document_id || { title: 'Deleted Document' }
// //     }));

// //     res.status(200).json(sanitizedLogs);
// //   } catch (error) {
// //     res.status(500).json({ message: "অডিট লগ আনতে সমস্যা হয়েছে" });
// //   }
// // });

// // // ৪. ইউজার ডিলিট করা
// // router.delete('/users/:id', auth, adminAuth, async (req, res) => {
// //   try {
// //     const user = await User.findByIdAndDelete(req.params.id);
// //     if (!user) return res.status(404).json({ message: "ইউজার খুঁজে পাওয়া যায়নি" });
// //     res.status(200).json({ message: "ইউজার সফলভাবে ডিলিট করা হয়েছে" });
// //   } catch (error) {
// //     res.status(500).json({ message: "ইউজার ডিলিট করতে সমস্যা হয়েছে" });
// //   }
// // });

// // // ৫. সিস্টেম থেকে ডকুমেন্ট ডিলিট করা
// // router.delete('/documents/:id', auth, adminAuth, async (req, res) => {
// //   try {
// //     const doc = await Document.findByIdAndDelete(req.params.id);
// //     if (!doc) return res.status(404).json({ message: "ডকুমেন্ট খুঁজে পাওয়া যায়নি" });
// //     res.status(200).json({ message: "ডকুমেন্ট সফলভাবে ডিলিট করা হয়েছে" });
// //   } catch (error) {
// //     res.status(500).json({ message: "ডকুমেন্ট ডিলিট করতে সমস্যা হয়েছে" });
// //   }
// // });

// // module.exports = router;

// const express = require('express');
// const router = express.Router();
// const User = require('../models/User');
// const Document = require('../models/Document');
// const AuditLog = require('../models/AuditLog');
// const auth = require('../middleware/auth');
// const adminAuth = require('../middleware/adminAuth');

// // ১. ইউজার লিস্ট (Pagination যোগ করা হয়েছে)
// router.get('/users', auth, adminAuth, async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = 20;
//     const skip = (page - 1) * limit;

//     const users = await User.find({})
//       .select('-password') 
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .lean(); // 🌟 Lean কোয়েরি পারফরম্যান্স বাড়ায়

//     res.status(200).json(users || []);
//   } catch (error) {
//     res.status(500).json({ message: "ইউজার লিস্ট আনতে সমস্যা হয়েছে" });
//   }
// });

// // ২. সকল ডকুমেন্ট (Populate অপ্টিমাইজ করা হয়েছে)
// router.get('/documents', auth, adminAuth, async (req, res) => {
//   try {
//     const documents = await Document.find({})
//       .populate('owner', 'full_name email') // 🌟 সরাসরি ফিল্ড সিলেক্ট
//       .sort({ createdAt: -1 })
//       .limit(50) 
//       .lean();

//     const sanitizedDocs = documents.map(doc => ({
//       ...doc,
//       owner: doc.owner || { full_name: 'Unknown User', email: 'N/A' }
//     }));

//     res.status(200).json(sanitizedDocs);
//   } catch (error) {
//     res.status(500).json({ message: "ডকুমেন্ট লিস্ট আনতে সমস্যা হয়েছে" });
//   }
// });

// // ৩. অডিট লগ (Total Count সহ)
// router.get('/audit-logs', auth, adminAuth, async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = 20;
    
//     const [logs, total] = await Promise.all([
//       AuditLog.find({})
//         .populate('document_id', 'title')
//         .sort({ timestamp: -1 })
//         .skip((page - 1) * limit)
//         .limit(limit)
//         .lean(),
//       AuditLog.countDocuments() // 🌟 ফ্রন্টএন্ডে পেজ দেখানোর জন্য প্রয়োজন
//     ]);

//     const sanitizedLogs = logs.map(log => ({
//       ...log,
//       document_id: log.document_id || { title: 'Deleted Document' }
//     }));

//     res.status(200).json({ logs: sanitizedLogs, totalPages: Math.ceil(total / limit) });
//   } catch (error) {
//     res.status(500).json({ message: "অডিট লগ আনতে সমস্যা হয়েছে" });
//   }
// });

// // ৪. ইউজার ডিলিট (ডকুমেন্টসহ ডিলিট করার লজিক রাখা ভালো)
// router.delete('/users/:id', auth, adminAuth, async (req, res) => {
//   try {
//     const user = await User.findByIdAndDelete(req.params.id);
//     if (!user) return res.status(404).json({ message: "ইউজার খুঁজে পাওয়া যায়নি" });
//     res.status(200).json({ message: "ইউজার সফলভাবে ডিলিট করা হয়েছে" });
//   } catch (error) {
//     res.status(500).json({ message: "ইউজার ডিলিট করতে সমস্যা হয়েছে" });
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

/**
 * 1. User List (With Pagination & Scalability)
 */
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find({})
        .select('-password') 
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments()
    ]);

    res.status(200).json({ 
      success: true,
      users: users || [], 
      totalPages: Math.ceil(total / limit),
      totalUsers: total 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch user list." });
  }
});

/**
 * 2. All Documents (With Ownership Safety)
 */
router.get('/documents', auth, adminAuth, async (req, res) => {
  try {
    // For scalability, we limit this even if unpaginated to prevent server lag
    const documents = await Document.find({})
      .populate('owner', 'full_name email') 
      .sort({ createdAt: -1 })
      .limit(200) 
      .lean();

    const sanitizedDocs = documents.map(doc => ({
      ...doc,
      owner: doc.owner || { full_name: 'Deleted User', email: 'N/A' }
    }));

    res.status(200).json({ success: true, documents: sanitizedDocs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch document list." });
  }
});

/**
 * 3. Audit Logs (Paginated & Reliable Population)
 */
router.get('/audit-logs', auth, adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    
    const [logs, total] = await Promise.all([
      AuditLog.find({})
        .populate({
          path: 'document_id',
          select: 'title',
          model: 'Document' 
        })
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments()
    ]);

    const sanitizedLogs = logs.map(log => ({
      ...log,
      document_id: log.document_id || { title: 'Removed Document' }
    }));

    res.status(200).json({ 
      success: true,
      logs: sanitizedLogs, 
      totalPages: Math.ceil(total / limit),
      totalLogs: total
    });
  } catch (error) {
    console.error("Audit Log Fetch Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch audit trail." });
  }
});

/**
 * 4. Delete User (Includes Cleanup of Orphaned Documents)
 */
router.delete('/users/:id', auth, adminAuth, async (req, res) => {
  try {
    const userId = req.params.id;

    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Security: Prevent deletion of Super Admins via standard API
    if (userToDelete.role === 'super_admin') {
      return res.status(403).json({ success: false, message: "Super Admin accounts cannot be deleted." });
    }

    // Security: Prevent Admins from deleting themselves
    if (userId === req.user.id) {
      return res.status(400).json({ success: false, message: "You cannot delete your own account." });
    }

    // Data Integrity: Remove associated documents and the user profile
    await Promise.all([
      Document.deleteMany({ owner: userId }),
      User.findByIdAndDelete(userId)
    ]);

    res.status(200).json({ success: true, message: "User and associated data deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "An error occurred during deletion." });
  }
});

module.exports = router;