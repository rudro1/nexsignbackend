'use strict';

const nodemailer = require('nodemailer');

// ═══════════════════════════════════════════════════════════════
// BRAND CONFIG
// ═══════════════════════════════════════════════════════════════
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

const FRONT = () =>
  (process.env.FRONTEND_URL || 'https://nexsignfrontend.vercel.app').replace(/\/$/, '');

// ═══════════════════════════════════════════════════════════════
// TRANSPORTER — singleton, pooled SMTP
// ═══════════════════════════════════════════════════════════════
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

  _transporter.verify()
    .then(() => {
      if (process.env.NODE_ENV !== 'production')
        console.log('✅ Email transporter ready');
    })
    .catch(err => {
      console.error('❌ Email transporter error:', err.message);
      _transporter = null;
    });

  return _transporter;
}

// ═══════════════════════════════════════════════════════════════
// INTERNAL HELPERS
// ═══════════════════════════════════════════════════════════════

function fromField(companyName) {
  return `"${companyName || BRAND.name}" <${process.env.EMAIL_USER}>`;
}

function logoBlock(logoUrl, companyName) {
  if (!logoUrl) return '';
  return `
    <div style="text-align:center;margin-bottom:16px;">
      <img src="${logoUrl}" alt="${companyName || 'Logo'}"
        style="max-height:60px;max-width:180px;
               object-fit:contain;display:inline-block;"/>
    </div>`;
}

// ── Audit Info Row (Device + Location + Time) ─────────────────
function auditInfoBlock(auditInfo = {}) {
  if (!auditInfo || !auditInfo.device) return '';
  
  const rows = [];
  if (auditInfo.device)   rows.push(['📱 Device',   auditInfo.device]);
  if (auditInfo.browser)  rows.push(['🌐 Browser',  auditInfo.browser]);
  if (auditInfo.os)       rows.push(['💻 OS',        auditInfo.os]);
  if (auditInfo.location) rows.push(['📍 Location',  auditInfo.location]);
  if (auditInfo.postal)   rows.push(['📮 Postal',    auditInfo.postal]);
  if (auditInfo.time)     rows.push(['🕐 Time',      auditInfo.time]);
  if (auditInfo.ip)       rows.push(['🔗 IP',        auditInfo.ip]);

  if (!rows.length) return '';

  const rowsHtml = rows.map(([label, value]) => `
    <tr>
      <td style="padding:6px 12px;font-size:12px;color:#64748b;
                 white-space:nowrap;font-weight:600;">
        ${label}
      </td>
      <td style="padding:6px 12px;font-size:12px;color:#1e293b;">
        ${value}
      </td>
    </tr>`).join('');

  return `
    <div style="background:#f8fafc;border:1px solid #e2e8f0;
                border-radius:10px;overflow:hidden;margin:12px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${rowsHtml}
      </table>
    </div>`;
}

// ── Signer Summary Card ───────────────────────────────────────
function signerCard(party, index) {
  const isSigned = party.status === 'signed' || !!party.signedAt;
  const bgColor  = isSigned ? '#f0fdf4' : '#fefce8';
  const border   = isSigned ? '#86efac' : '#fde68a';
  const badge    = isSigned
    ? `<span style="background:#dcfce7;color:#15803d;padding:3px 10px;
                    border-radius:20px;font-size:11px;font-weight:700;">
         ✅ Signed
       </span>`
    : `<span style="background:#fef9c3;color:#a16207;padding:3px 10px;
                    border-radius:20px;font-size:11px;font-weight:700;">
         ⏳ Pending
       </span>`;

  return `
    <div style="background:${bgColor};border:1px solid ${border};
                border-radius:10px;padding:14px 16px;margin:8px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <div style="font-size:14px;font-weight:700;color:#1e293b;">
              ${index + 1}. ${party.name || 'Unknown'}
            </div>
            ${party.designation
              ? `<div style="font-size:12px;color:#64748b;margin-top:2px;">
                   🏷️ ${party.designation}
                 </div>`
              : ''}
            <div style="font-size:12px;color:#94a3b8;margin-top:2px;">
              📧 ${party.email || '—'}
            </div>
          </td>
          <td style="text-align:right;vertical-align:top;">
            ${badge}
          </td>
        </tr>
      </table>
      ${isSigned && party.auditInfo
        ? auditInfoBlock(party.auditInfo)
        : ''}
    </div>`;
}

// ── CC Recipient Card ─────────────────────────────────────────
function ccCard(cc) {
  return `
    <div style="display:inline-block;background:#f1f5f9;border:1px solid #e2e8f0;
                border-radius:8px;padding:8px 14px;margin:4px 4px 4px 0;">
      <div style="font-size:13px;font-weight:700;color:#1e293b;">
        ${cc.name || cc.email}
      </div>
      ${cc.designation
        ? `<div style="font-size:11px;color:#64748b;">🏷️ ${cc.designation}</div>`
        : ''}
      <div style="font-size:11px;color:#94a3b8;">📧 ${cc.email}</div>
    </div>`;
}

// ── CTA Button ────────────────────────────────────────────────
function ctaButton(href, label, color = BRAND.color) {
  return `
    <div style="text-align:center;margin:28px 0;">
      <a href="${href}"
        style="background:${color};color:#ffffff;
               padding:14px 36px;text-decoration:none;
               border-radius:10px;font-weight:700;
               font-size:15px;display:inline-block;
               box-shadow:0 4px 14px rgba(40,171,223,0.35);
               letter-spacing:0.3px;">
        ${label}
      </a>
    </div>`;
}

// ── Master HTML Shell ─────────────────────────────────────────
function buildEmail({ logoUrl, companyName, subject, bodyHtml }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${subject}</title>
  <style>
    @media only screen and (max-width:600px){
      .email-body { padding:20px !important; }
      .btn-cta { padding:12px 24px !important;font-size:14px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#e9f0f7;
             font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
         style="background:#e9f0f7;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%"
               style="max-width:600px;background:#ffffff;
                      border-radius:18px;overflow:hidden;
                      box-shadow:0 6px 30px rgba(0,0,0,0.09);">

          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,
                       ${BRAND.color} 0%,${BRAND.colorDark} 100%);
                       padding:28px 36px;text-align:center;">
              ${logoBlock(logoUrl, companyName)}
              <h1 style="color:#fff;margin:0;font-size:22px;
                         font-weight:700;letter-spacing:0.4px;">
                ${companyName || BRAND.name}
              </h1>
              <p style="color:rgba(255,255,255,0.78);
                        margin:5px 0 0;font-size:12px;">
                ${BRAND.tagline}
              </p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td class="email-body"
                style="padding:36px;font-size:15px;
                       color:#374151;line-height:1.7;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#f1f5f9;padding:20px 36px;
                       text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0 0 6px;font-size:12px;color:#475569;">
                ${companyName
                  ? `<strong>${companyName}</strong> uses`
                  : 'Powered by'}
                <strong style="color:${BRAND.color};">
                  ${BRAND.name}
                </strong>
                for secure digital contracts.
              </p>
              <p style="margin:0;font-size:11px;color:#94a3b8;">
                ${BRAND.tagline} &nbsp;·&nbsp; © ${BRAND.year}
                &nbsp;·&nbsp;
                <a href="mailto:${BRAND.support}"
                   style="color:${BRAND.color};text-decoration:none;">
                  ${BRAND.support}
                </a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════
// INTERNAL SEND WITH RETRY
// ═══════════════════════════════════════════════════════════════
async function sendMail(mailOptions, retries = 2) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ EMAIL_USER or EMAIL_PASS not set!');
    throw new Error('Email service misconfigured');
  }

  const transport = getTransporter();
  let lastErr;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const info = await transport.sendMail(mailOptions);
      console.log(`📧 Sent → ${mailOptions.to} [${info.messageId}]`);
      return info;
    } catch (err) {
      lastErr = err;
      console.error(
        `📧 Attempt ${attempt + 1} failed for ${mailOptions.to}:`,
        err.message
      );
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 1_500 * (attempt + 1)));
      }
    }
  }
  throw lastErr;
}

// ═══════════════════════════════════════════════════════════════
// 1. SIGNING INVITATION EMAIL
// ═══════════════════════════════════════════════════════════════
/**
 * @param {string}  recipientEmail
 * @param {string}  recipientName
 * @param {string}  [recipientDesignation]
 * @param {string}  senderName
 * @param {string}  [senderDesignation]
 * @param {string}  documentTitle
 * @param {string}  signingLink
 * @param {string}  [companyLogoUrl]
 * @param {string}  [companyName]
 * @param {number}  [partyNumber]
 * @param {number}  [totalParties]
 * @param {string}  [message]
 * @param {Array}   [ccList]  [{name, email, designation}]
 */
async function sendSigningEmail({
  recipientEmail,
  recipientName,
  recipientDesignation = '',
  senderName,
  senderDesignation    = '',
  documentTitle,
  signingLink,
  companyLogoUrl,
  companyName,
  partyNumber    = 1,
  totalParties   = 1,
  message        = '',
  ccList         = [],
}) {
  const subject = `✍️ Signature Required: "${documentTitle}"`;

  const progressHtml = totalParties > 1
    ? `<div style="background:#f1f5f9;border-radius:8px;
                   padding:10px 14px;margin:16px 0;
                   font-size:13px;color:#475569;">
         📋 You are signer
         <strong style="color:${BRAND.color};">
           ${partyNumber} of ${totalParties}
         </strong>
       </div>`
    : '';

  const ccHtml = ccList.length
    ? `<div style="margin:20px 0;">
         <div style="font-size:12px;font-weight:700;color:#64748b;
                     text-transform:uppercase;letter-spacing:0.6px;
                     margin-bottom:8px;">
           CC Recipients
         </div>
         ${ccList.map(cc => ccCard(cc)).join('')}
       </div>`
    : '';

  const msgHtml = message
    ? `<div style="font-style:italic;color:#475569;
                   border-left:4px solid #cbd5e1;
                   padding:12px 16px;margin:20px 0;
                   background:#f8fafc;border-radius:0 8px 8px 0;
                   font-size:14px;">
         "${message}"
       </div>`
    : '';

  const bodyHtml = `
    <h2 style="color:#1a202c;margin:0 0 16px;font-size:20px;">
      Hello ${recipientName}
      ${recipientDesignation
        ? `<span style="font-size:13px;color:#64748b;
                        font-weight:400;display:block;margin-top:4px;">
             🏷️ ${recipientDesignation}
           </span>`
        : ''},
    </h2>

    <p style="color:#4a5568;margin:0 0 16px;">
      <strong>${senderName}</strong>
      ${senderDesignation
        ? `<span style="font-size:13px;color:#64748b;">
             (${senderDesignation})
           </span>`
        : ''}
      ${companyName
        ? `from <strong>${companyName}</strong>`
        : ''}
      has requested your digital signature on:
    </p>

    <div style="background:#f1f5f9;border-left:4px solid ${BRAND.color};
                border-radius:10px;padding:16px 20px;margin:0 0 16px;">
      <div style="font-size:12px;color:#64748b;font-weight:700;
                  text-transform:uppercase;letter-spacing:0.5px;
                  margin-bottom:4px;">
        Document
      </div>
      <div style="font-size:18px;font-weight:700;color:#1a202c;">
        📄 ${documentTitle}
      </div>
    </div>

    ${progressHtml}
    ${msgHtml}

    ${ctaButton(signingLink, '🖊️ Review & Sign Document')}

    <p style="font-size:13px;color:#94a3b8;margin:16px 0 0;
              text-align:center;">
      🔒 Secure link · No account required · 
      Expires in <strong>72 hours</strong>
    </p>

    ${ccHtml}`;

  return sendMail({
    from:    fromField(companyName),
    to:      recipientEmail,
    subject,
    html:    buildEmail({
      logoUrl:     companyLogoUrl,
      companyName,
      subject,
      bodyHtml,
    }),
  });
}

// ═══════════════════════════════════════════════════════════════
// 2. COMPLETION EMAIL (with PDF attachment)
// ═══════════════════════════════════════════════════════════════
/**
 * @param {string}        recipientEmail
 * @param {string}        recipientName
 * @param {string}        [recipientDesignation]
 * @param {string}        documentTitle
 * @param {Buffer|null}   pdfBuffer
 * @param {string}        [signedPdfUrl]
 * @param {string}        [companyLogoUrl]
 * @param {string}        [companyName]
 * @param {Array}         [parties]
 *   [{name, email, designation, status, signedAt, auditInfo}]
 *   auditInfo: {device, browser, os, location, postal, time, ip}
 * @param {Array}         [ccList] [{name, email, designation}]
 * @param {boolean}       [isCC]
 */
async function sendCompletionEmail({
  recipientEmail,
  recipientName,
  recipientDesignation = '',
  documentTitle,
  pdfBuffer,
  signedPdfUrl         = '',
  companyLogoUrl,
  companyName,
  parties              = [],
  ccList               = [],
  isCC                 = false,
}) {
  const subject = `✅ Completed: "${documentTitle}"`;

  const signersHtml = parties.length
    ? `<div style="margin:20px 0;">
         <div style="font-size:12px;font-weight:700;color:#64748b;
                     text-transform:uppercase;letter-spacing:0.6px;
                     margin-bottom:10px;">
           Signing Summary
         </div>
         ${parties.map((p, i) => signerCard(p, i)).join('')}
       </div>`
    : '';

  const ccHtml = ccList.length
    ? `<div style="margin:20px 0;">
         <div style="font-size:12px;font-weight:700;color:#64748b;
                     text-transform:uppercase;letter-spacing:0.6px;
                     margin-bottom:8px;">
           CC Recipients
         </div>
         ${ccList.map(cc => ccCard(cc)).join('')}
       </div>`
    : '';

  const roleNote = isCC
    ? `<div style="background:#f0f9ff;border:1px solid #bae6fd;
                   border-radius:8px;padding:10px 14px;
                   font-size:13px;color:#0369a1;margin:16px 0;">
         ℹ️ You were CC'd on this document.
       </div>`
    : '';

  const bodyHtml = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="width:60px;height:60px;background:#dcfce7;
                  border-radius:50%;display:inline-flex;
                  align-items:center;justify-content:center;
                  font-size:28px;margin-bottom:12px;">
        ✅
      </div>
      <h2 style="color:#15803d;margin:0;font-size:22px;">
        Document Completed!
      </h2>
    </div>

    <p style="color:#4a5568;margin:0 0 16px;">
      Hello <strong>${recipientName}</strong>
      ${recipientDesignation
        ? `<span style="font-size:13px;color:#64748b;">
             (${recipientDesignation})
           </span>`
        : ''},
    </p>

    ${roleNote}

    <p style="color:#4a5568;margin:0 0 16px;">
      All parties have successfully signed:
    </p>

    <div style="background:#f1f5f9;border-left:4px solid #22c55e;
                border-radius:10px;padding:16px 20px;margin:0 0 16px;">
      <div style="font-size:18px;font-weight:700;color:#1a202c;">
        📄 ${documentTitle}
      </div>
    </div>

    ${signersHtml}
    ${ccHtml}

    ${signedPdfUrl
      ? ctaButton(signedPdfUrl, '📥 View & Download Signed PDF', '#22c55e')
      : ''}

    <p style="font-size:13px;color:#94a3b8;margin:16px 0 0;
              text-align:center;">
      The signed PDF is also attached to this email.
    </p>`;

  const attachments = [];
  if (pdfBuffer && pdfBuffer.length > 0) {
    attachments.push({
      filename:    `${documentTitle.replace(/[^a-z0-9_\-\s]/gi, '_')}_signed.pdf`,
      content:     pdfBuffer,
      contentType: 'application/pdf',
    });
  }

  return sendMail({
    from: fromField(companyName),
    to:   recipientEmail,
    subject,
    html: buildEmail({
      logoUrl:     companyLogoUrl,
      companyName,
      subject,
      bodyHtml,
    }),
    attachments,
  });
}

// ═══════════════════════════════════════════════════════════════
// 3. CC NOTIFICATION (document dispatch time)
// ═══════════════════════════════════════════════════════════════
/**
 * @param {string}  recipientEmail
 * @param {string}  recipientName
 * @param {string}  [recipientDesignation]
 * @param {string}  documentTitle
 * @param {string}  senderName
 * @param {string}  [senderDesignation]
 * @param {string}  [companyLogoUrl]
 * @param {string}  [companyName]
 * @param {Array}   [parties] [{name, email, designation}]
 */
async function sendCCEmail({
  recipientEmail,
  recipientName,
  recipientDesignation = '',
  documentTitle,
  senderName,
  senderDesignation    = '',
  companyLogoUrl,
  companyName,
  parties              = [],
}) {
  const subject = `📋 CC: "${documentTitle}" — Signing in Progress`;

  const partiesHtml = parties.length
    ? `<div style="margin:20px 0;">
         <div style="font-size:12px;font-weight:700;color:#64748b;
                     text-transform:uppercase;letter-spacing:0.6px;
                     margin-bottom:10px;">
           Signers
         </div>
         ${parties.map((p, i) => signerCard(p, i)).join('')}
       </div>`
    : '';

  const bodyHtml = `
    <h2 style="color:#1a202c;margin:0 0 16px;font-size:20px;">
      Hello ${recipientName}
      ${recipientDesignation
        ? `<span style="font-size:13px;color:#64748b;
                        font-weight:400;display:block;margin-top:4px;">
             🏷️ ${recipientDesignation}
           </span>`
        : ''},
    </h2>

    <div style="background:#f0f9ff;border:1px solid #bae6fd;
                border-radius:8px;padding:10px 14px;
                font-size:13px;color:#0369a1;margin:0 0 16px;">
      ℹ️ You have been added as a
      <strong>CC recipient</strong> on this document.
    </div>

    <p style="color:#4a5568;margin:0 0 16px;">
      <strong>${senderName}</strong>
      ${senderDesignation
        ? `<span style="font-size:13px;color:#64748b;">
             (${senderDesignation})
           </span>`
        : ''}
      ${companyName
        ? `from <strong>${companyName}</strong>`
        : ''}
      has initiated a signing process for:
    </p>

    <div style="background:#f1f5f9;border-left:4px solid ${BRAND.color};
                border-radius:10px;padding:16px 20px;margin:0 0 16px;">
      <div style="font-size:18px;font-weight:700;color:#1a202c;">
        📄 ${documentTitle}
      </div>
    </div>

    ${partiesHtml}

    <div style="background:#fef9c3;border:1px solid #fde68a;
                border-radius:8px;padding:12px 16px;
                font-size:13px;color:#713f12;margin:16px 0;">
      📬 You will receive the
      <strong>final signed PDF</strong>
      once all parties have completed signing.
    </div>`;

  return sendMail({
    from:    fromField(companyName),
    to:      recipientEmail,
    subject,
    html:    buildEmail({
      logoUrl:     companyLogoUrl,
      companyName,
      subject,
      bodyHtml,
    }),
  });
}

// ═══════════════════════════════════════════════════════════════
// 4. DOCUMENT DECLINED
// ═══════════════════════════════════════════════════════════════
async function sendDeclinedEmail({
  ownerEmail,
  ownerName,
  documentTitle,
  declinerName,
  declinerEmail,
  declinerDesignation  = '',
  reason               = '',
  companyLogoUrl,
  companyName,
}) {
  const subject = `⚠️ Declined: "${documentTitle}"`;

  const bodyHtml = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="width:60px;height:60px;background:#fee2e2;
                  border-radius:50%;display:inline-flex;
                  align-items:center;justify-content:center;
                  font-size:28px;margin-bottom:12px;">
        ⚠️
      </div>
      <h2 style="color:#dc2626;margin:0;font-size:22px;">
        Signing Declined
      </h2>
    </div>

    <p style="color:#4a5568;margin:0 0 16px;">
      Hello <strong>${ownerName}</strong>,
    </p>

    <p style="color:#4a5568;margin:0 0 16px;">
      A signer has declined to sign your document.
      The signing process has been automatically cancelled.
    </p>

    <div style="background:#fef2f2;border:1px solid #fecaca;
                border-radius:10px;padding:16px 20px;margin:16px 0;">

      <div style="margin-bottom:10px;">
        <div style="font-size:11px;color:#991b1b;font-weight:700;
                    text-transform:uppercase;letter-spacing:0.5px;">
          Document
        </div>
        <div style="font-size:16px;font-weight:700;color:#1a202c;
                    margin-top:2px;">
          📄 ${documentTitle}
        </div>
      </div>

      <div style="margin-bottom:10px;">
        <div style="font-size:11px;color:#991b1b;font-weight:700;
                    text-transform:uppercase;letter-spacing:0.5px;">
          Declined By
        </div>
        <div style="font-size:14px;color:#1a202c;margin-top:2px;">
          ${declinerName}
          ${declinerDesignation
            ? `<span style="color:#64748b;font-size:12px;">
                 (${declinerDesignation})
               </span>`
            : ''}
        </div>
        <div style="font-size:12px;color:#94a3b8;">
          📧 ${declinerEmail}
        </div>
      </div>

      ${reason
        ? `<div>
             <div style="font-size:11px;color:#991b1b;font-weight:700;
                         text-transform:uppercase;letter-spacing:0.5px;">
               Reason
             </div>
             <div style="font-size:13px;color:#475569;
                         font-style:italic;margin-top:2px;">
               "${reason}"
             </div>
           </div>`
        : ''}
    </div>`;

  return sendMail({
    from:    fromField(companyName),
    to:      ownerEmail,
    subject,
    html:    buildEmail({
      logoUrl:     companyLogoUrl,
      companyName,
      subject,
      bodyHtml,
    }),
  });
}

// ═══════════════════════════════════════════════════════════════
// 5. BOSS APPROVAL EMAIL (Master Template - Module 2)
// ═══════════════════════════════════════════════════════════════
/**
 * @param {string}  bossEmail
 * @param {string}  bossName
 * @param {string}  [bossDesignation]
 * @param {string}  documentTitle
 * @param {string}  signingLink
 * @param {number}  employeeCount
 * @param {string}  senderName
 * @param {string}  [companyLogoUrl]
 * @param {string}  [companyName]
 * @param {string}  [message]
 */
async function sendBossApprovalEmail({
  bossEmail,
  bossName,
  bossDesignation  = '',
  documentTitle,
  signingLink,
  employeeCount    = 0,
  senderName,
  companyLogoUrl,
  companyName,
  message          = '',
}) {
  const subject = `🔐 Master Approval Required: "${documentTitle}"`;

  const bodyHtml = `
    <h2 style="color:#1a202c;margin:0 0 16px;font-size:20px;">
      Hello ${bossName}
      ${bossDesignation
        ? `<span style="font-size:13px;color:#64748b;
                        font-weight:400;display:block;margin-top:4px;">
             🏷️ ${bossDesignation}
           </span>`
        : ''},
    </h2>

    <div style="background:#fef9c3;border:1px solid #fde68a;
                border-radius:8px;padding:12px 16px;
                font-size:13px;color:#713f12;margin:0 0 16px;">
      👑 You are the <strong>Primary Approver</strong>
      for this document.
    </div>

    <p style="color:#4a5568;margin:0 0 16px;">
      <strong>${senderName}</strong>
      ${companyName ? `from <strong>${companyName}</strong>` : ''}
      requires your approval on the Master Template:
    </p>

    <div style="background:#f1f5f9;border-left:4px solid ${BRAND.color};
                border-radius:10px;padding:16px 20px;margin:0 0 16px;">
      <div style="font-size:18px;font-weight:700;color:#1a202c;">
        📄 ${documentTitle}
      </div>
      <div style="font-size:13px;color:#64748b;margin-top:6px;">
        👥 Will be distributed to
        <strong style="color:${BRAND.color};">
          ${employeeCount} employees
        </strong>
        after your approval
      </div>
    </div>

    <div style="background:#f0f9ff;border:1px solid #bae6fd;
                border-radius:8px;padding:12px 16px;
                font-size:13px;color:#0369a1;margin:0 0 16px;">
      ℹ️ Your signature will be embedded as a permanent layer
      on each employee's individual copy.
    </div>

    ${message
      ? `<div style="font-style:italic;color:#475569;
                     border-left:4px solid #cbd5e1;
                     padding:12px 16px;margin:20px 0;
                     background:#f8fafc;border-radius:0 8px 8px 0;
                     font-size:14px;">
           "${message}"
         </div>`
      : ''}

    ${ctaButton(signingLink, '👑 Review & Approve as Master Signer', '#7c3aed')}

    <p style="font-size:13px;color:#94a3b8;margin:16px 0 0;
              text-align:center;">
      🔒 Secure link · Expires in 72 hours
    </p>`;

  return sendMail({
    from:    fromField(companyName),
    to:      bossEmail,
    subject,
    html:    buildEmail({
      logoUrl:     companyLogoUrl,
      companyName,
      subject,
      bodyHtml,
    }),
  });
}

// ═══════════════════════════════════════════════════════════════
// 6. EMPLOYEE SIGNING EMAIL (Master Template - Module 2)
// ═══════════════════════════════════════════════════════════════
/**
 * @param {string}  employeeEmail
 * @param {string}  employeeName
 * @param {string}  documentTitle
 * @param {string}  signingLink
 * @param {string}  bossName
 * @param {string}  [bossDesignation]
 * @param {string}  [companyLogoUrl]
 * @param {string}  [companyName]
 */
async function sendEmployeeSigningEmail({
  employeeEmail,
  employeeName,
  documentTitle,
  signingLink,
  bossName,
  bossDesignation  = '',
  companyLogoUrl,
  companyName,
}) {
  const subject = `✍️ Please Sign: "${documentTitle}"`;

  const bodyHtml = `
    <h2 style="color:#1a202c;margin:0 0 16px;font-size:20px;">
      Hello ${employeeName},
    </h2>

    <p style="color:#4a5568;margin:0 0 16px;">
      You have a document ready for your signature from
      ${companyName ? `<strong>${companyName}</strong>` : 'your organisation'}:
    </p>

    <div style="background:#f1f5f9;border-left:4px solid ${BRAND.color};
                border-radius:10px;padding:16px 20px;margin:0 0 16px;">
      <div style="font-size:18px;font-weight:700;color:#1a202c;">
        📄 ${documentTitle}
      </div>
    </div>

    <div style="background:#f0fdf4;border:1px solid #86efac;
                border-radius:8px;padding:12px 16px;
                font-size:13px;color:#15803d;margin:0 0 20px;">
      ✅ Already approved by:
      <strong>${bossName}</strong>
      ${bossDesignation
        ? `<span style="color:#64748b;">(${bossDesignation})</span>`
        : ''}
    </div>

    ${ctaButton(signingLink, '🖊️ Sign My Document')}

    <p style="font-size:13px;color:#94a3b8;margin:16px 0 0;
              text-align:center;">
      🔒 This link is unique to you · No account required ·
      Expires in 72 hours
    </p>`;

  return sendMail({
    from:    fromField(companyName),
    to:      employeeEmail,
    subject,
    html:    buildEmail({
      logoUrl:     companyLogoUrl,
      companyName,
      subject,
      bodyHtml,
    }),
  });
}

// ═══════════════════════════════════════════════════════════════
// 7. FEEDBACK THANK-YOU
// ═══════════════════════════════════════════════════════════════
async function sendFeedbackEmail(userEmail, userName, stars) {
  const starCount = Math.min(Math.max(Number(stars) || 0, 0), 5);
  const starBar   = '⭐'.repeat(starCount);
  const subject   = `Thank you for your feedback! ${starBar}`;

  const bodyHtml = `
    <h2 style="color:#1a202c;margin:0 0 14px;font-size:20px;">
      Hello ${userName || 'Valued User'} 😊
    </h2>

    <p style="color:#4a5568;margin:0 0 16px;">
      Thank you for taking the time to rate us!
    </p>

    <div style="background:#fefce8;border:1px solid #fde68a;
                border-radius:12px;padding:20px;
                text-align:center;margin:0 0 20px;">
      <div style="font-size:28px;letter-spacing:4px;">
        ${starBar}
      </div>
      <p style="margin:8px 0 0;font-size:18px;
                font-weight:700;color:#92400e;">
        ${starCount}-Star Rating
      </p>
    </div>

    <div style="background:#f8fafc;border-left:4px solid ${BRAND.color};
                border-radius:10px;padding:16px 20px;margin:0 0 20px;">
      <p style="margin:0;font-style:italic;
                color:#475569;font-size:14px;line-height:1.7;">
        "Your feedback drives us to build a better future
        for digital agreements. Every star motivates our team."
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

// ═══════════════════════════════════════════════════════════════
// 8. VIEW ONLY EMAIL
// ═══════════════════════════════════════════════════════════════
async function sendViewEmail({
  recipientEmail,
  recipientName,
  documentTitle,
  senderName,
  viewLink,
  companyLogoUrl,
  companyName,
}) {
  const subject = `📄 Document Shared: "${documentTitle}"`;

  const bodyHtml = `
    <h2 style="color:#1a202c;margin:0 0 16px;font-size:20px;">
      Hello ${recipientName},
    </h2>

    <p style="color:#4a5568;margin:0 0 16px;">
      <strong>${senderName}</strong>
      ${companyName ? `from <strong>${companyName}</strong>` : ''}
      has shared a document with you for your records:
    </p>

    <div style="background:#f1f5f9;border-left:4px solid ${BRAND.color};
                border-radius:10px;padding:16px 20px;margin:0 0 20px;">
      <div style="font-size:18px;font-weight:700;color:#1a202c;">
        📄 ${documentTitle}
      </div>
    </div>

    ${ctaButton(viewLink, '👁️ View Document')}

    <p style="font-size:13px;color:#94a3b8;margin:16px 0 0;
              text-align:center;">
      No signature required · View only
    </p>`;

  return sendMail({
    from:    fromField(companyName),
    to:      recipientEmail,
    subject,
    html:    buildEmail({
      logoUrl:     companyLogoUrl,
      companyName,
      subject,
      bodyHtml,
    }),
  });
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════
module.exports = {
  sendSigningEmail,
  sendCompletionEmail,
  sendCCEmail,
  sendDeclinedEmail,
  sendBossApprovalEmail,
  sendEmployeeSigningEmail,
  sendFeedbackEmail,
  sendViewEmail,
};