const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fetch = require('node-fetch');

// ── Font map ─────────────────────────────────────────────────────
const FONT_MAP = {
  'Helvetica':       StandardFonts.Helvetica,
  'Times New Roman': StandardFonts.TimesRoman,
  'Courier':         StandardFonts.Courier,
};

// ── Helpers ──────────────────────────────────────────────────────
async function fetchPdfBuffer(url) {
  const res = await fetch(url, { timeout: 30000 });
  if (!res.ok) throw new Error(`PDF fetch failed: ${res.status}`);
  return res.arrayBuffer();
}

function hexToRgb(hex = '#000000') {
  const h = hex.replace('#', '');
  return rgb(
    parseInt(h.slice(0,2),16)/255,
    parseInt(h.slice(2,4),16)/255,
    parseInt(h.slice(4,6),16)/255
  );
}

function wrapText(text, font, fontSize, maxWidth) {
  const words = String(text).split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    try {
      if (font.widthOfTextAtSize(test, fontSize) <= maxWidth) {
        line = test;
      } else {
        if (line) lines.push(line);
        line = word;
      }
    } catch {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// ════════════════════════════════════════════════════════════════
// mergeSignaturesIntoPDF
// ════════════════════════════════════════════════════════════════
async function mergeSignaturesIntoPDF(fileUrl, fields) {
  const buffer  = await fetchPdfBuffer(fileUrl);
  const pdfDoc  = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const pages   = pdfDoc.getPages();

  // Pre-embed all fonts once
  const fonts = {};
  for (const [name, stdFont] of Object.entries(FONT_MAP)) {
    fonts[name] = await pdfDoc.embedFont(stdFont);
  }

  for (const field of fields) {
    if (!field.value) continue;
    const pageIdx = (Number(field.page) || 1) - 1;
    const page    = pages[pageIdx];
    if (!page) continue;

    const { width: pW, height: pH } = page.getSize();
    const fX = (parseFloat(field.x)      / 100) * pW;
    const fY = (parseFloat(field.y)      / 100) * pH;
    const fW = (parseFloat(field.width)  / 100) * pW;
    const fH = (parseFloat(field.height) / 100) * pH;
    // Convert top-left → pdf-lib bottom-left
    const pdfY = pH - fY - fH;

    // ── Signature ───────────────────────────────────────────────
    if (field.type === 'signature' && field.value.startsWith('data:image')) {
      try {
        const [header, b64] = field.value.split(',');
        const imgBytes = Buffer.from(b64, 'base64');
        const img = header.includes('image/png')
          ? await pdfDoc.embedPng(imgBytes)
          : await pdfDoc.embedJpg(imgBytes);
        page.drawImage(img, { x: fX, y: pdfY, width: fW, height: fH });
      } catch (e) {
        console.error('Sig embed error:', e.message);
      }
      continue;
    }

    // ── Text ─────────────────────────────────────────────────────
    if (field.type === 'text' && field.value) {
      const fontKey  = field.fontFamily || 'Helvetica';
      const font     = fonts[fontKey] || fonts['Helvetica'];
      const fontSize = Number(field.fontSize) || 14;
      const color    = hexToRgb('#1a202c');
      const lines    = wrapText(field.value, font, fontSize, fW - 6);

      lines.forEach((line, i) => {
        const lineY = pdfY + fH - (i + 1) * (fontSize + 2) + 2;
        if (lineY > pdfY) {
          page.drawText(line, {
            x: fX + 3, y: lineY,
            font, size: fontSize, color,
          });
        }
      });
    }
  }

  return pdfDoc.save();
}

// ════════════════════════════════════════════════════════════════
// appendAuditPage  — Professional Legal Certificate
// ════════════════════════════════════════════════════════════════
async function appendAuditPage(pdfBytes, doc) {
  const pdfDoc   = await PDFDocument.load(pdfBytes);
  const helv     = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helvBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page = pdfDoc.addPage([612, 792]);
  const { width: W, height: H } = page.getSize();
  const M = 48; // margin
  let   Y = H - M;

  const C = {
    brand:  rgb(0.157, 0.671, 0.875),
    dark:   rgb(0.102, 0.125, 0.173),
    muted:  rgb(0.392, 0.455, 0.545),
    light:  rgb(0.945, 0.961, 0.980),
    green:  rgb(0.086, 0.639, 0.247),
    border: rgb(0.882, 0.910, 0.941),
    white:  rgb(1, 1, 1),
  };

  const rect  = (x,y,w,h,color) =>
    page.drawRectangle({ x,y,width:w,height:h,color });
  const line  = (x1,y1,x2,color=C.border) =>
    page.drawLine({ start:{x:x1,y:y1}, end:{x:x2,y:y1}, thickness:0.5, color });
  const txt   = (s,x,y,{ font=helv, size=9, color=C.dark }={}) =>
    page.drawText(String(s||''), { x,y,font,size,color });

  // ── Header ───────────────────────────────────────────────────
  rect(0, H-72, W, 72, C.brand);
  txt('LEGAL CERTIFICATE OF COMPLETION', M, H-26,
    { font:helvBold, size:15, color:C.white });
  txt('Electronic Signature Audit Trail — NeXsign', M, H-46,
    { size:9, color:rgb(0.8,0.94,1) });
  txt(`nexsign.app  ·  ${new Date().toUTCString()}`,
    W-240, H-46, { size:8, color:rgb(0.8,0.94,1) });
  Y = H - 88;

  // ── Document info ─────────────────────────────────────────────
  rect(M, Y-56, W-M*2, 56, C.light);
  txt('DOCUMENT', M+10, Y-12, { font:helvBold, size:8, color:C.muted });
  txt(doc.title || 'Untitled', M+10, Y-26, { font:helvBold, size:12 });
  txt(`ID: ${doc._id}  ·  Status: ${(doc.status||'').toUpperCase()}  ·  Created: ${new Date(doc.createdAt).toUTCString()}`,
    M+10, Y-42, { size:7.5, color:C.muted });
  Y -= 70;

  // ── Signer details ───────────────────────────────────────────
  txt('SIGNER DETAILS', M, Y, { font:helvBold, size:8, color:C.muted });
  line(M, Y-5, W-M);
  Y -= 18;

  for (let i = 0; i < (doc.parties||[]).length; i++) {
    const p   = doc.parties[i];
    const rowH = p.signed || p.status==='signed' ? 72 : 36;
    if (Y - rowH < M+50) break;

    if (i%2===0) rect(M, Y-rowH+4, W-M*2, rowH, C.light);

    // Badge
    const signed = p.status === 'signed' || p.signedAt;
    const badgeC = signed ? C.green : rgb(0.95,0.6,0.1);
    rect(W-M-68, Y-12, 66, 16, badgeC);
    txt(signed ? '✓ SIGNED' : '⏳ PENDING',
      W-M-63, Y-8, { font:helvBold, size:7.5, color:C.white });

    txt(`Signer ${i+1}: ${p.name}`, M+8, Y-4, { font:helvBold, size:10 });
    txt(p.email, M+8, Y-16, { size:8, color:C.muted });

    if (signed) {
      txt(`Signed: ${p.signedAt ? new Date(p.signedAt).toUTCString() : 'N/A'}`,
        M+8, Y-28, { size:7.5 });
      txt(`Local Time: ${p.clientTime || 'N/A'}  ·  IP: ${p.ip || 'N/A'}`,
        M+8, Y-39, { size:7.5 });
      txt(`Location: ${p.address || p.location || 'N/A'}  ·  Postal: ${p.postalCode || 'N/A'}`,
        M+8, Y-50, { size:7.5, color:C.muted });
      txt(`Device: ${(p.userAgent||'').slice(0,80) || 'N/A'}`,
        M+8, Y-61, { size:7, color:C.muted });
    }
    Y -= rowH + 8;
  }

  // ── CC list ───────────────────────────────────────────────────
  const cc = doc.ccList || doc.ccRecipients || [];
  if (cc.length > 0) {
    Y -= 10;
    txt('CC RECIPIENTS', M, Y, { font:helvBold, size:8, color:C.muted });
    line(M, Y-5, W-M);
    Y -= 16;
    for (const r of cc) {
      if (Y < M+40) break;
      txt(`• ${r.name||''} <${r.email}>  ${r.designation?`[${r.designation}]`:''}`,
        M+8, Y, { size:8 });
      Y -= 14;
    }
  }

  // ── Legal disclaimer ─────────────────────────────────────────
  const discY = M + 30;
  rect(M, discY-4, W-M*2, 34, rgb(0.95,0.98,1));
  line(M, discY+30, W-M, C.brand);
  txt('This certificate constitutes a legally binding record of electronic signatures.',
    M+8, discY+18, { size:7.5, color:C.muted });
  txt('All signing events are cryptographically timestamped. Generated by NeXsign · nexsign.app',
    M+8, discY+7, { size:7.5, color:C.muted });

  // ── Footer bar ────────────────────────────────────────────────
  rect(0, 0, W, 24, C.brand);
  txt(`NeXsign Legal Certificate  ·  Doc ID: ${doc._id}`,
    M, 8, { size:7.5, color:C.white });

  return pdfDoc.save();
}

module.exports = { mergeSignaturesIntoPDF, appendAuditPage };