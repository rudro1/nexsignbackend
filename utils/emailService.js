// const nodemailer = require('nodemailer');

// // ট্রান্সপোর্টারকে ফাংশনের বাইরে রাখা ভালো যাতে কানেকশন বারবার তৈরি না হয়
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   host: 'smtp.gmail.com',
//   port: 465,
//   secure: true, 
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// });

// // const sendFeedbackEmail = async (userEmail, userName, stars) => {
// //   const mailOptions = {
// //     from: `"NeXsign" <${process.env.EMAIL_USER}>`, 
// //     to: userEmail,
// //     subject: 'Thank you for your feedback! 🌟',
// //     html: `
// //       <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 500px;">
// //         <h2 style="color: #0ea5e9;">Hi ${userName || 'User'},</h2>
// //         <p>Thank you so much for giving us a <strong>${stars} star</strong> rating!</p>
// //         <p>Your feedback helps us make <strong>NeXsign</strong> better every day.</p>
// //         <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
// //         <p>Best Regards,<br/><strong>Team NeXsign</strong></p>
// //       </div>
// //     `
// //   };

// //   return transporter.sendMail(mailOptions);
// // };

// const sendFeedbackEmail = async (userEmail, userName, stars) => {
//   const brandColor = "#28ABDF"; 
//   return transporter.sendMail({
//     from: `"NeXsign Support" <${process.env.EMAIL_USER}>`,
//     to: userEmail,
//     subject: 'We value your feedback! 🌟',
//     html: `
//       <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
//         <div style="background-color: ${brandColor}; padding: 30px; text-align: center;">
//           <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: 1px;">NeXsign</h1>
//         </div>
//         <div style="padding: 40px; background-color: #ffffff;">
//           <h2 style="color: #1a202c; font-size: 22px; margin-top: 0;">Hello ${userName || 'Valued User'},</h2>
//           <p style="color: #4a5568; line-height: 1.6; font-size: 16px;">
//             Thank you so much for your incredible <strong>${stars}-star rating!</strong> 
//           </p>
//           <p style="color: #4a5568; line-height: 1.6; font-size: 16px;">
//             At <strong>NeXsign</strong>, our mission is to provide the most secure and seamless signing experience. Your feedback is a vital part of our journey to excellence.
//           </p>
//           <div style="margin: 30px 0; padding: 20px; background-color: #f8fafc; border-radius: 12px; border-left: 4px solid ${brandColor};">
//             <p style="margin: 0; font-style: italic; color: #64748b;">"Your support motivates our team to innovate and build a better future for digital agreements."</p>
//           </div>
//           <p style="color: #4a5568; font-size: 16px;">Keep signing with confidence!</p>
//           <br>
//           <p style="margin: 0; color: #1a202c; font-weight: bold;">Best Regards,</p>
//           <p style="margin: 5px 0 0 0; color: ${brandColor}; font-weight: 600;">Team NeXsign</p>
//         </div>
//         <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
//           © 2026 NeXsign Inc. | Secure. Simple. Professional.
//         </div>
//       </div>
//     `
//   });
// };
// module.exports = { sendFeedbackEmail };
'use strict';

const nodemailer = require('nodemailer');

// ════════════════════════════════════════════════════════════════
// BRAND CONFIG
// ════════════════════════════════════════════════════════════════
const BRAND = Object.freeze({
  color:      '#28ABDF',
  colorDark:  '#1e7fb5',
  colorLight: '#e0f4fc',
  name:       'NeXsign',
  tagline:    'Secure. Simple. Professional.',
  year:       new Date().getFullYear(),
  website:    'https://nexsignfrontend.vercel.app',
  support:    'support@nexsign.app',
});

// ════════════════════════════════════════════════════════════════
// TRANSPORTER — singleton, pooled SMTP
// ════════════════════════════════════════════════════════════════
let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;

  _transporter = nodemailer.createTransport({
    service:        'gmail',
    host:           'smtp.gmail.com',
    port:           465,
    secure:         true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    pool:           true,
    maxConnections: 5,
    maxMessages:    100,
    rateDelta:      1000,
    rateLimit:      10,
  });

  // Verify on first creation (non-blocking)
  _transporter.verify().then(() => {
    console.log('✅ Email transporter ready');
  }).catch(err => {
    console.error('❌ Email transporter error:', err.message);
    _transporter = null; // reset so next call retries
  });

  return _transporter;
}

// ════════════════════════════════════════════════════════════════
// INTERNAL HELPERS
// ════════════════════════════════════════════════════════════════

/** Sender "From" field */
function fromField(companyName) {
  const name = companyName || BRAND.name;
  return `"${name}" <${process.env.EMAIL_USER}>`;
}

/** Optional company logo block */
function logoBlock(logoUrl, companyName) {
  if (!logoUrl) return '';
  return `
    <div style="text-align:center;margin-bottom:18px;">
      <img
        src="${logoUrl}"
        alt="${companyName || 'Company Logo'}"
        style="max-height:64px;max-width:200px;object-fit:contain;
               display:inline-block;"
      />
    </div>`;
}

/** Footer "Powered by NeXsign" */
function poweredByFooter(companyName) {
  const sender = companyName
    ? `<strong>${companyName}</strong>`
    : 'This organisation';

  return `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="
          background:#f1f5f9;
          padding:20px 36px;
          text-align:center;
          border-top:1px solid #e2e8f0;
          font-family:'Segoe UI',sans-serif;
        ">
          <p style="margin:0 0 6px;font-size:12px;color:#475569;">
            ${sender} uses
            <strong style="color:${BRAND.color};">${BRAND.name}</strong>
            to send and manage secure digital contracts.
          </p>
          <p style="margin:0 0 4px;font-size:11px;color:#94a3b8;">
            Powered by
            <strong style="color:${BRAND.color};">${BRAND.name}</strong>
            &nbsp;·&nbsp;${BRAND.tagline}
            &nbsp;·&nbsp;&copy; ${BRAND.year}
          </p>
          <p style="margin:0;font-size:10px;color:#cbd5e1;">
            Questions? Contact us at
            <a href="mailto:${BRAND.support}"
               style="color:${BRAND.color};text-decoration:none;">
              ${BRAND.support}
            </a>
          </p>
        </td>
      </tr>
    </table>`;
}

/** Master HTML email shell */
function buildEmail({ logoUrl, companyName, subject, bodyHtml }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${subject}</title>
  <style>
    @media only screen and (max-width:600px){
      .email-body { padding:20px !important; }
      .email-card { border-radius:0 !important; }
      .btn-cta    { padding:12px 24px !important; font-size:14px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#e9f0f7;-webkit-text-size-adjust:100%;">

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
    style="background:#e9f0f7;padding:32px 16px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table role="presentation" class="email-card" width="100%"
          style="
            max-width:600px;
            background:#ffffff;
            border-radius:18px;
            overflow:hidden;
            box-shadow:0 6px 30px rgba(0,0,0,0.09);
          ">

          <!-- ── HEADER ── -->
          <tr>
            <td style="
              background:linear-gradient(
                135deg,${BRAND.color} 0%,${BRAND.colorDark} 100%
              );
              padding:30px 36px;
              text-align:center;
            ">
              ${logoBlock(logoUrl, companyName)}
              <h1 style="
                color:#ffffff;margin:0;
                font-size:22px;font-weight:700;
                font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;
                letter-spacing:0.4px;
              ">
                ${companyName || BRAND.name}
              </h1>
              <p style="
                color:rgba(255,255,255,0.78);
                margin:5px 0 0;font-size:12px;
                font-family:'Segoe UI',sans-serif;
              ">
                ${BRAND.tagline}
              </p>
            </td>
          </tr>

          <!-- ── BODY ── -->
          <tr>
            <td class="email-body" style="
              padding:36px;
              font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;
              font-size:15px;
              color:#374151;
              line-height:1.7;
            ">
              ${bodyHtml}
            </td>
          </tr>

          <!-- ── FOOTER ── -->
          <tr>
            <td>${poweredByFooter(companyName)}</td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>
  <!-- /Outer wrapper -->

</body>
</html>`;
}

// ════════════════════════════════════════════════════════════════
// INTERNAL: send with retry
// ════════════════════════════════════════════════════════════════
async function sendMail(mailOptions, retries = 2) {
  const transport = getTransporter();
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const info = await transport.sendMail(mailOptions);
      console.log(`📧 Email sent → ${mailOptions.to} [${info.messageId}]`);
      return info;
    } catch (err) {
      if (attempt === retries) throw err;
      console.warn(
        `Email retry ${attempt + 1}/${retries} → ${mailOptions.to}:`,
        err.message,
      );
      await new Promise(r => setTimeout(r, 1500 * (attempt + 1)));
    }
  }
}

// ════════════════════════════════════════════════════════════════
// 1. SIGNING INVITATION
// ════════════════════════════════════════════════════════════════
async function sendSigningEmail({
  recipientEmail,
  recipientName,
  senderName,
  documentTitle,
  signingLink,
  companyLogoUrl,
  companyName,
  partyNumber,
  totalParties,
  message = '',
}) {
  const subject  = `Action Required: Sign "${documentTitle}"`;

  const partyBadge = totalParties > 1
    ? `<p style="margin:6px 0 0;font-size:12px;color:#64748b;">
         🔢 You are Signer <strong>${partyNumber}</strong>
         of <strong>${totalParties}</strong>
       </p>`
    : '';

  const messageBanner = message
    ? `<div style="
          background:#fffbeb;
          border:1px solid #fde68a;
          border-radius:10px;
          padding:14px 18px;
          margin:14px 0;
          font-size:13px;
          color:#92400e;
        ">
         <strong>📝 Message from sender:</strong><br/>
         ${message}
       </div>`
    : '';

  const bodyHtml = `
    <h2 style="color:#1a202c;margin:0 0 14px;font-size:20px;">
      Hello ${recipientName || 'there'}, 👋
    </h2>

    <p style="margin:0 0 16px;color:#4a5568;">
      <strong>${senderName || companyName || 'Someone'}</strong>
      has requested your electronic signature on the following document:
    </p>

    <!-- Document card -->
    <div style="
      background:#f8fafc;
      border-left:4px solid ${BRAND.color};
      border-radius:10px;
      padding:16px 20px;
      margin:0 0 16px;
    ">
      <p style="margin:0;font-size:17px;font-weight:700;color:#1a202c;">
        📄 ${documentTitle}
      </p>
      ${partyBadge}
    </div>

    ${messageBanner}

    <!-- CTA Button -->
    <div style="text-align:center;margin:28px 0;">
      <a
        href="${signingLink}"
        class="btn-cta"
        style="
          display:inline-block;
          background:linear-gradient(
            135deg,${BRAND.color} 0%,${BRAND.colorDark} 100%
          );
          color:#ffffff;
          text-decoration:none;
          padding:15px 44px;
          border-radius:50px;
          font-weight:700;
          font-size:15px;
          letter-spacing:0.3px;
          box-shadow:0 4px 18px rgba(40,171,223,0.38);
        "
      >
        ✍️ &nbsp;Review &amp; Sign Document
      </a>
    </div>

    <!-- Security note -->
    <div style="
      background:#f0f9ff;
      border:1px solid #bae6fd;
      border-radius:8px;
      padding:12px 16px;
      text-align:center;
      font-size:11px;
      color:#0369a1;
    ">
      🔒 This link is <strong>unique to you</strong>. Do not share it.<br/>
      If you were not expecting this email, you may safely ignore it.
    </div>`;

  return sendMail({
    from:    fromField(companyName),
    to:      recipientEmail,
    subject,
    html:    buildEmail({
      logoUrl:     companyLogoUrl,
      companyName: companyName || BRAND.name,
      subject,
      bodyHtml,
    }),
  });
}

// ════════════════════════════════════════════════════════════════
// 2. COMPLETION EMAIL  (with download link)
// ════════════════════════════════════════════════════════════════
async function sendCompletionEmail({
  recipientEmail,
  recipientName,
  documentTitle,
  signedPdfUrl,
  companyLogoUrl,
  companyName,
  auditParties = [],
}) {
  const subject = `✅ Completed: "${documentTitle}"`;

  const partiesRows = auditParties.map((p, i) => `
    <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f8fafc'};">
      <td style="
        padding:10px 12px;
        border-bottom:1px solid #e2e8f0;
        font-size:13px;color:#1a202c;font-weight:600;
      ">${p.name || '—'}</td>
      <td style="
        padding:10px 12px;
        border-bottom:1px solid #e2e8f0;
        font-size:13px;color:#64748b;
      ">${p.email || '—'}</td>
      <td style="
        padding:10px 12px;
        border-bottom:1px solid #e2e8f0;
        font-size:13px;color:#16a34a;font-weight:600;
      ">✅ Signed</td>
    </tr>`).join('');

  const partiesTable = auditParties.length > 0
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="
          border-collapse:collapse;
          border:1px solid #e2e8f0;
          border-radius:10px;
          overflow:hidden;
          margin:16px 0;
        ">
         <thead>
           <tr style="background:#f1f5f9;">
             <th style="padding:10px 12px;text-align:left;font-size:11px;
                        color:#64748b;text-transform:uppercase;
                        letter-spacing:0.6px;">Name</th>
             <th style="padding:10px 12px;text-align:left;font-size:11px;
                        color:#64748b;text-transform:uppercase;
                        letter-spacing:0.6px;">Email</th>
             <th style="padding:10px 12px;text-align:left;font-size:11px;
                        color:#64748b;text-transform:uppercase;
                        letter-spacing:0.6px;">Status</th>
           </tr>
         </thead>
         <tbody>${partiesRows}</tbody>
       </table>`
    : '';

  const bodyHtml = `
    <!-- Success banner -->
    <div style="
      background:linear-gradient(135deg,#f0fdf4,#dcfce7);
      border:1px solid #86efac;
      border-radius:14px;
      padding:24px;
      margin-bottom:24px;
      text-align:center;
    ">
      <div style="font-size:40px;margin:0 0 8px;">🎉</div>
      <h2 style="color:#16a34a;margin:0 0 6px;font-size:20px;">
        Document Fully Executed!
      </h2>
      <p style="color:#4a5568;margin:0;font-size:14px;">
        All parties have signed
        <strong>${documentTitle}</strong>
      </p>
    </div>

    <p style="color:#4a5568;font-size:14px;margin:0 0 16px;">
      Hello <strong>${recipientName || 'there'}</strong>,<br/>
      your document has been fully executed and is ready to download.
    </p>

    ${partiesTable}

    <!-- Download CTA -->
    <div style="text-align:center;margin:28px 0;">
      <a
        href="${signedPdfUrl || BRAND.website}"
        class="btn-cta"
        style="
          display:inline-block;
          background:linear-gradient(135deg,#16a34a 0%,#15803d 100%);
          color:#ffffff;text-decoration:none;
          padding:15px 40px;border-radius:50px;
          font-weight:700;font-size:15px;
          box-shadow:0 4px 18px rgba(22,163,74,0.32);
          letter-spacing:0.3px;
        "
      >
        ⬇️ &nbsp;Download Signed Document
      </a>
    </div>

    <p style="
      font-size:11px;color:#94a3b8;
      text-align:center;margin:0;
    ">
      This document is legally binding and has been securely stored.
    </p>`;

  return sendMail({
    from:    fromField(companyName),
    to:      recipientEmail,
    subject,
    html:    buildEmail({
      logoUrl:     companyLogoUrl,
      companyName: companyName || BRAND.name,
      subject,
      bodyHtml,
    }),
  });
}

// ════════════════════════════════════════════════════════════════
// 3. CC NOTIFICATION
// ════════════════════════════════════════════════════════════════
async function sendCCEmail({
  recipientEmail,
  recipientName,
  documentTitle,
  senderName,
  companyLogoUrl,
  companyName,
}) {
  const subject  = `FYI: You've been CC'd on "${documentTitle}"`;

  const bodyHtml = `
    <h2 style="color:#1a202c;margin:0 0 14px;font-size:20px;">
      Hello ${recipientName || 'there'}, 👋
    </h2>

    <p style="color:#4a5568;margin:0 0 16px;">
      You have been added as a <strong>CC recipient</strong>
      on the following document:
    </p>

    <div style="
      background:#faf5ff;
      border-left:4px solid #8b5cf6;
      border-radius:10px;
      padding:16px 20px;
      margin:0 0 16px;
    ">
      <p style="margin:0;font-size:16px;font-weight:700;color:#1a202c;">
        📄 ${documentTitle}
      </p>
      <p style="margin:6px 0 0;font-size:12px;color:#64748b;">
        Sent by <strong>${senderName || companyName || 'Document Owner'}</strong>
      </p>
    </div>

    <div style="
      background:#f0fdf4;
      border:1px solid #bbf7d0;
      border-radius:10px;
      padding:14px 18px;
      font-size:13px;
      color:#166534;
    ">
      ℹ️ You will receive the final signed copy once all parties have
      completed their signatures.<br/>
      <strong>No action is required from you at this time.</strong>
    </div>`;

  return sendMail({
    from:    fromField(companyName),
    to:      recipientEmail,
    subject,
    html:    buildEmail({
      logoUrl:     companyLogoUrl,
      companyName: companyName || BRAND.name,
      subject,
      bodyHtml,
    }),
  });
}

// ════════════════════════════════════════════════════════════════
// 4. FEEDBACK THANK-YOU
// ════════════════════════════════════════════════════════════════
async function sendFeedbackEmail(userEmail, userName, stars) {
  const subject  = `Thank you for your feedback! ${'⭐'.repeat(Math.min(stars, 5))}`;
  const starBar  = '⭐'.repeat(Math.min(Number(stars) || 0, 5));

  const bodyHtml = `
    <h2 style="color:#1a202c;margin:0 0 14px;font-size:20px;">
      Hello ${userName || 'Valued User'}, 😊
    </h2>

    <p style="color:#4a5568;margin:0 0 16px;">
      Thank you for taking the time to rate us!
    </p>

    <!-- Star rating display -->
    <div style="
      background:#fefce8;
      border:1px solid #fde68a;
      border-radius:12px;
      padding:20px;
      text-align:center;
      margin:0 0 20px;
    ">
      <div style="font-size:28px;letter-spacing:4px;">
        ${starBar}
      </div>
      <p style="
        margin:8px 0 0;
        font-size:18px;font-weight:700;color:#92400e;
      ">
        ${stars}-Star Rating
      </p>
    </div>

    <div style="
      background:#f8fafc;
      border-left:4px solid ${BRAND.color};
      border-radius:10px;
      padding:16px 20px;
      margin:0 0 20px;
    ">
      <p style="
        margin:0;font-style:italic;
        color:#475569;font-size:14px;line-height:1.7;
      ">
        "Your feedback drives us to build a better future for
        digital agreements. Every star motivates our team
        to keep improving."
      </p>
    </div>

    <p style="color:#4a5568;font-size:14px;margin:0;">
      Keep signing with confidence! 🚀<br/><br/>
      <strong>Warm regards,</strong><br/>
      <span style="color:${BRAND.color};font-weight:700;">
        The ${BRAND.name} Team
      </span>
    </p>`;

  return sendMail({
    from:    fromField(BRAND.name),
    to:      userEmail,
    subject,
    html:    buildEmail({
      companyName: BRAND.name,
      subject,
      bodyHtml,
    }),
  });
}

// ════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════
module.exports = {
  sendSigningEmail,
  sendCompletionEmail,
  sendCCEmail,
  sendFeedbackEmail,
};