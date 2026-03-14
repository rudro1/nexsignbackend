const nodemailer = require('nodemailer');

const sendFeedbackEmail = async (userEmail, userName, stars) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // আপনার জিমেইল
      pass: process.env.EMAIL_PASS  // জিমেইল অ্যাপ পাসওয়ার্ড
    }
  });

  const mailOptions = {
    from: '"NexSign" <noreply@nexsign.com>',
    to: userEmail,
    subject: 'Thank you for your feedback! 🌟',
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
        <h2>Hi ${userName || 'Friend'},</h2>
        <p>Thank you so much for giving us a <strong>${stars} star</strong> rating!</p>
        <p>Your feedback helps us make <strong>NexSign</strong> better every day.</p>
        <p style="color: #28ABDF; font-weight: bold;">Join with us to experience more amazing features!</p>
        <br/>
        <p>Best Regards,<br/><strong>Team NexSign</strong></p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendFeedbackEmail };