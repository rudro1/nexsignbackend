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

const nodemailer = require('nodemailer');

// ── Singleton transporter ────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
});

// ── Brand constants ──────────────────────────────────────────────
const BRAND = {
  color:   '#28ABDF',
  name:    'NeXsign',
  tagline: 'Secure. Simple. Professional.',
  year:    new Date().getFullYear(),
  website: 'https://nexsignfrontend.vercel.app',
};

// ── Helpers ──────────────────────────────────────────────────────
function logoBlock(logoUrl, companyName) {
  if (!logoUrl) return '';
  return `
    <div style="text-align:center;margin-bottom:16px;">
      <img src="${logoUrl}" alt="${companyName || 'Company'}"
        style="max-height:64px;max-width:200px;object-fit:contain;"/>
    </div>`;
}

function poweredByFooter(companyName) {
  const sender = companyName
    ? `<strong>${companyName}</strong>`
    : 'This organisation';
  return `
    <div style="
      background:#f1f5f9;padding:20px 32px;text-align:center;
      font-family:'Segoe UI',sans-serif;border-top:1px solid #e2e8f0;">
      <p style="margin:0 0 6px;font-size:12px;color:#475569;">
        ${sender} uses
        <strong style="color:${BRAND.color};">${BRAND.name}</strong>
        to send and manage secure digital contracts.
      </p>
      <p style="margin:0;font-size:11px;color:#94a3b8;">
        Powered by
        <strong style="color:${BRAND.color};">${BRAND.name}</strong>
        &nbsp;·&nbsp;${BRAND.tagline}
        &nbsp;·&nbsp;© ${BRAND.year}
      </p>
    </div>`;
}

// ── Master email wrapper ─────────────────────────────────────────
function buildEmail({ logoUrl, companyName, subject, bodyHtml }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#e9f0f7;">
  <table width="100%" cellpadding="0" cellspacing="0"
    style="background:#e9f0f7;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%"
        style="max-width:600px;background:#fff;border-radius:16px;
               overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="
            background:linear-gradient(135deg,${BRAND.color} 0%,#1e7fb5 100%);
            padding:28px 36px;text-align:center;">
            ${logoBlock(logoUrl, companyName)}
            <h1 style="
              color:#fff;margin:0;font-size:22px;font-weight:700;
              font-family:'Segoe UI',sans-serif;letter-spacing:0.5px;">
              ${companyName || BRAND.name}
            </h1>
            <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;
                      font-size:12px;font-family:'Segoe UI',sans-serif;">
              ${BRAND.tagline}
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
            ${bodyHtml}
          </td>
        </tr>

        <!-- Footer -->
        <tr><td>${poweredByFooter(companyName)}</td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ════════════════════════════════════════════════════════════════
// PUBLIC FUNCTIONS
// ════════════════════════════════════════════════════════════════

// ── 1. Signing invitation ────────────────────────────────────────
async function sendSigningEmail({
  recipientEmail, recipientName, senderName,
  documentTitle, signingLink,
  companyLogoUrl, companyName,
  partyNumber, totalParties, message = '',
}) {
  const subject = `Action Required: Sign "${documentTitle}"`;
  const bodyHtml = `
    <h2 style="color:#1a202c;margin-top:0;">Hello ${recipientName || 'there'},</h2>
    <p style="color:#4a5568;line-height:1.7;font-size:15px;">
      <strong>${senderName || companyName || 'Someone'}</strong>
      has requested your electronic signature on:
    </p>
    <div style="background:#f8fafc;border-left:4px solid ${BRAND.color};
         border-radius:8px;padding:16px 20px;margin:16px 0;">
      <p style="margin:0;font-size:16px;font-weight:700;color:#1a202c;">
        📄 ${documentTitle}
      </p>
      ${totalParties > 1 ? `
      <p style="margin:6px 0 0;font-size:12px;color:#64748b;">
        You are Signer ${partyNumber} of ${totalParties}
      </p>` : ''}
    </div>
    ${message ? `
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;
         padding:12px 16px;margin:12px 0;font-size:13px;color:#92400e;">
      <strong>Message:</strong> ${message}
    </div>` : ''}
    <div style="text-align:center;margin:28px 0;">
      <a href="${signingLink}" style="
        display:inline-block;
        background:linear-gradient(135deg,${BRAND.color} 0%,#1e7fb5 100%);
        color:#fff;text-decoration:none;padding:14px 40px;
        border-radius:50px;font-weight:700;font-size:15px;
        box-shadow:0 4px 15px rgba(40,171,223,0.4);">
        ✍️ Review &amp; Sign Document
      </a>
    </div>
    <p style="color:#94a3b8;font-size:11px;text-align:center;line-height:1.6;">
      This link is unique to you. Do not share it.<br/>
      If you did not expect this, you may ignore this email.
    </p>`;

  return transporter.sendMail({
    from:    `"${companyName || BRAND.name}" <${process.env.EMAIL_USER}>`,
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

// ── 2. Completion email ──────────────────────────────────────────
async function sendCompletionEmail({
  recipientEmail, recipientName,
  documentTitle, signedPdfUrl,
  companyLogoUrl, companyName,
  auditParties = [],
}) {
  const subject = `✅ Completed: "${documentTitle}"`;

  const partiesHtml = auditParties.map(p => `
    <tr>
      <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;
                 font-size:13px;color:#1a202c;">${p.name}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;
                 font-size:13px;color:#64748b;">${p.email}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;
                 font-size:13px;color:#16a34a;">✅ Signed</td>
    </tr>`).join('');

  const bodyHtml = `
    <div style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);
         border:1px solid #86efac;border-radius:12px;
         padding:20px;margin-bottom:24px;text-align:center;">
      <p style="font-size:36px;margin:0;">🎉</p>
      <h2 style="color:#16a34a;margin:8px 0 4px;">Document Completed!</h2>
      <p style="color:#4a5568;margin:0;font-size:14px;">
        All parties have signed <strong>${documentTitle}</strong>
      </p>
    </div>
    <p style="color:#4a5568;font-size:14px;line-height:1.7;">
      Hello <strong>${recipientName || 'there'}</strong>,
      your document has been fully executed.
    </p>
    ${auditParties.length > 0 ? `
    <table width="100%" style="border-collapse:collapse;
           border-radius:8px;overflow:hidden;
           border:1px solid #e2e8f0;margin:16px 0;">
      <thead>
        <tr style="background:#f8fafc;">
          <th style="padding:10px;text-align:left;font-size:11px;
                     color:#64748b;text-transform:uppercase;">Name</th>
          <th style="padding:10px;text-align:left;font-size:11px;
                     color:#64748b;text-transform:uppercase;">Email</th>
          <th style="padding:10px;text-align:left;font-size:11px;
                     color:#64748b;text-transform:uppercase;">Status</th>
        </tr>
      </thead>
      <tbody>${partiesHtml}</tbody>
    </table>` : ''}
    <div style="text-align:center;margin:24px 0;">
      <a href="${signedPdfUrl || '#'}" style="
        display:inline-block;background:linear-gradient(135deg,#16a34a,#15803d);
        color:#fff;text-decoration:none;padding:13px 32px;
        border-radius:50px;font-weight:700;font-size:14px;">
        ⬇️ Download Signed Document
      </a>
    </div>`;

  return transporter.sendMail({
    from:    `"${companyName || BRAND.name}" <${process.env.EMAIL_USER}>`,
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

// ── 3. CC notification ───────────────────────────────────────────
async function sendCCEmail({
  recipientEmail, recipientName,
  documentTitle, senderName,
  companyLogoUrl, companyName,
}) {
  const subject = `FYI: You've been CC'd on "${documentTitle}"`;
  const bodyHtml = `
    <h2 style="color:#1a202c;margin-top:0;">Hello ${recipientName || 'there'},</h2>
    <p style="color:#4a5568;line-height:1.7;font-size:14px;">
      You have been added as a <strong>CC recipient</strong> on:
    </p>
    <div style="background:#f8fafc;border-left:4px solid #8b5cf6;
         border-radius:8px;padding:16px 20px;margin:16px 0;">
      <p style="margin:0;font-size:15px;font-weight:700;color:#1a202c;">
        📄 ${documentTitle}
      </p>
      <p style="margin:6px 0 0;font-size:12px;color:#64748b;">
        Sent by ${senderName || companyName || 'Document Owner'}
      </p>
    </div>
    <p style="color:#4a5568;font-size:13px;line-height:1.7;">
      You will receive the final signed copy once all parties have completed
      their signatures. <strong>No action is required from you.</strong>
    </p>`;

  return transporter.sendMail({
    from:    `"${companyName || BRAND.name}" <${process.env.EMAIL_USER}>`,
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

// ── 4. Feedback email ────────────────────────────────────────────
async function sendFeedbackEmail(userEmail, userName, stars) {
  const subject = 'Thank you for your feedback! 🌟';
  const bodyHtml = `
    <h2 style="color:#1a202c;margin-top:0;">
      Hello ${userName || 'Valued User'},
    </h2>
    <p style="color:#4a5568;line-height:1.7;font-size:15px;">
      Thank you for your <strong>${stars}-star rating!</strong>
    </p>
    <p style="color:#4a5568;line-height:1.7;font-size:14px;">
      Your feedback helps us make <strong>${BRAND.name}</strong>
      better every day.
    </p>
    <div style="margin:20px 0;padding:16px 20px;background:#f8fafc;
         border-radius:12px;border-left:4px solid ${BRAND.color};">
      <p style="margin:0;font-style:italic;color:#64748b;font-size:14px;">
        "Your support motivates us to build a better future
        for digital agreements."
      </p>
    </div>
    <p style="color:#4a5568;font-size:14px;">
      Keep signing with confidence!<br/><br/>
      <strong>Best regards,</strong><br/>
      <span style="color:${BRAND.color};font-weight:600;">
        Team ${BRAND.name}
      </span>
    </p>`;

  return transporter.sendMail({
    from:    `"${BRAND.name} Support" <${process.env.EMAIL_USER}>`,
    to:      userEmail,
    subject,
    html:    buildEmail({ subject, bodyHtml }),
  });
}

module.exports = {
  sendSigningEmail,
  sendCompletionEmail,
  sendCCEmail,
  sendFeedbackEmail,
};