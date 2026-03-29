// server/controllers/templateController.js
const mongoose        = require('mongoose');
const crypto          = require('crypto');
const Template        = require('../models/Template');
const TemplateSession = require('../models/TemplateSession');
const User            = require('../models/User');
const AuditLog        = require('../models/AuditLog');
const {
  embedBossSignature,
  generateEmployeePdf,
  appendAuditPage,
}                     = require('../utils/pdfService');
const {
  sendBossApprovalEmail,
  sendEmployeeSigningEmail,
  sendCompletionEmail,
  sendCCEmail,
  sendDeclinedEmail,
}                     = require('../utils/emailService');

// ─── helpers ──────────────────────────────────────────────────────
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const generateToken = () => crypto.randomBytes(32).toString('hex');

const getDeviceInfo = (ua = '') => {
  const isMobile = /mobile|android|iphone|ipad/i.test(ua);
  const browser  =
    /chrome/i.test(ua)  ? 'Chrome'  :
    /firefox/i.test(ua) ? 'Firefox' :
    /safari/i.test(ua)  ? 'Safari'  :
    /edge/i.test(ua)    ? 'Edge'    : 'Unknown';
  const os =
    /windows/i.test(ua)  ? 'Windows' :
    /mac/i.test(ua)      ? 'macOS'   :
    /linux/i.test(ua)    ? 'Linux'   :
    /android/i.test(ua)  ? 'Android' :
    /iphone|ipad/i.test(ua) ? 'iOS'  : 'Unknown';
  const device =
    /iphone 6/i.test(ua)  ? 'iPhone 6'  :
    /iphone 14/i.test(ua) ? 'iPhone 14' :
    /iphone/i.test(ua)    ? 'iPhone'    :
    /ipad/i.test(ua)      ? 'iPad'      :
    /android/i.test(ua)   ? 'Android Device' : os;

  return { browser, os, device, isMobile };
};

const getLocalTime = (timezone = 'UTC') => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone:    timezone,
      year:        'numeric', month: 'short',  day:    '2-digit',
      hour:        '2-digit', minute: '2-digit', hour12: true,
    }).format(new Date());
  } catch {
    return new Date().toUTCString();
  }
};

// ─── Get geo info from IP ──────────────────────────────────────────
const getGeoInfo = async (ip) => {
  try {
    const cleanIp = ip?.replace('::ffff:', '') || '';
    if (!cleanIp || cleanIp === '127.0.0.1' || cleanIp === '::1') {
      return { city: 'Local', country: 'Dev', postalCode: '0000', timezone: 'UTC' };
    }
    const res  = await fetch(`http://ip-api.com/json/${cleanIp}?fields=city,country,zip,regionName,timezone,lat,lon`);
    const data = await res.json();
    return {
      city:       data.city       || '',
      country:    data.country    || '',
      postalCode: data.zip        || '',
      region:     data.regionName || '',
      timezone:   data.timezone   || 'UTC',
      lat:        data.lat        || null,
      lon:        data.lon        || null,
    };
  } catch {
    return {};
  }
};

// ════════════════════════════════════════════════════════════════
// CREATE TEMPLATE
// POST /api/templates
// ════════════════════════════════════════════════════════════════
const createTemplate = asyncHandler(async (req, res) => {
  const {
    title, description, fileUrl, filePublicId,
    bossFields, employeeFields,
    recipients, ccList,
    signingConfig, totalPages,
  } = req.body;

  if (!title)   return res.status(400).json({ message: 'Title is required' });
  if (!fileUrl) return res.status(400).json({ message: 'PDF file is required' });
  if (!recipients?.length)
    return res.status(400).json({ message: 'At least one recipient is required' });

  // Validate unique emails
  const emails = recipients.map(r => r.email?.toLowerCase());
  const unique = new Set(emails);
  if (unique.size !== emails.length)
    return res.status(400).json({ message: 'Duplicate recipient emails found' });

  const template = await Template.create({
    title,
    description:    description || '',
    owner:          req.user._id,
    fileUrl,
    filePublicId:   filePublicId || '',
    bossFields:     bossFields     || [],
    employeeFields: employeeFields || [],
    recipients,
    ccList:         ccList         || [],
    signingConfig:  signingConfig  || {},
    totalPages:     totalPages     || 1,
    status:         signingConfig?.bossSignsFirst !== false ? 'boss_pending' : 'active',
    stats: {
      totalRecipients: recipients.length,
      pending:         recipients.length,
      signed:          0,
      declined:        0,
      viewed:          0,
    },
  });

  // If boss signs first → send boss approval email
  if (template.signingConfig.bossSignsFirst) {
    const boss = await User.findById(req.user._id);
    try {
      await sendBossApprovalEmail({
        bossName:    boss?.full_name || boss?.name || 'Boss',
        bossEmail:   boss?.email,
        templateId:  template._id.toString(),
        title:       template.title,
        totalCount:  recipients.length,
      });
    } catch (e) {
      console.error('Boss email failed:', e.message);
    }
  }

  res.status(201).json({
    message:  'Template created successfully',
    template: template.toJSON(),
  });
});

// ════════════════════════════════════════════════════════════════
// GET ALL TEMPLATES (owner)
// GET /api/templates
// ════════════════════════════════════════════════════════════════
const getTemplates = asyncHandler(async (req, res) => {
  const {
    status, page = 1, limit = 20, search,
  } = req.query;

  const filter = {
    owner:     req.user._id,
    isDeleted: false,
  };
  if (status)  filter.status = status;
  if (search)  filter.title  = { $regex: search, $options: 'i' };

  const skip      = (Number(page) - 1) * Number(limit);
  const [templates, total] = await Promise.all([
    Template.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean({ virtuals: true }),
    Template.countDocuments(filter),
  ]);

  res.json({
    templates,
    pagination: {
      total,
      page:       Number(page),
      limit:      Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
});

// ════════════════════════════════════════════════════════════════
// GET SINGLE TEMPLATE
// GET /api/templates/:id
// ════════════════════════════════════════════════════════════════
const getTemplate = asyncHandler(async (req, res) => {
  const template = await Template.findOne({
    _id:       req.params.id,
    isDeleted: false,
  })
    .populate('owner', 'full_name email')
    .lean({ virtuals: true });

  if (!template)
    return res.status(404).json({ message: 'Template not found' });

  // Only owner or admin can view
  if (
    template.owner._id.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin' && req.user.role !== 'super_admin'
  ) {
    return res.status(403).json({ message: 'Access denied' });
  }

  // Attach session stats
  const sessionStats = await TemplateSession.getTemplateStats(template._id);

  res.json({ template: { ...template, sessionStats } });
});

// ════════════════════════════════════════════════════════════════
// UPDATE TEMPLATE (draft only)
// PUT /api/templates/:id
// ════════════════════════════════════════════════════════════════
const updateTemplate = asyncHandler(async (req, res) => {
  const template = await Template.findOne({
    _id:       req.params.id,
    owner:     req.user._id,
    isDeleted: false,
  });

  if (!template)
    return res.status(404).json({ message: 'Template not found' });

  if (!['draft', 'boss_pending'].includes(template.status))
    return res.status(400).json({ message: 'Cannot edit an active or completed template' });

  const allowed = [
    'title', 'description', 'bossFields', 'employeeFields',
    'recipients', 'ccList', 'signingConfig', 'totalPages',
  ];
  allowed.forEach(key => {
    if (req.body[key] !== undefined) template[key] = req.body[key];
  });

  await template.save();
  res.json({ message: 'Template updated', template: template.toJSON() });
});

// ════════════════════════════════════════════════════════════════
// DELETE TEMPLATE (soft)
// DELETE /api/templates/:id
// ════════════════════════════════════════════════════════════════
const deleteTemplate = asyncHandler(async (req, res) => {
  const template = await Template.findOne({
    _id:       req.params.id,
    owner:     req.user._id,
    isDeleted: false,
  });

  if (!template)
    return res.status(404).json({ message: 'Template not found' });

  await template.softDelete();
  res.json({ message: 'Template deleted successfully' });
});

// ════════════════════════════════════════════════════════════════
// BOSS SIGNS TEMPLATE
// POST /api/templates/:id/boss-sign
// ════════════════════════════════════════════════════════════════
const bossSign = asyncHandler(async (req, res) => {
  const { signatureDataUrl, fieldValues } = req.body;

  if (!signatureDataUrl)
    return res.status(400).json({ message: 'Signature is required' });

  const template = await Template.findOne({
    _id:       req.params.id,
    owner:     req.user._id,
    isDeleted: false,
  });

  if (!template)
    return res.status(404).json({ message: 'Template not found' });

  if (template.status !== 'boss_pending' && template.status !== 'draft')
    return res.status(400).json({ message: 'Template is not awaiting boss signature' });

  // ── Get IP + geo + device ──────────────────────────────────
  const ip         = req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
  const ua         = req.headers['user-agent'] || '';
  const geo        = await getGeoInfo(ip);
  const deviceInfo = getDeviceInfo(ua);
  const localTime  = getLocalTime(geo.timezone);

  // ── Embed boss signature into PDF ─────────────────────────
  let bossSignedFileUrl = template.fileUrl;
  try {
    bossSignedFileUrl = await embedBossSignature({
      fileUrl:       template.fileUrl,
      signatureDataUrl,
      fields:        template.bossFields,
      fieldValues:   fieldValues || [],
    });
  } catch (e) {
    console.error('Boss PDF embed failed:', e.message);
    // Continue with original PDF if embedding fails
  }

  // ── Update template ────────────────────────────────────────
  template.bossSignature = {
    dataUrl:    signatureDataUrl,
    signedAt:   new Date(),
    ipAddress:  ip,
    location:   `${geo.city || ''}, ${geo.country || ''}`.trim(),
    deviceInfo: { ...deviceInfo, ...geo },
  };
  template.bossSignedFileUrl = bossSignedFileUrl;
  template.status            = 'active';
  await template.save();

  // ── Create sessions for all recipients ────────────────────
  const expiryDays = template.signingConfig?.expiryDays || 30;
  const expiresAt  = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

  const sessions = await TemplateSession.insertMany(
    template.recipients.map(r => ({
      template:             template._id,
      recipientName:        r.name,
      recipientEmail:       r.email,
      recipientDesignation: r.designation || '',
      token:                generateToken(),
      status:               'pending',
      expiresAt,
      auditLog: [{
        action:    'link_sent',
        timestamp: new Date(),
      }],
    })),
  );

  // ── Send emails to all employees ───────────────────────────
  const emailPromises = sessions.map(session =>
    sendEmployeeSigningEmail({
      recipientName:  session.recipientName,
      recipientEmail: session.recipientEmail,
      templateTitle:  template.title,
      signingUrl:     `${process.env.FRONTEND_URL}/template-sign/${session.token}`,
      bossName:       req.user.full_name || req.user.name || 'Your Manager',
      expiresAt,
    }).catch(e => console.error(`Email failed for ${session.recipientEmail}:`, e.message)),
  );
  await Promise.allSettled(emailPromises);

  // ── Emit socket event ──────────────────────────────────────
  const io = req.app.get('io');
  io?.to(`user_${req.user._id}`).emit('template:activated', {
    templateId:  template._id,
    title:       template.title,
    totalCount:  sessions.length,
  });

  // ── Audit log ──────────────────────────────────────────────
  await AuditLog.create({
    action:      'boss_signed_template',
    documentId:  template._id,
    userId:      req.user._id,
    signerName:  req.user.full_name || req.user.name,
    signerEmail: req.user.email,
    ipAddress:   ip,
    location:    geo,
    deviceInfo,
    localTime,
  });

  res.json({
    message:      'Boss signed successfully. Employee emails sent.',
    sessionsCount: sessions.length,
    template:      template.toJSON(),
  });
});

// ════════════════════════════════════════════════════════════════
// GET TEMPLATE SESSIONS (owner view)
// GET /api/templates/:id/sessions
// ════════════════════════════════════════════════════════════════
const getTemplateSessions = asyncHandler(async (req, res) => {
  const template = await Template.findOne({
    _id:       req.params.id,
    owner:     req.user._id,
    isDeleted: false,
  });

  if (!template)
    return res.status(404).json({ message: 'Template not found' });

  const { status, page = 1, limit = 50 } = req.query;
  const filter = { template: template._id };
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [sessions, total] = await Promise.all([
    TemplateSession.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean({ virtuals: true }),
    TemplateSession.countDocuments(filter),
  ]);

  const stats = await TemplateSession.getTemplateStats(template._id);

  res.json({
    sessions,
    stats,
    pagination: {
      total,
      page:       Number(page),
      limit:      Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
});

// ════════════════════════════════════════════════════════════════
// GET SESSION BY TOKEN (public — employee view)
// GET /api/templates/sign/:token
// ════════════════════════════════════════════════════════════════
const getSessionByToken = asyncHandler(async (req, res) => {
  const session = await TemplateSession.findByToken(req.params.token);

  if (!session)
    return res.status(404).json({ message: 'Invalid or expired signing link' });

  // Check expiry
  if (new Date() > session.expiresAt) {
    if (session.status !== 'expired') await session.markExpired();
    return res.status(410).json({ message: 'This signing link has expired' });
  }

  if (session.status === 'signed')
    return res.status(400).json({ message: 'Document already signed' });

  if (session.status === 'declined')
    return res.status(400).json({ message: 'You have already declined this document' });

  // Mark as viewed
  const ip         = req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
  const ua         = req.headers['user-agent'] || '';
  const geo        = await getGeoInfo(ip);
  const deviceInfo = getDeviceInfo(ua);

  await session.markViewed({ ipAddress: ip, userAgent: ua, location: geo, deviceInfo });

  // Return session + template (without sensitive boss signature data)
  const template = session.template.toObject
    ? session.template.toObject()
    : session.template;

  res.json({
    session: {
      _id:                  session._id,
      recipientName:        session.recipientName,
      recipientEmail:       session.recipientEmail,
      recipientDesignation: session.recipientDesignation,
      status:               session.status,
      expiresAt:            session.expiresAt,
    },
    template: {
      _id:               template._id,
      title:             template.title,
      description:       template.description,
      // Use boss-signed PDF as base
      fileUrl:           template.bossSignedFileUrl || template.fileUrl,
      employeeFields:    template.employeeFields,
      totalPages:        template.totalPages,
      signingConfig:     template.signingConfig,
    },
  });
});

// ════════════════════════════════════════════════════════════════
// EMPLOYEE SIGN
// POST /api/templates/sign/:token
// ════════════════════════════════════════════════════════════════
const employeeSign = asyncHandler(async (req, res) => {
  const { signatureDataUrl, fieldValues } = req.body;

  if (!signatureDataUrl)
    return res.status(400).json({ message: 'Signature is required' });

  const session = await TemplateSession.findByToken(req.params.token);

  if (!session)
    return res.status(404).json({ message: 'Invalid signing link' });

  if (new Date() > session.expiresAt) {
    await session.markExpired();
    return res.status(410).json({ message: 'Signing link has expired' });
  }

  if (session.status === 'signed')
    return res.status(400).json({ message: 'Already signed' });

  if (session.status === 'declined')
    return res.status(400).json({ message: 'Already declined' });

  // ── Get IP + geo + device ──────────────────────────────────
  const ip         = req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
  const ua         = req.headers['user-agent'] || '';
  const geo        = await getGeoInfo(ip);
  const deviceInfo = getDeviceInfo(ua);
  const localTime  = getLocalTime(geo.timezone);

  const template = await Template.findById(session.template);
  if (!template)
    return res.status(404).json({ message: 'Template not found' });

  // ── Generate individual PDF for this employee ──────────────
  let signedFileUrl = null;
  try {
    signedFileUrl = await generateEmployeePdf({
      baseFileUrl:     template.bossSignedFileUrl || template.fileUrl,
      signatureDataUrl,
      fields:          template.employeeFields,
      fieldValues:     fieldValues || [],
      recipientName:   session.recipientName,
      recipientEmail:  session.recipientEmail,
      auditData: {
        signerName:  session.recipientName,
        signerEmail: session.recipientEmail,
        signedAt:    new Date(),
        ipAddress:   ip,
        location:    geo,
        deviceInfo,
        localTime,
      },
    });
  } catch (e) {
    console.error('PDF generation failed:', e.message);
  }

  // ── Mark session as signed ─────────────────────────────────
  await session.markSigned(signatureDataUrl, fieldValues || [], {
    ipAddress:  ip,
    userAgent:  ua,
    location:   geo,
    deviceInfo,
    localTime,
  });

  if (signedFileUrl) {
    session.signedFileUrl = signedFileUrl;
    await session.save();
  }

  // ── Update template stats ──────────────────────────────────
  await template.recalculateStats();

  // ── Audit log ──────────────────────────────────────────────
  await AuditLog.create({
    action:      'employee_signed_template',
    documentId:  template._id,
    signerName:  session.recipientName,
    signerEmail: session.recipientEmail,
    ipAddress:   ip,
    location:    geo,
    deviceInfo,
    localTime,
  });

  // ── Socket: notify owner ───────────────────────────────────
  const io = req.app.get('io');
  const owner = await User.findById(template.owner);

  io?.to(`user_${template.owner}`).emit('template:signed', {
    templateId:    template._id,
    title:         template.title,
    signerName:    session.recipientName,
    signerEmail:   session.recipientEmail,
    signedCount:   template.stats.signed,
    totalCount:    template.stats.totalRecipients,
    progress:      template.progress,
  });

  // ── Send completion email to owner if all signed ───────────
  if (template.status === 'completed') {
    try {
      await sendCompletionEmail({
        ownerEmail: owner?.email,
        ownerName:  owner?.full_name || owner?.name,
        title:      template.title,
        totalCount: template.stats.totalRecipients,
      });

      // CC emails
      for (const cc of (template.ccList || [])) {
        await sendCCEmail({
          ccName:        cc.name,
          ccEmail:       cc.email,
          documentTitle: template.title,
          message:       `All ${template.stats.totalRecipients} employees have signed "${template.title}".`,
        }).catch(() => {});
      }
    } catch (e) {
      console.error('Completion email failed:', e.message);
    }

    io?.to(`user_${template.owner}`).emit('template:completed', {
      templateId: template._id,
      title:      template.title,
    });
  }

  res.json({
    message:      'Document signed successfully',
    signedFileUrl,
    signerName:   session.recipientName,
  });
});

// ════════════════════════════════════════════════════════════════
// EMPLOYEE DECLINE
// POST /api/templates/sign/:token/decline
// ════════════════════════════════════════════════════════════════
const employeeDecline = asyncHandler(async (req, res) => {
  const { reason = '' } = req.body;

  const session = await TemplateSession.findByToken(req.params.token);
  if (!session)
    return res.status(404).json({ message: 'Invalid signing link' });

  if (['signed', 'declined', 'expired'].includes(session.status))
    return res.status(400).json({ message: `Already ${session.status}` });

  const ip         = req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
  const ua         = req.headers['user-agent'] || '';
  const geo        = await getGeoInfo(ip);
  const deviceInfo = getDeviceInfo(ua);

  await session.markDeclined(reason, { ipAddress: ip, userAgent: ua, location: geo, deviceInfo });

  const template = await Template.findById(session.template);
  if (template) await template.recalculateStats();

  // Notify owner
  const io = req.app.get('io');
  io?.to(`user_${template?.owner}`).emit('template:declined', {
    templateId:  template?._id,
    signerName:  session.recipientName,
    signerEmail: session.recipientEmail,
    reason,
  });

  // Send declined email to owner
  try {
    const owner = await User.findById(template?.owner);
    await sendDeclinedEmail({
      ownerEmail:  owner?.email,
      ownerName:   owner?.full_name || owner?.name,
      signerName:  session.recipientName,
      signerEmail: session.recipientEmail,
      title:       template?.title,
      reason,
    });
  } catch (e) {
    console.error('Declined email failed:', e.message);
  }

  res.json({ message: 'Document declined' });
});

// ════════════════════════════════════════════════════════════════
// RESEND EMAIL to specific session
// POST /api/templates/:id/sessions/:sessionId/resend
// ════════════════════════════════════════════════════════════════
const resendEmail = asyncHandler(async (req, res) => {
  const template = await Template.findOne({
    _id:       req.params.id,
    owner:     req.user._id,
    isDeleted: false,
  });

  if (!template)
    return res.status(404).json({ message: 'Template not found' });

  const session = await TemplateSession.findOne({
    _id:      req.params.sessionId,
    template: template._id,
  });

  if (!session)
    return res.status(404).json({ message: 'Session not found' });

  if (session.status === 'signed')
    return res.status(400).json({ message: 'Recipient has already signed' });

  // Extend expiry by 7 days
  session.expiresAt = new Date(
    Math.max(session.expiresAt.getTime(), Date.now()) + 7 * 24 * 60 * 60 * 1000,
  );
  session.reminderCount++;
  session.lastReminderAt = new Date();
  session.addAuditEntry('reminder_sent');
  await session.save();

  await sendEmployeeSigningEmail({
    recipientName:  session.recipientName,
    recipientEmail: session.recipientEmail,
    templateTitle:  template.title,
    signingUrl:     `${process.env.FRONTEND_URL}/template-sign/${session.token}`,
    bossName:       req.user.full_name || req.user.name || 'Your Manager',
    expiresAt:      session.expiresAt,
    isReminder:     true,
  });

  res.json({ message: `Reminder sent to ${session.recipientEmail}` });
});

// ════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════
module.exports = {
  createTemplate,
  getTemplates,
  getTemplate,
  updateTemplate,
  deleteTemplate,
  bossSign,
  getTemplateSessions,
  getSessionByToken,
  employeeSign,
  employeeDecline,
  resendEmail,
};