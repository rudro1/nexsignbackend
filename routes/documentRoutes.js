// // // // const express = require('express');
// // // // const router = express.Router();
// // // // const Document = require('../models/Document');
// // // // const AuditLog = require('../models/AuditLog');
// // // // const crypto = require('crypto');
// // // // const nodemailer = require('nodemailer');

// // // // // ১. ড্রাফট সেভ বা আপডেট (Save/Update Draft)
// // // // router.post('/', async (req, res) => {
// // // //   try {
// // // //     let doc;
// // // //     if (req.body.id || req.body._id) {
// // // //       doc = await Document.findByIdAndUpdate(req.body.id || req.body._id, req.body, { new: true });
// // // //     } else {
// // // //       doc = new Document(req.body);
// // // //       await doc.save();
      
// // // //       // অডিট লগ তৈরি
// // // //       await AuditLog.create({
// // // //         document_id: doc._id,
// // // //         action: 'created',
// // // //         details: `Document "${doc.title}" created.`
// // // //       });
// // // //     }
// // // //     res.json(doc);
// // // //   } catch (err) {
// // // //     res.status(500).json({ error: err.message });
// // // //   }
// // // // });

// // // // // ২. মেইল পাঠানো ও সাইনিং শুরু (Send for Signing)
// // // // router.post('/send', async (req, res) => {
// // // //   try {
// // // //     const { title, file_url, parties, fields, total_pages } = req.body;
    
// // // //     // প্রথম সাইনারের জন্য টোকেন
// // // //     const token = crypto.randomBytes(32).toString('hex');
    
// // // //     const updatedParties = parties.map((p, i) => ({
// // // //       ...p,
// // // //       status: i === 0 ? 'sent' : 'pending',
// // // //       order: i,
// // // //       token: i === 0 ? token : null // ডাটাবেসে টোকেন সেভ রাখা
// // // //     }));

// // // //     const newDoc = await Document.create({
// // // //       title,
// // // //       file_url,
// // // //       parties: updatedParties,
// // // //       fields,
// // // //       total_pages,
// // // //       status: 'in_progress',
// // // //       current_party_index: 0
// // // //     });

// // // //     // অডিট লগ: সেন্ড অ্যাকশন
// // // //     await AuditLog.create({
// // // //       document_id: newDoc._id,
// // // //       action: 'sent',
// // // //       party_name: updatedParties[0].name,
// // // //       party_email: updatedParties[0].email,
// // // //       details: `Sent to ${updatedParties[0].name} for signing.`
// // // //     });

// // // //     // Nodemailer ইমেইল ট্রান্সপোর্টার
// // // //     const transporter = nodemailer.createTransport({
// // // //       service: 'gmail',
// // // //       auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
// // // //     });

// // // //     const signLink = `${process.env.FRONTEND_URL}/sign?token=${token}`;

// // // //     await transporter.sendMail({
// // // //       from: '"Nexsign" <no-reply@nexsign.com>',
// // // //       to: updatedParties[0].email,
// // // //       subject: `Please sign: ${title}`,
// // // //       html: `
// // // //         <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
// // // //           <h2>Nexsign Document Signature Request</h2>
// // // //           <p>Hi ${updatedParties[0].name}, you are requested to sign <b>${title}</b>.</p>
// // // //           <a href="${signLink}" style="background:#0ea5e9; color:white; padding:12px 25px; text-decoration:none; border-radius:8px; display:inline-block; margin-top:10px;">Review & Sign</a>
// // // //         </div>
// // // //       `
// // // //     });

// // // //     res.json({ success: true, docId: newDoc._id });
// // // //   } catch (err) {
// // // //     res.status(500).json({ error: err.message });
// // // //   }
// // // // });

// // // // module.exports = router;
// // // // const express = require('express');
// // // // const router = express.Router();
// // // // const multer = require('multer');
// // // // const axios = require('axios');
// // // // const { v2: cloudinary } = require('cloudinary');
// // // // const crypto = require('crypto');
// // // // const nodemailer = require('nodemailer');
// // // // const Document = require('../models/Document');

// // // // // ১. Nodemailer কনফিগারেশন
// // // // const transporter = nodemailer.createTransport({
// // // //   service: 'gmail',
// // // //   auth: {
// // // //     user: process.env.EMAIL_USER,
// // // //     pass: process.env.EMAIL_PASS,
// // // //   },
// // // // });

// // // // const sendSigningEmail = async (party, docTitle, token) => {
// // // //   const signLink = `http://localhost:5173/sign?token=${token}`;
// // // //   const mailOptions = {
// // // //     from: `"NexSign" <${process.env.EMAIL_USER}>`,
// // // //     to: party.email,
// // // //     subject: `Signature Request: ${docTitle}`,
// // // //     html: `
// // // //       <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
// // // //         <h2 style="color: #0ea5e9;">Hello ${party.name},</h2>
// // // //         <p>You have a document waiting for your signature on <strong>NexSign</strong>.</p>
// // // //         <p><strong>Document:</strong> ${docTitle}</p>
// // // //         <div style="margin: 25px 0;">
// // // //           <a href="${signLink}" style="padding: 12px 24px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Sign Document Now</a>
// // // //         </div>
// // // //       </div>
// // // //     `,
// // // //   };
// // // //   return transporter.sendMail(mailOptions);
// // // // };

// // // // cloudinary.config({
// // // //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
// // // //   api_key: process.env.CLOUDINARY_API_KEY,
// // // //   api_secret: process.env.CLOUDINARY_API_SECRET,
// // // // });

// // // // const upload = multer({ storage: multer.memoryStorage() });

// // // // // ২. ফাইল আপলোড
// // // // router.post('/upload', upload.single('file'), async (req, res) => {
// // // //   try {
// // // //     if (!req.file) return res.status(400).json({ error: "No file provided" });
// // // //     const result = await new Promise((resolve, reject) => {
// // // //       const stream = cloudinary.uploader.upload_stream(
// // // //         { resource_type: "raw", folder: "nexsign_docs" },
// // // //         (error, result) => (error ? reject(error) : resolve(result))
// // // //       );
// // // //       stream.end(req.file.buffer);
// // // //     });

// // // //     const newDoc = new Document({
// // // //       title: req.file.originalname.replace('.pdf', ''),
// // // //       fileUrl: result.secure_url,
// // // //       fileId: result.public_id,
// // // //       status: 'draft',
// // // //       parties: [],
// // // //       fields: []
// // // //     });
// // // //     await newDoc.save();
// // // //     res.json(newDoc);
// // // //   } catch (err) { res.status(500).json({ error: "Upload failed" }); }
// // // // });

// // // // // ৩. আইডি দিয়ে ডকুমেন্ট খোঁজা
// // // // router.get('/:id', async (req, res) => {
// // // //   try {
// // // //     const doc = await Document.findById(req.params.id);
// // // //     if (!doc) return res.status(404).json({ error: "Document not found" });
// // // //     res.json(doc);
// // // //   } catch (err) { res.status(500).json({ error: "Database error" }); }
// // // // });

// // // // // ৪. সেভ বা আপডেট (PUT) - এটি আপনার 500 Error ফিক্স করবে
// // // // router.put('/:id', async (req, res) => {
// // // //   try {
// // // //     const { fields, parties, title } = req.body;
    
// // // //     // Naming mismatch fix: partyIndex (Frontend) -> party_index (Model)
// // // //     const formattedFields = fields?.map(f => ({
// // // //       ...f,
// // // //       party_index: f.partyIndex !== undefined ? f.partyIndex : f.party_index
// // // //     }));

// // // //     const updatedDoc = await Document.findByIdAndUpdate(
// // // //       req.params.id,
// // // //       { 
// // // //         $set: { 
// // // //           fields: formattedFields || [], 
// // // //           parties: parties || [], 
// // // //           title: title 
// // // //         } 
// // // //       },
// // // //       { new: true, runValidators: false } // Required fields এরর এড়াতে validators false করা হয়েছে
// // // //     );

// // // //     if (!updatedDoc) return res.status(404).json({ error: "Document not found" });
// // // //     res.json(updatedDoc);
// // // //   } catch (err) {
// // // //     console.error("PUT Error:", err.message);
// // // //     res.status(500).json({ error: "Update failed", details: err.message });
// // // //   }
// // // // });

// // // // // ৫. সেন্ড (POST) - এটি আপনার 400 Error ফিক্স করবে
// // // // router.post('/send', async (req, res) => {
// // // //   try {
// // // //     const { id } = req.body;
// // // //     const doc = await Document.findById(id);
    
// // // //     if (!doc) return res.status(404).json({ error: "Document not found" });
    
// // // //     // ডাটাবেসে parties সেভ হয়েছে কি না তা চেক করুন
// // // //     if (!doc.parties || doc.parties.length === 0) {
// // // //       return res.status(400).json({ error: "No parties added. Please click 'Save' after adding recipients." });
// // // //     }

// // // //     const token = crypto.randomBytes(32).toString('hex');
// // // //     doc.parties[0].token = token;
// // // //     doc.parties[0].status = 'sent';
// // // //     doc.status = 'in_progress';
// // // //     doc.currentPartyIndex = 0;
    
// // // //     await doc.save();
// // // //     await sendSigningEmail(doc.parties[0], doc.title, token);

// // // //     res.json({ success: true, message: "Email sent!" });
// // // //   } catch (err) {
// // // //     res.status(500).json({ error: "Failed to send", details: err.message });
// // // //   }
// // // // });

// // // // // ৬. সাইন সাবমিট (Sequential Signing)
// // // // router.post('/sign/submit', async (req, res) => {
// // // //   try {
// // // //     const { token, fields } = req.body;
// // // //     const doc = await Document.findOne({ "parties.token": token });
// // // //     if (!doc) return res.status(404).json({ error: "Invalid session" });

// // // //     const idx = doc.parties.findIndex(p => p.token === token);
// // // //     doc.parties[idx].status = 'signed';
// // // //     doc.parties[idx].signedAt = new Date();
// // // //     doc.parties[idx].token = null; 
    
// // // //     doc.fields = fields.map(f => ({ ...f, party_index: f.partyIndex !== undefined ? f.partyIndex : f.party_index }));

// // // //     if (idx + 1 < doc.parties.length) {
// // // //       const nextToken = crypto.randomBytes(32).toString('hex');
// // // //       doc.parties[idx+1].token = nextToken;
// // // //       doc.parties[idx+1].status = 'sent';
// // // //       doc.currentPartyIndex = idx + 1;
// // // //       await doc.save();
// // // //       await sendSigningEmail(doc.parties[idx+1], doc.title, nextToken);
// // // //       res.json({ success: true, next: true });
// // // //     } else {
// // // //       doc.status = 'completed';
// // // //       await doc.save();
// // // //       res.json({ success: true, completed: true });
// // // //     }
// // // //   } catch (err) { res.status(500).json({ error: "Submit failed" }); }
// // // // });

// // // // // ৭. পিডিএফ প্রক্সি
// // // // router.get('/proxy/*', async (req, res) => {
// // // //   try {
// // // //     const fileId = req.params[0]; 
// // // //     const cloudinaryUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${fileId}`;
// // // //     const response = await axios.get(cloudinaryUrl, { responseType: 'stream' });
// // // //     res.setHeader('Content-Type', 'application/pdf');
// // // //     response.data.pipe(res);
// // // //   } catch (err) { res.status(404).send("Could not fetch PDF"); }
// // // // });

// // // // // ৮. টোকেন চেক
// // // // router.get('/sign/:token', async (req, res) => {
// // // //   try {
// // // //     const doc = await Document.findOne({ "parties.token": req.params.token });
// // // //     if (!doc) return res.status(404).json({ error: "Invalid link" });
// // // //     const party = doc.parties.find(p => p.token === req.params.token);
// // // //     res.json({ document: doc, party: { ...party.toObject(), index: doc.parties.indexOf(party) } });
// // // //   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// // // // });

// // // // module.exports = router;

// // // // const express = require('express');
// // // // const router = express.Router();
// // // // const multer = require('multer');
// // // // const axios = require('axios');
// // // // const { v2: cloudinary } = require('cloudinary');
// // // // const crypto = require('crypto');
// // // // const nodemailer = require('nodemailer');
// // // // const Document = require('../models/Document');

// // // // // ১. Nodemailer কনফিগারেশন
// // // // const transporter = nodemailer.createTransport({
// // // //   service: 'gmail',
// // // //   auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
// // // // });

// // // // const sendSigningEmail = async (party, docTitle, token) => {
// // // //   const signLink = `http://localhost:5173/sign?token=${token}`;
// // // //   const mailOptions = {
// // // //     from: `"NexSign" <${process.env.EMAIL_USER}>`,
// // // //     to: party.email,
// // // //     subject: `Signature Request: ${docTitle}`,
// // // //     html: `
// // // //       <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
// // // //         <h2 style="color: #0ea5e9;">Hello ${party.name},</h2>
// // // //         <p>You have a document waiting for your signature on <strong>NexSign</strong>.</p>
// // // //         <p><strong>Document:</strong> ${docTitle}</p>
// // // //         <div style="margin: 25px 0;">
// // // //           <a href="${signLink}" style="display: inline-block; padding: 12px 24px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Sign Document Now</a>
// // // //         </div>
// // // //       </div>
// // // //     `,
// // // //   };
// // // //   return transporter.sendMail(mailOptions);
// // // // };

// // // // cloudinary.config({
// // // //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
// // // //   api_key: process.env.CLOUDINARY_API_KEY,
// // // //   api_secret: process.env.CLOUDINARY_API_SECRET,
// // // // });

// // // // const upload = multer({ storage: multer.memoryStorage() });

// // // // // ২. ফাইল আপলোড
// // // // router.post('/upload', upload.single('file'), async (req, res) => {
// // // //   try {
// // // //     if (!req.file) return res.status(400).json({ error: "No file provided" });
// // // //     const result = await new Promise((resolve, reject) => {
// // // //       const stream = cloudinary.uploader.upload_stream(
// // // //         { resource_type: "raw", folder: "nexsign_docs" },
// // // //         (error, result) => (error ? reject(error) : resolve(result))
// // // //       );
// // // //       stream.end(req.file.buffer);
// // // //     });

// // // //     const newDoc = new Document({
// // // //       title: req.file.originalname.replace('.pdf', ''),
// // // //       fileUrl: result.secure_url,
// // // //       fileId: result.public_id,
// // // //       status: 'draft',
// // // //       parties: [],
// // // //       fields: []
// // // //     });
// // // //     await newDoc.save();
// // // //     res.json(newDoc);
// // // //   } catch (err) { res.status(500).json({ error: "Upload failed" }); }
// // // // });

// // // // // ৩. আইডি দিয়ে ডকুমেন্ট খোঁজা
// // // // router.get('/:id', async (req, res) => {
// // // //   try {
// // // //     const doc = await Document.findById(req.params.id);
// // // //     if (!doc) return res.status(404).json({ error: "Document not found" });
// // // //     res.json(doc);
// // // //   } catch (err) { res.status(500).json({ error: "Database error" }); }
// // // // });

// // // // // ৪. সেভ বা আপডেট (PUT) - লজিক ফিক্স
// // // // router.put('/:id', async (req, res) => {
// // // //   try {
// // // //     const { fields, parties, title } = req.body;
    
// // // //     // ✅ ফিক্স: ডেটা টাইপ নিশ্চিত করা এবং ম্যাপ করা
// // // //     const formattedFields = fields?.map(f => {
// // // //       const obj = typeof f === 'string' ? JSON.parse(f) : f;
// // // //       return {
// // // //         ...obj,
// // // //         party_index: obj.partyIndex !== undefined ? Number(obj.partyIndex) : Number(obj.party_index),
// // // //         page: Number(obj.page)
// // // //       };
// // // //     }) || [];

// // // //     const updatedDoc = await Document.findByIdAndUpdate(
// // // //       req.params.id,
// // // //       { $set: { fields: formattedFields, parties: parties || [], title } },
// // // //       { new: true, runValidators: false }
// // // //     );

// // // //     res.json(updatedDoc);
// // // //   } catch (err) {
// // // //     res.status(500).json({ error: "Update failed", details: err.message });
// // // //   }
// // // // });

// // // // // ৫. সেন্ড (POST)
// // // // router.post('/send', async (req, res) => {
// // // //   try {
// // // //     const { id } = req.body;
// // // //     const doc = await Document.findById(id);
// // // //     if (!doc || !doc.parties.length) return res.status(400).json({ error: "Invalid document or no parties" });

// // // //     const token = crypto.randomBytes(32).toString('hex');
// // // //     doc.parties[0].token = token;
// // // //     doc.parties[0].status = 'sent';
// // // //     doc.status = 'in_progress';
// // // //     doc.currentPartyIndex = 0;
    
// // // //     await doc.save();
// // // //     await sendSigningEmail(doc.parties[0], doc.title, token);

// // // //     res.json({ success: true, message: "Email sent!" });
// // // //   } catch (err) { res.status(500).json({ error: "Failed to send" }); }
// // // // });

// // // // // ৬. সাইন সাবমিট (Sequential Signing)
// // // // router.post('/sign/submit', async (req, res) => {
// // // //   try {
// // // //     const { token, fields } = req.body;
// // // //     const doc = await Document.findOne({ "parties.token": token });
// // // //     if (!doc) return res.status(404).json({ error: "Invalid session" });

// // // //     const idx = doc.parties.findIndex(p => p.token === token);
// // // //     doc.parties[idx].status = 'signed';
// // // //     doc.parties[idx].signedAt = new Date();
// // // //     doc.parties[idx].token = null; 
    
// // // //     // ✅ ফিক্স: সাবমিট করা ডেটাকেও ফরম্যাট করা
// // // //     doc.fields = fields.map(f => {
// // // //       const obj = typeof f === 'string' ? JSON.parse(f) : f;
// // // //       return {
// // // //         ...obj,
// // // //         party_index: obj.partyIndex !== undefined ? Number(obj.partyIndex) : Number(obj.party_index),
// // // //         page: Number(obj.page)
// // // //       };
// // // //     });

// // // //     if (idx + 1 < doc.parties.length) {
// // // //       const nextToken = crypto.randomBytes(32).toString('hex');
// // // //       doc.parties[idx+1].token = nextToken;
// // // //       doc.parties[idx+1].status = 'sent';
// // // //       doc.currentPartyIndex = idx + 1;
// // // //       await doc.save();
// // // //       await sendSigningEmail(doc.parties[idx+1], doc.title, nextToken);
// // // //       res.json({ success: true, next: true });
// // // //     } else {
// // // //       doc.status = 'completed';
// // // //       await doc.save();
// // // //       res.json({ success: true, completed: true });
// // // //     }
// // // //   } catch (err) { res.status(500).json({ error: "Submit failed" }); }
// // // // });

// // // // // ৭. পিডিএফ প্রক্সি
// // // // router.get('/proxy/*', async (req, res) => {
// // // //   try {
// // // //     const fileId = req.params[0]; 
// // // //     const cloudinaryUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${fileId}`;
// // // //     const response = await axios.get(cloudinaryUrl, { responseType: 'stream' });
// // // //     res.setHeader('Content-Type', 'application/pdf');
// // // //     response.data.pipe(res);
// // // //   } catch (err) { res.status(404).send("Could not fetch PDF"); }
// // // // });

// // // // // ৮. টোকেন চেক
// // // // router.get('/sign/:token', async (req, res) => {
// // // //   try {
// // // //     const doc = await Document.findOne({ "parties.token": req.params.token });
// // // //     if (!doc) return res.status(404).json({ error: "Invalid link" });
// // // //     const party = doc.parties.find(p => p.token === req.params.token);
// // // //     res.json({ document: doc, party: { ...party.toObject(), index: doc.parties.indexOf(party) } });
// // // //   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// // // // });

// // // // module.exports = router;

// // // // const express = require('express');
// // // // const router = express.Router();
// // // // const multer = require('multer');
// // // // const axios = require('axios');
// // // // const { v2: cloudinary } = require('cloudinary');
// // // // const crypto = require('crypto');
// // // // const nodemailer = require('nodemailer');
// // // // const Document = require('../models/Document');

// // // // // ১. Nodemailer কনফিগারেশন
// // // // const transporter = nodemailer.createTransport({
// // // //   service: 'gmail',
// // // //   auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
// // // // });

// // // // const sendSigningEmail = async (party, docTitle, token) => {
// // // //   const signLink = `http://localhost:5173/sign?token=${token}`;
// // // //   const mailOptions = {
// // // //     from: `"NexSign" <${process.env.EMAIL_USER}>`,
// // // //     to: party.email,
// // // //     subject: `Signature Request: ${docTitle}`,
// // // //     html: `
// // // //       <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
// // // //         <h2 style="color: #0ea5e9;">Hello ${party.name},</h2>
// // // //         <p>You have a document waiting for your signature on <strong>NexSign</strong>.</p>
// // // //         <p><strong>Document:</strong> ${docTitle}</p>
// // // //         <div style="margin: 25px 0;">
// // // //           <a href="${signLink}" style="display: inline-block; padding: 12px 24px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Sign Document Now</a>
// // // //         </div>
// // // //       </div>
// // // //     `,
// // // //   };
// // // //   return transporter.sendMail(mailOptions);
// // // // };

// // // // cloudinary.config({
// // // //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
// // // //   api_key: process.env.CLOUDINARY_API_KEY,
// // // //   api_secret: process.env.CLOUDINARY_API_SECRET,
// // // // });

// // // // const upload = multer({ storage: multer.memoryStorage() });

// // // // // ২. ফাইল আপলোড
// // // // router.post('/upload', upload.single('file'), async (req, res) => {
// // // //   try {
// // // //     if (!req.file) return res.status(400).json({ error: "No file provided" });
// // // //     const result = await new Promise((resolve, reject) => {
// // // //       const stream = cloudinary.uploader.upload_stream(
// // // //         { resource_type: "raw", folder: "nexsign_docs" },
// // // //         (error, result) => (error ? reject(error) : resolve(result))
// // // //       );
// // // //       stream.end(req.file.buffer);
// // // //     });

// // // //     const newDoc = new Document({
// // // //       title: req.file.originalname.replace('.pdf', ''),
// // // //       fileUrl: result.secure_url,
// // // //       fileId: result.public_id,
// // // //       status: 'draft',
// // // //       parties: [],
// // // //       fields: []
// // // //     });
// // // //     await newDoc.save();
// // // //     res.json(newDoc);
// // // //   } catch (err) { res.status(500).json({ error: "Upload failed" }); }
// // // // });

// // // // // ৩. আইডি দিয়ে ডকুমেন্ট খোঁজা
// // // // router.get('/:id', async (req, res) => {
// // // //   try {
// // // //     const doc = await Document.findById(req.params.id);
// // // //     if (!doc) return res.status(404).json({ error: "Document not found" });
// // // //     res.json(doc);
// // // //   } catch (err) { res.status(500).json({ error: "Database error" }); }
// // // // });

// // // // // ৪. সেভ বা আপডেট (PUT) 
// // // // router.put('/:id', async (req, res) => {
// // // //   try {
// // // //     const { fields, parties, title } = req.body;
// // // //     const formattedFields = fields?.map(f => {
// // // //       const obj = typeof f === 'string' ? JSON.parse(f) : f;
// // // //       return {
// // // //         ...obj,
// // // //         party_index: obj.partyIndex !== undefined ? Number(obj.partyIndex) : Number(obj.party_index),
// // // //         page: Number(obj.page)
// // // //       };
// // // //     }) || [];

// // // //     const updatedDoc = await Document.findByIdAndUpdate(
// // // //       req.params.id,
// // // //       { $set: { fields: formattedFields, parties: parties || [], title } },
// // // //       { new: true }
// // // //     );
// // // //     res.json(updatedDoc);
// // // //   } catch (err) { res.status(500).json({ error: "Update failed" }); }
// // // // });

// // // // // ৫. সেন্ড (POST)
// // // // router.post('/send', async (req, res) => {
// // // //   try {
// // // //     const { id } = req.body;
// // // //     const doc = await Document.findById(id);
// // // //     if (!doc || !doc.parties.length) return res.status(400).json({ error: "Invalid document" });

// // // //     const token = crypto.randomBytes(32).toString('hex');
// // // //     doc.parties[0].token = token;
// // // //     doc.parties[0].status = 'sent';
// // // //     doc.status = 'in_progress';
// // // //     doc.currentPartyIndex = 0;
    
// // // //     await doc.save();
// // // //     await sendSigningEmail(doc.parties[0], doc.title, token);
// // // //     res.json({ success: true, message: "Email sent!" });
// // // //   } catch (err) { res.status(500).json({ error: "Failed to send" }); }
// // // // });

// // // // // ৬. সাইন সাবমিট (Sequential Signing) - ফিক্সড রাউট পাথ
// // // // router.post('/sign/submit', async (req, res) => {
// // // //   try {
// // // //     const { token, fields } = req.body;
// // // //     const doc = await Document.findOne({ "parties.token": token });
// // // //     if (!doc) return res.status(404).json({ error: "Invalid session" });

// // // //     const idx = doc.parties.findIndex(p => p.token === token);
// // // //     doc.parties[idx].status = 'signed';
// // // //     doc.parties[idx].signedAt = new Date();
// // // //     doc.parties[idx].token = null; 
    
// // // //     doc.fields = fields.map(f => {
// // // //       const obj = typeof f === 'string' ? JSON.parse(f) : f;
// // // //       return {
// // // //         ...obj,
// // // //         party_index: obj.partyIndex !== undefined ? Number(obj.partyIndex) : Number(obj.party_index),
// // // //         page: Number(obj.page)
// // // //       };
// // // //     });

// // // //     if (idx + 1 < doc.parties.length) {
// // // //       const nextToken = crypto.randomBytes(32).toString('hex');
// // // //       doc.parties[idx+1].token = nextToken;
// // // //       doc.parties[idx+1].status = 'sent';
// // // //       doc.currentPartyIndex = idx + 1;
// // // //       await doc.save();
// // // //       await sendSigningEmail(doc.parties[idx+1], doc.title, nextToken);
// // // //       res.json({ success: true, next: true });
// // // //     } else {
// // // //       doc.status = 'completed';
// // // //       await doc.save();
// // // //       res.json({ success: true, completed: true });
// // // //     }
// // // //   } catch (err) { res.status(500).json({ error: "Submit failed" }); }
// // // // });

// // // // // ৭. পিডিএফ প্রক্সি
// // // // router.get('/proxy/*', async (req, res) => {
// // // //   try {
// // // //     const fileId = req.params[0]; 
// // // //     const cloudinaryUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${fileId}`;
// // // //     const response = await axios.get(cloudinaryUrl, { responseType: 'stream' });
// // // //     res.setHeader('Content-Type', 'application/pdf');
// // // //     response.data.pipe(res);
// // // //   } catch (err) { res.status(404).send("Could not fetch PDF"); }
// // // // });

// // // // // ৮. টোকেন চেক
// // // // router.get('/sign/:token', async (req, res) => {
// // // //   try {
// // // //     const doc = await Document.findOne({ "parties.token": req.params.token });
// // // //     if (!doc) return res.status(404).json({ error: "Invalid link" });
// // // //     const party = doc.parties.find(p => p.token === req.params.token);
// // // //     res.json({ document: doc, party: { ...party.toObject(), index: doc.parties.indexOf(party) } });
// // // //   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// // // // });

// // // // module.exports = router;

// // // // const express = require('express');
// // // // const router = express.Router();
// // // // const multer = require('multer');
// // // // const axios = require('axios');
// // // // const { v2: cloudinary } = require('cloudinary');
// // // // const crypto = require('crypto');
// // // // const nodemailer = require('nodemailer');
// // // // const { PDFDocument } = require('pdf-lib'); // ✅ PDF manipulation এর জন্য
// // // // const Document = require('../models/Document');

// // // // // ১. Nodemailer কনফিগারেশন
// // // // const transporter = nodemailer.createTransport({
// // // //   service: 'gmail',
// // // //   auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
// // // // });

// // // // // ✅ ফাইনাল পিডিএফ জেনারেট এবং ইমেল পাঠানোর ফাংশন
// // // // const generateAndSendFinalDoc = async (doc) => {
// // // //   try {
// // // //     // ১. অরিজিনাল পিডিএফ ডাউনলোড করা (Cloudinary থেকে)
// // // //     const response = await axios.get(doc.fileUrl, { responseType: 'arraybuffer' });
// // // //     const existingPdfBytes = response.data;
    
// // // //     const pdfDoc = await PDFDocument.load(existingPdfBytes);
// // // //     const pages = pdfDoc.getPages();

// // // //     // ২. প্রতিটি ফিল্ড (Signature) পিডিএফে বসানো
// // // //     for (const field of doc.fields) {
// // // //       if (field.type === 'signature' && field.value) {
// // // //         const pageIndex = Number(field.page) - 1;
// // // //         if (pageIndex < 0 || pageIndex >= pages.length) continue;

// // // //         const page = pages[pageIndex];
// // // //         const { width, height } = page.getSize();
        
// // // //         // Base64 ইমেজ প্রসেস করা
// // // //         const sigImageBytes = Buffer.from(field.value.split(',')[1], 'base64');
// // // //         const sigImage = await pdfDoc.embedPng(sigImageBytes);

// // // //         // কোঅর্ডিনেট ক্যালকুলেশন (পার্সেন্টেজ থেকে পয়েন্টে)
// // // //         const pdfWidth = (Number(field.width) * width) / 100;
// // // //         const pdfHeight = (Number(field.height) * height) / 100;
// // // //         const pdfX = (Number(field.x) * width) / 100;
// // // //         // PDF coordinate system এ Y নিচ থেকে শুরু হয়
// // // //         const pdfY = height - ((Number(field.y) * height) / 100) - pdfHeight;

// // // //         page.drawImage(sigImage, {
// // // //           x: pdfX,
// // // //           y: pdfY,
// // // //           width: pdfWidth,
// // // //           height: pdfHeight,
// // // //         });
// // // //       }
// // // //     }

// // // //     const pdfBytes = await pdfDoc.save();

// // // //     // ৩. সকল পার্টিকে ইমেল পাঠানো (Attachment সহ)
// // // //     const recipientEmails = doc.parties.map(p => p.email);
    
// // // //     const mailOptions = {
// // // //       from: `"NexSign" <${process.env.EMAIL_USER}>`,
// // // //       to: recipientEmails.join(','),
// // // //       subject: `Completed: ${doc.title}`,
// // // //       html: `
// // // //         <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
// // // //           <h2 style="color: #10b981;">Signing Completed!</h2>
// // // //           <p>Everyone has signed the document: <strong>${doc.title}</strong>.</p>
// // // //           <p>Please find the final signed copy attached below.</p>
// // // //           <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
// // // //           <small style="color: #6b7280;">NexSign - Digital Signature Platform</small>
// // // //         </div>
// // // //       `,
// // // //       attachments: [{
// // // //         filename: `${doc.title}_signed.pdf`,
// // // //         content: Buffer.from(pdfBytes),
// // // //         contentType: 'application/pdf'
// // // //       }]
// // // //     };

// // // //     await transporter.sendMail(mailOptions);
// // // //     console.log("Final signed PDF sent to all parties.");
// // // //   } catch (err) {
// // // //     console.error("PDF Generation Error:", err);
// // // //   }
// // // // };

// // // // const sendSigningEmail = async (party, docTitle, token) => {
// // // //   const signLink = `http://localhost:5173/sign?token=${token}`;
// // // //   const mailOptions = {
// // // //     from: `"NexSign" <${process.env.EMAIL_USER}>`,
// // // //     to: party.email,
// // // //     subject: `Signature Request: ${docTitle}`,
// // // //     html: `
// // // //       <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
// // // //         <h2 style="color: #0ea5e9;">Hello ${party.name},</h2>
// // // //         <p>You have a document waiting for your signature on <strong>NexSign</strong>.</p>
// // // //         <p><strong>Document:</strong> ${docTitle}</p>
// // // //         <div style="margin: 25px 0;">
// // // //           <a href="${signLink}" style="display: inline-block; padding: 12px 24px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Sign Document Now</a>
// // // //         </div>
// // // //       </div>
// // // //     `,
// // // //   };
// // // //   return transporter.sendMail(mailOptions);
// // // // };

// // // // // ... (ফাইল আপলোড এবং বাকি রাউটগুলো একই থাকবে) ...

// // // // // ৬. সাইন সাবমিট (Sequential Signing) - আপডেট করা লজিক
// // // // router.post('/sign/submit', async (req, res) => {
// // // //   try {
// // // //     const { token, fields } = req.body;
// // // //     const doc = await Document.findOne({ "parties.token": token });
// // // //     if (!doc) return res.status(404).json({ error: "Invalid session" });

// // // //     const idx = doc.parties.findIndex(p => p.token === token);
// // // //     doc.parties[idx].status = 'signed';
// // // //     doc.parties[idx].signedAt = new Date();
// // // //     doc.parties[idx].token = null; 
    
// // // //     // ফিল্ড ডেটা আপডেট (বর্তমান সাইনারের সিগনেচারসহ)
// // // //     doc.fields = fields.map(f => {
// // // //       const obj = typeof f === 'string' ? JSON.parse(f) : f;
// // // //       return {
// // // //         ...obj,
// // // //         party_index: obj.partyIndex !== undefined ? Number(obj.partyIndex) : Number(obj.party_index),
// // // //         page: Number(obj.page)
// // // //       };
// // // //     });

// // // //     if (idx + 1 < doc.parties.length) {
// // // //       // পরবর্তী সাইনারের কাছে পাঠানো
// // // //       const nextToken = crypto.randomBytes(32).toString('hex');
// // // //       doc.parties[idx+1].token = nextToken;
// // // //       doc.parties[idx+1].status = 'sent';
// // // //       doc.currentPartyIndex = idx + 1;
// // // //       await doc.save();
// // // //       await sendSigningEmail(doc.parties[idx+1], doc.title, nextToken);
// // // //       res.json({ success: true, next: true });
// // // //     } else {
// // // //       // ✅ সবাই সাইন করেছে!
// // // //       doc.status = 'completed';
// // // //       await doc.save();
      
// // // //       // ব্যাকগ্রাউন্ডে পিডিএফ তৈরি এবং ইমেল পাঠানো শুরু হবে
// // // //       generateAndSendFinalDoc(doc); 
      
// // // //       res.json({ success: true, completed: true });
// // // //     }
// // // //   } catch (err) { res.status(500).json({ error: "Submit failed" }); }
// // // // });

// // // // // ... (Proxy এবং বাকি রাউটগুলো) ...

// // // // module.exports = router;
// // // // const express = require('express');
// // // // const router = express.Router();
// // // // const multer = require('multer');
// // // // const axios = require('axios');
// // // // const { v2: cloudinary } = require('cloudinary');
// // // // const crypto = require('crypto');
// // // // const nodemailer = require('nodemailer');
// // // // const { PDFDocument } = require('pdf-lib');
// // // // const Document = require('../models/Document');

// // // // const transporter = nodemailer.createTransport({
// // // //   service: 'gmail',
// // // //   auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
// // // // });

// // // // const upload = multer({ storage: multer.memoryStorage() });

// // // // // --- HELPER FUNCTIONS ---
// // // // const sendSigningEmail = async (party, docTitle, token) => {
// // // //   const signLink = `http://localhost:5173/sign?token=${token}`;
// // // //   const mailOptions = {
// // // //     from: `"NexSign" <${process.env.EMAIL_USER}>`,
// // // //     to: party.email,
// // // //     subject: `Signature Request: ${docTitle}`,
// // // //     html: `<div style="font-family:sans-serif;padding:20px;"><h2>Hello ${party.name}</h2><p>Please sign <b>${docTitle}</b></p><a href="${signLink}" style="background:#0ea5e9;color:white;padding:10px;text-decoration:none;border-radius:5px;">Sign Now</a></div>`,
// // // //   };
// // // //   return transporter.sendMail(mailOptions);
// // // // };

// // // // const generateAndSendFinalDoc = async (doc) => {
// // // //   try {
// // // //     const response = await axios.get(doc.fileUrl, { responseType: 'arraybuffer' });
// // // //     const pdfDoc = await PDFDocument.load(response.data);
// // // //     const pages = pdfDoc.getPages();

// // // //     for (const field of doc.fields) {
// // // //       // ফ্রন্টএন্ড থেকে আসা স্ট্রিং ডেটাকে পার্স করা (যদি প্রয়োজন হয়)
// // // //       const f = typeof field === 'string' ? JSON.parse(field) : field;
// // // //       if (f.type === 'signature' && f.value) {
// // // //         const page = pages[Number(f.page) - 1];
// // // //         const { width, height } = page.getSize();
// // // //         const sigImg = await pdfDoc.embedPng(Buffer.from(f.value.split(',')[1], 'base64'));

// // // //         page.drawImage(sigImg, {
// // // //           x: (Number(f.x) * width) / 100,
// // // //           y: height - ((Number(f.y) * height) / 100) - ((Number(f.height) * height) / 100),
// // // //           width: (Number(f.width) * width) / 100,
// // // //           height: (Number(f.height) * height) / 100,
// // // //         });
// // // //       }
// // // //     }
// // // //     const pdfBytes = await pdfDoc.save();
// // // //     await transporter.sendMail({
// // // //       from: `"NexSign" <${process.env.EMAIL_USER}>`,
// // // //       to: doc.parties.map(p => p.email).join(','),
// // // //       subject: `Completed: ${doc.title}`,
// // // //       attachments: [{ filename: `${doc.title}_signed.pdf`, content: Buffer.from(pdfBytes) }]
// // // //     });
// // // //   } catch (err) { console.error("Final PDF Error:", err); }
// // // // };

// // // // // --- ROUTES ---

// // // // // ১. ফাইল আপলোড (POST /api/documents/upload)
// // // // router.post('/upload', upload.single('file'), async (req, res) => {
// // // //   try {
// // // //     const result = await new Promise((resolve, reject) => {
// // // //       const stream = cloudinary.uploader.upload_stream({ resource_type: "raw", folder: "nexsign_docs" }, (err, res) => err ? reject(err) : resolve(res));
// // // //       stream.end(req.file.buffer);
// // // //     });
// // // //     const newDoc = new Document({ title: req.file.originalname.replace('.pdf', ''), fileUrl: result.secure_url, fileId: result.public_id });
// // // //     await newDoc.save();
// // // //     res.json(newDoc);
// // // //   } catch (err) { res.status(500).json({ error: "Upload failed" }); }
// // // // });

// // // // // ২. আইডি দিয়ে ডকুমেন্ট রিট্রিভ (GET /api/documents/:id) -> **এটি আপনার ৪-০-৪ ফিক্স করবে**
// // // // router.get('/:id', async (req, res) => {
// // // //   try {
// // // //     const doc = await Document.findById(req.params.id);
// // // //     if (!doc) return res.status(404).json({ error: "Document not found" });
// // // //     res.json(doc);
// // // //   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// // // // });

// // // // // ৩. আপডেট ড্রাফট (PUT /api/documents/:id)
// // // // router.put('/:id', async (req, res) => {
// // // //   try {
// // // //     const { title, parties, fields, totalPages, fileUrl, fileId } = req.body;
// // // //     const updated = await Document.findByIdAndUpdate(
// // // //       req.params.id,
// // // //       { $set: { title, parties, fields, totalPages, fileUrl, fileId } },
// // // //       { new: true }
// // // //     );
// // // //     res.json(updated);
// // // //   } catch (err) { res.status(500).json({ error: "Save failed" }); }
// // // // });

// // // // // ৪. প্রথম সাইনারকে ইমেল পাঠানো (POST /api/documents/send)
// // // // router.post('/send', async (req, res) => {
// // // //   try {
// // // //     const doc = await Document.findById(req.body.id);
// // // //     if (!doc || !doc.parties.length) return res.status(400).json({ error: "Invalid document" });

// // // //     const token = crypto.randomBytes(32).toString('hex');
// // // //     doc.parties[0].token = token;
// // // //     doc.parties[0].status = 'sent';
// // // //     doc.status = 'in_progress';
// // // //     await doc.save();
// // // //     await sendSigningEmail(doc.parties[0], doc.title, token);
// // // //     res.json({ success: true });
// // // //   } catch (err) { res.status(500).json({ error: "Send failed" }); }
// // // // });

// // // // // ৫. সাইন সাবমিট (POST /api/documents/sign/submit)
// // // // router.post('/sign/submit', async (req, res) => {
// // // //   try {
// // // //     const { token, fields } = req.body;
// // // //     const doc = await Document.findOne({ "parties.token": token });
// // // //     if (!doc) return res.status(404).json({ error: "Session invalid" });

// // // //     const idx = doc.parties.findIndex(p => p.token === token);
// // // //     doc.parties[idx].status = 'signed';
// // // //     doc.parties[idx].token = null;
// // // //     doc.fields = fields;

// // // //     if (idx + 1 < doc.parties.length) {
// // // //       const nextToken = crypto.randomBytes(32).toString('hex');
// // // //       doc.parties[idx+1].token = nextToken;
// // // //       doc.parties[idx+1].status = 'sent';
// // // //       await doc.save();
// // // //       await sendSigningEmail(doc.parties[idx+1], doc.title, nextToken);
// // // //       res.json({ success: true, next: true });
// // // //     } else {
// // // //       doc.status = 'completed';
// // // //       await doc.save();
// // // //       generateAndSendFinalDoc(doc);
// // // //       res.json({ success: true, completed: true });
// // // //     }
// // // //   } catch (err) { res.status(500).json({ error: "Submit failed" }); }
// // // // });

// // // // // ৬. পিডিএফ প্রক্সি (GET /api/documents/proxy/*)
// // // // router.get('/proxy/*', async (req, res) => {
// // // //   try {
// // // //     const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${req.params[0]}`;
// // // //     const response = await axios.get(url, { responseType: 'stream' });
// // // //     res.setHeader('Content-Type', 'application/pdf');
// // // //     response.data.pipe(res);
// // // //   } catch (err) { res.status(404).send("PDF not found"); }
// // // // });

// // // // module.exports = router;

// // // // const express = require('express');
// // // // const router = express.Router();
// // // // const multer = require('multer');
// // // // const axios = require('axios');
// // // // const { v2: cloudinary } = require('cloudinary');
// // // // const crypto = require('crypto');
// // // // const nodemailer = require('nodemailer');
// // // // const { PDFDocument } = require('pdf-lib');
// // // // const Document = require('../models/Document');

// // // // // ✅ ১. Cloudinary কনফিগারেশন (এটি না থাকলে ৫-০-০ এরর আসবে)
// // // // cloudinary.config({
// // // //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
// // // //   api_key: process.env.CLOUDINARY_API_KEY,
// // // //   api_secret: process.env.CLOUDINARY_API_SECRET,
// // // // });

// // // // const transporter = nodemailer.createTransport({
// // // //   service: 'gmail',
// // // //   auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
// // // // });

// // // // const upload = multer({ storage: multer.memoryStorage() });

// // // // // --- HELPER FUNCTIONS ---
// // // // const sendSigningEmail = async (party, docTitle, token) => {
// // // //   const signLink = `http://localhost:5173/sign?token=${token}`;
// // // //   const mailOptions = {
// // // //     from: `"NexSign" <${process.env.EMAIL_USER}>`,
// // // //     to: party.email,
// // // //     subject: `Signature Request: ${docTitle}`,
// // // //     html: `<div style="font-family:sans-serif;padding:20px;"><h2>Hello ${party.name}</h2><p>Please sign <b>${docTitle}</b></p><a href="${signLink}" style="background:#0ea5e9;color:white;padding:10px;text-decoration:none;border-radius:5px;">Sign Now</a></div>`,
// // // //   };
// // // //   return transporter.sendMail(mailOptions);
// // // // };

// // // // // const generateAndSendFinalDoc = async (doc) => {
// // // // //   try {
// // // // //     const response = await axios.get(doc.fileUrl, { responseType: 'arraybuffer' });
// // // // //     const pdfDoc = await PDFDocument.load(response.data);
// // // // //     const pages = pdfDoc.getPages();

// // // // //     for (const field of doc.fields) {
// // // // //       const f = typeof field === 'string' ? JSON.parse(field) : field;
// // // // //       if (f.type === 'signature' && f.value) {
// // // // //         const page = pages[Number(f.page) - 1];
// // // // //         const { width, height } = page.getSize();
// // // // //         const sigImg = await pdfDoc.embedPng(Buffer.from(f.value.split(',')[1], 'base64'));

// // // // //         page.drawImage(sigImg, {
// // // // //           x: (Number(f.x) * width) / 100,
// // // // //           y: height - ((Number(f.y) * height) / 100) - ((Number(f.height) * height) / 100),
// // // // //           width: (Number(f.width) * width) / 100,
// // // // //           height: (Number(f.height) * height) / 100,
// // // // //         });
// // // // //       }
// // // // //     }
// // // // //     const pdfBytes = await pdfDoc.save();
// // // // //     await transporter.sendMail({
// // // // //       from: `"NexSign" <${process.env.EMAIL_USER}>`,
// // // // //       to: doc.parties.map(p => p.email).join(','),
// // // // //       subject: `Completed: ${doc.title}`,
// // // // //       attachments: [{ filename: `${doc.title}_signed.pdf`, content: Buffer.from(pdfBytes) }]
// // // // //     });
// // // // //   } catch (err) { console.error("Final PDF Error:", err); }
// // // // // };

// // // // const generateAndSendFinalDoc = async (doc) => {
// // // //   try {
// // // //     const response = await axios.get(doc.fileUrl, { responseType: 'arraybuffer' });
// // // //     const pdfDoc = await PDFDocument.load(response.data);
// // // //     const pages = pdfDoc.getPages();

// // // //     for (const field of doc.fields) {
// // // //       const f = typeof field === 'string' ? JSON.parse(field) : field;
// // // //       if (f.type === 'signature' && f.value) {
// // // //         const pageIndex = Number(f.page) - 1;
// // // //         if (pageIndex >= 0 && pageIndex < pages.length) {
// // // //           const page = pages[pageIndex];
// // // //           const { width, height } = page.getSize();
// // // //           const sigImg = await pdfDoc.embedPng(Buffer.from(f.value.split(',')[1], 'base64'));

// // // //           page.drawImage(sigImg, {
// // // //             x: (Number(f.x) * width) / 100,
// // // //             y: height - ((Number(f.y) * height) / 100) - ((Number(f.height) * height) / 100),
// // // //             width: (Number(f.width) * width) / 100,
// // // //             height: (Number(f.height) * height) / 100,
// // // //           });
// // // //         }
// // // //       }
// // // //     }
// // // //     const pdfBytes = await pdfDoc.save();
// // // //     await transporter.sendMail({
// // // //       from: `"NexSign" <${process.env.EMAIL_USER}>`,
// // // //       to: doc.parties.map(p => p.email).join(','),
// // // //       subject: `Completed: ${doc.title}`,
// // // //       attachments: [{ filename: `${doc.title}_signed.pdf`, content: Buffer.from(pdfBytes) }]
// // // //     });
// // // //     console.log("Final PDF sent successfully!");
// // // //   } catch (err) { 
// // // //     console.error("Final PDF Error:", err); 
// // // //   }
// // // // };

// // // // // --- ৪. নিচের রাউটগুলোর ভেতর থেকে এটিকে কল করুন ---

// // // // router.post('/sign/submit', async (req, res) => {
// // // //   try {
// // // //     const { token, fields } = req.body;
    
// // // //     // ১. টোকেন দিয়ে ডকুমেন্টটি খুঁজে বের করা
// // // //     const doc = await Document.findOne({ "parties.token": token });
// // // //     if (!doc) return res.status(404).json({ error: "Invalid or expired session" });

// // // //     // ২. কোন ইনডেক্সের ইউজার সাইন করছে তা বের করা
// // // //     const idx = doc.parties.findIndex(p => p.token === token);
    
// // // //     // ৩. ইউজারের স্ট্যাটাস আপডেট এবং টোকেন রিমুভ (সিকিউরিটির জন্য)
// // // //     doc.parties[idx].status = 'signed';
// // // //     doc.parties[idx].token = null; 
    
// // // //     // ৪. ফ্রন্টএন্ড থেকে আসা আপডেট করা ফিল্ডগুলো সেভ করা
// // // //     doc.fields = fields;

// // // //     // ৫. চেক করা: আরও কি কেউ বাকি আছে?
// // // //     if (idx + 1 < doc.parties.length) {
// // // //       // পরবর্তী সাইনারের জন্য নতুন টোকেন তৈরি করা
// // // //       const nextToken = crypto.randomBytes(32).toString('hex');
// // // //       doc.parties[idx + 1].token = nextToken;
// // // //       doc.parties[idx + 1].status = 'sent';
      
// // // //       await doc.save();
      
// // // //       // পরবর্তী সাইনারকে মেইল পাঠানো
// // // //       await sendSigningEmail(doc.parties[idx + 1], doc.title, nextToken);
// // // //       res.json({ success: true, next: true });
      
// // // //     } else {
// // // //       // ✅ সবাই সাইন করে ফেলেছে!
// // // //       doc.status = 'completed';
// // // //       await doc.save();
      
// // // //       // সবার কাছে ফাইনাল পিডিএফ পাঠানোর হেল্পার ফাংশন কল করা
// // // //       await generateAndSendFinalDoc(doc);
      
// // // //       res.json({ success: true, completed: true });
// // // //     }
// // // //   } catch (err) {
// // // //     console.error("Submit Error:", err);
// // // //     res.status(500).json({ error: "Failed to submit signature" });
// // // //   }
// // // // });
// // // //       // ✅ এখানে ফাংশনটি কল করুন
// // // //       generateAndSendFinalDoc(doc);
// // // // // --- ROUTES ---




// // // // // ১. ফাইল আপলোড (POST /api/documents/upload)
// // // // router.post('/upload', upload.single('file'), async (req, res) => {
// // // //   try {
// // // //     const result = await new Promise((resolve, reject) => {
// // // //       const stream = cloudinary.uploader.upload_stream({ resource_type: "raw", folder: "nexsign_docs" }, (err, res) => err ? reject(err) : resolve(res));
// // // //       stream.end(req.file.buffer);
// // // //     });
// // // //     const newDoc = new Document({ title: req.file.originalname.replace('.pdf', ''), fileUrl: result.secure_url, fileId: result.public_id });
// // // //     await newDoc.save();
// // // //     res.json(newDoc);
// // // //   } catch (err) { res.status(500).json({ error: "Upload failed" }); }
// // // // });

// // // // // ২. আইডি দিয়ে ডকুমেন্ট রিট্রিভ (GET /api/documents/:id)
// // // // router.get('/:id', async (req, res) => {
// // // //   try {
// // // //     const doc = await Document.findById(req.params.id);
// // // //     if (!doc) return res.status(404).json({ error: "Document not found" });
// // // //     res.json(doc);
// // // //   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// // // // });

// // // // // ৩. আপডেট ড্রাফট (PUT /api/documents/:id)
// // // // router.put('/:id', async (req, res) => {
// // // //   try {
// // // //     const { title, parties, fields, totalPages, fileUrl, fileId } = req.body;
// // // //     const updated = await Document.findByIdAndUpdate(
// // // //       req.params.id,
// // // //       { $set: { title, parties, fields, totalPages, fileUrl, fileId } },
// // // //       { new: true }
// // // //     );
// // // //     res.json(updated);
// // // //   } catch (err) { res.status(500).json({ error: "Save failed" }); }
// // // // });


// // // // // ৫. টোকেন দিয়ে ডকুমেন্ট এবং সাইনারের তথ্য রিট্রিভ করা
// // // // // GET http://localhost:5001/api/documents/sign/YOUR_TOKEN
// // // // router.get('/sign/:token', async (req, res) => {
// // // //   try {
// // // //     const { token } = req.params;

// // // //     // ডাটাবেসে ওই টোকেনটি কোন পার্টির (signer) সাথে মিলছে তা খোঁজা
// // // //     const doc = await Document.findOne({ "parties.token": token });

// // // //     if (!doc) {
// // // //       return res.status(404).json({ error: "Invalid or expired signing link" });
// // // //     }

// // // //     // কোন পার্টি সাইন করছে তাকে খুঁজে বের করা
// // // //     const party = doc.parties.find(p => p.token === token);

// // // //     res.json({
// // // //       document: doc,
// // // //       party: {
// // // //         ...party.toObject(),
// // // //         index: doc.parties.indexOf(party)
// // // //       }
// // // //     });
// // // //   } catch (err) {
// // // //     console.error("Token Fetch Error:", err);
// // // //     res.status(500).json({ error: "Internal server error" });
// // // //   }
// // // // });

// // // // // ৪. প্রথম সাইনারকে ইমেল পাঠানো (POST /api/documents/send)
// // // // router.post('/send', async (req, res) => {
// // // //   try {
// // // //     const doc = await Document.findById(req.body.id);
// // // //     if (!doc || !doc.parties.length) return res.status(400).json({ error: "Invalid document" });

// // // //     const token = crypto.randomBytes(32).toString('hex');
// // // //     doc.parties[0].token = token;
// // // //     doc.parties[0].status = 'sent';
// // // //     doc.status = 'in_progress';
// // // //     await doc.save();
// // // //     await sendSigningEmail(doc.parties[0], doc.title, token);
// // // //     res.json({ success: true });
// // // //   } catch (err) { res.status(500).json({ error: "Send failed" }); }
// // // // });

// // // // // ৫. সাইন সাবমিট (POST /api/documents/sign/submit)
// // // // router.post('/sign/submit', async (req, res) => {
// // // //   try {
// // // //     const { token, fields } = req.body;
// // // //     const doc = await Document.findOne({ "parties.token": token });
// // // //     if (!doc) return res.status(404).json({ error: "Session invalid" });

// // // //     const idx = doc.parties.findIndex(p => p.token === token);
// // // //     doc.parties[idx].status = 'signed';
// // // //     doc.parties[idx].token = null;
// // // //     doc.fields = fields;

// // // //     if (idx + 1 < doc.parties.length) {
// // // //       const nextToken = crypto.randomBytes(32).toString('hex');
// // // //       doc.parties[idx+1].token = nextToken;
// // // //       doc.parties[idx+1].status = 'sent';
// // // //       await doc.save();
// // // //       await sendSigningEmail(doc.parties[idx+1], doc.title, nextToken);
// // // //       res.json({ success: true, next: true });
// // // //     } else {
// // // //       doc.status = 'completed';
// // // //       await doc.save();
// // // //       generateAndSendFinalDoc(doc);
// // // //       res.json({ success: true, completed: true });
// // // //     }
// // // //   } catch (err) { res.status(500).json({ error: "Submit failed" }); }
// // // // });

// // // // // ৬. পিডিএফ প্রক্সি (GET /api/documents/proxy/*)
// // // // router.get('/proxy/*', async (req, res) => {
// // // //   try {
// // // //     const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${req.params[0]}`;
// // // //     const response = await axios.get(url, { responseType: 'stream' });
// // // //     res.setHeader('Content-Type', 'application/pdf');
// // // //     response.data.pipe(res);
// // // //   } catch (err) { res.status(404).send("PDF not found"); }
// // // // });

// // // // module.exports = router;

// // // // const express = require('express');
// // // // const router = express.Router();
// // // // const multer = require('multer');
// // // // const axios = require('axios');
// // // // const { v2: cloudinary } = require('cloudinary');
// // // // const crypto = require('crypto');
// // // // const nodemailer = require('nodemailer');
// // // // const { PDFDocument } = require('pdf-lib');
// // // // const Document = require('../models/Document');

// // // // // ১. Cloudinary কনফিগারেশন
// // // // cloudinary.config({
// // // //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
// // // //   api_key: process.env.CLOUDINARY_API_KEY,
// // // //   api_secret: process.env.CLOUDINARY_API_SECRET,
// // // // });

// // // // // ২. মেইল ট্রান্সপোর্টার
// // // // const transporter = nodemailer.createTransport({
// // // //   service: 'gmail',
// // // //   auth: { 
// // // //     user: process.env.EMAIL_USER, 
// // // //     pass: process.env.EMAIL_PASS 
// // // //   },
// // // // });

// // // // const upload = multer({ storage: multer.memoryStorage() });

// // // // // --- HELPER FUNCTIONS ---

// // // // const sendSigningEmail = async (party, docTitle, token) => {
// // // //   const signLink = `http://localhost:5173/sign?token=${token}`;
// // // //   const mailOptions = {
// // // //     from: `"NexSign" <${process.env.EMAIL_USER}>`,
// // // //     to: party.email,
// // // //     subject: `Signature Request: ${docTitle}`,
// // // //     html: `
// // // //       <div style="font-family:sans-serif;padding:20px;border:1px solid #eee;border-radius:10px;">
// // // //         <h2 style="color:#0ea5e9;">Hello ${party.name},</h2>
// // // //         <p>You have been requested to sign the document: <b>${docTitle}</b></p>
// // // //         <div style="margin:20px 0;">
// // // //           <a href="${signLink}" style="background:#0ea5e9;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;font-weight:bold;">Sign Document Now</a>
// // // //         </div>
// // // //         <p style="font-size:12px;color:#888;">If the button doesn't work, copy this link: ${signLink}</p>
// // // //       </div>
// // // //     `,
// // // //   };
// // // //   return transporter.sendMail(mailOptions);
// // // // };

// // // // const generateAndSendFinalDoc = async (doc) => {
// // // //   try {
// // // //     const response = await axios.get(doc.fileUrl, { responseType: 'arraybuffer' });
// // // //     const pdfDoc = await PDFDocument.load(response.data);
// // // //     const pages = pdfDoc.getPages();

// // // //     for (const field of doc.fields) {
// // // //       const f = typeof field === 'string' ? JSON.parse(field) : field;
// // // //       if (f.type === 'signature' && f.value) {
// // // //         const pageIndex = Number(f.page) - 1;
// // // //         if (pageIndex >= 0 && pageIndex < pages.length) {
// // // //           const page = pages[pageIndex];
// // // //           const { width, height } = page.getSize();
          
// // // //           // Base64 ইমেজ প্রসেসিং
// // // //           const base64Data = f.value.includes(',') ? f.value.split(',')[1] : f.value;
// // // //           const sigImg = await pdfDoc.embedPng(Buffer.from(base64Data, 'base64'));

// // // //           page.drawImage(sigImg, {
// // // //             x: (Number(f.x) * width) / 100,
// // // //             y: height - ((Number(f.y) * height) / 100) - ((Number(f.height) * height) / 100),
// // // //             width: (Number(f.width) * width) / 100,
// // // //             height: (Number(f.height) * height) / 100,
// // // //           });
// // // //         }
// // // //       }
// // // //     }
// // // //     const pdfBytes = await pdfDoc.save();
    
// // // //     // সব পার্টিকে মেইল পাঠানো
// // // //     const emails = doc.parties.map(p => p.email).join(',');
    
// // // //     await transporter.sendMail({
// // // //       from: `"NexSign" <${process.env.EMAIL_USER}>`,
// // // //       to: emails,
// // // //       subject: `Completed & Signed: ${doc.title}`,
// // // //       text: `All parties have signed "${doc.title}". Please find the attached final copy.`,
// // // //       attachments: [{ 
// // // //         filename: `${doc.title}_signed.pdf`, 
// // // //         content: Buffer.from(pdfBytes),
// // // //         contentType: 'application/pdf'
// // // //       }]
// // // //     });
// // // //     console.log("Final signed PDF sent to all parties.");
// // // //   } catch (err) { 
// // // //     console.error("Final PDF Generation Error:", err); 
// // // //   }
// // // // };

// // // // // --- ROUTES ---

// // // // // ১. ফাইল আপলোড
// // // // router.post('/upload', upload.single('file'), async (req, res) => {
// // // //   try {
// // // //     const result = await new Promise((resolve, reject) => {
// // // //       const stream = cloudinary.uploader.upload_stream({ resource_type: "raw", folder: "nexsign_docs" }, (err, res) => err ? reject(err) : resolve(res));
// // // //       stream.end(req.file.buffer);
// // // //     });
// // // //     const newDoc = new Document({ 
// // // //       title: req.file.originalname.replace('.pdf', ''), 
// // // //       fileUrl: result.secure_url, 
// // // //       fileId: result.public_id 
// // // //     });
// // // //     await newDoc.save();
// // // //     res.json(newDoc);
// // // //   } catch (err) { res.status(500).json({ error: "Upload failed" }); }
// // // // });

// // // // // ২. আইডি দিয়ে ডকুমেন্ট রিট্রিভ
// // // // router.get('/:id', async (req, res) => {
// // // //   try {
// // // //     const doc = await Document.findById(req.params.id);
// // // //     if (!doc) return res.status(404).json({ error: "Document not found" });
// // // //     res.json(doc);
// // // //   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// // // // });

// // // // // ৩. আপডেট ড্রাফট
// // // // router.put('/:id', async (req, res) => {
// // // //   try {
// // // //     const { title, parties, fields, totalPages, fileUrl, fileId } = req.body;
// // // //     const updated = await Document.findByIdAndUpdate(
// // // //       req.params.id,
// // // //       { $set: { title, parties, fields, totalPages, fileUrl, fileId } },
// // // //       { new: true }
// // // //     );
// // // //     res.json(updated);
// // // //   } catch (err) { res.status(500).json({ error: "Save failed" }); }
// // // // });

// // // // // ৪. প্রথম সাইনারকে ইমেল পাঠানো
// // // // router.post('/send', async (req, res) => {
// // // //   try {
// // // //     const doc = await Document.findById(req.body.id);
// // // //     if (!doc || !doc.parties.length) return res.status(400).json({ error: "Invalid document" });

// // // //     const token = crypto.randomBytes(32).toString('hex');
// // // //     doc.parties[0].token = token;
// // // //     doc.parties[0].status = 'sent';
// // // //     doc.status = 'in_progress';
// // // //     await doc.save();
    
// // // //     await sendSigningEmail(doc.parties[0], doc.title, token);
// // // //     res.json({ success: true });
// // // //   } catch (err) { res.status(500).json({ error: "Send failed" }); }
// // // // });

// // // // // ৫. টোকেন দিয়ে তথ্য রিট্রিভ করা (Signer View এর জন্য)
// // // // router.get('/sign/:token', async (req, res) => {
// // // //   try {
// // // //     const { token } = req.params;
// // // //     const doc = await Document.findOne({ "parties.token": token });
// // // //     if (!doc) return res.status(404).json({ error: "Invalid link" });

// // // //     const party = doc.parties.find(p => p.token === token);
// // // //     res.json({
// // // //       document: doc,
// // // //       party: { ...party.toObject(), index: doc.parties.indexOf(party) }
// // // //     });
// // // //   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// // // // });

// // // // // ৬. সাইন সাবমিট (সবচেয়ে গুরুত্বপূর্ণ রাউট)
// // // // router.post('/sign/submit', async (req, res) => {
// // // //   try {
// // // //     const { token, fields } = req.body;
// // // //     const doc = await Document.findOne({ "parties.token": token });
// // // //     if (!doc) return res.status(404).json({ error: "Session invalid" });

// // // //     const idx = doc.parties.findIndex(p => p.token === token);
// // // //     doc.parties[idx].status = 'signed';
// // // //     doc.parties[idx].token = null; // সিকিউরিটির জন্য টোকেন মুছে ফেলা
// // // //     doc.fields = fields;

// // // //     // যদি আরও সাইনার বাকি থাকে
// // // //     if (idx + 1 < doc.parties.length) {
// // // //       const nextToken = crypto.randomBytes(32).toString('hex');
// // // //       doc.parties[idx + 1].token = nextToken;
// // // //       doc.parties[idx + 1].status = 'sent';
// // // //       await doc.save();
// // // //       await sendSigningEmail(doc.parties[idx + 1], doc.title, nextToken);
// // // //       res.json({ success: true, next: true });
// // // //     } else {
// // // //       // শেষ সাইনার হলে ডকুমেন্ট কমপ্লিট করা
// // // //       doc.status = 'completed';
// // // //       await doc.save();
      
// // // //       // ফাইল জেনারেট করে সবাইকে মেইল পাঠানো (Async call)
// // // //       generateAndSendFinalDoc(doc);
      
// // // //       res.json({ success: true, completed: true });
// // // //     }
// // // //   } catch (err) { 
// // // //     console.error("Submit Error:", err);
// // // //     res.status(500).json({ error: "Submit failed" }); 
// // // //   }
// // // // });

// // // // // ৭. পিডিএফ প্রক্সি
// // // // router.get('/proxy/*', async (req, res) => {
// // // //   try {
// // // //     const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${req.params[0]}`;
// // // //     const response = await axios.get(url, { responseType: 'stream' });
// // // //     res.setHeader('Content-Type', 'application/pdf');
// // // //     response.data.pipe(res);
// // // //   } catch (err) { res.status(404).send("PDF not found"); }
// // // // });

// // // // module.exports = router;

// // // // const express = require('express');
// // // // const router = express.Router();
// // // // const multer = require('multer');
// // // // const axios = require('axios');
// // // // const { v2: cloudinary } = require('cloudinary');
// // // // const crypto = require('crypto');
// // // // const nodemailer = require('nodemailer');
// // // // const { PDFDocument } = require('pdf-lib');
// // // // const Document = require('../models/Document');
// // // // const AuditLog = require('../models/AuditLog'); // ✅ ১. অডিট লগ মডেল ইম্পোর্ট

// // // // // ১. Cloudinary কনফিগারেশন
// // // // cloudinary.config({
// // // //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
// // // //   api_key: process.env.CLOUDINARY_API_KEY,
// // // //   api_secret: process.env.CLOUDINARY_API_SECRET,
// // // // });

// // // // // ২. মেইল ট্রান্সপোর্টার
// // // // const transporter = nodemailer.createTransport({
// // // //   service: 'gmail',
// // // //   auth: { 
// // // //     user: process.env.EMAIL_USER, 
// // // //     pass: process.env.EMAIL_PASS 
// // // //   },
// // // // });

// // // // const upload = multer({ storage: multer.memoryStorage() });

// // // // // --- HELPER FUNCTIONS ---

// // // // const sendSigningEmail = async (party, docTitle, token) => {
// // // //   const signLink = `http://localhost:5173/sign?token=${token}`;
// // // //   const mailOptions = {
// // // //     from: `"NexSign" <${process.env.EMAIL_USER}>`,
// // // //     to: party.email,
// // // //     subject: `Signature Request: ${docTitle}`,
// // // //     html: `
// // // //       <div style="font-family:sans-serif;padding:20px;border:1px solid #eee;border-radius:10px;">
// // // //         <h2 style="color:#0ea5e9;">Hello ${party.name},</h2>
// // // //         <p>You have been requested to sign the document: <b>${docTitle}</b></p>
// // // //         <div style="margin:20px 0;">
// // // //           <a href="${signLink}" style="background:#0ea5e9;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;font-weight:bold;">Sign Document Now</a>
// // // //         </div>
// // // //         <p style="font-size:12px;color:#888;">If the button doesn't work, copy this link: ${signLink}</p>
// // // //       </div>
// // // //     `,
// // // //   };
// // // //   return transporter.sendMail(mailOptions);
// // // // };

// // // // const generateAndSendFinalDoc = async (doc) => {
// // // //   try {
// // // //     const response = await axios.get(doc.fileUrl, { responseType: 'arraybuffer' });
// // // //     const pdfDoc = await PDFDocument.load(response.data);
// // // //     const pages = pdfDoc.getPages();

// // // //     for (const field of doc.fields) {
// // // //       const f = typeof field === 'string' ? JSON.parse(field) : field;
// // // //       if (f.type === 'signature' && f.value) {
// // // //         const pageIndex = Number(f.page) - 1;
// // // //         if (pageIndex >= 0 && pageIndex < pages.length) {
// // // //           const page = pages[pageIndex];
// // // //           const { width, height } = page.getSize();
          
// // // //           // Base64 ইমেজ প্রসেসিং
// // // //           const base64Data = f.value.includes(',') ? f.value.split(',')[1] : f.value;
// // // //           const sigImg = await pdfDoc.embedPng(Buffer.from(base64Data, 'base64'));

// // // //           page.drawImage(sigImg, {
// // // //             x: (Number(f.x) * width) / 100,
// // // //             y: height - ((Number(f.y) * height) / 100) - ((Number(f.height) * height) / 100),
// // // //             width: (Number(f.width) * width) / 100,
// // // //             height: (Number(f.height) * height) / 100,
// // // //           });
// // // //         }
// // // //       }
// // // //     }
// // // //     const pdfBytes = await pdfDoc.save();
    
// // // //     // সব পার্টিকে মেইল পাঠানো
// // // //     const emails = doc.parties.map(p => p.email).join(',');
    
// // // //     await transporter.sendMail({
// // // //       from: `"NexSign" <${process.env.EMAIL_USER}>`,
// // // //       to: emails,
// // // //       subject: `Completed & Signed: ${doc.title}`,
// // // //       text: `All parties have signed "${doc.title}". Please find the attached final copy.`,
// // // //       attachments: [{ 
// // // //         filename: `${doc.title}_signed.pdf`, 
// // // //         content: Buffer.from(pdfBytes),
// // // //         contentType: 'application/pdf'
// // // //       }]
// // // //     });
// // // //     console.log("Final signed PDF sent to all parties.");
// // // //   } catch (err) { 
// // // //     console.error("Final PDF Generation Error:", err); 
// // // //   }
// // // // };

// // // // // --- ROUTES ---

// // // // // ১. ফাইল আপলোড
// // // // router.post('/upload', upload.single('file'), async (req, res) => {
// // // //   try {
// // // //     const result = await new Promise((resolve, reject) => {
// // // //       const stream = cloudinary.uploader.upload_stream({ resource_type: "raw", folder: "nexsign_docs" }, (err, res) => err ? reject(err) : resolve(res));
// // // //       stream.end(req.file.buffer);
// // // //     });
// // // //     const newDoc = new Document({ 
// // // //       title: req.file.originalname.replace('.pdf', ''), 
// // // //       fileUrl: result.secure_url, 
// // // //       fileId: result.public_id 
// // // //     });
// // // //     await newDoc.save();

// // // //     // ✅ অডিট লগ: ডকুমেন্ট তৈরি
// // // //     await new AuditLog({
// // // //       document_id: newDoc._id,
// // // //       action: 'created',
// // // //       details: 'Document uploaded to NexSign storage.'
// // // //     }).save();

// // // //     res.json(newDoc);
// // // //   } catch (err) { res.status(500).json({ error: "Upload failed" }); }
// // // // });

// // // // // ২. আইডি দিয়ে ডকুমেন্ট রিট্রিভ
// // // // router.get('/:id', async (req, res) => {
// // // //   try {
// // // //     const doc = await Document.findById(req.params.id);
// // // //     if (!doc) return res.status(404).json({ error: "Document not found" });
// // // //     res.json(doc);
// // // //   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// // // // });

// // // // // ৩. আপডেট ড্রাফট
// // // // router.put('/:id', async (req, res) => {
// // // //   try {
// // // //     const { title, parties, fields, totalPages, fileUrl, fileId } = req.body;
// // // //     const updated = await Document.findByIdAndUpdate(
// // // //       req.params.id,
// // // //       { $set: { title, parties, fields, totalPages, fileUrl, fileId } },
// // // //       { new: true }
// // // //     );
// // // //     res.json(updated);
// // // //   } catch (err) { res.status(500).json({ error: "Save failed" }); }
// // // // });

// // // // // ৪. প্রথম সাইনারকে ইমেল পাঠানো
// // // // router.post('/send', async (req, res) => {
// // // //   try {
// // // //     const doc = await Document.findById(req.body.id);
// // // //     if (!doc || !doc.parties.length) return res.status(400).json({ error: "Invalid document" });

// // // //     const token = crypto.randomBytes(32).toString('hex');
// // // //     doc.parties[0].token = token;
// // // //     doc.parties[0].status = 'sent';
// // // //     doc.status = 'in_progress';
// // // //     await doc.save();

// // // //     // ✅ অডিট লগ: মেইল পাঠানো
// // // //     await new AuditLog({
// // // //       document_id: doc._id,
// // // //       action: 'sent',
// // // //       party_name: doc.parties[0].name,
// // // //       party_email: doc.parties[0].email,
// // // //       details: `Signing invite sent to the first signer.`
// // // //     }).save();
    
// // // //     await sendSigningEmail(doc.parties[0], doc.title, token);
// // // //     res.json({ success: true });
// // // //   } catch (err) { res.status(500).json({ error: "Send failed" }); }
// // // // });

// // // // // ৫. টোকেন দিয়ে তথ্য রিট্রিভ করা (Signer View এর জন্য)
// // // // router.get('/sign/:token', async (req, res) => {
// // // //   try {
// // // //     const { token } = req.params;
// // // //     const doc = await Document.findOne({ "parties.token": token });
// // // //     if (!doc) return res.status(404).json({ error: "Invalid link" });

// // // //     const party = doc.parties.find(p => p.token === token);

// // // //     // ✅ অডিট লগ: ডকুমেন্ট ওপেন করা
// // // //     await new AuditLog({
// // // //       document_id: doc._id,
// // // //       action: 'opened',
// // // //       party_name: party.name,
// // // //       party_email: party.email,
// // // //       ip_address: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
// // // //       details: `Signer opened the document link.`
// // // //     }).save();

// // // //     res.json({
// // // //       document: doc,
// // // //       party: { ...party.toObject(), index: doc.parties.indexOf(party) }
// // // //     });
// // // //   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// // // // });

// // // // // ৬. সাইন সাবমিট (সবচেয়ে গুরুত্বপূর্ণ রাউট)
// // // // router.post('/sign/submit', async (req, res) => {
// // // //   try {
// // // //     const { token, fields } = req.body;
// // // //     const doc = await Document.findOne({ "parties.token": token });
// // // //     if (!doc) return res.status(404).json({ error: "Session invalid" });

// // // //     const idx = doc.parties.findIndex(p => p.token === token);
// // // //     const signer = doc.parties[idx]; // লগের জন্য সাইনারের ডাটা রাখা হলো

// // // //     doc.parties[idx].status = 'signed';
// // // //     doc.parties[idx].token = null; 
// // // //     doc.fields = fields;
// // // //     await doc.save();

// // // //     // ✅ অডিট লগ: সই করা
// // // //     await new AuditLog({
// // // //       document_id: doc._id,
// // // //       action: 'signed',
// // // //       party_name: signer.name,
// // // //       party_email: signer.email,
// // // //       ip_address: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
// // // //       details: `Successfully applied signature to document.`
// // // //     }).save();

// // // //     if (idx + 1 < doc.parties.length) {
// // // //       const nextToken = crypto.randomBytes(32).toString('hex');
// // // //       doc.parties[idx + 1].token = nextToken;
// // // //       doc.parties[idx + 1].status = 'sent';
// // // //       await doc.save();

// // // //       // ✅ অডিট লগ: পরের সাইনারকে ইনভাইট পাঠানো
// // // //       await new AuditLog({
// // // //         document_id: doc._id,
// // // //         action: 'sent',
// // // //         party_name: doc.parties[idx + 1].name,
// // // //         party_email: doc.parties[idx + 1].email,
// // // //         details: `Next signing invite sent to ${doc.parties[idx + 1].name}.`
// // // //       }).save();

// // // //       await sendSigningEmail(doc.parties[idx + 1], doc.title, nextToken);
// // // //       res.json({ success: true, next: true });
// // // //     } else {
// // // //       doc.status = 'completed';
// // // //       await doc.save();

// // // //       // ✅ অডিট লগ: ডকুমেন্ট কমপ্লিট হওয়া
// // // //       await new AuditLog({
// // // //         document_id: doc._id,
// // // //         action: 'completed',
// // // //         details: 'All parties have signed. Final PDF generated and distributed.'
// // // //       }).save();
      
// // // //       generateAndSendFinalDoc(doc);
// // // //       res.json({ success: true, completed: true });
// // // //     }
// // // //   } catch (err) { 
// // // //     console.error("Submit Error:", err);
// // // //     res.status(500).json({ error: "Submit failed" }); 
// // // //   }
// // // // });

// // // // // ৭. পিডিএফ প্রক্সি
// // // // router.get('/proxy/*', async (req, res) => {
// // // //   try {
// // // //     const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${req.params[0]}`;
// // // //     const response = await axios.get(url, { responseType: 'stream' });
// // // //     res.setHeader('Content-Type', 'application/pdf');
// // // //     response.data.pipe(res);
// // // //   } catch (err) { res.status(404).send("PDF not found"); }
// // // // });

// // // // module.exports = router;
// // // // const express = require('express');
// // // // const router = express.Router();
// // // // const multer = require('multer');
// // // // const axios = require('axios');
// // // // const { v2: cloudinary } = require('cloudinary');
// // // // const crypto = require('crypto');
// // // // const nodemailer = require('nodemailer');
// // // // const { PDFDocument } = require('pdf-lib');
// // // // const Document = require('../models/Document');
// // // // const AuditLog = require('../models/AuditLog');

// // // // // ১. Cloudinary কনফিগারেশন
// // // // cloudinary.config({
// // // //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
// // // //   api_key: process.env.CLOUDINARY_API_KEY,
// // // //   api_secret: process.env.CLOUDINARY_API_SECRET,
// // // // });

// // // // // ২. মেইল ট্রান্সপোর্টার
// // // // const transporter = nodemailer.createTransport({
// // // //   service: 'gmail',
// // // //   auth: { 
// // // //     user: process.env.EMAIL_USER, 
// // // //     pass: process.env.EMAIL_PASS 
// // // //   },
// // // // });

// // // // const upload = multer({ storage: multer.memoryStorage() });

// // // // // --- HELPER FUNCTIONS ---

// // // // const getClientIp = (req) => {
// // // //   return req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || "127.0.0.1";
// // // // };

// // // // const sendSigningEmail = async (party, docTitle, token) => {
// // // //   const signLink = `http://localhost:5173/sign?token=${token}`;
// // // //   const mailOptions = {
// // // //     from: `"NexSign" <${process.env.EMAIL_USER}>`,
// // // //     to: party.email,
// // // //     subject: `Signature Request: ${docTitle}`,
// // // //     html: `
// // // //       <div style="font-family:sans-serif;padding:20px;border:1px solid #eee;border-radius:10px;">
// // // //         <h2 style="color:#0ea5e9;">Hello ${party.name},</h2>
// // // //         <p>You have been requested to sign the document: <b>${docTitle}</b></p>
// // // //         <div style="margin:20px 0;">
// // // //           <a href="${signLink}" style="background:#0ea5e9;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;font-weight:bold;">Sign Document Now</a>
// // // //         </div>
// // // //       </div>
// // // //     `,
// // // //   };
// // // //   return transporter.sendMail(mailOptions);
// // // // };

// // // // const generateAndSendFinalDoc = async (doc) => {
// // // //   try {
// // // //     const response = await axios.get(doc.fileUrl, { responseType: 'arraybuffer' });
// // // //     const pdfDoc = await PDFDocument.load(response.data);
// // // //     const pages = pdfDoc.getPages();

// // // //     // Fields প্রসেসিং
// // // //     const processedFields = doc.fields.map(f => typeof f === 'string' ? JSON.parse(f) : f);

// // // //     for (const f of processedFields) {
// // // //       if (f.type === 'signature' && f.value) {
// // // //         const pageIndex = Number(f.page) - 1;
// // // //         if (pageIndex >= 0 && pageIndex < pages.length) {
// // // //           const page = pages[pageIndex];
// // // //           const { width, height } = page.getSize();
// // // //           const base64Data = f.value.includes(',') ? f.value.split(',')[1] : f.value;
// // // //           const sigImg = await pdfDoc.embedPng(Buffer.from(base64Data, 'base64'));

// // // //           page.drawImage(sigImg, {
// // // //             x: (Number(f.x) * width) / 100,
// // // //             y: height - ((Number(f.y) * height) / 100) - ((Number(f.height) * height) / 100),
// // // //             width: (Number(f.width) * width) / 100,
// // // //             height: (Number(f.height) * height) / 100,
// // // //           });
// // // //         }
// // // //       }
// // // //     }
// // // //     const pdfBytes = await pdfDoc.save();
// // // //     const emails = doc.parties.map(p => p.email).join(',');
    
// // // //     await transporter.sendMail({
// // // //       from: `"NexSign" <${process.env.EMAIL_USER}>`,
// // // //       to: emails,
// // // //       subject: `Completed & Signed: ${doc.title}`,
// // // //       text: `All parties have signed. Attached is the final copy.`,
// // // //       attachments: [{ filename: `${doc.title}_signed.pdf`, content: Buffer.from(pdfBytes), contentType: 'application/pdf' }]
// // // //     });
// // // //   } catch (err) { console.error("Final PDF Error:", err); }
// // // // };

// // // // // --- ROUTES ---

// // // // // ১. ফাইল আপলোড
// // // // router.post('/upload', upload.single('file'), async (req, res) => {
// // // //   try {
// // // //     const result = await new Promise((resolve, reject) => {
// // // //       const stream = cloudinary.uploader.upload_stream({ resource_type: "raw", folder: "nexsign_docs" }, (err, res) => err ? reject(err) : resolve(res));
// // // //       stream.end(req.file.buffer);
// // // //     });
// // // //     const newDoc = new Document({ 
// // // //       title: req.file.originalname.replace('.pdf', ''), 
// // // //       fileUrl: result.secure_url, 
// // // //       fileId: result.public_id 
// // // //     });
// // // //     await newDoc.save();
// // // //     await new AuditLog({ document_id: newDoc._id, action: 'created', ip_address: getClientIp(req), details: 'Uploaded.' }).save();
// // // //     res.json(newDoc);
// // // //   } catch (err) { res.status(500).json({ error: "Upload failed" }); }
// // // // });

// // // // // ২. রিট্রিভ
// // // // router.get('/:id', async (req, res) => {
// // // //   try {
// // // //     const doc = await Document.findById(req.params.id);
// // // //     res.json(doc);
// // // //   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// // // // });
// // // // // ড্যাশবোর্ডের জন্য সব ডকুমেন্ট একসাথে পাওয়ার রাউট
// // // // router.get('/', async (req, res) => {
// // // //   try {
// // // //     // ডাটাবেস থেকে সব ফাইল খুঁজে বের করা এবং নতুনগুলো উপরে রাখা
// // // //     const documents = await Document.find().sort({ createdAt: -1 });
// // // //     res.json(documents);
// // // //   } catch (err) {
// // // //     console.error("Error fetching all docs:", err);
// // // //     res.status(500).json({ error: "Failed to fetch documents" });
// // // //   }
// // // // });

// // // // // ৩. আপডেট ড্রাফট
// // // // router.put('/:id', async (req, res) => {
// // // //   try {
// // // //     const updated = await Document.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
// // // //     res.json(updated);
// // // //   } catch (err) { res.status(500).json({ error: "Save failed" }); }
// // // // });

// // // // // ৪. ইনভাইট পাঠানো
// // // // router.post('/send', async (req, res) => {
// // // //   try {
// // // //     const doc = await Document.findById(req.body.id);
// // // //     const token = crypto.randomBytes(32).toString('hex');
// // // //     doc.parties[0].token = token;
// // // //     doc.parties[0].status = 'sent';
// // // //     doc.status = 'in_progress';
// // // //     await doc.save();
// // // //     await new AuditLog({ document_id: doc._id, action: 'sent', party_name: doc.parties[0].name, party_email: doc.parties[0].email, ip_address: getClientIp(req), details: 'Sent to first signer.' }).save();
// // // //     await sendSigningEmail(doc.parties[0], doc.title, token);
// // // //     res.json({ success: true });
// // // //   } catch (err) { res.status(500).json({ error: "Send failed" }); }
// // // // });

// // // // // ৫. সাইনার ভিউ (SIGNER INDEX & AWAITING FIX)
// // // // router.get('/sign/:token', async (req, res) => {
// // // //   try {
// // // //     const doc = await Document.findOne({ "parties.token": req.params.token });
// // // //     if (!doc) return res.status(404).json({ error: "Invalid link" });
    
// // // //     const party = doc.parties.find(p => p.token === req.params.token);
// // // //     const partyIndex = doc.parties.indexOf(party);

// // // //     // Fields প্রসেসিং এবং Signer Index ম্যাচিং
// // // //     const formattedFields = doc.fields.map(f => {
// // // //       const fieldData = typeof f === 'string' ? JSON.parse(f) : f;
// // // //       return {
// // // //         ...fieldData,
// // // //         // নিশ্চিত করা যে index নম্বর হিসেবে চেক হচ্ছে
// // // //         isMine: parseInt(fieldData.signerIndex) === partyIndex 
// // // //       };
// // // //     });

// // // //     await new AuditLog({ 
// // // //       document_id: doc._id, 
// // // //       action: 'opened', 
// // // //       party_name: party.name, 
// // // //       party_email: party.email, 
// // // //       ip_address: getClientIp(req), 
// // // //       details: 'Signer interface loaded.' 
// // // //     }).save();

// // // //     res.json({ 
// // // //       document: { ...doc.toObject(), fields: formattedFields }, 
// // // //       party: { ...party.toObject(), index: partyIndex } 
// // // //     });
// // // //   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// // // // });

// // // // // ৬. সাইন সাবমিট
// // // // router.post('/sign/submit', async (req, res) => {
// // // //   try {
// // // //     const { token, fields } = req.body;
// // // //     const doc = await Document.findOne({ "parties.token": token });
// // // //     const idx = doc.parties.findIndex(p => p.token === token);
// // // //     const signer = doc.parties[idx];

// // // //     doc.parties[idx].status = 'signed';
// // // //     doc.parties[idx].token = null; 
// // // //     doc.fields = fields;
// // // //     await doc.save();

// // // //     await new AuditLog({ document_id: doc._id, action: 'signed', party_name: signer.name, party_email: signer.email, ip_address: getClientIp(req), details: 'Successfully signed.' }).save();

// // // //     if (idx + 1 < doc.parties.length) {
// // // //       const nextToken = crypto.randomBytes(32).toString('hex');
// // // //       doc.parties[idx + 1].token = nextToken;
// // // //       doc.parties[idx + 1].status = 'sent';
// // // //       await doc.save();
// // // //       await sendSigningEmail(doc.parties[idx + 1], doc.title, nextToken);
// // // //       res.json({ success: true, next: true });
// // // //     } else {
// // // //       doc.status = 'completed';
// // // //       await doc.save();
// // // //       await new AuditLog({ document_id: doc._id, action: 'completed', details: 'All parties signed. PDF finalized.' }).save();
// // // //       generateAndSendFinalDoc(doc);
// // // //       res.json({ success: true, completed: true });
// // // //     }
// // // //   } catch (err) { res.status(500).json({ error: "Submit failed" }); }
// // // // });

// // // // // ৭. পিডিএফ প্রক্সি
// // // // router.get('/proxy/*', async (req, res) => {
// // // //   try {
// // // //     const path = req.params[0];
// // // //     const cloudinaryUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${path}`;
    
// // // //     const response = await axios.get(cloudinaryUrl, { responseType: 'stream' });
// // // //     res.setHeader('Content-Type', 'application/pdf');
// // // //     response.data.pipe(res);
// // // //   } catch (err) {
// // // //     res.status(404).send("Cloudinary PDF Not Found");
// // // //   }
// // // // });

// // // // // ৮. অডিট হিস্ট্রি
// // // // router.get('/:id/history', async (req, res) => {
// // // //   try {
// // // //     const logs = await AuditLog.find({ document_id: req.params.id }).sort({ timestamp: -1 });
// // // //     res.json(logs);
// // // //   } catch (err) { res.status(500).json({ error: "History fetch error" }); }
// // // // });

// // // // // চূড়ান্ত স্বাক্ষরিত পিডিএফ সরাসরি ব্রাউজারে দেখার প্রক্সি
// // // // // ✅ এটি নতুন যোগ করবেন (Final Signed PDF ভিউ করার জন্য)
// // // // router.get('/view-signed/:id', async (req, res) => {
// // // //   try {
// // // //     const doc = await Document.findById(req.params.id);
    
// // // //     if (!doc) return res.status(404).send("Document not found");

// // // //     // যদি স্ট্যাটাস completed না হয়, তবে তাকে ফাইলটি দেখতে দেওয়া হবে না
// // // //     if (doc.status !== 'completed') {
// // // //       return res.status(403).send("This document is not yet fully signed.");
// // // //     }

// // // //     // Cloudinary থেকে স্বাক্ষরসহ ফাইনাল পিডিএফ ইউআরএল নিয়ে আসা
// // // //     const response = await axios.get(doc.fileUrl, { responseType: 'stream' });
    
// // // //     res.setHeader('Content-Type', 'application/pdf');
// // // //     res.setHeader('Content-Disposition', `inline; filename="${doc.title}_signed.pdf"`);
    
// // // //     response.data.pipe(res);
// // // //   } catch (err) {
// // // //     console.error("View Final PDF Error:", err.message);
// // // //     res.status(500).send("Error loading signed document");
// // // //   }
// // // // });
// // // // module.exports = router;

// // // // const express = require('express');
// // // // const router = express.Router();
// // // // const multer = require('multer');
// // // // const axios = require('axios');
// // // // const { v2: cloudinary } = require('cloudinary');
// // // // const crypto = require('crypto');
// // // // const nodemailer = require('nodemailer');
// // // // const { PDFDocument } = require('pdf-lib');
// // // // const Document = require('../models/Document');
// // // // const AuditLog = require('../models/AuditLog');

// // // // // 1. Cloudinary Configuration
// // // // cloudinary.config({
// // // //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
// // // //   api_key: process.env.CLOUDINARY_API_KEY,
// // // //   api_secret: process.env.CLOUDINARY_API_SECRET,
// // // // });

// // // // // 2. Mail Transporter
// // // // const transporter = nodemailer.createTransport({
// // // //   service: 'gmail',
// // // //   auth: { 
// // // //     user: process.env.EMAIL_USER, 
// // // //     pass: process.env.EMAIL_PASS 
// // // //   },
// // // // });

// // // // const upload = multer({ storage: multer.memoryStorage() });

// // // // // --- HELPER FUNCTIONS ---

// // // // const getClientIp = (req) => {
// // // //   return req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || "127.0.0.1";
// // // // };

// // // // const sendSigningEmail = async (party, docTitle, token) => {
// // // //   const signLink = `http://localhost:5173/sign?token=${token}`;
// // // //   const mailOptions = {
// // // //     from: `"NexSign" <${process.env.EMAIL_USER}>`,
// // // //     to: party.email,
// // // //     subject: `Signature Request: ${docTitle}`,
// // // //     html: `
// // // //       <div style="font-family:sans-serif;padding:20px;border:1px solid #eee;border-radius:10px;">
// // // //         <h2 style="color:#0ea5e9;">Hello ${party.name},</h2>
// // // //         <p>You have been requested to sign the document: <b>${docTitle}</b></p>
// // // //         <div style="margin:20px 0;">
// // // //           <a href="${signLink}" style="background:#0ea5e9;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;font-weight:bold;">Sign Document Now</a>
// // // //         </div>
// // // //       </div>
// // // //     `,
// // // //   };
// // // //   return transporter.sendMail(mailOptions);
// // // // };

// // // // const generateAndSendFinalDoc = async (doc) => {
// // // //   try {
// // // //     const response = await axios.get(doc.fileUrl, { responseType: 'arraybuffer' });
// // // //     const pdfDoc = await PDFDocument.load(response.data);
// // // //     const pages = pdfDoc.getPages();

// // // //     const processedFields = doc.fields.map(f => typeof f === 'string' ? JSON.parse(f) : f);

// // // //     for (const f of processedFields) {
// // // //       if (f.type === 'signature' && f.value) {
// // // //         const pageIndex = Number(f.page) - 1;
// // // //         if (pageIndex >= 0 && pageIndex < pages.length) {
// // // //           const page = pages[pageIndex];
// // // //           const { width, height } = page.getSize();
// // // //           const base64Data = f.value.includes(',') ? f.value.split(',')[1] : f.value;
// // // //           const sigImg = await pdfDoc.embedPng(Buffer.from(base64Data, 'base64'));

// // // //           page.drawImage(sigImg, {
// // // //             x: (Number(f.x) * width) / 100,
// // // //             y: height - ((Number(f.y) * height) / 100) - ((Number(f.height) * height) / 100),
// // // //             width: (Number(f.width) * width) / 100,
// // // //             height: (Number(f.height) * height) / 100,
// // // //           });
// // // //         }
// // // //       }
// // // //     }
// // // //     const pdfBytes = await pdfDoc.save();
// // // //     const emails = doc.parties.map(p => p.email).join(',');
    
// // // //     await transporter.sendMail({
// // // //       from: `"NexSign" <${process.env.EMAIL_USER}>`,
// // // //       to: emails,
// // // //       subject: `Completed & Signed: ${doc.title}`,
// // // //       text: `All parties have signed. Attached is the final copy.`,
// // // //       attachments: [{ filename: `${doc.title}_signed.pdf`, content: Buffer.from(pdfBytes), contentType: 'application/pdf' }]
// // // //     });
// // // //   } catch (err) { console.error("Final PDF Error:", err); }
// // // // };

// // // // // --- ROUTES ---

// // // // // 1. Upload
// // // // router.post('/upload', upload.single('file'), async (req, res) => {
// // // //   try {
// // // //     const result = await new Promise((resolve, reject) => {
// // // //       const stream = cloudinary.uploader.upload_stream({ resource_type: "raw", folder: "nexsign_docs" }, (err, res) => err ? reject(err) : resolve(res));
// // // //       stream.end(req.file.buffer);
// // // //     });
// // // //     const newDoc = new Document({ 
// // // //       title: req.file.originalname.replace('.pdf', ''), 
// // // //       fileUrl: result.secure_url, 
// // // //       fileId: result.public_id 
// // // //     });
// // // //     await newDoc.save();
// // // //     await new AuditLog({ document_id: newDoc._id, action: 'created', ip_address: getClientIp(req), details: 'Uploaded.' }).save();
// // // //     res.json(newDoc);
// // // //   } catch (err) { res.status(500).json({ error: "Upload failed" }); }
// // // // });

// // // // // 2. Fetch All
// // // // router.get('/', async (req, res) => {
// // // //   try {
// // // //     const documents = await Document.find().sort({ createdAt: -1 });
// // // //     res.json(documents);
// // // //   } catch (err) { res.status(500).json({ error: "Failed to fetch documents" }); }
// // // // });

// // // // // 3. Retrieve Single
// // // // router.get('/:id', async (req, res) => {
// // // //   try {
// // // //     const doc = await Document.findById(req.params.id);
// // // //     res.json(doc);
// // // //   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// // // // });

// // // // // 4. Update Draft
// // // // router.put('/:id', async (req, res) => {
// // // //   try {
// // // //     const updated = await Document.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
// // // //     res.json(updated);
// // // //   } catch (err) { res.status(500).json({ error: "Save failed" }); }
// // // // });

// // // // // 5. Send Invitations
// // // // router.post('/send', async (req, res) => {
// // // //   try {
// // // //     const doc = await Document.findById(req.body.id);
// // // //     const token = crypto.randomBytes(32).toString('hex');
// // // //     doc.parties[0].token = token;
// // // //     doc.parties[0].status = 'sent';
// // // //     doc.status = 'in_progress';
// // // //     await doc.save();
// // // //     await new AuditLog({ document_id: doc._id, action: 'sent', party_name: doc.parties[0].name, party_email: doc.parties[0].email, ip_address: getClientIp(req), details: 'Sent to first signer.' }).save();
// // // //     await sendSigningEmail(doc.parties[0], doc.title, token);
// // // //     res.json({ success: true });
// // // //   } catch (err) { res.status(500).json({ error: "Send failed" }); }
// // // // });

// // // // // 6. Signer View
// // // // router.get('/sign/:token', async (req, res) => {
// // // //   try {
// // // //     const doc = await Document.findOne({ "parties.token": req.params.token });
// // // //     if (!doc) return res.status(404).json({ error: "Invalid link" });
    
// // // //     const party = doc.parties.find(p => p.token === req.params.token);
// // // //     const partyIndex = doc.parties.indexOf(party);

// // // //     const formattedFields = doc.fields.map(f => {
// // // //       const fieldData = typeof f === 'string' ? JSON.parse(f) : f;
// // // //       return {
// // // //         ...fieldData,
// // // //         isMine: parseInt(fieldData.signerIndex) === partyIndex 
// // // //       };
// // // //     });

// // // //     await new AuditLog({ 
// // // //       document_id: doc._id, 
// // // //       action: 'opened', 
// // // //       party_name: party.name, 
// // // //       party_email: party.email, 
// // // //       ip_address: getClientIp(req), 
// // // //       details: 'Signer interface loaded.' 
// // // //     }).save();

// // // //     res.json({ 
// // // //       document: { ...doc.toObject(), fields: formattedFields }, 
// // // //       party: { ...party.toObject(), index: partyIndex } 
// // // //     });
// // // //   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// // // // });

// // // // // 7. Sign Submit
// // // // router.post('/sign/submit', async (req, res) => {
// // // //   try {
// // // //     const { token, fields } = req.body;
// // // //     const doc = await Document.findOne({ "parties.token": token });
// // // //     const idx = doc.parties.findIndex(p => p.token === token);
// // // //     const signer = doc.parties[idx];

// // // //     doc.parties[idx].status = 'signed';
// // // //     doc.parties[idx].token = null; 
// // // //     doc.fields = fields;
// // // //     await doc.save();

// // // //     await new AuditLog({ document_id: doc._id, action: 'signed', party_name: signer.name, party_email: signer.email, ip_address: getClientIp(req), details: 'Successfully signed.' }).save();

// // // //     if (idx + 1 < doc.parties.length) {
// // // //       const nextToken = crypto.randomBytes(32).toString('hex');
// // // //       doc.parties[idx + 1].token = nextToken;
// // // //       doc.parties[idx + 1].status = 'sent';
// // // //       await doc.save();
// // // //       await sendSigningEmail(doc.parties[idx + 1], doc.title, nextToken);
// // // //       res.json({ success: true, next: true });
// // // //     } else {
// // // //       doc.status = 'completed';
// // // //       await doc.save();
// // // //       await new AuditLog({ document_id: doc._id, action: 'completed', details: 'All parties signed. PDF finalized.' }).save();
// // // //       generateAndSendFinalDoc(doc);
// // // //       res.json({ success: true, completed: true });
// // // //     }
// // // //   } catch (err) { res.status(500).json({ error: "Submit failed" }); }
// // // // });

// // // // // 8. PDF Proxy (FIXED FOR CORS)
// // // // router.get('/proxy/*', async (req, res) => {
// // // //   try {
// // // //     const path = req.params[0];
// // // //     const cloudinaryUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${path}`;
    
// // // //     const response = await axios.get(cloudinaryUrl, { responseType: 'stream' });

// // // //     // Explicitly set headers to allow the specific frontend origin with credentials
// // // //     res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
// // // //     res.setHeader('Access-Control-Allow-Credentials', 'true');
// // // //     res.setHeader('Content-Type', 'application/pdf');

// // // //     response.data.pipe(res);
// // // //   } catch (err) {
// // // //     console.error("Proxy Error:", err.message);
// // // //     res.status(404).send("Cloudinary PDF Not Found");
// // // //   }
// // // // });

// // // // // 9. History
// // // // router.get('/:id/history', async (req, res) => {
// // // //   try {
// // // //     const logs = await AuditLog.find({ document_id: req.params.id }).sort({ timestamp: -1 });
// // // //     res.json(logs);
// // // //   } catch (err) { res.status(500).json({ error: "History fetch error" }); }
// // // // });

// // // // // 10. View Final Signed PDF
// // // // router.get('/view-signed/:id', async (req, res) => {
// // // //   try {
// // // //     const doc = await Document.findById(req.params.id);
// // // //     if (!doc || doc.status !== 'completed') {
// // // //       return res.status(403).send("This document is not yet fully signed.");
// // // //     }
// // // //     const response = await axios.get(doc.fileUrl, { responseType: 'stream' });
// // // //     res.setHeader('Content-Type', 'application/pdf');
// // // //     res.setHeader('Content-Disposition', `inline; filename="${doc.title}_signed.pdf"`);
// // // //     response.data.pipe(res);
// // // //   } catch (err) {
// // // //     res.status(500).send("Error loading signed document");
// // // //   }
// // // // });

// // // // module.exports = router;


// // // //  const express = require('express');
// // // // const router = express.Router();
// // // // const multer = require('multer');
// // // // const axios = require('axios');
// // // // const { v2: cloudinary } = require('cloudinary');
// // // // const crypto = require('crypto');
// // // // const nodemailer = require('nodemailer');
// // // // const { PDFDocument } = require('pdf-lib');
// // // // const Document = require('../models/Document');
// // // // const AuditLog = require('../models/AuditLog');

// // // // // 1. Cloudinary Configuration
// // // // cloudinary.config({
// // // //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
// // // //   api_key: process.env.CLOUDINARY_API_KEY,
// // // //   api_secret: process.env.CLOUDINARY_API_SECRET,
// // // // });

// // // // // 2. Mail Transporter
// // // // const transporter = nodemailer.createTransport({
// // // //   service: 'gmail',
// // // //   auth: { 
// // // //     user: process.env.EMAIL_USER, 
// // // //     pass: process.env.EMAIL_PASS 
// // // //   },
// // // // });

// // // // const upload = multer({ storage: multer.memoryStorage() });

// // // // // --- HELPER FUNCTIONS ---

// // // // const getClientIp = (req) => {
// // // //   return req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || "127.0.0.1";
// // // // };

// // // // const sendSigningEmail = async (party, docTitle, token) => {
// // // //   const signLink = `http://localhost:5173/sign?token=${token}`;
// // // //   const mailOptions = {
// // // //     from: `"NexSign" <${process.env.EMAIL_USER}>`,
// // // //     to: party.email,
// // // //     subject: `Signature Request: ${docTitle}`,
// // // //     html: `
// // // //       <div style="font-family:sans-serif;padding:20px;border:1px solid #eee;border-radius:10px;">
// // // //         <h2 style="color:#0ea5e9;">Hello ${party.name},</h2>
// // // //         <p>You have been requested to sign the document: <b>${docTitle}</b></p>
// // // //         <div style="margin:20px 0;">
// // // //           <a href="${signLink}" style="background:#0ea5e9;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;font-weight:bold;">Sign Document Now</a>
// // // //         </div>
// // // //       </div>
// // // //     `,
// // // //   };
// // // //   return transporter.sendMail(mailOptions);
// // // // };

// // // // const generateAndSendFinalDoc = async (doc) => {
// // // //   try {
// // // //     const response = await axios.get(doc.fileUrl, { responseType: 'arraybuffer' });
// // // //     const pdfDoc = await PDFDocument.load(response.data);
// // // //     const pages = pdfDoc.getPages();

// // // //     const processedFields = doc.fields.map(f => typeof f === 'string' ? JSON.parse(f) : f);

// // // //     for (const f of processedFields) {
// // // //       if (f.type === 'signature' && f.value) {
// // // //         const pageIndex = Number(f.page) - 1;
// // // //         if (pageIndex >= 0 && pageIndex < pages.length) {
// // // //           const page = pages[pageIndex];
// // // //           const { width, height } = page.getSize();
// // // //           const base64Data = f.value.includes(',') ? f.value.split(',')[1] : f.value;
// // // //           const sigImg = await pdfDoc.embedPng(Buffer.from(base64Data, 'base64'));

// // // //           page.drawImage(sigImg, {
// // // //             x: (Number(f.x) * width) / 100,
// // // //             y: height - ((Number(f.y) * height) / 100) - ((Number(f.height) * height) / 100),
// // // //             width: (Number(f.width) * width) / 100,
// // // //             height: (Number(f.height) * height) / 100,
// // // //           });
// // // //         }
// // // //       }
// // // //     }
// // // //     const pdfBytes = await pdfDoc.save();
// // // //     const emails = doc.parties.map(p => p.email).join(',');
    
// // // //     await transporter.sendMail({
// // // //       from: `"NexSign" <${process.env.EMAIL_USER}>`,
// // // //       to: emails,
// // // //       subject: `Completed & Signed: ${doc.title}`,
// // // //       text: `All parties have signed. Attached is the final copy.`,
// // // //       attachments: [{ filename: `${doc.title}_signed.pdf`, content: Buffer.from(pdfBytes), contentType: 'application/pdf' }]
// // // //     });
// // // //   } catch (err) { console.error("Final PDF Error:", err); }
// // // // };

// // // // // --- ROUTES ---

// // // // // 1. Upload
// // // // router.post('/upload', upload.single('file'), async (req, res) => {
// // // //   try {
// // // //     const result = await new Promise((resolve, reject) => {
// // // //       const stream = cloudinary.uploader.upload_stream({ resource_type: "raw", folder: "nexsign_docs" }, (err, res) => err ? reject(err) : resolve(res));
// // // //       stream.end(req.file.buffer);
// // // //     });
// // // //     const newDoc = new Document({ 
// // // //       title: req.file.originalname.replace('.pdf', ''), 
// // // //       fileUrl: result.secure_url, 
// // // //       fileId: result.public_id 
// // // //     });
// // // //     await newDoc.save();
// // // //     await new AuditLog({ document_id: newDoc._id, action: 'created', ip_address: getClientIp(req), details: 'Uploaded.' }).save();
// // // //     res.json(newDoc);
// // // //   } catch (err) { res.status(500).json({ error: "Upload failed" }); }
// // // // });

// // // // // 2. Fetch All
// // // // router.get('/', async (req, res) => {
// // // //   try {
// // // //     const documents = await Document.find().sort({ createdAt: -1 });
// // // //     res.json(documents);
// // // //   } catch (err) { res.status(500).json({ error: "Failed to fetch documents" }); }
// // // // });

// // // // // 3. Retrieve Single
// // // // router.get('/:id', async (req, res) => {
// // // //   try {
// // // //     const doc = await Document.findById(req.params.id);
// // // //     res.json(doc);
// // // //   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// // // // });

// // // // // 4. Update Draft
// // // // router.put('/:id', async (req, res) => {
// // // //   try {
// // // //     const updated = await Document.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
// // // //     res.json(updated);
// // // //   } catch (err) { res.status(500).json({ error: "Save failed" }); }
// // // // });

// // // // // 5. Send Invitations
// // // // router.post('/send', async (req, res) => {
// // // //   try {
// // // //     const doc = await Document.findById(req.body.id);
// // // //     const token = crypto.randomBytes(32).toString('hex');
// // // //     doc.parties[0].token = token;
// // // //     doc.parties[0].status = 'sent';
// // // //     doc.status = 'in_progress';
// // // //     await doc.save();
// // // //     await new AuditLog({ document_id: doc._id, action: 'sent', party_name: doc.parties[0].name, party_email: doc.parties[0].email, ip_address: getClientIp(req), details: 'Sent to first signer.' }).save();
// // // //     await sendSigningEmail(doc.parties[0], doc.title, token);
// // // //     res.json({ success: true });
// // // //   } catch (err) { res.status(500).json({ error: "Send failed" }); }
// // // // });

// // // // // 6. Signer View
// // // // router.get('/sign/:token', async (req, res) => {
// // // //   try {
// // // //     const doc = await Document.findOne({ "parties.token": req.params.token });
// // // //     if (!doc) return res.status(404).json({ error: "Invalid link" });
    
// // // //     const party = doc.parties.find(p => p.token === req.params.token);
// // // //     const partyIndex = doc.parties.indexOf(party);

// // // //     const formattedFields = doc.fields.map(f => {
// // // //       const fieldData = typeof f === 'string' ? JSON.parse(f) : f;
// // // //       return {
// // // //         ...fieldData,
// // // //         isMine: parseInt(fieldData.signerIndex) === partyIndex 
// // // //       };
// // // //     });

// // // //     await new AuditLog({ 
// // // //       document_id: doc._id, 
// // // //       action: 'opened', 
// // // //       party_name: party.name, 
// // // //       party_email: party.email, 
// // // //       ip_address: getClientIp(req), 
// // // //       details: 'Signer interface loaded.' 
// // // //     }).save();

// // // //     res.json({ 
// // // //       document: { ...doc.toObject(), fields: formattedFields }, 
// // // //       party: { ...party.toObject(), index: partyIndex } 
// // // //     });
// // // //   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// // // // });

// // // // // 7. Sign Submit
// // // // router.post('/sign/submit', async (req, res) => {
// // // //   try {
// // // //     const { token, fields } = req.body;
// // // //     const doc = await Document.findOne({ "parties.token": token });
// // // //     const idx = doc.parties.findIndex(p => p.token === token);
// // // //     const signer = doc.parties[idx];

// // // //     doc.parties[idx].status = 'signed';
// // // //     doc.parties[idx].token = null; 
// // // //     doc.fields = fields;
// // // //     await doc.save();

// // // //     await new AuditLog({ document_id: doc._id, action: 'signed', party_name: signer.name, party_email: signer.email, ip_address: getClientIp(req), details: 'Successfully signed.' }).save();

// // // //     if (idx + 1 < doc.parties.length) {
// // // //       const nextToken = crypto.randomBytes(32).toString('hex');
// // // //       doc.parties[idx + 1].token = nextToken;
// // // //       doc.parties[idx + 1].status = 'sent';
// // // //       await doc.save();
// // // //       await sendSigningEmail(doc.parties[idx + 1], doc.title, nextToken);
// // // //       res.json({ success: true, next: true });
// // // //     } else {
// // // //       doc.status = 'completed';
// // // //       await doc.save();
// // // //       await new AuditLog({ document_id: doc._id, action: 'completed', details: 'All parties signed. PDF finalized.' }).save();
// // // //       generateAndSendFinalDoc(doc);
// // // //       res.json({ success: true, completed: true });
// // // //     }
// // // //   } catch (err) { res.status(500).json({ error: "Submit failed" }); }
// // // // });

// // // // // 8. PDF Proxy (FIXED FOR CORS)
// // // // router.get('/proxy/*', async (req, res) => {
// // // //   try {
// // // //     const path = req.params[0];
// // // //     const cloudinaryUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${path}`;
    
// // // //     const response = await axios.get(cloudinaryUrl, { responseType: 'stream' });

// // // //     // Explicitly set headers to allow the specific frontend origin with credentials
// // // //     res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
// // // //     res.setHeader('Access-Control-Allow-Credentials', 'true');
// // // //     res.setHeader('Content-Type', 'application/pdf');

// // // //     response.data.pipe(res);
// // // //   } catch (err) {
// // // //     console.error("Proxy Error:", err.message);
// // // //     res.status(404).send("Cloudinary PDF Not Found");
// // // //   }
// // // // });

// // // // // 9. History
// // // // router.get('/:id/history', async (req, res) => {
// // // //   try {
// // // //     const logs = await AuditLog.find({ document_id: req.params.id }).sort({ timestamp: -1 });
// // // //     res.json(logs);
// // // //   } catch (err) { res.status(500).json({ error: "History fetch error" }); }
// // // // });

// // // // // 10. View Final Signed PDF
// // // // router.get('/view-signed/:id', async (req, res) => {
// // // //   try {
// // // //     const doc = await Document.findById(req.params.id);
// // // //     if (!doc || doc.status !== 'completed') {
// // // //       return res.status(403).send("This document is not yet fully signed.");
// // // //     }
// // // //     const response = await axios.get(doc.fileUrl, { responseType: 'stream' });
// // // //     res.setHeader('Content-Type', 'application/pdf');
// // // //     res.setHeader('Content-Disposition', `inline; filename="${doc.title}_signed.pdf"`);
// // // //     response.data.pipe(res);
// // // //   } catch (err) {
// // // //     res.status(500).send("Error loading signed document");
// // // //   }
// // // // });

// // // // module.exports = router;


// // // // const express = require('express');
// // // // const router = express.Router();
// // // // const multer = require('multer');
// // // // const axios = require('axios');
// // // // const { v2: cloudinary } = require('cloudinary');
// // // // const crypto = require('crypto');
// // // // const nodemailer = require('nodemailer');
// // // // const { PDFDocument } = require('pdf-lib');
// // // // const Document = require('../models/Document');
// // // // const AuditLog = require('../models/AuditLog');

// // // // // 1. Cloudinary Configuration
// // // // cloudinary.config({
// // // //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
// // // //   api_key: process.env.CLOUDINARY_API_KEY,
// // // //   api_secret: process.env.CLOUDINARY_API_SECRET,
// // // // });

// // // // // 2. Mail Transporter
// // // // const transporter = nodemailer.createTransport({
// // // //   service: 'gmail',
// // // //   auth: { 
// // // //     user: process.env.EMAIL_USER, 
// // // //     pass: process.env.EMAIL_PASS 
// // // //   },
// // // // });

// // // // const upload = multer({ storage: multer.memoryStorage() });

// // // // // --- HELPER FUNCTIONS ---

// // // // const getClientIp = (req) => {
// // // //   return req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || "127.0.0.1";
// // // // };

// // // // const sendSigningEmail = async (party, docTitle, token) => {
// // // //   const signLink = `http://localhost:5173/sign?token=${token}`;
// // // //   const mailOptions = {
// // // //     from: `"NexSign" <${process.env.EMAIL_USER}>`,
// // // //     to: party.email,
// // // //     subject: `Signature Request: ${docTitle}`,
// // // //     html: `
// // // //       <div style="font-family:sans-serif;padding:20px;border:1px solid #eee;border-radius:10px;">
// // // //         <h2 style="color:#0ea5e9;">Hello ${party.name},</h2>
// // // //         <p>You have been requested to sign the document: <b>${docTitle}</b></p>
// // // //         <div style="margin:20px 0;">
// // // //           <a href="${signLink}" style="background:#0ea5e9;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;font-weight:bold;">Sign Document Now</a>
// // // //         </div>
// // // //       </div>
// // // //     `,
// // // //   };
// // // //   return transporter.sendMail(mailOptions);
// // // // };

// // // // // Merging Logic Helper (Extracted for reuse)
// // // // const mergeSignatures = async (doc) => {
// // // //   const response = await axios.get(doc.fileUrl, { responseType: 'arraybuffer' });
// // // //   const pdfDoc = await PDFDocument.load(response.data);
// // // //   const pages = pdfDoc.getPages();
// // // //   const processedFields = doc.fields.map(f => typeof f === 'string' ? JSON.parse(f) : f);

// // // //   for (const f of processedFields) {
// // // //     if (f.type === 'signature' && f.value) {
// // // //       const pageIndex = Number(f.page) - 1;
// // // //       if (pageIndex >= 0 && pageIndex < pages.length) {
// // // //         const page = pages[pageIndex];
// // // //         const { width, height } = page.getSize();
// // // //         const base64Data = f.value.includes(',') ? f.value.split(',')[1] : f.value;
// // // //         const sigImg = await pdfDoc.embedPng(Buffer.from(base64Data, 'base64'));

// // // //         page.drawImage(sigImg, {
// // // //           x: (Number(f.x) * width) / 100,
// // // //           y: height - ((Number(f.y) * height) / 100) - ((Number(f.height) * height) / 100),
// // // //           width: (Number(f.width) * width) / 100,
// // // //           height: (Number(f.height) * height) / 100,
// // // //         });
// // // //       }
// // // //     }
// // // //   }
// // // //   return await pdfDoc.save();
// // // // };

// // // // const generateAndSendFinalDoc = async (doc) => {
// // // //   try {
// // // //     const pdfBytes = await mergeSignatures(doc);
// // // //     const emails = doc.parties.map(p => p.email).join(',');
// // // //     await transporter.sendMail({
// // // //       from: `"NexSign" <${process.env.EMAIL_USER}>`,
// // // //       to: emails,
// // // //       subject: `Completed & Signed: ${doc.title}`,
// // // //       text: `All parties have signed. Attached is the final copy.`,
// // // //       attachments: [{ filename: `${doc.title}_signed.pdf`, content: Buffer.from(pdfBytes), contentType: 'application/pdf' }]
// // // //     });
// // // //   } catch (err) { console.error("Final PDF Email Error:", err); }
// // // // };

// // // // // --- ROUTES ---

// // // // router.post('/upload', upload.single('file'), async (req, res) => {
// // // //   try {
// // // //     const result = await new Promise((resolve, reject) => {
// // // //       const stream = cloudinary.uploader.upload_stream({ resource_type: "raw", folder: "nexsign_docs" }, (err, res) => err ? reject(err) : resolve(res));
// // // //       stream.end(req.file.buffer);
// // // //     });
// // // //     const newDoc = new Document({ title: req.file.originalname.replace('.pdf', ''), fileUrl: result.secure_url, fileId: result.public_id });
// // // //     await newDoc.save();
// // // //     res.json(newDoc);
// // // //   } catch (err) { res.status(500).json({ error: "Upload failed" }); }
// // // // });

// // // // router.get('/', async (req, res) => {
// // // //   try {
// // // //     const documents = await Document.find().sort({ createdAt: -1 });
// // // //     res.json(documents);
// // // //   } catch (err) { res.status(500).json({ error: "Failed to fetch documents" }); }
// // // // });

// // // // router.get('/:id', async (req, res) => {
// // // //   try {
// // // //     const doc = await Document.findById(req.params.id);
// // // //     res.json(doc);
// // // //   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// // // // });

// // // // router.put('/:id', async (req, res) => {
// // // //   try {
// // // //     const updated = await Document.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
// // // //     res.json(updated);
// // // //   } catch (err) { res.status(500).json({ error: "Save failed" }); }
// // // // });

// // // // router.post('/send', async (req, res) => {
// // // //   try {
// // // //     const doc = await Document.findById(req.body.id);
// // // //     const token = crypto.randomBytes(32).toString('hex');
// // // //     doc.parties[0].token = token;
// // // //     doc.parties[0].status = 'sent';
// // // //     doc.status = 'in_progress';
// // // //     await doc.save();
// // // //     await sendSigningEmail(doc.parties[0], doc.title, token);
// // // //     res.json({ success: true });
// // // //   } catch (err) { res.status(500).json({ error: "Send failed" }); }
// // // // });

// // // // router.get('/sign/:token', async (req, res) => {
// // // //   try {
// // // //     const doc = await Document.findOne({ "parties.token": req.params.token });
// // // //     if (!doc) return res.status(404).json({ error: "Invalid link" });
// // // //     const party = doc.parties.find(p => p.token === req.params.token);
// // // //     const partyIndex = doc.parties.indexOf(party);
// // // //     const formattedFields = doc.fields.map(f => {
// // // //       const fieldData = typeof f === 'string' ? JSON.parse(f) : f;
// // // //       return { ...fieldData, isMine: parseInt(fieldData.signerIndex) === partyIndex };
// // // //     });
// // // //     res.json({ document: { ...doc.toObject(), fields: formattedFields }, party: { ...party.toObject(), index: partyIndex } });
// // // //   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// // // // });

// // // // router.post('/sign/submit', async (req, res) => {
// // // //   try {
// // // //     const { token, fields } = req.body;
// // // //     const doc = await Document.findOne({ "parties.token": token });
// // // //     const idx = doc.parties.findIndex(p => p.token === token);
// // // //     doc.parties[idx].status = 'signed';
// // // //     doc.parties[idx].token = null; 
// // // //     doc.fields = fields;
// // // //     await doc.save();
// // // //     if (idx + 1 < doc.parties.length) {
// // // //       const nextToken = crypto.randomBytes(32).toString('hex');
// // // //       doc.parties[idx + 1].token = nextToken;
// // // //       doc.parties[idx + 1].status = 'sent';
// // // //       await doc.save();
// // // //       await sendSigningEmail(doc.parties[idx + 1], doc.title, nextToken);
// // // //       res.json({ success: true, next: true });
// // // //     } else {
// // // //       doc.status = 'completed';
// // // //       await doc.save();
// // // //       generateAndSendFinalDoc(doc);
// // // //       res.json({ success: true, completed: true });
// // // //     }
// // // //   } catch (err) { res.status(500).json({ error: "Submit failed" }); }
// // // // });

// // // // router.get('/proxy/*', async (req, res) => {
// // // //   try {
// // // //     const path = req.params[0];
// // // //     const cloudinaryUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${path}`;
// // // //     const response = await axios.get(cloudinaryUrl, { responseType: 'stream' });
// // // //     res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
// // // //     res.setHeader('Access-Control-Allow-Credentials', 'true');
// // // //     res.setHeader('Content-Type', 'application/pdf');
// // // //     response.data.pipe(res);
// // // //   } catch (err) { res.status(404).send("Cloudinary PDF Not Found"); }
// // // // });

// // // // router.get('/:id/history', async (req, res) => {
// // // //   try {
// // // //     const logs = await AuditLog.find({ document_id: req.params.id }).sort({ timestamp: -1 });
// // // //     res.json(logs);
// // // //   } catch (err) { res.status(500).json({ error: "History fetch error" }); }
// // // // });

// // // // // 10. View Final Signed PDF (FIXED: Now merges signatures before showing)
// // // // router.get('/view-signed/:id', async (req, res) => {
// // // //   try {
// // // //     const doc = await Document.findById(req.params.id);
// // // //     if (!doc || doc.status !== 'completed') {
// // // //       return res.status(403).send("This document is not yet fully signed.");
// // // //     }

// // // //     // Reuse the merging logic
// // // //     const pdfBytes = await mergeSignatures(doc);
    
// // // //     res.setHeader('Content-Type', 'application/pdf');
// // // //     res.setHeader('Content-Disposition', `inline; filename="${doc.title}_signed.pdf"`);
// // // //     res.send(Buffer.from(pdfBytes));

// // // //   } catch (err) {
// // // //     console.error("View Final PDF Error:", err);
// // // //     res.status(500).send("Error loading signed document");
// // // //   }
// // // // });

// // // // module.exports = router;

// // // // const express = require('express');
// // // // const router = express.Router();
// // // // const multer = require('multer');
// // // // const axios = require('axios');
// // // // const { v2: cloudinary } = require('cloudinary');
// // // // const crypto = require('crypto');
// // // // const nodemailer = require('nodemailer');
// // // // const { PDFDocument } = require('pdf-lib');
// // // // const Document = require('../models/Document');
// // // // const AuditLog = require('../models/AuditLog');

// // // // // 1. Cloudinary Configuration
// // // // cloudinary.config({
// // // //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
// // // //   api_key: process.env.CLOUDINARY_API_KEY,
// // // //   api_secret: process.env.CLOUDINARY_API_SECRET,
// // // // });

// // // // // 2. Mail Transporter
// // // // const transporter = nodemailer.createTransport({
// // // //   service: 'gmail',
// // // //   auth: { 
// // // //     user: process.env.EMAIL_USER, 
// // // //     pass: process.env.EMAIL_PASS 
// // // //   },
// // // // });

// // // // const upload = multer({ storage: multer.memoryStorage() });

// // // // // --- HELPER FUNCTIONS ---

// // // // const logActivity = async (docId, action, req, details = {}, party = {}) => {
// // // //   try {
// // // //     await AuditLog.create({
// // // //       document_id: docId,
// // // //       action,
// // // //       party_name: party.name || "System",
// // // //       party_email: party.email || "system@nexsign.com",
// // // //       ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
// // // //       details: typeof details === 'string' ? details : JSON.stringify(details)
// // // //     });
// // // //   } catch (err) { console.error("Audit Logging Failed:", err); }
// // // // };

// // // // const sendSigningEmail = async (party, docTitle, token, req) => {
// // // //   // প্রোডাকশনে localhost পরিবর্তন করে আপনার ফ্রন্টএন্ড ডোমেইন দিন
// // // //   const baseUrl = req.headers.origin || "http://localhost:5173";
// // // //   const signLink = `${baseUrl}/sign?token=${token}`;
  
// // // //   const mailOptions = {
// // // //     from: `"NexSign" <${process.env.EMAIL_USER}>`,
// // // //     to: party.email,
// // // //     subject: `Signature Request: ${docTitle}`,
// // // //     html: `
// // // //       <div style="font-family:sans-serif;padding:20px;border:1px solid #eee;border-radius:10px;">
// // // //         <h2 style="color:#0ea5e9;">Hello ${party.name},</h2>
// // // //         <p>You have been requested to sign: <b>${docTitle}</b></p>
// // // //         <a href="${signLink}" style="display:inline-block;background:#0ea5e9;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;font-weight:bold;margin-top:10px;">Sign Document Now</a>
// // // //       </div>
// // // //     `,
// // // //   };
// // // //   return transporter.sendMail(mailOptions);
// // // // };

// // // // const mergeSignatures = async (doc) => {
// // // //   const response = await axios.get(doc.fileUrl, { responseType: 'arraybuffer' });
// // // //   const pdfDoc = await PDFDocument.load(response.data);
// // // //   const pages = pdfDoc.getPages();
  
// // // //   // Mixed টাইপ হ্যান্ডলিং
// // // //   const processedFields = doc.fields.map(f => typeof f === 'string' ? JSON.parse(f) : f);

// // // //   for (const f of processedFields) {
// // // //     if (f.type === 'signature' && f.value) {
// // // //       try {
// // // //         const pageIndex = Number(f.page) - 1;
// // // //         if (pageIndex >= 0 && pageIndex < pages.length) {
// // // //           const page = pages[pageIndex];
// // // //           const { width, height } = page.getSize();
          
// // // //           const base64Data = f.value.includes(',') ? f.value.split(',')[1] : f.value;
// // // //           const sigImg = await pdfDoc.embedPng(Buffer.from(base64Data, 'base64'));

// // // //           page.drawImage(sigImg, {
// // // //             x: (Number(f.x) * width) / 100,
// // // //             y: height - ((Number(f.y) * height) / 100) - ((Number(f.height) * height) / 100),
// // // //             width: (Number(f.width) * width) / 100,
// // // //             height: (Number(f.height) * height) / 100,
// // // //           });
// // // //         }
// // // //       } catch (err) { console.error("Field Embedding Error:", err); }
// // // //     }
// // // //   }
// // // //   return await pdfDoc.save();
// // // // };

// // // // // --- ROUTES ---

// // // // router.post('/upload', upload.single('file'), async (req, res) => {
// // // //   try {
// // // //     const result = await new Promise((resolve, reject) => {
// // // //       const stream = cloudinary.uploader.upload_stream({ resource_type: "raw", folder: "nexsign_docs" }, (err, res) => err ? reject(err) : resolve(res));
// // // //       stream.end(req.file.buffer);
// // // //     });
// // // //     const newDoc = new Document({ 
// // // //       title: req.file.originalname.replace('.pdf', ''), 
// // // //       fileUrl: result.secure_url, 
// // // //       fileId: result.public_id 
// // // //     });
// // // //     await newDoc.save();
// // // //     await logActivity(newDoc._id, 'created', req, "Document uploaded to Cloudinary");
// // // //     res.json(newDoc);
// // // //   } catch (err) { res.status(500).json({ error: "Upload failed" }); }
// // // // });

// // // // router.post('/send', async (req, res) => {
// // // //   try {
// // // //     const doc = await Document.findById(req.body.id);
// // // //     if(!doc) return res.status(404).json({error: "Not found"});
    
// // // //     const token = crypto.randomBytes(32).toString('hex');
// // // //     doc.parties[0].token = token;
// // // //     doc.parties[0].status = 'sent';
// // // //     doc.status = 'in_progress';
    
// // // //     await doc.save();
// // // //     await sendSigningEmail(doc.parties[0], doc.title, token, req);
// // // //     await logActivity(doc._id, 'sent', req, `Invitation sent to ${doc.parties[0].email}`, doc.parties[0]);
    
// // // //     res.json({ success: true });
// // // //   } catch (err) { res.status(500).json({ error: "Send failed" }); }
// // // // });

// // // // // router.get('/sign/:token', async (req, res) => {
// // // // //   try {
// // // // //     const doc = await Document.findOne({ "parties.token": req.params.token });
// // // // //     if (!doc) return res.status(404).json({ error: "Invalid link" });
    
// // // // //     const party = doc.parties.find(p => p.token === req.params.token);
// // // // //     await logActivity(doc._id, 'opened', req, "Signer opened the link", party);
    
// // // // //     const partyIndex = doc.parties.indexOf(party);
// // // // //     const formattedFields = doc.fields.map(f => {
// // // // //       const fieldData = typeof f === 'string' ? JSON.parse(f) : f;
// // // // //       return { ...fieldData, isMine: parseInt(fieldData.signerIndex) === partyIndex };
// // // // //     });
    
// // // // //     res.json({ document: { ...doc.toObject(), fields: formattedFields }, party });
// // // // //   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// // // // // });
// // // // router.get('/sign/:token', async (req, res) => {
// // // //   try {
// // // //     const doc = await Document.findOne({ "parties.token": req.params.token });
// // // //     if (!doc) return res.status(404).json({ error: "Invalid link" });
    
// // // //     // টোকেন দিয়ে সঠিক সাইনার খুঁজে বের করা
// // // //     const partyIndex = doc.parties.findIndex(p => p.token === req.params.token);
// // // //     const party = doc.parties[partyIndex];
    
// // // //     await logActivity(doc._id, 'opened', req, "Signer opened the link", party);
    
// // // //     // ফ্রন্টএন্ডে পাঠানোর জন্য ডাটা তৈরি (এখানে index যোগ করা হয়েছে)
// // // //     const partyWithIndex = {
// // // //       ...party.toObject(),
// // // //       index: partyIndex
// // // //     };
    
// // // //     // ফিল্ডগুলোতে isMine ফ্ল্যাগ যোগ করা
// // // //     const formattedFields = doc.fields.map(f => {
// // // //       const fieldData = typeof f === 'string' ? JSON.parse(f) : f;
// // // //       const fIndex = fieldData.signerIndex ?? fieldData.partyIndex ?? 0;
// // // //       return { 
// // // //         ...fieldData, 
// // // //         partyIndex: Number(fIndex),
// // // //         isMine: Number(fIndex) === partyIndex 
// // // //       };
// // // //     });
    
// // // //     res.json({ 
// // // //       document: { ...doc.toObject(), fields: formattedFields }, 
// // // //       party: partyWithIndex 
// // // //     });
// // // //   } catch (err) { 
// // // //     console.error("Fetch Error:", err);
// // // //     res.status(500).json({ error: "Fetch error" }); 
// // // //   }
// // // // });
// // // // router.post('/sign/submit', async (req, res) => {
// // // //   try {
// // // //     const { token, fields } = req.body;
// // // //     const doc = await Document.findOne({ "parties.token": token });
// // // //     if(!doc) return res.status(404).json({error: "Invalid session"});

// // // //     const idx = doc.parties.findIndex(p => p.token === token);
// // // //     const currentParty = doc.parties[idx];

// // // //     doc.parties[idx].status = 'signed';
// // // //     doc.parties[idx].token = null; 
// // // //     doc.parties[idx].signedAt = new Date();
    
// // // //     // মিক্সড টাইপ আপডেট নিশ্চিত করা
// // // //     doc.fields = fields;
// // // //     doc.markModified('fields'); 
    
// // // //     await logActivity(doc._id, 'signed', req, "Party signed the document", currentParty);

// // // //     if (idx + 1 < doc.parties.length) {
// // // //       const nextToken = crypto.randomBytes(32).toString('hex');
// // // //       doc.parties[idx + 1].token = nextToken;
// // // //       doc.parties[idx + 1].status = 'sent';
// // // //       await doc.save();
// // // //       await sendSigningEmail(doc.parties[idx + 1], doc.title, nextToken, req);
// // // //       res.json({ success: true, next: true });
// // // //     } else {
// // // //       doc.status = 'completed';
// // // //       await doc.save();
// // // //       await logActivity(doc._id, 'completed', req, "All parties have signed");
// // // //       // ব্যা


// /**
//  * documentRoutes.js — PRODUCTION READY & OPTIMIZED
//  */
// const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const axios = require('axios');
// const { v2: cloudinary } = require('cloudinary');
// const crypto = require('crypto');
// const nodemailer = require('nodemailer');
// const Document = require('../models/Document');
// const AuditLog = require('../models/AuditLog');
// const auth = require('../middleware/auth');

// // ── Cloudinary Config ────────────────────────────────────────────────────────
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // ── Email Transporter ────────────────────────────────────────────────────────
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   pool: true,
//   auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
// });

// // ── Multer (Memory Storage) ──────────────────────────────────────────────────
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
// });

// // ════════════════════════════════════════════════════════════════════════════
// // HELPERS
// // ════════════════════════════════════════════════════════════════════════════

// const logActivity = async (docId, action, req, details = "", party = {}) => {
//   try {
//     const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || "Unknown";
    
//     await AuditLog.create({
//       document_id: docId,
//       action: action, // 'opened', 'signed', 'sent', etc.
//       performed_by: {
//         name: party.name || "System",
//         email: party.email || "system@nexsign.com",
//         role: party.email ? 'signer' : 'owner'
//       },
//       ip_address: ip,
//       details: typeof details === 'object' ? JSON.stringify(details) : details,
//       user_agent: req.headers['user-agent'] || "Unknown"
//     });
//   } catch (err) { 
//     console.error("[NeXsign] Audit Logging Failed:", err.message); 
//   }
// };

// const uploadToCloudinary = (buffer, options) =>
//   new Promise((resolve, reject) => {
//     const stream = cloudinary.uploader.upload_stream(options, (err, res) =>
//       err ? reject(err) : resolve(res)
//     );
//     stream.end(buffer);
//   });

// const sendSigningEmail = (party, docTitle, token) => {
//   const signLink = `${process.env.FRONTEND_URL}/sign/${token}`;
//   return transporter.sendMail({
//     from: `"NeXsign" <${process.env.EMAIL_USER}>`,
//     to: party.email,
//     subject: `Signature Requested: ${docTitle}`,
//     html: `
//       <div style="font-family: sans-serif; padding: 20px;">
//         <h2 style="color: #28ABDF;">NeXsign</h2>
//         <p>Hello ${party.name},</p>
//         <p>You have been requested to sign: <strong>${docTitle}</strong></p>
//         <a href="${signLink}" style="background: #28ABDF; color: white; padding: 12px 20px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0;">View & Sign Document</a>
//         <p style="font-size: 12px; color: #666;">⚠️ This link is one-time use only. It expires after signing.</p>
//       </div>
//     `,
//   });
// };

// // ── CORE: mergeSignatures ────────────────────────────────────────────────────
// const mergeSignatures = async (doc) => {
//   const response = await axios.get(doc.fileUrl, { responseType: 'arraybuffer', timeout: 30000 });
//   const pdfDoc = await PDFDocument.load(response.data, { ignoreEncryption: true });
//   const pages = pdfDoc.getPages();

//   const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
//   const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
//   const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);

//   const fieldsToProcess = (doc.fields || [])
//     .map((f) => (typeof f === 'string' ? JSON.parse(f) : f))
//     .filter((f) => f?.value);

//   for (const fd of fieldsToProcess) {
//     const pageIndex = Number(fd.page) - 1;
//     if (pageIndex < 0 || pageIndex >= pages.length) continue;
//     const page = pages[pageIndex];
//     const { width: pW, height: pH } = page.getSize();

//     const dW = (parseFloat(fd.width) * pW) / 100;
//     const dH = (parseFloat(fd.height) * pH) / 100;
//     const dX = (parseFloat(fd.x) * pW) / 100;
//     const dY = pH - (parseFloat(fd.y) * pH) / 100 - dH;

//     if (fd.type === 'signature' && fd.value.startsWith('data:image')) {
//       const [header, b64] = fd.value.split(',');
//       const imgBuffer = Buffer.from(b64, 'base64');
//       const pdfImage = header.includes('image/png') ? await pdfDoc.embedPng(imgBuffer) : await pdfDoc.embedJpg(imgBuffer);
//       page.drawImage(pdfImage, { x: dX, y: dY, width: dW, height: dH });
//     } else if (fd.type === 'text' && fd.value) {
//       const fontSize = Number(fd.fontSize) || 11;
//       let embedFont = fd.fontWeight === 'bold' ? helveticaBold : (fd.fontFamily === 'times' ? timesRoman : helvetica);
//       page.drawText(String(fd.value), { x: dX + 3, y: dY + dH / 2 - fontSize / 3, size: fontSize, font: embedFont, color: rgb(0, 0, 0), maxWidth: dW - 6 });
//     }
//   }
//   return pdfDoc.save();
// };

// // ── Legal Audit Page Append ──────────────────────────────────────────────────
// const appendAuditPage = async (pdfBytes, doc) => {
//   const pdfDoc = await PDFDocument.load(pdfBytes);
//   const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
//   const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
//   const page = pdfDoc.addPage([595.28, 841.89]); // A4
  
//   const brand = rgb(0.157, 0.671, 0.875);
//   page.drawRectangle({ x: 0, y: 790, width: 595.28, height: 52, color: brand });
//   page.drawText('NEXSIGN — LEGAL AUDIT CERTIFICATE', { x: 40, y: 810, size: 14, font: bold, color: rgb(1, 1, 1) });

//   let y = 750;
//   doc.parties.forEach((p, idx) => {
//     page.drawText(`Signer ${idx + 1}: ${p.name}`, { x: 40, y, size: 11, font: bold, color: brand });
//     y -= 20;
//     const info = [
//       [`Email`, p.email], [`Status`, p.status.toUpperCase()], [`IP`, p.ipAddress || 'N/A'], [`Signed At`, p.signedAt ? new Date(p.signedAt).toUTCString() : 'N/A']
//     ];
//     info.forEach(([label, val]) => {
//       page.drawText(`${label}:`, { x: 50, y, size: 9, font: bold });
//       page.drawText(String(val), { x: 150, y, size: 9, font });
//       y -= 15;
//     });
//     y -= 10;
//   });
//   return pdfDoc.save();
// };

// // ── Async Finalizer ──────────────────────────────────────────────────────────
// const generateAndSendFinalDoc = async (docId) => {
//   try {
//     const doc = await Document.findById(docId);
//     if (!doc) return;

//     const mergedBytes = await mergeSignatures(doc);
//     const finalBytes = await appendAuditPage(mergedBytes, doc);
    
//     const uploadRes = await uploadToCloudinary(Buffer.from(finalBytes), {
//       resource_type: 'raw', folder: 'completed_docs', format: 'pdf'
//     });

//     doc.fileUrl = uploadRes.secure_url;
//     doc.status = 'completed';
//     // Clean base64 for DB performance
//     doc.fields = doc.fields.map(f => {
//        const field = typeof f === 'string' ? JSON.parse(f) : f;
//        if(field.type === 'signature') field.value = '[SIGNED]';
//        return field;
//     });
//     await doc.save();

//     const recipients = [...doc.parties.map(p => p.email), ...(doc.ccEmails || [])].filter(Boolean);
//     await transporter.sendMail({
//       from: `"NeXsign" <${process.env.EMAIL_USER}>`,
//       to: recipients.join(','),
//       subject: `✅ Completed: ${doc.title}`,
//       attachments: [{ filename: `${doc.title}_Signed.pdf`, content: Buffer.from(finalBytes) }],
//       html: `<p>All parties have signed <b>${doc.title}</b>. Final copy attached.</p>`
//     });
//   } catch (err) { console.error('Finalize Error:', err); }
// };

// // ════════════════════════════════════════════════════════════════════════════
// // ROUTES
// // ════════════════════════════════════════════════════════════════════════════

// // 1. Upload & Send
// router.post('/upload-and-send', auth, upload.single('file'), async (req, res) => {
//   try {
//     const { title, parties, ccEmails, fields, totalPages } = req.body;
//     const uploadRes = await uploadToCloudinary(req.file.buffer, { resource_type: 'raw', folder: 'nexsign_docs' });

//     const firstToken = crypto.randomBytes(32).toString('hex');
//     const parsedParties = JSON.parse(parties).map((p, i) => ({
//       ...p, status: i === 0 ? 'sent' : 'pending', token: i === 0 ? firstToken : undefined
//     }));

//     const doc = await Document.create({
//       title: title || 'Untitled',
//       fileUrl: uploadRes.secure_url,
//       fileId: uploadRes.public_id,
//       parties: parsedParties,
//       ccEmails: JSON.parse(ccEmails || '[]'),
//       fields: JSON.parse(fields || '[]'),
//       totalPages: Number(totalPages) || 1,
//       status: 'in_progress',
//       owner: req.user.id
//     });

//     sendSigningEmail(parsedParties[0], doc.title, firstToken).catch(console.error);
//     res.json({ success: true, documentId: doc._id });
//   } catch (err) { res.status(500).json({ error: err.message }); }
// });

// // 2. Dashboard List (Optimized for Silent Refresh & Pagination)
// router.get('/', auth, async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 6;
//     const skip = (page - 1) * limit;
    
//     // Front-end requested specific fields? Apply selection for speed
//     const selection = req.query.select ? req.query.select.split(' ').join(' ') : '-fields';

//     const query = { $or: [{ owner: req.user.id }, { 'parties.email': req.user.email }] };
//     const [documents, total] = await Promise.all([
//       Document.find(query).select(selection).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
//       Document.countDocuments(query),
//     ]);

//     res.json({ success: true, documents, total, hasMore: total > skip + documents.length });
//   } catch (err) { res.status(500).json({ error: 'Dashboard fetch failed' }); }
// });

// // 3. Sign Submit

// router.get('/sign/:token', async (req, res) => {
//   try {
//     const doc = await Document.findOne({ "parties.token": req.params.token });
//     if (!doc) return res.status(404).json({ error: "Invalid link" });
    
//     // টোকেন দিয়ে সঠিক সাইনার খুঁজে বের করা
//     const partyIndex = doc.parties.findIndex(p => p.token === req.params.token);
//     const party = doc.parties[partyIndex];
    
//     await logActivity(doc._id, 'opened', req, "Signer opened the link", party);
    
//     // ফ্রন্টএন্ডে পাঠানোর জন্য ডাটা তৈরি (এখানে index যোগ করা হয়েছে)
//     const partyWithIndex = {
//       ...party.toObject(),
//       index: partyIndex
//     };
    
//     // ফিল্ডগুলোতে isMine ফ্ল্যাগ যোগ করা
//     const formattedFields = doc.fields.map(f => {
//       const fieldData = typeof f === 'string' ? JSON.parse(f) : f;
//       const fIndex = fieldData.signerIndex ?? fieldData.partyIndex ?? 0;
//       return { 
//         ...fieldData, 
//         partyIndex: Number(fIndex),
//         isMine: Number(fIndex) === partyIndex 
//       };
//     });
    
//     res.json({ 
//       document: { ...doc.toObject(), fields: formattedFields }, 
//       party: partyWithIndex 
//     });
//   } catch (err) { 
//     console.error("Fetch Error:", err);
//     res.status(500).json({ error: "Fetch error" }); 
//   }
// });

// router.post('/sign/submit', async (req, res) => {
//   try {
//     const { token, fields, locationData, deviceInfo } = req.body;
//     const doc = await Document.findOne({ 'parties.token': token });
//     if (!doc) return res.status(404).json({ error: 'Link invalid.' });

//     const idx = doc.parties.findIndex(p => p.token === token);
//     const signer = doc.parties[idx];

//     // Update signer info & Kill token (Security)
//     signer.status = 'signed';
//     signer.signedAt = new Date();
//     signer.ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
//     signer.location = locationData?.city ? `${locationData.city}, ${locationData.country}` : 'Unknown';
//     signer.token = undefined; 

//     doc.fields = fields;
//     doc.markModified('fields');
//     doc.markModified('parties');

//     const allSigned = doc.parties.every(p => p.status === 'signed');
//     if (!allSigned) {
//       const nextToken = crypto.randomBytes(32).toString('hex');
//       doc.parties[idx + 1].token = nextToken;
//       doc.parties[idx + 1].status = 'sent';
//       await doc.save();
//       sendSigningEmail(doc.parties[idx + 1], doc.title, nextToken).catch(console.error);
//       res.json({ success: true, next: true });
//     } else {
//       doc.status = 'completed';
//       await doc.save();
//       generateAndSendFinalDoc(doc._id); // Fire and forget
//       res.json({ success: true, completed: true });
//     }
//   } catch (err) { res.status(500).json({ error: 'Submission failed' }); }
// });

// // 4. Proxy & Others (Keeping existing logic)
// router.get('/proxy/:path(*)', async (req, res) => {
//   try {
//     const path = req.params.path.replace(/~~/g, '/');
//     const response = await axios.get(`https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${path}`, { responseType: 'stream' });
//     res.setHeader('Content-Type', 'application/pdf');
//     response.data.pipe(res);
//   } catch (err) { res.status(404).send('PDF not found'); }
// });

// router.get('/:id', auth, async (req, res) => {
//   try {
//     const doc = await Document.findById(req.params.id);
//     res.json({ success: true, document: doc });
//   } catch (err) { res.status(404).json({ error: 'Not found' }); }
// });

// router.delete('/:id', auth, async (req, res) => {
//   try {
//     await Document.findByIdAndDelete(req.params.id);
//     res.json({ success: true });
//   } catch (err) { res.status(500).json({ error: 'Delete failed' }); }
// });

// module.exports = router;
// const express   = require('express');
// const router    = express.Router();
// const multer    = require('multer');
// const crypto    = require('crypto');
// // ✅ node-fetch REMOVE করা হয়েছে — Node.js 18+ এ built-in fetch আছে
// const { v2: cloudinary } = require('cloudinary');
// const Document  = require('../models/Document');
// const AuditLog  = require('../models/AuditLog');
// const auth      = require('../middleware/auth');
// const {
//   mergeSignaturesIntoPDF,
//   appendAuditPage,
// } = require('../utils/pdfService');
// const {
//   sendSigningEmail,
//   sendCompletionEmail,
//   sendCCEmail,
// } = require('../utils/emailService');

// // ── Config ───────────────────────────────────────────────────────
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key:    process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const upload = multer({
//   storage:    multer.memoryStorage(),
//   limits:     { fileSize: 20 * 1024 * 1024 },
//   fileFilter: (_, file, cb) =>
//     cb(null, file.mimetype === 'application/pdf'),
// });

// const logoUpload = multer({
//   storage:    multer.memoryStorage(),
//   limits:     { fileSize: 5 * 1024 * 1024 },
//   fileFilter: (_, file, cb) =>
//     cb(null, file.mimetype.startsWith('image/')),
// });

// // ── Helpers ──────────────────────────────────────────────────────
// const genToken = () => crypto.randomBytes(32).toString('hex');

// const uploadToCloudinary = (buffer, options) =>
//   new Promise((resolve, reject) => {
//     const stream = cloudinary.uploader.upload_stream(
//       options,
//       (err, res) => err ? reject(err) : resolve(res)
//     );
//     stream.end(buffer);
//   });

// const logEvent = async (docId, action, performer, extras = {}) => {
//   try {
//     await AuditLog.create({
//       document_id:  docId,
//       action,
//       performed_by: performer,
//       timestamp:    new Date(),
//       ...extras,
//     });
//   } catch (e) {
//     console.error('AuditLog error:', e.message);
//   }
// };

// const FRONT = () =>
//   (process.env.FRONTEND_URL || 'https://nexsignfrontend.vercel.app')
//     .replace(/\/$/, '');

// // ════════════════════════════════════════════════════════════════
// // PROXY — must be FIRST before any /:id routes
// // ════════════════════════════════════════════════════════════════
// router.get('/proxy/:path(*)', async (req, res) => {
//   try {
//     const cloudPath = req.params.path
//       .replace(/~~/g, '/')
//       .split('?')[0];

//     const url =
//       `https://res.cloudinary.com/` +
//       `${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${cloudPath}`;

//     // ✅ Built-in fetch use করা হচ্ছে (Node.js 18+)
//     const response = await fetch(url, {
//       signal: AbortSignal.timeout(30000), // ✅ timeout এর নতুন way
//     });

//     if (!response.ok) return res.status(404).send('Not found');

//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Cache-Control', 'public, max-age=3600');
//     res.setHeader('Access-Control-Allow-Origin', '*');

//     // ✅ Built-in fetch এ .body একটা ReadableStream
//     // Node.js এ pipe করার জন্য এইভাবে করতে হবে
//     const { Readable } = require('stream');
//     const nodeStream = Readable.fromWeb(response.body);
//     nodeStream.pipe(res);

//   } catch (err) {
//     console.error('Proxy error:', err.message);
//     res.status(500).send('Proxy error');
//   }
// });

// // ════════════════════════════════════════════════════════════════
// // LOGO UPLOAD
// // ════════════════════════════════════════════════════════════════
// router.post('/upload-logo',
//   auth,
//   logoUpload.single('logo'),
//   async (req, res) => {
//     try {
//       if (!req.file)
//         return res.status(400).json({
//           success: false, message: 'No image provided.',
//         });

//       const result = await uploadToCloudinary(req.file.buffer, {
//         folder:        'nexsign_logos',
//         resource_type: 'image',
//         transformation: [{
//           width: 400, height: 200,
//           crop: 'limit', quality: 'auto',
//         }],
//       });

//       res.json({ success: true, logoUrl: result.secure_url });
//     } catch (err) {
//       res.status(500).json({ success: false, message: err.message });
//     }
//   }
// );

// // ════════════════════════════════════════════════════════════════
// // UPLOAD & SEND (Normal Sequential)
// // ════════════════════════════════════════════════════════════════
// router.post('/upload-and-send',
//   auth,
//   upload.single('file'),
//   async (req, res) => {
//     try {
//       const {
//         title, parties: partiesRaw,
//         ccRecipients: ccRaw,
//         fields: fieldsRaw, totalPages,
//         companyLogo, companyName,
//       } = req.body;

//       if (!req.file && !req.body.fileUrl)
//         return res.status(400).json({
//           success: false, message: 'No PDF provided.',
//         });

//       let fileUrl, fileId;
//       if (req.file) {
//         const up = await uploadToCloudinary(req.file.buffer, {
//           resource_type: 'raw',
//           folder:        'nexsign_docs',
//         });
//         fileUrl = up.secure_url;
//         fileId  = up.public_id;
//       } else {
//         fileUrl = req.body.fileUrl;
//         fileId  = '';
//       }

//       const parties = JSON.parse(partiesRaw || '[]');
//       const ccList  = JSON.parse(ccRaw      || '[]');
//       const fields  = JSON.parse(fieldsRaw  || '[]');

//       const COLORS = [
//         '#0ea5e9','#8b5cf6','#f59e0b','#10b981',
//       ];

//       const partiesWithTokens = parties.map((p, i) => ({
//         ...p,
//         status: 'pending',
//         token:  genToken(),
//         color:  p.color || COLORS[i % COLORS.length],
//       }));

//       const doc = await Document.create({
//         owner:        req.user.id,
//         title:        title || 'Untitled',
//         companyLogo:  companyLogo || '',
//         companyName:  companyName || '',
//         fileUrl,
//         fileId:       fileId || '',
//         parties:      partiesWithTokens,
//         ccList,
//         fields,
//         totalPages:   Number(totalPages) || 1,
//         status:       'in_progress',
//         workflowType: 'sequential',
//       });

//       res.json({ success: true, documentId: doc._id });

//       setImmediate(async () => {
//         try {
//           const first = doc.parties[0];
//           if (first) {
//             const link = `${FRONT()}/sign/${first.token}`;
//             await sendSigningEmail({
//               recipientEmail: first.email,
//               recipientName:  first.name,
//               senderName:     req.user.full_name,
//               documentTitle:  doc.title,
//               signingLink:    link,
//               companyLogoUrl: doc.companyLogo,
//               companyName:    doc.companyName,
//               partyNumber:    1,
//               totalParties:   doc.parties.length,
//             });
//             doc.parties[0].status      = 'sent';
//             doc.parties[0].emailSentAt = new Date();
//             await doc.save();
//           }

//           for (const cc of doc.ccList) {
//             await sendCCEmail({
//               recipientEmail: cc.email,
//               recipientName:  cc.name || '',
//               documentTitle:  doc.title,
//               senderName:     req.user.full_name,
//               companyLogoUrl: doc.companyLogo,
//               companyName:    doc.companyName,
//             }).catch(e =>
//               console.error('CC email error:', e.message)
//             );
//           }

//           const exists = await Document.findOne({
//             owner:        doc.owner,
//             isTemplate:   true,
//             templateName: doc.title,
//           });
//           if (!exists) {
//             await Document.create({
//               owner:        doc.owner,
//               title:        doc.title,
//               templateName: doc.title,
//               companyLogo:  doc.companyLogo,
//               companyName:  doc.companyName,
//               fileUrl:      doc.fileUrl,
//               fileId:       doc.fileId,
//               fields:       doc.fields,
//               parties:      doc.parties.map(p => ({
//                 name:  p.name,
//                 email: p.email,
//                 color: p.color,
//               })),
//               ccList:       doc.ccList,
//               isTemplate:   true,
//               status:       'draft',
//               workflowType: 'sequential',
//             });
//           }

//           await logEvent(doc._id, 'sent', {
//             name:  req.user.full_name,
//             email: req.user.email,
//             role:  'owner',
//           });
//         } catch (bgErr) {
//           console.error('Background send error:', bgErr.message);
//         }
//       });
//     } catch (err) {
//       console.error('upload-and-send error:', err);
//       res.status(500).json({ success: false, message: err.message });
//     }
//   }
// );

// // ════════════════════════════════════════════════════════════════
// // SIGN SUBMIT — must be BEFORE /sign/:token
// // ════════════════════════════════════════════════════════════════
// router.post('/sign/submit', async (req, res) => {
//   try {
//     const {
//       token,
//       fields: signedFields = [],
//       locationData,
//       clientTime,
//     } = req.body;

//     if (!token)
//       return res.status(400).json({ error: 'Token required.' });

//     const doc = await Document.findOne({ 'parties.token': token });
//     if (!doc)
//       return res.status(404).json({ error: 'Invalid token.' });

//     const idx    = doc.parties.findIndex(p => p.token === token);
//     const signer = doc.parties[idx];
//     if (!signer)
//       return res.status(404).json({ error: 'Signer not found.' });

//     const signerIp =
//       req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
//       req.socket?.remoteAddress ||
//       'Unknown';

//     signer.status     = 'signed';
//     signer.signedAt   = new Date();
//     signer.ip         = signerIp;
//     signer.postalCode = locationData?.postalCode ||
//                         locationData?.postal || '';
//     signer.address    = locationData?.text ||
//                         locationData?.city  || '';
//     signer.location   = locationData?.text  || '';
//     signer.clientTime = clientTime || new Date().toISOString();
//     signer.userAgent  = req.headers['user-agent'] || '';
//     signer.token      = undefined;

//     for (const sf of signedFields) {
//       const fi = doc.fields.findIndex(f => {
//         const fo = typeof f === 'string' ? JSON.parse(f) : f;
//         return fo.id === sf.id;
//       });
//       if (fi !== -1) {
//         const existing = typeof doc.fields[fi] === 'string'
//           ? JSON.parse(doc.fields[fi])
//           : { ...doc.fields[fi] };
//         doc.fields[fi] = { ...existing, value: sf.value };
//       }
//     }
//     doc.markModified('fields');
//     doc.markModified('parties');

//     if (doc.isTemplate && idx === 0) {
//       doc.isParty1Signed = true;
//     }

//     await doc.save();

//     res.json({ success: true, message: 'Signature recorded.' });

//     setImmediate(async () => {
//       try {
//         await logEvent(
//           doc._id, 'signed',
//           {
//             name:  signer.name,
//             email: signer.email,
//             role:  'signer',
//           },
//           {
//             ip_address:  signerIp,
//             postal_code: signer.postalCode,
//             location:    signer.location,
//             client_time: signer.clientTime,
//             details:     `Party ${idx + 1} signed`,
//           }
//         );

//         if (doc.isTemplate && idx === 0) {
//           console.log(`Template ${doc._id}: Party 1 signed.`);
//           return;
//         }

//         const allSigned = doc.parties.every(
//           p => p.status === 'signed'
//         );

//         if (!allSigned && doc.workflowType === 'sequential') {
//           const nextParty = doc.parties.find(
//             p => p.status !== 'signed'
//           );
//           if (nextParty) {
//             nextParty.token       = genToken();
//             nextParty.status      = 'sent';
//             nextParty.emailSentAt = new Date();
//             await doc.save();

//             const nextIdx = doc.parties.findIndex(
//               p => p.token === nextParty.token
//             );
//             const signLink = `${FRONT()}/sign/${nextParty.token}`;

//             await sendSigningEmail({
//               recipientEmail: nextParty.email,
//               recipientName:  nextParty.name,
//               senderName:     'NeXsign',
//               documentTitle:  doc.title,
//               signingLink:    signLink,
//               companyLogoUrl: doc.companyLogo,
//               companyName:    doc.companyName,
//               partyNumber:    nextIdx + 1,
//               totalParties:   doc.parties.length,
//             });
//           }
//         } else if (allSigned) {
//           let finalBytes = await mergeSignaturesIntoPDF(
//             doc.fileUrl, doc.fields
//           );
//           finalBytes = await appendAuditPage(finalBytes, doc);

//           const uploaded = await uploadToCloudinary(
//             Buffer.from(finalBytes),
//             {
//               resource_type: 'raw',
//               folder:        'nexsign_signed',
//               public_id:     `signed_${doc._id}_${Date.now()}`,
//               overwrite:     true,
//             }
//           );

//           doc.signedFileUrl = uploaded.secure_url;
//           doc.status        = 'completed';

//           doc.fields = doc.fields.map(f => {
//             const field = typeof f === 'string'
//               ? JSON.parse(f)
//               : { ...f };
//             if (
//               field.type === 'signature' &&
//               field.value?.startsWith('data:')
//             ) {
//               field.value = '[SIGNED]';
//             }
//             return field;
//           });
//           doc.markModified('fields');
//           await doc.save();

//           const recipients = [
//             ...doc.parties,
//             ...(doc.ccList || []),
//           ];
//           for (const r of recipients) {
//             await sendCompletionEmail({
//               recipientEmail: r.email,
//               recipientName:  r.name,
//               documentTitle:  doc.title,
//               signedPdfUrl:   doc.signedFileUrl,
//               companyLogoUrl: doc.companyLogo,
//               companyName:    doc.companyName,
//               auditParties:   doc.parties,
//             }).catch(e =>
//               console.error(`Completion email ${r.email}:`, e.message)
//             );
//           }

//           await logEvent(
//             doc._id, 'completed',
//             { name: 'System', email: 'system@nexsign.app', role: 'system' },
//             { details: 'All signed. Final PDF generated.' }
//           );
//         }
//       } catch (bgErr) {
//         console.error('Submit background error:', bgErr.message);
//       }
//     });
//   } catch (err) {
//     console.error('sign/submit error:', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // ════════════════════════════════════════════════════════════════
// // GET SIGNING PAGE — AFTER /sign/submit
// // ════════════════════════════════════════════════════════════════
// router.get('/sign/:token', async (req, res) => {
//   try {
//     const { token } = req.params;

//     if (token === 'submit')
//       return res.status(400).json({ error: 'Invalid token.' });

//     const doc = await Document.findOne({
//       'parties.token': token,
//     }).lean();

//     if (!doc)
//       return res.status(404).json({ error: 'Invalid link.' });

//     const partyIndex = doc.parties.findIndex(
//       p => p.token === token
//     );
//     const party = doc.parties[partyIndex];

//     if (!party)
//       return res.status(404).json({ error: 'Party not found.' });

//     if (party.status === 'signed')
//       return res.status(410).json({
//         error: 'You have already signed this document.',
//       });

//     Document.updateOne(
//       { _id: doc._id, 'parties.token': token },
//       {
//         $inc: { 'parties.$.linkOpenCount': 1 },
//         $set: {
//           'parties.$.linkOpenedAt':     new Date(),
//           'parties.$.lastLinkOpenedAt': new Date(),
//         },
//       }
//     ).catch(() => {});

//     logEvent(doc._id, 'opened', {
//       name:  party.name,
//       email: party.email,
//       role:  'signer',
//     }, {
//       ip_address: req.headers['x-forwarded-for']
//         ?.split(',')[0] || '',
//     });

//     const formattedFields = doc.fields.map(f => {
//       const field = typeof f === 'string' ? JSON.parse(f) : f;
//       const fPartyIdx = Number(field.partyIndex ?? 0);
//       return {
//         ...field,
//         partyIndex: fPartyIdx,
//         value: fPartyIdx === partyIndex
//           ? ''
//           : (field.value || ''),
//       };
//     });

//     res.json({
//       success:      true,
//       fileUrl:      doc.fileUrl,
//       title:        doc.title,
//       companyLogo:  doc.companyLogo,
//       companyName:  doc.companyName,
//       fields:       formattedFields,
//       partyIndex,
//       party: {
//         name:  party.name,
//         email: party.email,
//       },
//       workflowType: doc.workflowType,
//       totalParties: doc.parties.length,
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ════════════════════════════════════════════════════════════════
// // TEMPLATE ROUTES
// // ════════════════════════════════════════════════════════════════
// router.post('/templates',
//   auth,
//   upload.single('file'),
//   async (req, res) => {
//     try {
//       const {
//         title, fields: fieldsRaw,
//         companyLogo, companyName,
//         party1: party1Raw,
//         ccList: ccRaw,
//       } = req.body;

//       if (!req.file)
//         return res.status(400).json({
//           success: false, message: 'PDF required.',
//         });

//       const up = await uploadToCloudinary(req.file.buffer, {
//         resource_type: 'raw',
//         folder:        'nexsign_templates',
//       });

//       const fields = JSON.parse(fieldsRaw || '[]');
//       const party1 = party1Raw ? JSON.parse(party1Raw) : null;
//       const ccList = JSON.parse(ccRaw || '[]');

//       const doc = await Document.create({
//         owner:        req.user.id,
//         title:        title || 'Untitled Template',
//         templateName: title || 'Untitled Template',
//         companyLogo:  companyLogo || '',
//         companyName:  companyName || '',
//         fileUrl:      up.secure_url,
//         fileId:       up.public_id,
//         fields,
//         parties: party1 ? [{
//           name:   party1.name  || req.user.full_name,
//           email:  party1.email || req.user.email,
//           status: 'pending',
//           token:  genToken(),
//           color:  '#0ea5e9',
//         }] : [],
//         ccList,
//         isTemplate:      true,
//         isParty1Signed:  false,
//         status:          'draft',
//         workflowType:    'sequential',
//       });

//       res.json({ success: true, template: doc });

//       if (party1 && doc.parties[0]) {
//         setImmediate(async () => {
//           const link = `${FRONT()}/sign/${doc.parties[0].token}`;
//           await sendSigningEmail({
//             recipientEmail: doc.parties[0].email,
//             recipientName:  doc.parties[0].name,
//             senderName:     req.user.full_name,
//             documentTitle:  doc.title,
//             signingLink:    link,
//             companyLogoUrl: doc.companyLogo,
//             companyName:    doc.companyName,
//             partyNumber:    1,
//             totalParties:   1,
//             message: 'Please sign this template as the authorizing party.',
//           }).catch(e =>
//             console.error('Party1 template email:', e.message)
//           );

//           doc.parties[0].status      = 'sent';
//           doc.parties[0].emailSentAt = new Date();
//           await doc.save();
//         });
//       }
//     } catch (err) {
//       res.status(500).json({ success: false, message: err.message });
//     }
//   }
// );

// // Get templates list
// router.get('/templates', auth, async (req, res) => {
//   try {
//     const templates = await Document.find({
//       owner:      req.user.id,
//       isTemplate: true,
//     })
//       .select(
//         'title templateName companyLogo companyName ' +
//         'fields parties ccList isParty1Signed ' +
//         'usageCount createdAt updatedAt'
//       )
//       .sort({ updatedAt: -1 })
//       .lean();

//     res.json({ success: true, templates });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // Use template
// router.post('/templates/:id/use', auth, async (req, res) => {
//   try {
//     const template = await Document.findOne({
//       _id:        req.params.id,
//       owner:      req.user.id,
//       isTemplate: true,
//     }).lean();

//     if (!template)
//       return res.status(404).json({
//         success: false, message: 'Template not found.',
//       });

//     const { signers = [], ccList = [] } = req.body;

//     if (!signers.length)
//       return res.status(400).json({
//         success: false,
//         message: 'At least one signer required.',
//       });

//     res.json({
//       success: true,
//       message: `Sending to ${signers.length} signer(s)...`,
//     });

//     setImmediate(async () => {
//       const party1 = template.parties?.[0];

//       for (const signer of signers) {
//         try {
//           const instanceFields = template.fields.map(f => ({
//             ...f,
//             value: Number(f.partyIndex) === 0
//               ? (f.value || '')
//               : '',
//           }));

//           const instanceParties = [
//             ...(party1 ? [{
//               name:     party1.name,
//               email:    party1.email,
//               status:   'signed',
//               signedAt: template.parties[0]?.signedAt || new Date(),
//               color:    '#0ea5e9',
//             }] : []),
//             {
//               name:   signer.name,
//               email:  signer.email,
//               status: 'pending',
//               token:  genToken(),
//               color:  '#8b5cf6',
//             },
//           ];

//           const instance = await Document.create({
//             owner:            template.owner,
//             title:            template.title,
//             companyLogo:      template.companyLogo,
//             companyName:      template.companyName,
//             fileUrl:          template.fileUrl,
//             fileId:           template.fileId,
//             fields:           instanceFields,
//             parties:          instanceParties,
//             ccList:           ccList.length ? ccList : template.ccList,
//             isTemplate:       false,
//             sourceTemplateId: template._id,
//             status:           'in_progress',
//             workflowType:     'template_instance',
//             totalPages:       template.totalPages,
//           });

//           await Document.updateOne(
//             { _id: template._id },
//             { $inc: { usageCount: 1 } }
//           );

//           const signerParty = instance.parties.find(
//             p => p.email === signer.email
//           );
//           if (signerParty?.token) {
//             const link = `${FRONT()}/sign/${signerParty.token}`;
//             await sendSigningEmail({
//               recipientEmail: signer.email,
//               recipientName:  signer.name,
//               senderName:     req.user.full_name,
//               documentTitle:  instance.title,
//               signingLink:    link,
//               companyLogoUrl: instance.companyLogo,
//               companyName:    instance.companyName,
//               partyNumber:    2,
//               totalParties:   2,
//             });

//             signerParty.status      = 'sent';
//             signerParty.emailSentAt = new Date();
//             await instance.save();
//           }

//           for (const cc of (instance.ccList || [])) {
//             await sendCCEmail({
//               recipientEmail: cc.email,
//               recipientName:  cc.name || '',
//               documentTitle:  instance.title,
//               senderName:     req.user.full_name,
//               companyLogoUrl: instance.companyLogo,
//               companyName:    instance.companyName,
//             }).catch(e => console.error('CC error:', e.message));
//           }
//         } catch (signerErr) {
//           console.error(
//             `Error for signer ${signer.email}:`,
//             signerErr.message
//           );
//         }
//       }
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // Bulk send
// router.post('/templates/:id/use-bulk', auth, async (req, res) => {
//   try {
//     const template = await Document.findOne({
//       _id:        req.params.id,
//       owner:      req.user.id,
//       isTemplate: true,
//     }).lean();

//     if (!template)
//       return res.status(404).json({
//         success: false, message: 'Template not found.',
//       });

//     const { employees = [], ccList = [] } = req.body;
//     if (!employees.length)
//       return res.status(400).json({
//         success: false, message: 'No employees provided.',
//       });

//     res.json({
//       success: true,
//       total:   employees.length,
//       message: 'Bulk send started.',
//     });

//     setImmediate(async () => {
//       const party1 = template.parties?.[0];
//       let created  = 0;

//       for (const emp of employees) {
//         try {
//           const instanceFields = template.fields.map(f => ({
//             ...f,
//             value: Number(f.partyIndex) === 0
//               ? (f.value || '')
//               : '',
//           }));

//           const instanceParties = [
//             ...(party1 ? [{
//               name:     party1.name,
//               email:    party1.email,
//               status:   'signed',
//               signedAt: new Date(),
//               color:    '#0ea5e9',
//             }] : []),
//             {
//               name:   emp.name,
//               email:  emp.email,
//               status: 'pending',
//               token:  genToken(),
//               color:  '#8b5cf6',
//             },
//           ];

//           const instance = await Document.create({
//             owner:            template.owner,
//             title:            template.title,
//             companyLogo:      template.companyLogo,
//             companyName:      template.companyName,
//             fileUrl:          template.fileUrl,
//             fileId:           template.fileId,
//             fields:           instanceFields,
//             parties:          instanceParties,
//             ccList:           ccList.length ? ccList : template.ccList,
//             isTemplate:       false,
//             sourceTemplateId: template._id,
//             status:           'in_progress',
//             workflowType:     'template_instance',
//             totalPages:       template.totalPages,
//           });

//           await Document.updateOne(
//             { _id: template._id },
//             { $inc: { usageCount: 1 } }
//           );

//           const sp = instance.parties.find(p => p.email === emp.email);
//           if (sp?.token) {
//             const link = `${FRONT()}/sign/${sp.token}`;
//             await sendSigningEmail({
//               recipientEmail: emp.email,
//               recipientName:  emp.name,
//               senderName:     'NeXsign',
//               documentTitle:  instance.title,
//               signingLink:    link,
//               companyLogoUrl: instance.companyLogo,
//               companyName:    instance.companyName,
//               partyNumber:    2,
//               totalParties:   2,
//             });
//             sp.status      = 'sent';
//             sp.emailSentAt = new Date();
//             await instance.save();
//           }
//           created++;
//         } catch (empErr) {
//           console.error(`Bulk error ${emp.email}:`, empErr.message);
//         }
//       }
//       console.log(`Bulk complete: ${created}/${employees.length}`);
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // Template usage history
// router.get('/templates/:id/usage', auth, async (req, res) => {
//   try {
//     const instances = await Document.find({
//       sourceTemplateId: req.params.id,
//       owner:            req.user.id,
//     })
//       .select(
//         'title status parties.name parties.email ' +
//         'parties.status parties.signedAt ' +
//         'createdAt signedFileUrl'
//       )
//       .sort({ createdAt: -1 })
//       .limit(100)
//       .lean();

//     res.json({ success: true, usage: instances });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ════════════════════════════════════════════════════════════════
// // DASHBOARD LIST
// // ════════════════════════════════════════════════════════════════
// router.get('/', auth, async (req, res) => {
//   try {
//     const page  = parseInt(req.query.page)  || 1;
//     const limit = parseInt(req.query.limit) || 6;
//     const skip  = (page - 1) * limit;

//     const query = {
//       owner:      req.user.id,
//       isTemplate: false,
//     };

//     if (req.query.status && req.query.status !== 'all')
//       query.status = req.query.status;

//     const [documents, total] = await Promise.all([
//       Document.find(query)
//         .select('-fields')
//         .sort({ updatedAt: -1 })
//         .skip(skip)
//         .limit(limit)
//         .lean(),
//       Document.countDocuments(query),
//     ]);

//     res.json({
//       success: true,
//       documents,
//       total,
//       hasMore: total > skip + documents.length,
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ════════════════════════════════════════════════════════════════
// // GET SINGLE DOCUMENT
// // ════════════════════════════════════════════════════════════════
// router.get('/:id', auth, async (req, res) => {
//   try {
//     const doc = await Document.findOne({
//       _id:   req.params.id,
//       owner: req.user.id,
//     })
//       .populate('owner', 'full_name email')
//       .lean();

//     if (!doc)
//       return res.status(404).json({
//         success: false, message: 'Not found.',
//       });

//     res.json({ success: true, document: doc });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ════════════════════════════════════════════════════════════════
// // UPDATE DOCUMENT
// // ════════════════════════════════════════════════════════════════
// router.put('/:id', auth, async (req, res) => {
//   try {
//     const allowed = [
//       'title','fields','parties','ccList',
//       'companyLogo','companyName','status',
//     ];
//     const updates = {};
//     allowed.forEach(k => {
//       if (req.body[k] !== undefined) updates[k] = req.body[k];
//     });

//     const doc = await Document.findOneAndUpdate(
//       { _id: req.params.id, owner: req.user.id },
//       { $set: updates },
//       { new: true, runValidators: true }
//     );

//     if (!doc)
//       return res.status(404).json({
//         success: false, message: 'Not found.',
//       });

//     res.json({ success: true, document: doc });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ════════════════════════════════════════════════════════════════
// // DELETE DOCUMENT
// // ════════════════════════════════════════════════════════════════
// router.delete('/:id', auth, async (req, res) => {
//   try {
//     const doc = await Document.findOneAndDelete({
//       _id:   req.params.id,
//       owner: req.user.id,
//     });

//     if (!doc)
//       return res.status(404).json({
//         success: false, message: 'Not found.',
//       });

//     AuditLog.deleteMany({ document_id: doc._id }).catch(() => {});

//     res.json({ success: true, message: 'Deleted.' });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ════════════════════════════════════════════════════════════════
// // AUDIT LOG
// // ════════════════════════════════════════════════════════════════
// router.get('/:id/audit', auth, async (req, res) => {
//   try {
//     const doc = await Document.findOne({
//       _id:   req.params.id,
//       owner: req.user.id,
//     }).lean();

//     if (!doc)
//       return res.status(404).json({
//         success: false, message: 'Not found.',
//       });

//     const logs = await AuditLog.find({
//       document_id: req.params.id,
//     })
//       .sort({ timestamp: 1 })
//       .lean();

//     res.json({
//       success: true,
//       audit: {
//         _id:     doc._id,
//         title:   doc.title,
//         status:  doc.status,
//         parties: doc.parties,
//         ccList:  doc.ccList || [],
//         events:  logs.map(l => ({
//           eventType:  l.action,
//           actorName:  l.performed_by?.name,
//           actorEmail: l.performed_by?.email,
//           ipAddress:  l.ip_address,
//           location:   l.location,
//           postalCode: l.postal_code,
//           clientTime: l.client_time,
//           occurredAt: l.timestamp,
//         })),
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// module.exports = router;
/**
 * documentRoutes.js — NeXsign Enterprise (Vercel-safe)
 *
 * ROOT CAUSES FIXED:
 * ─────────────────────────────────────────────────────────────
 * 1. SIGNING LINK SLOW: getGeoLocation() was awaited BEFORE res.json()
 *    → Geo lookup (ipapi.co) takes 2–4 seconds and blocked the response.
 *    FIX: res.json() is sent immediately; geo runs in a separate non-blocking
 *    promise that updates the DB via a second save() call.
 *
 * 2. PDF NOT COMPLETING / DASHBOARD SHOWS RAW PDF:
 *    setImmediate() is unreliable on Vercel serverless. Vercel freezes the
 *    process the moment res.json() returns, so async work queued with
 *    setImmediate is silently dropped — PDF never merges, audit page never
 *    appends, email never sends.
 *    FIX: Use "respond-then-finalize" pattern:
 *      a) Save all signer data + mark doc as 'processing'
 *      b) Send res.json() immediately
 *      c) AWAIT the finalization AFTER res is sent using res.on('finish')
 *         via a response-pipeline trick, or more reliably: save status
 *         as 'processing', then call finalization synchronously in a
 *         detached async chain that uses process.nextTick for the first
 *         hop to guarantee the event loop stays alive on Vercel.
 *    The only truly reliable Vercel pattern is: do all the work BEFORE
 *    sending the response. We do PDF merge synchronously before res.json(),
 *    but stream the email in background. Heavy PDF work is kept lean with
 *    streaming from Cloudinary.
 *
 * 3. AUDIT PAGE / SIGNATURES NOT IN FINAL PDF:
 *    buildAuditPage was called on the merged bytes but the result was
 *    never waited for properly in the fire-and-forget chain.
 *    FIX: mergeSignaturesAndLogo + buildAuditPage are called synchronously
 *    in the request handler BEFORE responding, so they always complete.
 *    Only the email send is done after response (it's non-critical).
 *
 * 4. TEMPLATE ROUTES / AUDIT ROUTE: fully implemented.
 * 5. ccRecipients → ccEmails sync maintained.
 * ─────────────────────────────────────────────────────────────
 */

const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const express    = require('express');
const router     = express.Router();
const multer     = require('multer');
const axios      = require('axios');
const { v2: cloudinary } = require('cloudinary');
const crypto     = require('crypto');
const nodemailer = require('nodemailer');
const Document   = require('../models/Document');
const AuditLog   = require('../models/AuditLog');
const auth       = require('../middleware/auth');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  pool:    true,
  maxConnections: 3,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

// ══════════════════════════════════════════════════════════════════════════
// UTILITIES
// ══════════════════════════════════════════════════════════════════════════

const uploadToCloudinary = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, res) =>
      err ? reject(err) : resolve(res)
    );
    stream.end(buffer);
  });

// ── IP geo (non-blocking — never awaited before responding) ───────────────
const getGeoSilent = async (ip) => {
  try {
    const clean = (ip || '').split(',')[0].trim();
    if (!clean || clean === '127.0.0.1' || clean === '::1') return {};
    const r = await axios.get(`https://ipapi.co/${clean}/json/`, { timeout: 4000 });
    const d = r.data || {};
    return {
      city:     d.city         || '',
      region:   d.region       || '',
      country:  d.country_name || '',
      postal:   d.postal       || '',
      timezone: d.timezone     || '',
    };
  } catch {
    return {};
  }
};

const parseUA = (ua = '') => {
  const mob = /mobile|android|iphone|ipad/i.test(ua);
  const device = /ipad|tablet/i.test(ua) ? 'Tablet' : mob ? 'Mobile' : 'Desktop';
  let b = 'Unknown';
  if      (/edg\//i.test(ua))    b = 'Edge';
  else if (/chrome/i.test(ua))   b = 'Chrome';
  else if (/firefox/i.test(ua))  b = 'Firefox';
  else if (/safari/i.test(ua))   b = 'Safari';
  return `${device} / ${b}`;
};

// ── pdf-lib font embed ─────────────────────────────────────────────────────
const embedPdfFont = async (pdfDoc, family = '', weight = 'normal') => {
  const f    = (family || '').toLowerCase();
  const bold = weight === 'bold';
  if (f.includes('times') || f.includes('roman'))
    return pdfDoc.embedFont(bold ? StandardFonts.TimesRomanBold : StandardFonts.TimesRoman);
  if (f.includes('courier'))
    return pdfDoc.embedFont(bold ? StandardFonts.CourierBold : StandardFonts.Courier);
  return pdfDoc.embedFont(bold ? StandardFonts.HelveticaBold : StandardFonts.Helvetica);
};

function hexToRgb(hex) {
  const h = (hex || '#28ABDF').replace('#', '');
  return rgb(
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255
  );
}

// ── Stamp logo on every page ───────────────────────────────────────────────
const stampLogoAllPages = async (pdfDoc, logoData, pos) => {
  if (!logoData || !pos) return;
  try {
    const b64 = logoData.includes(',') ? logoData.split(',')[1] : logoData;
    const buf = Buffer.from(b64, 'base64');
    const img = logoData.includes('image/png')
      ? await pdfDoc.embedPng(buf)
      : await pdfDoc.embedJpg(buf);
    for (const page of pdfDoc.getPages()) {
      const { width: pW, height: pH } = page.getSize();
      page.drawImage(img, {
        x:       (parseFloat(pos.x)      / 100) * pW,
        y:       pH - (parseFloat(pos.y)  / 100) * pH - (parseFloat(pos.height) / 100) * pH,
        width:   (parseFloat(pos.width)   / 100) * pW,
        height:  (parseFloat(pos.height)  / 100) * pH,
        opacity: parseFloat(pos.opacity ?? 0.85),
      });
    }
  } catch (e) { console.warn('[Logo stamp]', e.message); }
};

// ══════════════════════════════════════════════════════════════════════════
// CORE PDF PROCESSING
// ══════════════════════════════════════════════════════════════════════════

/**
 * Merges all signed field values (signatures + text) + logo into the PDF.
 * Called synchronously inside the request handler so Vercel can't kill it.
 */
const buildFinalPdf = async (doc) => {
  // ── 1. Fetch original PDF ────────────────────────────────────────────
  const response = await axios.get(doc.fileUrl, {
    responseType: 'arraybuffer',
    timeout: 30000,
  });
  const pdfDoc = await PDFDocument.load(response.data, { ignoreEncryption: true });
  const pages  = pdfDoc.getPages();

  // ── 2. Stamp logo on all pages ───────────────────────────────────────
  if (doc.brandConfig?.logoData && doc.brandConfig?.logoPosition) {
    await stampLogoAllPages(pdfDoc, doc.brandConfig.logoData, doc.brandConfig.logoPosition);
  }

  // ── 3. Embed signed fields ───────────────────────────────────────────
  const fields = (doc.fields || [])
    .map(f => typeof f === 'string' ? JSON.parse(f) : f)
    .filter(f => f?.value && f.value !== '[SIGNED]');

  for (const fd of fields) {
    const pi = Number(fd.page) - 1;
    if (pi < 0 || pi >= pages.length) continue;
    const page = pages[pi];
    const { width: pW, height: pH } = page.getSize();
    const dW = (parseFloat(fd.width)  / 100) * pW;
    const dH = (parseFloat(fd.height) / 100) * pH;
    const dX = (parseFloat(fd.x)      / 100) * pW;
    const dY = pH - (parseFloat(fd.y)  / 100) * pH - dH;

    if (fd.value.startsWith('data:image')) {
      const buf = Buffer.from(fd.value.split(',')[1], 'base64');
      const img = fd.value.includes('image/png')
        ? await pdfDoc.embedPng(buf)
        : await pdfDoc.embedJpg(buf);
      // opacity:1 preserves transparent PNG alpha — no white box
      page.drawImage(img, { x: dX, y: dY, width: dW, height: dH, opacity: 1 });
    } else if (fd.value) {
      const fontSize = parseFloat(fd.fontSize  || 11);
      const font     = await embedPdfFont(pdfDoc, fd.fontFamily || '', fd.fontWeight || 'normal');
      page.drawText(String(fd.value), {
        x: dX + 3,
        y: dY + dH / 2 - fontSize / 3,
        size:     fontSize,
        font,
        color:    rgb(0, 0, 0),
        maxWidth: dW - 6,
      });
    }
  }

  // ── 4. Append professional Audit Certificate page (A4) ───────────────
  const bold    = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const auditPg = pdfDoc.addPage([595, 842]);

  const brand     = doc.brandConfig || {};
  const bName     = brand.name  || 'NeXsign';
  const bRgb      = hexToRgb(brand.color || '#28ABDF');

  // Header bar
  auditPg.drawRectangle({ x: 0, y: 792, width: 595, height: 50, color: bRgb });
  if (brand.logoData) {
    try {
      const b64 = brand.logoData.split(',')[1];
      const buf = Buffer.from(b64, 'base64');
      const img = brand.logoData.includes('image/png')
        ? await pdfDoc.embedPng(buf)
        : await pdfDoc.embedJpg(buf);
      auditPg.drawImage(img, { x: 28, y: 798, width: 70, height: 34, opacity: 0.95 });
    } catch { /* non-fatal */ }
  }
  auditPg.drawText('SIGNING CERTIFICATE & AUDIT TRAIL', {
    x: brand.logoData ? 110 : 40, y: 810,
    size: 13, font: bold, color: rgb(1, 1, 1),
  });

  // Document info block
  auditPg.drawText(`Document: ${doc.title}`, { x: 40, y: 760, size: 12, font: bold, color: rgb(0.08, 0.14, 0.24) });
  auditPg.drawText(`Completed: ${new Date().toUTCString()}`, { x: 40, y: 744, size: 9, font: regular, color: rgb(0.5, 0.6, 0.68) });
  auditPg.drawText(`Platform: ${bName}`, { x: 40, y: 730, size: 9, font: regular, color: rgb(0.5, 0.6, 0.68) });
  auditPg.drawText(`Total Signers: ${doc.parties.length}`, { x: 320, y: 744, size: 9, font: regular, color: rgb(0.5, 0.6, 0.68) });
  auditPg.drawText(`Mode: ${doc.signingMode === 'parallel' ? 'Parallel' : 'Sequential'}`, { x: 320, y: 730, size: 9, font: regular, color: rgb(0.5, 0.6, 0.68) });
  auditPg.drawLine({ start: { x: 40, y: 720 }, end: { x: 555, y: 720 }, thickness: 1, color: rgb(0.88, 0.91, 0.95) });

  let y = 705;
  for (let i = 0; i < doc.parties.length; i++) {
    const p  = doc.parties[i];
    if (y < 90) break;
    const ok = p.status === 'signed';

    auditPg.drawRectangle({
      x: 35, y: y - 82, width: 525, height: 88,
      color:       ok ? rgb(0.94, 1, 0.96)    : rgb(0.97, 0.99, 1),
      borderColor: ok ? rgb(0.13, 0.77, 0.56) : rgb(0.82, 0.88, 0.94),
      borderWidth: 1,
    });

    auditPg.drawText(`${i + 1}. ${p.name}`, { x: 50, y: y - 10, size: 11, font: bold,    color: rgb(0.08, 0.14, 0.24) });
    auditPg.drawText(p.email,               { x: 50, y: y - 24, size: 9,  font: regular,  color: rgb(0.45, 0.55, 0.65) });
    auditPg.drawText(`Status: ${p.status.toUpperCase()}`, {
      x: 50, y: y - 40, size: 8, font: bold,
      color: ok ? rgb(0.05, 0.65, 0.42) : rgb(0.8, 0.5, 0.1),
    });
    if (p.signedAt) {
      auditPg.drawText(`Signed: ${new Date(p.signedAt).toLocaleString()}`, {
        x: 50, y: y - 55, size: 8, font: regular, color: rgb(0.5, 0.6, 0.7),
      });
    }

    // Right column: forensic metadata
    const meta = [
      p.ipAddress  && `IP: ${p.ipAddress}`,
      p.location   && `Location: ${p.location}`,
      p.postalCode && `Postal: ${p.postalCode}`,
      p.device     && `Device: ${p.device}`,
      p.timeZone   && `TZ: ${p.timeZone}`,
    ].filter(Boolean);
    meta.forEach((txt, ei) => {
      auditPg.drawText(txt, { x: 315, y: y - 10 - ei * 14, size: 8, font: regular, color: rgb(0.5, 0.58, 0.68) });
    });

    y -= 100;
  }

  // CC section
  const ccList = [
    ...(doc.ccEmails || []),
    ...(doc.ccRecipients || []).map(r => r.designation ? `${r.email} (${r.designation})` : r.email),
  ].filter(Boolean);
  if (ccList.length && y > 70) {
    auditPg.drawLine({ start: { x: 40, y: y + 14 }, end: { x: 555, y: y + 14 }, thickness: 0.5, color: rgb(0.88, 0.91, 0.95) });
    auditPg.drawText('CC RECIPIENTS:', { x: 40, y: y - 2, size: 8, font: bold, color: rgb(0.5, 0.6, 0.68) });
    auditPg.drawText([...new Set(ccList)].join('  •  '), { x: 40, y: y - 16, size: 8, font: regular, color: rgb(0.6, 0.68, 0.75) });
    y -= 36;
  }

  // Legal footer
  auditPg.drawLine({ start: { x: 40, y: 54 }, end: { x: 555, y: 54 }, thickness: 0.5, color: rgb(0.88, 0.91, 0.95) });
  auditPg.drawText(
    `This document was electronically signed via ${bName}. Identity verified by one-time email link. ` +
    `This certificate is tamper-evident and legally binding under applicable eSignature laws.`,
    { x: 40, y: 40, size: 7.5, font: regular, color: rgb(0.6, 0.68, 0.75), maxWidth: 515 }
  );

  return pdfDoc.save();
};

// ── Completion email sender (called after res.json) ────────────────────────
const sendCompletionEmail = async (doc, pdfBuffer) => {
  try {
    const brand     = doc.brandConfig || {};
    const bName     = brand.name  || 'NeXsign';
    const bColor    = brand.color || '#28ABDF';
    const allEmails = [
      ...doc.parties.map(p => p.email),
      ...(doc.ccEmails || []),
      ...(doc.ccRecipients || []).map(r => r.email),
    ].filter(Boolean);

    await transporter.sendMail({
      from:    `"${brand.senderName || bName}" <${process.env.EMAIL_USER}>`,
      to:      [...new Set(allEmails)].join(','),
      subject: `✅ Completed: "${doc.title}" — ${bName}`,
      html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:36px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:20px;overflow:hidden;max-width:600px;width:100%;box-shadow:0 4px 28px rgba(0,0,0,.10);">
  <tr><td style="background:linear-gradient(135deg,#10b981,#059669);padding:28px 40px;text-align:center;">
    ${brand.logoUrl ? `<img src="${brand.logoUrl}" alt="${bName}" style="height:40px;max-width:160px;object-fit:contain;display:block;margin:0 auto 12px;">` : ''}
    <h1 style="color:#fff;margin:0;font-size:22px;font-weight:800;">✅ All Signatures Collected!</h1>
  </td></tr>
  <tr><td style="padding:32px 40px;">
    <p style="color:#334155;font-size:15px;margin:0 0 6px;">The document <strong>"${doc.title}"</strong> has been fully signed by all ${doc.parties.length} parties.</p>
    <p style="color:#64748b;font-size:13px;margin:0 0 22px;">The completed document with audit certificate is attached.</p>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:14px 18px;margin-bottom:22px;">
      ${doc.parties.map(p => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid #dcfce7;font-size:13px;">
          <span style="color:#166534;font-weight:600;">${p.name}</span>
          <span style="background:#dcfce7;color:#15803d;padding:2px 10px;border-radius:50px;font-size:11px;font-weight:700;">SIGNED</span>
        </div>`).join('')}
    </div>
    <p style="color:#94a3b8;font-size:11px;margin:0;">
      ${bName !== 'NeXsign' ? `${bName} uses ` : ''}
      <strong style="color:${bColor};">NeXsign</strong> for secure, legally-binding electronic signatures.
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`,
      attachments: [{
        filename:    `${doc.title.replace(/\s+/g, '_')}_Signed.pdf`,
        content:     pdfBuffer,
        contentType: 'application/pdf',
      }],
    });
  } catch (err) {
    console.error('[Completion email]', err.message);
  }
};

// ── Branded signing-request email ──────────────────────────────────────────
const sendSigningEmail = (party, doc, token, brand = {}) => {
  const signLink = `${process.env.FRONTEND_URL}/sign/${token}`;
  const bName    = brand.name  || 'NeXsign';
  const bColor   = brand.color || '#28ABDF';
  const subject  = brand.emailSubject
    ? brand.emailSubject.replace('{doc}', doc.title).replace('{brand}', bName)
    : `Action Required: Sign "${doc.title}" — ${bName}`;

  return transporter.sendMail({
    from:    `"${brand.senderName || bName}" <${process.env.EMAIL_USER}>`,
    to:      party.email,
    subject,
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:36px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:20px;overflow:hidden;max-width:600px;width:100%;box-shadow:0 4px 28px rgba(0,0,0,.10);">
  <tr><td style="background:linear-gradient(135deg,${bColor},${bColor}cc);padding:30px 40px;text-align:center;">
    ${brand.logoUrl
      ? `<img src="${brand.logoUrl}" alt="${bName}" style="height:44px;max-width:180px;object-fit:contain;display:block;margin:0 auto 12px;">`
      : `<div style="display:inline-block;background:rgba(255,255,255,.2);padding:9px 22px;border-radius:50px;margin-bottom:12px;"><span style="color:#fff;font-size:20px;font-weight:800;">${bName}</span></div>`
    }
    <h1 style="color:#fff;margin:0;font-size:21px;font-weight:700;">Signature Requested</h1>
  </td></tr>
  <tr><td style="padding:34px 40px;">
    <p style="color:#334155;font-size:16px;margin:0 0 5px;font-weight:600;">Hello ${party.name},</p>
    <p style="color:#64748b;font-size:14px;line-height:1.7;margin:0 0 22px;">
      ${doc.senderMeta?.name || 'Someone'} has requested your electronic signature on:
    </p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid ${bColor};border-radius:12px;padding:16px 20px;margin-bottom:26px;">
      <p style="margin:0;color:#0f172a;font-size:16px;font-weight:700;">📄 ${doc.title}</p>
    </div>
    <div style="text-align:center;margin-bottom:26px;">
      <a href="${signLink}" style="display:inline-block;background:linear-gradient(135deg,${bColor},${bColor}cc);color:#fff;padding:15px 44px;border-radius:50px;font-size:15px;font-weight:700;text-decoration:none;box-shadow:0 6px 20px ${bColor}44;">
        ✍️ Review &amp; Sign Document
      </a>
    </div>
    <div style="background:#fefce8;border:1px solid #fde68a;border-radius:10px;padding:12px 16px;">
      <p style="margin:0;color:#92400e;font-size:12px;line-height:1.6;">
        🔒 <strong>Security:</strong> This is a one-time use link that expires after signing. Do not share this email.
      </p>
    </div>
  </td></tr>
  <tr><td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:18px 40px;text-align:center;">
    <p style="margin:0 0 4px;color:#94a3b8;font-size:11px;">Link: <span style="color:${bColor};">${signLink}</span></p>
    <p style="margin:0;color:#cbd5e1;font-size:10px;">
      ${bName !== 'NeXsign' ? `${bName} uses ` : ''}<strong style="color:${bColor};">NeXsign</strong> for secure, legally-binding digital contracts.
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`,
  });
};

// ══════════════════════════════════════════════════════════════════════════
// ROUTES
// ══════════════════════════════════════════════════════════════════════════

// ── 1. Upload & Send ──────────────────────────────────────────────────────
router.post('/upload-and-send', auth, upload.fields([
  { name: 'file',     maxCount: 1 },
  { name: 'logoFile', maxCount: 1 },
]), async (req, res) => {
  try {
    const {
      title, parties, ccEmails, ccRecipients, fields, totalPages,
      isTemplate, signingMode,
      brandName, brandColor, brandSenderName, brandEmailSubject, logoPosition,
    } = req.body;

    const parsedParties      = JSON.parse(parties        || '[]');
    const parsedCcEmails     = JSON.parse(ccEmails       || '[]');
    const parsedCcRecipients = JSON.parse(ccRecipients   || '[]');
    const parsedFields       = JSON.parse(fields         || '[]');
    const templateMode       = isTemplate === 'true';
    const mode               = signingMode || 'sequential';

    if (!parsedParties.length && !templateMode)
      return res.status(400).json({ success: false, error: 'At least one party is required' });

    const pdfFile = req.files?.file?.[0];
    if (!pdfFile)
      return res.status(400).json({ success: false, error: 'PDF file is required' });

    const uploadRes = await uploadToCloudinary(pdfFile.buffer, {
      resource_type: 'raw', folder: 'nexsign_docs', format: 'pdf',
    });

    // Logo
    let logoData = null, logoCloudUrl = null;
    if (req.files?.logoFile?.[0]) {
      const lb    = req.files.logoFile[0];
      logoData    = `data:${lb.mimetype};base64,${lb.buffer.toString('base64')}`;
      const lr    = await uploadToCloudinary(lb.buffer, { folder: 'nexsign_logos' });
      logoCloudUrl = lr.secure_url;
    }

    const brandConfig = {
      name:         brandName       || '',
      color:        brandColor      || '#28ABDF',
      senderName:   brandSenderName || brandName || '',
      emailSubject: brandEmailSubject || null,
      logoUrl:      logoCloudUrl   || null,
      logoData:     logoData       || null,
      logoPosition: logoPosition ? JSON.parse(logoPosition) : null,
    };

    const partiesWithTokens = parsedParties.map((p, i) => ({
      name:   p.name.trim(),
      email:  p.email.trim().toLowerCase(),
      status: mode === 'parallel' ? 'sent' : (i === 0 ? 'sent' : 'pending'),
      token:  mode === 'parallel' || i === 0
        ? crypto.randomBytes(32).toString('hex')
        : crypto.randomBytes(16).toString('hex'),
    }));

    const allCcEmails = [
      ...parsedCcEmails,
      ...parsedCcRecipients.map(r => r.email).filter(Boolean),
    ].map(e => e.toLowerCase().trim());

    const doc = await Document.create({
      title:        title?.trim() || 'Untitled',
      fileUrl:      uploadRes.secure_url,
      fileId:       uploadRes.public_id,
      parties:      partiesWithTokens,
      ccEmails:     [...new Set(allCcEmails)],
      ccRecipients: parsedCcRecipients,
      fields:       parsedFields,
      totalPages:   Number(totalPages) || 1,
      status:       templateMode ? 'draft' : 'in_progress',
      isTemplate:   templateMode,
      signingMode:  mode,
      brandConfig,
      owner:        req.user.id,
      senderMeta:   { name: req.user.full_name, email: req.user.email },
    });

    // Auto-save as template (non-blocking, best-effort)
    if (!templateMode) {
      Document.create({
        title:       `${title?.trim() || 'Untitled'} [Template]`,
        fileUrl:     uploadRes.secure_url,
        fileId:      uploadRes.public_id,
        parties:     [],
        ccEmails:    [],
        fields:      parsedFields,
        totalPages:  Number(totalPages) || 1,
        status:      'draft',
        isTemplate:  true,
        signingMode: mode,
        brandConfig,
        owner:       req.user.id,
      }).catch(console.error);
    }

    AuditLog.create({
      document_id:  doc._id,
      action:       'sent',
      performed_by: { name: req.user.full_name || 'Owner', email: req.user.email, role: 'owner' },
      ip_address:   req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '',
      details:      `Mode:${mode} Parties:${parsedParties.length}`,
    }).catch(console.error);

    if (!templateMode) {
      if (mode === 'parallel') {
        partiesWithTokens.forEach(p =>
          sendSigningEmail(p, doc, p.token, brandConfig).catch(console.error)
        );
      } else {
        sendSigningEmail(partiesWithTokens[0], doc, partiesWithTokens[0].token, brandConfig).catch(console.error);
      }
    }

    res.json({ success: true, documentId: doc._id });
  } catch (err) {
    console.error('[upload-and-send]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 2. PDF Proxy (strip cache-buster query string) ────────────────────────
router.get('/proxy/:path(*)', async (req, res) => {
  try {
    const rawPath   = req.params.path.split('?')[0];
    const cloudPath = rawPath.replace(/~~/g, '/');
    let response;
    try {
      response = await axios.get(
        `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${cloudPath}`,
        { responseType: 'stream', timeout: 20000 }
      );
    } catch {
      response = await axios.get(
        `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${cloudPath}`,
        { responseType: 'stream', timeout: 20000 }
      );
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    response.data.pipe(res);
  } catch {
    res.status(404).json({ error: 'PDF not found' });
  }
});

// ── 3. Get signing page (PUBLIC) ──────────────────────────────────────────
// Responds instantly — tracking is done async afterwards
router.get('/sign/:token', async (req, res) => {
  try {
    const doc = await Document.findOne({ 'parties.token': req.params.token });
    if (!doc) return res.status(404).json({ error: 'Invalid or expired link' });

    const partyIdx = doc.parties.findIndex(p => p.token === req.params.token);
    const party    = doc.parties[partyIdx];
    if (!party)              return res.status(404).json({ error: 'Invalid link' });
    if (party.status === 'signed')
      return res.status(400).json({ error: 'This link has already been used. Each signing link is one-time only.' });

    // ✅ Respond instantly — NO awaiting geo here
    res.json({
      success:     true,
      title:       doc.title,
      fileUrl:     doc.fileUrl,
      fields:      doc.fields,
      partyIndex:  partyIdx,
      partyName:   party.name,
      totalPages:  doc.totalPages,
      brandConfig: doc.brandConfig
        ? { name: doc.brandConfig.name, color: doc.brandConfig.color, logoUrl: doc.brandConfig.logoUrl }
        : null,
    });

    // Track link open asynchronously AFTER response is sent
    const ip  = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
    const ua  = req.headers['user-agent'] || '';
    getGeoSilent(ip).then(geo => {
      Document.findById(doc._id).then(d => {
        if (!d) return;
        const p               = d.parties[partyIdx];
        if (!p)               return;
        p.linkOpenedAt        = p.linkOpenedAt || new Date();
        p.lastLinkOpenedAt    = new Date();
        p.linkOpenCount       = (p.linkOpenCount || 0) + 1;
        p.openedIpAddress     = ip.split(',')[0].trim();
        p.openedLocation      = [geo.city, geo.country].filter(Boolean).join(', ');
        p.openedUserAgent     = ua;
        d.markModified('parties');
        d.save().catch(console.error);
      }).catch(console.error);
    }).catch(console.error);

  } catch (err) {
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
});

// ── 4. Submit signatures ──────────────────────────────────────────────────
// CRITICAL FIX: PDF merge + audit page happen BEFORE res.json()
// so Vercel cannot kill the process midway.
router.post('/sign/submit', async (req, res) => {
  try {
    const { token, fields, locationData, deviceInfo, clientTime } = req.body;
    const ua  = req.headers['user-agent'] || '';
    const ip  = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';

    const doc = await Document.findOne({ 'parties.token': token });
    if (!doc) return res.status(404).json({ error: 'Invalid link' });

    const idx    = doc.parties.findIndex(p => p.token === token);
    const signer = doc.parties[idx];
    if (!signer || signer.status === 'signed')
      return res.status(400).json({ error: 'Already signed' });

    // ── Update fields in DB immediately ─────────────────────────────────
    doc.fields = (fields || []).map(f => typeof f === 'string' ? JSON.parse(f) : f);
    doc.markModified('fields');

    // ── Signer basic data (sync) — geo fills in after ────────────────────
    const cleanIp          = ip.split(',')[0].trim();
    signer.status          = 'signed';
    signer.signedAt        = new Date();
    signer.ipAddress       = cleanIp;
    signer.location        = locationData?.city
      ? `${locationData.city}, ${locationData.country || ''}`.trim()
      : '';
    signer.postalCode      = locationData?.postal || locationData?.postalCode || '';
    signer.timeZone        = locationData?.timezone || locationData?.timeZone || '';
    signer.device          = typeof deviceInfo === 'string' ? deviceInfo : parseUA(ua);
    signer.signedIpAddress = cleanIp;
    signer.signedLocation  = signer.location;
    signer.signedPostalCode = signer.postalCode;
    signer.token           = null; // ✅ one-time invalidation

    // ── Sequential: chain to next signer ─────────────────────────────────
    if ((doc.signingMode || 'sequential') === 'sequential') {
      const nextIdx = idx + 1;
      if (nextIdx < doc.parties.length) {
        const nextToken           = crypto.randomBytes(32).toString('hex');
        doc.parties[nextIdx].token  = nextToken;
        doc.parties[nextIdx].status = 'sent';
        doc.currentPartyIndex       = nextIdx;
        await doc.save();

        AuditLog.create({
          document_id:  doc._id,
          action:       'signed',
          performed_by: { name: signer.name, email: signer.email, role: 'signer' },
          ip_address:   cleanIp,
          user_agent:   ua,
          client_time:  clientTime || '',
          details:      signer.device,
        }).catch(console.error);

        res.json({ success: true, next: true });
        sendSigningEmail(doc.parties[nextIdx], doc, nextToken, doc.brandConfig || {}).catch(console.error);

        // Backfill geo asynchronously
        getGeoSilent(cleanIp).then(geo => {
          Document.findById(doc._id).then(d => {
            if (!d) return;
            const s      = d.parties[idx];
            if (!s)      return;
            if (!s.location && geo.city)   s.location   = [geo.city, geo.country].filter(Boolean).join(', ');
            if (!s.postalCode && geo.postal) s.postalCode = geo.postal;
            if (!s.timeZone && geo.timezone) s.timeZone  = geo.timezone;
            d.markModified('parties');
            d.save().catch(console.error);
          }).catch(console.error);
        }).catch(console.error);

        return;
      }
    }

    // ── Check if all signed ───────────────────────────────────────────────
    const allSigned = doc.parties.every((p, i) => i === idx ? true : p.status === 'signed');

    if (!allSigned) {
      // Parallel mode — still waiting on others
      await doc.save();
      AuditLog.create({
        document_id:  doc._id,
        action:       'signed',
        performed_by: { name: signer.name, email: signer.email, role: 'signer' },
        ip_address:   cleanIp,
        details:      signer.device,
      }).catch(console.error);
      res.json({ success: true, waiting: true });
      return;
    }

    // ══ ALL SIGNED — build final PDF synchronously before responding ══════
    doc.status = 'processing'; // intermediate status
    await doc.save();

    let finalPdfBuffer = null;
    let finalUrl       = null;

    try {
      // This runs SYNCHRONOUSLY within the request — Vercel will not kill it
      const pdfBytes = await buildFinalPdf(doc);
      finalPdfBuffer = Buffer.from(pdfBytes);

      const up = await uploadToCloudinary(finalPdfBuffer, {
        resource_type: 'raw',
        folder:        'completed_docs',
        format:        'pdf',
      });
      finalUrl = up.secure_url;

      // Strip base64 blobs before saving (saves DB space)
      doc.fields = (doc.fields || []).map(f => {
        const fd = typeof f === 'string' ? JSON.parse(f) : { ...f };
        if (fd.type === 'signature') fd.value = '[SIGNED]';
        return fd;
      });
      doc.fileUrl  = finalUrl;
      doc.status   = 'completed';
      doc.markModified('fields');
      await doc.save();

    } catch (pdfErr) {
      console.error('[PDF finalization]', pdfErr);
      // Even if PDF fails, mark completed so user doesn't retry endlessly
      doc.status = 'completed';
      await doc.save();
    }

    AuditLog.create({
      document_id:  doc._id,
      action:       'completed',
      performed_by: { name: 'System', email: 'system@nexsign.app', role: 'system' },
      ip_address:   'system',
      details:      `All ${doc.parties.length} parties signed.`,
    }).catch(console.error);

    // ✅ Respond to client FIRST
    res.json({ success: true, completed: true });

    // ✅ Send email AFTER response — if Vercel kills this it's okay, email is non-critical
    if (finalPdfBuffer) {
      sendCompletionEmail(doc, finalPdfBuffer).catch(console.error);
    }

    // Backfill geo for last signer (best-effort)
    getGeoSilent(cleanIp).then(geo => {
      Document.findById(doc._id).then(d => {
        if (!d) return;
        const s = d.parties[idx];
        if (!s) return;
        if (!s.location && geo.city)    s.location   = [geo.city, geo.country].filter(Boolean).join(', ');
        if (!s.postalCode && geo.postal) s.postalCode = geo.postal;
        if (!s.timeZone && geo.timezone) s.timeZone  = geo.timezone;
        d.markModified('parties');
        d.save().catch(console.error);
      }).catch(console.error);
    }).catch(console.error);

  } catch (err) {
    console.error('[sign/submit]', err);
    if (!res.headersSent) res.status(500).json({ error: 'Submission failed. Please try again.' });
  }
});

// ── 5. Dashboard list ─────────────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(50, parseInt(req.query.limit) || 9);
    const skip   = (page - 1) * limit;
    const query  = { $or: [{ owner: req.user.id }, { 'parties.email': req.user.email }] };

    const [documents, total] = await Promise.all([
      Document.find(query)
        .select('title status isTemplate signingMode parties ccEmails ccRecipients totalPages createdAt updatedAt fileUrl currentPartyIndex brandConfig')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Document.countDocuments(query),
    ]);

    res.json({ success: true, documents, total, page, hasMore: total > skip + documents.length });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Dashboard fetch failed' });
  }
});

// ── 6. Template list ──────────────────────────────────────────────────────
router.get('/templates', auth, async (req, res) => {
  try {
    const templates = await Document.find({ owner: req.user.id, isTemplate: true })
      .select('title fields totalPages brandConfig signingMode createdAt updatedAt usageCount')
      .sort({ updatedAt: -1 })
      .lean();
    res.json({ success: true, templates });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 7. Use template (send to new signers) ─────────────────────────────────
router.post('/templates/:id/use', auth, async (req, res) => {
  try {
    const template = await Document.findOne({ _id: req.params.id, isTemplate: true });
    if (!template) return res.status(404).json({ success: false, error: 'Template not found' });

    const { parties, ccEmails, title } = req.body;
    const pp = Array.isArray(parties)  ? parties  : JSON.parse(parties  || '[]');
    const cc = Array.isArray(ccEmails) ? ccEmails : JSON.parse(ccEmails || '[]');
    if (!pp.length) return res.status(400).json({ success: false, error: 'Parties required' });

    const firstToken = crypto.randomBytes(32).toString('hex');
    const pts = pp.map((p, i) => ({
      name: p.name.trim(), email: p.email.trim().toLowerCase(),
      status: i === 0 ? 'sent' : 'pending',
      token:  i === 0 ? firstToken : crypto.randomBytes(16).toString('hex'),
    }));

    const doc = await Document.create({
      title:       title || template.title,
      fileUrl:     template.fileUrl,
      fileId:      template.fileId,
      parties:     pts,
      ccEmails:    cc.map(e => e.toLowerCase().trim()),
      fields:      template.fields,
      totalPages:  template.totalPages,
      status:      'in_progress',
      isTemplate:  false,
      signingMode: template.signingMode || 'sequential',
      brandConfig: template.brandConfig,
      owner:       req.user.id,
      senderMeta:  { name: req.user.full_name, email: req.user.email },
    });

    Document.findByIdAndUpdate(req.params.id, { $inc: { usageCount: 1 } }).catch(console.error);
    sendSigningEmail(pts[0], doc, firstToken, template.brandConfig || {}).catch(console.error);
    res.json({ success: true, documentId: doc._id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 8. Bulk use template ──────────────────────────────────────────────────
router.post('/templates/:id/use-bulk', auth, async (req, res) => {
  try {
    const template = await Document.findOne({ _id: req.params.id, isTemplate: true });
    if (!template) return res.status(404).json({ success: false, error: 'Template not found' });

    const { employees, ccEmails, title } = req.body;
    if (!employees?.length) return res.status(400).json({ success: false, error: 'No employees provided' });

    const brand = template.brandConfig || {};
    res.json({ success: true, total: employees.length, message: 'Bulk send started' });

    // Process in background after response
    (async () => {
      let created = 0;
      for (const emp of employees) {
        try {
          if (!emp.name || !emp.email) continue;
          const tok = crypto.randomBytes(32).toString('hex');
          const doc = await Document.create({
            title:      title || template.title,
            fileUrl:    template.fileUrl,
            fileId:     template.fileId,
            parties:    [{ name: emp.name, email: emp.email.toLowerCase(), status: 'sent', token: tok }],
            ccEmails:   (ccEmails || []).map(e => e.toLowerCase().trim()),
            fields:     template.fields,
            totalPages: template.totalPages,
            status:     'in_progress',
            isTemplate: false,
            brandConfig: brand,
            owner:      req.user.id,
            senderMeta: { name: req.user.full_name, email: req.user.email },
          });
          await sendSigningEmail({ name: emp.name, email: emp.email }, doc, tok, brand);
          created++;
        } catch { /* continue */ }
      }
      Document.findByIdAndUpdate(req.params.id, { $inc: { usageCount: created } }).catch(console.error);
    })().catch(console.error);

  } catch (err) {
    if (!res.headersSent) res.status(500).json({ success: false, error: err.message });
  }
});

// ── 9. Template usage history ─────────────────────────────────────────────
router.get('/templates/:id/usage', auth, async (req, res) => {
  try {
    const template = await Document.findById(req.params.id).lean();
    if (!template) return res.status(404).json({ success: false, error: 'Not found' });
    const usage = await Document.find({ fileId: template.fileId, isTemplate: false })
      .select('title status parties createdAt updatedAt')
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    res.json({ success: true, usage });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 10. Publish draft as template ─────────────────────────────────────────
router.post('/templates/:id/publish', auth, async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, owner: req.user.id });
    if (!doc) return res.status(404).json({ success: false, error: 'Not found' });
    doc.isTemplate = true;
    doc.status     = 'draft';
    await doc.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 11. Audit trail ───────────────────────────────────────────────────────
router.get('/:id/audit', auth, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, error: 'Not found' });
    const isOwner = doc.owner?.toString() === req.user.id;
    const isParty = doc.parties.some(p => p.email === req.user.email);
    if (!isOwner && !isParty) return res.status(403).json({ success: false, error: 'Unauthorized' });

    const logs = await AuditLog.find({ document_id: doc._id }).sort({ timestamp: 1 }).lean();
    res.json({
      success: true,
      audit: {
        title:   doc.title,
        status:  doc.status,
        parties: doc.parties,
        events:  logs.map(l => ({
          eventType:  l.action,
          actorName:  l.performed_by?.name  || 'System',
          actorEmail: l.performed_by?.email || '',
          actorRole:  l.performed_by?.role  || 'system',
          ipAddress:  l.ip_address || '',
          occurredAt: l.timestamp,
          meta:       l.details || null,
        })),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 12. Single document ───────────────────────────────────────────────────
router.get('/:id', auth, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    const isOwner = doc.owner?.toString() === req.user.id;
    const isParty = doc.parties.some(p => p.email === req.user.email);
    if (!isOwner && !isParty) return res.status(403).json({ success: false, message: 'Unauthorized' });
    res.json({ success: true, document: doc });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── 13. Delete document ───────────────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false });
    const ok = doc.owner?.toString() === req.user.id ||
               ['admin', 'super_admin'].includes(req.user.role);
    if (!ok) return res.status(403).json({ success: false });
    await Document.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;