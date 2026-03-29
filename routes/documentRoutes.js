'use strict';

const express   = require('express');
const router    = express.Router();
const multer    = require('multer');
const crypto    = require('crypto');
const { v2: cloudinary } = require('cloudinary');

const Document  = require('../models/Document');
const AuditLog  = require('../models/AuditLog');
const { auth }  = require('../middleware/auth');

const {
  sendSigningEmail,
  sendCompletionEmail,
  sendCCEmail,
  sendDeclinedEmail,
} = require('../utils/emailService');

const {
  mergeSignaturesIntoPDF,
  appendAuditPage,
} = require('../utils/pdfService');

// ═══════════════════════════════════════════════════════════════
// CLOUDINARY CONFIG
// ═══════════════════════════════════════════════════════════════
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ═══════════════════════════════════════════════════════════════
// MULTER
// ═══════════════════════════════════════════════════════════════
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
});

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
const FRONT = () =>
  (process.env.FRONTEND_URL || 'https://nexsignfrontend.vercel.app')
    .replace(/\/$/, '');

// Upload buffer to Cloudinary
async function uploadToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      options,
      (err, result) => (err ? reject(err) : resolve(result)),
    );
    stream.end(buffer);
  });
}

// Get IP from request
function getIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.ip ||
    'Unknown'
  );
}

// Parse device info from user-agent
function parseDevice(ua = '') {
  let device  = 'Unknown Device';
  let browser = 'Unknown Browser';
  let os      = 'Unknown OS';
  let deviceType = 'desktop';

  // Device detection
  if (/iPhone/.test(ua)) {
    const match = ua.match(/iPhone\s?OS\s?([\d_]+)/i);
    device = 'iPhone';
    os = match ? `iOS ${match[1].replace(/_/g, '.')}` : 'iOS';
    deviceType = 'mobile';
  } else if (/iPad/.test(ua)) {
    device = 'iPad';
    os = 'iPadOS';
    deviceType = 'tablet';
  } else if (/Android/.test(ua)) {
    const model = ua.match(/Android[^;]*;\s*([^)]+)\)/)?.[1]?.trim();
    device = model || 'Android Device';
    const ver = ua.match(/Android\s([\d.]+)/)?.[1];
    os = ver ? `Android ${ver}` : 'Android';
    deviceType = /Mobile/.test(ua) ? 'mobile' : 'tablet';
  } else if (/Windows/.test(ua)) {
    device = 'Windows PC';
    const ver = ua.match(/Windows NT ([\d.]+)/)?.[1];
    const winMap = { '10.0': '10/11', '6.3': '8.1', '6.2': '8', '6.1': '7' };
    os = `Windows ${winMap[ver] || ver || ''}`.trim();
    deviceType = 'desktop';
  } else if (/Macintosh|Mac OS X/.test(ua)) {
    device = 'Mac';
    const ver = ua.match(/Mac OS X ([\d_]+)/)?.[1];
    os = ver ? `macOS ${ver.replace(/_/g, '.')}` : 'macOS';
    deviceType = 'desktop';
  } else if (/Linux/.test(ua)) {
    device = 'Linux PC';
    os = 'Linux';
    deviceType = 'desktop';
  }

  // Browser detection
  if (/Edg\//.test(ua))         browser = `Edge ${ua.match(/Edg\/([\d.]+)/)?.[1] || ''}`.trim();
  else if (/OPR\//.test(ua))    browser = `Opera ${ua.match(/OPR\/([\d.]+)/)?.[1] || ''}`.trim();
  else if (/Chrome\//.test(ua)) browser = `Chrome ${ua.match(/Chrome\/([\d.]+)/)?.[1] || ''}`.trim();
  else if (/Firefox\//.test(ua))browser = `Firefox ${ua.match(/Firefox\/([\d.]+)/)?.[1] || ''}`.trim();
  else if (/Safari\//.test(ua)) browser = `Safari ${ua.match(/Version\/([\d.]+)/)?.[1] || ''}`.trim();

  return { device, browser, os, deviceType, raw: ua };
}

// Get geolocation from IP
async function getGeoLocation(ip) {
  try {
    if (!ip || ip === 'Unknown' || ip.startsWith('127.') || ip.startsWith('::')) {
      return {
        city: 'Local', region: 'Local', country: 'Local',
        countryCode: 'XX', postalCode: '0000',
        timezone: 'Asia/Dhaka', display: 'Local Development',
      };
    }

    const res  = await fetch(`http://ip-api.com/json/${ip}?fields=status,city,regionName,country,countryCode,zip,timezone,lat,lon,isp`, {
      signal: AbortSignal.timeout(5000),
    });
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
      isp:         data.isp         || null,
      display:     [data.city, data.countryCode, data.zip]
                     .filter(Boolean).join(', '),
    };
  } catch {
    return null;
  }
}

// Get local time string for timezone
function getLocalTime(timezone) {
  try {
    return new Date().toLocaleString('en-GB', {
      timeZone:    timezone || 'Asia/Dhaka',
      day:         '2-digit',
      month:       'short',
      year:        'numeric',
      hour:        '2-digit',
      minute:      '2-digit',
      hour12:      true,
    });
  } catch {
    return new Date().toUTCString();
  }
}

// Emit socket event (non-blocking)
function emitSocket(req, event, data) {
  try {
    const io = req.app.get('io');
    if (io) io.emit(event, data);
  } catch (_) {}
}

// ═══════════════════════════════════════════════════════════════
// 1. GET ALL DOCUMENTS (Dashboard)
// ═══════════════════════════════════════════════════════════════
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {
      owner:      req.user.id,
      isTemplate: false,
    };
    if (status) query.status = status;

    const skip  = (Number(page) - 1) * Number(limit);

    const [documents, total] = await Promise.all([
      Document.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select('-fields') // fields ছাড়া (dashboard এ দরকার নেই)
        .lean(),
      Document.countDocuments(query),
    ]);

    // Stats for dashboard
    const [totalDocs, pendingDocs, completedDocs] = await Promise.all([
      Document.countDocuments({ owner: req.user.id, isTemplate: false }),
      Document.countDocuments({ owner: req.user.id, isTemplate: false, status: 'in_progress' }),
      Document.countDocuments({ owner: req.user.id, isTemplate: false, status: 'completed' }),
    ]);

    return res.json({
      success: true,
      documents,
      pagination: {
        total,
        page:       Number(page),
        limit:      Number(limit),
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

// ═══════════════════════════════════════════════════════════════
// 2. UPLOAD PDF & CREATE DRAFT
// ═══════════════════════════════════════════════════════════════
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false, message: 'No PDF file uploaded.',
      });
    }

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
});

// ═══════════════════════════════════════════════════════════════
// 3. UPLOAD COMPANY LOGO
// ═══════════════════════════════════════════════════════════════
router.post('/upload-logo', auth, upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false, message: 'No logo file uploaded.',
      });
    }

    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
      { folder: 'nexsign/logos', transformation: [{ width: 400, crop: 'limit' }] },
    );

    return res.json({ success: true, logoUrl: result.secure_url });
  } catch (err) {
    console.error('[POST /upload-logo]', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// 4. GET SINGLE DOCUMENT
// ═══════════════════════════════════════════════════════════════
router.get('/:id', auth, async (req, res) => {
  try {
    const doc = await Document.findOne({
      _id:   req.params.id,
      owner: req.user.id,
    }).lean();

    if (!doc) {
      return res.status(404).json({
        success: false, message: 'Document not found.',
      });
    }

    return res.json({ success: true, document: doc });
  } catch (err) {
    console.error('[GET /documents/:id]', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// 4a. GET AUDIT LOG
// ═══════════════════════════════════════════════════════════════
router.get('/:id/audit', auth, async (req, res) => {
  try {
    const doc = await Document.findOne({
      _id:   req.params.id,
      owner: req.user.id,
    }).lean();

    if (!doc) {
      return res.status(404).json({
        success: false, message: 'Document not found.',
      });
    }

    // Build timeline from document data
    const events = [];

    // Created
    events.push({
      action:    'created',
      label:     'Document Created',
      actor:     { name: 'System', role: 'system' },
      timestamp: doc.createdAt,
    });

    // Per party events
    for (const p of doc.parties) {
      if (p.emailSentAt) {
        events.push({
          action:    'email_sent',
          label:     'Email Sent',
          actor:     { name: p.name, email: p.email, designation: p.designation },
          timestamp: p.emailSentAt,
        });
      }
      if (p.emailOpenedAt) {
        events.push({
          action:    'email_opened',
          label:     'Email Opened',
          actor:     { name: p.name, email: p.email, designation: p.designation },
          timestamp: p.emailOpenedAt,
          device:    p.device,
          location:  p.city
            ? `${p.city}, ${p.country || ''} - ${p.postalCode || ''}`
            : null,
        });
      }
      if (p.linkClickedAt) {
        events.push({
          action:    'link_clicked',
          label:     'Link Clicked',
          actor:     { name: p.name, email: p.email, designation: p.designation },
          timestamp: p.linkClickedAt,
        });
      }
      if (p.signedAt) {
        events.push({
          action:    'signed',
          label:     'Document Signed',
          actor: {
            name:        p.name,
            email:       p.email,
            designation: p.designation,
          },
          timestamp:     p.signedAt,
          localTime:     p.localSignedTime,
          device:        p.device,
          browser:       p.browser,
          os:            p.os,
          ipAddress:     p.ipAddress,
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
    }

    // Completed
    if (doc.status === 'completed') {
      events.push({
        action:    'completed',
        label:     'Document Completed',
        actor:     { name: 'System', role: 'system' },
        timestamp: doc.completedAt || doc.updatedAt,
      });
    }

    // Sort by time
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
        parties:  doc.parties,
        ccList:   doc.ccList,
        events,
        signedFileUrl: doc.signedFileUrl,
      },
    });
  } catch (err) {
    console.error('[GET /documents/:id/audit]', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// 5. UPDATE DOCUMENT (Save Draft)
// ═══════════════════════════════════════════════════════════════
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      title, parties, fields,
      ccList, companyLogo,
      companyName, message,
      totalPages,
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

    return res.json({ success: true, document: doc });
  } catch (err) {
    console.error('[PUT /documents/:id]', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// 6. SEND FOR SIGNING
// ═══════════════════════════════════════════════════════════════
router.post('/upload-and-send', auth, upload.single('file'), async (req, res) => {
  try {
    const {
      title, parties: partiesRaw, fields: fieldsRaw,
      ccList: ccRaw, totalPages, companyName,
      companyLogo, message, docId,
    } = req.body;

    // ── Find or create document ────────────────────────────────
    let doc;
    if (docId && docId !== 'undefined') {
      doc = await Document.findById(docId);
    }

    if (!doc && req.file) {
      const result = await uploadToCloudinary(req.file.buffer, {
        resource_type: 'raw',
        folder:        'nexsign/documents',
        format:        'pdf',
      });
      doc = new Document({
        owner:    req.user.id,
        fileUrl:  result.secure_url,
        fileId:   result.public_id,
        fileName: req.file?.originalname,
        fileSize: req.file?.size,
      });
    }

    if (!doc) {
      return res.status(400).json({
        success: false, message: 'Document not found.',
      });
    }

    const parsedParties = JSON.parse(partiesRaw || '[]');
    const parsedFields  = JSON.parse(fieldsRaw  || '[]');
    const parsedCC      = JSON.parse(ccRaw       || '[]');

    if (!parsedParties.length) {
      return res.status(400).json({
        success: false, message: 'At least one signer is required.',
      });
    }

    // ── Assign token to first party only ───────────────────────
    const firstToken = crypto.randomBytes(32).toString('hex');

    doc.title             = title?.trim() || doc.title;
    doc.companyName       = companyName   || '';
    doc.companyLogo       = companyLogo   || '';
    doc.message           = message       || '';
    doc.totalPages        = Number(totalPages) || 1;
    doc.fields            = parsedFields;
    doc.ccList            = parsedCC;
    doc.status            = 'in_progress';
    doc.currentPartyIndex = 0;
    doc.sentAt            = new Date();

    doc.parties = parsedParties.map((p, i) => ({
      name:        p.name?.trim(),
      email:       p.email?.toLowerCase().trim(),
      designation: p.designation?.trim() || null,
      order:       i,
      color:       p.color || '#3B82F6',
      status:      i === 0 ? 'sent' : 'pending',
      token:       i === 0 ? firstToken : null,
      emailSentAt: i === 0 ? new Date() : null,
      tokenExpiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
    }));

    await doc.save();

    // ── Audit log: created ─────────────────────────────────────
    await AuditLog.createLog({
      document_id:    doc._id,
      document_title: doc.title,
      company_name:   doc.companyName,
      action:         'sent',
      performed_by: {
        user_id:     req.user._id,
        name:        req.user.full_name,
        email:       req.user.email,
        designation: req.user.designation,
        role:        'owner',
      },
      cc_list: parsedCC.map(cc => ({
        name:        cc.name,
        email:       cc.email,
        designation: cc.designation,
      })),
      details: {
        total_parties: parsedParties.length,
        total_fields:  parsedFields.length,
      },
    });

    // ── Send first party email ─────────────────────────────────
    const first = doc.parties[0];
    await sendSigningEmail({
      recipientEmail:      first.email,
      recipientName:       first.name,
      recipientDesignation:first.designation,
      senderName:          req.user.full_name,
      senderDesignation:   req.user.designation,
      documentTitle:       doc.title,
      signingLink:         `${FRONT()}/sign/${firstToken}`,
      companyLogoUrl:      doc.companyLogo,
      companyName:         doc.companyName,
      partyNumber:         1,
      totalParties:        parsedParties.length,
      message:             doc.message,
      ccList:              parsedCC,
    });

    // ── Notify CC recipients ───────────────────────────────────
    for (const cc of parsedCC) {
      try {
        await sendCCEmail({
          recipientEmail:      cc.email,
          recipientName:       cc.name,
          recipientDesignation:cc.designation,
          documentTitle:       doc.title,
          senderName:          req.user.full_name,
          senderDesignation:   req.user.designation,
          companyLogoUrl:      doc.companyLogo,
          companyName:         doc.companyName,
          parties:             parsedParties,
        });
      } catch (e) {
        console.error(`[CC email] ${cc.email}:`, e.message);
      }
    }

    // ── Socket emit ────────────────────────────────────────────
    emitSocket(req, 'document:created', {
      documentId: doc._id,
      ownerId:    req.user.id,
      title:      doc.title,
      status:     doc.status,
    });

    return res.json({ success: true, document: doc });
  } catch (err) {
    console.error('[POST /upload-and-send]', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// 7. VALIDATE TOKEN (Signer opens link)
// ═══════════════════════════════════════════════════════════════
router.get('/sign/validate/:token', async (req, res) => {
  try {
    const token = req.params.token;
    const doc   = await Document.findOne({ 'parties.token': token });

    if (!doc) {
      return res.status(404).json({
        success: false,
        code:    'INVALID_LINK',
        message: 'This signing link is invalid or has expired.',
      });
    }

    const idx   = doc.parties.findIndex(p => p.token === token);
    const party = doc.parties[idx];

    // Token expiry check
    if (party.tokenExpiresAt && new Date() > party.tokenExpiresAt) {
      return res.status(410).json({
        success: false,
        code:    'LINK_EXPIRED',
        message: 'This signing link has expired.',
      });
    }

    // Already signed
    if (party.status === 'signed') {
      return res.status(410).json({
        success: false,
        code:    'ALREADY_SIGNED',
        message: 'This document has already been signed.',
      });
    }

    // Get device + geo info
    const ip     = getIP(req);
    const ua     = req.headers['user-agent'] || '';
    const device = parseDevice(ua);
    const geo    = await getGeoLocation(ip);

    // Track link click
    party.linkClickedAt  = party.linkClickedAt || new Date();
    party.linkClickCount = (party.linkClickCount || 0) + 1;
    party.status         = 'viewed';
    party.ipAddress      = ip;

    if (device.device)  party.device  = device.device;
    if (device.browser) party.browser = device.browser;
    if (device.os)      party.os      = device.os;

    if (geo) {
      party.city       = geo.city;
      party.region     = geo.region;
      party.country    = geo.country;
      party.postalCode = geo.postalCode;
      party.timezone   = geo.timezone;
    }

    await doc.save();

    // Audit log
    await AuditLog.createLog({
      document_id:    doc._id,
      document_title: doc.title,
      company_name:   doc.companyName,
      action:         'link_clicked',
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
      location: {
        ip_address:  ip,
        city:        geo?.city,
        region:      geo?.region,
        country:     geo?.country,
        postal_code: geo?.postalCode,
        timezone:    geo?.timezone,
        display:     geo?.display,
      },
    });

    // Socket emit
    const io = req.app.get('io');
    if (io) {
      io.emit('document:party_viewed', {
        documentId:  String(doc._id),
        partyIndex:  idx,
        partyEmail:  party.email,
        partyName:   party.name,
        device:      device.device,
        location:    geo?.display,
      });
    }

    // Return document (without other parties' tokens)
    const safeDoc = doc.toObject();
    safeDoc.parties = safeDoc.parties.map((p, i) => ({
      ...p,
      token: i === idx ? p.token : undefined,
    }));

    return res.json({
      success:  true,
      document: safeDoc,
      party:    { ...party.toObject(), index: idx },
      geo:      geo || {},
    });
  } catch (err) {
    console.error('[GET /sign/validate/:token]', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// 8. SUBMIT SIGNATURE
// ═══════════════════════════════════════════════════════════════
router.post('/sign/submit', async (req, res) => {
  try {
    const { token, fields, clientTime } = req.body;

    if (!token || !fields) {
      return res.status(400).json({
        success: false, message: 'Token and fields are required.',
      });
    }

    const doc = await Document.findOne({ 'parties.token': token });
    if (!doc) {
      return res.status(404).json({
        success: false,
        code:    'SESSION_EXPIRED',
        message: 'Signing session expired or invalid.',
      });
    }

    const idx   = doc.parties.findIndex(p => p.token === token);
    const party = doc.parties[idx];

    if (party.status === 'signed') {
      return res.status(409).json({
        success: false,
        code:    'ALREADY_SIGNED',
        message: 'Already signed.',
      });
    }

    // Get device + geo
    const ip     = getIP(req);
    const ua     = req.headers['user-agent'] || '';
    const device = parseDevice(ua);
    const geo    = await getGeoLocation(ip);
    const localTime = geo?.timezone
      ? getLocalTime(geo.timezone)
      : (clientTime || new Date().toUTCString());

    // Update party
    party.status          = 'signed';
    party.signedAt        = new Date();
    party.token           = null;
    party.ipAddress       = ip;
    party.device          = device.device;
    party.browser         = device.browser;
    party.os              = device.os;
    party.localSignedTime = localTime;

    if (geo) {
      party.city       = geo.city;
      party.region     = geo.region;
      party.country    = geo.country;
      party.postalCode = geo.postalCode;
      party.timezone   = geo.timezone;
    }

    // Update fields
    doc.fields = fields;

    // ── Check if more signers ──────────────────────────────────
    const nextIdx = idx + 1;
    const hasNext = nextIdx < doc.parties.length;

    if (hasNext) {
      // Send to next party
      const nextToken = crypto.randomBytes(32).toString('hex');
      doc.parties[nextIdx].token       = nextToken;
      doc.parties[nextIdx].status      = 'sent';
      doc.parties[nextIdx].emailSentAt = new Date();
      doc.parties[nextIdx].tokenExpiresAt =
        new Date(Date.now() + 72 * 60 * 60 * 1000);
      doc.currentPartyIndex = nextIdx;

      await doc.save();

      // Audit log
      await AuditLog.createLog({
        document_id:    doc._id,
        document_title: doc.title,
        company_name:   doc.companyName,
        action:         'signed',
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
        },
        location: {
          ip_address:  ip,
          city:        geo?.city,
          region:      geo?.region,
          country:     geo?.country,
          postal_code: geo?.postalCode,
          timezone:    geo?.timezone,
          display:     geo?.display,
        },
        local_time:            localTime,
        local_datetime_display:localTime,
        cc_list: doc.ccList.map(cc => ({
          name:        cc.name,
          email:       cc.email,
          designation: cc.designation,
        })),
      });

      // Send next signer email
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

      // Socket emit
      emitSocket(req, 'document:party_signed', {
        documentId:  String(doc._id),
        partyIndex:  idx,
        partyName:   party.name,
        partyEmail:  party.email,
        device:      device.device,
        location:    geo?.display,
        localTime,
        nextSigner:  nextParty.email,
      });

      return res.json({
        success: true,
        next:    true,
        message: `Document sent to next signer: ${nextParty.name}`,
        signerInfo: {
          name:     party.name,
          device:   device.device,
          location: geo?.display || 'Unknown',
          time:     localTime,
        },
      });

    } else {
      // ── ALL SIGNED → Complete ──────────────────────────────────
      doc.status      = 'completed';
      doc.completedAt = new Date();
      await doc.save();

      // Audit log: completed
      await AuditLog.createLog({
        document_id:    doc._id,
        document_title: doc.title,
        company_name:   doc.companyName,
        action:         'signed',
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
          ip_address:  ip,
          city:        geo?.city,
          region:      geo?.region,
          country:     geo?.country,
          postal_code: geo?.postalCode,
          timezone:    geo?.timezone,
          display:     geo?.display,
        },
        local_time:            localTime,
        local_datetime_display:localTime,
        cc_list: doc.ccList.map(cc => ({
          name:        cc.name,
          email:       cc.email,
          designation: cc.designation,
        })),
      });

      // Socket emit
      emitSocket(req, 'document:completed', {
        documentId:  String(doc._id),
        ownerId:     String(doc.owner),
        title:       doc.title,
        completedAt: doc.completedAt,
      });

      // Finalize in background (non-blocking)
      _finalizeDocument(req, doc).catch(e =>
        console.error('[finalize]', e.message)
      );

      return res.json({
        success:   true,
        completed: true,
        message:   'Document signed and completed!',
        signerInfo: {
          name:     party.name,
          device:   device.device,
          location: geo?.display || 'Unknown',
          time:     localTime,
        },
      });
    }
  } catch (err) {
    console.error('[POST /sign/submit]', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// INTERNAL — Finalize document (PDF + emails)
// Runs in background after response sent
// ═══════════════════════════════════════════════════════════════
async function _finalizeDocument(req, doc) {
  try {
    console.log(`📑 Finalizing: ${doc._id}`);

    // 1. Merge signatures into PDF
    const mergedBytes = await mergeSignaturesIntoPDF(doc.fileUrl, doc.fields);

    // 2. Append audit page with full details
    const finalBuffer = await appendAuditPage(mergedBytes, doc);

    // 3. Upload to Cloudinary
    const uploaded = await uploadToCloudinary(finalBuffer, {
      resource_type: 'raw',
      folder:        'nexsign/completed',
      public_id:     `signed_${doc._id}_${Date.now()}`,
      format:        'pdf',
    });

    // 4. Save signed URL
    doc.signedFileUrl = uploaded.secure_url;
    await doc.save();

    console.log(`✅ Signed PDF: ${uploaded.secure_url}`);

    // 5. Build parties with audit info for email
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

    // 6. Send completion email to all signers
    for (const party of doc.parties) {
      try {
        await sendCompletionEmail({
          recipientEmail:      party.email,
          recipientName:       party.name,
          recipientDesignation:party.designation,
          documentTitle:       doc.title,
          pdfBuffer:           finalBuffer,
          signedPdfUrl:        uploaded.secure_url,
          companyLogoUrl:      doc.companyLogo,
          companyName:         doc.companyName,
          parties:             partiesWithAudit,
          ccList:              doc.ccList,
          isCC:                false,
        });
        console.log(`📧 Completion → ${party.email}`);
      } catch (e) {
        console.error(`[completion email] ${party.email}:`, e.message);
      }
    }

    // 7. Send to CC with designation
    for (const cc of doc.ccList) {
      try {
        await sendCompletionEmail({
          recipientEmail:      cc.email,
          recipientName:       cc.name,
          recipientDesignation:cc.designation,
          documentTitle:       doc.title,
          pdfBuffer:           finalBuffer,
          signedPdfUrl:        uploaded.secure_url,
          companyLogoUrl:      doc.companyLogo,
          companyName:         doc.companyName,
          parties:             partiesWithAudit,
          ccList:              doc.ccList,
          isCC:                true,
        });
        console.log(`📧 CC completion → ${cc.email} (${cc.designation || 'N/A'})`);
      } catch (e) {
        console.error(`[CC completion] ${cc.email}:`, e.message);
      }
    }

    // 8. Audit log: completed
    await AuditLog.createLog({
      document_id:    doc._id,
      document_title: doc.title,
      company_name:   doc.companyName,
      action:         'completed',
      performed_by: {
        name:  'System',
        role:  'system',
      },
      details: {
        signed_pdf_url:  uploaded.secure_url,
        total_signers:   doc.parties.length,
        cc_count:        doc.ccList.length,
      },
      cc_list: doc.ccList.map(cc => ({
        name:        cc.name,
        email:       cc.email,
        designation: cc.designation,
      })),
    });

    // Socket emit
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

// ═══════════════════════════════════════════════════════════════
// 9. PROXY PDF (bypass CORS)
// ═══════════════════════════════════════════════════════════════
router.get('/sign/:token/pdf', async (req, res) => {
  try {
    const doc = await Document.findOne({ 'parties.token': req.params.token })
      .select('fileUrl title')
      .lean();

    if (!doc) return res.status(404).send('Not found');

    const response = await fetch(doc.fileUrl);
    if (!response.ok) return res.status(502).send('PDF fetch failed');

    const buffer = await response.arrayBuffer();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${doc.title || 'document'}.pdf"`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=3600');

    return res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('[GET /sign/:token/pdf]', err.message);
    return res.status(500).send(err.message);
  }
});

// ═══════════════════════════════════════════════════════════════
// 10. DELETE DOCUMENT
// ═══════════════════════════════════════════════════════════════
router.delete('/:id', auth, async (req, res) => {
  try {
    const doc = await Document.findOne({
      _id:   req.params.id,
      owner: req.user.id,
    });

    if (!doc) {
      return res.status(404).json({
        success: false, message: 'Document not found.',
      });
    }

    // Only delete draft or completed
    if (doc.status === 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a document that is currently in progress.',
      });
    }

    // Delete from Cloudinary
    try {
      if (doc.fileId) {
        await cloudinary.uploader.destroy(doc.fileId, { resource_type: 'raw' });
      }
    } catch (e) {
      console.error('[Cloudinary delete]', e.message);
    }

    await Document.findByIdAndDelete(doc._id);

    await AuditLog.createLog({
      document_id:    doc._id,
      document_title: doc.title,
      action:         'deleted',
      performed_by: {
        user_id:     req.user._id,
        name:        req.user.full_name,
        email:       req.user.email,
        designation: req.user.designation,
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

module.exports = router;