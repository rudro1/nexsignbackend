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

// const sendFeedbackEmail = async (userEmail, userName, stars) => {
//   const mailOptions = {
//     from: `"NeXsign" <${process.env.EMAIL_USER}>`, 
//     to: userEmail,
//     subject: 'Thank you for your feedback! 🌟',
//     html: `
//       <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 500px;">
//         <h2 style="color: #0ea5e9;">Hi ${userName || 'User'},</h2>
//         <p>Thank you so much for giving us a <strong>${stars} star</strong> rating!</p>
//         <p>Your feedback helps us make <strong>NeXsign</strong> better every day.</p>
//         <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
//         <p>Best Regards,<br/><strong>Team NeXsign</strong></p>
//       </div>
//     `
//   };

//   return transporter.sendMail(mailOptions);
// };

const sendFeedbackEmail = async (userEmail, userName, stars) => {
  const brandColor = "#28ABDF"; 
  return transporter.sendMail({
    from: `"NeXsign Support" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: 'We value your feedback! 🌟',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <div style="background-color: ${brandColor}; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: 1px;">NeXsign</h1>
        </div>
        <div style="padding: 40px; background-color: #ffffff;">
          <h2 style="color: #1a202c; font-size: 22px; margin-top: 0;">Hello ${userName || 'Valued User'},</h2>
          <p style="color: #4a5568; line-height: 1.6; font-size: 16px;">
            Thank you so much for your incredible <strong>${stars}-star rating!</strong> 
          </p>
          <p style="color: #4a5568; line-height: 1.6; font-size: 16px;">
            At <strong>NeXsign</strong>, our mission is to provide the most secure and seamless signing experience. Your feedback is a vital part of our journey to excellence.
          </p>
          <div style="margin: 30px 0; padding: 20px; background-color: #f8fafc; border-radius: 12px; border-left: 4px solid ${brandColor};">
            <p style="margin: 0; font-style: italic; color: #64748b;">"Your support motivates our team to innovate and build a better future for digital agreements."</p>
          </div>
          <p style="color: #4a5568; font-size: 16px;">Keep signing with confidence!</p>
          <br>
          <p style="margin: 0; color: #1a202c; font-weight: bold;">Best Regards,</p>
          <p style="margin: 5px 0 0 0; color: ${brandColor}; font-weight: 600;">Team NeXsign</p>
        </div>
        <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
          © 2026 NeXsign Inc. | Secure. Simple. Professional.
        </div>
      </div>
    `
  });
};
module.exports = { sendFeedbackEmail };