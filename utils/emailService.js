const nodemailer = require('nodemailer');

// ট্রান্সপোর্টারকে ফাংশনের বাইরে রাখা ভালো যাতে কানেকশন বারবার তৈরি না হয়
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendFeedbackEmail = async (userEmail, userName, stars) => {
  const mailOptions = {
    from: `"NeXsign" <${process.env.EMAIL_USER}>`, 
    to: userEmail,
    subject: 'Thank you for your feedback! 🌟',
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 500px;">
        <h2 style="color: #0ea5e9;">Hi ${userName || 'User'},</h2>
        <p>Thank you so much for giving us a <strong>${stars} star</strong> rating!</p>
        <p>Your feedback helps us make <strong>NeXsign</strong> better every day.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p>Best Regards,<br/><strong>Team NeXsign</strong></p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendFeedbackEmail };