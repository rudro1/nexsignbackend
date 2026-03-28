// const { PDFDocument, rgb, StandardFonts, BlendMode } = require('pdf-lib');

// // ── Font map ──────────────────────────────────────────────────
// const FONT_MAP = {
//   'Helvetica':       StandardFonts.Helvetica,
//   'Times New Roman': StandardFonts.TimesRoman,
//   'Courier':         StandardFonts.Courier,
// };

// // ════════════════════════════════════════════════════════════════
// // ✅ HELPER: Fetch PDF
// // ════════════════════════════════════════════════════════════════
// async function fetchPdfBuffer(url) {
//   const controller = new AbortController();
//   const timer = setTimeout(() => controller.abort(), 30000);
//   try {
//     const res = await fetch(url, { signal: controller.signal });
//     if (!res.ok) throw new Error(`PDF fetch failed: ${res.status}`);
//     return await res.arrayBuffer();
//   } finally {
//     clearTimeout(timer);
//   }
// }

// // ════════════════════════════════════════════════════════════════
// // ✅ HELPER: Hex → RGB
// // ════════════════════════════════════════════════════════════════
// function hexToRgb(hex = '#000000') {
//   const h = hex.replace('#', '');
//   return rgb(
//     parseInt(h.slice(0, 2), 16) / 255,
//     parseInt(h.slice(2, 4), 16) / 255,
//     parseInt(h.slice(4, 6), 16) / 255,
//   );
// }

// // ════════════════════════════════════════════════════════════════
// // ✅ HELPER: Wrap text
// // ════════════════════════════════════════════════════════════════
// function wrapText(text, font, fontSize, maxWidth) {
//   const words = String(text).split(' ');
//   const lines = [];
//   let line = '';
//   for (const word of words) {
//     const test = line ? `${line} ${word}` : word;
//     try {
//       if (font.widthOfTextAtSize(test, fontSize) <= maxWidth) {
//         line = test;
//       } else {
//         if (line) lines.push(line);
//         line = word;
//       }
//     } catch {
//       line = test;
//     }
//   }
//   if (line) lines.push(line);
//   return lines;
// }

// // ════════════════════════════════════════════════════════════════
// // ✅ HELPER: Base64 to PNG — Remove white background
// // Canvas দিয়ে white pixel গুলো transparent করবো
// // ════════════════════════════════════════════════════════════════
// function base64ToCleanPngBuffer(base64Data, isDataUrl = true) {
//   // Browser Canvas নেই Node.js এ
//   // তাই directly base64 → Buffer করবো
//   // Transparency canvas ছাড়া করা যায় না
//   // কিন্তু pdf-lib এ BlendMode.Multiply use করলে
//   // white background "invisible" হয়ে যায় PDF এ
//   const b64 = isDataUrl ? base64Data.split(',')[1] : base64Data;
//   return Buffer.from(b64, 'base64');
// }

// // ════════════════════════════════════════════════════════════════
// // ✅ MAIN: Merge Signatures into PDF
// //
// // KEY FIXES:
// // 1. Position: frontend % → PDF coordinate সঠিকভাবে convert
// // 2. Signature: BlendMode.Multiply → white background invisible
// // 3. Text: exact center alignment with proper Y calculation
// // ════════════════════════════════════════════════════════════════
// async function mergeSignaturesIntoPDF(fileUrl, fields) {
//   const buffer = await fetchPdfBuffer(fileUrl);
//   const pdfDoc = await PDFDocument.load(buffer, {
//     ignoreEncryption: true,
//   });
//   const pages = pdfDoc.getPages();

//   // Pre-embed fonts
//   const fonts = {};
//   for (const [name, stdFont] of Object.entries(FONT_MAP)) {
//     fonts[name] = await pdfDoc.embedFont(stdFont);
//   }

//   for (const field of fields) {
//     if (!field.value || field.value === '[SIGNED]') continue;

//     const pageIdx = (Number(field.page) || 1) - 1;
//     const page    = pages[pageIdx];
//     if (!page) continue;

//     const { width: pW, height: pH } = page.getSize();

//     // ✅ CRITICAL: Frontend % → PDF coordinates
//     // Frontend: top-left origin, Y goes DOWN
//     // PDF-lib:  bottom-left origin, Y goes UP
//     const fX = (parseFloat(field.x)      / 100) * pW;
//     const fY = (parseFloat(field.y)      / 100) * pH;
//     const fW = (parseFloat(field.width)  / 100) * pW;
//     const fH = (parseFloat(field.height) / 100) * pH;

//     // Convert: top-left Y → bottom-left Y
//     // pdfY = total height - top offset - field height
//     const pdfY = pH - fY - fH;

//     // ════════════════════════════════════════════════════
//     // ✅ SIGNATURE — Transparent background fix
//     // ════════════════════════════════════════════════════
//     if (
//       field.type === 'signature' &&
//       field.value.startsWith('data:image')
//     ) {
//       try {
//         const isPng = field.value.includes('image/png');
//         const imgBuffer = base64ToCleanPngBuffer(field.value);

//         let image;
//         if (isPng) {
//           image = await pdfDoc.embedPng(imgBuffer);
//         } else {
//           image = await pdfDoc.embedJpg(imgBuffer);
//         }

//         // ✅ Scale to fit — aspect ratio maintain করবো
//         const imgDims = image.scaleToFit(fW, fH);

//         // ✅ Center করবো field এর মধ্যে
//         const imgX = fX + (fW - imgDims.width)  / 2;
//         const imgY = pdfY + (fH - imgDims.height) / 2;

//         page.drawImage(image, {
//           x:      imgX,
//           y:      imgY,
//           width:  imgDims.width,
//           height: imgDims.height,
//           opacity: 1,
//           // ✅ KEY FIX: Multiply blend mode
//           // White pixels → transparent হয়ে যাবে
//           // Dark pixels (signature) → visible থাকবে
//           blendMode: BlendMode.Multiply,
//         });

//       } catch (e) {
//         console.error('Signature embed error:', e.message);
//       }
//       continue;
//     }

//     // ════════════════════════════════════════════════════
//     // ✅ TEXT — Exact position, no background
//     // ════════════════════════════════════════════════════
//     if (field.type === 'text' && field.value) {
//       try {
//         const fontKey  = field.fontFamily || 'Helvetica';
//         const font     = fonts[fontKey] || fonts['Helvetica'];
//         const fontSize = Number(field.fontSize) || 12;
//         const color    = hexToRgb('#1a202c');

//         const lines    = wrapText(
//           field.value, font, fontSize, fW - 4
//         );

//         // ✅ Total text block height calculate
//         const lineH      = fontSize * 1.2;
//         const totalTextH = lines.length * lineH;

//         // ✅ Vertical center এ text রাখো
//         const startY = pdfY + (fH + totalTextH) / 2 - lineH + 2;

//         lines.forEach((line, i) => {
//           const lineY = startY - i * lineH;

//           // Boundary check
//           if (lineY < pdfY || lineY > pdfY + fH + lineH) return;

//           // ✅ Horizontal center
//           let textX = fX + 2; // default left align
//           try {
//             const textW = font.widthOfTextAtSize(line, fontSize);
//             if (textW < fW) {
//               textX = fX + (fW - textW) / 2; // center
//             }
//           } catch (_) {}

//           page.drawText(line, {
//             x:    textX,
//             y:    lineY,
//             font,
//             size: fontSize,
//             color,
//             // ✅ No background — just text
//           });
//         });

//       } catch (e) {
//         console.error('Text embed error:', e.message);
//       }
//     }
//   }

//   const finalBytes = await pdfDoc.save();
//   return finalBytes;
// }

// // ════════════════════════════════════════════════════════════════
// // ✅ AUDIT CERTIFICATE PAGE
// // ════════════════════════════════════════════════════════════════
// async function appendAuditPage(pdfBytes, doc) {
//   const pdfDoc   = await PDFDocument.load(pdfBytes);
//   const helv     = await pdfDoc.embedFont(StandardFonts.Helvetica);
//   const helvBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
//   const mono     = await pdfDoc.embedFont(StandardFonts.Courier);

//   const page = pdfDoc.addPage([612, 792]); // A4
//   const { width: W, height: H } = page.getSize();
//   const M = 48;
//   let   Y = H - M;

//   const C = {
//     brand:  rgb(0.157, 0.671, 0.875),
//     dark:   rgb(0.102, 0.125, 0.173),
//     muted:  rgb(0.392, 0.455, 0.545),
//     light:  rgb(0.945, 0.961, 0.980),
//     green:  rgb(0.086, 0.639, 0.247),
//     amber:  rgb(0.851, 0.478, 0.071),
//     border: rgb(0.882, 0.910, 0.941),
//     white:  rgb(1, 1, 1),
//   };

//   const rect = (x, y, w, h, color) =>
//     page.drawRectangle({ x, y, width: w, height: h, color });

//   const hLine = (y, color = C.border, thickness = 0.5) =>
//     page.drawLine({
//       start: { x: M, y },
//       end:   { x: W - M, y },
//       thickness, color,
//     });

//   const txt = (s, x, y, {
//     font     = helv,
//     size     = 9,
//     color    = C.dark,
//     maxWidth = undefined,
//   } = {}) => {
//     if (!s && s !== 0) return;
//     const opts = { x, y, font, size, color };
//     if (maxWidth) opts.maxWidth = maxWidth;
//     page.drawText(String(s), opts);
//   };

//   // ════════════════════════════════════════════════════════
//   // HEADER
//   // ════════════════════════════════════════════════════════
//   rect(0, H - 75, W, 75, C.brand);

//   txt('ELECTRONIC SIGNATURE CERTIFICATE', M, H - 28, {
//     font: helvBold, size: 15, color: C.white,
//   });
//   txt('Legal Audit Trail · Powered by NeXsign', M, H - 45, {
//     size: 9, color: rgb(0.82, 0.95, 1),
//   });
//   txt(`Generated: ${new Date().toUTCString()}`, M, H - 59, {
//     font: mono, size: 7.5, color: rgb(0.82, 0.95, 1),
//   });

//   // Checkmark circle
//   page.drawCircle({ x: W - 65, y: H - 37, size: 26, color: rgb(1,1,1,0.2) });
//   txt('✓', W - 75, H - 30, { font: helvBold, size: 20, color: C.white });

//   Y = H - 95;

//   // ════════════════════════════════════════════════════════
//   // DOCUMENT INFO
//   // ════════════════════════════════════════════════════════
//   rect(M, Y - 66, W - M * 2, 66, C.light);
//   rect(M, Y - 66, 4, 66, C.brand); // left accent

//   txt('DOCUMENT DETAILS', M + 12, Y - 13, {
//     font: helvBold, size: 8, color: C.muted,
//   });
//   txt(doc.title || 'Untitled Document', M + 12, Y - 27, {
//     font: helvBold, size: 13, color: C.dark,
//     maxWidth: W - M * 2 - 100,
//   });

//   const metaParts = [
//     `ID: ${doc._id}`,
//     `Status: ${(doc.status || '').toUpperCase()}`,
//     doc.companyName ? `Company: ${doc.companyName}` : null,
//   ].filter(Boolean).join('  ·  ');

//   txt(metaParts, M + 12, Y - 42, {
//     size: 7.5, color: C.muted,
//     maxWidth: W - M * 2 - 20,
//   });
//   txt(
//     `Created: ${doc.createdAt
//       ? new Date(doc.createdAt).toUTCString()
//       : 'N/A'}`,
//     M + 12, Y - 55,
//     { size: 7.5, color: C.muted }
//   );

//   // COMPLETED badge
//   rect(W - M - 90, Y - 30, 88, 18, C.green);
//   txt('✓  COMPLETED', W - M - 84, Y - 23, {
//     font: helvBold, size: 9, color: C.white,
//   });

//   Y -= 82;

//   // ════════════════════════════════════════════════════════
//   // SIGNING PARTIES
//   // ════════════════════════════════════════════════════════
//   txt('SIGNING PARTIES', M, Y, {
//     font: helvBold, size: 9, color: C.muted,
//   });
//   hLine(Y - 7, C.brand, 1.5);
//   Y -= 20;

//   for (let i = 0; i < (doc.parties || []).length; i++) {
//     const p      = doc.parties[i];
//     const signed = p.status === 'signed' || !!p.signedAt;
//     const rowH   = signed ? 86 : 44;

//     if (Y - rowH < M + 70) break;

//     // Card
//     rect(
//       M, Y - rowH, W - M * 2, rowH,
//       i % 2 === 0 ? C.light : rgb(0.98, 0.99, 1)
//     );
//     // Left accent
//     rect(M, Y - rowH, 3, rowH, signed ? C.green : C.amber);

//     // Number circle
//     page.drawCircle({
//       x: M + 18, y: Y - 17,
//       size: 11,
//       color: signed ? C.green : C.amber,
//     });
//     txt(String(i + 1), M + (i < 9 ? 14 : 11), Y - 21, {
//       font: helvBold, size: 9, color: C.white,
//     });

//     // Name + email
//     txt(p.name || 'Unknown', M + 34, Y - 11, {
//       font: helvBold, size: 11, color: C.dark,
//     });
//     txt(p.email || '', M + 34, Y - 24, {
//       size: 8, color: C.muted,
//     });

//     // Status badge
//     rect(W - M - 76, Y - 16, 74, 15, signed ? C.green : C.amber);
//     txt(
//       signed ? '✓  SIGNED' : '⏳  PENDING',
//       W - M - 70, Y - 11,
//       { font: helvBold, size: 7.5, color: C.white }
//     );

//     if (signed) {
//       page.drawLine({
//         start: { x: M + 10, y: Y - 31 },
//         end:   { x: W - M - 10, y: Y - 31 },
//         thickness: 0.3, color: C.border,
//       });

//       const details = [
//         {
//           label: 'Signed At (UTC)',
//           value: p.signedAt
//             ? new Date(p.signedAt).toUTCString()
//             : 'N/A',
//         },
//         {
//           label: 'Local Time',
//           value: p.clientTime || 'N/A',
//         },
//         {
//           label: 'IP Address',
//           value: p.ip || 'N/A',
//         },
//         {
//           label: 'Location',
//           value: [p.address || p.location, p.postalCode]
//             .filter(Boolean).join(', ') || 'N/A',
//         },
//         {
//           label: 'Device',
//           value: p.userAgent
//             ? p.userAgent.substring(0, 72)
//             : 'N/A',
//         },
//       ];

//       let detY = Y - 40;
//       for (const d of details) {
//         if (detY < Y - rowH + 4) break;
//         txt(`${d.label}:`, M + 12, detY, {
//           font: helvBold, size: 7, color: C.muted,
//         });
//         txt(String(d.value || 'N/A'), M + 100, detY, {
//           font: mono, size: 7, color: C.dark,
//           maxWidth: W - M * 2 - 110,
//         });
//         detY -= 11;
//       }
//     }

//     Y -= rowH + 8;
//   }

//   // ════════════════════════════════════════════════════════
//   // CC RECIPIENTS
//   // ════════════════════════════════════════════════════════
//   const cc = doc.ccList || doc.ccRecipients || [];
//   if (cc.length > 0 && Y > M + 90) {
//     Y -= 6;
//     txt('CC RECIPIENTS', M, Y, {
//       font: helvBold, size: 9, color: C.muted,
//     });
//     hLine(Y - 7);
//     Y -= 18;

//     for (const r of cc) {
//       if (Y < M + 65) break;
//       rect(M, Y - 14, W - M * 2, 18, rgb(0.97, 0.99, 1));
//       txt(
//         `• ${r.name || ''}  <${r.email || ''}>` +
//         (r.designation ? `  [${r.designation}]` : ''),
//         M + 10, Y - 6,
//         { size: 8, color: C.dark }
//       );
//       Y -= 20;
//     }
//   }

//   // ════════════════════════════════════════════════════════
//   // LEGAL DISCLAIMER
//   // ════════════════════════════════════════════════════════
//   const discY = M + 42;
//   rect(M, discY - 6, W - M * 2, 42, rgb(0.94, 0.97, 1));
//   rect(M, discY - 6, 3, 42, C.brand);

//   txt('LEGAL VALIDITY', M + 12, discY + 26, {
//     font: helvBold, size: 8, color: C.brand,
//   });
//   txt(
//     'This certificate is an electronically generated legal record of signature events.',
//     M + 12, discY + 14,
//     { size: 7.5, color: C.muted, maxWidth: W - M * 2 - 20 }
//   );
//   txt(
//     'All events are timestamped. Legally binding under applicable e-signature laws (ESIGN, eIDAS).',
//     M + 12, discY + 3,
//     { size: 7.5, color: C.muted, maxWidth: W - M * 2 - 20 }
//   );

//   // ════════════════════════════════════════════════════════
//   // FOOTER
//   // ════════════════════════════════════════════════════════
//   rect(0, 0, W, 32, C.brand);
//   txt('NeXsign · Electronic Signature Platform · nexsign.app',
//     M, 20, { size: 8, color: C.white });
//   txt(`Certificate ID: ${doc._id}`,
//     M, 8, { font: mono, size: 7, color: rgb(0.82, 0.95, 1) });
//   txt('Confidential & Legally Binding',
//     W - 190, 14, { font: helvBold, size: 7.5, color: C.white });

//   return pdfDoc.save();
// }

// module.exports = { mergeSignaturesIntoPDF, appendAuditPage };
'use strict';

const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

// ════════════════════════════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════════════════════════════
const FETCH_TIMEOUT_MS  = 30_000;
const DEFAULT_FONT_KEY  = 'Helvetica';
const DEFAULT_SIZE      = 12;
const LINE_HEIGHT_RATIO = 1.4;
const TEXT_PADDING_X    = 6;

/**
 * FONT_MAP — fontFamily + fontWeight → StandardFont
 * ✅ Only fonts pdf-lib natively supports
 * ✅ Bold variants explicitly mapped
 */
const FONT_MAP = Object.freeze({
  'Helvetica':              StandardFonts.Helvetica,
  'Helvetica-Bold':         StandardFonts.HelveticaBold,
  'TimesRoman':             StandardFonts.TimesRoman,
  'TimesRoman-Bold':        StandardFonts.TimesRomanBold,
  'Courier':                StandardFonts.Courier,
  'Courier-Bold':           StandardFonts.CourierBold,
  // Legacy aliases from old documents
  'Times New Roman':        StandardFonts.TimesRoman,
  'Times New Roman-Bold':   StandardFonts.TimesRomanBold,
});

// ════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════

/** Hex → pdf-lib rgb() */
function hexToRgb(hex = '#000000') {
  const h = hex.replace('#', '').padEnd(6, '0');
  return rgb(
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  );
}

/** Fetch PDF bytes — timeout + exponential back-off retry */
async function fetchPdfBuffer(url, retries = 2) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl  = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
      return await res.arrayBuffer();
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 1_000 * 2 ** attempt));
      }
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr;
}

/** base64 data-URL → Buffer */
function dataUrlToBuffer(dataUrl) {
  const comma = dataUrl.indexOf(',');
  return Buffer.from(
    comma !== -1 ? dataUrl.slice(comma + 1) : dataUrl,
    'base64',
  );
}

/**
 * Resolve correct embedded font by fontFamily + fontWeight
 * Falls back: bold-variant → regular-variant → Helvetica
 */
function resolveFont(embeddedFonts, fontFamily = DEFAULT_FONT_KEY, fontWeight = 'normal') {
  const boldKey = `${fontFamily}-Bold`;
  const wantBold = fontWeight === 'bold';

  if (wantBold && embeddedFonts[boldKey])   return embeddedFonts[boldKey];
  if (embeddedFonts[fontFamily])             return embeddedFonts[fontFamily];
  return embeddedFonts[DEFAULT_FONT_KEY];
}

/**
 * Word-wrap: split text into lines ≤ maxWidth px at given fontSize
 */
function wrapText(text, font, fontSize, maxWidth) {
  const words = String(text).split(' ');
  const lines = [];
  let   line  = '';

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    let   fits      = true;
    try {
      fits = font.widthOfTextAtSize(candidate, fontSize) <= maxWidth;
    } catch { /* ignore measurement errors */ }

    if (fits) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

/**
 * Normalise a raw field object from DB / request body.
 *
 * Frontend stores x / y / width / height as PERCENTAGE of page size.
 * We keep them as pct here and convert later when we have page dimensions.
 */
function normaliseField(raw) {
  const f = typeof raw === 'string' ? JSON.parse(raw) : raw;
  return {
    id:         String(f.id         ?? ''),
    type:       String(f.type       ?? 'text'),
    page:       Math.max(1, Number(f.page       ?? 1)),
    xPct:       Number(f.x          ?? 0),   // % of page width
    yPct:       Number(f.y          ?? 0),   // % of page height (from TOP)
    wPct:       Number(f.width      ?? 20),  // % of page width
    hPct:       Number(f.height     ?? 5),   // % of page height
    partyIndex: Number(f.partyIndex ?? 0),
    value:      String(f.value      ?? ''),
    fontFamily: String(f.fontFamily ?? DEFAULT_FONT_KEY),
    fontSize:   Number(f.fontSize   ?? DEFAULT_SIZE),
    fontWeight: String(f.fontWeight ?? 'normal'),
  };
}

// ════════════════════════════════════════════════════════════════
// CORE — Merge signed fields into original PDF
// ════════════════════════════════════════════════════════════════

/**
 * COORDINATE SYSTEM NOTE
 * ──────────────────────
 * Browser (frontend):
 *   • Origin = TOP-LEFT corner of the page
 *   • Y increases DOWNWARD
 *   • field.y = distance from the TOP of the page to the TOP of the field
 *
 * pdf-lib:
 *   • Origin = BOTTOM-LEFT corner of the page
 *   • Y increases UPWARD
 *
 * Conversion:
 *   absY (from top)  = (yPct / 100) * PH
 *   absH             = (hPct / 100) * PH
 *   pdfBoxY          = PH - absY - absH   ← bottom-left Y in pdf-lib coords
 *
 * This places the drawn box exactly where the frontend field box is.
 */
async function mergeSignaturesIntoPDF(fileUrl, rawFields) {
  const buffer = await fetchPdfBuffer(fileUrl);
  const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const pages  = pdfDoc.getPages();

  // ── Embed all fonts once ───────────────────────────────────────
  const embeddedFonts = {};
  await Promise.all(
    Object.entries(FONT_MAP).map(async ([key, stdFont]) => {
      try {
        embeddedFonts[key] = await pdfDoc.embedFont(stdFont);
      } catch { /* skip unsupported */ }
    }),
  );

  const fields = (rawFields ?? []).map(normaliseField);

  for (const field of fields) {
    // Skip empty / placeholder values
    if (!field.value || field.value === '[SIGNED]') continue;

    const page = pages[field.page - 1];
    if (!page) continue;

    const { width: PW, height: PH } = page.getSize();

    // ── % → absolute pixels ───────────────────────────────────────
    const absX = (field.xPct / 100) * PW;
    const absY = (field.yPct / 100) * PH;   // distance from TOP
    const absW = (field.wPct / 100) * PW;
    const absH = (field.hPct / 100) * PH;

    // ── Flip Y axis ───────────────────────────────────────────────
    // pdfBoxY = bottom-left Y of the field box in pdf-lib coordinates
    const pdfBoxY = PH - absY - absH;

    // ════════════════════════════════════════════════════════════
    // SIGNATURE FIELD
    // ════════════════════════════════════════════════════════════
    if (field.type === 'signature' && field.value.startsWith('data:image')) {
      try {
        const imgBuf = dataUrlToBuffer(field.value);
        const isPng  = field.value.startsWith('data:image/png');

        /**
         * ✅ NO BlendMode.Multiply
         *    BlendMode.Multiply darkens colours — causes brown/grey artefacts
         *    on coloured PDFs and doesn't reliably remove white backgrounds.
         *
         * ✅ Use embedPng (preserves alpha channel natively in pdf-lib).
         *    The signature canvas MUST be drawn with a transparent background
         *    on the frontend (ctx.clearRect before drawing strokes).
         *    If the canvas has a white fill, the white will appear — fix it
         *    at the canvas level, not here.
         *
         * ✅ For JPEG (no alpha): drawImage with opacity:1 only.
         */
        const img = isPng
          ? await pdfDoc.embedPng(imgBuf)
          : await pdfDoc.embedJpg(imgBuf);

        // Scale to fit field box — preserve aspect ratio
        const { width: iW, height: iH } = img.size();
        const scale  = Math.min(absW / iW, absH / iH);
        const drawW  = iW * scale;
        const drawH  = iH * scale;

        // Centre image within field box
        const drawX = absX    + (absW - drawW) / 2;
        const drawY = pdfBoxY + (absH - drawH) / 2;

        page.drawImage(img, {
          x:       drawX,
          y:       drawY,
          width:   drawW,
          height:  drawH,
          opacity: 1,
          // ✅ No blendMode — let pdf-lib handle PNG alpha natively
        });
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.error(`[pdfService] Signature embed error [${field.id}]:`, err.message);
        }
      }
      continue; // done with this field
    }

    // ════════════════════════════════════════════════════════════
    // TEXT FIELD
    // ════════════════════════════════════════════════════════════
    if (field.type === 'text' && field.value.trim()) {
      try {
        const font     = resolveFont(embeddedFonts, field.fontFamily, field.fontWeight);
        const fontSize = Math.max(6, Math.min(field.fontSize, 72)); // clamp 6–72pt
        const color    = hexToRgb('#1a202c');
        const maxW     = Math.max(absW - TEXT_PADDING_X * 2, 10);

        const lines  = wrapText(field.value.trim(), font, fontSize, maxW);
        const lineH  = fontSize * LINE_HEIGHT_RATIO;
        const blockH = lines.length * lineH;

        /**
         * Vertical centre baseline:
         *   Centre of field box in pdf-lib Y = pdfBoxY + absH/2
         *   We want the TEXT BLOCK centred, so:
         *     top of block    = centre + blockH/2
         *     first baseline  = top of block - (lineH * 0.75)
         *                       (0.75 ≈ ascender ratio for standard fonts)
         *
         * ✅ NO background rectangle drawn before text
         *    This ensures ZERO white/coloured box behind text
         */
        const firstBaselineY =
          pdfBoxY + absH / 2 + blockH / 2 - lineH * 0.75;

        lines.forEach((ln, i) => {
          const lineY = firstBaselineY - i * lineH;

          // Clamp: skip lines that fall outside field box
          if (lineY < pdfBoxY - 2 || lineY > pdfBoxY + absH + 2) return;

          // Left-align with padding — looks cleaner than centring in narrow fields
          const lineX = absX + TEXT_PADDING_X;

          page.drawText(ln, {
            x:    lineX,
            y:    lineY,
            font,
            size: fontSize,
            color,
            // ✅ No backgroundColor, no border — pure transparent text overlay
          });
        });
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.error(`[pdfService] Text embed error [${field.id}]:`, err.message);
        }
      }
    }
  }

  return pdfDoc.save();
}

// ════════════════════════════════════════════════════════════════
// AUDIT CERTIFICATE PAGE
// ════════════════════════════════════════════════════════════════
async function appendAuditPage(pdfBytes, doc) {
  const pdfDoc   = await PDFDocument.load(pdfBytes);
  const helv     = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helvBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const mono     = await pdfDoc.embedFont(StandardFonts.Courier);

  const page             = pdfDoc.addPage([612, 792]); // US Letter
  const { width: W, height: H } = page.getSize();
  const M  = 48;
  const M2 = M * 2;
  let   Y  = H - M;

  // ── Colour palette ─────────────────────────────────────────────
  const C = {
    brand:   rgb(0.157, 0.671, 0.875),
    brandDk: rgb(0.118, 0.498, 0.710),
    dark:    rgb(0.102, 0.125, 0.173),
    muted:   rgb(0.392, 0.455, 0.545),
    light:   rgb(0.945, 0.961, 0.980),
    altRow:  rgb(0.980, 0.988, 1.000),
    green:   rgb(0.059, 0.600, 0.290),
    amber:   rgb(0.820, 0.459, 0.043),
    border:  rgb(0.867, 0.894, 0.929),
    white:   rgb(1.000, 1.000, 1.000),
    bgCC:    rgb(0.965, 0.980, 1.000),
    bgDisc:  rgb(0.941, 0.961, 0.996),
  };

  // ── Drawing utils ──────────────────────────────────────────────
  const rect = (x, y, w, h, color) =>
    page.drawRectangle({ x, y, width: w, height: h, color });

  const drawLine = (x1, y1, x2, y2, color = C.border, thickness = 0.5) =>
    page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness, color });

  const hLine = (y, color = C.border, thickness = 0.5) =>
    drawLine(M, y, W - M, y, color, thickness);

  const txt = (s, x, y, {
    font = helv, size = 9, color = C.dark, maxWidth = undefined,
  } = {}) => {
    if (s == null || String(s).trim() === '') return;
    const opts = { x, y, font, size, color };
    if (maxWidth !== undefined) opts.maxWidth = maxWidth;
    page.drawText(String(s), opts);
  };

  // ════════════════════════════════════════════════════════════════
  // HEADER
  // ════════════════════════════════════════════════════════════════
  rect(0, H - 80, W, 80, C.brand);
  rect(0, H - 80, W,  4, C.brandDk);

  txt('ELECTRONIC SIGNATURE CERTIFICATE', M, H - 30, {
    font: helvBold, size: 16, color: C.white,
  });
  txt('Legal Audit Trail  ·  Powered by NeXsign', M, H - 48, {
    size: 8.5, color: rgb(0.80, 0.93, 1.00),
  });
  txt(`Generated: ${new Date().toUTCString()}`, M, H - 63, {
    font: mono, size: 7, color: rgb(0.75, 0.90, 1.00),
  });

  // Check badge (top-right)
  rect(W - 90, H - 66, 42, 42, rgb(0.118, 0.498, 0.710));
  txt('✓', W - 76, H - 38, { font: helvBold, size: 22, color: C.white });

  Y = H - 100;

  // ════════════════════════════════════════════════════════════════
  // DOCUMENT INFO CARD
  // ════════════════════════════════════════════════════════════════
  const cardH = 76;
  rect(M,     Y - cardH, W - M2, cardH, C.light);
  rect(M,     Y - cardH, 4,      cardH, C.brand);
  rect(M + 4, Y - cardH, W - M2 - 4, 0.5, C.border);

  txt('DOCUMENT DETAILS', M + 14, Y - 14, {
    font: helvBold, size: 7.5, color: C.muted,
  });
  txt(doc.title || 'Untitled Document', M + 14, Y - 30, {
    font: helvBold, size: 13, color: C.dark, maxWidth: W - M2 - 110,
  });

  const metaParts = [
    `ID: ${doc._id}`,
    `Status: ${(doc.status || '').toUpperCase()}`,
    doc.companyName ? `Company: ${doc.companyName}` : null,
  ].filter(Boolean).join('   ·   ');

  txt(metaParts, M + 14, Y - 46, {
    size: 7.5, color: C.muted, maxWidth: W - M2 - 24,
  });
  txt(
    `Created: ${doc.createdAt ? new Date(doc.createdAt).toUTCString() : 'N/A'}`,
    M + 14, Y - 60,
    { size: 7.5, color: C.muted },
  );

  rect(W - M - 98, Y - 36, 96, 22, C.green);
  txt('✓  COMPLETED', W - M - 90, Y - 25, {
    font: helvBold, size: 9, color: C.white,
  });

  Y -= cardH + 18;

  // ════════════════════════════════════════════════════════════════
  // SIGNING PARTIES
  // ════════════════════════════════════════════════════════════════
  txt('SIGNING PARTIES', M, Y, { font: helvBold, size: 8.5, color: C.muted });
  hLine(Y - 8, C.brand, 1.5);
  Y -= 22;

  const parties = doc.parties || [];

  for (let i = 0; i < parties.length; i++) {
    const p      = parties[i];
    const signed = p.status === 'signed' || !!p.signedAt;
    const rowH   = signed ? 98 : 40;  // 5 detail rows × ~13px + header

    if (Y - rowH < M + 90) break; // overflow guard

    rect(M, Y - rowH, W - M2, rowH, i % 2 === 0 ? C.light : C.altRow);
    rect(M, Y - rowH, 3,      rowH, signed ? C.green : C.amber);

    // Index badge
    rect(M + 8, Y - 24, 20, 20, signed ? C.green : C.amber);
    txt(String(i + 1), M + (i + 1 < 10 ? 13 : 10), Y - 16, {
      font: helvBold, size: 9, color: C.white,
    });

    // Name + email + designation
    txt(p.name || 'Unknown', M + 36, Y - 12, {
      font: helvBold, size: 11, color: C.dark,
    });
    const subLabel = [p.email, p.designation].filter(Boolean).join('  ·  ');
    txt(subLabel, M + 36, Y - 26, { size: 7.5, color: C.muted });

    // Status badge
    rect(W - M - 82, Y - 22, 80, 18, signed ? C.green : C.amber);
    txt(signed ? '✓  SIGNED' : '⏳  PENDING', W - M - 76, Y - 14, {
      font: helvBold, size: 7.5, color: C.white,
    });

    // Detail rows (signed only)
    if (signed) {
      hLine(Y - 32, C.border, 0.4);

      const details = [
        { label: 'Signed At (UTC)', value: p.signedAt ? new Date(p.signedAt).toUTCString() : 'N/A' },
        { label: 'Local Time',      value: p.clientTime || 'N/A' },
        { label: 'IP Address',      value: p.ip          || 'N/A' },
        {
          label: 'Location',
          value: [p.address || p.location, p.postalCode].filter(Boolean).join(', ') || 'N/A',
        },
        {
          label: 'Device',
          value: p.userAgent ? p.userAgent.substring(0, 78) : 'N/A',
        },
      ];

      let dY = Y - 44;
      for (const d of details) {
        if (dY < Y - rowH + 4) break;
        txt(`${d.label}:`, M + 14, dY, { font: helvBold, size: 6.5, color: C.muted });
        txt(String(d.value), M + 112, dY, {
          font: mono, size: 6.5, color: C.dark, maxWidth: W - M2 - 122,
        });
        dY -= 13;
      }
    }

    Y -= rowH + 6;
  }

  // ════════════════════════════════════════════════════════════════
  // CC RECIPIENTS
  // ════════════════════════════════════════════════════════════════
  const cc = doc.ccList || [];
  if (cc.length > 0 && Y > M + 110) {
    Y -= 10;
    txt('CC RECIPIENTS', M, Y, { font: helvBold, size: 8.5, color: C.muted });
    hLine(Y - 8);
    Y -= 20;

    for (const r of cc) {
      if (Y < M + 82) break;
      rect(M, Y - 18, W - M2, 20, C.bgCC);
      rect(M, Y - 18, 3,      20, C.brand);

      const ccLabel = [
        r.name        || '',
        r.email       ? `<${r.email}>` : '',
        r.designation ? `[${r.designation}]` : '',
      ].filter(Boolean).join('   ');

      txt(ccLabel, M + 12, Y - 7, { size: 8, color: C.dark });
      Y -= 24;
    }
  }

  // ════════════════════════════════════════════════════════════════
  // LEGAL DISCLAIMER — anchored above footer
  // ════════════════════════════════════════════════════════════════
  const discY = M + 52;
  rect(M, discY - 10, W - M2, 52, C.bgDisc);
  rect(M, discY - 10, 3,      52, C.brand);

  txt('LEGAL VALIDITY', M + 14, discY + 30, {
    font: helvBold, size: 8, color: C.brand,
  });
  txt(
    'This certificate is an electronically generated legal record of all signature events.',
    M + 14, discY + 16,
    { size: 7.5, color: C.muted, maxWidth: W - M2 - 20 },
  );
  txt(
    'All events are timestamped and legally binding under ESIGN, eIDAS, and applicable e-signature laws.',
    M + 14, discY + 4,
    { size: 7.5, color: C.muted, maxWidth: W - M2 - 20 },
  );

  // ════════════════════════════════════════════════════════════════
  // FOOTER
  // ════════════════════════════════════════════════════════════════
  rect(0, 0,  W, 38, C.brand);
  rect(0, 36, W,  2, C.brandDk);

  txt('NeXsign  ·  Electronic Signature Platform  ·  nexsign.app', M, 23, {
    size: 8, color: C.white,
  });
  txt(`Certificate ID: ${doc._id}`, M, 10, {
    font: mono, size: 6.5, color: rgb(0.80, 0.93, 1.00),
  });
  txt('Confidential & Legally Binding', W - 206, 17, {
    font: helvBold, size: 7.5, color: C.white,
  });

  return pdfDoc.save();
}

module.exports = { mergeSignaturesIntoPDF, appendAuditPage };