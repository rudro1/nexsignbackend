const adminAuth = (req, res, next) => {
  try {
    // ১. req.user অবজেক্টটি নিশ্চিত করা (এটি আপনার 'auth' মিডলওয়্যার থেকে আসবে)
    if (!req.user) {
      return res.status(401).json({ message: "অপ্রমাণিত ইউজার! দয়া করে আগে লগইন করুন।" });
    }

    // ২. রোল চেক করা (এখানে 'admin' এবং 'super_admin' উভয়কেই অনুমতি দিতে হবে)
    const userRole = req.user.role?.toLowerCase();
    
    if (userRole === 'admin' || userRole === 'super_admin') {
      return next(); // ✅ অনুমতি দেওয়া হলো
    }

    // ৩. এক্সেস ডিনাইড করা
    return res.status(403).json({ 
      error: "Access Forbidden", 
      message: "আপনার এই অ্যাডমিন প্যানেলে প্রবেশের অনুমতি নেই।" 
    });
  } catch (error) {
    console.error("Admin Auth Error:", error);
    res.status(500).json({ error: "সার্ভারে সমস্যা হয়েছে (Admin Middleware)" });
  }
};

module.exports = adminAuth;