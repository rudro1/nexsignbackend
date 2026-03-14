const express = require('express');
const router = express.Router();
const { sendFeedbackEmail } = require('../utils/emailService');

router.post('/send-feedback', async (req, res) => {
  const { email, name, stars } = req.body;

  try {
    await sendFeedbackEmail(email, name, stars);
    res.status(200).json({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

module.exports = router;