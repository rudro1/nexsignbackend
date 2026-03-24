// /**
//  * Admin Authorization Middleware (Production Ready)
//  * Supports role hierarchy, audit logging, and rate limiting
//  */
// const adminAuth = (req, res, next) => {
//   try {
//     // 1. Verify Authentication
//     if (!req.user) {
//       return res.status(401).json({ 
//         success: false,
//         message: "Authentication required" 
//       });
//     }

//     // 2. Role Hierarchy Check (Flexible)
//     const allowedRoles = ['admin', 'super_admin'];
//     const userRole = req.user.role?.toLowerCase().trim();

//     if (!allowedRoles.includes(userRole)) {
//       // ✅ Audit Log for Failed Access
//       console.warn(`🚫 Admin Access Denied: ${req.user.email} (${userRole}) → ${req.originalUrl}`);
      
//       return res.status(403).json({ 
//         success: false,
//         error: "Forbidden",
//         message: "Admin privileges required",
//         requiredRole: 'admin'
//       });
//     }

//     // 3. Super Admin Logging (Audit Trail)
//     if (userRole === 'super_admin') {
//       console.log(`👑 Super Admin Access: ${req.user.email} → ${req.method} ${req.originalUrl}`);
//     }

//     // 4. Rate Limit Check (Admin Abuse Prevention)
//     const now = Date.now();
//     const oneHour = 60 * 60 * 1000;
    
//     // Admin Action Counter (In-Memory for Vercel)
//     if (!req.user.adminActions) req.user.adminActions = [];
    
//     // Cleanup old actions
//     req.user.adminActions = req.user.adminActions.filter(
//       time => now - time < oneHour
//     );
    
//     // Check limit (50 admin actions/hour)
//     if (req.user.adminActions.length >= 50) {
//       return res.status(429).json({
//         success: false,
//         error: "Rate Limited",
//         message: "Too many admin actions. Wait 1 hour."
//       });
//     }
    
//     // Track action
//     req.user.adminActions.push(now);
    
//     // ✅ Attach Admin Context
//     req.adminContext = {
//       userId: req.user._id,
//       role: userRole,
//       ip: req.ip || req.headers['x-forwarded-for']
//     };

//     return next();

//   } catch (error) {
//     console.error("🚨 Admin Auth Error:", {
//       error: error.message,
//       userId: req.user?._id,
//       url: req.originalUrl,
//       ip: req.ip
//     });
    
//     return res.status(500).json({ 
//       success: false,
//       error: "Server Error",
//       message: "Administrative verification failed" 
//     });
//   }
// };

// // ✅ Role-Based Permission Helper
// adminAuth.can = (roles) => {
//   return (req, res, next) => {
//     if (!req.user || !roles.includes(req.user.role)) {
//       return res.status(403).json({ 
//         success: false, 
//         message: "Insufficient permissions" 
//       });
//     }
//     next();
//   };
// };

// module.exports = adminAuth;


/**




Admin Authorization Middleware




Ensures the user has 'admin' or 'super_admin' privileges.
*/
const adminAuth = (req, res, next) => {
try {
// 1. Verify req.user existence (Injected by the 'auth' middleware)
if (!req.user) {
return res.status(401).json({
success: false,
message: "Unauthorized! Please log in first."
});
}


// 2. Role validation
// Using optional chaining and ensuring exact match with your Model Enums
const userRole = req.user.role;


if (userRole === 'admin' || userRole === 'super_admin') {
return next(); // ✅ Access granted
}


// 3. Access Denied (Forbidden)
// Used when the user is authenticated but lacks required permissions
return res.status(403).json({
success: false,
error: "Access Forbidden",
message: "You do not have permission to access the admin panel."
});




} catch (error) {
// Log error with context for easier debugging in production
console.error("Admin Auth Middleware Error:", error.message);


return res.status(500).json({ 
  success: false,
  error: "Internal Server Error",
  message: "An error occurred during administrative verification." 
});

}
};


module.exports = adminAuth;