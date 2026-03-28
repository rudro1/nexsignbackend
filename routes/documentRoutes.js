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

const express      = require('express');
const router       = express.Router();
const multer       = require('multer');
const crypto       = require('crypto');
const { Readable } = require('stream'); // ✅ Top-level import
const { v2: cloudinary } = require('cloudinary');
const Document     = require('../models/Document');
const AuditLog     = require('../models/AuditLog');
const auth         = require('../middleware/auth');
const {
  mergeSignaturesIntoPDF,
  appendAuditPage,
} = require('../utils/pdfService');
const {
  sendSigningEmail,
  sendCompletionEmail,
  sendCCEmail,
} = require('../utils/emailService');

// ── Cloudinary Config ────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Fix 1: fileFilter সরানো হয়েছে — এটি valid PDF কেও
// reject করতো কারণ কিছু browser 'application/octet-stream'
// পাঠায় PDF এর জন্য। Manual check নিচে করা হয়েছে।
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 20 * 1024 * 1024 },
});

const logoUpload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 },
});

// ── Helpers ──────────────────────────────────────────────────────
const genToken = () => crypto.randomBytes(32).toString('hex');

// ✅ Fix 2: safeParse — JSON.parse crash prevent করে
const safeParse = (data, fallback) => {
  try {
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
};

const uploadToCloudinary = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      options,
      (err, res) => (err ? reject(err) : resolve(res))
    );
    stream.end(buffer);
  });

const logEvent = async (docId, action, performer, extras = {}) => {
  try {
    await AuditLog.create({
      document_id:  docId,
      action,
      performed_by: performer,
      timestamp:    new Date(),
      ...extras,
    });
  } catch (e) {
    console.error('AuditLog error:', e.message);
  }
};

const FRONT = () =>
  (process.env.FRONTEND_URL || 'https://nexsignfrontend.vercel.app')
    .replace(/\/$/, '');
// Field normalize helper — সব জায়গায় use করো
const normalizeField = (f) => {
  const field = typeof f === 'string' ? JSON.parse(f) : f;
  return {
    id:         field.id,
    type:       field.type,
    page:       Number(field.page)       || 1,
    x:          Number(field.x)          || 0,
    y:          Number(field.y)          || 0,
    width:      Number(field.width)      || 200,
    height:     Number(field.height)     || 60,
    partyIndex: Number(field.partyIndex) || 0,
    value:      field.value              || '',
    fontFamily: field.fontFamily         || 'Helvetica',
    fontSize:   Number(field.fontSize)   || 14,
  };
};
// ════════════════════════════════════════════════════════════════
// PROXY — সবার আগে থাকতে হবে /:id routes এর আগে
// ════════════════════════════════════════════════════════════════
router.get('/proxy/:path(*)', async (req, res) => {
  try {
    const cloudPath = req.params.path
      .replace(/~~/g, '/')
      .split('?')[0];

    const url =
      `https://res.cloudinary.com/` +
      `${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${cloudPath}`;

    const response = await fetch(url, {
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) return res.status(404).send('Not found');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // ✅ Fix 3: Readable এখন top-level এ import করা
    Readable.fromWeb(response.body).pipe(res);
  } catch (err) {
    console.error('Proxy error:', err.message);
    res.status(500).send('Proxy error');
  }
});

// ════════════════════════════════════════════════════════════════
// LOGO UPLOAD
// ════════════════════════════════════════════════════════════════
router.post(
  '/upload-logo',
  auth,
  logoUpload.single('logo'),
  async (req, res) => {
    try {
      if (!req.file)
        return res
          .status(400)
          .json({ success: false, message: 'No image provided.' });

      // ✅ Fix 5: Manual mimetype check
      if (!req.file.mimetype.startsWith('image/'))
        return res
          .status(400)
          .json({ success: false, message: 'Only image files allowed.' });

      const result = await uploadToCloudinary(req.file.buffer, {
        folder:         'nexsign_logos',
        resource_type:  'image',
        transformation: [
          { width: 400, height: 200, crop: 'limit', quality: 'auto' },
        ],
      });

      res.json({ success: true, logoUrl: result.secure_url });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ════════════════════════════════════════════════════════════════
// UPLOAD & SEND
// ════════════════════════════════════════════════════════════════
router.post(
  '/upload-and-send',
  auth,
  upload.single('file'),
  async (req, res) => {
    try {
      const {
        title,
        parties:      partiesRaw,
        ccRecipients: ccRaw,
        fields:       fieldsRaw,
        totalPages,
        companyLogo,
        companyName,
      } = req.body;

      if (!req.file && !req.body.fileUrl)
        return res
          .status(400)
          .json({ success: false, message: 'No PDF provided.' });

      // ✅ Manual PDF check
      if (req.file && req.file.mimetype !== 'application/pdf')
        return res
          .status(400)
          .json({ success: false, message: 'Only PDF files allowed.' });

      let fileUrl, fileId;
      if (req.file) {
        const up = await uploadToCloudinary(req.file.buffer, {
          resource_type: 'raw',
          folder:        'nexsign_docs',
        });
        fileUrl = up.secure_url;
        fileId  = up.public_id;
      } else {
        fileUrl = req.body.fileUrl;
        fileId  = '';
      }

      // ✅ Fix 2: safeParse ব্যবহার
      const parties = safeParse(partiesRaw, []);
      const ccList  = safeParse(ccRaw, []);
      const fields  = safeParse(fieldsRaw, []);

      // ✅ Fix 4: Validation আগে
      if (!parties.length)
        return res.status(400).json({
          success: false,
          message: 'At least one party required.',
        });

      const COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981'];

      const partiesWithTokens = parties.map((p, i) => ({
        ...p,
        status: 'pending',
        token:  genToken(),
        color:  p.color || COLORS[i % COLORS.length],
      }));

      const doc = await Document.create({
        owner:        req.user.id,
        title:        title || 'Untitled',
        companyLogo:  companyLogo || '',
        companyName:  companyName || '',
        fileUrl,
        fileId:       fileId || '',
        parties:      partiesWithTokens,
        ccList,
        fields,
        totalPages:   Number(totalPages) || 1,
        status:       'in_progress',
        workflowType: 'sequential',
      });

      // ✅ Optimistic response — email এর জন্য অপেক্ষা নেই
      res.json({ success: true, documentId: doc._id });

      setImmediate(async () => {
        try {
          const first = doc.parties[0];
          if (first) {
            const link = `${FRONT()}/sign/${first.token}`;
            await sendSigningEmail({
              recipientEmail: first.email,
              recipientName:  first.name,
              senderName:     req.user.full_name,
              documentTitle:  doc.title,
              signingLink:    link,
              companyLogoUrl: doc.companyLogo,
              companyName:    doc.companyName,
              partyNumber:    1,
              totalParties:   doc.parties.length,
            });
            doc.parties[0].status      = 'sent';
            doc.parties[0].emailSentAt = new Date();
            await doc.save();
          }

          for (const cc of doc.ccList) {
            await sendCCEmail({
              recipientEmail: cc.email,
              recipientName:  cc.name || '',
              documentTitle:  doc.title,
              senderName:     req.user.full_name,
              companyLogoUrl: doc.companyLogo,
              companyName:    doc.companyName,
            }).catch(e => console.error('CC email error:', e.message));
          }

          const exists = await Document.findOne({
            owner:        doc.owner,
            isTemplate:   true,
            templateName: doc.title,
          });
          if (!exists) {
            await Document.create({
              owner:        doc.owner,
              title:        doc.title,
              templateName: doc.title,
              companyLogo:  doc.companyLogo,
              companyName:  doc.companyName,
              fileUrl:      doc.fileUrl,
              fileId:       doc.fileId,
              fields:       doc.fields,
              parties:      doc.parties.map(p => ({
                name:  p.name,
                email: p.email,
                color: p.color,
              })),
              ccList:       doc.ccList,
              isTemplate:   true,
              status:       'draft',
              workflowType: 'sequential',
            });
          }

          await logEvent(doc._id, 'sent', {
            name:  req.user.full_name,
            email: req.user.email,
            role:  'owner',
          });
        } catch (bgErr) {
          console.error('Background send error:', bgErr.message);
        }
      });
    } catch (err) {
      console.error('upload-and-send error:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ════════════════════════════════════════════════════════════════
// SIGN SUBMIT — /sign/:token এর আগে থাকতে হবে
// ════════════════════════════════════════════════════════════════
router.post('/sign/submit', async (req, res) => {
  try {
    const {
      token,
      fields: signedFields = [],
      locationData,
      clientTime,
    } = req.body;

    // if (!token)
    //   return res.status(400).json({ error: 'Token required.' });

    // const doc = await Document.findOne({ 'parties.token': token });

    // ✅ নতুন — validation আগে
if (!token)
  return res.status(400).json({ error: 'Token required.' });

// ✅ ADD: fields validate করো
if (!Array.isArray(signedFields) || signedFields.length === 0)
  return res.status(400).json({ error: 'No signed fields provided.' });

for (const f of signedFields) {
  if (!f.id || !f.type || f.page == null || f.x == null || f.y == null) {
    return res.status(400).json({
      error: `Invalid field: id=${f.id} type=${f.type} page=${f.page} x=${f.x} y=${f.y}`,
    });
  }
}

const doc = await Document.findOne({ 'parties.token': token });
    if (!doc)
      return res.status(404).json({ error: 'Invalid token.' });

    const idx    = doc.parties.findIndex(p => p.token === token);
    const signer = doc.parties[idx];
    if (!signer)
      return res.status(404).json({ error: 'Signer not found.' });

    const signerIp =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      'Unknown';

    signer.status     = 'signed';
    signer.signedAt   = new Date();
    signer.ip         = signerIp;
    signer.postalCode = locationData?.postalCode || locationData?.postal || '';
    signer.address    = locationData?.text || locationData?.city || '';
    signer.location   = locationData?.text || '';
    signer.clientTime = clientTime || new Date().toISOString();
    signer.userAgent  = req.headers['user-agent'] || '';
    signer.token      = undefined;

    // for (const sf of signedFields) {
    //   const fi = doc.fields.findIndex(f => {
    //     const fo = typeof f === 'string' ? JSON.parse(f) : f;
    //     return fo.id === sf.id;
    //   });
    //   if (fi !== -1) {
    //     const existing =
    //       typeof doc.fields[fi] === 'string'
    //         ? JSON.parse(doc.fields[fi])
    //         : { ...doc.fields[fi] };
    //     doc.fields[fi] = { ...existing, value: sf.value };
    //   }
    // }
// ✅ নতুন
for (const sf of signedFields) {
  const fi = doc.fields.findIndex(f => {
    const fo = typeof f === 'string' ? JSON.parse(f) : f;
    return fo.id === sf.id;
  });
  if (fi !== -1) {
    const existing = normalizeField(doc.fields[fi]);
    doc.fields[fi] = { ...existing, value: sf.value || '' };
  }
}
    doc.markModified('fields');
    doc.markModified('parties');

    if (doc.isTemplate && idx === 0) {
      doc.isParty1Signed = true;
    }

    await doc.save();
    res.json({ success: true, message: 'Signature recorded.' });

    setImmediate(async () => {
      try {
        await logEvent(
          doc._id,
          'signed',
          { name: signer.name, email: signer.email, role: 'signer' },
          {
            ip_address:  signerIp,
            postal_code: signer.postalCode,
            location:    signer.location,
            client_time: signer.clientTime,
            details:     `Party ${idx + 1} signed`,
          }
        );

        if (doc.isTemplate && idx === 0) {
          console.log(`Template ${doc._id}: Party 1 signed.`);
          return;
        }

        const allSigned = doc.parties.every(p => p.status === 'signed');

        if (!allSigned && doc.workflowType === 'sequential') {
          const nextParty = doc.parties.find(p => p.status !== 'signed');
          if (nextParty) {
            nextParty.token       = genToken();
            nextParty.status      = 'sent';
            nextParty.emailSentAt = new Date();
            await doc.save();

            const nextIdx  = doc.parties.findIndex(
              p => p.token === nextParty.token
            );
            const signLink = `${FRONT()}/sign/${nextParty.token}`;

            await sendSigningEmail({
              recipientEmail: nextParty.email,
              recipientName:  nextParty.name,
              senderName:     'NeXsign',
              documentTitle:  doc.title,
              signingLink:    signLink,
              companyLogoUrl: doc.companyLogo,
              companyName:    doc.companyName,
              partyNumber:    nextIdx + 1,
              totalParties:   doc.parties.length,
            });
          }
        } else if (allSigned) {

  const freshDoc = await Document.findById(doc._id);
  if (!freshDoc) return;

  let finalBytes = await mergeSignaturesIntoPDF(freshDoc.fileUrl, freshDoc.fields);
  finalBytes     = await appendAuditPage(finalBytes, freshDoc);

  const uploaded = await uploadToCloudinary(
    Buffer.from(finalBytes),
    {
      resource_type: 'raw',
      folder:        'nexsign_signed',
      public_id:     `signed_${freshDoc._id}_${Date.now()}`,
      overwrite:     true,
    }
  );

  freshDoc.signedFileUrl = uploaded.secure_url;
  freshDoc.status        = 'completed';
  freshDoc.fields        = freshDoc.fields.map(f => {
    const field = normalizeField(f);
    if (field.type === 'signature' && field.value?.startsWith('data:'))
      field.value = '[SIGNED]';
    return field;
  });
  freshDoc.markModified('fields');
  await freshDoc.save();

  for (const r of [...freshDoc.parties, ...(freshDoc.ccList || [])]) {
    await sendCompletionEmail({
      recipientEmail: r.email,
      recipientName:  r.name,
      documentTitle:  freshDoc.title,
      signedPdfUrl:   freshDoc.signedFileUrl,
      companyLogoUrl: freshDoc.companyLogo,
      companyName:    freshDoc.companyName,
      auditParties:   freshDoc.parties,
    }).catch(e => console.error(`Completion email ${r.email}:`, e.message));
  }

  await logEvent(
    freshDoc._id, 'completed',
    { name: 'System', email: 'system@nexsign.app', role: 'system' },
    { details: 'All signed. Final PDF generated.' }
  );
}

      } catch (bgErr) {
        console.error('Submit background error:', bgErr.message);
      }
    });
  } catch (err) {
    console.error('sign/submit error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
// GET SIGNING PAGE — /sign/submit এর পরে
// ════════════════════════════════════════════════════════════════
router.get('/sign/:token', async (req, res) => {
  try {
    const { token } = req.params;

    if (token === 'submit')
      return res.status(400).json({ error: 'Invalid token.' });

    const doc = await Document.findOne({
      'parties.token': token,
    }).lean();

    if (!doc)
      return res.status(404).json({ error: 'Invalid link.' });

    const partyIndex = doc.parties.findIndex(p => p.token === token);
    const party      = doc.parties[partyIndex];

    if (!party)
      return res.status(404).json({ error: 'Party not found.' });

    if (party.status === 'signed')
      return res.status(410).json({
        error: 'You have already signed this document.',
      });

    Document.updateOne(
      { _id: doc._id, 'parties.token': token },
      {
        $inc: { 'parties.$.linkOpenCount': 1 },
        $set: {
          'parties.$.linkOpenedAt':     new Date(),
          'parties.$.lastLinkOpenedAt': new Date(),
        },
      }
    ).catch(() => {});

    logEvent(
      doc._id,
      'opened',
      { name: party.name, email: party.email, role: 'signer' },
      {
        ip_address:
          req.headers['x-forwarded-for']?.split(',')[0] || '',
      }
    );

   // ✅ নতুন
const formattedFields = doc.fields.map(f => {
  const field = normalizeField(f);
  return {
    ...field,
    value: Number(field.partyIndex) === partyIndex ? '' : field.value || '',
  };
});

    res.json({
      success:      true,
      fileUrl:      doc.fileUrl,
      title:        doc.title,
      companyLogo:  doc.companyLogo,
      companyName:  doc.companyName,
      fields:       formattedFields,
      partyIndex,
      party:        { name: party.name, email: party.email },
      workflowType: doc.workflowType,
      totalParties: doc.parties.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
// TEMPLATES — CREATE
// ════════════════════════════════════════════════════════════════
router.post(
  '/templates',
  auth,
  upload.single('file'),
  async (req, res) => {
    try {
      // ✅ File check সবার আগে
      if (!req.file)
        return res
          .status(400)
          .json({ success: false, message: 'PDF file required.' });

      // ✅ Manual PDF mimetype check
      if (req.file.mimetype !== 'application/pdf')
        return res
          .status(400)
          .json({ success: false, message: 'Only PDF files allowed.' });

      const {
        title,
        fields:      fieldsRaw,
        companyLogo,
        companyName,
        party1:      party1Raw,
        ccList:      ccRaw,
      } = req.body;

      // ✅ Fix 2: safeParse দিয়ে safe parsing
   const fields = safeParse(req.body.fields, []).map(normalizeField);
      const parsedParty1 = safeParse(party1Raw, null);
      const ccList       = safeParse(ccRaw, []);

      const up = await uploadToCloudinary(req.file.buffer, {
        resource_type: 'raw',
        folder:        'nexsign_templates',
      });

      const doc = await Document.create({
        owner:          req.user.id,
        title:          title || 'Untitled Template',
        templateName:   title || 'Untitled Template',
        companyLogo:    companyLogo || '',
        companyName:    companyName || '',
        fileUrl:        up.secure_url,
        fileId:         up.public_id,
        fields,
        // ✅ Fix token + color সহ party তৈরি
        parties: parsedParty1
          ? [
              {
                name:   parsedParty1.name  || req.user.full_name,
                email:  parsedParty1.email || req.user.email,
                status: 'pending',
                token:  genToken(),
                color:  '#0ea5e9',
              },
            ]
          : [],
        ccList,
        isTemplate:     true,
        isParty1Signed: false,
        status:         'draft',
        workflowType:   'sequential',
      });

      // ✅ Optimistic response
      res.json({ success: true, template: doc });

      if (parsedParty1 && doc.parties[0]) {
        setImmediate(async () => {
          const link = `${FRONT()}/sign/${doc.parties[0].token}`;
          await sendSigningEmail({
            recipientEmail: doc.parties[0].email,
            recipientName:  doc.parties[0].name,
            senderName:     req.user.full_name,
            documentTitle:  doc.title,
            signingLink:    link,
            companyLogoUrl: doc.companyLogo,
            companyName:    doc.companyName,
            partyNumber:    1,
            totalParties:   1,
            message:
              'Please sign this template as the authorizing party.',
          }).catch(e =>
            console.error('Party1 template email:', e.message)
          );

          doc.parties[0].status      = 'sent';
          doc.parties[0].emailSentAt = new Date();
          await doc.save();
        });
      }
    } catch (err) {
      console.error('Template create error:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ════════════════════════════════════════════════════════════════
// TEMPLATES — LIST
// ════════════════════════════════════════════════════════════════
router.get('/templates', auth, async (req, res) => {
  try {
    const templates = await Document.find({
      owner:      req.user.id,
      isTemplate: true,
    })
      .select(
        'title templateName companyLogo companyName ' +
          'fields parties ccList isParty1Signed ' +
          'usageCount createdAt updatedAt'
      )
      .sort({ updatedAt: -1 })
      .lean();

    res.json({ success: true, templates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
// TEMPLATES — USE (Single Signer)
// ════════════════════════════════════════════════════════════════
router.post('/templates/:id/use', auth, async (req, res) => {
  try {
    const template = await Document.findOne({
      _id:        req.params.id,
      owner:      req.user.id,
      isTemplate: true,
    }).lean();

    if (!template)
      return res
        .status(404)
        .json({ success: false, message: 'Template not found.' });

    const { signers = [], ccList = [] } = req.body;

    if (!signers.length)
      return res.status(400).json({
        success: false,
        message: 'At least one signer required.',
      });

    // ✅ Optimistic response
    res.json({
      success: true,
      message: `Sending to ${signers.length} signer(s)...`,
    });

    setImmediate(async () => {
      const party1 = template.parties?.[0];

      for (const signer of signers) {
        try {
          const instanceFields = template.fields.map(f => ({
            ...f,
            value: Number(f.partyIndex) === 0 ? f.value || '' : '',
          }));

          const instanceParties = [
            ...(party1
              ? [
                  {
                    name:     party1.name,
                    email:    party1.email,
                    status:   'signed',
                    signedAt:
                      template.parties[0]?.signedAt || new Date(),
                    color: '#0ea5e9',
                  },
                ]
              : []),
            {
              name:   signer.name,
              email:  signer.email,
              status: 'pending',
              token:  genToken(),
              color:  '#8b5cf6',
            },
          ];

          const instance = await Document.create({
            owner:            template.owner,
            title:            template.title,
            companyLogo:      template.companyLogo,
            companyName:      template.companyName,
            fileUrl:          template.fileUrl,
            fileId:           template.fileId,
            fields:           instanceFields,
            parties:          instanceParties,
            ccList:           ccList.length ? ccList : template.ccList,
            isTemplate:       false,
            sourceTemplateId: template._id,
            status:           'in_progress',
            workflowType:     'template_instance',
            totalPages:       template.totalPages,
          });

          await Document.updateOne(
            { _id: template._id },
            { $inc: { usageCount: 1 } }
          );

          const signerParty = instance.parties.find(
            p => p.email === signer.email
          );
          if (signerParty?.token) {
            const link = `${FRONT()}/sign/${signerParty.token}`;
            await sendSigningEmail({
              recipientEmail: signer.email,
              recipientName:  signer.name,
              senderName:     req.user.full_name,
              documentTitle:  instance.title,
              signingLink:    link,
              companyLogoUrl: instance.companyLogo,
              companyName:    instance.companyName,
              partyNumber:    2,
              totalParties:   2,
            });
            signerParty.status      = 'sent';
            signerParty.emailSentAt = new Date();
            await instance.save();
          }

          for (const cc of instance.ccList || []) {
            await sendCCEmail({
              recipientEmail: cc.email,
              recipientName:  cc.name || '',
              documentTitle:  instance.title,
              senderName:     req.user.full_name,
              companyLogoUrl: instance.companyLogo,
              companyName:    instance.companyName,
            }).catch(e => console.error('CC error:', e.message));
          }
        } catch (signerErr) {
          console.error(
            `Error for signer ${signer.email}:`,
            signerErr.message
          );
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
// TEMPLATES — BULK SEND
// ════════════════════════════════════════════════════════════════
router.post('/templates/:id/use-bulk', auth, async (req, res) => {
  try {
    const template = await Document.findOne({
      _id:        req.params.id,
      owner:      req.user.id,
      isTemplate: true,
    }).lean();

    if (!template)
      return res
        .status(404)
        .json({ success: false, message: 'Template not found.' });

    const { employees = [], ccList = [] } = req.body;

    if (!employees.length)
      return res
        .status(400)
        .json({ success: false, message: 'No employees provided.' });

    // ✅ Optimistic response
    res.json({
      success: true,
      total:   employees.length,
      message: 'Bulk send started.',
    });

    setImmediate(async () => {
      const party1  = template.parties?.[0];
      let   created = 0;

      for (const emp of employees) {
        try {
          const instanceFields = template.fields.map(f => ({
            ...f,
            value: Number(f.partyIndex) === 0 ? f.value || '' : '',
          }));

          const instanceParties = [
            ...(party1
              ? [
                  {
                    name:     party1.name,
                    email:    party1.email,
                    status:   'signed',
                    signedAt: new Date(),
                    color:    '#0ea5e9',
                  },
                ]
              : []),
            {
              name:   emp.name,
              email:  emp.email,
              status: 'pending',
              token:  genToken(),
              color:  '#8b5cf6',
            },
          ];

          const instance = await Document.create({
            owner:            template.owner,
            title:            template.title,
            companyLogo:      template.companyLogo,
            companyName:      template.companyName,
            fileUrl:          template.fileUrl,
            fileId:           template.fileId,
            fields:           instanceFields,
            parties:          instanceParties,
            ccList:           ccList.length ? ccList : template.ccList,
            isTemplate:       false,
            sourceTemplateId: template._id,
            status:           'in_progress',
            workflowType:     'template_instance',
            totalPages:       template.totalPages,
          });

          await Document.updateOne(
            { _id: template._id },
            { $inc: { usageCount: 1 } }
          );

          const sp = instance.parties.find(p => p.email === emp.email);
          if (sp?.token) {
            const link = `${FRONT()}/sign/${sp.token}`;
            await sendSigningEmail({
              recipientEmail: emp.email,
              recipientName:  emp.name,
              senderName:     'NeXsign',
              documentTitle:  instance.title,
              signingLink:    link,
              companyLogoUrl: instance.companyLogo,
              companyName:    instance.companyName,
              partyNumber:    2,
              totalParties:   2,
            });
            sp.status      = 'sent';
            sp.emailSentAt = new Date();
            await instance.save();
          }
          created++;
        } catch (empErr) {
          console.error(`Bulk error ${emp.email}:`, empErr.message);
        }
      }
      console.log(`Bulk complete: ${created}/${employees.length}`);
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
// TEMPLATES — USAGE HISTORY
// ════════════════════════════════════════════════════════════════
router.get('/templates/:id/usage', auth, async (req, res) => {
  try {
    const instances = await Document.find({
      sourceTemplateId: req.params.id,
      owner:            req.user.id,
    })
      .select(
        'title status parties.name parties.email ' +
          'parties.status parties.signedAt ' +
          'createdAt signedFileUrl'
      )
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json({ success: true, usage: instances });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
// DASHBOARD LIST
// ════════════════════════════════════════════════════════════════
router.get('/', auth, async (req, res) => {
  try {
     const page      = parseInt(req.query.page)  || 1;
    const limit     = parseInt(req.query.limit) || 6;
    const skip      = (page - 1) * limit;
    const baseQuery = { owner: req.user.id, isTemplate: false }; // ✅ ADD
    const query     = { ...baseQuery };                           // ✅ CHANGE

    if (req.query.status && req.query.status !== 'all')
      query.status = req.query.status;

    // const [documents, total] = await Promise.all([
    //   Document.find(query)
    //     .select('-fields')
    //     .sort({ updatedAt: -1 })
    //     .skip(skip)
    //     .limit(limit)
    //     .lean(),
    //   Document.countDocuments(query),
    // ]);

   // ✅ নতুন — stats সহ
const [documents, total, inProgress, completed, templates, totalAll] =
  await Promise.all([
    Document.find(query).select('-fields').sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
    Document.countDocuments(query),
    Document.countDocuments({ owner: req.user.id, isTemplate: false, status: 'in_progress' }),
    Document.countDocuments({ owner: req.user.id, isTemplate: false, status: 'completed' }),
    Document.countDocuments({ owner: req.user.id, isTemplate: true }),
    Document.countDocuments(baseQuery),
  ]);

res.json({
  success: true,
  documents,
  total,
  hasMore: total > skip + documents.length,
  stats: { total: totalAll, inProgress, completed, templates },
});
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


router.post('/resend/:id', auth, async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, owner: req.user.id });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found.' });
    if (doc.status !== 'in_progress')
      return res.status(400).json({ success: false, message: 'Not in progress.' });

    const pending = doc.parties.find(p => p.status !== 'signed');
    if (!pending) return res.status(400).json({ success: false, message: 'No pending signers.' });

    if (!pending.token) { pending.token = genToken(); await doc.save(); }

    await sendSigningEmail({
      recipientEmail: pending.email,
      recipientName:  pending.name,
      senderName:     req.user.full_name,
      documentTitle:  doc.title,
      signingLink:    `${FRONT()}/sign/${pending.token}`,
      companyLogoUrl: doc.companyLogo,
      companyName:    doc.companyName,
      partyNumber:    doc.parties.findIndex(p => p.email === pending.email) + 1,
      totalParties:   doc.parties.length,
    });

    res.json({ success: true, message: 'Email resent.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
// ════════════════════════════════════════════════════════════════
// GET SINGLE DOCUMENT

// ════════════════════════════════════════════════════════════════
router.get('/:id', auth, async (req, res) => {
  try {
    const doc = await Document.findOne({
      _id:   req.params.id,
      owner: req.user.id,
    })
      .populate('owner', 'full_name email')
      .lean();

    if (!doc)
      return res
        .status(404)
        .json({ success: false, message: 'Not found.' });

    res.json({ success: true, document: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
// UPDATE DOCUMENT
// ════════════════════════════════════════════════════════════════
router.put('/:id', auth, async (req, res) => {
  try {
    const allowed = [
      'title', 'fields', 'parties',
      'ccList', 'companyLogo', 'companyName', 'status',
    ];
    const updates = {};
    allowed.forEach(k => {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    });

    const doc = await Document.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!doc)
      return res
        .status(404)
        .json({ success: false, message: 'Not found.' });

    res.json({ success: true, document: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ════════════════════════════════════════════════════════════════
// DELETE DOCUMENT
// ════════════════════════════════════════════════════════════════
router.delete('/:id', auth, async (req, res) => {
  try {
    const doc = await Document.findOneAndDelete({
      _id:   req.params.id,
      owner: req.user.id,
    });

    if (!doc)
      return res
        .status(404)
        .json({ success: false, message: 'Not found.' });

    AuditLog.deleteMany({ document_id: doc._id }).catch(() => {});
    res.json({ success: true, message: 'Deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
// AUDIT LOG
// ════════════════════════════════════════════════════════════════
router.get('/:id/audit', auth, async (req, res) => {
  try {
    const doc = await Document.findOne({
      _id:   req.params.id,
      owner: req.user.id,
    }).lean();

    if (!doc)
      return res
        .status(404)
        .json({ success: false, message: 'Not found.' });

    const logs = await AuditLog.find({
      document_id: req.params.id,
    })
      .sort({ timestamp: 1 })
      .lean();

    res.json({
      success: true,
      audit: {
        _id:     doc._id,
        title:   doc.title,
        status:  doc.status,
        parties: doc.parties,
        ccList:  doc.ccList || [],
        events:  logs.map(l => ({
          eventType:  l.action,
          actorName:  l.performed_by?.name,
          actorEmail: l.performed_by?.email,
          ipAddress:  l.ip_address,
          location:   l.location,
          postalCode: l.postal_code,
          clientTime: l.client_time,
          occurredAt: l.timestamp,
        })),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;