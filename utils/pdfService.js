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
// backend/utils/pdfService.js

'use strict';

const { PDFDocument, rgb, StandardFonts, degrees } = require('pdf-lib');
const fs   = require('fs');
const path = require('path');

/**
 * Embed signatures + append audit-log page → return Buffer
 *
 * @param {string} originalPdfPath
 * @param {Array}  fields          – field objects with .value already set
 * @param {Array}  auditLogs       – AuditLog documents (plain objects)
 * @param {Object} docMeta         – { title, documentId, completedAt }
 * @returns {Promise<Buffer>}
 */
async function embedSignaturesAndAuditLog(
  originalPdfPath,
  fields = [],
  auditLogs = [],
  docMeta = {}
) {
  // ── Guard ──────────────────────────────────────────────────────────────────
  if (!originalPdfPath || !fs.existsSync(originalPdfPath)) {
    throw new Error(`[pdfService] Original PDF not found: ${originalPdfPath}`);
  }

  const originalBytes = fs.readFileSync(originalPdfPath);
  const pdfDoc = await PDFDocument.load(originalBytes, {
    ignoreEncryption: true,
    updateMetadata:   false,
  });

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold    = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages       = pdfDoc.getPages();

  // ── STEP 1 : Embed field values ────────────────────────────────────────────
  for (const field of fields) {
    if (!field.value && field.value !== false) continue;

    const pageIndex = Math.max(0, (field.page || 1) - 1);
    if (pageIndex >= pages.length) continue;

    const page                    = pages[pageIndex];
    const { width: pw, height: ph } = page.getSize();

    // Convert relative (0-1) coords → absolute PDF coords
    // PDF origin is BOTTOM-LEFT; our frontend origin is TOP-LEFT
    const absX = (field.x      || 0) * pw;
    const absW = (field.width  || 0.2) * pw;
    const absH = (field.height || 0.06) * ph;
    // Flip Y: PDF y = pageHeight - fieldTop - fieldHeight
    const absY = ph - ((field.y || 0) * ph) - absH;

    try {
      switch (field.type) {

        // ── Signature / Initials ─────────────────────────────────────────────
        case 'signature':
        case 'initials': {
          const raw = String(field.value || '');
          if (!raw.startsWith('data:image/png;base64,')) break;

          const b64      = raw.replace('data:image/png;base64,', '');
          const imgBytes = Buffer.from(b64, 'base64');
          const png      = await pdfDoc.embedPng(imgBytes);
          const dims     = png.scaleToFit(absW - 4, absH - 4);

          // Center image inside field box
          page.drawImage(png, {
            x:      absX + (absW - dims.width)  / 2,
            y:      absY + (absH - dims.height) / 2,
            width:  dims.width,
            height: dims.height,
          });

          // Underline
          page.drawLine({
            start:     { x: absX,        y: absY },
            end:       { x: absX + absW, y: absY },
            thickness: 0.8,
            color:     rgb(0.6, 0.6, 0.6),
          });
          break;
        }

        // ── Text ─────────────────────────────────────────────────────────────
        case 'text': {
          const fontSize = Math.min(13, Math.max(8, absH * 0.5));
          let   text     = String(field.value);

          // Truncate to fit width
          while (
            text.length > 1 &&
            fontRegular.widthOfTextAtSize(text, fontSize) > absW - 4
          ) text = text.slice(0, -1);

          page.drawText(text, {
            x:        absX + 2,
            y:        absY + (absH - fontSize) / 2,
            size:     fontSize,
            font:     fontRegular,
            color:    rgb(0.05, 0.05, 0.1),
            maxWidth: absW - 4,
          });
          break;
        }

        // ── Date ─────────────────────────────────────────────────────────────
        case 'date': {
          const fontSize = Math.min(12, Math.max(8, absH * 0.45));
          page.drawText(String(field.value), {
            x:    absX + 2,
            y:    absY + (absH - fontSize) / 2,
            size: fontSize,
            font: fontRegular,
            color: rgb(0.1, 0.1, 0.2),
          });
          break;
        }

        // ── Checkbox ─────────────────────────────────────────────────────────
        case 'checkbox': {
          if (String(field.value) !== 'true') break;
          const cx = absX + absW / 2;
          const cy = absY + absH / 2;
          const s  = Math.min(absW, absH) * 0.35;

          // Draw ✓
          page.drawLine({
            start:     { x: cx - s,        y: cy },
            end:       { x: cx - s * 0.2,  y: cy - s * 0.65 },
            thickness: 2,
            color:     rgb(0.05, 0.55, 0.2),
          });
          page.drawLine({
            start:     { x: cx - s * 0.2,  y: cy - s * 0.65 },
            end:       { x: cx + s,         y: cy + s * 0.55 },
            thickness: 2,
            color:     rgb(0.05, 0.55, 0.2),
          });
          break;
        }

        default: break;
      }
    } catch (fieldErr) {
      // Never let one bad field kill the whole PDF
      console.error(`[pdfService] Field "${field.id}" embed failed:`, fieldErr.message);
    }
  }

  // ── STEP 2 : Watermark every page ─────────────────────────────────────────
  for (const page of pages) {
    const { width: pw, height: ph } = page.getSize();
    page.drawText('EXECUTED', {
      x:       pw * 0.08,
      y:       ph * 0.48,
      size:    72,
      font:    fontBold,
      color:   rgb(0.85, 0.93, 0.97),
      opacity: 0.13,
      rotate:  degrees(34),
    });
  }

  // ── STEP 3 : Audit-log page ────────────────────────────────────────────────
  _appendAuditPage(pdfDoc, fontRegular, fontBold, auditLogs, docMeta);

  const finalBytes = await pdfDoc.save({ useObjectStreams: false });
  return Buffer.from(finalBytes);
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal: build audit-log page(s)
// ─────────────────────────────────────────────────────────────────────────────
function _appendAuditPage(pdfDoc, fontReg, fontBold, auditLogs, docMeta) {
  const PAGE_W  = 612;
  const PAGE_H  = 792;
  const MARGIN  = 48;
  const COL_W   = PAGE_W - MARGIN * 2;

  // Brand colour
  const BRAND   = rgb(0.157, 0.671, 0.875);   // #28ABDF
  const DARK    = rgb(0.07, 0.09, 0.14);
  const GREY    = rgb(0.45, 0.48, 0.54);
  const LGREY   = rgb(0.86, 0.89, 0.93);
  const WHITE   = rgb(1, 1, 1);
  const GREEN   = rgb(0.06, 0.55, 0.25);
  const RED     = rgb(0.72, 0.13, 0.13);
  const AMBER   = rgb(0.62, 0.40, 0.05);

  const actionColor = (action) => ({
    signed:    GREEN,
    completed: GREEN,
    sent:      BRAND,
    opened:    rgb(0.28, 0.42, 0.72),
    created:   GREY,
    cancelled: RED,
    expired:   AMBER,
    draft_saved: GREY,
  }[action] || GREY);

  let page    = pdfDoc.addPage([PAGE_W, PAGE_H]);
  let cursorY = PAGE_H;

  // ── Header band ────────────────────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: PAGE_H - 80, width: PAGE_W, height: 80, color: BRAND });
  page.drawText('Certificate of Completion', {
    x: MARGIN, y: PAGE_H - 34,
    size: 20, font: fontBold, color: WHITE,
  });
  page.drawText('Electronic Signature Audit Trail  •  SignFlow', {
    x: MARGIN, y: PAGE_H - 56,
    size: 10, font: fontReg, color: rgb(0.88, 0.96, 1),
  });

  cursorY = PAGE_H - 100;

  // ── Document metadata box ──────────────────────────────────────────────────
  const metaRows = [
    ['Document',    docMeta.title       || 'N/A'],
    ['Document ID', String(docMeta.documentId || '')],
    ['Completed',   docMeta.completedAt
      ? new Date(docMeta.completedAt).toUTCString()
      : new Date().toUTCString()],
    ['Signers',     String(auditLogs.filter(l => l.action === 'signed').length)],
  ];

  const BOX_H = metaRows.length * 18 + 16;
  page.drawRectangle({
    x: MARGIN, y: cursorY - BOX_H,
    width: COL_W, height: BOX_H,
    color:       rgb(0.96, 0.98, 1),
    borderColor: LGREY,
    borderWidth: 0.8,
  });

  let metaY = cursorY - 14;
  for (const [label, value] of metaRows) {
    const lw = fontBold.widthOfTextAtSize(`${label}: `, 9);
    page.drawText(`${label}: `, { x: MARGIN + 10, y: metaY, size: 9, font: fontBold, color: GREY });
    page.drawText(value, {
      x: MARGIN + 10 + lw, y: metaY,
      size: 9, font: fontReg, color: DARK,
      maxWidth: COL_W - 20 - lw,
    });
    metaY -= 18;
  }

  cursorY -= BOX_H + 20;

  // ── Section title ──────────────────────────────────────────────────────────
  page.drawText('AUDIT TRAIL', {
    x: MARGIN, y: cursorY,
    size: 10, font: fontBold, color: BRAND,
  });
  cursorY -= 8;
  page.drawLine({
    start: { x: MARGIN, y: cursorY }, end: { x: MARGIN + COL_W, y: cursorY },
    thickness: 1.5, color: BRAND,
  });
  cursorY -= 16;

  // ── Log rows ───────────────────────────────────────────────────────────────
  const ROW_MIN_H = 52; // minimum height per log row

  for (const log of auditLogs) {
    // Start new page if needed
    if (cursorY < MARGIN + ROW_MIN_H + 30) {
      // Footer on current page
      _drawFooter(page, fontReg, PAGE_W, MARGIN);
      page    = pdfDoc.addPage([PAGE_W, PAGE_H]);
      cursorY = PAGE_H - MARGIN;
      page.drawText('Audit Trail (continued)', {
        x: MARGIN, y: cursorY,
        size: 11, font: fontBold, color: BRAND,
      });
      cursorY -= 20;
    }

    const color     = actionColor(log.action);
    const action    = (log.action || '').toUpperCase();
    const ts        = log.timestamp ? new Date(log.timestamp).toUTCString() : '';
    const actor     = log.performed_by?.email || log.performed_by?.name || 'System';
    const details   = log.details   || '';
    const ip        = log.ip_address ? `IP: ${log.ip_address}` : '';
    const loc       = log.location  ? `  •  ${log.location}` : '';

    const BADGE_W = 66;
    const BADGE_H = 14;
    const ROW_TOP = cursorY;

    // Action badge
    page.drawRectangle({
      x: MARGIN, y: ROW_TOP - BADGE_H - 2,
      width: BADGE_W, height: BADGE_H,
      color, borderRadius: 2,
    });
    page.drawText(action, {
      x: MARGIN + 4, y: ROW_TOP - BADGE_H + 2,
      size: 7, font: fontBold, color: WHITE,
      maxWidth: BADGE_W - 6,
    });

    // Timestamp (right-aligned)
    const tsW = fontReg.widthOfTextAtSize(ts, 8);
    page.drawText(ts, {
      x: MARGIN + COL_W - tsW, y: ROW_TOP,
      size: 8, font: fontReg, color: GREY,
    });

    // Actor
    page.drawText(actor, {
      x: MARGIN + BADGE_W + 8, y: ROW_TOP,
      size: 9, font: fontBold, color: DARK,
      maxWidth: COL_W - BADGE_W - 8 - tsW - 4,
    });

    let lineY = ROW_TOP - 14;

    // Details
    if (details) {
      page.drawText(details, {
        x: MARGIN + BADGE_W + 8, y: lineY,
        size: 8, font: fontReg, color: GREY,
        maxWidth: COL_W - BADGE_W - 8,
      });
      lineY -= 12;
    }

    // IP + Location
    if (ip || loc) {
      page.drawText(`${ip}${loc}`, {
        x: MARGIN + BADGE_W + 8, y: lineY,
        size: 7.5, font: fontReg, color: rgb(0.6, 0.62, 0.67),
        maxWidth: COL_W - BADGE_W - 8,
      });
      lineY -= 12;
    }

    cursorY = lineY - 4;

    // Separator line
    page.drawLine({
      start: { x: MARGIN, y: cursorY },
      end:   { x: MARGIN + COL_W, y: cursorY },
      thickness: 0.25, color: LGREY,
    });
    cursorY -= 8;
  }

  _drawFooter(page, fontReg, PAGE_W, MARGIN);
}

function _drawFooter(page, fontReg, pageW, margin) {
  const txt = `Generated by SignFlow  •  ${new Date().toUTCString()}  •  This certificate is tamper-evident.`;
  const tw  = fontReg.widthOfTextAtSize(txt, 7);
  page.drawText(txt, {
    x:    (pageW - tw) / 2,
    y:    margin - 24,
    size: 7,
    font: fontReg,
    color: rgb(0.62, 0.65, 0.70),
  });
}

module.exports = { embedSignaturesAndAuditLog };