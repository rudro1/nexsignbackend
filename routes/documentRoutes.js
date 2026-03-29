'use strict';

const express            = require('express');
const router             = express.Router();
const multer             = require('multer');
const crypto             = require('crypto');
const { v2: cloudinary } = require('cloudinary');

const Document = require('../models/Document');
const AuditLog = require('../models/AuditLog');
const { auth } = require('../middleware/auth');

const {
  sendSigningEmail,
  sendCompletionEmail,
  sendCCEmail,
} = require('../utils/emailService');

const {
  mergeSignaturesIntoPDF,
  appendAuditPage,
} = require('../utils/pdfService');

// ═══════════════════════════════════════════════════════════════
// CLOUDINARY
// ═══════════════════════════════════════════════════════════════
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary config check
function checkCloudinary() {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY    ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new Error(
      'Cloudinary is not configured. Check environment variables.'
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// MULTER — PDF only
// ═══════════════════════════════════════════════════════════════
const pdfUpload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'), false);
  },
});

// ═══════════════════════════════════════════════════════════════
// MULTER — Image only (logos)
// ═══════════════════════════════════════════════════════════════
const logoUpload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  },
});

// ═══════════════════════════════════════════════════════════════
// MULTER ERROR HANDLER
// ═══════════════════════════════════════════════════════════════
function handleMulterError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Max: 15MB for PDF, 5MB for logo.',
      });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
const FRONT = () =>
  (process.env.FRONTEND_URL || 'https://nexsignfrontend.vercel.app')
    .replace(/\/$/, '');

async function uploadToCloudinary(buffer, options = {}) {
  checkCloudinary();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      options,
      (err, result) => (err ? reject(err) : resolve(result)),
    );
    stream.end(buffer);
  });
}

function getIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.ip ||
    'Unknown'
  );
}

function parseDevice(ua = '') {
  let device = 'Unknown Device', browser = 'Unknown Browser',
      os = 'Unknown OS', deviceType = 'desktop';

  if (/iPhone/.test(ua)) {
    const m = ua.match(/iPhone\s?OS\s?([\d_]+)/i);
    device = 'iPhone';
    os = m ? `iOS ${m[1].replace(/_/g, '.')}` : 'iOS';
    deviceType = 'mobile';
  } else if (/iPad/.test(ua)) {
    device = 'iPad'; os = 'iPadOS'; deviceType = 'tablet';
  } else if (/Android/.test(ua)) {
    const model = ua.match(/Android[^;]*;\s*([^)]+)\)/)?.[1]?.trim();
    device = model || 'Android Device';
    const ver = ua.match(/Android\s([\d.]+)/)?.[1];
    os = ver ? `Android ${ver}` : 'Android';
    deviceType = /Mobile/.test(ua) ? 'mobile' : 'tablet';
  } else if (/Windows/.test(ua)) {
    device = 'Windows PC';
    const ver = ua.match(/Windows NT ([\d.]+)/)?.[1];
    const wm  = { '10.0': '10/11', '6.3': '8.1', '6.2': '8', '6.1': '7' };
    os = `Windows ${wm[ver] || ver || ''}`.trim();
  } else if (/Macintosh|Mac OS X/.test(ua)) {
    device = 'Mac';
    const ver = ua.match(/Mac OS X ([\d_]+)/)?.[1];
    os = ver ? `macOS ${ver.replace(/_/g, '.')}` : 'macOS';
  } else if (/Linux/.test(ua)) {
    device = 'Linux PC'; os = 'Linux';
  }

  if      (/Edg\//.test(ua))     browser = `Edge ${ua.match(/Edg\/([\d.]+)/)?.[1]      || ''}`.trim();
  else if (/OPR\//.test(ua))     browser = `Opera ${ua.match(/OPR\/([\d.]+)/)?.[1]     || ''}`.trim();
  else if (/Chrome\//.test(ua))  browser = `Chrome ${ua.match(/Chrome\/([\d.]+)/)?.[1] || ''}`.trim();
  else if (/Firefox\//.test(ua)) browser = `Firefox ${ua.match(/Firefox\/([\d.]+)/)?.[1]||''}`.trim();
  else if (/Safari\//.test(ua))  browser = `Safari ${ua.match(/Version\/([\d.]+)/)?.[1] ||''}`.trim();

  return { device, browser, os, deviceType, raw: ua };
}

async function getGeoLocation(ip) {
  try {
    if (!ip || ip === 'Unknown' || ip.startsWith('127.') || ip.startsWith('::')) {
      return {
        city: 'Local', region: 'Local', country: 'Local',
        countryCode: 'XX', postalCode: '0000',
        timezone: 'Asia/Dhaka', display: 'Local Development',
      };
    }
    const res  = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,city,regionName,country,countryCode,zip,timezone,lat,lon`,
      { signal: AbortSignal.timeout(3000) },
    );
    const data = await res.json();
    if (data.status !== 'success') return null;
    return {
      city:        data.city        || null,
      region:      data.regionName  || null,
      country:     data.country     || null,
      countryCode: data.countryCode || null,
      postalCode:  data.zip         || null,
      timezone:    data.timezone    || null,
      latitude:    String(data.lat  || ''),
      longitude:   String(data.lon  || ''),
      display: [data.city, data.countryCode, data.zip]
        .filter(Boolean).join(', '),
    };
  } catch {
    return null;
  }
}

function emitSocket(req, event, data) {
  try {
    const io = req.app.get('io');
    if (io) io.emit(event, data);
  } catch (_) {}
}

async function safeAuditLog(payload) {
  try { await AuditLog.createLog(payload); }
  catch (e) { console.error('[AuditLog]', e.message); }
}

// ✅ Token hide helper — API response এ token বের হবে না
function sanitizeDoc(doc, visiblePartyIdx = null) {
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  if (Array.isArray(obj.parties)) {
    obj.parties = obj.parties.map((p, i) => {
      const party = { ...p };
      if (i !== visiblePartyIdx) delete party.token;
      return party;
    });
  }
  return obj;
}

// ✅ Allowed field types — all supported types
const ALLOWED_FIELD_TYPES = new Set([
  'signature', 'initial', 'text',
  'date', 'checkbox', 'number',
]);

// ✅ Field validator
function validateFields(fields) {
  if (!Array.isArray(fields)) return 'Fields must be an array.';
  for (const f of fields) {
    if (!f.id)   return `Field missing id.`;
    if (!f.type) return `Field ${f.id} missing type.`;
    if (!ALLOWED_FIELD_TYPES.has(f.type)) {
      return `Field type "${f.type}" is not supported.`;
    }
    if (f.partyIndex === undefined || f.partyIndex === null) {
      return `Field ${f.id} missing partyIndex.`;
    }
    if (f.x === undefined || f.y === undefined) {
      return `Field ${f.id} missing position (x, y).`;
    }
    if (!f.width || !f.height) {
      return `Field ${f.id} missing size (width, height).`;
    }
    if (!f.page) return `Field ${f.id} missing page number.`;
  }
  return null; // null = valid
}

// ═══════════════════════════════════════════════════════════════
// ✅ ROUTE ORDER MATTERS
// ═══════════════════════════════════════════════════════════════

// ── 1. GET ALL DOCUMENTS ────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { owner: req.user.id, isTemplate: false };
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [documents, total] = await Promise.all([
      Document.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select('-fields')
        .lean(),
      Document.countDocuments(query),
    ]);

    const [totalDocs, pendingDocs, completedDocs] = await Promise.all([
      Document.countDocuments({ owner: req.user.id, isTemplate: false }),
      Document.countDocuments({ owner: req.user.id, isTemplate: false, status: 'in_progress' }),
      Document.countDocuments({ owner: req.user.id, isTemplate: false, status: 'completed' }),
    ]);

    return res.json({
      success: true,
      documents,
      pagination: {
        total, page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
      stats: {
        total:     totalDocs,
        pending:   pendingDocs,
        completed: completedDocs,
        draft:     totalDocs - pendingDocs - completedDocs,
      },
    });
  } catch (err) {
    console.error('[GET /documents]', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ── 2. UPLOAD PDF ───────────────────────────────────────────────
router.post(
  '/upload',
  auth,
  (req, res, next) =>
    pdfUpload.single('file')(req, res, err =>
      handleMulterError(err, req, res, next)
    ),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false, message: 'No PDF file uploaded.',
        });
      }
      checkCloudinary();
      const result = await uploadToCloudinary(req.file.buffer, {
        resource_type: 'raw',
        folder:        'nexsign/documents',
        format:        'pdf',
      });
      const doc = await Document.create({
        owner:    req.user.id,
        title:    req.file.originalname.replace(/\.pdf$/i, '').trim(),
        fileUrl:  result.secure_url,
        fileId:   result.public_id,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        status:   'draft',
      });
      return res.status(201).json({ success: true, document: doc });
    } catch (err) {
      console.error('[POST /upload]', err.message);
      return res.status(500).json({ success: false, message: err.message });
    }
  },
);

// ── 3. UPLOAD LOGO ──────────────────────────────────────────────
router.post(
  '/upload-logo',
  auth,
  (req, res, next) =>
    logoUpload.single('logo')(req, res, err =>
      handleMulterError(err, req, res, next)
    ),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false, message: 'No logo file uploaded.',
        });
      }

      // ✅ Cloudinary config check — 500 এর বদলে proper error
      try { checkCloudinary(); } catch (cfgErr) {
        return res.status(503).json({
          success: false,
          message: 'Logo upload unavailable: ' + cfgErr.message,
        });
      }

      const result = await uploadToCloudinary(req.file.buffer, {
        resource_type:  'image',
        folder:         'nexsign/logos',
        transformation: [{ width: 400, crop: 'limit' }],
      });
      return res.json({ success: true, logoUrl: result.secure_url });
    } catch (err) {
      console.error('[POST /upload-logo]', err.message);
      return res.status(500).json({ success: false, message: err.message });
    }
  },
);

// ── 4. SEND FOR SIGNING ─────────────────────────────────────────
router.post(
  '/upload-and-send',
  auth,
  (req, res, next) =>
    pdfUpload.single('file')(req, res, err => {
      if (err && err.message === 'Only PDF files are allowed') return next();
      if (err) return handleMulterError(err, req, res, next);
      next();
    }),
  async (req, res) => {
    try {
      const {
        title, parties: partiesRaw, fields: fieldsRaw,
        ccList: ccRaw, totalPages, companyName,
        companyLogo, message, docId,
      } = req.body;

      // ✅ Parse JSON safely
      let parsedParties, parsedFields, parsedCC;
      try {
        parsedParties = JSON.parse(partiesRaw || '[]');
        parsedFields  = JSON.parse(fieldsRaw  || '[]');
        parsedCC      = JSON.parse(ccRaw      || '[]');
      } catch {
        return res.status(400).json({
          success: false,
          message: 'Invalid JSON in parties, fields, or ccList.',
        });
      }

      // ✅ Validate parties
      if (!Array.isArray(parsedParties) || !parsedParties.length) {
        return res.status(400).json({
          success: false,
          message: 'At least one signer is required.',
        });
      }

      // ✅ Validate fields — all types supported
      if (parsedFields.length > 0) {
        const fieldErr = validateFields(parsedFields);
        if (fieldErr) {
          return res.status(400).json({
            success: false,
            message: fieldErr,
          });
        }
      }

      // Find or create doc
      let doc = null;
      if (docId && !['undefined', 'null', ''].includes(String(docId))) {
        doc = await Document.findOne({ _id: docId, owner: req.user.id });
      }

      if (!doc && req.file) {
        checkCloudinary();
        const result = await uploadToCloudinary(req.file.buffer, {
          resource_type: 'raw',
          folder:        'nexsign/documents',
          format:        'pdf',
        });
        doc = new Document({
          owner:    req.user.id,
          fileUrl:  result.secure_url,
          fileId:   result.public_id,
          fileName: req.file.originalname,
          fileSize: req.file.size,
        });
      }

      if (!doc) {
        return res.status(400).json({
          success: false,
          message: 'No document found and no PDF provided.',
        });
      }

      const firstToken = crypto.randomBytes(32).toString('hex');

      doc.title             = title?.trim() || doc.title || 'Untitled';
      doc.companyName       = companyName || '';
      doc.companyLogo       = companyLogo || '';
      doc.message           = message     || '';
      doc.totalPages        = Number(totalPages) || 1;

      // ✅ Fields — সব type সংরক্ষণ করা হচ্ছে
      doc.fields            = parsedFields.map(f => ({
        id:              f.id,
        type:            f.type,
        partyIndex:      Number(f.partyIndex),
        partyEmail:      f.partyEmail   || null,
        page:            Number(f.page) || 1,
        x:               Number(f.x),
        y:               Number(f.y),
        width:           Number(f.width),
        height:          Number(f.height),
        fontSize:        f.fontSize     || 14,
        fontFamily:      f.fontFamily   || 'Inter',
        fontWeight:      f.fontWeight   || 'normal',
        color:           f.color        || '#000000',
        backgroundColor: f.backgroundColor || 'transparent',
        label:           f.label        || null,
        placeholder:     f.placeholder  || null,
        required:        f.required !== false,
        value:           null,
        filledAt:        null,
      }));

      doc.ccList            = parsedCC;
      doc.status            = 'in_progress';
      doc.currentPartyIndex = 0;
      doc.sentAt            = new Date();

      doc.parties = parsedParties.map((p, i) => ({
        name:           p.name?.trim(),
        email:          p.email?.toLowerCase().trim(),
        designation:    p.designation?.trim() || null,
        order:          i,
        color:          p.color || '#3B82F6',
        status:         i === 0 ? 'sent'    : 'pending',
        token:          i === 0 ? firstToken : null,
        emailSentAt:    i === 0 ? new Date() : null,
        tokenExpiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
      }));

      await doc.save();

      // Audit — non-blocking
      safeAuditLog({
        document_id:   doc._id,
        document_title: doc.title,
        company_name:  doc.companyName,
        action:        'sent',
        performed_by: {
          user_id:     req.user._id,
          name:        req.user.full_name,
          email:       req.user.email,
          designation: req.user.designation,
          role:        'owner',
        },
        cc_list: parsedCC.map(cc => ({
          name: cc.name, email: cc.email, designation: cc.designation,
        })),
        details: {
          total_parties: parsedParties.length,
          total_fields:  parsedFields.length,
        },
      });

      // Send email to first signer
      const first = doc.parties[0];
      await sendSigningEmail({
        recipientEmail:       first.email,
        recipientName:        first.name,
        recipientDesignation: first.designation,
        senderName:           req.user.full_name,
        senderDesignation:    req.user.designation,
        documentTitle:        doc.title,
        signingLink:          `${FRONT()}/sign/${firstToken}`,
        companyLogoUrl:       doc.companyLogo,
        companyName:          doc.companyName,
        partyNumber:          1,
        totalParties:         parsedParties.length,
        message:              doc.message,
        ccList:               parsedCC,
      });

      // CC emails — parallel, non-blocking
      Promise.allSettled(
        parsedCC.map(cc =>
          sendCCEmail({
            recipientEmail:       cc.email,
            recipientName:        cc.name,
            recipientDesignation: cc.designation,
            documentTitle:        doc.title,
            senderName:           req.user.full_name,
            senderDesignation:    req.user.designation,
            companyLogoUrl:       doc.companyLogo,
            companyName:          doc.companyName,
            parties:              parsedParties,
          })
        )
      );

      emitSocket(req, 'document:created', {
        documentId: doc._id,
        ownerId:    req.user.id,
        title:      doc.title,
        status:     doc.status,
      });

      // ✅ Token hide করে response
      return res.json({
        success:  true,
        document: sanitizeDoc(doc),
      });

    } catch (err) {
      console.error('[POST /upload-and-send]', err.message);
      return res.status(500).json({ success: false, message: err.message });
    }
  },
);

// ══════════════════════════════════════════════════════════════
// ✅ SIGN ROUTES — /:id এর আগে
// ══════════════════════════════════════════════════════════════

// ── 5. VALIDATE TOKEN ───────────────────────────────────────────
router.get('/sign/validate/:token', async (req, res) => {
  try {
    const { token } = req.params;

    if (!token || token.length < 10) {
      return res.status(400).json({
        success: false,
        code:    'INVALID_TOKEN',
        message: 'Invalid token format.',
      });
    }

    const doc = await Document.findOne({ 'parties.token': token });
    if (!doc) {
      return res.status(404).json({
        success: false,
        code:    'INVALID_LINK',
        message: 'This signing link is invalid or has expired.',
      });
    }

    const idx   = doc.parties.findIndex(p => p.token === token);
    const party = doc.parties[idx];

    if (!party) {
      return res.status(404).json({
        success: false,
        code:    'INVALID_LINK',
        message: 'Signing party not found.',
      });
    }

    if (party.tokenExpiresAt && new Date() > party.tokenExpiresAt) {
      return res.status(410).json({
        success: false, code: 'LINK_EXPIRED',
        message: 'This signing link has expired.',
      });
    }

    if (party.status === 'signed') {
      return res.status(410).json({
        success: false, code: 'ALREADY_SIGNED',
        message: 'This document has already been signed.',
      });
    }

    // Device info
    const ip     = getIP(req);
    const ua     = req.headers['user-agent'] || '';
    const device = parseDevice(ua);

    party.linkClickedAt  = party.linkClickedAt || new Date();
    party.linkClickCount = (party.linkClickCount || 0) + 1;
    party.status         = 'viewed';
    party.ipAddress      = ip;
    if (device.device)  party.device  = device.device;
    if (device.browser) party.browser = device.browser;
    if (device.os)      party.os      = device.os;

    await doc.save();

    // Geo — background
    getGeoLocation(ip).then(async geo => {
      if (!geo) return;
      try {
        const d = await Document.findById(doc._id);
        if (!d) return;
        const p = d.parties[idx];
        if (!p) return;
        p.city       = geo.city;
        p.region     = geo.region;
        p.country    = geo.country;
        p.postalCode = geo.postalCode;
        p.timezone   = geo.timezone;
        await d.save();
      } catch (_) {}
    });

    // Audit — background
    safeAuditLog({
      document_id:   doc._id,
      document_title: doc.title,
      company_name:  doc.companyName,
      action:        'link_clicked',
      performed_by: {
        name:        party.name,
        email:       party.email,
        designation: party.designation,
        role:        'signer',
        party_index: idx,
        party_color: party.color,
      },
      device: {
        device_name: device.device,
        browser:     device.browser,
        os:          device.os,
        device_type: device.deviceType,
        raw:         ua,
      },
    });

    emitSocket(req, 'document:party_viewed', {
      documentId: String(doc._id),
      partyIndex: idx,
      partyEmail: party.email,
      partyName:  party.name,
      device:     device.device,
    });

    // ✅ Token hide — শুধু current party র token দেখাবে
    const safeDocument = sanitizeDoc(doc, idx);

    return res.json({
      success:  true,
      document: safeDocument,
      party:    { ...party.toObject(), index: idx },
      geo:      {},
    });

  } catch (err) {
    console.error('[GET /sign/validate/:token]', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ── 6. PDF PROXY ────────────────────────────────────────────────
router.get('/sign/:token/pdf', async (req, res) => {
  try {
    const doc = await Document
      .findOne({ 'parties.token': req.params.token })
      .select('fileUrl title')
      .lean();

    if (!doc) return res.status(404).send('Not found');

    const response = await fetch(doc.fileUrl);
    if (!response.ok) return res.status(502).send('PDF fetch failed');

    const buffer = await response.arrayBuffer();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${doc.title || 'document'}.pdf"`,
    );
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('[GET /sign/:token/pdf]', err.message);
    return res.status(500).send(err.message);
  }
});

// ── 7. SUBMIT SIGNATURE ─────────────────────────────────────────
router.post('/sign/submit', async (req, res) => {
  try {
    const { token, fields, clientTime } = req.body;

    if (!token || !fields) {
      return res.status(400).json({
        success: false, message: 'Token and fields are required.',
      });
    }

    // ✅ Fields validate
    if (Array.isArray(fields) && fields.length > 0) {
      const fieldErr = validateFields(fields);
      if (fieldErr) {
        return res.status(400).json({ success: false, message: fieldErr });
      }
    }

    const doc = await Document.findOne({ 'parties.token': token });
    if (!doc) {
      return res.status(404).json({
        success: false, code: 'SESSION_EXPIRED',
        message: 'Signing session expired or invalid.',
      });
    }

    const idx   = doc.parties.findIndex(p => p.token === token);
    const party = doc.parties[idx];

    if (!party) {
      return res.status(404).json({
        success: false, message: 'Signing party not found.',
      });
    }

    if (party.status === 'signed') {
      return res.status(409).json({
        success: false, code: 'ALREADY_SIGNED', message: 'Already signed.',
      });
    }

    const ip        = getIP(req);
    const ua        = req.headers['user-agent'] || '';
    const device    = parseDevice(ua);
    const localTime = clientTime || new Date().toUTCString();

    party.status          = 'signed';
    party.signedAt        = new Date();
    party.token           = null;
    party.ipAddress       = ip;
    party.device          = device.device;
    party.browser         = device.browser;
    party.os              = device.os;
    party.localSignedTime = localTime;

    // ✅ Fields merge — submitted values + preserve structure
    if (Array.isArray(fields)) {
      doc.fields = doc.fields.map(existingField => {
        const submitted = fields.find(f => f.id === existingField.id);
        if (submitted && submitted.partyIndex === idx) {
          return {
            ...existingField,
            value:    submitted.value || null,
            filledAt: submitted.value ? new Date() : null,
          };
        }
        return existingField;
      });
    }

    const nextIdx = idx + 1;
    const hasNext = nextIdx < doc.parties.length;

    if (hasNext) {
      const nextToken = crypto.randomBytes(32).toString('hex');
      doc.parties[nextIdx].token          = nextToken;
      doc.parties[nextIdx].status         = 'sent';
      doc.parties[nextIdx].emailSentAt    = new Date();
      doc.parties[nextIdx].tokenExpiresAt =
        new Date(Date.now() + 72 * 60 * 60 * 1000);
      doc.currentPartyIndex = nextIdx;

      await doc.save();

      // Geo + audit — background
      getGeoLocation(ip).then(geo => {
        safeAuditLog({
          document_id:   doc._id,
          document_title: doc.title,
          action:        'signed',
          performed_by: {
            name:        party.name,
            email:       party.email,
            designation: party.designation,
            role:        'signer',
            party_index: idx,
          },
          device: {
            device_name: device.device,
            browser:     device.browser,
            os:          device.os,
          },
          location: {
            ip_address: ip,
            city:       geo?.city,
            country:    geo?.country,
            timezone:   geo?.timezone,
            display:    geo?.display,
          },
          local_time: localTime,
          cc_list: doc.ccList.map(cc => ({
            name: cc.name, email: cc.email, designation: cc.designation,
          })),
        });
      });

      const nextParty = doc.parties[nextIdx];
      await sendSigningEmail({
        recipientEmail:       nextParty.email,
        recipientName:        nextParty.name,
        recipientDesignation: nextParty.designation,
        senderName:           party.name,
        senderDesignation:    party.designation,
        documentTitle:        doc.title,
        signingLink:          `${FRONT()}/sign/${nextToken}`,
        companyLogoUrl:       doc.companyLogo,
        companyName:          doc.companyName,
        partyNumber:          nextIdx + 1,
        totalParties:         doc.parties.length,
        message:              doc.message,
        ccList:               doc.ccList,
      });

      emitSocket(req, 'document:party_signed', {
        documentId: String(doc._id),
        partyIndex: idx,
        partyName:  party.name,
        nextSigner: nextParty.email,
      });

      return res.json({
        success: true, next: true,
        message: `Document sent to next signer: ${nextParty.name}`,
        signerInfo: {
          name:     party.name,
          device:   device.device,
          location: 'Processing...',
          time:     localTime,
        },
      });

    } else {
      // All signed
      doc.status      = 'completed';
      doc.completedAt = new Date();
      await doc.save();

      emitSocket(req, 'document:completed', {
        documentId:  String(doc._id),
        ownerId:     String(doc.owner),
        title:       doc.title,
        completedAt: doc.completedAt,
      });

      _finalizeDocument(req, doc).catch(e =>
        console.error('[finalize]', e.message)
      );

      return res.json({
        success: true, completed: true,
        message: 'Document signed and completed!',
        signerInfo: {
          name:     party.name,
          device:   device.device,
          location: 'Processing...',
          time:     localTime,
        },
      });
    }
  } catch (err) {
    console.error('[POST /sign/submit]', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════
// GENERIC /:id ROUTES
// ══════════════════════════════════════════════════════════════

// ── 8. GET SINGLE DOCUMENT ──────────────────────────────────────
router.get('/:id', auth, async (req, res) => {
  try {
    const doc = await Document.findOne({
      _id: req.params.id, owner: req.user.id,
    }).lean();

    if (!doc) {
      return res.status(404).json({
        success: false, message: 'Document not found.',
      });
    }
    return res.json({ success: true, document: sanitizeDoc(doc) });
  } catch (err) {
    console.error('[GET /documents/:id]', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ── 9. AUDIT LOG ────────────────────────────────────────────────
router.get('/:id/audit', auth, async (req, res) => {
  try {
    const doc = await Document.findOne({
      _id: req.params.id, owner: req.user.id,
    }).lean();

    if (!doc) {
      return res.status(404).json({
        success: false, message: 'Document not found.',
      });
    }

    const events = [];
    events.push({
      action: 'created', label: 'Document Created',
      actor: { name: 'System', role: 'system' },
      timestamp: doc.createdAt,
    });

    for (const p of doc.parties) {
      if (p.emailSentAt) events.push({
        action: 'email_sent', label: 'Email Sent',
        actor: { name: p.name, email: p.email },
        timestamp: p.emailSentAt,
      });
      if (p.linkClickedAt) events.push({
        action: 'link_clicked', label: 'Link Clicked',
        actor: { name: p.name, email: p.email },
        timestamp: p.linkClickedAt,
      });
      if (p.signedAt) events.push({
        action: 'signed', label: 'Document Signed',
        actor: {
          name: p.name, email: p.email, designation: p.designation,
        },
        timestamp:  p.signedAt,
        localTime:  p.localSignedTime,
        device:     p.device,
        browser:    p.browser,
        os:         p.os,
        ipAddress:  p.ipAddress,
        location: {
          city:       p.city,
          region:     p.region,
          country:    p.country,
          postalCode: p.postalCode,
          display:    [p.city, p.country, p.postalCode]
            .filter(Boolean).join(', '),
        },
      });
    }

    if (doc.status === 'completed') {
      events.push({
        action: 'completed', label: 'Document Completed',
        actor: { name: 'System', role: 'system' },
        timestamp: doc.completedAt || doc.updatedAt,
      });
    }

    events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    return res.json({
      success: true,
      audit: {
        document: {
          _id:         doc._id,
          title:       doc.title,
          status:      doc.status,
          companyName: doc.companyName,
          companyLogo: doc.companyLogo,
          createdAt:   doc.createdAt,
          completedAt: doc.completedAt,
        },
        parties:       doc.parties,
        ccList:        doc.ccList,
        events,
        signedFileUrl: doc.signedFileUrl,
      },
    });
  } catch (err) {
    console.error('[GET /documents/:id/audit]', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ── 10. UPDATE DOCUMENT ─────────────────────────────────────────
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      title, parties, fields, ccList,
      companyLogo, companyName, message, totalPages,
    } = req.body;

    const updates = {};
    if (title       !== undefined) updates.title       = title;
    if (parties     !== undefined) updates.parties     = parties;
    if (fields      !== undefined) updates.fields      = fields;
    if (ccList      !== undefined) updates.ccList      = ccList;
    if (companyLogo !== undefined) updates.companyLogo = companyLogo;
    if (companyName !== undefined) updates.companyName = companyName;
    if (message     !== undefined) updates.message     = message;
    if (totalPages  !== undefined) updates.totalPages  = Number(totalPages);

    const doc = await Document.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      { $set: updates },
      { new: true, runValidators: true },
    );

    if (!doc) {
      return res.status(404).json({
        success: false, message: 'Document not found.',
      });
    }
    return res.json({ success: true, document: sanitizeDoc(doc) });
  } catch (err) {
    console.error('[PUT /documents/:id]', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ── 11. DELETE DOCUMENT ─────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    const doc = await Document.findOne({
      _id: req.params.id, owner: req.user.id,
    });

    if (!doc) {
      return res.status(404).json({
        success: false, message: 'Document not found.',
      });
    }

    if (doc.status === 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a document that is currently in progress.',
      });
    }

    try {
      if (doc.fileId) {
        await cloudinary.uploader.destroy(doc.fileId, {
          resource_type: 'raw',
        });
      }
    } catch (e) { console.error('[Cloudinary delete]', e.message); }

    await Document.findByIdAndDelete(doc._id);

    safeAuditLog({
      document_id:   doc._id,
      document_title: doc.title,
      action:        'deleted',
      performed_by: {
        user_id:     req.user._id,
        name:        req.user.full_name,
        email:       req.user.email,
        role:        'owner',
      },
    });

    emitSocket(req, 'document:deleted', {
      documentId: String(doc._id),
      ownerId:    req.user.id,
    });

    return res.json({ success: true, message: 'Document deleted.' });
  } catch (err) {
    console.error('[DELETE /documents/:id]', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// INTERNAL — Finalize
// ═══════════════════════════════════════════════════════════════
async function _finalizeDocument(req, doc) {
  try {
    console.log(`📑 Finalizing: ${doc._id}`);

    const mergedBytes = await mergeSignaturesIntoPDF(doc.fileUrl, doc.fields);
    const finalBuffer = await appendAuditPage(mergedBytes, doc);

    const uploaded = await uploadToCloudinary(finalBuffer, {
      resource_type: 'raw',
      folder:        'nexsign/completed',
      public_id:     `signed_${doc._id}_${Date.now()}`,
      format:        'pdf',
    });

    doc.signedFileUrl = uploaded.secure_url;
    await doc.save();
    console.log(`✅ Signed PDF: ${uploaded.secure_url}`);

    const partiesWithAudit = doc.parties.map(p => ({
      name:        p.name,
      email:       p.email,
      designation: p.designation,
      status:      p.status,
      signedAt:    p.signedAt,
      auditInfo: {
        device:   p.device,
        browser:  p.browser,
        os:       p.os,
        location: [p.city, p.country].filter(Boolean).join(', '),
        postal:   p.postalCode,
        time:     p.localSignedTime,
        ip:       p.ipAddress,
      },
    }));

    await Promise.allSettled([
      ...doc.parties.map(party =>
        sendCompletionEmail({
          recipientEmail:       party.email,
          recipientName:        party.name,
          recipientDesignation: party.designation,
          documentTitle:        doc.title,
          pdfBuffer:            finalBuffer,
          signedPdfUrl:         uploaded.secure_url,
          companyLogoUrl:       doc.companyLogo,
          companyName:          doc.companyName,
          parties:              partiesWithAudit,
          ccList:               doc.ccList,
          isCC:                 false,
        })
      ),
      ...doc.ccList.map(cc =>
        sendCompletionEmail({
          recipientEmail:       cc.email,
          recipientName:        cc.name,
          recipientDesignation: cc.designation,
          documentTitle:        doc.title,
          pdfBuffer:            finalBuffer,
          signedPdfUrl:         uploaded.secure_url,
          companyLogoUrl:       doc.companyLogo,
          companyName:          doc.companyName,
          parties:              partiesWithAudit,
          ccList:               doc.ccList,
          isCC:                 true,
        })
      ),
    ]);

    safeAuditLog({
      document_id:   doc._id,
      document_title: doc.title,
      action:        'completed',
      performed_by:  { name: 'System', role: 'system' },
      details: {
        signed_pdf_url: uploaded.secure_url,
        total_signers:  doc.parties.length,
      },
    });

    emitSocket(req, 'document:finalized', {
      documentId:   String(doc._id),
      ownerId:      String(doc.owner),
      signedPdfUrl: uploaded.secure_url,
    });

    console.log(`✅ Finalized: ${doc._id}`);
  } catch (err) {
    console.error('[_finalizeDocument]', err.message);
  }
}

module.exports = router;