

const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // ১. টোকেন আছে কি না চেক করা
    if (!authHeader) {
      return res.status(401).json({ message: 'অথেন্টিকেশন টোকেন পাওয়া যায়নি।' });
    }

    const parts = authHeader.split(' ');
    
    // ২. ফরম্যাট চেক (Bearer <token>)
    if (parts.length !== 2) {
      return res.status(401).json({ message: 'টোকেন ফরম্যাট সঠিক নয়।' });
    }

    const [scheme, token] = parts;
    
    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({ message: 'ভুল টোকেন স্কিম ব্যবহার করা হয়েছে।' });
    }

    // ৩. টোকেন ভেরিফাই করা
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        // টোকেন এক্সপায়ার হলে আলাদা মেসেজ দেওয়া ভালো (ফ্রন্টএন্ডের সুবিধার জন্য)
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ message: 'আপনার সেশনের মেয়াদ শেষ হয়ে গেছে। আবার লগইন করুন।' });
        }
        return res.status(401).json({ message: 'টোকেনটি ইনভ্যালিড।' });
      }

      // ৪. রিকোয়েস্ট অবজেক্টে ইউজার ডাটা সেট করা
      //decoded এ সাধারণত { id, email, role } থাকে যা আপনি সাইন করার সময় দিয়েছেন
      req.user = decoded;
      next();
    });

  } catch (err) {
    console.error("Auth Middleware Error:", err);
    return res.status(500).json({ message: 'সার্ভারে অভ্যন্তরীণ সমস্যা হয়েছে।' });
  }
};

module.exports = auth;