/**
 * Admin Authorization Middleware
 * Ensures the user has 'admin' or 'super_admin' privileges.
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