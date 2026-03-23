

// // const jwt = require('jsonwebtoken');

// // const auth = async (req, res, next) => {
// //   try {
// //     const authHeader = req.headers.authorization;
    
// //     // ১. টোকেন আছে কি না চেক করা
// //     if (!authHeader) {
// //       return res.status(401).json({ message: 'অথেন্টিকেশন টোকেন পাওয়া যায়নি।' });
// //     }

// //     const parts = authHeader.split(' ');
    
// //     // ২. ফরম্যাট চেক (Bearer <token>)
// //     if (parts.length !== 2) {
// //       return res.status(401).json({ message: 'টোকেন ফরম্যাট সঠিক নয়।' });
// //     }

// //     const [scheme, token] = parts;
    
// //     if (!/^Bearer$/i.test(scheme)) {
// //       return res.status(401).json({ message: 'ভুল টোকেন স্কিম ব্যবহার করা হয়েছে।' });
// //     }

// //     // ৩. টোকেন ভেরিফাই করা
// //     jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
// //       if (err) {
// //         // টোকেন এক্সপায়ার হলে আলাদা মেসেজ দেওয়া ভালো (ফ্রন্টএন্ডের সুবিধার জন্য)
// //         if (err.name === 'TokenExpiredError') {
// //           return res.status(401).json({ message: 'আপনার সেশনের মেয়াদ শেষ হয়ে গেছে। আবার লগইন করুন।' });
// //         }
// //         return res.status(401).json({ message: 'টোকেনটি ইনভ্যালিড।' });
// //       }

// //       // ৪. রিকোয়েস্ট অবজেক্টে ইউজার ডাটা সেট করা
// //       //decoded এ সাধারণত { id, email, role } থাকে যা আপনি সাইন করার সময় দিয়েছেন
// //       req.user = decoded;
// //       next();
// //     });

// //   } catch (err) {
// //     console.error("Auth Middleware Error:", err);
// //     return res.status(500).json({ message: 'সার্ভারে অভ্যন্তরীণ সমস্যা হয়েছে।' });
// //   }
// // };

// // module.exports = auth;


// const jwt = require('jsonwebtoken');

// const auth = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;
    
//     if (!authHeader) {
//       return res.status(401).json({ message: 'অথেন্টিকেশন টোকেন পাওয়া যায়নি।' });
//     }

//     const parts = authHeader.split(' ');
//     if (parts.length !== 2 || !/^Bearer$/i.test(parts[0])) {
//       return res.status(401).json({ message: 'টোকেন ফরম্যাট সঠিক নয়।' });
//     }

//     const token = parts[1];

//     // ফিক্স: কলব্যাকের বদলে সরাসরি ভেরিফাই করে ট্রাই-ক্যাচ ব্যবহার করা হয়েছে
//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       req.user = decoded;
//       next();
//     } catch (err) {
//       if (err.name === 'TokenExpiredError') {
//         return res.status(401).json({ message: 'আপনার সেশনের মেয়াদ শেষ হয়ে গেছে।' });
//       }
//       return res.status(401).json({ message: 'টোকেনটি ইনভ্যালিড।' });
//     }

//   } catch (err) {
//     console.error("Auth Middleware Error:", err);
//     return res.status(500).json({ message: 'সার্ভারে অভ্যন্তরীণ সমস্যা হয়েছে।' });
//   }
// };

// module.exports = auth;
const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // ১. টোকেন চেক (Early return pattern)
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'অথেন্টিকেশন টোকেন পাওয়া যায়নি বা ফরম্যাট ভুল।' 
      });
    }

    const token = authHeader.split(' ')[1];

    // ২. টোকেন ভেরিফিকেশন (Try-Catch Block)
    try {
      // টোকেন ডিকোড করা এবং রিকোয়েস্ট অবজেক্টে ইনজেক্ট করা
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // ডিকোড করা ডেটা (id, role) req.user এ সেট করা
      req.user = decoded;
      
      return next(); // পরবর্তী মিডলওয়্যার বা কন্ট্রোলারে পাঠানো
    } catch (err) {
      // স্পেসিফিক এরর হ্যান্ডলিং
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false,
          error: 'expired',
          message: 'আপনার সেশনের মেয়াদ শেষ হয়ে গেছে, পুনরায় লগইন করুন।' 
        });
      }
      
      return res.status(401).json({ 
        success: false,
        error: 'invalid',
        message: 'টোকেনটি ইনভ্যালিড বা টেম্পারড।' 
      });
    }

  } catch (err) {
    console.error("Critical Auth Error:", err.message);
    return res.status(500).json({ 
      success: false,
      message: 'সার্ভারে অভ্যন্তরীণ সমস্যা হয়েছে।' 
    });
  }
};

module.exports = auth;