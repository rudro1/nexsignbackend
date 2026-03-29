const express = require('express');
const router = express.Router();
const multer = require('multer');
const crypto = require('crypto');
const { v2: cloudinary } = require('cloudinary');
const Document = require('../models/Document');
const auth = require('../middleware/auth');
const { 
  sendSigningEmail, 
  sendCompletionEmail, 
  sendCCEmail 
} = require('../utils/emailService');
const { 
  mergeSignaturesIntoPDF, 
  appendAuditPage 
} = require('../utils/pdfService');

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload  = multer({ storage, limits: { fileSize: 15 * 1024 * 1024 } });

// ════════════════════════════════════════════════════════════════
// 1. GET ALL DOCUMENTS (For Dashboard)
// ════════════════════════════════════════════════════════════════
router.get('/', auth, async (req, res) => {
  try {
    const documents = await Document.find({ 
      owner: req.user.id,
      isTemplate: false 
    }).sort({ updatedAt: -1 });

    res.json({ success: true, documents });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
// 2. UPLOAD PDF & CREATE DRAFT
// ════════════════════════════════════════════════════════════════
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: 'raw', folder: 'nexsign/documents' },
        (error, res) => error ? reject(error) : resolve(res)
      );
      stream.end(req.file.buffer);
    });

    const doc = new Document({
      owner:   req.user.id,
      title:   req.file.originalname.replace(/\.pdf$/i, ''),
      fileUrl: result.secure_url,
      fileId:  result.public_id,
      status:  'draft',
    });

    await doc.save();
    res.status(201).json({ success: true, document: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
// 3. UPLOAD COMPANY LOGO
// ════════════════════════════════════════════════════════════════
router.post('/upload-logo', auth, upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No logo uploaded' });

    const result = await cloudinary.uploader.upload(`data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`, {
      folder: 'nexsign/logos',
    });

    res.json({ success: true, logoUrl: result.secure_url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
// 4. GET SINGLE DOCUMENT
// ════════════════════════════════════════════════════════════════
router.get('/:id', auth, async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, owner: req.user.id });
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    res.json({ success: true, document: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
// 4a. GET DOCUMENT AUDIT LOG
// ════════════════════════════════════════════════════════════════
router.get('/:id/audit', auth, async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, owner: req.user.id });
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    // Construct events from document history
    const events = [
      { eventType: 'Document Created', occurredAt: doc.createdAt, actorName: 'System' }
    ];

    doc.parties.forEach(p => {
      if (p.emailSentAt) {
        events.push({ 
          eventType: 'Email Sent', 
          occurredAt: p.emailSentAt, 
          actorName: p.name, 
          actorEmail: p.email 
        });
      }
      if (p.linkOpenedAt) {
        events.push({ 
          eventType: 'Link Opened', 
          occurredAt: p.linkOpenedAt, 
          actorName: p.name, 
          actorEmail: p.email,
          ipAddress: p.ipAddress 
        });
      }
      if (p.signedAt) {
        events.push({ 
          eventType: 'Document Signed', 
          occurredAt: p.signedAt, 
          actorName: p.name, 
          actorEmail: p.email,
          ipAddress: p.ipAddress 
        });
      }
    });

    if (doc.status === 'completed') {
      events.push({ 
        eventType: 'Document Completed', 
        occurredAt: doc.completedAt || doc.updatedAt, 
        actorName: 'System' 
      });
    }

    // Sort events by time
    events.sort((a, b) => new Date(a.occurredAt) - new Date(b.occurredAt));

    res.json({ 
      success: true, 
      audit: {
        title: doc.title,
        status: doc.status,
        parties: doc.parties,
        events: events
      } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
// 5. UPDATE DOCUMENT (Save Draft)
// ════════════════════════════════════════════════════════════════
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, parties, fields, ccList, companyLogo, companyName } = req.body;

    const doc = await Document.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      { $set: { title, parties, fields, ccList, companyLogo, companyName } },
      { new: true }
    );

    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    res.json({ success: true, document: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
// 6. SEND FOR SIGNING (Live)
// ════════════════════════════════════════════════════════════════
router.post('/upload-and-send', auth, upload.single('file'), async (req, res) => {
  try {
    const { 
      title, parties, fields, ccRecipients, 
      totalPages, companyName, companyLogo, docId 
    } = req.body;

    let doc;
    if (docId && docId !== 'undefined') {
      doc = await Document.findById(docId);
    }

    if (!doc && req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: 'raw', folder: 'nexsign/documents' },
          (error, res) => error ? reject(error) : resolve(res)
        );
        stream.end(req.file.buffer);
      });
      doc = new Document({ owner: req.user.id, fileUrl: result.secure_url, fileId: result.public_id });
    }

    if (!doc) return res.status(400).json({ error: 'Document not found' });

    const parsedParties = JSON.parse(parties);
    const firstPartyToken = crypto.randomBytes(32).toString('hex');
    
    doc.title       = title;
    doc.parties     = parsedParties.map((p, i) => ({
      ...p,
      token:  i === 0 ? firstPartyToken : null,
      status: i === 0 ? 'sent' : 'pending',
      emailSentAt: i === 0 ? new Date() : null
    }));
    doc.fields      = JSON.parse(fields);
    doc.ccList      = JSON.parse(ccRecipients || '[]');
    doc.totalPages  = Number(totalPages);
    doc.companyName = companyName;
    doc.companyLogo = companyLogo;
    doc.status      = 'in_progress';
    doc.currentPartyIndex = 0;

    await doc.save();

    // Send first email
    console.log('📤 Attempting to send signing email to:', doc.parties[0].email);
    const frontendUrl = (process.env.FRONTEND_URL || 'https://nexsignfrontend.vercel.app').replace(/\/$/, '');
    await sendSigningEmail({
      recipientEmail: doc.parties[0].email,
      recipientName:  doc.parties[0].name,
      documentTitle:  doc.title,
      senderName:     req.user.full_name || 'Admin',
      signingLink:    `${frontendUrl}/sign/${firstPartyToken}`,
      companyLogoUrl: doc.companyLogo,
      companyName:    doc.companyName,
    });

    res.json({ success: true, document: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
// 7. VALIDATE TOKEN & GET SIGNING DATA
// ════════════════════════════════════════════════════════════════
router.get('/sign/validate/:token', async (req, res) => {
  try {
    const doc = await Document.findOne({ 'parties.token': req.params.token });
    if (!doc) return res.status(404).json({ success: false, message: 'Invalid or expired link' });

    const partyIdx = doc.parties.findIndex(p => p.token === req.params.token);
    
    // Set link opened metadata
    if (!doc.parties[partyIdx].linkOpenedAt) {
      doc.parties[partyIdx].linkOpenedAt = new Date();
      doc.parties[partyIdx].linkOpenCount = (doc.parties[partyIdx].linkOpenCount || 0) + 1;
      doc.parties[partyIdx].ipAddress = req.ip || req.headers['x-forwarded-for'] || 'Unknown';
      await doc.save();
    } else {
      doc.parties[partyIdx].linkOpenCount = (doc.parties[partyIdx].linkOpenCount || 0) + 1;
      await doc.save();
    }

    const party = doc.parties[partyIdx];

    res.json({ 
      success: true, 
      document: doc, 
      party: { ...party.toObject(), index: partyIdx } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
// 8. SUBMIT SIGNATURE
// ════════════════════════════════════════════════════════════════
router.post('/sign/submit', async (req, res) => {
  try {
    const { token, fields } = req.body;
    const doc = await Document.findOne({ 'parties.token': token });
    if (!doc) return res.status(404).json({ success: false, message: 'Session expired' });

    const idx = doc.parties.findIndex(p => p.token === token);
    doc.parties[idx].status = 'signed';
    doc.parties[idx].signedAt = new Date();
    doc.parties[idx].token = null;
    
    // Update global fields with signatures
    doc.fields = fields;

    if (idx + 1 < doc.parties.length) {
      // Send to next signer
      const nextToken = crypto.randomBytes(32).toString('hex');
      doc.parties[idx + 1].token = nextToken;
      doc.parties[idx + 1].status = 'sent';
      doc.parties[idx + 1].emailSentAt = new Date();
      doc.currentPartyIndex = idx + 1;
      await doc.save();

      const frontendUrl = (process.env.FRONTEND_URL || 'https://nexsignfrontend.vercel.app').replace(/\/$/, '');
      await sendSigningEmail({
        recipientEmail: doc.parties[idx+1].email,
        recipientName:  doc.parties[idx+1].name,
        documentTitle:  doc.title,
        senderName:     'Admin', // could be improved
        signingLink:    `${frontendUrl}/sign/${nextToken}`,
        companyLogoUrl: doc.companyLogo,
        companyName:    doc.companyName,
      });

      res.json({ success: true, next: true });
    } else {
      // Completed!
      doc.status = 'completed';
      doc.completedAt = new Date();
      await doc.save();

      // Generate final PDF in background
      (async () => {
        try {
          const mergedPdfBytes = await mergeSignaturesIntoPDF(doc.fileUrl, doc.fields);
          const finalPdfBytes  = await appendAuditPage(mergedPdfBytes, doc);

          // Upload final to Cloudinary
          const uploadRes = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { resource_type: 'raw', folder: 'nexsign/completed' },
              (err, res) => err ? reject(err) : resolve(res)
            );
            stream.end(Buffer.from(finalPdfBytes));
          });

          doc.signedFileUrl = uploadRes.secure_url;
          await doc.save();

          // Send to all signers
          for (const party of doc.parties) {
            await sendCompletionEmail({
              recipientEmail: party.email,
              recipientName:  party.name,
              documentTitle:  doc.title,
              signedPdfUrl:   doc.signedFileUrl,
              companyLogoUrl: doc.companyLogo,
              companyName:    doc.companyName,
            });
          }

          // Send to CC list
          for (const cc of doc.ccList) {
            await sendCCEmail({
              recipientEmail: cc.email,
              recipientName:  cc.name,
              documentTitle:  doc.title,
              senderName:     'Admin',
              companyLogoUrl: doc.companyLogo,
              companyName:    doc.companyName,
            });
          }
        } catch (err) {
          console.error('Finalization Error:', err.message);
        }
      })();

      res.json({ success: true, completed: true });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
// 9. TEMPLATES
// ════════════════════════════════════════════════════════════════
router.get('/templates', auth, async (req, res) => {
  try {
    const templates = await Document.find({ 
      owner: req.user.id,
      isTemplate: true 
    }).sort({ updatedAt: -1 });
    res.json({ success: true, templates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/templates', auth, upload.single('file'), async (req, res) => {
  try {
    const { title, fields, party1 } = req.body;
    if (!req.file) return res.status(400).json({ error: 'PDF required' });

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: 'raw', folder: 'nexsign/templates' },
        (error, res) => error ? reject(error) : resolve(res)
      );
      stream.end(req.file.buffer);
    });

    const tpl = new Document({
      owner:      req.user.id,
      title:      title,
      fileUrl:    result.secure_url,
      fileId:     result.public_id,
      fields:     JSON.parse(fields),
      isTemplate: true,
      templateName: title,
    });

    await tpl.save();
    res.status(201).json({ success: true, template: tpl });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/templates/:id/use', auth, async (req, res) => {
  try {
    const tpl = await Document.findById(req.params.id);
    if (!tpl) return res.status(404).json({ error: 'Template not found' });

    const { signers, ccList } = req.body;
    const firstPartyToken = crypto.randomBytes(32).toString('hex');

    const doc = new Document({
      owner:      req.user.id,
      title:      tpl.title,
      fileUrl:    tpl.fileUrl,
      fileId:     tpl.fileId,
      fields:     tpl.fields,
      parties:    signers.map((s, i) => ({
        ...s,
        token:  i === 0 ? firstPartyToken : null,
        status: i === 0 ? 'sent' : 'pending'
      })),
      ccList:     ccList || [],
      status:     'in_progress',
      currentPartyIndex: 0,
      sourceTemplateId:  tpl._id,
    });

    await doc.save();
    tpl.usageCount = (tpl.usageCount || 0) + 1;
    await tpl.save();

    const frontendUrl = (process.env.FRONTEND_URL || 'https://nexsignfrontend.vercel.app').replace(/\/$/, '');
    await sendSigningEmail({
      recipientEmail: doc.parties[0].email,
      recipientName:  doc.parties[0].name,
      documentTitle:  doc.title,
      senderName:     req.user.full_name || 'Admin',
      signingLink:    `${frontendUrl}/sign/${firstPartyToken}`,
      companyLogoUrl: tpl.companyLogo,
      companyName:    tpl.companyName,
    });

    res.json({ success: true, document: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
// 10. PROXY PDF FOR SIGNING (Bypass CORS/Headers)
// ════════════════════════════════════════════════════════════════
router.get('/sign/:token/pdf', async (req, res) => {
  try {
    const doc = await Document.findOne({ 'parties.token': req.params.token });
    if (!doc) return res.status(404).send('Not found');

    const response = await fetch(doc.fileUrl);
    const buffer   = await response.arrayBuffer();

    // Headers to allow embedding in iframe
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="document.pdf"');
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Content-Security-Policy', "frame-ancestors 'self' https://nexsignfrontend.vercel.app *;");
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    res.send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
