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
    rateDelta:      1_000,
    rateLimit:      10,
  });

  // Verify once — non-blocking
  _transporter.verify()
    .then(()  => {
      if (process.env.NODE_ENV !== 'production')
        console.log('✅ Email transporter ready');
    })
    .catch(err => {
      console.error('❌ Email transporter error:', err.message);
      _transporter = null; // reset → next call retries
    });

  return _transporter;
}

// ════════════════════════════════════════════════════════════════
// INTERNAL HELPERS
// ════════════════════════════════════════════════════════════════

/** "From" field */
function fromField(companyName) {
  return `"${companyName || BRAND.name}" <${process.env.EMAIL_USER}>`;
}

/** Optional logo block */
function logoBlock(logoUrl, companyName) {
  if (!logoUrl) return '';
  return `
    <div style="text-align:center;margin-bottom:16px;">
      <img
        src="${logoUrl}"
        alt="${companyName || 'Logo'}"
        style="max-height:60px;max-width:180px;
               object-fit:contain;display:inline-block;"
      />
    </div>`;
}

/** Reusable document info card */
function docCard(documentTitle, extra = '') {
  return `
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
      ${extra}
    </div>`;
}

/** Parties summary table (name + email + designation + status) */
function partiesTable(parties = []) {
  if (!parties.length) return '';

  const rows = parties.map((p, i) => {
    const signed   = p.status === 'signed' || !!p.signedAt;
    const rowBg    = i % 2 === 0 ? '#ffffff' : '#f8fafc';
    const statusTd = signed
      ? `<span style="color:#16a34a;font-weight:700;">✅ Signed</span>`
      : `<span style="color:#d97706;font-weight:600;">⏳ Pending</span>`;

    return `
      <tr style="background:${rowBg};">
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;
                   font-size:13px;color:#1a202c;font-weight:600;">
          ${p.name || '—'}
          ${p.designation
            ? `<br/><span style="font-size:11px;color:#94a3b8;
                              font-weight:400;">${p.designation}</span>`
            : ''}
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;
                   font-size:12px;color:#64748b;">
          ${p.email || '—'}
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;
                   font-size:13px;">
          ${statusTd}
        </td>
      </tr>`;
  }).join('');

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="
      border-collapse:collapse;
      border:1px solid #e2e8f0;
      border-radius:10px;
      overflow:hidden;
      margin:16px 0;
      font-family:'Segoe UI',sans-serif;
    ">
      <thead>
        <tr style="background:#f1f5f9;">
          <th style="padding:10px 12px;text-align:left;font-size:11px;
                     color:#64748b;text-transform:uppercase;
                     letter-spacing:0.6px;">Name / Designation</th>
          <th style="padding:10px 12px;text-align:left;font-size:11px;
                     color:#64748b;text-transform:uppercase;
                     letter-spacing:0.6px;">Email</th>
          <th style="padding:10px 12px;text-align:left;font-size:11px;
                     color:#64748b;text-transform:uppercase;
                     letter-spacing:0.6px;">Status</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

/** Footer */
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
            Questions?
            <a href="mailto:${BRAND.support}"
               style="color:${BRAND.color};text-decoration:none;">
              ${BRAND.support}
            </a>
          </p>
        </td>
      </tr>
    </table>`;
}

/** Master HTML shell */
function buildEmail({ logoUrl, companyName, subject, bodyHtml }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <meta name="x-apple-disable-message-reformatting"/>
  <title>${subject}</title>
  <style>
    @media only screen and (max-width:600px){
      .email-body { padding:20px !important; }
      .email-card { border-radius:0 !important; }
      .btn-cta    { padding:12px 24px !important;font-size:14px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#e9f0f7;
             -webkit-text-size-adjust:100%;font-family:'Segoe UI',sans-serif;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
    style="background:#e9f0f7;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" class="email-card" width="100%"
          style="
            max-width:600px;
            background:#ffffff;
            border-radius:18px;
            overflow:hidden;
            box-shadow:0 6px 30px rgba(0,0,0,0.09);
          ">

          <!-- HEADER -->
          <tr>
            <td style="
              background:linear-gradient(
                135deg,${BRAND.color} 0%,${BRAND.colorDark} 100%
              );
              padding:28px 36px;
              text-align:center;
            ">
              ${logoBlock(logoUrl, companyName)}
              <h1 style="
                color:#ffffff;margin:0;
                font-size:22px;font-weight:700;
                letter-spacing:0.4px;
              ">
                ${companyName || BRAND.name}
              </h1>
              <p style="
                color:rgba(255,255,255,0.78);
                margin:5px 0 0;font-size:12px;
              ">
                ${BRAND.tagline}
              </p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td class="email-body"
              style="
                padding:36px;
                font-size:15px;
                color:#374151;
                line-height:1.7;
              ">
              ${bodyHtml}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td>${poweredByFooter(companyName)}</td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

// ════════════════════════════════════════════════════════════════
// INTERNAL: send with retry
// ════════════════════════════════════════════════════════════════
async function sendMail(mailOptions, retries = 2) {
  const transport = getTransporter();
  let lastErr;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const info = await transport.sendMail(mailOptions);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`📧 Sent → ${mailOptions.to} [${info.messageId}]`);
      }
      return info;
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 1_500 * (attempt + 1)));
      }
    }
  }
  throw lastErr;
}

// ════════════════════════════════════════════════════════════════
// 1. SIGNING INVITATION
// ════════════════════════════════════════════════════════════════
/**
 * @param {string}  recipientEmail
 * @param {string}  recipientName
 * @param {string}  senderName
 * @param {string}  documentTitle
 * @param {string}  signingLink        — unique token link
 * @param {string}  [companyLogoUrl]
 * @param {string}  [companyName]
 * @param {number}  [partyNumber]      — 1-based index
 * @param {number}  [totalParties]
 * @param {string}  [message]          — sender's custom message
 * @param {string}  [designation]      — signer's designation
 */
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
  message      = '',
  designation  = '',
}) {
  const subject = `Action Required: Sign "${documentTitle}"`;

  const partyBadge = totalParties > 1
    ? `<p style="margin:6px 0 0;font-size:12px;color:#64748b;">
         🔢 You are Signer <strong>${partyNumber}</strong>
         of <strong>${totalParties}</strong>
       </p>`
    : '';

  const designationBadge = designation
    ? `<p style="margin:4px 0 0;font-size:12px;color:#64748b;">
         🏷️ Signing as: <strong>${designation}</strong>
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
      has requested your electronic signature on:
    </p>

    ${docCard(documentTitle, partyBadge + designationBadge)}
    ${messageBanner}

    <!-- CTA -->
    <div style="text-align:center;margin:28px 0;">
      <a href="${signingLink}" class="btn-cta"
        style="
          display:inline-block;
          background:linear-gradient(
            135deg,${BRAND.color} 0%,${BRAND.colorDark} 100%
          );
          color:#ffffff;text-decoration:none;
          padding:15px 44px;border-radius:50px;
          font-weight:700;font-size:15px;
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
      🔒 This link is <strong>unique to you</strong>.
      Do not forward or share it.<br/>
      Not expecting this? You may safely ignore it.
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
// 2. COMPLETION EMAIL
//    ✅ Sends signed PDF as attachment (Buffer or URL fallback)
//    ✅ Includes all parties with designation
//    ✅ Used for both signers AND CC recipients
// ════════════════════════════════════════════════════════════════
/**
 * @param {string}        recipientEmail
 * @param {string}        recipientName
 * @param {string}        documentTitle
 * @param {Buffer|null}   pdfBuffer        — final signed PDF bytes
 * @param {string}        [signedPdfUrl]   — fallback download URL
 * @param {string}        [companyLogoUrl]
 * @param {string}        [companyName]
 * @param {Array}         [auditParties]   — [{name, email, designation, status, signedAt}]
 * @param {boolean}       [isCC]           — true if recipient is a CC
 * @param {string}        [recipientDesignation]
 */
async function sendCompletionEmail({
  recipientEmail,
  recipientName,
  documentTitle,
  pdfBuffer,               // ✅ attach as PDF
  signedPdfUrl = '',       // ✅ fallback download link
  companyLogoUrl,
  companyName,
  auditParties  = [],
  isCC          = false,
  recipientDesignation = '',
}) {
  const subject = `✅ Completed: "${documentTitle}"`;

  const roleNote = isCC
    ? `<p style="margin:0 0 16px;color:#64748b;font-size:13px;">
         You are receiving this as a <strong>CC recipient</strong>.
       </p>`
    : '';

  const designationNote = recipientDesignation
    ? `<p style="margin:0 0 16px;color:#64748b;font-size:13px;">
         Your role: <strong>${recipientDesignation}</strong>
       </p>`
    : '';

  const downloadBtn = signedPdfUrl
    ? `<div style="text-align:center;margin:20px 0 8px;">
         <a href="${signedPdfUrl}" class="btn-cta"
           style="
             display:inline-block;
             background:linear-gradient(135deg,#16a34a 0%,#15803d 100%);
             color:#ffffff;text-decoration:none;
             padding:13px 36px;border-radius:50px;
             font-weight:700;font-size:14px;
             box-shadow:0 4px 18px rgba(22,163,74,0.28);
           "
         >
           ⬇️ &nbsp;Download Signed Document
         </a>
       </div>`
    : '';

  const bodyHtml = `
    <!-- Success banner -->
    <div style="
      background:linear-gradient(135deg,#f0fdf4,#dcfce7);
      border:1px solid #86efac;
      border-radius:14px;
      padding:24px;
      margin-bottom:22px;
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

    <p style="color:#4a5568;font-size:14px;margin:0 0 10px;">
      Hello <strong>${recipientName || 'there'}</strong>,
    </p>

    ${roleNote}
    ${designationNote}

    <p style="color:#4a5568;font-size:14px;margin:0 0 16px;">
      The signed document is attached to this email as a PDF.
      ${signedPdfUrl ? 'You can also download it using the button below.' : ''}
    </p>

    ${partiesTable(auditParties)}
    ${downloadBtn}

    <p style="font-size:11px;color:#94a3b8;text-align:center;margin:16px 0 0;">
      This document is legally binding and has been securely stored.<br/>
      The attached PDF includes a full audit trail certificate.
    </p>`;

  // ── Build attachments ────────────────────────────────────────
  const attachments = [];
  if (pdfBuffer && pdfBuffer.length > 0) {
    // ✅ Attach the final signed PDF (with audit log page embedded)
    attachments.push({
      filename:    `${documentTitle.replace(/[^a-z0-9_\-\s]/gi, '_')}_signed.pdf`,
      content:     pdfBuffer,       // Buffer
      contentType: 'application/pdf',
    });
  }

  return sendMail({
    from:        fromField(companyName),
    to:          recipientEmail,
    subject,
    html:        buildEmail({
      logoUrl:     companyLogoUrl,
      companyName: companyName || BRAND.name,
      subject,
      bodyHtml,
    }),
    attachments, // ✅ PDF attached
  });
}

// ════════════════════════════════════════════════════════════════
// 3. CC NOTIFICATION (sent at document dispatch time)
// ════════════════════════════════════════════════════════════════
/**
 * @param {string}  recipientEmail
 * @param {string}  recipientName
 * @param {string}  [recipientDesignation]
 * @param {string}  documentTitle
 * @param {string}  senderName
 * @param {string}  [companyLogoUrl]
 * @param {string}  [companyName]
 */
async function sendCCEmail({
  recipientEmail,
  recipientName,
  recipientDesignation = '',
  documentTitle,
  senderName,
  companyLogoUrl,
  companyName,
}) {
  const subject = `FYI: You've been CC'd on "${documentTitle}"`;

  const designationNote = recipientDesignation
    ? `<p style="margin:6px 0 0;font-size:12px;color:#64748b;">
         🏷️ Your role: <strong>${recipientDesignation}</strong>
       </p>`
    : '';

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
      ${designationNote}
    </div>

    <div style="
      background:#f0fdf4;
      border:1px solid #bbf7d0;
      border-radius:10px;
      padding:14px 18px;
      font-size:13px;
      color:#166534;
    ">
      ℹ️ You will receive the <strong>final signed PDF</strong>
      (with audit certificate) once all parties complete their signatures.<br/>
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
// 4. DOCUMENT DECLINED  ✅ New
// ════════════════════════════════════════════════════════════════
/**
 * @param {string}  ownerEmail
 * @param {string}  ownerName
 * @param {string}  documentTitle
 * @param {string}  declinerName
 * @param {string}  declinerEmail
 * @param {string}  [reason]
 * @param {string}  [companyLogoUrl]
 * @param {string}  [companyName]
 */
async function sendDeclinedEmail({
  ownerEmail,
  ownerName,
  documentTitle,
  declinerName,
  declinerEmail,
  reason       = '',
  companyLogoUrl,
  companyName,
}) {
  const subject = `⚠️ Declined: "${documentTitle}"`;

  const reasonBlock = reason
    ? `<div style="
          background:#fff7ed;
          border:1px solid #fed7aa;
          border-radius:10px;
          padding:14px 18px;
          margin:14px 0;
          font-size:13px;
          color:#9a3412;
        ">
         <strong>Reason provided:</strong><br/>${reason}
       </div>`
    : '';

  const bodyHtml = `
    <div style="
      background:linear-gradient(135deg,#fff1f2,#ffe4e6);
      border:1px solid #fecaca;
      border-radius:14px;
      padding:24px;
      margin-bottom:22px;
      text-align:center;
    ">
      <div style="font-size:40px;margin:0 0 8px;">⚠️</div>
      <h2 style="color:#dc2626;margin:0 0 6px;font-size:20px;">
        Signature Declined
      </h2>
      <p style="color:#4a5568;margin:0;font-size:14px;">
        A signer has declined to sign <strong>${documentTitle}</strong>
      </p>
    </div>

    <p style="color:#4a5568;font-size:14px;margin:0 0 16px;">
      Hello <strong>${ownerName || 'there'}</strong>,
    </p>

    <div style="
      background:#f8fafc;
      border-left:4px solid #dc2626;
      border-radius:10px;
      padding:16px 20px;
      margin:0 0 16px;
    ">
      <p style="margin:0;font-size:14px;color:#1a202c;">
        <strong>${declinerName || declinerEmail}</strong>
        <span style="font-size:12px;color:#64748b;">
          (${declinerEmail})
        </span>
        has declined to sign this document.
      </p>
    </div>

    ${reasonBlock}

    <p style="color:#4a5568;font-size:13px;margin:0;">
      The signing process has been paused. Please log in to
      <a href="${BRAND.website}"
         style="color:${BRAND.color};text-decoration:none;font-weight:600;">
        ${BRAND.name}
      </a>
      to review or cancel this document.
    </p>`;

  return sendMail({
    from:    fromField(companyName),
    to:      ownerEmail,
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
// 5. FEEDBACK THANK-YOU
// ════════════════════════════════════════════════════════════════
async function sendFeedbackEmail(userEmail, userName, stars) {
  const starCount = Math.min(Math.max(Number(stars) || 0, 0), 5);
  const starBar   = '⭐'.repeat(starCount);
  const subject   = `Thank you for your feedback! ${starBar}`;

  const bodyHtml = `
    <h2 style="color:#1a202c;margin:0 0 14px;font-size:20px;">
      Hello ${userName || 'Valued User'}, 😊
    </h2>

    <p style="color:#4a5568;margin:0 0 16px;">
      Thank you for taking the time to rate us!
    </p>

    <div style="
      background:#fefce8;
      border:1px solid #fde68a;
      border-radius:12px;
      padding:20px;
      text-align:center;
      margin:0 0 20px;
    ">
      <div style="font-size:28px;letter-spacing:4px;">${starBar}</div>
      <p style="
        margin:8px 0 0;
        font-size:18px;font-weight:700;color:#92400e;
      ">
        ${starCount}-Star Rating
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
        digital agreements. Every star motivates our team."
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
  sendCompletionEmail,  // ✅ now attaches PDF buffer
  sendCCEmail,
  sendDeclinedEmail,    // ✅ new
  sendFeedbackEmail,
};