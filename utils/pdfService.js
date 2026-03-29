'use strict';

const {
  PDFDocument,
  rgb,
  StandardFonts,
  degrees,
  BlendMode,
} = require('pdf-lib');
const fetch = require('node-fetch');

// ═══════════════════════════════════════════════════════════════
// BRAND
// ═══════════════════════════════════════════════════════════════
const B = {
  brand:  rgb(0.157, 0.671, 0.875),  // #28ABDF
  dark2:  rgb(0.118, 0.494, 0.682),  // #1e7fb5
  dark:   rgb(0.07,  0.09,  0.14),
  grey:   rgb(0.45,  0.48,  0.54),
  lgrey:  rgb(0.93,  0.95,  0.97),
  white:  rgb(1,     1,     1),
  green:  rgb(0.06,  0.55,  0.25),
  amber:  rgb(0.62,  0.40,  0.05),
  red:    rgb(0.72,  0.13,  0.13),
  blue:   rgb(0.18,  0.40,  0.75),
  purple: rgb(0.44,  0.20,  0.78),
  bg:     rgb(0.97,  0.98,  1.00),
};

// ═══════════════════════════════════════════════════════════════
// HELPER — fetch PDF bytes
// ═══════════════════════════════════════════════════════════════
async function fetchPdfBytes(source) {
  if (!source) throw new Error('[pdfService] No PDF source provided.');

  if (source.startsWith('http://') || source.startsWith('https://')) {
    const res = await fetch(source, { timeout: 30_000 });
    if (!res.ok)
      throw new Error(`[pdfService] Fetch failed: ${res.status}`);
    const buf = await res.buffer();
    return new Uint8Array(buf);
  }

  const fs = require('fs');
  if (!fs.existsSync(source))
    throw new Error(`[pdfService] File not found: ${source}`);
  return new Uint8Array(fs.readFileSync(source));
}

// ═══════════════════════════════════════════════════════════════
// HELPER — hex to rgb
// ═══════════════════════════════════════════════════════════════
function hexToRgb(hex = '#000000') {
  const h = hex.replace('#', '');
  return rgb(
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  );
}

// ═══════════════════════════════════════════════════════════════
// HELPER — draw rounded rectangle (simulate)
// ═══════════════════════════════════════════════════════════════
function drawCard(page, x, y, w, h, fillColor, borderColor = null) {
  page.drawRectangle({
    x, y, width: w, height: h,
    color: fillColor,
    ...(borderColor
      ? { borderColor, borderWidth: 0.6 }
      : {}),
  });
}

// ═══════════════════════════════════════════════════════════════
// HELPER — safe draw text (never throws)
// ═══════════════════════════════════════════════════════════════
function safeText(page, text, x, y, opts = {}) {
  try {
    if (text === null || text === undefined) return;
    const str = String(text);
    if (!str.trim()) return;
    page.drawText(str, { x, y, ...opts });
  } catch (_) {}
}

// ═══════════════════════════════════════════════════════════════
// HELPER — horizontal rule
// ═══════════════════════════════════════════════════════════════
function hRule(page, y, x1, x2, color = B.lgrey, thickness = 0.5) {
  page.drawLine({
    start: { x: x1, y },
    end:   { x: x2, y },
    thickness,
    color,
  });
}

// ═══════════════════════════════════════════════════════════════
// HELPER — section label
// ═══════════════════════════════════════════════════════════════
function sectionLabel(page, text, x, y, fontBold) {
  safeText(page, text, x, y, {
    font: fontBold, size: 8,
    color: B.grey,
  });
  return y - 6;
}

// ═══════════════════════════════════════════════════════════════
// EXPORT 1 — mergeSignaturesIntoPDF
// Embeds field values (signature / text / date / checkbox)
// Returns Uint8Array
// ═══════════════════════════════════════════════════════════════
async function mergeSignaturesIntoPDF(pdfSource, fields = []) {
  const originalBytes = await fetchPdfBytes(pdfSource);

  const pdfDoc = await PDFDocument.load(originalBytes, {
    ignoreEncryption: true,
    updateMetadata:   false,
  });

  const fontReg  = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages    = pdfDoc.getPages();

  for (const rawField of fields) {
    const field =
      typeof rawField === 'string' ? JSON.parse(rawField) : rawField;

    if (!field.value && field.value !== false) continue;
    if (typeof field.value === 'string' && !field.value.trim()) continue;
    if (field.value === '[SIGNED]') continue;

    const pageIndex = Math.max(0, (field.page || 1) - 1);
    if (pageIndex >= pages.length) continue;

    const page                      = pages[pageIndex];
    const { width: pw, height: ph } = page.getSize();

    // % → absolute PDF coords
    // PDF origin = bottom-left; fields origin = top-left
    const absX = (field.x      / 100) * pw;
    const absW = (field.width  / 100) * pw;
    const absH = (field.height / 100) * ph;
    const absY = ph - ((field.y / 100) * ph) - absH;

    try {
      switch (field.type) {

        // ── Signature ────────────────────────────────────────────
        case 'signature':
        case 'initials': {
          const raw = String(field.value || '');
          if (!raw.startsWith('data:image/')) break;

          const b64Parts = raw.split(',');
          if (b64Parts.length < 2) break;

          const imgBytes = Buffer.from(b64Parts[1], 'base64');
          let img;

          try {
            img = raw.includes('image/png')
              ? await pdfDoc.embedPng(imgBytes)
              : await pdfDoc.embedJpg(imgBytes);
          } catch {
            try { img = await pdfDoc.embedPng(imgBytes); }
            catch { break; }
          }

          const dims = img.scaleToFit(absW - 4, absH - 4);
          page.drawImage(img, {
            x:      absX + (absW - dims.width)  / 2,
            y:      absY + (absH - dims.height) / 2,
            width:  dims.width,
            height: dims.height,
            blendMode: BlendMode.Multiply, // white → transparent
          });
          break;
        }

        // ── Text ─────────────────────────────────────────────────
        case 'text': {
          const isBold   = field.fontWeight === 'bold';
          const font     = isBold ? fontBold : fontReg;
          const fontSize = Math.min(
            field.fontSize || 12,
            Math.max(8, absH * 0.6),
          );
          let text = String(field.value);
          // Truncate to fit
          while (
            text.length > 1 &&
            font.widthOfTextAtSize(text, fontSize) > absW - 8
          ) text = text.slice(0, -1);

          page.drawText(text, {
            x:        absX + 4,
            y:        absY + (absH - fontSize) / 2 + 2,
            size:     fontSize,
            font,
            color:    rgb(0.1, 0.1, 0.1),
            maxWidth: absW - 8,
          });
          break;
        }

        // ── Date ─────────────────────────────────────────────────
        case 'date': {
          const fontSize = Math.min(12, Math.max(8, absH * 0.45));
          page.drawText(String(field.value), {
            x:    absX + 4,
            y:    absY + (absH - fontSize) / 2 + 2,
            size: fontSize,
            font: fontReg,
            color: rgb(0.1, 0.1, 0.1),
          });
          break;
        }

        // ── Checkbox ─────────────────────────────────────────────
        case 'checkbox': {
          if (String(field.value) !== 'true') break;
          const cx = absX + absW / 2;
          const cy = absY + absH / 2;
          const s  = Math.min(absW, absH) * 0.35;
          page.drawLine({
            start:     { x: cx - s,       y: cy },
            end:       { x: cx - s * 0.2, y: cy - s * 0.65 },
            thickness: 2,
            color:     rgb(0.05, 0.55, 0.2),
          });
          page.drawLine({
            start:     { x: cx - s * 0.2, y: cy - s * 0.65 },
            end:       { x: cx + s,        y: cy + s * 0.55 },
            thickness: 2,
            color:     rgb(0.05, 0.55, 0.2),
          });
          break;
        }

        default: break;
      }
    } catch (e) {
      console.error(`[pdfService] Field "${field.id}" error:`, e.message);
    }
  }

  // EXECUTED watermark
  for (const page of pages) {
    const { width: pw, height: ph } = page.getSize();
    page.drawText('EXECUTED', {
      x:       pw * 0.08,
      y:       ph * 0.46,
      size:    72,
      font:    fontBold,
      color:   rgb(0.85, 0.93, 0.97),
      opacity: 0.12,
      rotate:  degrees(34),
    });
  }

  return pdfDoc.save({ useObjectStreams: false });
}

// ═══════════════════════════════════════════════════════════════
// EXPORT 2 — embedBossSignature
// Embeds Boss signature as permanent transparent PNG layer
// Returns Uint8Array (the "approved master PDF")
// ═══════════════════════════════════════════════════════════════
async function embedBossSignature(pdfSource, bossFields = []) {
  const bytes  = await fetchPdfBytes(pdfSource);
  const pdfDoc = await PDFDocument.load(bytes, {
    ignoreEncryption: true,
    updateMetadata:   false,
  });

  const pages = pdfDoc.getPages();

  for (const field of bossFields) {
    if (field.type !== 'signature') continue;
    if (!field.value || !String(field.value).startsWith('data:image/')) continue;

    const pageIndex = Math.max(0, (field.page || 1) - 1);
    if (pageIndex >= pages.length) continue;

    const page                      = pages[pageIndex];
    const { width: pw, height: ph } = page.getSize();

    const absX = (field.x      / 100) * pw;
    const absW = (field.width  / 100) * pw;
    const absH = (field.height / 100) * ph;
    const absY = ph - ((field.y / 100) * ph) - absH;

    try {
      const b64    = field.value.split(',')[1];
      const imgBuf = Buffer.from(b64, 'base64');
      const img    = await pdfDoc.embedPng(imgBuf);
      const dims   = img.scaleToFit(absW - 4, absH - 4);

      page.drawImage(img, {
        x:         absX + (absW - dims.width)  / 2,
        y:         absY + (absH - dims.height) / 2,
        width:     dims.width,
        height:    dims.height,
        blendMode: BlendMode.Multiply,
      });
    } catch (e) {
      console.error('[pdfService] Boss signature embed error:', e.message);
    }
  }

  return pdfDoc.save({ useObjectStreams: false });
}

// ═══════════════════════════════════════════════════════════════
// EXPORT 3 — appendAuditPage
// Full professional audit certificate page
// Supports: device name, location, postal code, CC with designation
// Returns Buffer
// ═══════════════════════════════════════════════════════════════
async function appendAuditPage(pdfBytes, doc) {
  const pdfDoc = await PDFDocument.load(pdfBytes, {
    ignoreEncryption: true,
    updateMetadata:   false,
  });

  const fontReg  = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontMono = await pdfDoc.embedFont(StandardFonts.Courier);

  _buildAuditPage(pdfDoc, fontReg, fontBold, fontMono, doc);

  const finalBytes = await pdfDoc.save({ useObjectStreams: false });
  return Buffer.from(finalBytes);
}

// ═══════════════════════════════════════════════════════════════
// INTERNAL — build full audit page
// ═══════════════════════════════════════════════════════════════
function _buildAuditPage(pdfDoc, fontReg, fontBold, fontMono, doc) {
  const PW = 612;
  const PH = 792;
  const M  = 44;
  const CW = PW - M * 2;

  let page    = pdfDoc.addPage([PW, PH]);
  let Y       = PH;

  // ── Header ──────────────────────────────────────────────────
  // Gradient-like: draw two rects
  page.drawRectangle({
    x: 0, y: PH - 90, width: PW, height: 90,
    color: B.brand,
  });
  page.drawRectangle({
    x: 0, y: PH - 90, width: PW, height: 4,
    color: B.dark2,
  });

  safeText(page, 'CERTIFICATE OF COMPLETION', M, PH - 26, {
    font: fontBold, size: 14, color: B.white,
  });
  safeText(page, 'Electronic Signature Audit Trail  ·  NeXsign', M, PH - 44, {
    font: fontReg, size: 9.5, color: rgb(0.82, 0.95, 1),
  });
  safeText(
    page,
    `Generated: ${new Date().toUTCString()}`,
    M, PH - 60,
    { font: fontMono, size: 7.5, color: rgb(0.75, 0.92, 1) },
  );

  // Checkmark circle top-right
  page.drawCircle({
    x: PW - 58, y: PH - 45, size: 26, color: rgb(1, 1, 1, 0.15),
  });
  safeText(page, '✓', PW - 68, PH - 38, {
    font: fontBold, size: 22, color: B.white,
  });

  Y = PH - 108;

  // ── Document Info Card ───────────────────────────────────────
  const infoRows = [
    ['Document',    doc.title       || 'Untitled Document'],
    ['Document ID', String(doc._id  || '')],
    ['Company',     doc.companyName || '—'],
    ['Status',      (doc.status || 'completed').toUpperCase()],
    ['Completed',   doc.completedAt
      ? new Date(doc.completedAt).toUTCString()
      : new Date().toUTCString()],
    ['Total Parties', String((doc.parties || []).length)],
  ];

  const infoH = infoRows.length * 17 + 20;
  drawCard(page, M, Y - infoH, CW, infoH, B.bg, B.lgrey);
  // Left accent
  page.drawRectangle({ x: M, y: Y - infoH, width: 4, height: infoH, color: B.brand });

  safeText(page, 'DOCUMENT DETAILS', M + 12, Y - 13, {
    font: fontBold, size: 7.5, color: B.brand,
  });

  let iy = Y - 28;
  for (const [label, value] of infoRows) {
    const lw = fontBold.widthOfTextAtSize(`${label}:  `, 8.5);
    safeText(page, `${label}:`, M + 12, iy, {
      font: fontBold, size: 8.5, color: B.grey,
    });
    safeText(page, value, M + 12 + lw, iy, {
      font: fontReg, size: 8.5, color: B.dark,
      maxWidth: CW - lw - 20,
    });
    iy -= 17;
  }

  // COMPLETED badge
  page.drawRectangle({
    x: PW - M - 88, y: Y - 26, width: 86, height: 18,
    color: B.green,
  });
  safeText(page, '✓  COMPLETED', PW - M - 82, Y - 18, {
    font: fontBold, size: 8, color: B.white,
  });

  Y -= infoH + 18;

  // ── Signing Parties ──────────────────────────────────────────
  safeText(page, 'SIGNING PARTIES', M, Y, {
    font: fontBold, size: 9, color: B.grey,
  });
  Y -= 8;
  hRule(page, Y, M, M + CW, B.brand, 1.5);
  Y -= 16;

  const parties = doc.parties || [];

  for (let i = 0; i < parties.length; i++) {
    const p      = parties[i];
    const signed = p.status === 'signed' || !!p.signedAt;

    // Calculate row height based on available info
    const hasDevice   = !!(p.device || p.browser || p.os);
    const hasLocation = !!(p.city || p.region || p.postalCode);
    const hasIp       = !!p.ipAddress;
    const hasTime     = !!(p.localSignedTime || p.signedAt);

    let extraLines = 0;
    if (signed) {
      if (hasDevice)   extraLines++;
      if (hasLocation) extraLines++;
      if (hasIp)       extraLines++;
      if (hasTime)     extraLines++;
    }
    const rowH = signed ? 52 + extraLines * 14 : 42;

    // New page if needed
    if (Y - rowH < M + 100) {
      _auditFooter(page, fontReg, fontMono, PW, M);
      page = pdfDoc.addPage([PW, PH]);
      Y    = PH - M;
      safeText(page, 'SIGNING PARTIES (continued)', M, Y, {
        font: fontBold, size: 10, color: B.brand,
      });
      Y -= 20;
    }

    // Row background
    drawCard(
      page,
      M, Y - rowH,
      CW, rowH,
      i % 2 === 0 ? B.bg : rgb(0.99, 1, 1),
      B.lgrey,
    );

    // Left color accent
    page.drawRectangle({
      x: M, y: Y - rowH,
      width: 4, height: rowH,
      color: signed ? B.green : B.amber,
    });

    // Party number circle
    page.drawCircle({
      x: M + 18, y: Y - 16, size: 10,
      color: signed ? B.green : B.amber,
    });
    safeText(page, String(i + 1), M + (i < 9 ? 15 : 12), Y - 20, {
      font: fontBold, size: 8, color: B.white,
    });

    // Name + designation + email
    safeText(page, p.name || 'Unknown', M + 34, Y - 12, {
      font: fontBold, size: 10, color: B.dark,
    });
    if (p.designation) {
      safeText(page, `🏷 ${p.designation}`, M + 34, Y - 24, {
        font: fontReg, size: 8, color: B.grey,
      });
    }
    safeText(page, p.email || '', M + 34, Y - (p.designation ? 36 : 24), {
      font: fontReg, size: 8, color: B.grey,
    });

    // Status badge
    const badgeColor = signed ? B.green : B.amber;
    page.drawRectangle({
      x: PW - M - 78, y: Y - 20,
      width: 76, height: 14,
      color: badgeColor,
    });
    safeText(
      page,
      signed ? '✓  SIGNED' : '⏳  PENDING',
      PW - M - 72, Y - 14,
      { font: fontBold, size: 7.5, color: B.white },
    );

    if (signed) {
      hRule(page, Y - 38, M + 10, M + CW - 10, B.lgrey, 0.4);

      let detY = Y - 50;

      // ── Signed At ────────────────────────────────────────
      if (hasTime) {
        const timeStr = p.localSignedTime
          ? `${p.localSignedTime}  (${
              p.signedAt
                ? new Date(p.signedAt).toUTCString()
                : ''
            })`
          : new Date(p.signedAt).toUTCString();

        _detailRow(page, fontBold, fontMono, M, detY, CW,
          '🕐 Signed At', timeStr);
        detY -= 14;
      }

      // ── Device (iPhone 6, Samsung Galaxy S23) ────────────
      if (hasDevice) {
        const devStr = [p.device, p.browser, p.os]
          .filter(Boolean).join('  ·  ');
        _detailRow(page, fontBold, fontMono, M, detY, CW,
          '📱 Device', devStr);
        detY -= 14;
      }

      // ── Location (Rajshahi, BD - 6400) ───────────────────
      if (hasLocation) {
        const locParts = [
          p.city,
          p.region,
          p.country || p.countryCode,
        ].filter(Boolean).join(', ');
        const locStr = p.postalCode
          ? `${locParts}  —  ${p.postalCode}`
          : locParts;
        _detailRow(page, fontBold, fontMono, M, detY, CW,
          '📍 Location', locStr);
        detY -= 14;
      }

      // ── IP Address ────────────────────────────────────────
      if (hasIp) {
        _detailRow(page, fontBold, fontMono, M, detY, CW,
          '🌐 IP Address', p.ipAddress);
        detY -= 14;
      }
    }

    Y -= rowH + 8;
  }

  // ── CC Recipients ────────────────────────────────────────────
  const ccList = doc.ccList || [];
  if (ccList.length > 0 && Y > M + 80) {
    Y -= 8;
    safeText(page, 'CC RECIPIENTS', M, Y, {
      font: fontBold, size: 9, color: B.grey,
    });
    Y -= 8;
    hRule(page, Y, M, M + CW, B.lgrey, 1);
    Y -= 14;

    for (const cc of ccList) {
      if (Y < M + 60) break;

      drawCard(page, M, Y - 20, CW, 22, rgb(0.96, 0.98, 1), B.lgrey);
      page.drawRectangle({
        x: M, y: Y - 20, width: 3, height: 22, color: B.blue,
      });

      // Name + designation + email in one row
      const nameStr = cc.name || cc.email || '—';
      const desgStr = cc.designation ? ` · ${cc.designation}` : '';
      safeText(page, `${nameStr}${desgStr}`, M + 10, Y - 7, {
        font: fontBold, size: 9, color: B.dark,
        maxWidth: CW / 2,
      });
      safeText(page, cc.email || '', M + CW / 2, Y - 7, {
        font: fontMono, size: 8, color: B.grey,
        maxWidth: CW / 2 - 10,
      });
      if (cc.notifiedAt) {
        safeText(
          page,
          `Notified: ${new Date(cc.notifiedAt).toUTCString()}`,
          M + 10, Y - 16,
          { font: fontReg, size: 7, color: B.grey },
        );
      }

      Y -= 26;
    }
  }

  // ── Legal Disclaimer ─────────────────────────────────────────
  if (Y > M + 70) {
    Y -= 10;
    const discH = 48;
    drawCard(page, M, Y - discH, CW, discH, rgb(0.94, 0.97, 1), B.lgrey);
    page.drawRectangle({
      x: M, y: Y - discH, width: 4, height: discH, color: B.brand,
    });

    safeText(page, 'LEGAL VALIDITY', M + 12, Y - 13, {
      font: fontBold, size: 8, color: B.brand,
    });
    safeText(
      page,
      'This certificate is an electronically generated legal record of all signature events.',
      M + 12, Y - 26,
      { font: fontReg, size: 7.5, color: B.grey, maxWidth: CW - 24 },
    );
    safeText(
      page,
      'All events are timestamped and tamper-evident. Legally binding under ESIGN, eIDAS, and applicable laws.',
      M + 12, Y - 38,
      { font: fontReg, size: 7.5, color: B.grey, maxWidth: CW - 24 },
    );
  }

  // Footer
  _auditFooter(page, fontReg, fontMono, PW, M);
}

// ── Detail Row Helper ─────────────────────────────────────────
function _detailRow(page, fontBold, fontMono, M, y, CW, label, value) {
  const lw = fontBold.widthOfTextAtSize(`${label}:  `, 7.5);
  safeText(page, `${label}:`, M + 14, y, {
    font: fontBold, size: 7.5, color: B.grey,
  });
  safeText(page, String(value || 'N/A'), M + 14 + lw, y, {
    font: fontMono, size: 7.5, color: B.dark,
    maxWidth: CW - lw - 24,
  });
}

// ── Audit Page Footer ─────────────────────────────────────────
function _auditFooter(page, fontReg, fontMono, PW, M) {
  // Footer band
  page.drawRectangle({ x: 0, y: 0, width: PW, height: 36, color: B.brand });
  safeText(
    page,
    'NeXsign  ·  Enterprise E-Signature Platform  ·  nexsign.app',
    M, 22,
    { font: fontReg, size: 8, color: B.white },
  );
  safeText(
    page,
    `Confidential & Legally Binding  ·  ${new Date().toUTCString()}`,
    M, 10,
    { font: fontMono, size: 7, color: rgb(0.82, 0.95, 1) },
  );
}

// ═══════════════════════════════════════════════════════════════
// EXPORT 4 — generateEmployeePdf
// Clone of approved master PDF for each employee
// Boss sign already embedded, only employee fields added
// Returns Buffer
// ═══════════════════════════════════════════════════════════════
async function generateEmployeePdf(approvedPdfSource, employeeFields = [], sessionDoc) {
  // approvedPdfSource = Boss signed PDF (Uint8Array or URL)
  const bytes = typeof approvedPdfSource === 'string'
    ? await fetchPdfBytes(approvedPdfSource)
    : approvedPdfSource;

  // Embed employee fields
  const withFields = await mergeSignaturesIntoPDF(
    'data:application/pdf;base64,' +
      Buffer.from(bytes).toString('base64'),
    employeeFields,
  );

  // Append audit page with ONLY Boss + This Employee
  const withAudit = await appendAuditPage(withFields, sessionDoc);

  return withAudit;
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════
module.exports = {
  mergeSignaturesIntoPDF,
  embedBossSignature,
  appendAuditPage,
  generateEmployeePdf,
  fetchPdfBytes,
};