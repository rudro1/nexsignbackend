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
  website:    process.env.FRONTEND_URL || 'https://nexsignfrontend.vercel.app',
  support:    'support@nexsign.app',
});

// ✅ Validation — backend must know where frontend is
const FRONT = () => (process.env.FRONTEND_URL || 'https://nexsignfrontend.vercel.app').replace(/\/$/, '');

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

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ EMAIL_USER or EMAIL_PASS not set in environment!');
    throw new Error('Email service misconfigured');
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const info = await transport.sendMail(mailOptions);
      console.log(`📧 Sent → ${mailOptions.to} [${info.messageId}]`);
      return info;
    } catch (err) {
      lastErr = err;
      console.error(`📧 Attempt ${attempt + 1} failed for ${mailOptions.to}:`, err.message);
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
  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #334155; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #f8fafc; padding: 32px 40px; border-bottom: 1px solid #e2e8f0; text-align: center;">
        ${companyLogoUrl 
          ? `<img src="${companyLogoUrl}" alt="${companyName || 'Logo'}" style="max-height: 48px; width: auto; margin-bottom: 16px; display: block; margin-left: auto; margin-right: auto;">`
          : `<div style="font-size: 24px; font-weight: bold; color: #28ABDF; margin-bottom: 8px;">NeXsign</div>`
        }
        <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #1e293b;">Signature Request</h1>
      </div>
      
      <div style="padding: 40px;">
        <p style="margin-top: 0;">Hello <strong>${recipientName}</strong>,</p>
        <p><strong>${senderName}</strong> ${companyName ? `from <strong>${companyName}</strong>` : ''} has requested your digital signature on the following document:</p>
        
        <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 24px 0; text-align: center;">
          <div style="font-size: 14px; color: #64748b; margin-bottom: 4px;">DOCUMENT</div>
          <div style="font-size: 18px; font-weight: 600; color: #0f172a;">${documentTitle}</div>
        </div>

        ${message ? `<div style="font-style: italic; color: #475569; border-left: 4px solid #cbd5e1; padding-left: 16px; margin: 24px 0;">"${message}"</div>` : ''}

        <div style="text-align: center; margin: 32px 0;">
          <a href="${signingLink}" style="background-color: #28ABDF; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(40, 171, 223, 0.2);">Review & Sign Document</a>
        </div>

        <p style="font-size: 14px; color: #64748b; margin-bottom: 0;">
          This is a secure request. You can sign this document from any device without creating an account.
        </p>
      </div>

      <div style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
        <p style="margin: 0;">© ${BRAND.year} NeXsign — Enterprise-Grade Digital Signatures.</p>
        <p style="margin: 8px 0 0;">This email was sent to ${recipientEmail}. If you weren't expecting this, please ignore this email.</p>
      </div>
    </div>
  `;

  return sendMail({
    from:    fromField(companyName),
    to:      recipientEmail,
    subject,
    html,
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
  pdfBuffer,
  signedPdfUrl = '',
  companyLogoUrl,
  companyName,
}) {
  const subject = `✅ Completed: "${documentTitle}"`;
  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #334155; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #f8fafc; padding: 32px 40px; border-bottom: 1px solid #e2e8f0; text-align: center;">
        ${companyLogoUrl 
          ? `<img src="${companyLogoUrl}" alt="${companyName || 'Logo'}" style="max-height: 48px; width: auto; margin-bottom: 16px; display: block; margin-left: auto; margin-right: auto;">`
          : `<div style="font-size: 24px; font-weight: bold; color: #28ABDF; margin-bottom: 8px;">NeXsign</div>`
        }
        <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #10b981;">Document Completed</h1>
      </div>
      
      <div style="padding: 40px;">
        <p style="margin-top: 0;">Hello <strong>${recipientName}</strong>,</p>
        <p>Great news! All parties have successfully signed the document:</p>
        
        <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 24px 0; text-align: center;">
          <div style="font-size: 14px; color: #64748b; margin-bottom: 4px;">DOCUMENT</div>
          <div style="font-size: 18px; font-weight: 600; color: #0f172a;">${documentTitle}</div>
        </div>

        <p>You can find the final signed PDF attached to this email. A legal audit trail has been appended to the end of the document for compliance.</p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${signedPdfUrl}" style="background-color: #10b981; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);">View Signed Document</a>
        </div>
      </div>

      <div style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
        <p style="margin: 0;">© ${BRAND.year} NeXsign — Enterprise-Grade Digital Signatures.</p>
      </div>
    </div>
  `;

  const attachments = [];
  if (pdfBuffer && pdfBuffer.length > 0) {
    attachments.push({
      filename:    `${documentTitle.replace(/[^a-z0-9_\-\s]/gi, '_')}_signed.pdf`,
      content:     pdfBuffer,
      contentType: 'application/pdf',
    });
  }

  return sendMail({
    from:    fromField(companyName),
    to:      recipientEmail,
    subject,
    html,
    attachments,
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

  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #334155; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #f8fafc; padding: 32px 40px; border-bottom: 1px solid #e2e8f0; text-align: center;">
        ${companyLogoUrl 
          ? `<img src="${companyLogoUrl}" alt="${companyName || 'Logo'}" style="max-height: 48px; width: auto; margin-bottom: 16px; display: block; margin-left: auto; margin-right: auto;">`
          : `<div style="font-size: 24px; font-weight: bold; color: #28ABDF; margin-bottom: 8px;">NeXsign</div>`
        }
        <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #1e293b;">Document CC</h1>
      </div>
      
      <div style="padding: 40px;">
        <p style="margin-top: 0;">Hello <strong>${recipientName}</strong>,</p>
        <p>You have been added as a CC recipient for the following document initiated by <strong>${senderName}</strong>:</p>
        
        <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 24px 0; text-align: center;">
          <div style="font-size: 14px; color: #64748b; margin-bottom: 4px;">DOCUMENT</div>
          <div style="font-size: 18px; font-weight: 600; color: #0f172a;">${documentTitle}</div>
        </div>

        <p>You will receive a final copy of this document once all parties have finished signing.</p>
      </div>

      <div style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
        <p style="margin: 0;">© ${BRAND.year} NeXsign — Enterprise-Grade Digital Signatures.</p>
      </div>
    </div>
  `;

  return sendMail({
    from:    fromField(companyName),
    to:      recipientEmail,
    subject,
    html,
  });
}

// ════════════════════════════════════════════════════════════════
// 4. VIEW DOCUMENT (No signature required)
// ════════════════════════════════════════════════════════════════
/**
 * @param {string}  recipientEmail
 * @param {string}  recipientName
 * @param {string}  documentTitle
 * @param {string}  senderName
 * @param {string}  viewLink
 * @param {string}  [companyLogoUrl]
 * @param {string}  [companyName]
 */
async function sendViewEmail({
  recipientEmail,
  recipientName,
  documentTitle,
  senderName,
  viewLink,
  companyLogoUrl,
  companyName,
}) {
  const subject = `Document Shared: "${documentTitle}"`;

  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #334155; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #f8fafc; padding: 32px 40px; border-bottom: 1px solid #e2e8f0; text-align: center;">
        ${companyLogoUrl 
          ? `<img src="${companyLogoUrl}" alt="${companyName || 'Logo'}" style="max-height: 48px; width: auto; margin-bottom: 16px; display: block; margin-left: auto; margin-right: auto;">`
          : `<div style="font-size: 24px; font-weight: bold; color: #28ABDF; margin-bottom: 8px;">NeXsign</div>`
        }
        <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #1e293b;">Document View</h1>
      </div>
      
      <div style="padding: 40px;">
        <p style="margin-top: 0;">Hello <strong>${recipientName}</strong>,</p>
        <p><strong>${senderName}</strong> ${companyName ? `from <strong>${companyName}</strong>` : ''} has sent you a document for your records:</p>
        
        <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 24px 0; text-align: center;">
          <div style="font-size: 14px; color: #64748b; margin-bottom: 4px;">DOCUMENT</div>
          <div style="font-size: 18px; font-weight: 600; color: #0f172a;">${documentTitle}</div>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${viewLink}" style="background-color: #28ABDF; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(40, 171, 223, 0.2);">View Document</a>
        </div>

        <p style="font-size: 14px; color: #64748b; margin-bottom: 0;">
          No signature is required for this document. It has been shared with you for informational purposes.
        </p>
      </div>

      <div style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
        <p style="margin: 0;">© ${BRAND.year} NeXsign — Enterprise-Grade Digital Signatures.</p>
      </div>
    </div>
  `;

  return sendMail({
    from:    fromField(companyName),
    to:      recipientEmail,
    subject,
    html,
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

  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #334155; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #f8fafc; padding: 32px 40px; border-bottom: 1px solid #e2e8f0; text-align: center;">
        ${companyLogoUrl 
          ? `<img src="${companyLogoUrl}" alt="${companyName || 'Logo'}" style="max-height: 48px; width: auto; margin-bottom: 16px; display: block; margin-left: auto; margin-right: auto;">`
          : `<div style="font-size: 24px; font-weight: bold; color: #ef4444; margin-bottom: 8px;">NeXsign</div>`
        }
        <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #b91c1c;">Signing Declined</h1>
      </div>
      
      <div style="padding: 40px;">
        <p style="margin-top: 0;">Hello <strong>${ownerName}</strong>,</p>
        <p>A signer has declined to sign your document:</p>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 24px 0;">
          <div style="margin-bottom: 12px;">
            <span style="font-size: 12px; color: #991b1b; font-weight: 600; text-transform: uppercase;">Document</span><br/>
            <span style="font-size: 16px; color: #1e293b; font-weight: 600;">${documentTitle}</span>
          </div>
          <div style="margin-bottom: 12px;">
            <span style="font-size: 12px; color: #991b1b; font-weight: 600; text-transform: uppercase;">Declined By</span><br/>
            <span style="font-size: 14px; color: #1e293b;">${declinerName} (${declinerEmail})</span>
          </div>
          ${reason ? `
          <div>
            <span style="font-size: 12px; color: #991b1b; font-weight: 600; text-transform: uppercase;">Reason</span><br/>
            <span style="font-size: 14px; color: #475569; font-style: italic;">"${reason}"</span>
          </div>
          ` : ''}
        </div>

        <p style="margin-bottom: 0;">The signing process for this document has been automatically cancelled.</p>
      </div>

      <div style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
        <p style="margin: 0;">© ${BRAND.year} NeXsign — Enterprise-Grade Digital Signatures.</p>
      </div>
    </div>
  `;

  return sendMail({
    from:    fromField(companyName),
    to:      ownerEmail,
    subject,
    html,
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
  sendViewEmail,        // ✅ new
  sendDeclinedEmail,    // ✅ new
  sendFeedbackEmail,
};