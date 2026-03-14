// const express = require('express');
// const router = express.Router();
// const Document = require('../models/Document');
// const AuditLog = require('../models/AuditLog');
// const crypto = require('crypto');
// const nodemailer = require('nodemailer');

// // ১. ড্রাফট সেভ বা আপডেট (Save/Update Draft)
// router.post('/', async (req, res) => {
//   try {
//     let doc;
//     if (req.body.id || req.body._id) {
//       doc = await Document.findByIdAndUpdate(req.body.id || req.body._id, req.body, { new: true });
//     } else {
//       doc = new Document(req.body);
//       await doc.save();
      
//       // অডিট লগ তৈরি
//       await AuditLog.create({
//         document_id: doc._id,
//         action: 'created',
//         details: `Document "${doc.title}" created.`
//       });
//     }
//     res.json(doc);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ২. মেইল পাঠানো ও সাইনিং শুরু (Send for Signing)
// router.post('/send', async (req, res) => {
//   try {
//     const { title, file_url, parties, fields, total_pages } = req.body;
    
//     // প্রথম সাইনারের জন্য টোকেন
//     const token = crypto.randomBytes(32).toString('hex');
    
//     const updatedParties = parties.map((p, i) => ({
//       ...p,
//       status: i === 0 ? 'sent' : 'pending',
//       order: i,
//       token: i === 0 ? token : null // ডাটাবেসে টোকেন সেভ রাখা
//     }));

//     const newDoc = await Document.create({
//       title,
//       file_url,
//       parties: updatedParties,
//       fields,
//       total_pages,
//       status: 'in_progress',
//       current_party_index: 0
//     });

//     // অডিট লগ: সেন্ড অ্যাকশন
//     await AuditLog.create({
//       document_id: newDoc._id,
//       action: 'sent',
//       party_name: updatedParties[0].name,
//       party_email: updatedParties[0].email,
//       details: `Sent to ${updatedParties[0].name} for signing.`
//     });

//     // Nodemailer ইমেইল ট্রান্সপোর্টার
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
//     });

//     const signLink = `${process.env.FRONTEND_URL}/sign?token=${token}`;

//     await transporter.sendMail({
//       from: '"Nexsign" <no-reply@nexsign.com>',
//       to: updatedParties[0].email,
//       subject: `Please sign: ${title}`,
//       html: `
//         <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
//           <h2>Nexsign Document Signature Request</h2>
//           <p>Hi ${updatedParties[0].name}, you are requested to sign <b>${title}</b>.</p>
//           <a href="${signLink}" style="background:#0ea5e9; color:white; padding:12px 25px; text-decoration:none; border-radius:8px; display:inline-block; margin-top:10px;">Review & Sign</a>
//         </div>
//       `
//     });

//     res.json({ success: true, docId: newDoc._id });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;
// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const axios = require('axios');
// const { v2: cloudinary } = require('cloudinary');
// const crypto = require('crypto');
// const nodemailer = require('nodemailer');
// const Document = require('../models/Document');

// // ১. Nodemailer কনফিগারেশন
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// const sendSigningEmail = async (party, docTitle, token) => {
//   const signLink = `http://localhost:5173/sign?token=${token}`;
//   const mailOptions = {
//     from: `"NexSign" <${process.env.EMAIL_USER}>`,
//     to: party.email,
//     subject: `Signature Request: ${docTitle}`,
//     html: `
//       <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
//         <h2 style="color: #0ea5e9;">Hello ${party.name},</h2>
//         <p>You have a document waiting for your signature on <strong>NexSign</strong>.</p>
//         <p><strong>Document:</strong> ${docTitle}</p>
//         <div style="margin: 25px 0;">
//           <a href="${signLink}" style="padding: 12px 24px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Sign Document Now</a>
//         </div>
//       </div>
//     `,
//   };
//   return transporter.sendMail(mailOptions);
// };

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const upload = multer({ storage: multer.memoryStorage() });

// // ২. ফাইল আপলোড
// router.post('/upload', upload.single('file'), async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ error: "No file provided" });
//     const result = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream(
//         { resource_type: "raw", folder: "nexsign_docs" },
//         (error, result) => (error ? reject(error) : resolve(result))
//       );
//       stream.end(req.file.buffer);
//     });

//     const newDoc = new Document({
//       title: req.file.originalname.replace('.pdf', ''),
//       fileUrl: result.secure_url,
//       fileId: result.public_id,
//       status: 'draft',
//       parties: [],
//       fields: []
//     });
//     await newDoc.save();
//     res.json(newDoc);
//   } catch (err) { res.status(500).json({ error: "Upload failed" }); }
// });

// // ৩. আইডি দিয়ে ডকুমেন্ট খোঁজা
// router.get('/:id', async (req, res) => {
//   try {
//     const doc = await Document.findById(req.params.id);
//     if (!doc) return res.status(404).json({ error: "Document not found" });
//     res.json(doc);
//   } catch (err) { res.status(500).json({ error: "Database error" }); }
// });

// // ৪. সেভ বা আপডেট (PUT) - এটি আপনার 500 Error ফিক্স করবে
// router.put('/:id', async (req, res) => {
//   try {
//     const { fields, parties, title } = req.body;
    
//     // Naming mismatch fix: partyIndex (Frontend) -> party_index (Model)
//     const formattedFields = fields?.map(f => ({
//       ...f,
//       party_index: f.partyIndex !== undefined ? f.partyIndex : f.party_index
//     }));

//     const updatedDoc = await Document.findByIdAndUpdate(
//       req.params.id,
//       { 
//         $set: { 
//           fields: formattedFields || [], 
//           parties: parties || [], 
//           title: title 
//         } 
//       },
//       { new: true, runValidators: false } // Required fields এরর এড়াতে validators false করা হয়েছে
//     );

//     if (!updatedDoc) return res.status(404).json({ error: "Document not found" });
//     res.json(updatedDoc);
//   } catch (err) {
//     console.error("PUT Error:", err.message);
//     res.status(500).json({ error: "Update failed", details: err.message });
//   }
// });

// // ৫. সেন্ড (POST) - এটি আপনার 400 Error ফিক্স করবে
// router.post('/send', async (req, res) => {
//   try {
//     const { id } = req.body;
//     const doc = await Document.findById(id);
    
//     if (!doc) return res.status(404).json({ error: "Document not found" });
    
//     // ডাটাবেসে parties সেভ হয়েছে কি না তা চেক করুন
//     if (!doc.parties || doc.parties.length === 0) {
//       return res.status(400).json({ error: "No parties added. Please click 'Save' after adding recipients." });
//     }

//     const token = crypto.randomBytes(32).toString('hex');
//     doc.parties[0].token = token;
//     doc.parties[0].status = 'sent';
//     doc.status = 'in_progress';
//     doc.currentPartyIndex = 0;
    
//     await doc.save();
//     await sendSigningEmail(doc.parties[0], doc.title, token);

//     res.json({ success: true, message: "Email sent!" });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to send", details: err.message });
//   }
// });

// // ৬. সাইন সাবমিট (Sequential Signing)
// router.post('/sign/submit', async (req, res) => {
//   try {
//     const { token, fields } = req.body;
//     const doc = await Document.findOne({ "parties.token": token });
//     if (!doc) return res.status(404).json({ error: "Invalid session" });

//     const idx = doc.parties.findIndex(p => p.token === token);
//     doc.parties[idx].status = 'signed';
//     doc.parties[idx].signedAt = new Date();
//     doc.parties[idx].token = null; 
    
//     doc.fields = fields.map(f => ({ ...f, party_index: f.partyIndex !== undefined ? f.partyIndex : f.party_index }));

//     if (idx + 1 < doc.parties.length) {
//       const nextToken = crypto.randomBytes(32).toString('hex');
//       doc.parties[idx+1].token = nextToken;
//       doc.parties[idx+1].status = 'sent';
//       doc.currentPartyIndex = idx + 1;
//       await doc.save();
//       await sendSigningEmail(doc.parties[idx+1], doc.title, nextToken);
//       res.json({ success: true, next: true });
//     } else {
//       doc.status = 'completed';
//       await doc.save();
//       res.json({ success: true, completed: true });
//     }
//   } catch (err) { res.status(500).json({ error: "Submit failed" }); }
// });

// // ৭. পিডিএফ প্রক্সি
// router.get('/proxy/*', async (req, res) => {
//   try {
//     const fileId = req.params[0]; 
//     const cloudinaryUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${fileId}`;
//     const response = await axios.get(cloudinaryUrl, { responseType: 'stream' });
//     res.setHeader('Content-Type', 'application/pdf');
//     response.data.pipe(res);
//   } catch (err) { res.status(404).send("Could not fetch PDF"); }
// });

// // ৮. টোকেন চেক
// router.get('/sign/:token', async (req, res) => {
//   try {
//     const doc = await Document.findOne({ "parties.token": req.params.token });
//     if (!doc) return res.status(404).json({ error: "Invalid link" });
//     const party = doc.parties.find(p => p.token === req.params.token);
//     res.json({ document: doc, party: { ...party.toObject(), index: doc.parties.indexOf(party) } });
//   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// });

// module.exports = router;

// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const axios = require('axios');
// const { v2: cloudinary } = require('cloudinary');
// const crypto = require('crypto');
// const nodemailer = require('nodemailer');
// const Document = require('../models/Document');

// // ১. Nodemailer কনফিগারেশন
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
// });

// const sendSigningEmail = async (party, docTitle, token) => {
//   const signLink = `http://localhost:5173/sign?token=${token}`;
//   const mailOptions = {
//     from: `"NexSign" <${process.env.EMAIL_USER}>`,
//     to: party.email,
//     subject: `Signature Request: ${docTitle}`,
//     html: `
//       <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
//         <h2 style="color: #0ea5e9;">Hello ${party.name},</h2>
//         <p>You have a document waiting for your signature on <strong>NexSign</strong>.</p>
//         <p><strong>Document:</strong> ${docTitle}</p>
//         <div style="margin: 25px 0;">
//           <a href="${signLink}" style="display: inline-block; padding: 12px 24px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Sign Document Now</a>
//         </div>
//       </div>
//     `,
//   };
//   return transporter.sendMail(mailOptions);
// };

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const upload = multer({ storage: multer.memoryStorage() });

// // ২. ফাইল আপলোড
// router.post('/upload', upload.single('file'), async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ error: "No file provided" });
//     const result = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream(
//         { resource_type: "raw", folder: "nexsign_docs" },
//         (error, result) => (error ? reject(error) : resolve(result))
//       );
//       stream.end(req.file.buffer);
//     });

//     const newDoc = new Document({
//       title: req.file.originalname.replace('.pdf', ''),
//       fileUrl: result.secure_url,
//       fileId: result.public_id,
//       status: 'draft',
//       parties: [],
//       fields: []
//     });
//     await newDoc.save();
//     res.json(newDoc);
//   } catch (err) { res.status(500).json({ error: "Upload failed" }); }
// });

// // ৩. আইডি দিয়ে ডকুমেন্ট খোঁজা
// router.get('/:id', async (req, res) => {
//   try {
//     const doc = await Document.findById(req.params.id);
//     if (!doc) return res.status(404).json({ error: "Document not found" });
//     res.json(doc);
//   } catch (err) { res.status(500).json({ error: "Database error" }); }
// });

// // ৪. সেভ বা আপডেট (PUT) - লজিক ফিক্স
// router.put('/:id', async (req, res) => {
//   try {
//     const { fields, parties, title } = req.body;
    
//     // ✅ ফিক্স: ডেটা টাইপ নিশ্চিত করা এবং ম্যাপ করা
//     const formattedFields = fields?.map(f => {
//       const obj = typeof f === 'string' ? JSON.parse(f) : f;
//       return {
//         ...obj,
//         party_index: obj.partyIndex !== undefined ? Number(obj.partyIndex) : Number(obj.party_index),
//         page: Number(obj.page)
//       };
//     }) || [];

//     const updatedDoc = await Document.findByIdAndUpdate(
//       req.params.id,
//       { $set: { fields: formattedFields, parties: parties || [], title } },
//       { new: true, runValidators: false }
//     );

//     res.json(updatedDoc);
//   } catch (err) {
//     res.status(500).json({ error: "Update failed", details: err.message });
//   }
// });

// // ৫. সেন্ড (POST)
// router.post('/send', async (req, res) => {
//   try {
//     const { id } = req.body;
//     const doc = await Document.findById(id);
//     if (!doc || !doc.parties.length) return res.status(400).json({ error: "Invalid document or no parties" });

//     const token = crypto.randomBytes(32).toString('hex');
//     doc.parties[0].token = token;
//     doc.parties[0].status = 'sent';
//     doc.status = 'in_progress';
//     doc.currentPartyIndex = 0;
    
//     await doc.save();
//     await sendSigningEmail(doc.parties[0], doc.title, token);

//     res.json({ success: true, message: "Email sent!" });
//   } catch (err) { res.status(500).json({ error: "Failed to send" }); }
// });

// // ৬. সাইন সাবমিট (Sequential Signing)
// router.post('/sign/submit', async (req, res) => {
//   try {
//     const { token, fields } = req.body;
//     const doc = await Document.findOne({ "parties.token": token });
//     if (!doc) return res.status(404).json({ error: "Invalid session" });

//     const idx = doc.parties.findIndex(p => p.token === token);
//     doc.parties[idx].status = 'signed';
//     doc.parties[idx].signedAt = new Date();
//     doc.parties[idx].token = null; 
    
//     // ✅ ফিক্স: সাবমিট করা ডেটাকেও ফরম্যাট করা
//     doc.fields = fields.map(f => {
//       const obj = typeof f === 'string' ? JSON.parse(f) : f;
//       return {
//         ...obj,
//         party_index: obj.partyIndex !== undefined ? Number(obj.partyIndex) : Number(obj.party_index),
//         page: Number(obj.page)
//       };
//     });

//     if (idx + 1 < doc.parties.length) {
//       const nextToken = crypto.randomBytes(32).toString('hex');
//       doc.parties[idx+1].token = nextToken;
//       doc.parties[idx+1].status = 'sent';
//       doc.currentPartyIndex = idx + 1;
//       await doc.save();
//       await sendSigningEmail(doc.parties[idx+1], doc.title, nextToken);
//       res.json({ success: true, next: true });
//     } else {
//       doc.status = 'completed';
//       await doc.save();
//       res.json({ success: true, completed: true });
//     }
//   } catch (err) { res.status(500).json({ error: "Submit failed" }); }
// });

// // ৭. পিডিএফ প্রক্সি
// router.get('/proxy/*', async (req, res) => {
//   try {
//     const fileId = req.params[0]; 
//     const cloudinaryUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${fileId}`;
//     const response = await axios.get(cloudinaryUrl, { responseType: 'stream' });
//     res.setHeader('Content-Type', 'application/pdf');
//     response.data.pipe(res);
//   } catch (err) { res.status(404).send("Could not fetch PDF"); }
// });

// // ৮. টোকেন চেক
// router.get('/sign/:token', async (req, res) => {
//   try {
//     const doc = await Document.findOne({ "parties.token": req.params.token });
//     if (!doc) return res.status(404).json({ error: "Invalid link" });
//     const party = doc.parties.find(p => p.token === req.params.token);
//     res.json({ document: doc, party: { ...party.toObject(), index: doc.parties.indexOf(party) } });
//   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// });

// module.exports = router;

// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const axios = require('axios');
// const { v2: cloudinary } = require('cloudinary');
// const crypto = require('crypto');
// const nodemailer = require('nodemailer');
// const Document = require('../models/Document');

// // ১. Nodemailer কনফিগারেশন
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
// });

// const sendSigningEmail = async (party, docTitle, token) => {
//   const signLink = `http://localhost:5173/sign?token=${token}`;
//   const mailOptions = {
//     from: `"NexSign" <${process.env.EMAIL_USER}>`,
//     to: party.email,
//     subject: `Signature Request: ${docTitle}`,
//     html: `
//       <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
//         <h2 style="color: #0ea5e9;">Hello ${party.name},</h2>
//         <p>You have a document waiting for your signature on <strong>NexSign</strong>.</p>
//         <p><strong>Document:</strong> ${docTitle}</p>
//         <div style="margin: 25px 0;">
//           <a href="${signLink}" style="display: inline-block; padding: 12px 24px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Sign Document Now</a>
//         </div>
//       </div>
//     `,
//   };
//   return transporter.sendMail(mailOptions);
// };

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const upload = multer({ storage: multer.memoryStorage() });

// // ২. ফাইল আপলোড
// router.post('/upload', upload.single('file'), async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ error: "No file provided" });
//     const result = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream(
//         { resource_type: "raw", folder: "nexsign_docs" },
//         (error, result) => (error ? reject(error) : resolve(result))
//       );
//       stream.end(req.file.buffer);
//     });

//     const newDoc = new Document({
//       title: req.file.originalname.replace('.pdf', ''),
//       fileUrl: result.secure_url,
//       fileId: result.public_id,
//       status: 'draft',
//       parties: [],
//       fields: []
//     });
//     await newDoc.save();
//     res.json(newDoc);
//   } catch (err) { res.status(500).json({ error: "Upload failed" }); }
// });

// // ৩. আইডি দিয়ে ডকুমেন্ট খোঁজা
// router.get('/:id', async (req, res) => {
//   try {
//     const doc = await Document.findById(req.params.id);
//     if (!doc) return res.status(404).json({ error: "Document not found" });
//     res.json(doc);
//   } catch (err) { res.status(500).json({ error: "Database error" }); }
// });

// // ৪. সেভ বা আপডেট (PUT) 
// router.put('/:id', async (req, res) => {
//   try {
//     const { fields, parties, title } = req.body;
//     const formattedFields = fields?.map(f => {
//       const obj = typeof f === 'string' ? JSON.parse(f) : f;
//       return {
//         ...obj,
//         party_index: obj.partyIndex !== undefined ? Number(obj.partyIndex) : Number(obj.party_index),
//         page: Number(obj.page)
//       };
//     }) || [];

//     const updatedDoc = await Document.findByIdAndUpdate(
//       req.params.id,
//       { $set: { fields: formattedFields, parties: parties || [], title } },
//       { new: true }
//     );
//     res.json(updatedDoc);
//   } catch (err) { res.status(500).json({ error: "Update failed" }); }
// });

// // ৫. সেন্ড (POST)
// router.post('/send', async (req, res) => {
//   try {
//     const { id } = req.body;
//     const doc = await Document.findById(id);
//     if (!doc || !doc.parties.length) return res.status(400).json({ error: "Invalid document" });

//     const token = crypto.randomBytes(32).toString('hex');
//     doc.parties[0].token = token;
//     doc.parties[0].status = 'sent';
//     doc.status = 'in_progress';
//     doc.currentPartyIndex = 0;
    
//     await doc.save();
//     await sendSigningEmail(doc.parties[0], doc.title, token);
//     res.json({ success: true, message: "Email sent!" });
//   } catch (err) { res.status(500).json({ error: "Failed to send" }); }
// });

// // ৬. সাইন সাবমিট (Sequential Signing) - ফিক্সড রাউট পাথ
// router.post('/sign/submit', async (req, res) => {
//   try {
//     const { token, fields } = req.body;
//     const doc = await Document.findOne({ "parties.token": token });
//     if (!doc) return res.status(404).json({ error: "Invalid session" });

//     const idx = doc.parties.findIndex(p => p.token === token);
//     doc.parties[idx].status = 'signed';
//     doc.parties[idx].signedAt = new Date();
//     doc.parties[idx].token = null; 
    
//     doc.fields = fields.map(f => {
//       const obj = typeof f === 'string' ? JSON.parse(f) : f;
//       return {
//         ...obj,
//         party_index: obj.partyIndex !== undefined ? Number(obj.partyIndex) : Number(obj.party_index),
//         page: Number(obj.page)
//       };
//     });

//     if (idx + 1 < doc.parties.length) {
//       const nextToken = crypto.randomBytes(32).toString('hex');
//       doc.parties[idx+1].token = nextToken;
//       doc.parties[idx+1].status = 'sent';
//       doc.currentPartyIndex = idx + 1;
//       await doc.save();
//       await sendSigningEmail(doc.parties[idx+1], doc.title, nextToken);
//       res.json({ success: true, next: true });
//     } else {
//       doc.status = 'completed';
//       await doc.save();
//       res.json({ success: true, completed: true });
//     }
//   } catch (err) { res.status(500).json({ error: "Submit failed" }); }
// });

// // ৭. পিডিএফ প্রক্সি
// router.get('/proxy/*', async (req, res) => {
//   try {
//     const fileId = req.params[0]; 
//     const cloudinaryUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${fileId}`;
//     const response = await axios.get(cloudinaryUrl, { responseType: 'stream' });
//     res.setHeader('Content-Type', 'application/pdf');
//     response.data.pipe(res);
//   } catch (err) { res.status(404).send("Could not fetch PDF"); }
// });

// // ৮. টোকেন চেক
// router.get('/sign/:token', async (req, res) => {
//   try {
//     const doc = await Document.findOne({ "parties.token": req.params.token });
//     if (!doc) return res.status(404).json({ error: "Invalid link" });
//     const party = doc.parties.find(p => p.token === req.params.token);
//     res.json({ document: doc, party: { ...party.toObject(), index: doc.parties.indexOf(party) } });
//   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// });

// module.exports = router;

// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const axios = require('axios');
// const { v2: cloudinary } = require('cloudinary');
// const crypto = require('crypto');
// const nodemailer = require('nodemailer');
// const { PDFDocument } = require('pdf-lib'); // ✅ PDF manipulation এর জন্য
// const Document = require('../models/Document');

// // ১. Nodemailer কনফিগারেশন
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
// });

// // ✅ ফাইনাল পিডিএফ জেনারেট এবং ইমেল পাঠানোর ফাংশন
// const generateAndSendFinalDoc = async (doc) => {
//   try {
//     // ১. অরিজিনাল পিডিএফ ডাউনলোড করা (Cloudinary থেকে)
//     const response = await axios.get(doc.fileUrl, { responseType: 'arraybuffer' });
//     const existingPdfBytes = response.data;
    
//     const pdfDoc = await PDFDocument.load(existingPdfBytes);
//     const pages = pdfDoc.getPages();

//     // ২. প্রতিটি ফিল্ড (Signature) পিডিএফে বসানো
//     for (const field of doc.fields) {
//       if (field.type === 'signature' && field.value) {
//         const pageIndex = Number(field.page) - 1;
//         if (pageIndex < 0 || pageIndex >= pages.length) continue;

//         const page = pages[pageIndex];
//         const { width, height } = page.getSize();
        
//         // Base64 ইমেজ প্রসেস করা
//         const sigImageBytes = Buffer.from(field.value.split(',')[1], 'base64');
//         const sigImage = await pdfDoc.embedPng(sigImageBytes);

//         // কোঅর্ডিনেট ক্যালকুলেশন (পার্সেন্টেজ থেকে পয়েন্টে)
//         const pdfWidth = (Number(field.width) * width) / 100;
//         const pdfHeight = (Number(field.height) * height) / 100;
//         const pdfX = (Number(field.x) * width) / 100;
//         // PDF coordinate system এ Y নিচ থেকে শুরু হয়
//         const pdfY = height - ((Number(field.y) * height) / 100) - pdfHeight;

//         page.drawImage(sigImage, {
//           x: pdfX,
//           y: pdfY,
//           width: pdfWidth,
//           height: pdfHeight,
//         });
//       }
//     }

//     const pdfBytes = await pdfDoc.save();

//     // ৩. সকল পার্টিকে ইমেল পাঠানো (Attachment সহ)
//     const recipientEmails = doc.parties.map(p => p.email);
    
//     const mailOptions = {
//       from: `"NexSign" <${process.env.EMAIL_USER}>`,
//       to: recipientEmails.join(','),
//       subject: `Completed: ${doc.title}`,
//       html: `
//         <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
//           <h2 style="color: #10b981;">Signing Completed!</h2>
//           <p>Everyone has signed the document: <strong>${doc.title}</strong>.</p>
//           <p>Please find the final signed copy attached below.</p>
//           <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
//           <small style="color: #6b7280;">NexSign - Digital Signature Platform</small>
//         </div>
//       `,
//       attachments: [{
//         filename: `${doc.title}_signed.pdf`,
//         content: Buffer.from(pdfBytes),
//         contentType: 'application/pdf'
//       }]
//     };

//     await transporter.sendMail(mailOptions);
//     console.log("Final signed PDF sent to all parties.");
//   } catch (err) {
//     console.error("PDF Generation Error:", err);
//   }
// };

// const sendSigningEmail = async (party, docTitle, token) => {
//   const signLink = `http://localhost:5173/sign?token=${token}`;
//   const mailOptions = {
//     from: `"NexSign" <${process.env.EMAIL_USER}>`,
//     to: party.email,
//     subject: `Signature Request: ${docTitle}`,
//     html: `
//       <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
//         <h2 style="color: #0ea5e9;">Hello ${party.name},</h2>
//         <p>You have a document waiting for your signature on <strong>NexSign</strong>.</p>
//         <p><strong>Document:</strong> ${docTitle}</p>
//         <div style="margin: 25px 0;">
//           <a href="${signLink}" style="display: inline-block; padding: 12px 24px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Sign Document Now</a>
//         </div>
//       </div>
//     `,
//   };
//   return transporter.sendMail(mailOptions);
// };

// // ... (ফাইল আপলোড এবং বাকি রাউটগুলো একই থাকবে) ...

// // ৬. সাইন সাবমিট (Sequential Signing) - আপডেট করা লজিক
// router.post('/sign/submit', async (req, res) => {
//   try {
//     const { token, fields } = req.body;
//     const doc = await Document.findOne({ "parties.token": token });
//     if (!doc) return res.status(404).json({ error: "Invalid session" });

//     const idx = doc.parties.findIndex(p => p.token === token);
//     doc.parties[idx].status = 'signed';
//     doc.parties[idx].signedAt = new Date();
//     doc.parties[idx].token = null; 
    
//     // ফিল্ড ডেটা আপডেট (বর্তমান সাইনারের সিগনেচারসহ)
//     doc.fields = fields.map(f => {
//       const obj = typeof f === 'string' ? JSON.parse(f) : f;
//       return {
//         ...obj,
//         party_index: obj.partyIndex !== undefined ? Number(obj.partyIndex) : Number(obj.party_index),
//         page: Number(obj.page)
//       };
//     });

//     if (idx + 1 < doc.parties.length) {
//       // পরবর্তী সাইনারের কাছে পাঠানো
//       const nextToken = crypto.randomBytes(32).toString('hex');
//       doc.parties[idx+1].token = nextToken;
//       doc.parties[idx+1].status = 'sent';
//       doc.currentPartyIndex = idx + 1;
//       await doc.save();
//       await sendSigningEmail(doc.parties[idx+1], doc.title, nextToken);
//       res.json({ success: true, next: true });
//     } else {
//       // ✅ সবাই সাইন করেছে!
//       doc.status = 'completed';
//       await doc.save();
      
//       // ব্যাকগ্রাউন্ডে পিডিএফ তৈরি এবং ইমেল পাঠানো শুরু হবে
//       generateAndSendFinalDoc(doc); 
      
//       res.json({ success: true, completed: true });
//     }
//   } catch (err) { res.status(500).json({ error: "Submit failed" }); }
// });

// // ... (Proxy এবং বাকি রাউটগুলো) ...

// module.exports = router;
// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const axios = require('axios');
// const { v2: cloudinary } = require('cloudinary');
// const crypto = require('crypto');
// const nodemailer = require('nodemailer');
// const { PDFDocument } = require('pdf-lib');
// const Document = require('../models/Document');

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
// });

// const upload = multer({ storage: multer.memoryStorage() });

// // --- HELPER FUNCTIONS ---
// const sendSigningEmail = async (party, docTitle, token) => {
//   const signLink = `http://localhost:5173/sign?token=${token}`;
//   const mailOptions = {
//     from: `"NexSign" <${process.env.EMAIL_USER}>`,
//     to: party.email,
//     subject: `Signature Request: ${docTitle}`,
//     html: `<div style="font-family:sans-serif;padding:20px;"><h2>Hello ${party.name}</h2><p>Please sign <b>${docTitle}</b></p><a href="${signLink}" style="background:#0ea5e9;color:white;padding:10px;text-decoration:none;border-radius:5px;">Sign Now</a></div>`,
//   };
//   return transporter.sendMail(mailOptions);
// };

// const generateAndSendFinalDoc = async (doc) => {
//   try {
//     const response = await axios.get(doc.fileUrl, { responseType: 'arraybuffer' });
//     const pdfDoc = await PDFDocument.load(response.data);
//     const pages = pdfDoc.getPages();

//     for (const field of doc.fields) {
//       // ফ্রন্টএন্ড থেকে আসা স্ট্রিং ডেটাকে পার্স করা (যদি প্রয়োজন হয়)
//       const f = typeof field === 'string' ? JSON.parse(field) : field;
//       if (f.type === 'signature' && f.value) {
//         const page = pages[Number(f.page) - 1];
//         const { width, height } = page.getSize();
//         const sigImg = await pdfDoc.embedPng(Buffer.from(f.value.split(',')[1], 'base64'));

//         page.drawImage(sigImg, {
//           x: (Number(f.x) * width) / 100,
//           y: height - ((Number(f.y) * height) / 100) - ((Number(f.height) * height) / 100),
//           width: (Number(f.width) * width) / 100,
//           height: (Number(f.height) * height) / 100,
//         });
//       }
//     }
//     const pdfBytes = await pdfDoc.save();
//     await transporter.sendMail({
//       from: `"NexSign" <${process.env.EMAIL_USER}>`,
//       to: doc.parties.map(p => p.email).join(','),
//       subject: `Completed: ${doc.title}`,
//       attachments: [{ filename: `${doc.title}_signed.pdf`, content: Buffer.from(pdfBytes) }]
//     });
//   } catch (err) { console.error("Final PDF Error:", err); }
// };

// // --- ROUTES ---

// // ১. ফাইল আপলোড (POST /api/documents/upload)
// router.post('/upload', upload.single('file'), async (req, res) => {
//   try {
//     const result = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream({ resource_type: "raw", folder: "nexsign_docs" }, (err, res) => err ? reject(err) : resolve(res));
//       stream.end(req.file.buffer);
//     });
//     const newDoc = new Document({ title: req.file.originalname.replace('.pdf', ''), fileUrl: result.secure_url, fileId: result.public_id });
//     await newDoc.save();
//     res.json(newDoc);
//   } catch (err) { res.status(500).json({ error: "Upload failed" }); }
// });

// // ২. আইডি দিয়ে ডকুমেন্ট রিট্রিভ (GET /api/documents/:id) -> **এটি আপনার ৪-০-৪ ফিক্স করবে**
// router.get('/:id', async (req, res) => {
//   try {
//     const doc = await Document.findById(req.params.id);
//     if (!doc) return res.status(404).json({ error: "Document not found" });
//     res.json(doc);
//   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// });

// // ৩. আপডেট ড্রাফট (PUT /api/documents/:id)
// router.put('/:id', async (req, res) => {
//   try {
//     const { title, parties, fields, totalPages, fileUrl, fileId } = req.body;
//     const updated = await Document.findByIdAndUpdate(
//       req.params.id,
//       { $set: { title, parties, fields, totalPages, fileUrl, fileId } },
//       { new: true }
//     );
//     res.json(updated);
//   } catch (err) { res.status(500).json({ error: "Save failed" }); }
// });

// // ৪. প্রথম সাইনারকে ইমেল পাঠানো (POST /api/documents/send)
// router.post('/send', async (req, res) => {
//   try {
//     const doc = await Document.findById(req.body.id);
//     if (!doc || !doc.parties.length) return res.status(400).json({ error: "Invalid document" });

//     const token = crypto.randomBytes(32).toString('hex');
//     doc.parties[0].token = token;
//     doc.parties[0].status = 'sent';
//     doc.status = 'in_progress';
//     await doc.save();
//     await sendSigningEmail(doc.parties[0], doc.title, token);
//     res.json({ success: true });
//   } catch (err) { res.status(500).json({ error: "Send failed" }); }
// });

// // ৫. সাইন সাবমিট (POST /api/documents/sign/submit)
// router.post('/sign/submit', async (req, res) => {
//   try {
//     const { token, fields } = req.body;
//     const doc = await Document.findOne({ "parties.token": token });
//     if (!doc) return res.status(404).json({ error: "Session invalid" });

//     const idx = doc.parties.findIndex(p => p.token === token);
//     doc.parties[idx].status = 'signed';
//     doc.parties[idx].token = null;
//     doc.fields = fields;

//     if (idx + 1 < doc.parties.length) {
//       const nextToken = crypto.randomBytes(32).toString('hex');
//       doc.parties[idx+1].token = nextToken;
//       doc.parties[idx+1].status = 'sent';
//       await doc.save();
//       await sendSigningEmail(doc.parties[idx+1], doc.title, nextToken);
//       res.json({ success: true, next: true });
//     } else {
//       doc.status = 'completed';
//       await doc.save();
//       generateAndSendFinalDoc(doc);
//       res.json({ success: true, completed: true });
//     }
//   } catch (err) { res.status(500).json({ error: "Submit failed" }); }
// });

// // ৬. পিডিএফ প্রক্সি (GET /api/documents/proxy/*)
// router.get('/proxy/*', async (req, res) => {
//   try {
//     const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${req.params[0]}`;
//     const response = await axios.get(url, { responseType: 'stream' });
//     res.setHeader('Content-Type', 'application/pdf');
//     response.data.pipe(res);
//   } catch (err) { res.status(404).send("PDF not found"); }
// });

// module.exports = router;

// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const axios = require('axios');
// const { v2: cloudinary } = require('cloudinary');
// const crypto = require('crypto');
// const nodemailer = require('nodemailer');
// const { PDFDocument } = require('pdf-lib');
// const Document = require('../models/Document');

// // ✅ ১. Cloudinary কনফিগারেশন (এটি না থাকলে ৫-০-০ এরর আসবে)
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
// });

// const upload = multer({ storage: multer.memoryStorage() });

// // --- HELPER FUNCTIONS ---
// const sendSigningEmail = async (party, docTitle, token) => {
//   const signLink = `http://localhost:5173/sign?token=${token}`;
//   const mailOptions = {
//     from: `"NexSign" <${process.env.EMAIL_USER}>`,
//     to: party.email,
//     subject: `Signature Request: ${docTitle}`,
//     html: `<div style="font-family:sans-serif;padding:20px;"><h2>Hello ${party.name}</h2><p>Please sign <b>${docTitle}</b></p><a href="${signLink}" style="background:#0ea5e9;color:white;padding:10px;text-decoration:none;border-radius:5px;">Sign Now</a></div>`,
//   };
//   return transporter.sendMail(mailOptions);
// };

// // const generateAndSendFinalDoc = async (doc) => {
// //   try {
// //     const response = await axios.get(doc.fileUrl, { responseType: 'arraybuffer' });
// //     const pdfDoc = await PDFDocument.load(response.data);
// //     const pages = pdfDoc.getPages();

// //     for (const field of doc.fields) {
// //       const f = typeof field === 'string' ? JSON.parse(field) : field;
// //       if (f.type === 'signature' && f.value) {
// //         const page = pages[Number(f.page) - 1];
// //         const { width, height } = page.getSize();
// //         const sigImg = await pdfDoc.embedPng(Buffer.from(f.value.split(',')[1], 'base64'));

// //         page.drawImage(sigImg, {
// //           x: (Number(f.x) * width) / 100,
// //           y: height - ((Number(f.y) * height) / 100) - ((Number(f.height) * height) / 100),
// //           width: (Number(f.width) * width) / 100,
// //           height: (Number(f.height) * height) / 100,
// //         });
// //       }
// //     }
// //     const pdfBytes = await pdfDoc.save();
// //     await transporter.sendMail({
// //       from: `"NexSign" <${process.env.EMAIL_USER}>`,
// //       to: doc.parties.map(p => p.email).join(','),
// //       subject: `Completed: ${doc.title}`,
// //       attachments: [{ filename: `${doc.title}_signed.pdf`, content: Buffer.from(pdfBytes) }]
// //     });
// //   } catch (err) { console.error("Final PDF Error:", err); }
// // };

// const generateAndSendFinalDoc = async (doc) => {
//   try {
//     const response = await axios.get(doc.fileUrl, { responseType: 'arraybuffer' });
//     const pdfDoc = await PDFDocument.load(response.data);
//     const pages = pdfDoc.getPages();

//     for (const field of doc.fields) {
//       const f = typeof field === 'string' ? JSON.parse(field) : field;
//       if (f.type === 'signature' && f.value) {
//         const pageIndex = Number(f.page) - 1;
//         if (pageIndex >= 0 && pageIndex < pages.length) {
//           const page = pages[pageIndex];
//           const { width, height } = page.getSize();
//           const sigImg = await pdfDoc.embedPng(Buffer.from(f.value.split(',')[1], 'base64'));

//           page.drawImage(sigImg, {
//             x: (Number(f.x) * width) / 100,
//             y: height - ((Number(f.y) * height) / 100) - ((Number(f.height) * height) / 100),
//             width: (Number(f.width) * width) / 100,
//             height: (Number(f.height) * height) / 100,
//           });
//         }
//       }
//     }
//     const pdfBytes = await pdfDoc.save();
//     await transporter.sendMail({
//       from: `"NexSign" <${process.env.EMAIL_USER}>`,
//       to: doc.parties.map(p => p.email).join(','),
//       subject: `Completed: ${doc.title}`,
//       attachments: [{ filename: `${doc.title}_signed.pdf`, content: Buffer.from(pdfBytes) }]
//     });
//     console.log("Final PDF sent successfully!");
//   } catch (err) { 
//     console.error("Final PDF Error:", err); 
//   }
// };

// // --- ৪. নিচের রাউটগুলোর ভেতর থেকে এটিকে কল করুন ---

// router.post('/sign/submit', async (req, res) => {
//   try {
//     const { token, fields } = req.body;
    
//     // ১. টোকেন দিয়ে ডকুমেন্টটি খুঁজে বের করা
//     const doc = await Document.findOne({ "parties.token": token });
//     if (!doc) return res.status(404).json({ error: "Invalid or expired session" });

//     // ২. কোন ইনডেক্সের ইউজার সাইন করছে তা বের করা
//     const idx = doc.parties.findIndex(p => p.token === token);
    
//     // ৩. ইউজারের স্ট্যাটাস আপডেট এবং টোকেন রিমুভ (সিকিউরিটির জন্য)
//     doc.parties[idx].status = 'signed';
//     doc.parties[idx].token = null; 
    
//     // ৪. ফ্রন্টএন্ড থেকে আসা আপডেট করা ফিল্ডগুলো সেভ করা
//     doc.fields = fields;

//     // ৫. চেক করা: আরও কি কেউ বাকি আছে?
//     if (idx + 1 < doc.parties.length) {
//       // পরবর্তী সাইনারের জন্য নতুন টোকেন তৈরি করা
//       const nextToken = crypto.randomBytes(32).toString('hex');
//       doc.parties[idx + 1].token = nextToken;
//       doc.parties[idx + 1].status = 'sent';
      
//       await doc.save();
      
//       // পরবর্তী সাইনারকে মেইল পাঠানো
//       await sendSigningEmail(doc.parties[idx + 1], doc.title, nextToken);
//       res.json({ success: true, next: true });
      
//     } else {
//       // ✅ সবাই সাইন করে ফেলেছে!
//       doc.status = 'completed';
//       await doc.save();
      
//       // সবার কাছে ফাইনাল পিডিএফ পাঠানোর হেল্পার ফাংশন কল করা
//       await generateAndSendFinalDoc(doc);
      
//       res.json({ success: true, completed: true });
//     }
//   } catch (err) {
//     console.error("Submit Error:", err);
//     res.status(500).json({ error: "Failed to submit signature" });
//   }
// });
//       // ✅ এখানে ফাংশনটি কল করুন
//       generateAndSendFinalDoc(doc);
// // --- ROUTES ---




// // ১. ফাইল আপলোড (POST /api/documents/upload)
// router.post('/upload', upload.single('file'), async (req, res) => {
//   try {
//     const result = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream({ resource_type: "raw", folder: "nexsign_docs" }, (err, res) => err ? reject(err) : resolve(res));
//       stream.end(req.file.buffer);
//     });
//     const newDoc = new Document({ title: req.file.originalname.replace('.pdf', ''), fileUrl: result.secure_url, fileId: result.public_id });
//     await newDoc.save();
//     res.json(newDoc);
//   } catch (err) { res.status(500).json({ error: "Upload failed" }); }
// });

// // ২. আইডি দিয়ে ডকুমেন্ট রিট্রিভ (GET /api/documents/:id)
// router.get('/:id', async (req, res) => {
//   try {
//     const doc = await Document.findById(req.params.id);
//     if (!doc) return res.status(404).json({ error: "Document not found" });
//     res.json(doc);
//   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// });

// // ৩. আপডেট ড্রাফট (PUT /api/documents/:id)
// router.put('/:id', async (req, res) => {
//   try {
//     const { title, parties, fields, totalPages, fileUrl, fileId } = req.body;
//     const updated = await Document.findByIdAndUpdate(
//       req.params.id,
//       { $set: { title, parties, fields, totalPages, fileUrl, fileId } },
//       { new: true }
//     );
//     res.json(updated);
//   } catch (err) { res.status(500).json({ error: "Save failed" }); }
// });


// // ৫. টোকেন দিয়ে ডকুমেন্ট এবং সাইনারের তথ্য রিট্রিভ করা
// // GET http://localhost:5001/api/documents/sign/YOUR_TOKEN
// router.get('/sign/:token', async (req, res) => {
//   try {
//     const { token } = req.params;

//     // ডাটাবেসে ওই টোকেনটি কোন পার্টির (signer) সাথে মিলছে তা খোঁজা
//     const doc = await Document.findOne({ "parties.token": token });

//     if (!doc) {
//       return res.status(404).json({ error: "Invalid or expired signing link" });
//     }

//     // কোন পার্টি সাইন করছে তাকে খুঁজে বের করা
//     const party = doc.parties.find(p => p.token === token);

//     res.json({
//       document: doc,
//       party: {
//         ...party.toObject(),
//         index: doc.parties.indexOf(party)
//       }
//     });
//   } catch (err) {
//     console.error("Token Fetch Error:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // ৪. প্রথম সাইনারকে ইমেল পাঠানো (POST /api/documents/send)
// router.post('/send', async (req, res) => {
//   try {
//     const doc = await Document.findById(req.body.id);
//     if (!doc || !doc.parties.length) return res.status(400).json({ error: "Invalid document" });

//     const token = crypto.randomBytes(32).toString('hex');
//     doc.parties[0].token = token;
//     doc.parties[0].status = 'sent';
//     doc.status = 'in_progress';
//     await doc.save();
//     await sendSigningEmail(doc.parties[0], doc.title, token);
//     res.json({ success: true });
//   } catch (err) { res.status(500).json({ error: "Send failed" }); }
// });

// // ৫. সাইন সাবমিট (POST /api/documents/sign/submit)
// router.post('/sign/submit', async (req, res) => {
//   try {
//     const { token, fields } = req.body;
//     const doc = await Document.findOne({ "parties.token": token });
//     if (!doc) return res.status(404).json({ error: "Session invalid" });

//     const idx = doc.parties.findIndex(p => p.token === token);
//     doc.parties[idx].status = 'signed';
//     doc.parties[idx].token = null;
//     doc.fields = fields;

//     if (idx + 1 < doc.parties.length) {
//       const nextToken = crypto.randomBytes(32).toString('hex');
//       doc.parties[idx+1].token = nextToken;
//       doc.parties[idx+1].status = 'sent';
//       await doc.save();
//       await sendSigningEmail(doc.parties[idx+1], doc.title, nextToken);
//       res.json({ success: true, next: true });
//     } else {
//       doc.status = 'completed';
//       await doc.save();
//       generateAndSendFinalDoc(doc);
//       res.json({ success: true, completed: true });
//     }
//   } catch (err) { res.status(500).json({ error: "Submit failed" }); }
// });

// // ৬. পিডিএফ প্রক্সি (GET /api/documents/proxy/*)
// router.get('/proxy/*', async (req, res) => {
//   try {
//     const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${req.params[0]}`;
//     const response = await axios.get(url, { responseType: 'stream' });
//     res.setHeader('Content-Type', 'application/pdf');
//     response.data.pipe(res);
//   } catch (err) { res.status(404).send("PDF not found"); }
// });

// module.exports = router;

// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const axios = require('axios');
// const { v2: cloudinary } = require('cloudinary');
// const crypto = require('crypto');
// const nodemailer = require('nodemailer');
// const { PDFDocument } = require('pdf-lib');
// const Document = require('../models/Document');

// // ১. Cloudinary কনফিগারেশন
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // ২. মেইল ট্রান্সপোর্টার
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: { 
//     user: process.env.EMAIL_USER, 
//     pass: process.env.EMAIL_PASS 
//   },
// });

// const upload = multer({ storage: multer.memoryStorage() });

// // --- HELPER FUNCTIONS ---

// const sendSigningEmail = async (party, docTitle, token) => {
//   const signLink = `http://localhost:5173/sign?token=${token}`;
//   const mailOptions = {
//     from: `"NexSign" <${process.env.EMAIL_USER}>`,
//     to: party.email,
//     subject: `Signature Request: ${docTitle}`,
//     html: `
//       <div style="font-family:sans-serif;padding:20px;border:1px solid #eee;border-radius:10px;">
//         <h2 style="color:#0ea5e9;">Hello ${party.name},</h2>
//         <p>You have been requested to sign the document: <b>${docTitle}</b></p>
//         <div style="margin:20px 0;">
//           <a href="${signLink}" style="background:#0ea5e9;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;font-weight:bold;">Sign Document Now</a>
//         </div>
//         <p style="font-size:12px;color:#888;">If the button doesn't work, copy this link: ${signLink}</p>
//       </div>
//     `,
//   };
//   return transporter.sendMail(mailOptions);
// };

// const generateAndSendFinalDoc = async (doc) => {
//   try {
//     const response = await axios.get(doc.fileUrl, { responseType: 'arraybuffer' });
//     const pdfDoc = await PDFDocument.load(response.data);
//     const pages = pdfDoc.getPages();

//     for (const field of doc.fields) {
//       const f = typeof field === 'string' ? JSON.parse(field) : field;
//       if (f.type === 'signature' && f.value) {
//         const pageIndex = Number(f.page) - 1;
//         if (pageIndex >= 0 && pageIndex < pages.length) {
//           const page = pages[pageIndex];
//           const { width, height } = page.getSize();
          
//           // Base64 ইমেজ প্রসেসিং
//           const base64Data = f.value.includes(',') ? f.value.split(',')[1] : f.value;
//           const sigImg = await pdfDoc.embedPng(Buffer.from(base64Data, 'base64'));

//           page.drawImage(sigImg, {
//             x: (Number(f.x) * width) / 100,
//             y: height - ((Number(f.y) * height) / 100) - ((Number(f.height) * height) / 100),
//             width: (Number(f.width) * width) / 100,
//             height: (Number(f.height) * height) / 100,
//           });
//         }
//       }
//     }
//     const pdfBytes = await pdfDoc.save();
    
//     // সব পার্টিকে মেইল পাঠানো
//     const emails = doc.parties.map(p => p.email).join(',');
    
//     await transporter.sendMail({
//       from: `"NexSign" <${process.env.EMAIL_USER}>`,
//       to: emails,
//       subject: `Completed & Signed: ${doc.title}`,
//       text: `All parties have signed "${doc.title}". Please find the attached final copy.`,
//       attachments: [{ 
//         filename: `${doc.title}_signed.pdf`, 
//         content: Buffer.from(pdfBytes),
//         contentType: 'application/pdf'
//       }]
//     });
//     console.log("Final signed PDF sent to all parties.");
//   } catch (err) { 
//     console.error("Final PDF Generation Error:", err); 
//   }
// };

// // --- ROUTES ---

// // ১. ফাইল আপলোড
// router.post('/upload', upload.single('file'), async (req, res) => {
//   try {
//     const result = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream({ resource_type: "raw", folder: "nexsign_docs" }, (err, res) => err ? reject(err) : resolve(res));
//       stream.end(req.file.buffer);
//     });
//     const newDoc = new Document({ 
//       title: req.file.originalname.replace('.pdf', ''), 
//       fileUrl: result.secure_url, 
//       fileId: result.public_id 
//     });
//     await newDoc.save();
//     res.json(newDoc);
//   } catch (err) { res.status(500).json({ error: "Upload failed" }); }
// });

// // ২. আইডি দিয়ে ডকুমেন্ট রিট্রিভ
// router.get('/:id', async (req, res) => {
//   try {
//     const doc = await Document.findById(req.params.id);
//     if (!doc) return res.status(404).json({ error: "Document not found" });
//     res.json(doc);
//   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// });

// // ৩. আপডেট ড্রাফট
// router.put('/:id', async (req, res) => {
//   try {
//     const { title, parties, fields, totalPages, fileUrl, fileId } = req.body;
//     const updated = await Document.findByIdAndUpdate(
//       req.params.id,
//       { $set: { title, parties, fields, totalPages, fileUrl, fileId } },
//       { new: true }
//     );
//     res.json(updated);
//   } catch (err) { res.status(500).json({ error: "Save failed" }); }
// });

// // ৪. প্রথম সাইনারকে ইমেল পাঠানো
// router.post('/send', async (req, res) => {
//   try {
//     const doc = await Document.findById(req.body.id);
//     if (!doc || !doc.parties.length) return res.status(400).json({ error: "Invalid document" });

//     const token = crypto.randomBytes(32).toString('hex');
//     doc.parties[0].token = token;
//     doc.parties[0].status = 'sent';
//     doc.status = 'in_progress';
//     await doc.save();
    
//     await sendSigningEmail(doc.parties[0], doc.title, token);
//     res.json({ success: true });
//   } catch (err) { res.status(500).json({ error: "Send failed" }); }
// });

// // ৫. টোকেন দিয়ে তথ্য রিট্রিভ করা (Signer View এর জন্য)
// router.get('/sign/:token', async (req, res) => {
//   try {
//     const { token } = req.params;
//     const doc = await Document.findOne({ "parties.token": token });
//     if (!doc) return res.status(404).json({ error: "Invalid link" });

//     const party = doc.parties.find(p => p.token === token);
//     res.json({
//       document: doc,
//       party: { ...party.toObject(), index: doc.parties.indexOf(party) }
//     });
//   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// });

// // ৬. সাইন সাবমিট (সবচেয়ে গুরুত্বপূর্ণ রাউট)
// router.post('/sign/submit', async (req, res) => {
//   try {
//     const { token, fields } = req.body;
//     const doc = await Document.findOne({ "parties.token": token });
//     if (!doc) return res.status(404).json({ error: "Session invalid" });

//     const idx = doc.parties.findIndex(p => p.token === token);
//     doc.parties[idx].status = 'signed';
//     doc.parties[idx].token = null; // সিকিউরিটির জন্য টোকেন মুছে ফেলা
//     doc.fields = fields;

//     // যদি আরও সাইনার বাকি থাকে
//     if (idx + 1 < doc.parties.length) {
//       const nextToken = crypto.randomBytes(32).toString('hex');
//       doc.parties[idx + 1].token = nextToken;
//       doc.parties[idx + 1].status = 'sent';
//       await doc.save();
//       await sendSigningEmail(doc.parties[idx + 1], doc.title, nextToken);
//       res.json({ success: true, next: true });
//     } else {
//       // শেষ সাইনার হলে ডকুমেন্ট কমপ্লিট করা
//       doc.status = 'completed';
//       await doc.save();
      
//       // ফাইল জেনারেট করে সবাইকে মেইল পাঠানো (Async call)
//       generateAndSendFinalDoc(doc);
      
//       res.json({ success: true, completed: true });
//     }
//   } catch (err) { 
//     console.error("Submit Error:", err);
//     res.status(500).json({ error: "Submit failed" }); 
//   }
// });

// // ৭. পিডিএফ প্রক্সি
// router.get('/proxy/*', async (req, res) => {
//   try {
//     const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${req.params[0]}`;
//     const response = await axios.get(url, { responseType: 'stream' });
//     res.setHeader('Content-Type', 'application/pdf');
//     response.data.pipe(res);
//   } catch (err) { res.status(404).send("PDF not found"); }
// });

// module.exports = router;

// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const axios = require('axios');
// const { v2: cloudinary } = require('cloudinary');
// const crypto = require('crypto');
// const nodemailer = require('nodemailer');
// const { PDFDocument } = require('pdf-lib');
// const Document = require('../models/Document');
// const AuditLog = require('../models/AuditLog'); // ✅ ১. অডিট লগ মডেল ইম্পোর্ট

// // ১. Cloudinary কনফিগারেশন
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // ২. মেইল ট্রান্সপোর্টার
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: { 
//     user: process.env.EMAIL_USER, 
//     pass: process.env.EMAIL_PASS 
//   },
// });

// const upload = multer({ storage: multer.memoryStorage() });

// // --- HELPER FUNCTIONS ---

// const sendSigningEmail = async (party, docTitle, token) => {
//   const signLink = `http://localhost:5173/sign?token=${token}`;
//   const mailOptions = {
//     from: `"NexSign" <${process.env.EMAIL_USER}>`,
//     to: party.email,
//     subject: `Signature Request: ${docTitle}`,
//     html: `
//       <div style="font-family:sans-serif;padding:20px;border:1px solid #eee;border-radius:10px;">
//         <h2 style="color:#0ea5e9;">Hello ${party.name},</h2>
//         <p>You have been requested to sign the document: <b>${docTitle}</b></p>
//         <div style="margin:20px 0;">
//           <a href="${signLink}" style="background:#0ea5e9;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;font-weight:bold;">Sign Document Now</a>
//         </div>
//         <p style="font-size:12px;color:#888;">If the button doesn't work, copy this link: ${signLink}</p>
//       </div>
//     `,
//   };
//   return transporter.sendMail(mailOptions);
// };

// const generateAndSendFinalDoc = async (doc) => {
//   try {
//     const response = await axios.get(doc.fileUrl, { responseType: 'arraybuffer' });
//     const pdfDoc = await PDFDocument.load(response.data);
//     const pages = pdfDoc.getPages();

//     for (const field of doc.fields) {
//       const f = typeof field === 'string' ? JSON.parse(field) : field;
//       if (f.type === 'signature' && f.value) {
//         const pageIndex = Number(f.page) - 1;
//         if (pageIndex >= 0 && pageIndex < pages.length) {
//           const page = pages[pageIndex];
//           const { width, height } = page.getSize();
          
//           // Base64 ইমেজ প্রসেসিং
//           const base64Data = f.value.includes(',') ? f.value.split(',')[1] : f.value;
//           const sigImg = await pdfDoc.embedPng(Buffer.from(base64Data, 'base64'));

//           page.drawImage(sigImg, {
//             x: (Number(f.x) * width) / 100,
//             y: height - ((Number(f.y) * height) / 100) - ((Number(f.height) * height) / 100),
//             width: (Number(f.width) * width) / 100,
//             height: (Number(f.height) * height) / 100,
//           });
//         }
//       }
//     }
//     const pdfBytes = await pdfDoc.save();
    
//     // সব পার্টিকে মেইল পাঠানো
//     const emails = doc.parties.map(p => p.email).join(',');
    
//     await transporter.sendMail({
//       from: `"NexSign" <${process.env.EMAIL_USER}>`,
//       to: emails,
//       subject: `Completed & Signed: ${doc.title}`,
//       text: `All parties have signed "${doc.title}". Please find the attached final copy.`,
//       attachments: [{ 
//         filename: `${doc.title}_signed.pdf`, 
//         content: Buffer.from(pdfBytes),
//         contentType: 'application/pdf'
//       }]
//     });
//     console.log("Final signed PDF sent to all parties.");
//   } catch (err) { 
//     console.error("Final PDF Generation Error:", err); 
//   }
// };

// // --- ROUTES ---

// // ১. ফাইল আপলোড
// router.post('/upload', upload.single('file'), async (req, res) => {
//   try {
//     const result = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream({ resource_type: "raw", folder: "nexsign_docs" }, (err, res) => err ? reject(err) : resolve(res));
//       stream.end(req.file.buffer);
//     });
//     const newDoc = new Document({ 
//       title: req.file.originalname.replace('.pdf', ''), 
//       fileUrl: result.secure_url, 
//       fileId: result.public_id 
//     });
//     await newDoc.save();

//     // ✅ অডিট লগ: ডকুমেন্ট তৈরি
//     await new AuditLog({
//       document_id: newDoc._id,
//       action: 'created',
//       details: 'Document uploaded to NexSign storage.'
//     }).save();

//     res.json(newDoc);
//   } catch (err) { res.status(500).json({ error: "Upload failed" }); }
// });

// // ২. আইডি দিয়ে ডকুমেন্ট রিট্রিভ
// router.get('/:id', async (req, res) => {
//   try {
//     const doc = await Document.findById(req.params.id);
//     if (!doc) return res.status(404).json({ error: "Document not found" });
//     res.json(doc);
//   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// });

// // ৩. আপডেট ড্রাফট
// router.put('/:id', async (req, res) => {
//   try {
//     const { title, parties, fields, totalPages, fileUrl, fileId } = req.body;
//     const updated = await Document.findByIdAndUpdate(
//       req.params.id,
//       { $set: { title, parties, fields, totalPages, fileUrl, fileId } },
//       { new: true }
//     );
//     res.json(updated);
//   } catch (err) { res.status(500).json({ error: "Save failed" }); }
// });

// // ৪. প্রথম সাইনারকে ইমেল পাঠানো
// router.post('/send', async (req, res) => {
//   try {
//     const doc = await Document.findById(req.body.id);
//     if (!doc || !doc.parties.length) return res.status(400).json({ error: "Invalid document" });

//     const token = crypto.randomBytes(32).toString('hex');
//     doc.parties[0].token = token;
//     doc.parties[0].status = 'sent';
//     doc.status = 'in_progress';
//     await doc.save();

//     // ✅ অডিট লগ: মেইল পাঠানো
//     await new AuditLog({
//       document_id: doc._id,
//       action: 'sent',
//       party_name: doc.parties[0].name,
//       party_email: doc.parties[0].email,
//       details: `Signing invite sent to the first signer.`
//     }).save();
    
//     await sendSigningEmail(doc.parties[0], doc.title, token);
//     res.json({ success: true });
//   } catch (err) { res.status(500).json({ error: "Send failed" }); }
// });

// // ৫. টোকেন দিয়ে তথ্য রিট্রিভ করা (Signer View এর জন্য)
// router.get('/sign/:token', async (req, res) => {
//   try {
//     const { token } = req.params;
//     const doc = await Document.findOne({ "parties.token": token });
//     if (!doc) return res.status(404).json({ error: "Invalid link" });

//     const party = doc.parties.find(p => p.token === token);

//     // ✅ অডিট লগ: ডকুমেন্ট ওপেন করা
//     await new AuditLog({
//       document_id: doc._id,
//       action: 'opened',
//       party_name: party.name,
//       party_email: party.email,
//       ip_address: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
//       details: `Signer opened the document link.`
//     }).save();

//     res.json({
//       document: doc,
//       party: { ...party.toObject(), index: doc.parties.indexOf(party) }
//     });
//   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// });

// // ৬. সাইন সাবমিট (সবচেয়ে গুরুত্বপূর্ণ রাউট)
// router.post('/sign/submit', async (req, res) => {
//   try {
//     const { token, fields } = req.body;
//     const doc = await Document.findOne({ "parties.token": token });
//     if (!doc) return res.status(404).json({ error: "Session invalid" });

//     const idx = doc.parties.findIndex(p => p.token === token);
//     const signer = doc.parties[idx]; // লগের জন্য সাইনারের ডাটা রাখা হলো

//     doc.parties[idx].status = 'signed';
//     doc.parties[idx].token = null; 
//     doc.fields = fields;
//     await doc.save();

//     // ✅ অডিট লগ: সই করা
//     await new AuditLog({
//       document_id: doc._id,
//       action: 'signed',
//       party_name: signer.name,
//       party_email: signer.email,
//       ip_address: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
//       details: `Successfully applied signature to document.`
//     }).save();

//     if (idx + 1 < doc.parties.length) {
//       const nextToken = crypto.randomBytes(32).toString('hex');
//       doc.parties[idx + 1].token = nextToken;
//       doc.parties[idx + 1].status = 'sent';
//       await doc.save();

//       // ✅ অডিট লগ: পরের সাইনারকে ইনভাইট পাঠানো
//       await new AuditLog({
//         document_id: doc._id,
//         action: 'sent',
//         party_name: doc.parties[idx + 1].name,
//         party_email: doc.parties[idx + 1].email,
//         details: `Next signing invite sent to ${doc.parties[idx + 1].name}.`
//       }).save();

//       await sendSigningEmail(doc.parties[idx + 1], doc.title, nextToken);
//       res.json({ success: true, next: true });
//     } else {
//       doc.status = 'completed';
//       await doc.save();

//       // ✅ অডিট লগ: ডকুমেন্ট কমপ্লিট হওয়া
//       await new AuditLog({
//         document_id: doc._id,
//         action: 'completed',
//         details: 'All parties have signed. Final PDF generated and distributed.'
//       }).save();
      
//       generateAndSendFinalDoc(doc);
//       res.json({ success: true, completed: true });
//     }
//   } catch (err) { 
//     console.error("Submit Error:", err);
//     res.status(500).json({ error: "Submit failed" }); 
//   }
// });

// // ৭. পিডিএফ প্রক্সি
// router.get('/proxy/*', async (req, res) => {
//   try {
//     const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${req.params[0]}`;
//     const response = await axios.get(url, { responseType: 'stream' });
//     res.setHeader('Content-Type', 'application/pdf');
//     response.data.pipe(res);
//   } catch (err) { res.status(404).send("PDF not found"); }
// });

// module.exports = router;
// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const axios = require('axios');
// const { v2: cloudinary } = require('cloudinary');
// const crypto = require('crypto');
// const nodemailer = require('nodemailer');
// const { PDFDocument } = require('pdf-lib');
// const Document = require('../models/Document');
// const AuditLog = require('../models/AuditLog');

// // ১. Cloudinary কনফিগারেশন
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // ২. মেইল ট্রান্সপোর্টার
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: { 
//     user: process.env.EMAIL_USER, 
//     pass: process.env.EMAIL_PASS 
//   },
// });

// const upload = multer({ storage: multer.memoryStorage() });

// // --- HELPER FUNCTIONS ---

// const getClientIp = (req) => {
//   return req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || "127.0.0.1";
// };

// const sendSigningEmail = async (party, docTitle, token) => {
//   const signLink = `http://localhost:5173/sign?token=${token}`;
//   const mailOptions = {
//     from: `"NexSign" <${process.env.EMAIL_USER}>`,
//     to: party.email,
//     subject: `Signature Request: ${docTitle}`,
//     html: `
//       <div style="font-family:sans-serif;padding:20px;border:1px solid #eee;border-radius:10px;">
//         <h2 style="color:#0ea5e9;">Hello ${party.name},</h2>
//         <p>You have been requested to sign the document: <b>${docTitle}</b></p>
//         <div style="margin:20px 0;">
//           <a href="${signLink}" style="background:#0ea5e9;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;font-weight:bold;">Sign Document Now</a>
//         </div>
//       </div>
//     `,
//   };
//   return transporter.sendMail(mailOptions);
// };

// const generateAndSendFinalDoc = async (doc) => {
//   try {
//     const response = await axios.get(doc.fileUrl, { responseType: 'arraybuffer' });
//     const pdfDoc = await PDFDocument.load(response.data);
//     const pages = pdfDoc.getPages();

//     // Fields প্রসেসিং
//     const processedFields = doc.fields.map(f => typeof f === 'string' ? JSON.parse(f) : f);

//     for (const f of processedFields) {
//       if (f.type === 'signature' && f.value) {
//         const pageIndex = Number(f.page) - 1;
//         if (pageIndex >= 0 && pageIndex < pages.length) {
//           const page = pages[pageIndex];
//           const { width, height } = page.getSize();
//           const base64Data = f.value.includes(',') ? f.value.split(',')[1] : f.value;
//           const sigImg = await pdfDoc.embedPng(Buffer.from(base64Data, 'base64'));

//           page.drawImage(sigImg, {
//             x: (Number(f.x) * width) / 100,
//             y: height - ((Number(f.y) * height) / 100) - ((Number(f.height) * height) / 100),
//             width: (Number(f.width) * width) / 100,
//             height: (Number(f.height) * height) / 100,
//           });
//         }
//       }
//     }
//     const pdfBytes = await pdfDoc.save();
//     const emails = doc.parties.map(p => p.email).join(',');
    
//     await transporter.sendMail({
//       from: `"NexSign" <${process.env.EMAIL_USER}>`,
//       to: emails,
//       subject: `Completed & Signed: ${doc.title}`,
//       text: `All parties have signed. Attached is the final copy.`,
//       attachments: [{ filename: `${doc.title}_signed.pdf`, content: Buffer.from(pdfBytes), contentType: 'application/pdf' }]
//     });
//   } catch (err) { console.error("Final PDF Error:", err); }
// };

// // --- ROUTES ---

// // ১. ফাইল আপলোড
// router.post('/upload', upload.single('file'), async (req, res) => {
//   try {
//     const result = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream({ resource_type: "raw", folder: "nexsign_docs" }, (err, res) => err ? reject(err) : resolve(res));
//       stream.end(req.file.buffer);
//     });
//     const newDoc = new Document({ 
//       title: req.file.originalname.replace('.pdf', ''), 
//       fileUrl: result.secure_url, 
//       fileId: result.public_id 
//     });
//     await newDoc.save();
//     await new AuditLog({ document_id: newDoc._id, action: 'created', ip_address: getClientIp(req), details: 'Uploaded.' }).save();
//     res.json(newDoc);
//   } catch (err) { res.status(500).json({ error: "Upload failed" }); }
// });

// // ২. রিট্রিভ
// router.get('/:id', async (req, res) => {
//   try {
//     const doc = await Document.findById(req.params.id);
//     res.json(doc);
//   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// });
// // ড্যাশবোর্ডের জন্য সব ডকুমেন্ট একসাথে পাওয়ার রাউট
// router.get('/', async (req, res) => {
//   try {
//     // ডাটাবেস থেকে সব ফাইল খুঁজে বের করা এবং নতুনগুলো উপরে রাখা
//     const documents = await Document.find().sort({ createdAt: -1 });
//     res.json(documents);
//   } catch (err) {
//     console.error("Error fetching all docs:", err);
//     res.status(500).json({ error: "Failed to fetch documents" });
//   }
// });

// // ৩. আপডেট ড্রাফট
// router.put('/:id', async (req, res) => {
//   try {
//     const updated = await Document.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
//     res.json(updated);
//   } catch (err) { res.status(500).json({ error: "Save failed" }); }
// });

// // ৪. ইনভাইট পাঠানো
// router.post('/send', async (req, res) => {
//   try {
//     const doc = await Document.findById(req.body.id);
//     const token = crypto.randomBytes(32).toString('hex');
//     doc.parties[0].token = token;
//     doc.parties[0].status = 'sent';
//     doc.status = 'in_progress';
//     await doc.save();
//     await new AuditLog({ document_id: doc._id, action: 'sent', party_name: doc.parties[0].name, party_email: doc.parties[0].email, ip_address: getClientIp(req), details: 'Sent to first signer.' }).save();
//     await sendSigningEmail(doc.parties[0], doc.title, token);
//     res.json({ success: true });
//   } catch (err) { res.status(500).json({ error: "Send failed" }); }
// });

// // ৫. সাইনার ভিউ (SIGNER INDEX & AWAITING FIX)
// router.get('/sign/:token', async (req, res) => {
//   try {
//     const doc = await Document.findOne({ "parties.token": req.params.token });
//     if (!doc) return res.status(404).json({ error: "Invalid link" });
    
//     const party = doc.parties.find(p => p.token === req.params.token);
//     const partyIndex = doc.parties.indexOf(party);

//     // Fields প্রসেসিং এবং Signer Index ম্যাচিং
//     const formattedFields = doc.fields.map(f => {
//       const fieldData = typeof f === 'string' ? JSON.parse(f) : f;
//       return {
//         ...fieldData,
//         // নিশ্চিত করা যে index নম্বর হিসেবে চেক হচ্ছে
//         isMine: parseInt(fieldData.signerIndex) === partyIndex 
//       };
//     });

//     await new AuditLog({ 
//       document_id: doc._id, 
//       action: 'opened', 
//       party_name: party.name, 
//       party_email: party.email, 
//       ip_address: getClientIp(req), 
//       details: 'Signer interface loaded.' 
//     }).save();

//     res.json({ 
//       document: { ...doc.toObject(), fields: formattedFields }, 
//       party: { ...party.toObject(), index: partyIndex } 
//     });
//   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// });

// // ৬. সাইন সাবমিট
// router.post('/sign/submit', async (req, res) => {
//   try {
//     const { token, fields } = req.body;
//     const doc = await Document.findOne({ "parties.token": token });
//     const idx = doc.parties.findIndex(p => p.token === token);
//     const signer = doc.parties[idx];

//     doc.parties[idx].status = 'signed';
//     doc.parties[idx].token = null; 
//     doc.fields = fields;
//     await doc.save();

//     await new AuditLog({ document_id: doc._id, action: 'signed', party_name: signer.name, party_email: signer.email, ip_address: getClientIp(req), details: 'Successfully signed.' }).save();

//     if (idx + 1 < doc.parties.length) {
//       const nextToken = crypto.randomBytes(32).toString('hex');
//       doc.parties[idx + 1].token = nextToken;
//       doc.parties[idx + 1].status = 'sent';
//       await doc.save();
//       await sendSigningEmail(doc.parties[idx + 1], doc.title, nextToken);
//       res.json({ success: true, next: true });
//     } else {
//       doc.status = 'completed';
//       await doc.save();
//       await new AuditLog({ document_id: doc._id, action: 'completed', details: 'All parties signed. PDF finalized.' }).save();
//       generateAndSendFinalDoc(doc);
//       res.json({ success: true, completed: true });
//     }
//   } catch (err) { res.status(500).json({ error: "Submit failed" }); }
// });

// // ৭. পিডিএফ প্রক্সি
// router.get('/proxy/*', async (req, res) => {
//   try {
//     const path = req.params[0];
//     const cloudinaryUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${path}`;
    
//     const response = await axios.get(cloudinaryUrl, { responseType: 'stream' });
//     res.setHeader('Content-Type', 'application/pdf');
//     response.data.pipe(res);
//   } catch (err) {
//     res.status(404).send("Cloudinary PDF Not Found");
//   }
// });

// // ৮. অডিট হিস্ট্রি
// router.get('/:id/history', async (req, res) => {
//   try {
//     const logs = await AuditLog.find({ document_id: req.params.id }).sort({ timestamp: -1 });
//     res.json(logs);
//   } catch (err) { res.status(500).json({ error: "History fetch error" }); }
// });

// // চূড়ান্ত স্বাক্ষরিত পিডিএফ সরাসরি ব্রাউজারে দেখার প্রক্সি
// // ✅ এটি নতুন যোগ করবেন (Final Signed PDF ভিউ করার জন্য)
// router.get('/view-signed/:id', async (req, res) => {
//   try {
//     const doc = await Document.findById(req.params.id);
    
//     if (!doc) return res.status(404).send("Document not found");

//     // যদি স্ট্যাটাস completed না হয়, তবে তাকে ফাইলটি দেখতে দেওয়া হবে না
//     if (doc.status !== 'completed') {
//       return res.status(403).send("This document is not yet fully signed.");
//     }

//     // Cloudinary থেকে স্বাক্ষরসহ ফাইনাল পিডিএফ ইউআরএল নিয়ে আসা
//     const response = await axios.get(doc.fileUrl, { responseType: 'stream' });
    
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `inline; filename="${doc.title}_signed.pdf"`);
    
//     response.data.pipe(res);
//   } catch (err) {
//     console.error("View Final PDF Error:", err.message);
//     res.status(500).send("Error loading signed document");
//   }
// });
// module.exports = router;

// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const axios = require('axios');
// const { v2: cloudinary } = require('cloudinary');
// const crypto = require('crypto');
// const nodemailer = require('nodemailer');
// const { PDFDocument } = require('pdf-lib');
// const Document = require('../models/Document');
// const AuditLog = require('../models/AuditLog');

// // 1. Cloudinary Configuration
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // 2. Mail Transporter
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: { 
//     user: process.env.EMAIL_USER, 
//     pass: process.env.EMAIL_PASS 
//   },
// });

// const upload = multer({ storage: multer.memoryStorage() });

// // --- HELPER FUNCTIONS ---

// const getClientIp = (req) => {
//   return req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || "127.0.0.1";
// };

// const sendSigningEmail = async (party, docTitle, token) => {
//   const signLink = `http://localhost:5173/sign?token=${token}`;
//   const mailOptions = {
//     from: `"NexSign" <${process.env.EMAIL_USER}>`,
//     to: party.email,
//     subject: `Signature Request: ${docTitle}`,
//     html: `
//       <div style="font-family:sans-serif;padding:20px;border:1px solid #eee;border-radius:10px;">
//         <h2 style="color:#0ea5e9;">Hello ${party.name},</h2>
//         <p>You have been requested to sign the document: <b>${docTitle}</b></p>
//         <div style="margin:20px 0;">
//           <a href="${signLink}" style="background:#0ea5e9;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;font-weight:bold;">Sign Document Now</a>
//         </div>
//       </div>
//     `,
//   };
//   return transporter.sendMail(mailOptions);
// };

// const generateAndSendFinalDoc = async (doc) => {
//   try {
//     const response = await axios.get(doc.fileUrl, { responseType: 'arraybuffer' });
//     const pdfDoc = await PDFDocument.load(response.data);
//     const pages = pdfDoc.getPages();

//     const processedFields = doc.fields.map(f => typeof f === 'string' ? JSON.parse(f) : f);

//     for (const f of processedFields) {
//       if (f.type === 'signature' && f.value) {
//         const pageIndex = Number(f.page) - 1;
//         if (pageIndex >= 0 && pageIndex < pages.length) {
//           const page = pages[pageIndex];
//           const { width, height } = page.getSize();
//           const base64Data = f.value.includes(',') ? f.value.split(',')[1] : f.value;
//           const sigImg = await pdfDoc.embedPng(Buffer.from(base64Data, 'base64'));

//           page.drawImage(sigImg, {
//             x: (Number(f.x) * width) / 100,
//             y: height - ((Number(f.y) * height) / 100) - ((Number(f.height) * height) / 100),
//             width: (Number(f.width) * width) / 100,
//             height: (Number(f.height) * height) / 100,
//           });
//         }
//       }
//     }
//     const pdfBytes = await pdfDoc.save();
//     const emails = doc.parties.map(p => p.email).join(',');
    
//     await transporter.sendMail({
//       from: `"NexSign" <${process.env.EMAIL_USER}>`,
//       to: emails,
//       subject: `Completed & Signed: ${doc.title}`,
//       text: `All parties have signed. Attached is the final copy.`,
//       attachments: [{ filename: `${doc.title}_signed.pdf`, content: Buffer.from(pdfBytes), contentType: 'application/pdf' }]
//     });
//   } catch (err) { console.error("Final PDF Error:", err); }
// };

// // --- ROUTES ---

// // 1. Upload
// router.post('/upload', upload.single('file'), async (req, res) => {
//   try {
//     const result = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream({ resource_type: "raw", folder: "nexsign_docs" }, (err, res) => err ? reject(err) : resolve(res));
//       stream.end(req.file.buffer);
//     });
//     const newDoc = new Document({ 
//       title: req.file.originalname.replace('.pdf', ''), 
//       fileUrl: result.secure_url, 
//       fileId: result.public_id 
//     });
//     await newDoc.save();
//     await new AuditLog({ document_id: newDoc._id, action: 'created', ip_address: getClientIp(req), details: 'Uploaded.' }).save();
//     res.json(newDoc);
//   } catch (err) { res.status(500).json({ error: "Upload failed" }); }
// });

// // 2. Fetch All
// router.get('/', async (req, res) => {
//   try {
//     const documents = await Document.find().sort({ createdAt: -1 });
//     res.json(documents);
//   } catch (err) { res.status(500).json({ error: "Failed to fetch documents" }); }
// });

// // 3. Retrieve Single
// router.get('/:id', async (req, res) => {
//   try {
//     const doc = await Document.findById(req.params.id);
//     res.json(doc);
//   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// });

// // 4. Update Draft
// router.put('/:id', async (req, res) => {
//   try {
//     const updated = await Document.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
//     res.json(updated);
//   } catch (err) { res.status(500).json({ error: "Save failed" }); }
// });

// // 5. Send Invitations
// router.post('/send', async (req, res) => {
//   try {
//     const doc = await Document.findById(req.body.id);
//     const token = crypto.randomBytes(32).toString('hex');
//     doc.parties[0].token = token;
//     doc.parties[0].status = 'sent';
//     doc.status = 'in_progress';
//     await doc.save();
//     await new AuditLog({ document_id: doc._id, action: 'sent', party_name: doc.parties[0].name, party_email: doc.parties[0].email, ip_address: getClientIp(req), details: 'Sent to first signer.' }).save();
//     await sendSigningEmail(doc.parties[0], doc.title, token);
//     res.json({ success: true });
//   } catch (err) { res.status(500).json({ error: "Send failed" }); }
// });

// // 6. Signer View
// router.get('/sign/:token', async (req, res) => {
//   try {
//     const doc = await Document.findOne({ "parties.token": req.params.token });
//     if (!doc) return res.status(404).json({ error: "Invalid link" });
    
//     const party = doc.parties.find(p => p.token === req.params.token);
//     const partyIndex = doc.parties.indexOf(party);

//     const formattedFields = doc.fields.map(f => {
//       const fieldData = typeof f === 'string' ? JSON.parse(f) : f;
//       return {
//         ...fieldData,
//         isMine: parseInt(fieldData.signerIndex) === partyIndex 
//       };
//     });

//     await new AuditLog({ 
//       document_id: doc._id, 
//       action: 'opened', 
//       party_name: party.name, 
//       party_email: party.email, 
//       ip_address: getClientIp(req), 
//       details: 'Signer interface loaded.' 
//     }).save();

//     res.json({ 
//       document: { ...doc.toObject(), fields: formattedFields }, 
//       party: { ...party.toObject(), index: partyIndex } 
//     });
//   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// });

// // 7. Sign Submit
// router.post('/sign/submit', async (req, res) => {
//   try {
//     const { token, fields } = req.body;
//     const doc = await Document.findOne({ "parties.token": token });
//     const idx = doc.parties.findIndex(p => p.token === token);
//     const signer = doc.parties[idx];

//     doc.parties[idx].status = 'signed';
//     doc.parties[idx].token = null; 
//     doc.fields = fields;
//     await doc.save();

//     await new AuditLog({ document_id: doc._id, action: 'signed', party_name: signer.name, party_email: signer.email, ip_address: getClientIp(req), details: 'Successfully signed.' }).save();

//     if (idx + 1 < doc.parties.length) {
//       const nextToken = crypto.randomBytes(32).toString('hex');
//       doc.parties[idx + 1].token = nextToken;
//       doc.parties[idx + 1].status = 'sent';
//       await doc.save();
//       await sendSigningEmail(doc.parties[idx + 1], doc.title, nextToken);
//       res.json({ success: true, next: true });
//     } else {
//       doc.status = 'completed';
//       await doc.save();
//       await new AuditLog({ document_id: doc._id, action: 'completed', details: 'All parties signed. PDF finalized.' }).save();
//       generateAndSendFinalDoc(doc);
//       res.json({ success: true, completed: true });
//     }
//   } catch (err) { res.status(500).json({ error: "Submit failed" }); }
// });

// // 8. PDF Proxy (FIXED FOR CORS)
// router.get('/proxy/*', async (req, res) => {
//   try {
//     const path = req.params[0];
//     const cloudinaryUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${path}`;
    
//     const response = await axios.get(cloudinaryUrl, { responseType: 'stream' });

//     // Explicitly set headers to allow the specific frontend origin with credentials
//     res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
//     res.setHeader('Access-Control-Allow-Credentials', 'true');
//     res.setHeader('Content-Type', 'application/pdf');

//     response.data.pipe(res);
//   } catch (err) {
//     console.error("Proxy Error:", err.message);
//     res.status(404).send("Cloudinary PDF Not Found");
//   }
// });

// // 9. History
// router.get('/:id/history', async (req, res) => {
//   try {
//     const logs = await AuditLog.find({ document_id: req.params.id }).sort({ timestamp: -1 });
//     res.json(logs);
//   } catch (err) { res.status(500).json({ error: "History fetch error" }); }
// });

// // 10. View Final Signed PDF
// router.get('/view-signed/:id', async (req, res) => {
//   try {
//     const doc = await Document.findById(req.params.id);
//     if (!doc || doc.status !== 'completed') {
//       return res.status(403).send("This document is not yet fully signed.");
//     }
//     const response = await axios.get(doc.fileUrl, { responseType: 'stream' });
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `inline; filename="${doc.title}_signed.pdf"`);
//     response.data.pipe(res);
//   } catch (err) {
//     res.status(500).send("Error loading signed document");
//   }
// });

// module.exports = router;


//  const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const axios = require('axios');
// const { v2: cloudinary } = require('cloudinary');
// const crypto = require('crypto');
// const nodemailer = require('nodemailer');
// const { PDFDocument } = require('pdf-lib');
// const Document = require('../models/Document');
// const AuditLog = require('../models/AuditLog');

// // 1. Cloudinary Configuration
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // 2. Mail Transporter
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: { 
//     user: process.env.EMAIL_USER, 
//     pass: process.env.EMAIL_PASS 
//   },
// });

// const upload = multer({ storage: multer.memoryStorage() });

// // --- HELPER FUNCTIONS ---

// const getClientIp = (req) => {
//   return req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || "127.0.0.1";
// };

// const sendSigningEmail = async (party, docTitle, token) => {
//   const signLink = `http://localhost:5173/sign?token=${token}`;
//   const mailOptions = {
//     from: `"NexSign" <${process.env.EMAIL_USER}>`,
//     to: party.email,
//     subject: `Signature Request: ${docTitle}`,
//     html: `
//       <div style="font-family:sans-serif;padding:20px;border:1px solid #eee;border-radius:10px;">
//         <h2 style="color:#0ea5e9;">Hello ${party.name},</h2>
//         <p>You have been requested to sign the document: <b>${docTitle}</b></p>
//         <div style="margin:20px 0;">
//           <a href="${signLink}" style="background:#0ea5e9;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;font-weight:bold;">Sign Document Now</a>
//         </div>
//       </div>
//     `,
//   };
//   return transporter.sendMail(mailOptions);
// };

// const generateAndSendFinalDoc = async (doc) => {
//   try {
//     const response = await axios.get(doc.fileUrl, { responseType: 'arraybuffer' });
//     const pdfDoc = await PDFDocument.load(response.data);
//     const pages = pdfDoc.getPages();

//     const processedFields = doc.fields.map(f => typeof f === 'string' ? JSON.parse(f) : f);

//     for (const f of processedFields) {
//       if (f.type === 'signature' && f.value) {
//         const pageIndex = Number(f.page) - 1;
//         if (pageIndex >= 0 && pageIndex < pages.length) {
//           const page = pages[pageIndex];
//           const { width, height } = page.getSize();
//           const base64Data = f.value.includes(',') ? f.value.split(',')[1] : f.value;
//           const sigImg = await pdfDoc.embedPng(Buffer.from(base64Data, 'base64'));

//           page.drawImage(sigImg, {
//             x: (Number(f.x) * width) / 100,
//             y: height - ((Number(f.y) * height) / 100) - ((Number(f.height) * height) / 100),
//             width: (Number(f.width) * width) / 100,
//             height: (Number(f.height) * height) / 100,
//           });
//         }
//       }
//     }
//     const pdfBytes = await pdfDoc.save();
//     const emails = doc.parties.map(p => p.email).join(',');
    
//     await transporter.sendMail({
//       from: `"NexSign" <${process.env.EMAIL_USER}>`,
//       to: emails,
//       subject: `Completed & Signed: ${doc.title}`,
//       text: `All parties have signed. Attached is the final copy.`,
//       attachments: [{ filename: `${doc.title}_signed.pdf`, content: Buffer.from(pdfBytes), contentType: 'application/pdf' }]
//     });
//   } catch (err) { console.error("Final PDF Error:", err); }
// };

// // --- ROUTES ---

// // 1. Upload
// router.post('/upload', upload.single('file'), async (req, res) => {
//   try {
//     const result = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream({ resource_type: "raw", folder: "nexsign_docs" }, (err, res) => err ? reject(err) : resolve(res));
//       stream.end(req.file.buffer);
//     });
//     const newDoc = new Document({ 
//       title: req.file.originalname.replace('.pdf', ''), 
//       fileUrl: result.secure_url, 
//       fileId: result.public_id 
//     });
//     await newDoc.save();
//     await new AuditLog({ document_id: newDoc._id, action: 'created', ip_address: getClientIp(req), details: 'Uploaded.' }).save();
//     res.json(newDoc);
//   } catch (err) { res.status(500).json({ error: "Upload failed" }); }
// });

// // 2. Fetch All
// router.get('/', async (req, res) => {
//   try {
//     const documents = await Document.find().sort({ createdAt: -1 });
//     res.json(documents);
//   } catch (err) { res.status(500).json({ error: "Failed to fetch documents" }); }
// });

// // 3. Retrieve Single
// router.get('/:id', async (req, res) => {
//   try {
//     const doc = await Document.findById(req.params.id);
//     res.json(doc);
//   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// });

// // 4. Update Draft
// router.put('/:id', async (req, res) => {
//   try {
//     const updated = await Document.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
//     res.json(updated);
//   } catch (err) { res.status(500).json({ error: "Save failed" }); }
// });

// // 5. Send Invitations
// router.post('/send', async (req, res) => {
//   try {
//     const doc = await Document.findById(req.body.id);
//     const token = crypto.randomBytes(32).toString('hex');
//     doc.parties[0].token = token;
//     doc.parties[0].status = 'sent';
//     doc.status = 'in_progress';
//     await doc.save();
//     await new AuditLog({ document_id: doc._id, action: 'sent', party_name: doc.parties[0].name, party_email: doc.parties[0].email, ip_address: getClientIp(req), details: 'Sent to first signer.' }).save();
//     await sendSigningEmail(doc.parties[0], doc.title, token);
//     res.json({ success: true });
//   } catch (err) { res.status(500).json({ error: "Send failed" }); }
// });

// // 6. Signer View
// router.get('/sign/:token', async (req, res) => {
//   try {
//     const doc = await Document.findOne({ "parties.token": req.params.token });
//     if (!doc) return res.status(404).json({ error: "Invalid link" });
    
//     const party = doc.parties.find(p => p.token === req.params.token);
//     const partyIndex = doc.parties.indexOf(party);

//     const formattedFields = doc.fields.map(f => {
//       const fieldData = typeof f === 'string' ? JSON.parse(f) : f;
//       return {
//         ...fieldData,
//         isMine: parseInt(fieldData.signerIndex) === partyIndex 
//       };
//     });

//     await new AuditLog({ 
//       document_id: doc._id, 
//       action: 'opened', 
//       party_name: party.name, 
//       party_email: party.email, 
//       ip_address: getClientIp(req), 
//       details: 'Signer interface loaded.' 
//     }).save();

//     res.json({ 
//       document: { ...doc.toObject(), fields: formattedFields }, 
//       party: { ...party.toObject(), index: partyIndex } 
//     });
//   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// });

// // 7. Sign Submit
// router.post('/sign/submit', async (req, res) => {
//   try {
//     const { token, fields } = req.body;
//     const doc = await Document.findOne({ "parties.token": token });
//     const idx = doc.parties.findIndex(p => p.token === token);
//     const signer = doc.parties[idx];

//     doc.parties[idx].status = 'signed';
//     doc.parties[idx].token = null; 
//     doc.fields = fields;
//     await doc.save();

//     await new AuditLog({ document_id: doc._id, action: 'signed', party_name: signer.name, party_email: signer.email, ip_address: getClientIp(req), details: 'Successfully signed.' }).save();

//     if (idx + 1 < doc.parties.length) {
//       const nextToken = crypto.randomBytes(32).toString('hex');
//       doc.parties[idx + 1].token = nextToken;
//       doc.parties[idx + 1].status = 'sent';
//       await doc.save();
//       await sendSigningEmail(doc.parties[idx + 1], doc.title, nextToken);
//       res.json({ success: true, next: true });
//     } else {
//       doc.status = 'completed';
//       await doc.save();
//       await new AuditLog({ document_id: doc._id, action: 'completed', details: 'All parties signed. PDF finalized.' }).save();
//       generateAndSendFinalDoc(doc);
//       res.json({ success: true, completed: true });
//     }
//   } catch (err) { res.status(500).json({ error: "Submit failed" }); }
// });

// // 8. PDF Proxy (FIXED FOR CORS)
// router.get('/proxy/*', async (req, res) => {
//   try {
//     const path = req.params[0];
//     const cloudinaryUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${path}`;
    
//     const response = await axios.get(cloudinaryUrl, { responseType: 'stream' });

//     // Explicitly set headers to allow the specific frontend origin with credentials
//     res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
//     res.setHeader('Access-Control-Allow-Credentials', 'true');
//     res.setHeader('Content-Type', 'application/pdf');

//     response.data.pipe(res);
//   } catch (err) {
//     console.error("Proxy Error:", err.message);
//     res.status(404).send("Cloudinary PDF Not Found");
//   }
// });

// // 9. History
// router.get('/:id/history', async (req, res) => {
//   try {
//     const logs = await AuditLog.find({ document_id: req.params.id }).sort({ timestamp: -1 });
//     res.json(logs);
//   } catch (err) { res.status(500).json({ error: "History fetch error" }); }
// });

// // 10. View Final Signed PDF
// router.get('/view-signed/:id', async (req, res) => {
//   try {
//     const doc = await Document.findById(req.params.id);
//     if (!doc || doc.status !== 'completed') {
//       return res.status(403).send("This document is not yet fully signed.");
//     }
//     const response = await axios.get(doc.fileUrl, { responseType: 'stream' });
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `inline; filename="${doc.title}_signed.pdf"`);
//     response.data.pipe(res);
//   } catch (err) {
//     res.status(500).send("Error loading signed document");
//   }
// });

// module.exports = router;


// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const axios = require('axios');
// const { v2: cloudinary } = require('cloudinary');
// const crypto = require('crypto');
// const nodemailer = require('nodemailer');
// const { PDFDocument } = require('pdf-lib');
// const Document = require('../models/Document');
// const AuditLog = require('../models/AuditLog');

// // 1. Cloudinary Configuration
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // 2. Mail Transporter
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: { 
//     user: process.env.EMAIL_USER, 
//     pass: process.env.EMAIL_PASS 
//   },
// });

// const upload = multer({ storage: multer.memoryStorage() });

// // --- HELPER FUNCTIONS ---

// const getClientIp = (req) => {
//   return req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || "127.0.0.1";
// };

// const sendSigningEmail = async (party, docTitle, token) => {
//   const signLink = `http://localhost:5173/sign?token=${token}`;
//   const mailOptions = {
//     from: `"NexSign" <${process.env.EMAIL_USER}>`,
//     to: party.email,
//     subject: `Signature Request: ${docTitle}`,
//     html: `
//       <div style="font-family:sans-serif;padding:20px;border:1px solid #eee;border-radius:10px;">
//         <h2 style="color:#0ea5e9;">Hello ${party.name},</h2>
//         <p>You have been requested to sign the document: <b>${docTitle}</b></p>
//         <div style="margin:20px 0;">
//           <a href="${signLink}" style="background:#0ea5e9;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;font-weight:bold;">Sign Document Now</a>
//         </div>
//       </div>
//     `,
//   };
//   return transporter.sendMail(mailOptions);
// };

// // Merging Logic Helper (Extracted for reuse)
// const mergeSignatures = async (doc) => {
//   const response = await axios.get(doc.fileUrl, { responseType: 'arraybuffer' });
//   const pdfDoc = await PDFDocument.load(response.data);
//   const pages = pdfDoc.getPages();
//   const processedFields = doc.fields.map(f => typeof f === 'string' ? JSON.parse(f) : f);

//   for (const f of processedFields) {
//     if (f.type === 'signature' && f.value) {
//       const pageIndex = Number(f.page) - 1;
//       if (pageIndex >= 0 && pageIndex < pages.length) {
//         const page = pages[pageIndex];
//         const { width, height } = page.getSize();
//         const base64Data = f.value.includes(',') ? f.value.split(',')[1] : f.value;
//         const sigImg = await pdfDoc.embedPng(Buffer.from(base64Data, 'base64'));

//         page.drawImage(sigImg, {
//           x: (Number(f.x) * width) / 100,
//           y: height - ((Number(f.y) * height) / 100) - ((Number(f.height) * height) / 100),
//           width: (Number(f.width) * width) / 100,
//           height: (Number(f.height) * height) / 100,
//         });
//       }
//     }
//   }
//   return await pdfDoc.save();
// };

// const generateAndSendFinalDoc = async (doc) => {
//   try {
//     const pdfBytes = await mergeSignatures(doc);
//     const emails = doc.parties.map(p => p.email).join(',');
//     await transporter.sendMail({
//       from: `"NexSign" <${process.env.EMAIL_USER}>`,
//       to: emails,
//       subject: `Completed & Signed: ${doc.title}`,
//       text: `All parties have signed. Attached is the final copy.`,
//       attachments: [{ filename: `${doc.title}_signed.pdf`, content: Buffer.from(pdfBytes), contentType: 'application/pdf' }]
//     });
//   } catch (err) { console.error("Final PDF Email Error:", err); }
// };

// // --- ROUTES ---

// router.post('/upload', upload.single('file'), async (req, res) => {
//   try {
//     const result = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream({ resource_type: "raw", folder: "nexsign_docs" }, (err, res) => err ? reject(err) : resolve(res));
//       stream.end(req.file.buffer);
//     });
//     const newDoc = new Document({ title: req.file.originalname.replace('.pdf', ''), fileUrl: result.secure_url, fileId: result.public_id });
//     await newDoc.save();
//     res.json(newDoc);
//   } catch (err) { res.status(500).json({ error: "Upload failed" }); }
// });

// router.get('/', async (req, res) => {
//   try {
//     const documents = await Document.find().sort({ createdAt: -1 });
//     res.json(documents);
//   } catch (err) { res.status(500).json({ error: "Failed to fetch documents" }); }
// });

// router.get('/:id', async (req, res) => {
//   try {
//     const doc = await Document.findById(req.params.id);
//     res.json(doc);
//   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// });

// router.put('/:id', async (req, res) => {
//   try {
//     const updated = await Document.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
//     res.json(updated);
//   } catch (err) { res.status(500).json({ error: "Save failed" }); }
// });

// router.post('/send', async (req, res) => {
//   try {
//     const doc = await Document.findById(req.body.id);
//     const token = crypto.randomBytes(32).toString('hex');
//     doc.parties[0].token = token;
//     doc.parties[0].status = 'sent';
//     doc.status = 'in_progress';
//     await doc.save();
//     await sendSigningEmail(doc.parties[0], doc.title, token);
//     res.json({ success: true });
//   } catch (err) { res.status(500).json({ error: "Send failed" }); }
// });

// router.get('/sign/:token', async (req, res) => {
//   try {
//     const doc = await Document.findOne({ "parties.token": req.params.token });
//     if (!doc) return res.status(404).json({ error: "Invalid link" });
//     const party = doc.parties.find(p => p.token === req.params.token);
//     const partyIndex = doc.parties.indexOf(party);
//     const formattedFields = doc.fields.map(f => {
//       const fieldData = typeof f === 'string' ? JSON.parse(f) : f;
//       return { ...fieldData, isMine: parseInt(fieldData.signerIndex) === partyIndex };
//     });
//     res.json({ document: { ...doc.toObject(), fields: formattedFields }, party: { ...party.toObject(), index: partyIndex } });
//   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// });

// router.post('/sign/submit', async (req, res) => {
//   try {
//     const { token, fields } = req.body;
//     const doc = await Document.findOne({ "parties.token": token });
//     const idx = doc.parties.findIndex(p => p.token === token);
//     doc.parties[idx].status = 'signed';
//     doc.parties[idx].token = null; 
//     doc.fields = fields;
//     await doc.save();
//     if (idx + 1 < doc.parties.length) {
//       const nextToken = crypto.randomBytes(32).toString('hex');
//       doc.parties[idx + 1].token = nextToken;
//       doc.parties[idx + 1].status = 'sent';
//       await doc.save();
//       await sendSigningEmail(doc.parties[idx + 1], doc.title, nextToken);
//       res.json({ success: true, next: true });
//     } else {
//       doc.status = 'completed';
//       await doc.save();
//       generateAndSendFinalDoc(doc);
//       res.json({ success: true, completed: true });
//     }
//   } catch (err) { res.status(500).json({ error: "Submit failed" }); }
// });

// router.get('/proxy/*', async (req, res) => {
//   try {
//     const path = req.params[0];
//     const cloudinaryUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${path}`;
//     const response = await axios.get(cloudinaryUrl, { responseType: 'stream' });
//     res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
//     res.setHeader('Access-Control-Allow-Credentials', 'true');
//     res.setHeader('Content-Type', 'application/pdf');
//     response.data.pipe(res);
//   } catch (err) { res.status(404).send("Cloudinary PDF Not Found"); }
// });

// router.get('/:id/history', async (req, res) => {
//   try {
//     const logs = await AuditLog.find({ document_id: req.params.id }).sort({ timestamp: -1 });
//     res.json(logs);
//   } catch (err) { res.status(500).json({ error: "History fetch error" }); }
// });

// // 10. View Final Signed PDF (FIXED: Now merges signatures before showing)
// router.get('/view-signed/:id', async (req, res) => {
//   try {
//     const doc = await Document.findById(req.params.id);
//     if (!doc || doc.status !== 'completed') {
//       return res.status(403).send("This document is not yet fully signed.");
//     }

//     // Reuse the merging logic
//     const pdfBytes = await mergeSignatures(doc);
    
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `inline; filename="${doc.title}_signed.pdf"`);
//     res.send(Buffer.from(pdfBytes));

//   } catch (err) {
//     console.error("View Final PDF Error:", err);
//     res.status(500).send("Error loading signed document");
//   }
// });

// module.exports = router;

// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const axios = require('axios');
// const { v2: cloudinary } = require('cloudinary');
// const crypto = require('crypto');
// const nodemailer = require('nodemailer');
// const { PDFDocument } = require('pdf-lib');
// const Document = require('../models/Document');
// const AuditLog = require('../models/AuditLog');

// // 1. Cloudinary Configuration
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // 2. Mail Transporter
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: { 
//     user: process.env.EMAIL_USER, 
//     pass: process.env.EMAIL_PASS 
//   },
// });

// const upload = multer({ storage: multer.memoryStorage() });

// // --- HELPER FUNCTIONS ---

// const logActivity = async (docId, action, req, details = {}, party = {}) => {
//   try {
//     await AuditLog.create({
//       document_id: docId,
//       action,
//       party_name: party.name || "System",
//       party_email: party.email || "system@nexsign.com",
//       ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
//       details: typeof details === 'string' ? details : JSON.stringify(details)
//     });
//   } catch (err) { console.error("Audit Logging Failed:", err); }
// };

// const sendSigningEmail = async (party, docTitle, token, req) => {
//   // প্রোডাকশনে localhost পরিবর্তন করে আপনার ফ্রন্টএন্ড ডোমেইন দিন
//   const baseUrl = req.headers.origin || "http://localhost:5173";
//   const signLink = `${baseUrl}/sign?token=${token}`;
  
//   const mailOptions = {
//     from: `"NexSign" <${process.env.EMAIL_USER}>`,
//     to: party.email,
//     subject: `Signature Request: ${docTitle}`,
//     html: `
//       <div style="font-family:sans-serif;padding:20px;border:1px solid #eee;border-radius:10px;">
//         <h2 style="color:#0ea5e9;">Hello ${party.name},</h2>
//         <p>You have been requested to sign: <b>${docTitle}</b></p>
//         <a href="${signLink}" style="display:inline-block;background:#0ea5e9;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;font-weight:bold;margin-top:10px;">Sign Document Now</a>
//       </div>
//     `,
//   };
//   return transporter.sendMail(mailOptions);
// };

// const mergeSignatures = async (doc) => {
//   const response = await axios.get(doc.fileUrl, { responseType: 'arraybuffer' });
//   const pdfDoc = await PDFDocument.load(response.data);
//   const pages = pdfDoc.getPages();
  
//   // Mixed টাইপ হ্যান্ডলিং
//   const processedFields = doc.fields.map(f => typeof f === 'string' ? JSON.parse(f) : f);

//   for (const f of processedFields) {
//     if (f.type === 'signature' && f.value) {
//       try {
//         const pageIndex = Number(f.page) - 1;
//         if (pageIndex >= 0 && pageIndex < pages.length) {
//           const page = pages[pageIndex];
//           const { width, height } = page.getSize();
          
//           const base64Data = f.value.includes(',') ? f.value.split(',')[1] : f.value;
//           const sigImg = await pdfDoc.embedPng(Buffer.from(base64Data, 'base64'));

//           page.drawImage(sigImg, {
//             x: (Number(f.x) * width) / 100,
//             y: height - ((Number(f.y) * height) / 100) - ((Number(f.height) * height) / 100),
//             width: (Number(f.width) * width) / 100,
//             height: (Number(f.height) * height) / 100,
//           });
//         }
//       } catch (err) { console.error("Field Embedding Error:", err); }
//     }
//   }
//   return await pdfDoc.save();
// };

// // --- ROUTES ---

// router.post('/upload', upload.single('file'), async (req, res) => {
//   try {
//     const result = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream({ resource_type: "raw", folder: "nexsign_docs" }, (err, res) => err ? reject(err) : resolve(res));
//       stream.end(req.file.buffer);
//     });
//     const newDoc = new Document({ 
//       title: req.file.originalname.replace('.pdf', ''), 
//       fileUrl: result.secure_url, 
//       fileId: result.public_id 
//     });
//     await newDoc.save();
//     await logActivity(newDoc._id, 'created', req, "Document uploaded to Cloudinary");
//     res.json(newDoc);
//   } catch (err) { res.status(500).json({ error: "Upload failed" }); }
// });

// router.post('/send', async (req, res) => {
//   try {
//     const doc = await Document.findById(req.body.id);
//     if(!doc) return res.status(404).json({error: "Not found"});
    
//     const token = crypto.randomBytes(32).toString('hex');
//     doc.parties[0].token = token;
//     doc.parties[0].status = 'sent';
//     doc.status = 'in_progress';
    
//     await doc.save();
//     await sendSigningEmail(doc.parties[0], doc.title, token, req);
//     await logActivity(doc._id, 'sent', req, `Invitation sent to ${doc.parties[0].email}`, doc.parties[0]);
    
//     res.json({ success: true });
//   } catch (err) { res.status(500).json({ error: "Send failed" }); }
// });

// // router.get('/sign/:token', async (req, res) => {
// //   try {
// //     const doc = await Document.findOne({ "parties.token": req.params.token });
// //     if (!doc) return res.status(404).json({ error: "Invalid link" });
    
// //     const party = doc.parties.find(p => p.token === req.params.token);
// //     await logActivity(doc._id, 'opened', req, "Signer opened the link", party);
    
// //     const partyIndex = doc.parties.indexOf(party);
// //     const formattedFields = doc.fields.map(f => {
// //       const fieldData = typeof f === 'string' ? JSON.parse(f) : f;
// //       return { ...fieldData, isMine: parseInt(fieldData.signerIndex) === partyIndex };
// //     });
    
// //     res.json({ document: { ...doc.toObject(), fields: formattedFields }, party });
// //   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// // });
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
//     const { token, fields } = req.body;
//     const doc = await Document.findOne({ "parties.token": token });
//     if(!doc) return res.status(404).json({error: "Invalid session"});

//     const idx = doc.parties.findIndex(p => p.token === token);
//     const currentParty = doc.parties[idx];

//     doc.parties[idx].status = 'signed';
//     doc.parties[idx].token = null; 
//     doc.parties[idx].signedAt = new Date();
    
//     // মিক্সড টাইপ আপডেট নিশ্চিত করা
//     doc.fields = fields;
//     doc.markModified('fields'); 
    
//     await logActivity(doc._id, 'signed', req, "Party signed the document", currentParty);

//     if (idx + 1 < doc.parties.length) {
//       const nextToken = crypto.randomBytes(32).toString('hex');
//       doc.parties[idx + 1].token = nextToken;
//       doc.parties[idx + 1].status = 'sent';
//       await doc.save();
//       await sendSigningEmail(doc.parties[idx + 1], doc.title, nextToken, req);
//       res.json({ success: true, next: true });
//     } else {
//       doc.status = 'completed';
//       await doc.save();
//       await logActivity(doc._id, 'completed', req, "All parties have signed");
//       // ব্যাকগ্রাউন্ডে ইমেইল পাঠানো (Response দ্রুত করার জন্য)
//       generateAndSendFinalDoc(doc);
//       res.json({ success: true, completed: true });
//     }
//   } catch (err) { res.status(500).json({ error: "Submit failed" }); }
// });

// // routes/documentRoutes.js এ এই রাউটটি আপডেট করুন
// // router.get('/proxy/*', async (req, res) => {
// //   try {
// //     // URL থেকে আইডি উদ্ধার করা (যেমন: nexsign_docs/abc123xyz)
// //     const fullPath = req.params[0]; 
    
// //     if (!fullPath) return res.status(400).send("File ID is required");

// //     // Cloudinary URL তৈরি
// //     const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${fullPath}`;
    
// //     console.log("Fetching PDF from:", url);

// //     const response = await axios.get(url, { 
// //       responseType: 'stream',
// //       timeout: 10000 
// //     });

// //     // হেডার সেট করা
// //     res.setHeader('Content-Type', 'application/pdf');
// //     response.data.pipe(res);
// //   } catch (err) {
// //     console.error("Proxy Error:", err.message);
// //     res.status(404).send("PDF Not Found");
// //   }
// // });
// // আপনার বর্তমান প্রক্সি রাউটটি এইভাবে আপডেট করা আছে
// router.get('/proxy/*', async (req, res) => {
//   try {
//     let fullPath = req.params[0]; // এটি 'nexsign_docs/xyz' অথবা শুধু 'xyz' রিসিভ করে
    
//     if (!fullPath) return res.status(400).send("File ID is required");

//     // যদি ফ্রন্টএন্ড থেকে শুধু আইডি আসে (যেমন: mpnswl...), তবে ফোল্ডার পাথ যোগ করুন
//     if (!fullPath.includes('/')) {
//       fullPath = `nexsign_docs/${fullPath}`;
//     }

//     const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${fullPath}`;
    
//     console.log("Fetching PDF from:", url);

//     const response = await axios.get(url, { 
//       responseType: 'stream',
//       timeout: 15000 // টাইমআউট একটু বাড়িয়ে দেওয়া ভালো
//     });

//     res.setHeader('Content-Type', 'application/pdf');
//     response.data.pipe(res);
//   } catch (err) {
//     console.error("Proxy Error:", err.message);
//     res.status(404).send("PDF Not Found on Cloudinary");
//   }
// });
// // --- সব ডকুমেন্ট লিস্ট আকারে পাওয়ার রাউট (এটি যোগ করুন) ---
// router.get('/', async (req, res) => {
//   try {
//     // ডাটাবেস থেকে সব ডকুমেন্ট লেটেস্ট অনুযায়ী নিয়ে আসা
//     const documents = await Document.find().sort({ createdAt: -1 });
//     res.json(documents);
//   } catch (err) {
//     console.error("Fetch Documents Error:", err);
//     res.status(500).json({ error: "Failed to fetch documents" });
//   }
// });

// // // একটি নির্দিষ্ট আইডি দিয়ে সিঙ্গেল ডকুমেন্ট পাওয়ার রাউট (এটি বসান)
// router.get('/:id', async (req, res) => {
//   try {
//     const doc = await Document.findById(req.params.id);
//     if (!doc) return res.status(404).json({ error: "Document not found" });
//     res.json(doc);
//   } catch (err) {
//     res.status(500).json({ error: "Error fetching document" });
//   }
// });

// // // ১. ডকুমেন্ট আপডেট করার জন্য PUT রাউট যোগ করুন
// router.put('/:id', async (req, res) => {
//   try {
//     const { fields, parties, status } = req.body;
    
//     // ডাটাবেসে ডকুমেন্ট খুঁজে ফিল্ড এবং পার্টি লিস্ট আপডেট করা
//     const updatedDoc = await Document.findByIdAndUpdate(
//       req.params.id,
//       { 
//         $set: { 
//           fields: fields,
//           parties: parties,
//           status: status || 'draft' 
//         } 
//       },
//       { new: true } 
//     );

//     if (!updatedDoc) {
//       return res.status(404).json({ error: "Document not found to update" });
//     }

//     res.json(updatedDoc);
//   } catch (err) {
//     console.error("Update Error:", err);
//     res.status(500).json({ error: "Failed to update document" });
//   }
// });
// module.exports = router;
// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const axios = require('axios');
// const { v2: cloudinary } = require('cloudinary');
// const crypto = require('crypto');
// const nodemailer = require('nodemailer');
// const { PDFDocument } = require('pdf-lib');
// const Document = require('../models/Document');
// const AuditLog = require('../models/AuditLog');

// // 1. Cloudinary Configuration
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // 2. Mail Transporter
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: { 
//     user: process.env.EMAIL_USER, 
//     pass: process.env.EMAIL_PASS 
//   },
// });

// const upload = multer({ storage: multer.memoryStorage() });

// // --- HELPER FUNCTIONS ---

// const logActivity = async (docId, action, req, details = {}, party = {}) => {
//   try {
//     await AuditLog.create({
//       document_id: docId,
//       action,
//       party_name: party.name || "System",
//       party_email: party.email || "system@nexsign.com",
//       ip_address: req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : "127.0.0.1",
//       details: typeof details === 'string' ? details : JSON.stringify(details)
//     });
//   } catch (err) { console.error("Audit Logging Failed:", err); }
// };

// const sendSigningEmail = async (party, docTitle, token, req) => {
//   const baseUrl = req.headers.origin || "http://localhost:5173";
//   const signLink = `${baseUrl}/sign?token=${token}`;
  
//   const mailOptions = {
//     from: `"NexSign" <${process.env.EMAIL_USER}>`,
//     to: party.email,
//     subject: `Signature Request: ${docTitle}`,
//     html: `
//       <div style="font-family:sans-serif;padding:20px;border:1px solid #eee;border-radius:10px;">
//         <h2 style="color:#0ea5e9;">Hello ${party.name},</h2>
//         <p>You have been requested to sign: <b>${docTitle}</b></p>
//         <a href="${signLink}" style="display:inline-block;background:#0ea5e9;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;font-weight:bold;margin-top:10px;">Sign Document Now</a>
//       </div>
//     `,
//   };
//   return transporter.sendMail(mailOptions);
// };

// const mergeSignatures = async (doc) => {
//   const response = await axios.get(doc.fileUrl, { responseType: 'arraybuffer' });
//   const pdfDoc = await PDFDocument.load(response.data);
//   const pages = pdfDoc.getPages();
  
//   const processedFields = doc.fields.map(f => typeof f === 'string' ? JSON.parse(f) : f);

//   for (const f of processedFields) {
//     if (f.type === 'signature' && f.value) {
//       try {
//         const pageIndex = Number(f.page) - 1;
//         if (pageIndex >= 0 && pageIndex < pages.length) {
//           const page = pages[pageIndex];
//           const { width, height } = page.getSize();
          
//           const base64Data = f.value.includes(',') ? f.value.split(',')[1] : f.value;
//           const sigImg = await pdfDoc.embedPng(Buffer.from(base64Data, 'base64'));

//           page.drawImage(sigImg, {
//             x: (Number(f.x) * width) / 100,
//             y: height - ((Number(f.y) * height) / 100) - ((Number(f.height) * height) / 100),
//             width: (Number(f.width) * width) / 100,
//             height: (Number(f.height) * height) / 100,
//           });
//         }
//       } catch (err) { console.error("Field Embedding Error:", err); }
//     }
//   }
//   return await pdfDoc.save();
// };

// const generateAndSendFinalDoc = async (doc) => {
//   try {
//     const pdfBytes = await mergeSignatures(doc);
    
//     const uploadResult = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream(
//         { resource_type: "raw", folder: "nexsign_completed", public_id: `final_${doc._id}` },
//         (err, res) => err ? reject(err) : resolve(res)
//       );
//       stream.end(Buffer.from(pdfBytes));
//     });

//     for (const party of doc.parties) {
//       await transporter.sendMail({
//         from: `"NexSign" <${process.env.EMAIL_USER}>`,
//         to: party.email,
//         subject: `Completed: ${doc.title}`,
//         html: `<p>সফলভাবে স্বাক্ষরিত হয়েছে। ডাউনলোড লিঙ্ক: <a href="${uploadResult.secure_url}">এখানে</a></p>`,
//         attachments: [{ filename: `${doc.title}_Signed.pdf`, content: Buffer.from(pdfBytes) }]
//       });
//     }
//   } catch (err) { console.error("Final process failed:", err); }
// };

// // --- ROUTES ---

// // ১. আইডি দিয়ে সিঙ্গেল ডকুমেন্ট পাওয়ার রাউট (এটি আপনার 404 এরর ফিক্স করবে)
// router.get('/:id', async (req, res) => {
//   try {
//     const doc = await Document.findById(req.params.id);
//     if (!doc) return res.status(404).json({ error: "Document not found" });
//     res.json(doc);
//   } catch (err) {
//     res.status(500).json({ error: "Invalid ID or Server Error" });
//   }
// });

// router.post('/upload', upload.single('file'), async (req, res) => {
//   try {
//     const result = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream({ resource_type: "raw", folder: "nexsign_docs" }, (err, res) => err ? reject(err) : resolve(res));
//       stream.end(req.file.buffer);
//     });
//     const newDoc = new Document({ 
//       title: req.file.originalname.replace('.pdf', ''), 
//       fileUrl: result.secure_url, 
//       fileId: result.public_id 
//     });
//     await newDoc.save();
//     await logActivity(newDoc._id, 'created', req, "Document uploaded");
//     res.json(newDoc);
//   } catch (err) { res.status(500).json({ error: "Upload failed" }); }
// });

// router.post('/send', async (req, res) => {
//   try {
//     const doc = await Document.findById(req.body.id);
//     if(!doc) return res.status(404).json({error: "Not found"});
    
//     const token = crypto.randomBytes(32).toString('hex');
//     doc.parties[0].token = token;
//     doc.parties[0].status = 'sent';
//     doc.status = 'in_progress';
    
//     await doc.save();
//     await sendSigningEmail(doc.parties[0], doc.title, token, req);
//     res.json({ success: true });
//   } catch (err) { res.status(500).json({ error: "Send failed" }); }
// });

// router.get('/sign/:token', async (req, res) => {
//   try {
//     const doc = await Document.findOne({ "parties.token": req.params.token });
//     if (!doc) return res.status(404).json({ error: "Invalid link" });
    
//     const partyIndex = doc.parties.findIndex(p => p.token === req.params.token);
//     const party = doc.parties[partyIndex];
    
//     await logActivity(doc._id, 'opened', req, "Signer opened the link", party);
    
//     const formattedFields = doc.fields.map(f => {
//       const fieldData = typeof f === 'string' ? JSON.parse(f) : f;
//       const fIndex = Number(fieldData.signerIndex ?? fieldData.partyIndex ?? 0);
//       return { ...fieldData, partyIndex: fIndex, isMine: fIndex === partyIndex };
//     });
    
//     res.json({ 
//       document: { ...doc.toObject(), fields: formattedFields }, 
//       party: { ...party.toObject(), index: partyIndex } 
//     });
//   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// });

// router.post('/sign/submit', async (req, res) => {
//   try {
//     const { token, fields } = req.body;
//     const doc = await Document.findOne({ "parties.token": token });
//     if(!doc) return res.status(404).json({error: "Invalid session"});

//     const idx = doc.parties.findIndex(p => p.token === token);
//     const currentParty = doc.parties[idx];

//     doc.parties[idx].status = 'signed';
//     doc.parties[idx].token = null; 
//     doc.parties[idx].signedAt = new Date();
    
//     doc.fields = fields;
//     doc.markModified('fields'); 
    
//     await logActivity(doc._id, 'signed', req, "Party signed", currentParty);

//     if (idx + 1 < doc.parties.length) {
//       const nextToken = crypto.randomBytes(32).toString('hex');
//       doc.parties[idx + 1].token = nextToken;
//       doc.parties[idx + 1].status = 'sent';
//       await doc.save();
//       await sendSigningEmail(doc.parties[idx + 1], doc.title, nextToken, req);
//       res.json({ success: true, next: true });
//     } else {
//       doc.status = 'completed';
//       await doc.save();
//       generateAndSendFinalDoc(doc);
//       res.json({ success: true, completed: true });
//     }
//   } catch (err) { res.status(500).json({ error: "Submit failed" }); }
// });

// router.get('/proxy/*', async (req, res) => {
//   try {
//     let fullPath = req.params[0];
//     if (!fullPath) return res.status(400).send("File ID is required");
//     if (!fullPath.includes('/')) fullPath = `nexsign_docs/${fullPath}`;

//     const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${fullPath}`;
//     const response = await axios.get(url, { responseType: 'stream', timeout: 15000 });
//     res.setHeader('Content-Type', 'application/pdf');
//     response.data.pipe(res);
//   } catch (err) { res.status(404).send("PDF Not Found"); }
// });

// router.get('/', async (req, res) => {
//   try {
//     const documents = await Document.find().sort({ createdAt: -1 });
//     res.json(documents);
//   } catch (err) { res.status(500).json({ error: "Fetch Error" }); }
// });

// router.put('/:id', async (req, res) => {
//   try {
//     const updatedDoc = await Document.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
//     res.json(updatedDoc);
//   } catch (err) { res.status(500).json({ error: "Update failed" }); }
// });

// module.exports = router;

// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const axios = require('axios');
// const { v2: cloudinary } = require('cloudinary');
// const crypto = require('crypto');
// const nodemailer = require('nodemailer');
// const { PDFDocument } = require('pdf-lib');
// const Document = require('../models/Document');
// const AuditLog = require('../models/AuditLog');

// // 1. Cloudinary Configuration
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // 2. Mail Transporter
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: { 
//     user: process.env.EMAIL_USER, 
//     pass: process.env.EMAIL_PASS 
//   },
// });

// const upload = multer({ storage: multer.memoryStorage() });

// // --- HELPER FUNCTIONS ---

// const logActivity = async (docId, action, req, details = {}, party = {}) => {
//   try {
//     await AuditLog.create({
//       document_id: docId,
//       action,
//       party_name: party.name || "System",
//       party_email: party.email || "system@nexsign.com",
//       ip_address: req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : "127.0.0.1",
//       details: typeof details === 'string' ? details : JSON.stringify(details)
//     });
//   } catch (err) { console.error("Audit Logging Failed:", err); }
// };

// const sendSigningEmail = async (party, docTitle, token, req) => {
//   const baseUrl = req.headers.origin || "http://localhost:5173";
//   const signLink = `${baseUrl}/sign?token=${token}`;
  
//   const mailOptions = {
//     from: `"NexSign" <${process.env.EMAIL_USER}>`,
//     to: party.email,
//     subject: `Signature Request: ${docTitle}`,
//     html: `
//       <div style="font-family:sans-serif;padding:20px;border:1px solid #eee;border-radius:10px;">
//         <h2 style="color:#0ea5e9;">Hello ${party.name},</h2>
//         <p>You have been requested to sign: <b>${docTitle}</b></p>
//         <a href="${signLink}" style="display:inline-block;background:#0ea5e9;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;font-weight:bold;margin-top:10px;">Sign Document Now</a>
//       </div>
//     `,
//   };
//   return transporter.sendMail(mailOptions);
// };

// const mergeSignatures = async (doc) => {
//   const response = await axios.get(doc.fileUrl, { responseType: 'arraybuffer' });
//   const pdfDoc = await PDFDocument.load(response.data);
//   const pages = pdfDoc.getPages();
  
//   const processedFields = doc.fields.map(f => typeof f === 'string' ? JSON.parse(f) : f);

//   for (const f of processedFields) {
//     if (f.type === 'signature' && f.value) {
//       try {
//         const pageIndex = Number(f.page) - 1;
//         if (pageIndex >= 0 && pageIndex < pages.length) {
//           const page = pages[pageIndex];
//           const { width, height } = page.getSize();
          
//           const base64Data = f.value.includes(',') ? f.value.split(',')[1] : f.value;
//           const sigImg = await pdfDoc.embedPng(Buffer.from(base64Data, 'base64'));

//           page.drawImage(sigImg, {
//             x: (Number(f.x) * width) / 100,
//             y: height - ((Number(f.y) * height) / 100) - ((Number(f.height) * height) / 100),
//             width: (Number(f.width) * width) / 100,
//             height: (Number(f.height) * height) / 100,
//           });
//         }
//       } catch (err) { console.error("Field Embedding Error:", err); }
//     }
//   }
//   return await pdfDoc.save();
// };

// const generateAndSendFinalDoc = async (doc) => {
//   try {
//     const pdfBytes = await mergeSignatures(doc);
    
//     const uploadResult = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream(
//         { resource_type: "raw", folder: "nexsign_completed", public_id: `final_${doc._id}` },
//         (err, res) => err ? reject(err) : resolve(res)
//       );
//       stream.end(Buffer.from(pdfBytes));
//     });

//     for (const party of doc.parties) {
//       await transporter.sendMail({
//         from: `"NexSign" <${process.env.EMAIL_USER}>`,
//         to: party.email,
//         subject: `Completed: ${doc.title}`,
//         html: `<p>সবাই স্বাক্ষর করেছেন। আপনার কপি ডাউনলোড করুন: <a href="${uploadResult.secure_url}">এখানে</a></p>`,
//         attachments: [{ filename: `${doc.title}_Signed.pdf`, content: Buffer.from(pdfBytes) }]
//       });
//     }
//   } catch (err) { console.error("Final process failed:", err); }
// };

// // --- ROUTES ---

// router.get('/:id', async (req, res) => {
//   try {
//     const doc = await Document.findById(req.params.id);
//     if (!doc) return res.status(404).json({ error: "Document not found" });
//     res.json(doc);
//   } catch (err) {
//     res.status(500).json({ error: "Invalid ID" });
//   }
// });

// router.post('/upload', upload.single('file'), async (req, res) => {
//   try {
//     const result = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream({ resource_type: "raw", folder: "nexsign_docs" }, (err, res) => err ? reject(err) : resolve(res));
//       stream.end(req.file.buffer);
//     });
//     const newDoc = new Document({ 
//       title: req.file.originalname.replace('.pdf', ''), 
//       fileUrl: result.secure_url, 
//       fileId: result.public_id 
//     });
//     await newDoc.save();
//     await logActivity(newDoc._id, 'created', req, "Document uploaded");
//     res.json(newDoc);
//   } catch (err) { res.status(500).json({ error: "Upload failed" }); }
// });

// router.post('/send', async (req, res) => {
//   try {
//     const doc = await Document.findById(req.body.id);
//     if(!doc) return res.status(404).json({error: "Not found"});
    
//     const token = crypto.randomBytes(32).toString('hex');
//     doc.parties[0].token = token;
//     doc.parties[0].status = 'sent';
//     doc.status = 'in_progress';
    
//     await doc.save();
//     await sendSigningEmail(doc.parties[0], doc.title, token, req);
//     res.json({ success: true });
//   } catch (err) { res.status(500).json({ error: "Send failed" }); }
// });

// router.get('/sign/:token', async (req, res) => {
//   try {
//     const doc = await Document.findOne({ "parties.token": req.params.token });
//     if (!doc) return res.status(404).json({ error: "Invalid link" });
    
//     const partyIndex = doc.parties.findIndex(p => p.token === req.params.token);
//     const party = doc.parties[partyIndex];
    
//     await logActivity(doc._id, 'opened', req, "Signer opened the link", party);
    
//     const formattedFields = doc.fields.map(f => {
//       const fieldData = typeof f === 'string' ? JSON.parse(f) : f;
//       const fIndex = Number(fieldData.signerIndex ?? fieldData.partyIndex ?? 0);
//       return { ...fieldData, partyIndex: fIndex, isMine: fIndex === partyIndex };
//     });
    
//     res.json({ 
//       document: { ...doc.toObject(), fields: formattedFields }, 
//       party: { ...party.toObject(), index: partyIndex } 
//     });
//   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// });

// // router.post('/sign/submit', async (req, res) => {
// //   try {
// //     const { token, fields } = req.body;
// //     const doc = await Document.findOne({ "parties.token": token });
// //     if(!doc) return res.status(404).json({error: "Invalid session"});

// //     const idx = doc.parties.findIndex(p => p.token === token);
// //     const currentParty = doc.parties[idx];

// //     // --- সিকিউরিটি চেক: ইউজার কি শুধু নিজের ফিল্ড আপডেট করছে? ---
// //     const updatedFields = fields.map(incomingField => {
// //       const existingField = doc.fields.find(f => {
// //         const fData = typeof f === 'string' ? JSON.parse(f) : f;
// //         return fData.id === incomingField.id;
// //       });

// //       if (existingField) {
// //         const fData = typeof existingField === 'string' ? JSON.parse(existingField) : existingField;
// //         const fieldOwnerIdx = Number(fData.signerIndex ?? fData.partyIndex ?? 0);
        
// //         // যদি ফিল্ডটি অন্য কারো হয়, তবে সেটির ভ্যালু পরিবর্তন করা যাবে না (আগেরটাই থাকবে)
// //         if (fieldOwnerIdx !== idx) {
// //           return existingField; 
// //         }
// //       }
// //       return incomingField;
// //     });

// //     doc.parties[idx].status = 'signed';
// //     doc.parties[idx].token = null; 
// //     doc.parties[idx].signedAt = new Date();
    
// //     doc.fields = updatedFields;
// //     doc.markModified('fields'); 
    
// //     await logActivity(doc._id, 'signed', req, "Party signed", currentParty);

// //     if (idx + 1 < doc.parties.length) {
// //       const nextToken = crypto.randomBytes(32).toString('hex');
// //       doc.parties[idx + 1].token = nextToken;
// //       doc.parties[idx + 1].status = 'sent';
// //       await doc.save();
// //       await sendSigningEmail(doc.parties[idx + 1], doc.title, nextToken, req);
// //       res.json({ success: true, next: true });
// //     } else {
// //       doc.status = 'completed';
// //       await doc.save();
// //       generateAndSendFinalDoc(doc);
// //       res.json({ success: true, completed: true });
// //     }
// //   } catch (err) { res.status(500).json({ error: "Submit failed" }); }
// // });
// router.post('/sign/submit', async (req, res) => {
//   try {
//     const { token, fields: incomingFields } = req.body;
    
//     // ১. টোকেন দিয়ে ডকুমেন্ট খুঁজে বের করা
//     const doc = await Document.findOne({ "parties.token": token });
//     if (!doc) return res.status(404).json({ error: "Invalid link or session" });

//     const currentIdx = doc.parties.findIndex(p => p.token === token);
//     const currentParty = doc.parties[currentIdx];

//     // ২. সিকিউরিটি ফিল্টার: যাতে কেউ অন্যের ফিল্ডে সাইন করতে না পারে
//     const secureFields = incomingFields.map(field => {
//       const originalField = doc.fields.find(f => {
//         const fData = typeof f === 'string' ? JSON.parse(f) : f;
//         return fData.id === field.id;
//       });

//       if (originalField) {
//         const fData = typeof originalField === 'string' ? JSON.parse(originalField) : originalField;
//         const ownerIdx = Number(fData.partyIndex ?? fData.signerIndex ?? fData.party_index ?? 0);
        
//         // যদি ফিল্ডটি বর্তমান ইউজারের না হয়, তবে আগের ডাটাই থাকবে (হ্যাকিং প্রিভেনশন)
//         if (ownerIdx !== currentIdx) return originalField;
//       }
//       return field;
//     });

//     // ৩. বর্তমান সাইনারের স্ট্যাটাস আপডেট
//     doc.fields = secureFields;
//     doc.parties[currentIdx].status = 'signed';
//     doc.parties[currentIdx].signedAt = new Date();
//     doc.parties[currentIdx].token = null; // টোকেনটি একবারই ব্যবহারযোগ্য করা হলো
//     doc.markModified('fields');
//     doc.markModified('parties');

//     await logActivity(doc._id, 'signed', req, "Party signed the document", currentParty);

//     // ৪. সিকুয়েনশিয়াল সাইনিং লজিক (Sequential Signing)
//     if (currentIdx + 1 < doc.parties.length) {
//       // যদি আরও সাইনার বাকি থাকে
//       const nextToken = crypto.randomBytes(32).toString('hex');
//       doc.parties[currentIdx + 1].token = nextToken;
//       doc.parties[currentIdx + 1].status = 'sent';
      
//       await doc.save();
      
//       // পরবর্তী সাইনারকে মেইল পাঠানো
//       await sendSigningEmail(doc.parties[currentIdx + 1], doc.title, nextToken, req);
      
//       res.json({ success: true, next: true, message: "Signed and sent to next party" });
//     } else {
//       // ৫. সবাই সাইন করে ফেললে ডকুমেন্ট কমপ্লিট করা
//       doc.status = 'completed';
//       doc.completedAt = new Date();
//       await doc.save();
      
//       // ব্যাকগ্রাউন্ডে পিডিএফ মার্জ এবং ফাইনাল ইমেইল পাঠানো
//       generateAndSendFinalDoc(doc);
      
//       res.json({ success: true, completed: true, message: "Document fully signed!" });
//     }

//   } catch (err) {
//     console.error("Submit Error:", err);
//     res.status(500).json({ error: "Submission failed" });
//   }
// });
// router.get('/proxy/*', async (req, res) => {
//   try {
//     let fullPath = req.params[0];
//     if (!fullPath) return res.status(400).send("File ID is required");
//     if (!fullPath.includes('/')) fullPath = `nexsign_docs/${fullPath}`;

//     const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${fullPath}`;
//     const response = await axios.get(url, { responseType: 'stream', timeout: 15000 });
//     res.setHeader('Content-Type', 'application/pdf');
//     response.data.pipe(res);
//   } catch (err) { res.status(404).send("PDF Not Found"); }
// });

// router.get('/', async (req, res) => {
//   try {
//     const documents = await Document.find().sort({ createdAt: -1 });
//     res.json(documents);
//   } catch (err) { res.status(500).json({ error: "Fetch Error" }); }
// });

// router.put('/:id', async (req, res) => {
//   try {
//     const updatedDoc = await Document.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
//     res.json(updatedDoc);
//   } catch (err) { res.status(500).json({ error: "Update failed" }); }
// });

// module.exports = router;

// const express = require('express');
// const router = express.Router(); // <--- নিশ্চিত করুন এটি উপরে আছে
// const multer = require('multer');
// const axios = require('axios');
// const { v2: cloudinary } = require('cloudinary');
// const crypto = require('crypto');
// const nodemailer = require('nodemailer');
// const { PDFDocument } = require('pdf-lib');
// const Document = require('../models/Document');
// const AuditLog = require('../models/AuditLog');

// // ১. ক্লাউডিনারি কনফিগারেশন
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // ২. মেইল ট্রান্সপোর্টার
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: { 
//     user: process.env.EMAIL_USER, 
//     pass: process.env.EMAIL_PASS 
//   },
// });

// const upload = multer({ storage: multer.memoryStorage() });

// // --- হেল্পার ফাংশনসমূহ ---

// const logActivity = async (docId, action, req, details = {}, party = {}) => {
//   try {
//     await AuditLog.create({
//       document_id: docId,
//       action,
//       party_name: party.name || "System",
//       party_email: party.email || "system@nexsign.com",
//       ip_address: req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : "127.0.0.1",
//       details: typeof details === 'string' ? details : JSON.stringify(details)
//     });
//   } catch (err) { console.error("Audit Logging Failed:", err); }
// };

// const sendSigningEmail = async (party, docTitle, token, req) => {
//   const baseUrl = req.headers.origin || "http://localhost:5173";
//   const signLink = `${baseUrl}/sign?token=${token}`;
  
//   const mailOptions = {
//     from: `"NexSign" <${process.env.EMAIL_USER}>`,
//     to: party.email,
//     subject: `Signature Request: ${docTitle}`,
//     html: `
//       <div style="font-family:sans-serif;padding:20px;border:1px solid #eee;border-radius:10px;">
//         <h2 style="color:#0ea5e9;">Hello ${party.name},</h2>
//         <p>You have been requested to sign: <b>${docTitle}</b></p>
//         <a href="${signLink}" style="display:inline-block;background:#0ea5e9;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;font-weight:bold;margin-top:10px;">Sign Document Now</a>
//       </div>
//     `,
//   };
//   return transporter.sendMail(mailOptions);
// };

// const mergeSignatures = async (doc) => {
//   const response = await axios.get(doc.fileUrl, { responseType: 'arraybuffer' });
//   const pdfDoc = await PDFDocument.load(response.data);
//   const pages = pdfDoc.getPages();
  
//   const processedFields = doc.fields.map(f => typeof f === 'string' ? JSON.parse(f) : f);

//   for (const f of processedFields) {
//     if (f.type === 'signature' && f.value) {
//       try {
//         const pageIndex = Number(f.page) - 1;
//         if (pageIndex >= 0 && pageIndex < pages.length) {
//           const page = pages[pageIndex];
//           const { width, height } = page.getSize();
          
//           const base64Data = f.value.includes(',') ? f.value.split(',')[1] : f.value;
//           const sigImg = await pdfDoc.embedPng(Buffer.from(base64Data, 'base64'));

//           page.drawImage(sigImg, {
//             x: (Number(f.x) * width) / 100,
//             y: height - ((Number(f.y) * height) / 100) - ((Number(f.height) * height) / 100),
//             width: (Number(f.width) * width) / 100,
//             height: (Number(f.height) * height) / 100,
//           });
//         }
//       } catch (err) { console.error("Field Embedding Error:", err); }
//     }
//   }
//   return await pdfDoc.save();
// };

// // const generateAndSendFinalDoc = async (doc) => {
// //   try {
// //     const pdfBytes = await mergeSignatures(doc);
    
// //     const uploadResult = await new Promise((resolve, reject) => {
// //       const stream = cloudinary.uploader.upload_stream(
// //         { resource_type: "raw", folder: "nexsign_completed", public_id: `final_${doc._id}` },
// //         (err, res) => err ? reject(err) : resolve(res)
// //       );
// //       stream.end(Buffer.from(pdfBytes));
// //     });

// //     for (const party of doc.parties) {
// //       await transporter.sendMail({
// //         from: `"NexSign" <${process.env.EMAIL_USER}>`,
// //         to: party.email,
// //         subject: `Completed: ${doc.title}`,
// //         html: `<p>সবাই স্বাক্ষর করেছেন। আপনার কপি ডাউনলোড করুন: <a href="${uploadResult.secure_url}">এখানে</a></p>`,
// //         attachments: [{ filename: `${doc.title}_Signed.pdf`, content: Buffer.from(pdfBytes) }]
// //       });
// //     }
// //   } catch (err) { console.error("Final process failed:", err); }
// // };

// // --- রাউটসমূহ ---

// // ১. আইডি দিয়ে ডকুমেন্ট খোঁজা
// const generateAndSendFinalDoc = async (doc) => {
//   try {
//     const pdfBytes = await mergeSignatures(doc);
    
//     const uploadResult = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream(
//         { 
//           resource_type: "raw", 
//           folder: "nexsign_completed", 
//           public_id: `final_${doc._id}.pdf` // <--- Just eikhane .pdf add koren
//         },
//         (err, res) => err ? reject(err) : resolve(res)
//       );
//       stream.end(Buffer.from(pdfBytes));
//     });

//     console.log("Cloudinary Upload Success:", uploadResult.secure_url);

//     // Baki mail sending code thakbe...
//   } catch (err) { console.error("Final process failed:", err); }
// };

// router.get('/:id', async (req, res) => {
//   try {
//     const doc = await Document.findById(req.params.id);
//     if (!doc) return res.status(404).json({ error: "Document not found" });
//     res.json(doc);
//   } catch (err) { res.status(500).json({ error: "Invalid ID" }); }
// });

// // ২. পিডিএফ আপলোড (ক্লাউডিনারি)
// router.post('/upload', upload.single('file'), async (req, res) => {
//   try {
//     const result = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream({ resource_type: "raw", folder: "nexsign_docs" }, (err, res) => err ? reject(err) : resolve(res));
//       stream.end(req.file.buffer);
//     });
//     const newDoc = new Document({ 
//       title: req.file.originalname.replace('.pdf', ''), 
//       fileUrl: result.secure_url, 
//       fileId: result.public_id 
//     });
//     await newDoc.save();
//     await logActivity(newDoc._id, 'created', req, "Document uploaded");
//     res.json(newDoc);
//   } catch (err) { res.status(500).json({ error: "Upload failed" }); }
// });

// // ৩. সাইনিং শুরু করা (প্রথম সাইনারকে মেইল পাঠানো)
// router.post('/send', async (req, res) => {
//   try {
//     const doc = await Document.findById(req.body.id);
//     if(!doc) return res.status(404).json({error: "Not found"});
    
//     const token = crypto.randomBytes(32).toString('hex');
//     doc.parties[0].token = token;
//     doc.parties[0].status = 'sent';
//     doc.status = 'in_progress';
    
//     await doc.save();
//     await sendSigningEmail(doc.parties[0], doc.title, token, req);
//     res.json({ success: true });
//   } catch (err) { res.status(500).json({ error: "Send failed" }); }
// });

// // ৪. টোকেন দিয়ে সাইনিং সেশন লোড করা
// router.get('/sign/:token', async (req, res) => {
//   try {
//     const doc = await Document.findOne({ "parties.token": req.params.token });
//     if (!doc) return res.status(404).json({ error: "Invalid link" });
    
//     const partyIndex = doc.parties.findIndex(p => p.token === req.params.token);
//     const party = doc.parties[partyIndex];
    
//     await logActivity(doc._id, 'opened', req, "Signer opened the link", party);
    
//     const formattedFields = doc.fields.map(f => {
//       const fieldData = typeof f === 'string' ? JSON.parse(f) : f;
//       const fIndex = Number(fieldData.signerIndex ?? fieldData.partyIndex ?? 0);
//       return { ...fieldData, partyIndex: fIndex, isMine: fIndex === partyIndex };
//     });
    
//     res.json({ 
//       document: { ...doc.toObject(), fields: formattedFields }, 
//       party: { ...party.toObject(), index: partyIndex } 
//     });
//   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// });

// // ৫. স্বাক্ষর সাবমিট করা (সবচেয়ে গুরুত্বপূর্ণ পার্ট)
// router.post('/sign/submit', async (req, res) => {
//   try {
//     const { token, fields: incomingFields } = req.body;
//     const doc = await Document.findOne({ "parties.token": token });
//     if (!doc) return res.status(404).json({ error: "Invalid link or session" });

//     const currentIdx = doc.parties.findIndex(p => p.token === token);
//     const currentParty = doc.parties[currentIdx];

//     const secureFields = incomingFields.map(field => {
//       const originalField = doc.fields.find(f => {
//         const fData = typeof f === 'string' ? JSON.parse(f) : f;
//         return fData.id === field.id;
//       });
//       if (originalField) {
//         const fData = typeof originalField === 'string' ? JSON.parse(originalField) : originalField;
//         const ownerIdx = Number(fData.partyIndex ?? fData.signerIndex ?? 0);
//         if (ownerIdx !== currentIdx) return originalField;
//       }
//       return field;
//     });

//     doc.fields = secureFields;
//     doc.parties[currentIdx].status = 'signed';
//     doc.parties[currentIdx].signedAt = new Date();
//     doc.parties[currentIdx].token = null; 
//     doc.markModified('fields');
//     doc.markModified('parties');

//     await logActivity(doc._id, 'signed', req, "Party signed the document", currentParty);

//     if (currentIdx + 1 < doc.parties.length) {
//       const nextToken = crypto.randomBytes(32).toString('hex');
//       doc.parties[currentIdx + 1].token = nextToken;
//       doc.parties[currentIdx + 1].status = 'sent';
//       await doc.save();
//       await sendSigningEmail(doc.parties[currentIdx + 1], doc.title, nextToken, req);
//       res.json({ success: true, next: true });
//     } else {
//       doc.status = 'completed';
//       doc.completedAt = new Date();
//       await doc.save();
//       generateAndSendFinalDoc(doc);
//       res.json({ success: true, completed: true });
//     }
//   } catch (err) { res.status(500).json({ error: "Submission failed" }); }
// });

// // ৬. পিডিএফ প্রক্সি
// router.get('/proxy/*', async (req, res) => {
//   try {
//     let fullPath = req.params[0];
//     if (!fullPath) return res.status(400).send("File ID required");
//     if (!fullPath.includes('/')) fullPath = `nexsign_docs/${fullPath}`;
//     const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${fullPath}`;
//     const response = await axios.get(url, { responseType: 'stream' });
//     res.setHeader('Content-Type', 'application/pdf');
//     response.data.pipe(res);
//   } catch (err) { res.status(404).send("Not Found"); }
// });

// // ৭. সব ডকুমেন্ট লিস্ট
// router.get('/', async (req, res) => {
//   try {
//     const documents = await Document.find().sort({ createdAt: -1 });
//     res.json(documents);
//   } catch (err) { res.status(500).json({ error: "Fetch Error" }); }
// });

// // ৮. ডকুমেন্ট আপডেট (পার্টি অ্যাড করা ইত্যাদি)
// router.put('/:id', async (req, res) => {
//   try {
//     const updatedDoc = await Document.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
//     res.json(updatedDoc);
//   } catch (err) { res.status(500).json({ error: "Update failed" }); }
// });


// router.get('/view-signed/:id', async (req, res) => {
//   try {
//     const doc = await Document.findById(req.params.id);
//     if (!doc || doc.status !== 'completed') {
//       return res.status(404).json({ error: "Signed document not found" });
//     }

//     // ক্লাউডিনারি ফোল্ডার এবং আইডি অনুযায়ী ফাইনাল ইউআরএল
//     // nexsign_completed ফোল্ডারে আমরা final_ID নামে সেভ করেছি
//     const finalUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/nexsign_completed/final_${doc._id}.pdf`;

//     // সরাসরি ক্লাউডিনারি ইউআরএল এ রিডাইরেক্ট করে দেওয়া সবথেকে সহজ সমাধান
//     res.redirect(finalUrl);
    
//   } catch (err) {
//     console.error("View Final PDF Error:", err);
//     res.status(500).send("Error loading signed PDF");
//   }
// });
// module.exports = router; // <--- এটিও নিশ্চিত করুন


// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const axios = require('axios');
// const { v2: cloudinary } = require('cloudinary');
// const crypto = require('crypto');
// const nodemailer = require('nodemailer');
// const { PDFDocument } = require('pdf-lib');
// const Document = require('../models/Document');
// const AuditLog = require('../models/AuditLog');

// // ১. ক্লাউডিনারি কনফিগারেশন
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // ২. মেইল ট্রান্সপোর্টার
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: { 
//     user: process.env.EMAIL_USER, 
//     pass: process.env.EMAIL_PASS 
//   },
// });

// const upload = multer({ storage: multer.memoryStorage() });

// // --- হেল্পার ফাংশনসমূহ ---

// const logActivity = async (docId, action, req, details = {}, party = {}) => {
//   try {
//     await AuditLog.create({
//       document_id: docId,
//       action,
//       party_name: party.name || "System",
//       party_email: party.email || "system@nexsign.com",
//       ip_address: req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : "127.0.0.1",
//       details: typeof details === 'string' ? details : JSON.stringify(details)
//     });
//   } catch (err) { console.error("Audit Logging Failed:", err); }
// };

// const sendSigningEmail = async (party, docTitle, token, req) => {
//   const baseUrl = req.headers.origin || "http://localhost:5173";
//   const signLink = `${baseUrl}/sign?token=${token}`;
  
//   const mailOptions = {
//     from: `"NexSign" <${process.env.EMAIL_USER}>`,
//     to: party.email,
//     subject: `Signature Request: ${docTitle}`,
//     html: `
//       <div style="font-family:sans-serif;padding:20px;border:1px solid #eee;border-radius:10px;">
//         <h2 style="color:#0ea5e9;">Hello ${party.name},</h2>
//         <p>You have been requested to sign: <b>${docTitle}</b></p>
//         <a href="${signLink}" style="display:inline-block;background:#0ea5e9;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;font-weight:bold;margin-top:10px;">Sign Document Now</a>
//       </div>
//     `,
//   };
//   return transporter.sendMail(mailOptions);
// };

// const mergeSignatures = async (doc) => {
//   const response = await axios.get(doc.fileUrl, { responseType: 'arraybuffer' });
//   const pdfDoc = await PDFDocument.load(response.data);
//   const pages = pdfDoc.getPages();
  
//   const processedFields = doc.fields.map(f => typeof f === 'string' ? JSON.parse(f) : f);

//   for (const f of processedFields) {
//     if (f.type === 'signature' && f.value) {
//       try {
//         const pageIndex = Number(f.page) - 1;
//         if (pageIndex >= 0 && pageIndex < pages.length) {
//           const page = pages[pageIndex];
//           const { width, height } = page.getSize();
//           const base64Data = f.value.includes(',') ? f.value.split(',')[1] : f.value;
//           const sigImg = await pdfDoc.embedPng(Buffer.from(base64Data, 'base64'));

//           page.drawImage(sigImg, {
//             x: (Number(f.x) * width) / 100,
//             y: height - ((Number(f.y) * height) / 100) - ((Number(f.height) * height) / 100),
//             width: (Number(f.width) * width) / 100,
//             height: (Number(f.height) * height) / 100,
//           });
//         }
//       } catch (err) { console.error("Field Embedding Error:", err); }
//     }
//   }
//   return await pdfDoc.save();
// };

// const generateAndSendFinalDoc = async (doc) => {
//   try {
//     const pdfBytes = await mergeSignatures(doc);
    
//     const uploadResult = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream(
//         { 
//           resource_type: "raw", 
//           folder: "nexsign_completed", 
//           public_id: `final_${doc._id}.pdf` 
//         },
//         (err, res) => err ? reject(err) : resolve(res)
//       );
//       stream.end(Buffer.from(pdfBytes));
//     });

//     console.log("Cloudinary Upload Success:", uploadResult.secure_url);

//     for (const party of doc.parties) {
//       await transporter.sendMail({
//         from: `"NexSign" <${process.env.EMAIL_USER}>`,
//         to: party.email,
//         subject: `Completed: ${doc.title}`,
//         html: `<p>সবাই স্বাক্ষর করেছেন। আপনার কপি ডাউনলোড করুন: <a href="${uploadResult.secure_url}">এখানে</a></p>`,
//         attachments: [{ filename: `${doc.title}_Signed.pdf`, content: Buffer.from(pdfBytes) }]
//       });
//     }
//   } catch (err) { console.error("Final process failed:", err); }
// };

// // --- রাউটসমূহ (অর্ডার ঠিক করা হয়েছে) ---

// // ১. এই রাউটটি এখন ঠিকঠাক কাজ করবে কারণ এটি স্পেসিফিক পাথ
// router.get('/view-signed/:id', async (req, res) => {
//   try {
//     const doc = await Document.findById(req.params.id);
//     if (!doc || doc.status !== 'completed') {
//       return res.status(404).json({ error: "Signed document not found" });
//     }
//     const finalUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/nexsign_completed/final_${doc._id}.pdf`;
//     res.redirect(finalUrl);
//   } catch (err) { res.status(500).send("Error loading signed PDF"); }
// });

// // ২. টোকেন দিয়ে সাইন সেশন লোড
// router.get('/sign/:token', async (req, res) => {
//   try {
//     const doc = await Document.findOne({ "parties.token": req.params.token });
//     if (!doc) return res.status(404).json({ error: "Invalid link" });
//     const partyIndex = doc.parties.findIndex(p => p.token === req.params.token);
//     const party = doc.parties[partyIndex];
//     await logActivity(doc._id, 'opened', req, "Signer opened the link", party);
//     const formattedFields = doc.fields.map(f => {
//       const fieldData = typeof f === 'string' ? JSON.parse(f) : f;
//       const fIndex = Number(fieldData.signerIndex ?? fieldData.partyIndex ?? 0);
//       return { ...fieldData, partyIndex: fIndex, isMine: fIndex === partyIndex };
//     });
//     res.json({ 
//       document: { ...doc.toObject(), fields: formattedFields }, 
//       party: { ...party.toObject(), index: partyIndex } 
//     });
//   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// });

// // ৩. পিডিএফ প্রক্সি
// router.get('/proxy/*', async (req, res) => {
//   try {
//     let fullPath = req.params[0];
//     if (!fullPath) return res.status(400).send("File ID required");
//     if (!fullPath.includes('/')) fullPath = `nexsign_docs/${fullPath}`;
//     const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${fullPath}`;
//     const response = await axios.get(url, { responseType: 'stream' });
//     res.setHeader('Content-Type', 'application/pdf');
//     response.data.pipe(res);
//   } catch (err) { res.status(404).send("Not Found"); }
// });

// // ৪. বাকি সব রাউট
// router.get('/', async (req, res) => {
//   try {
//     const documents = await Document.find().sort({ createdAt: -1 });
//     res.json(documents);
//   } catch (err) { res.status(500).json({ error: "Fetch Error" }); }
// });

// router.post('/upload', upload.single('file'), async (req, res) => {
//   try {
//     const result = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream({ resource_type: "raw", folder: "nexsign_docs" }, (err, res) => err ? reject(err) : resolve(res));
//       stream.end(req.file.buffer);
//     });
//     const newDoc = new Document({ 
//       title: req.file.originalname.replace('.pdf', ''), 
//       fileUrl: result.secure_url, 
//       fileId: result.public_id 
//     });
//     await newDoc.save();
//     await logActivity(newDoc._id, 'created', req, "Document uploaded");
//     res.json(newDoc);
//   } catch (err) { res.status(500).json({ error: "Upload failed" }); }
// });

// router.post('/send', async (req, res) => {
//   try {
//     const doc = await Document.findById(req.body.id);
//     if(!doc) return res.status(404).json({error: "Not found"});
//     const token = crypto.randomBytes(32).toString('hex');
//     doc.parties[0].token = token;
//     doc.parties[0].status = 'sent';
//     doc.status = 'in_progress';
//     await doc.save();
//     await sendSigningEmail(doc.parties[0], doc.title, token, req);
//     res.json({ success: true });
//   } catch (err) { res.status(500).json({ error: "Send failed" }); }
// });

// router.post('/sign/submit', async (req, res) => {
//   try {
//     const { token, fields: incomingFields } = req.body;
//     const doc = await Document.findOne({ "parties.token": token });
//     if (!doc) return res.status(404).json({ error: "Invalid link or session" });

//     const currentIdx = doc.parties.findIndex(p => p.token === token);
//     const currentParty = doc.parties[currentIdx];

//     const secureFields = incomingFields.map(field => {
//       const originalField = doc.fields.find(f => {
//         const fData = typeof f === 'string' ? JSON.parse(f) : f;
//         return fData.id === field.id;
//       });
//       if (originalField) {
//         const fData = typeof originalField === 'string' ? JSON.parse(originalField) : originalField;
//         const ownerIdx = Number(fData.partyIndex ?? fData.signerIndex ?? 0);
//         if (ownerIdx !== currentIdx) return originalField;
//       }
//       return field;
//     });

//     doc.fields = secureFields;
//     doc.parties[currentIdx].status = 'signed';
//     doc.parties[currentIdx].signedAt = new Date();
//     doc.parties[currentIdx].token = null; 
//     doc.markModified('fields');
//     doc.markModified('parties');

//     await logActivity(doc._id, 'signed', req, "Party signed the document", currentParty);

//     if (currentIdx + 1 < doc.parties.length) {
//       const nextToken = crypto.randomBytes(32).toString('hex');
//       doc.parties[currentIdx + 1].token = nextToken;
//       doc.parties[currentIdx + 1].status = 'sent';
//       await doc.save();
//       await sendSigningEmail(doc.parties[currentIdx + 1], doc.title, nextToken, req);
//       res.json({ success: true, next: true });
//     } else {
//       doc.status = 'completed';
//       doc.completedAt = new Date();
//       await doc.save();
//       generateAndSendFinalDoc(doc);
//       res.json({ success: true, completed: true });
//     }
//   } catch (err) { res.status(500).json({ error: "Submission failed" }); }
// });

// // আইডি দিয়ে খোঁজা (এটি নিচে রাখা নিরাপদ কারণ এটি ডাইনামিক :id ফলো করে)
// router.get('/:id', async (req, res) => {
//   try {
//     const doc = await Document.findById(req.params.id);
//     if (!doc) return res.status(404).json({ error: "Document not found" });
//     res.json(doc);
//   } catch (err) { res.status(500).json({ error: "Invalid ID" }); }
// });

// router.put('/:id', async (req, res) => {
//   try {
//     const updatedDoc = await Document.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
//     res.json(updatedDoc);
//   } catch (err) { res.status(500).json({ error: "Update failed" }); }
// });

// module.exports = router;

// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const axios = require('axios');
// const { v2: cloudinary } = require('cloudinary');
// const crypto = require('crypto');
// const nodemailer = require('nodemailer');
// const { PDFDocument } = require('pdf-lib');
// const Document = require('../models/Document');
// const AuditLog = require('../models/AuditLog');
// const auth = require('../middleware/auth'); // ✅ মিডলওয়্যার ইম্পোর্ট করা হয়েছে

// // ১. ক্লাউডিনারি কনফিগারেশন
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // ২. মেইল ট্রান্সপোর্টার
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: { 
//     user: process.env.EMAIL_USER, 
//     pass: process.env.EMAIL_PASS 
//   },
// });

// const upload = multer({ storage: multer.memoryStorage() });

// // --- হেল্পার ফাংশনসমূহ ---

// const logActivity = async (docId, action, req, details = {}, party = {}) => {
//   try {
//     await AuditLog.create({
//       document_id: docId,
//       action,
//       party_name: party.name || "System",
//       party_email: party.email || "system@nexsign.com",
//       ip_address: req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : "127.0.0.1",
//       details: typeof details === 'string' ? details : JSON.stringify(details)
//     });
//   } catch (err) { console.error("Audit Logging Failed:", err); }
// };

// const sendSigningEmail = async (party, docTitle, token, req) => {
//   const baseUrl = req.headers.origin || "http://localhost:5173";
//   const signLink = `${baseUrl}/sign?token=${token}`;
  
//   const mailOptions = {
//     from: `"NexSign" <${process.env.EMAIL_USER}>`,
//     to: party.email,
//     subject: `Signature Request: ${docTitle}`,
//     html: `
//       <div style="font-family:sans-serif;padding:20px;border:1px solid #eee;border-radius:10px;">
//         <h2 style="color:#0ea5e9;">Hello ${party.name},</h2>
//         <p>You have been requested to sign: <b>${docTitle}</b></p>
//         <a href="${signLink}" style="display:inline-block;background:#0ea5e9;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;font-weight:bold;margin-top:10px;">Sign Document Now</a>
//       </div>
//     `,
//   };
//   return transporter.sendMail(mailOptions);
// };

// const mergeSignatures = async (doc) => {
//   const response = await axios.get(doc.fileUrl, { responseType: 'arraybuffer' });
//   const pdfDoc = await PDFDocument.load(response.data);
//   const pages = pdfDoc.getPages();
  
//   const processedFields = doc.fields.map(f => typeof f === 'string' ? JSON.parse(f) : f);

//   for (const f of processedFields) {
//     if (f.type === 'signature' && f.value) {
//       try {
//         const pageIndex = Number(f.page) - 1;
//         if (pageIndex >= 0 && pageIndex < pages.length) {
//           const page = pages[pageIndex];
//           const { width, height } = page.getSize();
//           const base64Data = f.value.includes(',') ? f.value.split(',')[1] : f.value;
//           const sigImg = await pdfDoc.embedPng(Buffer.from(base64Data, 'base64'));

//           page.drawImage(sigImg, {
//             x: (Number(f.x) * width) / 100,
//             y: height - ((Number(f.y) * height) / 100) - ((Number(f.height) * height) / 100),
//             width: (Number(f.width) * width) / 100,
//             height: (Number(f.height) * height) / 100,
//           });
//         }
//       } catch (err) { console.error("Field Embedding Error:", err); }
//     }
//   }
//   return await pdfDoc.save();
// };

// const generateAndSendFinalDoc = async (doc) => {
//   try {
//     const pdfBytes = await mergeSignatures(doc);
    
//     const uploadResult = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream(
//         { 
//           resource_type: "raw", 
//           folder: "nexsign_completed", 
//           public_id: `final_${doc._id}.pdf` 
//         },
//         (err, res) => err ? reject(err) : resolve(res)
//       );
//       stream.end(Buffer.from(pdfBytes));
//     });

//     for (const party of doc.parties) {
//       await transporter.sendMail({
//         from: `"NexSign" <${process.env.EMAIL_USER}>`,
//         to: party.email,
//         subject: `Completed: ${doc.title}`,
//         html: `<p>সবাই স্বাক্ষর করেছেন। আপনার কপি ডাউনলোড করুন: <a href="${uploadResult.secure_url}">এখানে</a></p>`,
//         attachments: [{ filename: `${doc.title}_Signed.pdf`, content: Buffer.from(pdfBytes) }]
//       });
//     }
//   } catch (err) { console.error("Final process failed:", err); }
// };

// // --- রাউটসমূহ ---

// // ১. সাইনড ফাইল দেখা (Public Access based on status)
// router.get('/view-signed/:id', async (req, res) => {
//   try {
//     const doc = await Document.findById(req.params.id);
//     if (!doc || doc.status !== 'completed') {
//       return res.status(404).json({ error: "Signed document not found" });
//     }
//     const finalUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/nexsign_completed/final_${doc._id}.pdf`;
//     res.redirect(finalUrl);
//   } catch (err) { res.status(500).send("Error loading signed PDF"); }
// });

// // ২. টোকেন দিয়ে সাইন সেশন লোড (Signer doesn't need auth, just valid token)
// router.get('/sign/:token', async (req, res) => {
//   try {
//     const doc = await Document.findOne({ "parties.token": req.params.token });
//     if (!doc) return res.status(404).json({ error: "Invalid link" });
//     const partyIndex = doc.parties.findIndex(p => p.token === req.params.token);
//     const party = doc.parties[partyIndex];
//     await logActivity(doc._id, 'opened', req, "Signer opened the link", party);
//     const formattedFields = doc.fields.map(f => {
//       const fieldData = typeof f === 'string' ? JSON.parse(f) : f;
//       const fIndex = Number(fieldData.signerIndex ?? fieldData.partyIndex ?? 0);
//       return { ...fieldData, partyIndex: fIndex, isMine: fIndex === partyIndex };
//     });
//     res.json({ 
//       document: { ...doc.toObject(), fields: formattedFields }, 
//       party: { ...party.toObject(), index: partyIndex } 
//     });
//   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// });

// // ৩. পিডিএফ প্রক্সি
// router.get('/proxy/*', async (req, res) => {
//   try {
//     let fullPath = req.params[0];
//     if (!fullPath) return res.status(400).send("File ID required");
//     if (!fullPath.includes('/')) fullPath = `nexsign_docs/${fullPath}`;
//     const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${fullPath}`;
//     const response = await axios.get(url, { responseType: 'stream' });
//     res.setHeader('Content-Type', 'application/pdf');
//     response.data.pipe(res);
//   } catch (err) { res.status(404).send("Not Found"); }
// });

// // ৪. ড্যাশবোর্ড ডাটা (শুধুমাত্র নিজের ফাইল)
// router.get('/', auth, async (req, res) => { // ✅ auth added
//   try {
//     const documents = await Document.find({ owner: req.user.id }).sort({ createdAt: -1 }); // ✅ owner filter added
//     res.json(documents);
//   } catch (err) { res.status(500).json({ error: "Fetch Error" }); }
// });

// // ৫. ফাইল আপলোড (মালিক সেট করা)
// router.post('/upload', [auth, upload.single('file')], async (req, res) => { // ✅ auth added
//   try {
//     const result = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream({ resource_type: "raw", folder: "nexsign_docs" }, (err, res) => err ? reject(err) : resolve(res));
//       stream.end(req.file.buffer);
//     });
//     const newDoc = new Document({ 
//       title: req.file.originalname.replace('.pdf', ''), 
//       fileUrl: result.secure_url, 
//       fileId: result.public_id,
//       owner: req.user.id // ✅ owner ID saved
//     });
//     await newDoc.save();
//     await logActivity(newDoc._id, 'created', req, "Document uploaded");
//     res.json(newDoc);
//   } catch (err) { res.status(500).json({ error: "Upload failed" }); }
// });

// // ৬. ইমেইল পাঠানো
// router.post('/send', auth, async (req, res) => { // ✅ auth added
//   try {
//     const doc = await Document.findOne({ _id: req.body.id, owner: req.user.id }); // ✅ security check
//     if(!doc) return res.status(404).json({error: "Document not found or unauthorized"});
    
//     const token = crypto.randomBytes(32).toString('hex');
//     doc.parties[0].token = token;
//     doc.parties[0].status = 'sent';
//     doc.status = 'in_progress';
//     await doc.save();
//     await sendSigningEmail(doc.parties[0], doc.title, token, req);
//     res.json({ success: true });
//   } catch (err) { res.status(500).json({ error: "Send failed" }); }
// });

// // ৭. সিগনেচার সাবমিট
// router.post('/sign/submit', async (req, res) => {
//   try {
//     const { token, fields: incomingFields } = req.body;
//     const doc = await Document.findOne({ "parties.token": token });
//     if (!doc) return res.status(404).json({ error: "Invalid link or session" });

//     const currentIdx = doc.parties.findIndex(p => p.token === token);
//     const currentParty = doc.parties[currentIdx];

//     const secureFields = incomingFields.map(field => {
//       const originalField = doc.fields.find(f => {
//         const fData = typeof f === 'string' ? JSON.parse(f) : f;
//         return fData.id === field.id;
//       });
//       if (originalField) {
//         const fData = typeof originalField === 'string' ? JSON.parse(originalField) : originalField;
//         const ownerIdx = Number(fData.partyIndex ?? fData.signerIndex ?? 0);
//         if (ownerIdx !== currentIdx) return originalField;
//       }
//       return field;
//     });

//     doc.fields = secureFields;
//     doc.parties[currentIdx].status = 'signed';
//     doc.parties[currentIdx].signedAt = new Date();
//     doc.parties[currentIdx].token = null; 
//     doc.markModified('fields');
//     doc.markModified('parties');

//     await logActivity(doc._id, 'signed', req, "Party signed the document", currentParty);

//     if (currentIdx + 1 < doc.parties.length) {
//       const nextToken = crypto.randomBytes(32).toString('hex');
//       doc.parties[currentIdx + 1].token = nextToken;
//       doc.parties[currentIdx + 1].status = 'sent';
//       await doc.save();
//       await sendSigningEmail(doc.parties[currentIdx + 1], doc.title, nextToken, req);
//       res.json({ success: true, next: true });
//     } else {
//       doc.status = 'completed';
//       doc.completedAt = new Date();
//       await doc.save();
//       generateAndSendFinalDoc(doc);
//       res.json({ success: true, completed: true });
//     }
//   } catch (err) { res.status(500).json({ error: "Submission failed" }); }
// });

// // ৮. আইডি দিয়ে নির্দিষ্ট ডকুমেন্ট খোঁজা (সুরক্ষিত)
// router.get('/:id', auth, async (req, res) => { // ✅ auth added
//   try {
//     const doc = await Document.findOne({ _id: req.params.id, owner: req.user.id }); // ✅ security check
//     if (!doc) return res.status(404).json({ error: "Document not found" });
//     res.json(doc);
//   } catch (err) { res.status(500).json({ error: "Invalid ID" }); }
// });

// // ৯. ডকুমেন্ট আপডেট
// router.put('/:id', auth, async (req, res) => { // ✅ auth added
//   try {
//     const updatedDoc = await Document.findOneAndUpdate(
//       { _id: req.params.id, owner: req.user.id }, 
//       { $set: req.body }, 
//       { new: true }
//     );
//     if (!updatedDoc) return res.status(404).json({ error: "Not authorized to update" });
//     res.json(updatedDoc);
//   } catch (err) { res.status(500).json({ error: "Update failed" }); }
// });

// module.exports = router;
// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const axios = require('axios');
// const { v2: cloudinary } = require('cloudinary');
// const crypto = require('crypto');
// const nodemailer = require('nodemailer');
// const { PDFDocument } = require('pdf-lib');
// const Document = require('../models/Document');
// const AuditLog = require('../models/AuditLog');
// const auth = require('../middleware/auth');

// // ১. ক্লাউডিনারি কনফিগারেশন
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // ২. মেইল ট্রান্সপোর্টার
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: { 
//     user: process.env.EMAIL_USER, 
//     pass: process.env.EMAIL_PASS 
//   },
// });

// const upload = multer({ storage: multer.memoryStorage() });

// // --- হেল্পার ফাংশনসমূহ ---

// const logActivity = async (docId, action, req, details = {}, party = {}) => {
//   try {
//     await AuditLog.create({
//       document_id: docId,
//       action,
//       performed_by: {
//         name: party.name || "System",
//         email: party.email || "system@nexsign.com",
//         role: party.email ? 'signer' : 'system'
//       },
//       ip_address: req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : "127.0.0.1",
//       user_agent: req ? req.headers['user-agent'] : "Unknown",
//       details: typeof details === 'string' ? details : JSON.stringify(details)
//     });
//   } catch (err) { console.error("Audit Logging Failed:", err); }
// };

// const sendSigningEmail = async (party, docTitle, token, req) => {
//   const baseUrl = req.headers.origin || "http://localhost:5173";
//   const signLink = `${baseUrl}/sign?token=${token}`;
  
//   const mailOptions = {
//     from: `"NexSign" <${process.env.EMAIL_USER}>`,
//     to: party.email,
//     subject: `Signature Request: ${docTitle}`,
//     html: `
//       <div style="font-family:sans-serif;padding:20px;border-radius:10px;border:1px solid #e2e8f0;">
//         <h2 style="color:#0ea5e9;">Signature Request</h2>
//         <p>Hello <b>${party.name}</b>,</p>
//         <p>You have been invited to sign: <b>${docTitle}</b></p>
//         <a href="${signLink}" style="background:#0ea5e9;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;display:inline-block;">Sign Document</a>
//       </div>
//     `,
//   };
//   return transporter.sendMail(mailOptions);
// };

// const mergeSignatures = async (doc) => {
//   const response = await axios.get(doc.fileUrl, { responseType: 'arraybuffer' });
//   const pdfDoc = await PDFDocument.load(response.data);
//   const pages = pdfDoc.getPages();
//   const processedFields = Array.isArray(doc.fields) ? doc.fields : [];

//   for (const f of processedFields) {
//     if (f.value && (f.type === 'signature' || f.filled === true)) {
//       try {
//         const pageIndex = Number(f.page) - 1;
//         if (pageIndex >= 0 && pageIndex < pages.length) {
//           const page = pages[pageIndex];
//           const { width, height } = page.getSize();
//           const base64Data = f.value.includes(',') ? f.value.split(',')[1] : f.value;
//           const sigImg = await pdfDoc.embedPng(Buffer.from(base64Data, 'base64'));

//           page.drawImage(sigImg, {
//             x: (Number(f.x) * width) / 100,
//             y: height - ((Number(f.y) * height) / 100) - ((Number(f.height) * height) / 100),
//             width: (Number(f.width) * width) / 100,
//             height: (Number(f.height) * height) / 100,
//           });
//         }
//       } catch (err) { console.error("Field Embedding Error:", err); }
//     }
//   }
//   return await pdfDoc.save();
// };

// const generateAndSendFinalDoc = async (doc) => {
//   try {
//     const pdfBytes = await mergeSignatures(doc);
//     const uploadResult = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream(
//         { resource_type: "raw", folder: "nexsign_completed", public_id: `final_${doc._id}.pdf` },
//         (err, res) => err ? reject(err) : resolve(res)
//       );
//       stream.end(Buffer.from(pdfBytes));
//     });

//     for (const party of doc.parties) {
//       await transporter.sendMail({
//         from: `"NexSign" <${process.env.EMAIL_USER}>`,
//         to: party.email,
//         subject: `Completed: ${doc.title}`,
//         html: `<p>Signed document is ready. <a href="${uploadResult.secure_url}">Download</a></p>`,
//         attachments: [{ filename: `${doc.title}_Signed.pdf`, content: Buffer.from(pdfBytes) }]
//       });
//     }
//   } catch (err) { console.error("Final generation failed:", err); }
// };

// // --- রাউটসমূহ (অর্ডার ফিক্স করা হয়েছে) ---

// // ১. ফাইল আপলোড
// router.post('/upload', [auth, upload.single('file')], async (req, res) => {
//   try {
//     const result = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream({ resource_type: "raw", folder: "nexsign_docs" }, (err, res) => err ? reject(err) : resolve(res));
//       stream.end(req.file.buffer);
//     });
//     const newDoc = new Document({ title: req.file.originalname.replace('.pdf', ''), fileUrl: result.secure_url, fileId: result.public_id, owner: req.user.id });
//     await newDoc.save();
//     res.json(newDoc);
//   } catch (err) { res.status(500).json({ error: "Upload failed" }); }
// });

// // ২. প্রথম সাইনারকে ইমেইল পাঠানো
// router.post('/send', auth, async (req, res) => {
//   try {
//     const { documentId } = req.body;
//     const doc = await Document.findOne({ _id: documentId, owner: req.user.id });
//     if (!doc) return res.status(404).json({ error: "Document not found" });

//     const token = crypto.randomBytes(32).toString('hex');
//     doc.parties[0].token = token;
//     doc.parties[0].status = 'sent';
//     doc.status = 'in_progress';
    
//     await doc.save();
//     await sendSigningEmail(doc.parties[0], doc.title, token, req);
//     res.json({ success: true });
//   } catch (err) { res.status(500).json({ error: "Failed to send" }); }
// });

// // ৩. সাইন সেশন ডাটা (Signer Access)
// router.get('/sign/:token', async (req, res) => {
//   try {
//     const doc = await Document.findOne({ "parties.token": req.params.token });
//     if (!doc) return res.status(404).json({ error: "Invalid link" });
//     const partyIndex = doc.parties.findIndex(p => p.token === req.params.token);
//     const party = doc.parties[partyIndex];
//     const formattedFields = doc.fields.map(f => {
//       const fieldData = typeof f === 'string' ? JSON.parse(f) : f;
//       return { ...fieldData, isMine: Number(fieldData.partyIndex) === partyIndex };
//     });
//     res.json({ document: { ...doc.toObject(), fields: formattedFields }, party: { ...party.toObject(), index: partyIndex } });
//   } catch (err) { res.status(500).json({ error: "Session fetch error" }); }
// });

// // ৪. সিগনেচার সাবমিট
// router.post('/sign/submit', async (req, res) => {
//   try {
//     const { token, fields } = req.body;
//     const doc = await Document.findOne({ "parties.token": token });
//     if (!doc) return res.status(404).json({ error: "Session expired" });

//     const currentIdx = doc.parties.findIndex(p => p.token === token);
//     doc.fields = fields; 
//     doc.parties[currentIdx].status = 'signed';
//     doc.parties[currentIdx].token = null;

//     doc.markModified('fields');
//     doc.markModified('parties');

//     if (currentIdx + 1 < doc.parties.length) {
//       const nextToken = crypto.randomBytes(32).toString('hex');
//       doc.parties[currentIdx + 1].token = nextToken;
//       doc.parties[currentIdx + 1].status = 'sent';
//       await doc.save();
//       await sendSigningEmail(doc.parties[currentIdx + 1], doc.title, nextToken, req);
//       res.json({ success: true, next: true });
//     } else {
//       doc.status = 'completed';
//       await doc.save();
//       generateAndSendFinalDoc(doc);
//       res.json({ success: true, completed: true });
//     }
//   } catch (err) { res.status(500).json({ error: "Submission failed" }); }
// });

// // ৫. প্রক্সি (CORS ফিক্সড)
// router.get('/proxy/*', async (req, res) => {
//   try {
//     let fullPath = req.params[0];
//     const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${fullPath}`;
//     const response = await axios.get(url, { responseType: 'stream' });
//     res.setHeader('Content-Type', 'application/pdf');
//     response.data.pipe(res);
//   } catch (err) { res.status(404).send("File not found"); }
// });

// // ৬. ড্যাশবোর্ড লিস্ট (Owner)
// router.get('/', auth, async (req, res) => {
//   try {
//     const docs = await Document.find({ owner: req.user.id }).sort({ createdAt: -1 });
//     res.json(docs);
//   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// });


// // আপনার ব্যাকএন্ড রাউট ফাইলের শেষে (module.exports এর আগে) এটি বসান
// router.put('/:id', auth, async (req, res) => {
//   try {
//     const { title, parties, fields, totalPages } = req.body;
//     const doc = await Document.findOne({ _id: req.params.id, owner: req.user.id });

//     if (!doc) return res.status(404).json({ error: "Document not found" });

//     // ডাটা আপডেট
//     doc.title = title || doc.title;
//     doc.parties = parties || doc.parties;
//     doc.fields = fields || doc.fields;
//     doc.totalPages = totalPages || doc.totalPages;

//     // Mixed টাইপ সেভ করার জন্য এগুলো মার্ক করতে হয়
//     doc.markModified('fields');
//     doc.markModified('parties');

//     await doc.save();
//     res.json(doc);
//   } catch (err) {
//     res.status(500).json({ error: "Update failed" });
//   }
// });


// // ✅ ৭. এই রাউটটি শেষে থাকতে হবে (Dynamic ID)
// router.get('/:id', auth, async (req, res) => {
//   try {
//     const doc = await Document.findOne({ _id: req.params.id, owner: req.user.id });
//     if (!doc) return res.status(404).json({ error: "Not found" });
//     res.json(doc);
//   } catch (err) { res.status(404).json({ error: "Invalid ID" }); }
// });


// module.exports = router;
// const { PDFDocument } = require('pdf-lib');
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

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
// });

// const upload = multer({ storage: multer.memoryStorage() });

// // --- HELPERS ---

// const logActivity = async (docId, action, req, details = {}, party = {}) => {
//   try {
//     await AuditLog.create({
//       document_id: docId,
//       action,
//       performed_by: {
//         name: party.name || "System",
//         email: party.email || "system@nexsign.com",
//         role: party.email ? 'signer' : 'system'
//       },
//       ip_address: req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : "127.0.0.1",
//       details: typeof details === 'string' ? details : JSON.stringify(details)
//     });
//   } catch (err) { console.error("Audit Logging Failed:", err); }
// };

// const sendSigningEmail = async (party, docTitle, token, req) => {
//   const baseUrl = req.headers.origin || "http://localhost:5173";
//   const signLink = `${baseUrl}/sign?token=${token}`;
  
//   const mailOptions = {
//     from: `"NexSign" <${process.env.EMAIL_USER}>`,
//     to: party.email,
//     subject: `Signature Request: ${docTitle}`,
//     html: `
//       <div style="font-family:sans-serif;padding:20px;border:1px solid #eee;border-radius:10px;">
//         <h2 style="color:#0ea5e9;">Signature Request</h2>
//         <p>Hello <b>${party.name}</b>,</p>
//         <p>You have been invited to sign: <b>${docTitle}</b></p>
//         <a href="${signLink}" style="background:#0ea5e9;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;display:inline-block;">Sign Now</a>
//       </div>
//     `,
//   };
//   return transporter.sendMail(mailOptions);
// };

// // const generateAndSendFinalDoc = async (doc) => {
// //   try {
// //     const pdfBytes = await mergeSignatures(doc);
// //     const uploadResult = await new Promise((resolve, reject) => {
// //       const stream = cloudinary.uploader.upload_stream(
// //         { resource_type: "raw", folder: "nexsign_completed", public_id: `final_${doc._id}.pdf` },
// //         (err, res) => err ? reject(err) : resolve(res)
// //       );
// //       stream.end(Buffer.from(pdfBytes));
// //     });

// //     for (const party of doc.parties) {
// //       await transporter.sendMail({
// //         from: `"NexSign" <${process.env.EMAIL_USER}>`,
// //         to: party.email,
// //         subject: `Completed: ${doc.title}`,
// //         html: `<p>Signed document is ready. <a href="${uploadResult.secure_url}">Download</a></p>`,
// //         attachments: [{ filename: `${doc.title}_Signed.pdf`, content: Buffer.from(pdfBytes) }]
// //       });
// //     }
// //   } catch (err) { console.error("Final generation failed:", err); }
// // };
// // --- ROUTES (CRITICAL ORDER) ---
// // const mergeSignatures = async (doc) => {
// //   const response = await axios.get(doc.fileUrl, { responseType: 'arraybuffer' });
// //   const pdfDoc = await PDFDocument.load(response.data);
// //   const pages = pdfDoc.getPages();
// //   const processedFields = Array.isArray(doc.fields) ? doc.fields : [];

// //   for (const f of processedFields) {
// //     if (f.value && (f.type === 'signature' || f.filled === true)) {
// //       try {
// //         const pageIndex = Number(f.page) - 1;
// //         if (pageIndex >= 0 && pageIndex < pages.length) {
// //           const page = pages[pageIndex];
// //           const { width, height } = page.getSize();
// //           const base64Data = f.value.includes(',') ? f.value.split(',')[1] : f.value;
// //           const sigImg = await pdfDoc.embedPng(Buffer.from(base64Data, 'base64'));

// //           page.drawImage(sigImg, {
// //             x: (Number(f.x) * width) / 100,
// //             y: height - ((Number(f.y) * height) / 100) - ((Number(f.height) * height) / 100),
// //             width: (Number(f.width) * width) / 100,
// //             height: (Number(f.height) * height) / 100,
// //           });
// //         }
// //       } catch (err) { console.error("Field Embedding Error:", err); }
// //     }
// //   }
// //   return await pdfDoc.save();
// // };
// const mergeSignatures = async (doc) => {
//   // ১. পিডিএফ ডাটা ফেচ করা
//   const response = await axios.get(doc.fileUrl, { responseType: 'arraybuffer' });
  
//   // ২. পিডিএফ লোড করা (ignoreEncryption ব্যবহার করা ভালো যদি ফাইল প্রটেক্টেড থাকে)
//   const pdfDoc = await PDFDocument.load(response.data, { ignoreEncryption: true });
//   const pages = pdfDoc.getPages();
//   const processedFields = Array.isArray(doc.fields) ? doc.fields : [];

//   for (const f of processedFields) {
//     // স্ট্রিং হলে পার্স করা, নতুবা সরাসরি ব্যবহার
//     const fieldData = typeof f === 'string' ? JSON.parse(f) : f;

//     if (fieldData.value && (fieldData.type === 'signature' || fieldData.filled === true)) {
//       try {
//         const pageIndex = Number(fieldData.page) - 1;
//         if (pageIndex >= 0 && pageIndex < pages.length) {
//           const page = pages[pageIndex];
//           const { width, height } = page.getSize();
          
//           // ৩. গুরুত্বপূর্ণ: পেজের রোটেশন চেক করা (রেন্ডারিং ইস্যু ফিক্স করতে)
//           const rotation = page.getRotation().angle; 

//           const base64Data = fieldData.value.includes(',') ? fieldData.value.split(',')[1] : fieldData.value;
//           const sigImg = await pdfDoc.embedPng(Buffer.from(base64Data, 'base64'));

//           // ৪. পজিশন ক্যালকুলেশন (শতাংশ থেকে পয়েন্টে রূপান্তর)
//           const drawX = (Number(fieldData.x) * width) / 100;
//           const drawY = height - ((Number(fieldData.y) * height) / 100) - ((Number(fieldData.height) * height) / 100);
//           const drawW = (Number(fieldData.width) * width) / 100;
//           const drawH = (Number(fieldData.height) * height) / 100;

//           // ৫. ইমেজ ড্র করা (রোটেশনসহ)
//           page.drawImage(sigImg, {
//             x: drawX,
//             y: drawY,
//             width: drawW,
//             height: drawH,
//             // যদি পেজ রোটেটেড থাকে, সিগনেচারকেও সেই অনুযায়ী অ্যাডজাস্ট করা
//             rotate: rotation === 0 ? undefined : { angle: -rotation } 
//           });
//         }
//       } catch (err) { 
//         console.error("Field Embedding Error for field:", fieldData.id, err); 
//       }
//     }
//   }
  
//   // ৬. মেটাডাটা আপডেট (যাতে পিডিএফ করাপ্ট না দেখায়)
//   pdfDoc.setTitle(`Signed: ${doc.title}`);
//   pdfDoc.setProducer('NexSign');

//   return await pdfDoc.save();
// };
// // const generateAndSendFinalDoc = async (doc) => {
// //   try {
// //     const pdfBytes = await mergeSignatures(doc);
// //     const uploadResult = await new Promise((resolve, reject) => {
// //       const stream = cloudinary.uploader.upload_stream(
// //         { resource_type: "raw", folder: "nexsign_completed", public_id: `final_${doc._id}.pdf` },
// //         (err, res) => err ? reject(err) : resolve(res)
// //       );
// //       stream.end(Buffer.from(pdfBytes));
// //     });

// //     for (const party of doc.parties) {
// //       await transporter.sendMail({
// //         from: `"NexSign" <${process.env.EMAIL_USER}>`,
// //         to: party.email,
// //         subject: `Completed: ${doc.title}`,
// //         html: `<p>Signed document is ready. <a href="${uploadResult.secure_url}">Download</a></p>`,
// //         attachments: [{ filename: `${doc.title}_Signed.pdf`, content: Buffer.from(pdfBytes) }]
// //       });
// //     }
// //   } catch (err) { console.error("Final generation failed:", err); }
// // };
// // ✅ ১. প্রক্সি রাউট (পিডিএফ দেখানোর জন্য - সবার আগে)
// // router.get('/proxy/*', async (req, res) => {
// //   try {
// //     let filePath = req.params[0];
// //     // ক্লাউডিনারি raw ফাইলের জন্য এক্সটেনশন এনশিওর করা
// //     if (!filePath.toLowerCase().endsWith('.pdf')) filePath += '.pdf';

// //     const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${filePath}`;
// //     const response = await axios.get(url, { responseType: 'stream' });
    
// //     res.setHeader('Content-Type', 'application/pdf');
// //     response.data.pipe(res);
// //   } catch (err) { res.status(404).send("File not found"); }
// // });

// const generateAndSendFinalDoc = async (doc) => {
//   try {
//     const pdfUint8Array = await mergeSignatures(doc);
//     const pdfBuffer = Buffer.from(pdfUint8Array); // ✅ Uint8Array থেকে Buffer-এ রূপান্তর

//     // ১. ক্লাউডিনারিতে আপলোড (ব্যাকআপের জন্য)
//     const uploadResult = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream(
//         { resource_type: "raw", folder: "nexsign_completed", public_id: `final_${doc._id}.pdf` },
//         (err, res) => err ? reject(err) : resolve(res)
//       );
//       stream.end(pdfBuffer);
//     });

//     // ২. লুপ চালিয়ে সবাইকে ইমেইল পাঠানো
//     const mailPromises = doc.parties.map(party => {
//       return transporter.sendMail({
//         from: `"NexSign" <${process.env.EMAIL_USER}>`,
//         to: party.email,
//         subject: `Completed: ${doc.title}`,
//         html: `
//           <div style="font-family:sans-serif; padding:20px; border:1px solid #0ea5e9; border-radius:10px;">
//             <h2 style="color:#22c55e;">ডকুমেন্ট সাইনিং সম্পন্ন!</h2>
//             <p>হ্যালো <b>${party.name}</b>,</p>
//             <p>আপনার ডকুমেন্ট <b>"${doc.title}"</b>-এ সবাই স্বাক্ষর করেছেন। নিচে স্বাক্ষরিত পিডিএফ ফাইলটি অ্যাটাচ করা হলো।</p>
//             <p><a href="${uploadResult.secure_url}" style="color:#0ea5e9; font-weight:bold;">এখান থেকেও ডাউনলোড করতে পারেন।</a></p>
//           </div>
//         `,
//         attachments: [{ 
//           filename: `${doc.title}_Signed.pdf`, 
//           content: pdfBuffer // ✅ সরাসরি বাফার পাঠানো হচ্ছে
//         }]
//       });
//     });

//     await Promise.all(mailPromises);
//     console.log("সবাইকে সফলভাবে মেইল পাঠানো হয়েছে।");
//   } catch (err) { 
//     console.error("ফাইনাল পিডিএফ জেনারেশন বা মেইল পাঠাতে সমস্যা:", err); 
//   }
// };

// // ✅ ১. প্রক্সি রাউট (FIXED: Smart Capture)
// // router.get('/proxy/*', async (req, res) => {
// //   try {
// //     let filePath = req.params[0];
    
// //     // ডাবল চেক: এক্সটেনশন না থাকলে যোগ করা
// //     if (!filePath.toLowerCase().endsWith('.pdf')) {
// //       filePath = `${filePath}.pdf`;
// //     }

// //     const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${filePath}`;
    
// //     console.log("Fetching from Cloudinary:", url);

// //     const response = await axios.get(url, { 
// //       responseType: 'stream',
// //       timeout: 10000 
// //     });

// //     res.setHeader('Content-Type', 'application/pdf');
// //     res.setHeader('Content-Disposition', 'inline');
// //     response.data.pipe(res);
// //   } catch (err) { 
// //     console.error("Proxy Error:", err.message);
// //     res.status(404).send("File not found on Cloudinary"); 
// //   }
// // });

// // ✅ ১. প্রক্সি রাউট (FIXED: Caching & Stream Consistency)
// router.get('/proxy/*', async (req, res) => {
//   try {
//     let filePath = req.params[0];
//     if (!filePath.toLowerCase().endsWith('.pdf')) filePath += '.pdf';

//     const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${filePath}`;
    
//     const response = await axios.get(url, { 
//       responseType: 'stream',
//       timeout: 15000 // টাইমআউট একটু বাড়িয়ে দেওয়া হয়েছে
//     });

//     // ব্রাউজারকে নির্দেশ দেওয়া যাতে সে অসম্পূর্ণ ফাইল ক্যাশ না করে
//     res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
//     res.setHeader('Pragma', 'no-cache');
//     res.setHeader('Expires', '0');
//     res.setHeader('Content-Type', 'application/pdf');

//     // স্ট্রিম পাইপ করা
//     response.data.pipe(res);

//     // স্ট্রিম শেষ হলে প্রপারলি ক্লোজ করা
//     response.data.on('end', () => {
//       res.end();
//     });

//   } catch (err) { 
//     console.error("Proxy Error:", err.message);
//     res.status(404).send("File not found on Cloudinary"); 
//   }
// });
// // ✅ ২. সাইনার ডাটা রিট্রিভ (ইমেইল লিঙ্কের জন্য)
// router.get('/sign/:token', async (req, res) => {
//   try {
//     const { token } = req.params;
//     const doc = await Document.findOne({ "parties.token": token });
//     if (!doc) return res.status(404).json({ error: "Invalid link" });

//     const party = doc.parties.find(p => p.token === token);
//     const partyIndex = doc.parties.indexOf(party);
    
//     const formattedFields = doc.fields.map(f => {
//       const fieldData = typeof f === 'string' ? JSON.parse(f) : f;
//       return { ...fieldData, isMine: parseInt(fieldData.signerIndex) === partyIndex };
//     });

//     res.json({ 
//       document: { ...doc.toObject(), fields: formattedFields }, 
//       party: { ...party.toObject(), index: partyIndex } 
//     });
//   } catch (err) { res.status(500).json({ error: "Server error" }); }
// });

// // ✅ ৩. ফাইল আপলোড
// // router.post('/upload', [auth, upload.single('file')], async (req, res) => {
// //   try {
// //     const publicId = `nexsign_docs/${Date.now()}-${req.file.originalname.replace('.pdf', '')}`;
// //     const result = await new Promise((resolve, reject) => {
// //       const stream = cloudinary.uploader.upload_stream(
// //         { resource_type: "raw", public_id: publicId + ".pdf" }, 
// //         (err, res) => err ? reject(err) : resolve(res)
// //       );
// //       stream.end(req.file.buffer);
// //     });

// //     const newDoc = new Document({ 
// //       title: req.file.originalname.replace('.pdf', ''), 
// //       fileUrl: result.secure_url, 
// //       fileId: result.public_id, 
// //       owner: req.user.id 
// //     });
// //     await newDoc.save();
// //     res.json(newDoc);
// //   } catch (err) { res.status(500).json({ error: "Upload failed" }); }
// // });
// // ✅ ৩. ফাইল আপলোড (FIXED: Resource Type & Public ID)
// // router.post('/upload', [auth, upload.single('file')], async (req, res) => {
// //   try {
// //     if (!req.file) return res.status(400).json({ error: "No file uploaded" });

// //     // পাবলিক আইডির ফরম্যাট ফিক্স করা
// //     const timestamp = Date.now();
// //     const cleanName = req.file.originalname.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "_");
// //     const publicId = `nexsign_docs/${timestamp}-${cleanName}.pdf`; // শেষে .pdf নিশ্চিত করা

// //     const result = await new Promise((resolve, reject) => {
// //       const stream = cloudinary.uploader.upload_stream(
// //         { 
// //           resource_type: "raw", // PDF এর জন্য raw সঠিক
// //           public_id: publicId,
// //           // অতিরিক্ত প্যারামিটার যা ফরম্যাট N/A হওয়া আটকাবে
// //           use_filename: true,
// //           unique_filename: false
// //         }, 
// //         (err, res) => err ? reject(err) : resolve(res)
// //       );
// //       stream.end(req.file.buffer);
// //     });

// //     const newDoc = new Document({ 
// //       title: req.file.originalname.replace('.pdf', ''), 
// //       fileUrl: result.secure_url, 
// //       fileId: result.public_id, // nexsign_docs/xxx.pdf আকারে সেভ হবে
// //       owner: req.user.id 
// //     });
// //     await newDoc.save();
// //     res.json(newDoc);
// //   } catch (err) { 
// //     console.error("Upload failed:", err);
// //     res.status(500).json({ error: "Upload failed" }); 
// //   }
// // });
// router.post('/upload', [auth, upload.single('file')], async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ error: "No file uploaded" });

//     // ১. ফাইল টাইপ চেক (করাপশন রোধে)
//     if (req.file.mimetype !== 'application/pdf') {
//       return res.status(400).json({ error: "Only PDF files are allowed" });
//     }

//     const timestamp = Date.now();
//     const cleanName = req.file.originalname.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "_");
//     const publicId = `nexsign_docs/${timestamp}-${cleanName}.pdf`;

//     const result = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream(
//         { 
//           resource_type: "raw", 
//           public_id: publicId,
//           use_filename: true,
//           unique_filename: false
//         }, 
//         (err, res) => {
//           if (err) return reject(err);
//           resolve(res);
//         }
//       );
//       // ২. সরাসরি বাফার এন্ড করা
//       stream.end(req.file.buffer);
//     });

//     const newDoc = new Document({ 
//       title: req.file.originalname.replace('.pdf', ''), 
//       fileUrl: result.secure_url, 
//       fileId: result.public_id, 
//       owner: req.user.id 
//     });
//     await newDoc.save();
//     res.json(newDoc);
//   } catch (err) { 
//     console.error("Upload Detailed Error:", err);
//     res.status(500).json({ error: "Upload failed. File might be corrupted." }); 
//   }
// });
// // ✅ ৪. ইমেইল পাঠানো
// router.post('/send', auth, async (req, res) => {
//   try {
//     const { id } = req.body; 
//     const doc = await Document.findOne({ _id: id, owner: req.user.id });
    
//     if (!doc || !doc.parties[0]) return res.status(404).json({ error: "Setup missing" });

//     const token = crypto.randomBytes(32).toString('hex');
//     doc.parties[0].token = token;
//     doc.parties[0].status = 'sent';
//     doc.status = 'in_progress';
    
//     doc.markModified('parties');
//     await doc.save();
    
//     await logActivity(doc._id, 'INVITATION_SENT', req, { recipient: doc.parties[0].email });
//     await sendSigningEmail(doc.parties[0], doc.title, token, req);
    
//     res.json({ success: true });
//   } catch (err) { res.status(500).json({ error: "Send failed" }); }
// });
// // ৭. সিগনেচার সাবমিট
// router.post('/sign/submit', async (req, res) => {
//   try {
//     const { token, fields: incomingFields } = req.body;
//     const doc = await Document.findOne({ "parties.token": token });
//     if (!doc) return res.status(404).json({ error: "Invalid link or session" });

//     const currentIdx = doc.parties.findIndex(p => p.token === token);
//     const currentParty = doc.parties[currentIdx];

//     const secureFields = incomingFields.map(field => {
//       const originalField = doc.fields.find(f => {
//         const fData = typeof f === 'string' ? JSON.parse(f) : f;
//         return fData.id === field.id;
//       });
//       if (originalField) {
//         const fData = typeof originalField === 'string' ? JSON.parse(originalField) : originalField;
//         const ownerIdx = Number(fData.partyIndex ?? fData.signerIndex ?? 0);
//         if (ownerIdx !== currentIdx) return originalField;
//       }
//       return field;
//     });

//     doc.fields = secureFields;
//     doc.parties[currentIdx].status = 'signed';
//     doc.parties[currentIdx].signedAt = new Date();
//     doc.parties[currentIdx].token = null; 
//     doc.markModified('fields');
//     doc.markModified('parties');

//     await logActivity(doc._id, 'signed', req, "Party signed the document", currentParty);

//     if (currentIdx + 1 < doc.parties.length) {
//       const nextToken = crypto.randomBytes(32).toString('hex');
//       doc.parties[currentIdx + 1].token = nextToken;
//       doc.parties[currentIdx + 1].status = 'sent';
//       await doc.save();
//       await sendSigningEmail(doc.parties[currentIdx + 1], doc.title, nextToken, req);
//       res.json({ success: true, next: true });
//     } else {
//       doc.status = 'completed';
//       doc.completedAt = new Date();
//       await doc.save();
//       generateAndSendFinalDoc(doc);
//       res.json({ success: true, completed: true });
//     }
//   } catch (err) { res.status(500).json({ error: "Submission failed" }); }
// });
// // ✅ ৫. ড্যাশবোর্ড লিস্ট
// router.get('/', auth, async (req, res) => {
//   try {
//     const docs = await Document.find({ owner: req.user.id }).sort({ createdAt: -1 });
//     res.json(docs);
//   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// });

// // ✅ ৬. স্পেসিফিক আইডি (সবার শেষে রাখতে হবে)
// router.get('/:id', auth, async (req, res) => {
//   try {
//     const doc = await Document.findOne({ _id: req.params.id, owner: req.user.id });
//     if (!doc) return res.status(404).json({ error: "Not found" });
//     res.json(doc);
//   } catch (err) { res.status(404).json({ error: "Invalid ID" }); }
// });

// // ✅ ৭. আপডেট (সবার শেষে)
// router.put('/:id', auth, async (req, res) => {
//   try {
//     const doc = await Document.findOne({ _id: req.params.id, owner: req.user.id });
//     if (!doc) return res.status(404).json({ error: "Not found" });

//     Object.assign(doc, req.body);
//     doc.markModified('fields');
//     doc.markModified('parties');
//     await doc.save();
//     res.json(doc);
//   } catch (err) { res.status(500).json({ error: "Update failed" }); }
// });

// module.exports = router;


//ei studio
// ১. StandardFonts ইম্পোর্ট করুন
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

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
// });

// const upload = multer({ storage: multer.memoryStorage() });

// // --- HELPERS ---
// const sendSigningEmail = async (party, docTitle, token, req) => {
//   const baseUrl = req.headers.origin || "http://localhost:5173";
//   const signLink = `${baseUrl}/sign?token=${token}`;
//   const mailOptions = {
//     from: `"NexSign" <${process.env.EMAIL_USER}>`,
//     to: party.email,
//     subject: `Signature Request: ${docTitle}`,
//     html: `<div style="font-family:sans-serif;padding:20px;border:1px solid #eee;border-radius:10px;">
//         <h2 style="color:#0ea5e9;">Signature Request</h2>
//         <p>Hello <b>${party.name}</b>,</p>
//         <p>You have been invited to sign: <b>${docTitle}</b></p>
//         <a href="${signLink}" style="background:#0ea5e9;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;display:inline-block;">Sign Now</a>
//       </div>`,
//   };
//   return transporter.sendMail(mailOptions);
// };

// // --- PDF MERGE LOGIC (Times New Roman, Clear Text) ---
// const mergeSignatures = async (doc) => {
//   const response = await axios.get(doc.fileUrl, { responseType: 'arraybuffer' });
//   const pdfDoc = await PDFDocument.load(response.data, { ignoreEncryption: true });
//   const timesFont = await pdfDoc.embedFont(StandardFonts.TimesRoman); // Normal Times New Roman
//   const pages = pdfDoc.getPages();

//   const processedFields = Array.isArray(doc.fields) ? doc.fields : [];
//   for (const f of processedFields) {
//     const fieldData = typeof f === 'string' ? JSON.parse(f) : f;
//     if (fieldData.value && fieldData.filled) {
//       const page = pages[Number(fieldData.page) - 1];
//       const { width, height } = page.getSize();
//       const drawX = (Number(fieldData.x) * width) / 100;
//       const drawY = height - ((Number(fieldData.y) * height) / 100) - ((Number(fieldData.height) * height) / 100);
//       const drawW = (Number(fieldData.width) * width) / 100;
//       const drawH = (Number(fieldData.height) * height) / 100;

//       if (fieldData.value.startsWith('data:image')) {
//         const base64Data = fieldData.value.split(',')[1];
//         const sigImg = await pdfDoc.embedPng(Buffer.from(base64Data, 'base64'));
//         page.drawImage(sigImg, { x: drawX, y: drawY, width: drawW, height: drawH });
//       } else {
//         page.drawText(String(fieldData.value), {
//           x: drawX + 5, y: drawY + (drawH / 2) - 5,
//           size: 14, font: timesFont, color: rgb(0, 0, 0)
//         });
//       }
//     }
//   }
//   return await pdfDoc.save();
// };

// const generateAndSendFinalDoc = async (doc) => {
//   try {
//     const pdfBytes = await mergeSignatures(doc);
//     const publicId = `nexsign_completed/final_${doc._id}.pdf`;
//     const uploadResult = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream({ resource_type: "raw", public_id: publicId }, (err, res) => err ? reject(err) : resolve(res));
//       stream.end(Buffer.from(pdfBytes));
//     });
//     doc.fileUrl = uploadResult.secure_url;
//     doc.status = 'completed';
//     await doc.save();
//     for (const party of doc.parties) {
//       await transporter.sendMail({
//         from: process.env.EMAIL_USER, to: party.email,
//         subject: `Completed: ${doc.title}`,
//         html: `<p>The document <b>${doc.title}</b> is complete.</p>`,
//         attachments: [{ filename: `${doc.title}_Signed.pdf`, content: Buffer.from(pdfBytes) }]
//       });
//     }
//   } catch (err) { console.error(err); }
// };

// // ---------------- ROUTES ----------------

// // ১. Proxy Route (Fixed 404 issue)
// router.get('/proxy/*', async (req, res) => {
//   try {
//     let filePath = req.params[0]; // e.g. "nexsign_docs/123"
//     if (!filePath.toLowerCase().endsWith('.pdf')) filePath += '.pdf';
    
//     const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${filePath}`;
//     console.log("Fetching from Cloudinary:", url);

//     const response = await axios.get(url, { responseType: 'stream', timeout: 15000 });
//     res.setHeader('Content-Type', 'application/pdf');
//     response.data.pipe(res);
//   } catch (err) {
//     console.error("Proxy Error:", err.message);
//     res.status(404).send("PDF not found");
//   }
// });

// // ২. Sign Data Route (Fixed 404 issue)
// router.get('/sign/:token', async (req, res) => {
//   try {
//     const doc = await Document.findOne({ "parties.token": req.params.token });
//     if (!doc) return res.status(404).json({ error: "Invalid link" });
//     const party = doc.parties.find(p => p.token === req.params.token);
//     const partyIndex = doc.parties.indexOf(party);
//     const formattedFields = doc.fields.map(f => {
//       const fd = typeof f === 'string' ? JSON.parse(f) : f;
//       return { ...fd, isMine: Number(fd.partyIndex) === partyIndex };
//     });
//     res.json({ document: { ...doc.toObject(), fields: formattedFields }, party: { ...party.toObject(), index: partyIndex } });
//   } catch (err) { res.status(500).json({ error: "Server error" }); }
// });

// // ৩. Submit Signature
// router.post('/sign/submit', async (req, res) => {
//   try {
//     const doc = await Document.findOne({ "parties.token": req.body.token });
//     const currentIdx = doc.parties.findIndex(p => p.token === req.body.token);
//     doc.fields = doc.fields.map(f => {
//       const fd = typeof f === 'string' ? JSON.parse(f) : f;
//       if (Number(fd.partyIndex) === currentIdx) {
//         const incoming = req.body.fields.find(inc => inc.id === fd.id);
//         return incoming || fd;
//       }
//       return fd;
//     });
//     doc.parties[currentIdx].status = 'signed';
//     doc.parties[currentIdx].signedAt = new Date();
//     doc.markModified('fields'); doc.markModified('parties');
//     if (currentIdx + 1 < doc.parties.length) {
//       const nextToken = crypto.randomBytes(32).toString('hex');
//       doc.parties[currentIdx + 1].token = nextToken;
//       doc.parties[currentIdx + 1].status = 'sent';
//       await doc.save();
//       await sendSigningEmail(doc.parties[currentIdx + 1], doc.title, nextToken, req);
//       res.json({ success: true, next: true });
//     } else {
//       await doc.save();
//       await generateAndSendFinalDoc(doc);
//       res.json({ success: true, completed: true });
//     }
//   } catch (err) { res.status(500).json({ error: "Failed" }); }
// });

// // ৪. Send Invitation
// router.post('/send', auth, async (req, res) => {
//   try {
//     const doc = await Document.findOne({ _id: req.body.id, owner: req.user.id });
//     const token = crypto.randomBytes(32).toString('hex');
//     doc.parties[0].token = token;
//     doc.parties[0].status = 'sent';
//     doc.status = 'in_progress';
//     await doc.save();
//     await sendSigningEmail(doc.parties[0], doc.title, token, req);
//     res.json({ success: true });
//   } catch (err) { res.status(500).json({ error: "Failed" }); }
// });

// // OTHERS (Upload, Get, etc.)
// router.get('/', auth, async (req, res) => {
//   const docs = await Document.find({ owner: req.user.id }).sort({ createdAt: -1 });
//   res.json(docs);
// });
// router.get('/:id', auth, async (req, res) => {
//   const doc = await Document.findOne({ _id: req.params.id, owner: req.user.id });
//   res.json(doc);
// });
// router.put('/:id', auth, async (req, res) => {
//   const doc = await Document.findOne({ _id: req.params.id, owner: req.user.id });
//   Object.assign(doc, req.body);
//   doc.markModified('fields'); doc.markModified('parties');
//   await doc.save();
//   res.json(doc);
// });

// module.exports = router;
// const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const axios = require('axios');
// const { v2: cloudinary } = require('cloudinary');
// const crypto = require('crypto');
// const nodemailer = require('nodemailer');
// const Document = require('../models/Document');
// const auth = require('../middleware/auth');

// // ১. ক্লাউডিনারি কনফিগ
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
// });

// // ২. মাল্টার সেটআপ (ফাইল রিসিভ করার জন্য)
// const upload = multer({ storage: multer.memoryStorage() });

// // --- হেল্পার ফাংশনসমূহ ---

// const sendSigningEmail = async (party, docTitle, token, req) => {
//   const baseUrl = req.headers.origin || "http://localhost:5173";
//   const signLink = `${baseUrl}/sign?token=${token}`;
  
//   const mailOptions = {
//     from: `"NexSign" <${process.env.EMAIL_USER}>`,
//     to: party.email,
//     subject: `Signature Request: ${docTitle}`,
//     html: `
//       <div style="font-family:sans-serif;padding:20px;border:1px solid #eee;border-radius:10px;">
//         <h2 style="color:#0ea5e9;">Signature Request</h2>
//         <p>Hello <b>${party.name}</b>,</p>
//         <p>You have been invited to sign: <b>${docTitle}</b></p>
//         <a href="${signLink}" style="background:#0ea5e9;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;display:inline-block;">Sign Now</a>
//       </div>
//     `,
//   };
//   return transporter.sendMail(mailOptions);
// };

// const mergeSignatures = async (doc) => {
//   const response = await axios.get(doc.fileUrl, { responseType: 'arraybuffer' });
//   const pdfDoc = await PDFDocument.load(response.data, { ignoreEncryption: true });
//   const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
//   const pages = pdfDoc.getPages();

//   for (const f of doc.fields) {
//     const fieldData = typeof f === 'string' ? JSON.parse(f) : f;
//     if (fieldData.value && fieldData.filled) {
//       const page = pages[Number(fieldData.page) - 1];
//       const { width, height } = page.getSize();
      
//       const drawX = (Number(fieldData.x) * width) / 100;
//       const drawY = height - ((Number(fieldData.y) * height) / 100) - ((Number(fieldData.height) * height) / 100);
//       const drawW = (Number(fieldData.width) * width) / 100;
//       const drawH = (Number(fieldData.height) * height) / 100;

//       if (fieldData.value.startsWith('data:image')) {
//         const base64Data = fieldData.value.split(',')[1];
//         const sigImg = await pdfDoc.embedPng(Buffer.from(base64Data, 'base64'));
//         page.drawImage(sigImg, { x: drawX, y: drawY, width: drawW, height: drawH });
//       } else {
//         page.drawText(String(fieldData.value), {
//           x: drawX + 5, y: drawY + (drawH / 2) - 5,
//           size: 14, font: timesRomanFont, color: rgb(0, 0, 0),
//         });
//       }
//     }
//   }
//   return await pdfDoc.save();
// };

// const generateAndSendFinalDoc = async (doc) => {
//   try {
//     const pdfBytes = await mergeSignatures(doc);
//     const pdfBuffer = Buffer.from(pdfBytes);
//     const publicId = `nexsign_completed/final_${doc._id}`;

//     const uploadResult = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream(
//         { resource_type: "raw", public_id: publicId, format: 'pdf' },
//         (err, res) => err ? reject(err) : resolve(res)
//       );
//       stream.end(pdfBuffer);
//     });

//     doc.fileUrl = uploadResult.secure_url;
//     doc.fileId = uploadResult.public_id; 
//     doc.status = 'completed';
//     doc.completedAt = new Date();
//     await doc.save();

//     for (const party of doc.parties) {
//       await transporter.sendMail({
//         from: process.env.EMAIL_USER,
//         to: party.email,
//         subject: `Completed: ${doc.title}`,
//         html: `<p>Document <b>${doc.title}</b> is complete.</p>`,
//         attachments: [{ filename: `${doc.title}_Signed.pdf`, content: pdfBuffer }]
//       });
//     }
//   } catch (err) { console.error("Finalization Error:", err); }
// };

// // --- ROUTES ---

// // ৩. UPLOAD ROUTE (এটিই আপনার সমস্যার সমাধান)
// router.post('/upload', [auth, upload.single('file')], async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ error: "No file uploaded" });

//     const publicId = `nexsign_docs/${Date.now()}`;
//     const result = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream(
//         { resource_type: "raw", public_id: publicId, format: 'pdf' }, 
//         (err, res) => err ? reject(err) : resolve(res)
//       );
//       stream.end(req.file.buffer);
//     });

//     const newDoc = new Document({ 
//       title: req.file.originalname.replace('.pdf', ''), 
//       fileUrl: result.secure_url, 
//       fileId: result.public_id, 
//       owner: req.user.id 
//     });
//     await newDoc.save();
//     res.json(newDoc);
//   } catch (err) { 
//     console.error("Upload Error:", err);
//     res.status(500).json({ error: "Upload failed" }); 
//   }
// });

// // ৪. SEND INVITATION ROUTE
// router.post('/send', auth, async (req, res) => {
//   try {
//     const { id } = req.body;
//     const doc = await Document.findOne({ _id: id, owner: req.user.id });
//     if (!doc) return res.status(404).json({ error: "Document not found" });

//     const token = crypto.randomBytes(32).toString('hex');
//     doc.parties[0].token = token;
//     doc.parties[0].status = 'sent';
//     doc.status = 'in_progress';
//     await doc.save();
    
//     await sendSigningEmail(doc.parties[0], doc.title, token, req);
//     res.json({ success: true });
//   } catch (err) { res.status(500).json({ error: "Send failed" }); }
// });

// // ৫. SIGNING DATA ROUTE
// router.get('/sign/:token', async (req, res) => {
//   try {
//     const doc = await Document.findOne({ "parties.token": req.params.token });
//     if (!doc) return res.status(404).json({ error: "Invalid link" });
//     const party = doc.parties.find(p => p.token === req.params.token);
//     const partyIndex = doc.parties.indexOf(party);
//     const formattedFields = doc.fields.map(f => {
//       const fd = typeof f === 'string' ? JSON.parse(f) : f;
//       return { ...fd, isMine: Number(fd.partyIndex) === partyIndex };
//     });
//     res.json({ document: { ...doc.toObject(), fields: formattedFields }, party: { ...party.toObject(), index: partyIndex } });
//   } catch (err) { res.status(500).json({ error: "Error" }); }
// });

// // ৬. SUBMIT SIGNATURE ROUTE
// router.post('/sign/submit', async (req, res) => {
//   try {
//     const { token, fields: incomingFields } = req.body;
//     const doc = await Document.findOne({ "parties.token": token });
//     if (!doc) return res.status(404).json({ error: "Doc not found" });

//     const currentIdx = doc.parties.findIndex(p => p.token === token);
    
//     doc.fields = doc.fields.map(originalF => {
//       const origData = typeof originalF === 'string' ? JSON.parse(originalF) : originalF;
//       if (Number(origData.partyIndex) === currentIdx) {
//         const incoming = incomingFields.find(incF => incF.id === origData.id);
//         return incoming || origData;
//       }
//       return origData;
//     });

//     doc.parties[currentIdx].status = 'signed';
//     doc.parties[currentIdx].signedAt = new Date();
//     doc.markModified('fields'); doc.markModified('parties');

//     if (currentIdx + 1 < doc.parties.length) {
//       const nextToken = crypto.randomBytes(32).toString('hex');
//       doc.parties[currentIdx + 1].token = nextToken;
//       doc.parties[currentIdx + 1].status = 'sent';
//       await doc.save();
//       await sendSigningEmail(doc.parties[currentIdx + 1], doc.title, nextToken, req);
//       res.json({ success: true, next: true });
//     } else {
//       await doc.save();
//       await generateAndSendFinalDoc(doc);
//       res.json({ success: true, completed: true });
//     }
//   } catch (err) { res.status(500).json({ error: "Failed" }); }
// });

// // ৭. PROXY PDF ROUTE
// router.get('/proxy/*', async (req, res) => {
//   try {
//     let filePath = req.params[0];
//     if (!filePath.toLowerCase().endsWith('.pdf')) filePath += '.pdf';
//     const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${filePath}`;
//     const response = await axios.get(url, { responseType: 'stream' });
//     res.setHeader('Content-Type', 'application/pdf');
//     response.data.pipe(res);
//   } catch (err) { res.status(404).send("Not found"); }
// });

// // ৮. GET ALL DOCUMENTS
// // router.get('/', auth, async (req, res) => {
// //   try {
// //     const docs = await Document.find({ owner: req.user.id }).sort({ createdAt: -1 });
// //     res.json(docs);
// //   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// // });
// // DocumentRoutes.js এর ভেতরে এটি পরিবর্তন করুন
// // DocumentRoutes.js এ এটি আপডেট করুন
// router.get('/', auth, async (req, res) => {
//   try {
//     // 🌟 createdAt এর বদলে updatedAt: -1 দিন
//     // এতে যখনই কোনো ড্রাফট ফাইল সেন্ড করবেন বা কেউ সাইন করবে, 
//     // সেটি ডাটাবেসে সবার উপরে চলে আসবে।
//     const docs = await Document.find({ owner: req.user.id }).sort({ updatedAt: -1 });
//     res.json(docs);
//   } catch (err) {
//     res.status(500).json({ error: "Fetch error" });
//   }
// });

// router.get('/:id', auth, async (req, res) => {
//   try {
//     const doc = await Document.findOne({ _id: req.params.id, owner: req.user.id });
//     res.json(doc);
//   } catch (err) { res.status(404).json({ error: "Not found" }); }
// });

// router.put('/:id', auth, async (req, res) => {
//   try {
//     const doc = await Document.findOne({ _id: req.params.id, owner: req.user.id });
//     Object.assign(doc, req.body);
//     doc.markModified('fields'); doc.markModified('parties');
//     await doc.save();
//     res.json(doc);
//   } catch (err) { res.status(500).json({ error: "Update failed" }); }
// });

// module.exports = router;
// const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const axios = require('axios');
// const { v2: cloudinary } = require('cloudinary');
// const crypto = require('crypto');
// const nodemailer = require('nodemailer');
// const Document = require('../models/Document');
// const auth = require('../middleware/auth');


// const storage = multer.memoryStorage();
// const upload = multer({ 
//   storage: storage,
//   limits: { fileSize: 10 * 1024 * 1024 } 
// });



// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // const transporter = nodemailer.createTransport({
// //   service: 'gmail',
// //   auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },


// // connectionTimeout: 30000, 
// //   greetingTimeout: 30000,
// //   socketTimeout: 30000,

// // });

// // নিশ্চিত করুন ফাইলের শুরুতে 'upload' ডিফাইন করা আছে (আগের বার যেমন দেখিয়েছিলাম)
// router.post('/upload', [auth, upload.single('file')], async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     const publicId = `nexsign_docs/${Date.now()}`;
    
//     // ক্লাউডিনারিতে বাফার স্ট্রিম করা
//     const result = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream(
//         { resource_type: "raw", public_id: publicId, format: 'pdf' }, 
//         (err, res) => {
//           if (err) return reject(err);
//           resolve(res);
//         }
//       );
//       stream.end(req.file.buffer);
//     });

//     // ডাটাবেসে ডকুমেন্ট তৈরি
//     const newDoc = new Document({ 
//       title: req.file.originalname.replace('.pdf', ''), 
//       fileUrl: result.secure_url, 
//       fileId: result.public_id, 
//       owner: req.user.id 
//     });

//     await newDoc.save();
//     res.json(newDoc);
//   } catch (err) {
//     console.error("Upload Error:", err);
//     res.status(500).json({ error: "File upload failed", details: err.message });
//   }
// });
// // const transporter = nodemailer.createTransport({
// //   host: "smtp.gmail.com",
// //   port: 587,
// //   secure: false, // ৫8৭ পোর্টের জন্য এটি false হতে হবে
// //   auth: { 
// //     user: process.env.EMAIL_USER, 
// //     pass: process.env.EMAIL_PASS 
// //   },
// //   tls: {
// //     // এটি Render-এ সিকিউরিটি হ্যান্ডশেক এরর এড়াতে সাহায্য করে
// //     rejectUnauthorized: false 
// //   },
// //   connectionTimeout: 40000, 
// //   greetingTimeout: 40000,
// //   socketTimeout: 40000,
// // });
// // routes/documentRoutes.js ফাইলে গিয়ে এই অংশটি পরিবর্তন করুন
// // ১. ট্রান্সপোর্টার সেটআপ (ফিক্সড)
// const transporter = nodemailer.createTransport({
//   host: "smtp-relay.brevo.com",
//   port: 587,
//   secure: false, 
//   auth: { 
//     user: "a478c8001@smtp-brevo.com", // আপনার ব্রেভো লগইন আইডি
//     pass: process.env.BREVO_API_KEY  // আপনার নতুন জেনারেট করা কী
//   }
// });

// // ২. ইমেইল পাঠানোর ফাংশন (ফিক্সড)
// const sendSigningEmail = async (party, docTitle, token, req) => {
//   const baseUrl = process.env.FRONTEND_URL || "https://nexsignfrontend.vercel.app";
//   const signLink = `${baseUrl}/sign?token=${token}`;

//   const mailOptions = {
//     // 🌟 ব্রেভো শুধুমাত্র ভেরিফাইড সেন্ডার থেকে মেইল পাঠাতে দেয় 🌟
//     // আপনার ব্রেভো একাউন্টে যে ইমেইলটি ভেরিফাই করেছেন সেটিই এখানে দিন
//     from: '"NexSign" <bisalsaha42@gmail.com>', 
//     to: party.email,
//     subject: `Signature Request: ${docTitle}`,
//     html: `
//       <div style="font-family:sans-serif;padding:20px;border:1px solid #eee;border-radius:10px;max-width:500px;">
//         <h2 style="color:#0ea5e9;margin-bottom:20px;">Signature Request</h2>
//         <p>Hello <b>${party.name}</b>,</p>
//         <p>You have been invited to sign the document: <b>${docTitle}</b></p>
//         <div style="margin-top:30px;">
//           <a href="${signLink}" style="background:#0ea5e9;color:white;padding:14px 28px;text-decoration:none;border-radius:8px;display:inline-block;font-weight:bold;">Sign Document Now</a>
//         </div>
//         <p style="margin-top:30px;font-size:12px;color:#888;">If the button doesn't work, copy this link: ${signLink}</p>
//       </div>
//     `,
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Email Sent Successfully: ", info.messageId);
//     return info;
//   } catch (error) {
//     console.error("Brevo Email Error: ", error.message);
//     throw error; 
//   }
// };
// // const sendSigningEmail = async (party, docTitle, token, req) => {
// //   // const baseUrl = req.headers.origin || "http://localhost:5173";
// //   // const signLink = `${baseUrl}/sign?token=${token}`;
  
// // const baseUrl = process.env.FRONTEND_URL || req.headers.origin || "https://nexsignfrontend.vercel.app";
// //   const signLink = `${baseUrl}/sign?token=${token}`;


// //   const mailOptions = {
// //     from: `"NexSign" <${process.env.EMAIL_USER}>`,
// //     to: party.email,
// //     subject: `Signature Request: ${docTitle}`,
// //     html: `
// //       <div style="font-family:sans-serif;padding:20px;border:1px solid #eee;border-radius:10px;">
// //         <h2 style="color:#0ea5e9;">Signature Request</h2>
// //         <p>Hello <b>${party.name}</b>,</p>
// //         <p>You have been invited to sign: <b>${docTitle}</b></p>
// //         <a href="${signLink}" style="background:#0ea5e9;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;display:inline-block;">Sign Now</a>
// //       </div>
// //     `,
// //   };
// //   return transporter.sendMail(mailOptions);
// // };


// // const sendSigningEmail = async (party, docTitle, token, req) => {
// //   const baseUrl = process.env.FRONTEND_URL || req.headers.origin || "https://nexsignfrontend.vercel.app";
// //   const signLink = `${baseUrl}/sign?token=${token}`;

// //   const mailOptions = {
// //     from: `"NexSign" <${process.env.EMAIL_USER}>`,
// //     to: party.email,
// //     subject: `Signature Request: ${docTitle}`,
// //     html: `
// //       <div style="font-family:sans-serif;padding:20px;border:1px solid #eee;border-radius:10px;max-width:500px;">
// //         <h2 style="color:#0ea5e9;margin-bottom:20px;">Signature Request</h2>
// //         <p>Hello <b>${party.name}</b>,</p>
// //         <p>You have been invited to sign the document: <b>${docTitle}</b></p>
// //         <div style="margin-top:30px;">
// //           <a href="${signLink}" style="background:#0ea5e9;color:white;padding:14px 28px;text-decoration:none;border-radius:8px;display:inline-block;font-weight:bold;">Sign Document Now</a>
// //         </div>
// //         <p style="margin-top:30px;font-size:12px;color:#888;">If the button doesn't work, copy this link: ${signLink}</p>
// //       </div>
// //     `,
// //   };

// //   // এটি সরাসরি ট্রান্সপোর্টারকে কল করবে এবং রেজাল্ট দিবে
// //   try {
// //     const info = await transporter.sendMail(mailOptions);
// //     console.log("Email Sent Successfully: ", info.messageId);
// //     return info;
// //   } catch (error) {
// //     console.error("Nodemailer Error: ", error);
// //     throw error; // যাতে মেইন রাউট বুঝতে পারে ইমেইল ফেইল করেছে
// //   }
// // };
// // const sendSigningEmail = async (party, docTitle, token, req) => {
// //   const baseUrl = process.env.FRONTEND_URL || "https://nexsignfrontend.vercel.app";
// //   const signLink = `${baseUrl}/sign?token=${token}`;

// //   const mailOptions = {
// //     // এখানে ${process.env.EMAIL_USER} এর বদলে সরাসরি আপনার ভেরিফাইড ইমেইল দিন
// //     from: `"NexSign" <bisalsaha42@gmail.com>`, 
// //     to: party.email,
// //     subject: `Signature Request: ${docTitle}`,
// //     html: `
// //       <div style="font-family:sans-serif;padding:20px;border:1px solid #eee;border-radius:10px;max-width:500px;">
// //         <h2 style="color:#0ea5e9;margin-bottom:20px;">Signature Request</h2>
// //         <p>Hello <b>${party.name}</b>,</p>
// //         <p>You have been invited to sign the document: <b>${docTitle}</b></p>
// //         <div style="margin-top:30px;">
// //           <a href="${signLink}" style="background:#0ea5e9;color:white;padding:14px 28px;text-decoration:none;border-radius:8px;display:inline-block;font-weight:bold;">Sign Document Now</a>
// //         </div>
// //         <p style="margin-top:30px;font-size:12px;color:#888;">If the button doesn't work, copy this link: ${signLink}</p>
// //       </div>
// //     `,
// //   };

// //   try {
// //     const info = await transporter.sendMail(mailOptions);
// //     console.log("Email Sent Successfully: ", info.messageId);
// //     return info;
// //   } catch (error) {
// //     console.error("Nodemailer Error: ", error);
// //     throw error; 
// //   }
// // };

// // --- PDF MERGE LOGIC (Coordinate Fix) ---
// const mergeSignatures = async (doc) => {
//   const response = await axios.get(doc.fileUrl, { responseType: 'arraybuffer' });
//   const pdfDoc = await PDFDocument.load(response.data, { ignoreEncryption: true });
//   const timesFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
//   const pages = pdfDoc.getPages();

//   const fields = Array.isArray(doc.fields) ? doc.fields : [];
//   for (const f of fields) {
//     const fd = typeof f === 'string' ? JSON.parse(f) : f;
//     if (fd.value && fd.filled) {
//       const pageIndex = Number(fd.page) - 1;
//       if (pageIndex < 0 || pageIndex >= pages.length) continue;

//       const page = pages[pageIndex];
//       const { width, height } = page.getSize();
      
//       // PDF-Lib uses bottom-left origin (0,0). 
//       // We convert percentage-based top-left to bottom-left units.
//       const drawW = (Number(fd.width) * width) / 100;
//       const drawH = (Number(fd.height) * height) / 100;
//       const drawX = (Number(fd.x) * width) / 100;
//       // Precision fix for Y coordinate
//       // const drawY = height - ((Number(fd.y) * height) / 100) - drawH;
//    const drawY = height - ((Number(fd.y) * height) / 100) - drawH;

//       const rotation = page.getRotation().angle;

//       if (fd.value.startsWith('data:image')) {
//         const base64Data = fd.value.split(',')[1];
//         const sigImg = await pdfDoc.embedPng(Buffer.from(base64Data, 'base64'));
//         page.drawImage(sigImg, { 
//           x: drawX, y: drawY, width: drawW, height: drawH,
//           rotate: rotation === 0 ? undefined : { angle: -rotation }
//         });
//       } else {
//         page.drawText(String(fd.value), {
//           x: drawX + 2, y: drawY + (drawH / 2) - 4,
//           size: 12, font: timesFont, color: rgb(0, 0, 0),
//         });
//       }
//     }
//   }
//   return await pdfDoc.save();
// };



// // --- ROUTES ---

// router.get('/', auth, async (req, res) => {
//   try {
//     const docs = await Document.find({ owner: req.user.id }).sort({ updatedAt: -1 });
//     res.json(docs);
//   } catch (err) { res.status(500).json({ error: "Fetch error" }); }
// });

// // router.post('/upload', [auth, upload.single('file')], async (req, res) => {
// //   try {
// //     if (!req.file) return res.status(400).send("No file");
// //     const publicId = `nexsign_docs/${Date.now()}`;
// //     const result = await new Promise((resolve, reject) => {
// //       const stream = cloudinary.uploader.upload_stream({ resource_type: "raw", public_id: publicId, format: 'pdf' }, (err, res) => err ? reject(err) : resolve(res));
// //       stream.end(req.file.buffer);
// //     });
// //     const newDoc = new Document({ title: req.file.originalname.replace('.pdf', ''), fileUrl: result.secure_url, fileId: result.public_id, owner: req.user.id });
// //     await newDoc.save();
// //     res.json(newDoc);
// //   } catch (err) { res.status(500).send("Error"); }
// // });
// //✅ ইমেইল পাঠানোর রাউট (এটি যোগ করুন)
// // ✅ ইমেইল পাঠানোর রাউট - এটি অবশ্যই /:id এর উপরে রাখবেন
// // router.post('/send', auth, async (req, res) => {
// //   try {
// //     const { id } = req.body;
// //     // ১. চেক করুন ইউজার নিজের ডকুমেন্ট পাঠাচ্ছে কি না
// //     const doc = await Document.findOne({ _id: id, owner: req.user.id });
    
// //     if (!doc) {
// //       return res.status(404).json({ error: "ডকুমেন্টটি খুঁজে পাওয়া যায়নি।" });
// //     }

// //     if (!doc.parties || doc.parties.length === 0) {
// //       return res.status(400).json({ error: "কোনো সাইনার (Signer) সেট করা নেই।" });
// //     }

// //     // ২. টোকেন জেনারেট এবং স্ট্যাটাস আপডেট
// //     const token = crypto.randomBytes(32).toString('hex');
// //     doc.parties[0].token = token;
// //     doc.parties[0].status = 'sent';
// //     doc.status = 'in_progress';
    
// //     // ৩. গুরুত্বপূর্ণ: মঙ্গোডিবিকে জানানো যে অ্যারে পরিবর্তন হয়েছে
// //     doc.markModified('parties');
// //     await doc.save();
    
// //     // ৪. ইমেইল পাঠানো
// //     await sendSigningEmail(doc.parties[0], doc.title, token, req);
    
// //     res.json({ success: true, message: "ইমেইল সফলভাবে পাঠানো হয়েছে।" });
// //   } catch (err) { 
// //     console.error("Send Route Error:", err);
// //     res.status(500).json({ error: "ইমেইল পাঠাতে সমস্যা হয়েছে।" }); 
// //   }
// // });


// // ✅ ইমেইল পাঠানোর রাউট - লিঙ্ক রিটার্ন করার ফিচারসহ
// router.post('/send', auth, async (req, res) => {
//   try {
//     const { id } = req.body;
//     const doc = await Document.findOne({ _id: id, owner: req.user.id });
    
//     if (!doc) {
//       return res.status(404).json({ error: "ডকুমেন্টটি খুঁজে পাওয়া যায়নি।" });
//     }

//     if (!doc.parties || doc.parties.length === 0) {
//       return res.status(400).json({ error: "কোনো সাইনার (Signer) সেট করা নেই।" });
//     }

//     // ১. টোকেন জেনারেট এবং স্ট্যাটাস আপডেট
//     const token = crypto.randomBytes(32).toString('hex');
//     doc.parties[0].token = token;
//     doc.parties[0].status = 'sent';
//     doc.status = 'in_progress';
    
//     doc.markModified('parties');
//     await doc.save();

//     // ২. সাইনিং লিঙ্ক তৈরি (এটি আমরা ফ্রন্টএন্ডে পাঠাবো)
//     const baseUrl = process.env.FRONTEND_URL || req.headers.origin || "https://nexsignfrontend.vercel.app";
//     const signLink = `${baseUrl}/sign?token=${token}`;
    
//     // ৩. ইমেইল পাঠানোর চেষ্টা (Try-Catch এর ভেতরে যাতে ইমেইল ফেইল করলেও লিঙ্ক পাওয়া যায়)
//     let emailSent = false;
//     try {
//       await sendSigningEmail(doc.parties[0], doc.title, token, req);
//       emailSent = true;
//     } catch (mailErr) {
//       console.error("Email Sending Failed (Timeout/SMTP):", mailErr.message);
//       // এখানে আমরা এরর রিটার্ন করছি না, বরং পরের ধাপে লিঙ্ক পাঠিয়ে দিচ্ছি
//     }
    
//     //৪. ফ্রন্টএন্ডে রেসপন্স পাঠানো
//     res.json({ 
//       success: true, 
//       message: emailSent ? "ইমেইল পাঠানো হয়েছে।" : "ইমেইল পাঠানো যায়নি, কিন্তু লিঙ্ক তৈরি হয়েছে।",
//       signLink: signLink, // এই লিঙ্কটি ফ্রন্টএন্ডে রেন্ডার হবে
//       emailSent: emailSent
//     });

//   } catch (err) { 
//     console.error("Send Route Error:", err);
//     res.status(500).json({ error: "সার্ভারে সমস্যা হয়েছে।" }); 
//   }
// });
// router.get('/sign/:token', async (req, res) => {
//   try {
//     const doc = await Document.findOne({ "parties.token": req.params.token });
//     const party = doc.parties.find(p => p.token === req.params.token);
//     const partyIndex = doc.parties.indexOf(party);
//     const formattedFields = doc.fields.map(f => {
//       const fd = typeof f === 'string' ? JSON.parse(f) : f;
//       return { ...fd, isMine: Number(fd.partyIndex) === partyIndex };
//     });
//     res.json({ document: { ...doc.toObject(), fields: formattedFields }, party: { ...party.toObject(), index: partyIndex } });
//   } catch (err) { res.status(500).send("Error"); }
// });

// //৬. SUBMIT SIGNATURE ROUTE
// router.post('/sign/submit', async (req, res) => {
//   try {
//     const { token, fields: incomingFields } = req.body;
//     const doc = await Document.findOne({ "parties.token": token });
//     if (!doc) return res.status(404).json({ error: "Doc not found" });

//     const currentIdx = doc.parties.findIndex(p => p.token === token);
    
//     doc.fields = doc.fields.map(originalF => {
//       const origData = typeof originalF === 'string' ? JSON.parse(originalF) : originalF;
//       if (Number(origData.partyIndex) === currentIdx) {
//         const incoming = incomingFields.find(incF => incF.id === origData.id);
//         return incoming || origData;
//       }
//       return origData;
//     });

//     doc.parties[currentIdx].status = 'signed';
//     doc.parties[currentIdx].signedAt = new Date();
//     doc.markModified('fields'); doc.markModified('parties');

//     if (currentIdx + 1 < doc.parties.length) {
//       const nextToken = crypto.randomBytes(32).toString('hex');
//       doc.parties[currentIdx + 1].token = nextToken;
//       doc.parties[currentIdx + 1].status = 'sent';
//       await doc.save();
//       await sendSigningEmail(doc.parties[currentIdx + 1], doc.title, nextToken, req);
//       res.json({ success: true, next: true });
//     } else {
//       await doc.save();
//       await generateAndSendFinalDoc(doc);
//       res.json({ success: true, completed: true });
//     }
//   } catch (err) { res.status(500).json({ error: "Failed" }); }
// });

// // router.get('/proxy/*', async (req, res) => {
// //   try {
// //     let filePath = req.params[0];
// //     if (!filePath.toLowerCase().endsWith('.pdf')) filePath += '.pdf';
// //     const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${filePath}`;
// //     const response = await axios.get(url, { responseType: 'stream' });
// //     res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
// //     response.data.pipe(res);
// //   } catch (err) { res.status(404).send("Not found"); }
// // });
// // router.get('/proxy/*', async (req, res) => {
// //   try {
// //     let filePath = req.params[0];
    
// //     // ১. এক্সটেনশন চেক এবং ফিক্স
// //     if (!filePath.toLowerCase().endsWith('.pdf')) {
// //       filePath += '.pdf';
// //     }

// //     const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${filePath}`;
    
// //     // ২. ক্লাউডিনারি থেকে ডাটা আনা (টাইমআউটসহ)
// //     const response = await axios.get(url, { 
// //       responseType: 'stream',
// //       timeout: 15000 
// //     });
// // res.setHeader('Access-Control-Allow-Origin', 'https://nexsignfrontend.vercel.app');
// //     res.setHeader('Access-Control-Allow-Credentials', 'true');
// //     // ৩. প্রয়োজনীয় হেডার সেট করা (এটি পিডিএফ রেন্ডারিংয়ের জন্য অত্যন্ত গুরুত্বপূর্ণ)
// //     res.setHeader('Content-Type', 'application/pdf');
// //     res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
// //     res.setHeader('Pragma', 'no-cache');
// //     res.setHeader('Expires', '0');
// //     // ব্রাউজারকে জানানো যে এটি ডাউনলোড না করে ইন-লাইন ওপেন করতে হবে
// //     res.setHeader('Content-Disposition', 'inline');

// //     // ৪. ডাটা পাইপ করা এবং এরর হ্যান্ডলিং
// //     response.data.pipe(res);

// //     // স্ট্রিম শেষ হলে প্রপারলি ক্লোজ করা
// //     response.data.on('end', () => {
// //       res.end();
// //     });

// //   } catch (err) { 
// //     console.error("Proxy Error:", err.message);
// //     // ক্লাউডিনারি থেকে আসা এরর স্ট্যাটাস পাস করা
// //     const statusCode = err.response ? err.response.status : 404;
// //     res.status(statusCode).send("PDF Loading Failed: File not found or Cloudinary issue."); 
// //   }
// // });

// // router.get('/proxy/*', async (req, res) => {
// //   try {
// //     let filePath = req.params[0];
// //     if (!filePath.toLowerCase().endsWith('.pdf')) filePath += '.pdf';

// //     const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${filePath}`;
    
// //     const response = await axios.get(url, { 
// //       responseType: 'stream', 
// //       timeout: 20000 
// //     });

// //     // ✅ অত্যন্ত গুরুত্বপূর্ণ CORS ফিক্স
// //     res.setHeader('Access-Control-Allow-Origin', 'https://nexsignfrontend.vercel.app');
// //     res.setHeader('Access-Control-Allow-Credentials', 'true');
    
// //     // ✅ পিডিএফ রেন্ডারিং হেডার
// //     res.setHeader('Content-Type', 'application/pdf');
// //     res.setHeader('Content-Disposition', 'inline');
// //     res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

// //     response.data.pipe(res);
// //   } catch (err) { 
// //     console.error("Proxy Error:", err.message);
// //     res.status(404).send("PDF Not Found"); 
// //   }
// // });

// router.get('/proxy/*', async (req, res) => {
//   try {
//     let filePath = req.params[0];
//     if (!filePath.toLowerCase().endsWith('.pdf')) filePath += '.pdf';

//     const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${filePath}`;
    
//     const response = await axios.get(url, { 
//       responseType: 'stream', 
//       timeout: 20000 
//     });

//     // 🌟 একদম নির্দিষ্ট করে এই হেডারগুলো দিন 🌟
//     res.removeHeader('Access-Control-Allow-Origin'); // যদি অন্য কোথাও থেকে * আসে সেটি মুছে ফেলবে
//     res.setHeader('Access-Control-Allow-Origin', 'https://nexsignfrontend.vercel.app');
//     res.setHeader('Access-Control-Allow-Credentials', 'true');
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', 'inline');

//     response.data.pipe(res);
//   } catch (err) { 
//     console.error("Proxy Error:", err.message);
//     res.status(404).send("PDF Loading Failed."); 
//   }
// });

// router.put('/:id', auth, async (req, res) => {
//   try {
//     const doc = await Document.findOne({ _id: req.params.id, owner: req.user.id });
//     Object.assign(doc, req.body);
//     doc.markModified('fields'); doc.markModified('parties');
//     await doc.save();
//     res.json(doc);
//   } catch (err) { res.status(500).send("Error"); }
// });
// router.get('/:id', auth, async (req, res) => {
//   try {
//     const doc = await Document.findOne({ _id: req.params.id, owner: req.user.id });
//     res.json(doc);
//   } catch (err) { res.status(404).json({ error: "Not found" }); }
// });
// module.exports = router;

// const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const axios = require('axios');
// const { v2: cloudinary } = require('cloudinary');
// const crypto = require('crypto');
// const nodemailer = require('nodemailer');
// const Document = require('../models/Document');
// const auth = require('../middleware/auth');

// // কনফিগারেশন
// const storage = multer.memoryStorage();
// const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
// });

// const sendSigningEmail = async (party, docTitle, token) => {
//   const baseUrl = process.env.FRONTEND_URL || "https://nexsignfrontend.vercel.app";
//   const signLink = `${baseUrl}/sign?token=${token}`;
//   return transporter.sendMail({
//     from: `"NexSign" <${process.env.EMAIL_USER}>`,
//     to: party.email,
//     subject: `Signature Request: ${docTitle}`,
//     html: `<p>Please sign: <a href="${signLink}">Click Here</a></p>`
//   });
// };

// // --- ROUTES (সঠিক ক্রম) ---

// router.get('/', auth, async (req, res) => {
//   const docs = await Document.find({ owner: req.user.id }).sort({ updatedAt: -1 });
//   res.json(docs);
// });

// router.post('/upload', [auth, upload.single('file')], async (req, res) => {
//   try {
//     const result = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream({ resource_type: "raw", format: 'pdf' }, (err, r) => err ? reject(err) : resolve(r));
//       stream.end(req.file.buffer);
//     });
//     const newDoc = new Document({ title: req.file.originalname.replace('.pdf', ''), fileUrl: result.secure_url, fileId: result.public_id, owner: req.user.id });
//     await newDoc.save();
//     res.json(newDoc);
//   } catch (err) { res.status(500).json({ error: err.message }); }
// });

// // গুরুত্বপূর্ণ: /send রাউটটি অবশ্যই /:id এর উপরে থাকবে
// router.post('/send', auth, async (req, res) => {
//   try {
//     const { id } = req.body;
//     const doc = await Document.findOne({ _id: id, owner: req.user.id });
//     if (!doc) return res.status(404).json({ error: "Document not found" });

//     const token = crypto.randomBytes(32).toString('hex');
//     doc.parties[0].token = token;
//     doc.parties[0].status = 'sent';
//     doc.status = 'in_progress';
//     doc.markModified('parties');
//     await doc.save();
//     await sendSigningEmail(doc.parties[0], doc.title, token);
//     res.json({ success: true });
//   } catch (err) { res.status(500).json({ error: err.message }); }
// });

// router.get('/sign/:token', async (req, res) => {
//   const doc = await Document.findOne({ "parties.token": req.params.token });
//   if (!doc) return res.status(404).json({ error: "Invalid link" });
//   const party = doc.parties.find(p => p.token === req.params.token);
//   res.json({ document: doc, party: { ...party.toObject(), index: doc.parties.indexOf(party) } });
// });

// router.get('/proxy/*', async (req, res) => {
//   try {
//     let path = req.params[0];
//     if (!path.toLowerCase().endsWith('.pdf')) path += '.pdf';
//     const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${path}`;
//     const response = await axios.get(url, { responseType: 'stream' });
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Access-Control-Allow-Origin', 'https://nexsignfrontend.vercel.app');
//     response.data.pipe(res);
//   } catch (err) { res.status(404).send("Not found"); }
// });

// // ডাইনামিক আইডি রাউটগুলো সবার শেষে
// router.get('/:id', auth, async (req, res) => {
//   const doc = await Document.findOne({ _id: req.params.id, owner: req.user.id });
//   res.json(doc);
// });

// router.put('/:id', auth, async (req, res) => {
//   const doc = await Document.findOneAndUpdate({ _id: req.params.id, owner: req.user.id }, req.body, { new: true });
//   doc.markModified('fields'); doc.markModified('parties');
//   await doc.save();
//   res.json(doc);
// });

// module.exports = router;
// const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const axios = require('axios');
// const { v2: cloudinary } = require('cloudinary');
// const crypto = require('crypto');
// const nodemailer = require('nodemailer');
// const Document = require('../models/Document');
// const auth = require('../middleware/auth');

// // ১. কনফিগারেশন
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
// });

// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// // ২. হেল্পার: স্বাক্ষর মার্জ করা (PDF-Lib)
// const mergeSignatures = async (doc) => {
//   const response = await axios.get(doc.fileUrl, { responseType: 'arraybuffer' });
//   const pdfDoc = await PDFDocument.load(response.data, { ignoreEncryption: true });
//   const timesFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
//   const pages = pdfDoc.getPages();

//   for (const f of doc.fields) {
//     try {
//       const fd = typeof f === 'string' ? JSON.parse(f) : f;
//       if (fd.value && fd.filled) {
//         const pageIndex = Number(fd.page) - 1;
//         if (pageIndex < 0 || pageIndex >= pages.length) continue;

//         const page = pages[pageIndex];
//         const { width, height } = page.getSize();
        
//         const drawW = (Number(fd.width) * width) / 100;
//         const drawH = (Number(fd.height) * height) / 100;
//         const drawX = (Number(fd.x) * width) / 100;
//         const drawY = height - ((Number(fd.y) * height) / 100) - drawH;

//         if (fd.value.startsWith('data:image')) {
//           const base64Data = fd.value.split(',')[1];
//           const sigImg = await pdfDoc.embedPng(Buffer.from(base64Data, 'base64'));
//           page.drawImage(sigImg, { x: drawX, y: drawY, width: drawW, height: drawH });
//         } else {
//           page.drawText(String(fd.value), {
//             x: drawX + 2, y: drawY + (drawH / 4),
//             size: 11, font: timesFont, color: rgb(0, 0, 0),
//           });
//         }
//       }
//     } catch (e) { continue; }
//   }
//   return await pdfDoc.save();
// };

// // ৩. হেল্পার: ফাইনাল ডকুমেন্ট জেনারেট ও ক্লাউডিনারি আপডেট
// const generateAndSendFinalDoc = async (doc) => {
//   try {
//     const pdfBytes = await mergeSignatures(doc);
//     const pdfBuffer = Buffer.from(pdfBytes);
//     const publicId = `completed/final_${doc._id}_${Date.now()}`;

//     const uploadResult = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream(
//         { resource_type: "raw", public_id: publicId, format: 'pdf' },
//         (err, res) => err ? reject(err) : resolve(res)
//       );
//       stream.end(pdfBuffer);
//     });

//     doc.fileUrl = uploadResult.secure_url;
//     doc.status = 'completed';
//     await doc.save();

//     const recipients = doc.parties.map(p => p.email);
//     await transporter.sendMail({
//       from: `"NexSign" <${process.env.EMAIL_USER}>`,
//       to: recipients.join(','),
//       subject: `Completed: ${doc.title}`,
//       html: `<h3>Signing Complete!</h3><p>The final signed version of <b>${doc.title}</b> is attached.</p>`,
//       attachments: [{ filename: `${doc.title}_Final.pdf`, content: pdfBuffer }]
//     });
//   } catch (err) { console.error("Finalize Error:", err); }
// };

// // ৪. হেল্পার: সাইনিং লিঙ্ক ইমেইল
// const sendSigningEmail = async (party, docTitle, token) => {
//   const baseUrl = process.env.FRONTEND_URL || "https://nexsignfrontend.vercel.app";
//   const signLink = `${baseUrl}/sign?token=${token}`;
//   return transporter.sendMail({
//     from: `"NexSign" <${process.env.EMAIL_USER}>`,
//     to: party.email,
//     subject: `Signature Request: ${docTitle}`,
//     html: `<p>Please sign the document here: <a href="${signLink}">${signLink}</a></p>`
//   });
// };

// // --- ROUTES ---

// // ১. ড্যাশবোর্ড ডাটা (শুধুমাত্র ওনারের ডাটা দেখাবে)
// router.get('/', auth, async (req, res) => {
//   try {
//     const docs = await Document.find({ owner: req.user.id }).sort({ updatedAt: -1 });
//     res.json(docs);
//   } catch (err) {
//     res.status(500).json({ error: "ডকুমেন্ট লোড করা যায়নি।" });
//   }
// });

// // ২. পিডিএফ আপলোড রাউট
// router.post('/upload', auth, upload.single('pdf'), async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ error: "No file uploaded" });

//     const result = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream(
//         { resource_type: "raw", folder: "nexsign_docs", format: 'pdf' },
//         (err, res) => err ? reject(err) : resolve(res)
//       );
//       stream.end(req.file.buffer);
//     });

//     const newDoc = new Document({
//       title: req.body.title || 'Untitled Document',
//       fileUrl: result.secure_url,
//       fileId: result.public_id,
//       owner: req.user.id,
//       status: 'draft',
//       parties: JSON.parse(req.body.parties || '[]'),
//       fields: []
//     });

//     await newDoc.save();
//     res.json(newDoc);
//   } catch (err) {
//     res.status(500).json({ error: "আপলোড ব্যর্থ হয়েছে।" });
//   }
// });

// // ৩. সাইনিং লিঙ্ক পাঠানো
// router.post('/send', auth, async (req, res) => {
//   try {
//     const doc = await Document.findOne({ _id: req.body.id, owner: req.user.id });
//     if (!doc) return res.status(404).json({ error: "Not found" });

//     const token = crypto.randomBytes(32).toString('hex');
//     doc.parties[0].token = token;
//     doc.parties[0].status = 'sent';
//     doc.status = 'in_progress';
//     doc.currentPartyIndex = 0;
//     doc.markModified('parties');
//     await doc.save();
//     await sendSigningEmail(doc.parties[0], doc.title, token);
//     res.json({ success: true });
//   } catch (err) { res.status(500).json({ error: err.message }); }
// });

// // ৪. সিগনেচার সাবমিট ও পরবর্তী সাইনার লজিক
// router.post('/sign/submit', async (req, res) => {
//   try {
//     const { token, fields } = req.body;
//     const doc = await Document.findOne({ "parties.token": token });
//     if (!doc) return res.status(404).json({ error: "Invalid link" });

//     const idx = doc.parties.findIndex(p => p.token === token);
//     doc.parties[idx].status = 'signed';
//     doc.parties[idx].signedAt = new Date();
//     doc.fields = fields; 
    
//     doc.markModified('fields'); 
//     doc.markModified('parties');

//     if (idx + 1 < doc.parties.length) {
//       const nextToken = crypto.randomBytes(32).toString('hex');
//       doc.parties[idx + 1].token = nextToken;
//       doc.parties[idx + 1].status = 'sent';
//       doc.currentPartyIndex = idx + 1;
//       await doc.save();
//       await sendSigningEmail(doc.parties[idx + 1], doc.title, nextToken);
//       res.json({ next: true });
//     } else {
//       doc.currentPartyIndex = idx;
//       await doc.save();
//       await generateAndSendFinalDoc(doc);
//       res.json({ completed: true });
//     }
//   } catch (err) { res.status(500).json({ error: "Submit failed" }); }
// });

// // ৫. সাইনিং পেজের ডাটা লোড
// router.get('/sign/:token', async (req, res) => {
//   try {
//     const doc = await Document.findOne({ "parties.token": req.params.token });
//     if (!doc) return res.status(404).json({ error: "Invalid link" });
//     const party = doc.parties.find(p => p.token === req.params.token);
//     res.json({ document: doc, party: { ...party.toObject(), index: doc.parties.indexOf(party) } });
//   } catch (err) { res.status(500).json({ error: "Error fetching signing session" }); }
// });

// // ৬. পিডিএফ প্রক্সি (CORS ফিক্স)
// router.get('/proxy/*', async (req, res) => {
//   try {
//     const path = req.params[0];
//     const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${path}`;
//     const response = await axios.get(url, { responseType: 'stream' });
//     res.setHeader('Content-Type', 'application/pdf');
//     response.data.pipe(res);
//   } catch (err) { res.status(404).send("File not found"); }
// });

// ৪. সিগনেচার সাবমিট (CRITICAL: এটি ডাইনামিক ID রাউটের উপরে থাকতে হবে)
// router.post('/sign/submit', async (req, res) => {
//   try {
//     const { token, fields } = req.body;
//     const doc = await Document.findOne({ "parties.token": token });
//     if (!doc) return res.status(404).json({ error: "Invalid link" });

//     const idx = doc.parties.findIndex(p => p.token === token);
//     doc.parties[idx].status = 'signed';
//     doc.parties[idx].signedAt = new Date();
//     doc.fields = fields; 
    
//     doc.markModified('fields'); 
//     doc.markModified('parties');

//     if (idx + 1 < doc.parties.length) {
//       const nextToken = crypto.randomBytes(32).toString('hex');
//       doc.parties[idx + 1].token = nextToken;
//       doc.parties[idx + 1].status = 'sent';
//       doc.currentPartyIndex = idx + 1;
//       await doc.save();
//       await sendSigningEmail(doc.parties[idx + 1], doc.title, nextToken);
//       res.json({ next: true });
//     } else {
//       doc.currentPartyIndex = idx;
//       doc.status = 'completed';
//       await doc.save();
//       await generateAndSendFinalDoc(doc);
//       res.json({ completed: true });
//     }
//   } catch (err) { res.status(500).json({ error: "Submit failed" }); }
// });
// router.post('/sign/submit', async (req, res) => {
//   try {
//     const { token, fields: incomingFields } = req.body;
//     const doc = await Document.findOne({ "parties.token": token });
//     if (!doc) return res.status(404).json({ error: "Invalid link" });

//     const idx = doc.parties.findIndex(p => p.token === token);
    
//     // ১. ফিল্ড মার্জ লজিক (ঠিক আছে)
//     const existingFields = doc.fields || [];
//     const updatedFields = [...existingFields];

//     incomingFields.forEach(inf => {
//       const existingIdx = updatedFields.findIndex(ef => ef.id === inf.id);
//       if (existingIdx > -1) {
//         updatedFields[existingIdx] = { ...updatedFields[existingIdx], ...inf };
//       } else {
//         updatedFields.push(inf);
//       }
//     });

//     doc.fields = updatedFields;
//     doc.parties[idx].status = 'signed';
//     doc.parties[idx].signedAt = new Date();
    
//     doc.markModified('fields'); 
//     doc.markModified('parties');

//     if (idx + 1 < doc.parties.length) {
//       const nextToken = crypto.randomBytes(32).toString('hex');
//       doc.parties[idx + 1].token = nextToken;
//       doc.parties[idx + 1].status = 'sent';
//       doc.currentPartyIndex = idx + 1;
//       await doc.save();
//       await sendSigningEmail(doc.parties[idx + 1], doc.title, nextToken);
//       res.json({ next: true });
//     } else {
//       doc.currentPartyIndex = idx;
//       doc.status = 'completed';
      
//       // গুরুত্বপূর্ণ পরিবর্তন:
//       // ২. আগে ডাটাবেসে সব ফিল্ড সেভ হওয়া নিশ্চিত করুন
//       await doc.save(); 
      
//       // ৩. setTimeout সরিয়ে সরাসরি await করুন যেন মেইল পাঠানোর পরই রেসপন্স যায়
//       await generateAndSendFinalDoc(doc); 
      
//       res.json({ completed: true });
//     }
//   } catch (err) { 
//     console.error("Submit Error:", err);
//     res.status(500).json({ error: "Submit failed" }); 
//   }
// });  workable


// router.post('/sign/submit', async (req, res) => {
//   try {
//     const { token, fields: incomingFields } = req.body;
//     const doc = await Document.findOne({ "parties.token": token });
//     if (!doc) return res.status(404).json({ error: "Invalid link" });

//     const idx = doc.parties.findIndex(p => p.token === token);
//     const userAgent = req.headers['user-agent'] || 'Unknown Device';
    
//     // ১. Vercel-এর জন্য সঠিক আইপি ডিটেকশন (Fix)
//     const ip = (
//       req.headers['x-real-ip'] || 
//       req.headers['x-forwarded-for']?.split(',')[0] || 
//       req.socket.remoteAddress || 
//       '127.0.0.1'
//     ).trim();

//     // ২. লোকেশন বের করার লজিক (ip-api.com ব্যবহার করা ভালো কারণ এটি Vercel-এ বেশি স্টেবল)
//     let locationData = "Unknown Location";
//     try {
//       // লোকালহোস্ট আইপিতে এপিআই কাজ করবে না, তাই টেস্টিং এর জন্য চেক
//       if (ip !== '127.0.0.1' && ip !== '::1') {
//         const locRes = await axios.get(`http://ip-api.com/json/${ip}`, { timeout: 3000 });
//         if (locRes.data && locRes.data.status === 'success') {
//           locationData = `${locRes.data.city}, ${locRes.data.regionName}, ${locRes.data.country}`;
//         }
//       }
//     } catch (locErr) {
//       console.error("Location API Error:", locErr.message);
//     }

//     // ৩. ফিল্ড আপডেট
//     doc.fields = incomingFields;
//     doc.parties[idx].status = 'signed';
//     doc.parties[idx].signedAt = new Date();
//     doc.parties[idx].device = userAgent;
//     doc.parties[idx].ipAddress = ip;
//     doc.parties[idx].location = locationData;

//     // ৪. অডিট লগ তৈরি
//     await AuditLog.create({
//       document_id: doc._id,
//       action: 'signed',
//       performed_by: { 
//         name: doc.parties[idx].name, 
//         email: doc.parties[idx].email, 
//         role: 'signer' 
//       },
//       ip_address: ip,
//       user_agent: userAgent,
//       details: `Signed by ${doc.parties[idx].email} from ${locationData}. Device: ${userAgent}`
//     });

//     doc.markModified('fields'); 
//     doc.markModified('parties');

//     // পরবর্তী স্টেপ হ্যান্ডলিং
//     if (idx + 1 < doc.parties.length) {
//       const nextToken = crypto.randomBytes(32).toString('hex');
//       doc.parties[idx + 1].token = nextToken;
//       doc.parties[idx + 1].status = 'sent';
//       doc.currentPartyIndex = idx + 1;
//       await doc.save();
//       await sendSigningEmail(doc.parties[idx + 1], doc.title, nextToken); 
//       return res.json({ next: true });
//     } else {
//       doc.status = 'completed';
//       await doc.save(); 
//       const finalizedDoc = await Document.findById(doc._id);
//       await generateAndSendFinalDoc(finalizedDoc); 
//       return res.json({ completed: true });
//     }
//   } catch (err) { 
//     console.error("Submit Error:", err);
//     res.status(500).json({ error: "Submit failed" }); 
//   }
// }); //workable


// module.exports = router;

const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const { v2: cloudinary } = require('cloudinary');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Document = require('../models/Document');
const AuditLog = require('../models/AuditLog');
const auth = require('../middleware/auth');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
// ১. কনফিগারেশন
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

// ২. হেল্পার ফাংশনসমূহ (PDF Merging & Email)


// const mergeSignatures = async (doc) => {
//   const response = await axios.get(doc.fileUrl, { responseType: 'arraybuffer' });
//   const pdfDoc = await PDFDocument.load(response.data, { ignoreEncryption: true });
//   const timesFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
//   const pages = pdfDoc.getPages();

//   const uniqueFields = Array.from(new Map(doc.fields.map(f => {
//     const obj = typeof f === 'string' ? JSON.parse(f) : f;
//     return [obj.id, obj];
//   })).values());

//   for (const fd of uniqueFields) {
//     try {
//       if (fd.value) { 
//         const pageIndex = Number(fd.page) - 1;
//         if (pageIndex < 0 || pageIndex >= pages.length) continue;

//         const page = pages[pageIndex];
//         const { width, height } = page.getSize();
        
//         // পজিশন ফিক্সড রাখার ক্যালকুলেশন
//         const drawW = (Number(fd.width) * width) / 100;
//         const drawH = (Number(fd.height) * height) / 100;
//         const drawX = (Number(fd.x) * width) / 100;
//         const drawY = height - ((Number(fd.y) * height) / 100) - drawH;

//         if (fd.value.startsWith('data:image')) {
//           const base64Data = fd.value.split(',')[1];
//           const imgBuffer = Buffer.from(base64Data, 'base64');
          
//           // ফরম্যাট চেক (PNG না JPG তা অটো ডিটেক্ট করবে)
//           let sigImg;
//           if (fd.value.includes('image/png')) {
//             sigImg = await pdfDoc.embedPng(imgBuffer);
//           } else {
//             sigImg = await pdfDoc.embedJpg(imgBuffer);
//           }
          
//           page.drawImage(sigImg, { x: drawX, y: drawY, width: drawW, height: drawH });
//         } else {
//           page.drawText(String(fd.value), {
//             x: drawX + 2, 
//             y: drawY + (drawH / 3),
//             size: 11, font: timesFont, color: rgb(0, 0, 0),
//           });
//         }
//       }
//     } catch (e) { 
//       console.error(`Render Error for field ${fd.id}:`, e); 
//       continue; 
//     }
//   }
//   return await pdfDoc.save({ 
//   useObjectStreams: true, // এটি ফাইলের সাইজ অনেকটা কমিয়ে দেবে
//   addDefaultPage: false 
// });
// }; workable
const mergeSignatures = async (doc) => {
  const response = await axios.get(doc.fileUrl, { 
    responseType: 'arraybuffer',
    timeout: 15000 
  });
  
  const pdfDoc = await PDFDocument.load(response.data, { ignoreEncryption: true });
  const timesFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const pages = pdfDoc.getPages();

  // ১. ডুপ্লিকেট ফিল্ড রিমুভ (পরিচ্ছন্ন লজিক)
  const uniqueFields = Array.from(new Map(doc.fields.map(f => {
    const obj = typeof f === 'string' ? JSON.parse(f) : f;
    return [obj.id, obj];
  })).values());

  for (const fd of uniqueFields) {
    try {
      if (!fd.value || !fd.filled) continue; 
      
      const pageIndex = Number(fd.page) - 1;
      if (pageIndex < 0 || pageIndex >= pages.length) continue;

      const page = pages[pageIndex];
      const { width, height } = page.getSize();
      
      // ২. কোঅর্ডিনেট ক্যালকুলেশন (Precise Mapping)
      const drawW = (Number(fd.width) * width) / 100;
      const drawH = (Number(fd.height) * height) / 100;
      const drawX = (Number(fd.x) * width) / 100;
      const drawY = height - ((Number(fd.y) * height) / 100) - drawH;

      if (fd.value.startsWith('data:image')) {
        const base64Data = fd.value.split(',')[1];
        const imgBuffer = Buffer.from(base64Data, 'base64');
        
        let sigImg;
        // ৩. ডাইনামিক ইমেজ এমবেডিং
        if (fd.value.includes('image/png')) {
          sigImg = await pdfDoc.embedPng(imgBuffer);
        } else {
          sigImg = await pdfDoc.embedJpg(imgBuffer);
        }
        
        page.drawImage(sigImg, { x: drawX, y: drawY, width: drawW, height: drawH });
      } else {
        page.drawText(String(fd.value), {
          x: drawX + 2, 
          y: drawY + (drawH / 4), // টেক্সট এলাইনমেন্ট ঠিক করা হয়েছে
          size: 10, font: timesFont, color: rgb(0, 0, 0),
        });
      }
    } catch (e) { 
      console.error(`Render Error for field ${fd.id}:`, e.message); 
    }
  }

  return await pdfDoc.save();
};
//changes need for snap




// const generateAndSendFinalDoc = async (doc) => {
//   try {
//     const pdfBytes = await mergeSignatures(doc);
//     const pdfBuffer = Buffer.from(pdfBytes);
//     const publicId = `completed/final_${doc._id}_${Date.now()}`;

//     const uploadResult = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream(
//         { resource_type: "raw", public_id: publicId, format: 'pdf' },
//         (err, res) => err ? reject(err) : resolve(res)
//       );
//       stream.end(pdfBuffer);
//     });

//     doc.fileUrl = uploadResult.secure_url;
//     doc.status = 'completed';
//     await doc.save();

//     const recipients = doc.parties.map(p => p.email);
//     await transporter.sendMail({
//       from: `"NexSign" <${process.env.EMAIL_USER}>`,
//       to: recipients.join(','),
//       subject: `Completed: ${doc.title}`,
//       html: `<h3>Signing Complete!</h3><p>The final signed version of <b>${doc.title}</b> is attached.</p>`,
//       attachments: [{ filename: `${doc.title}_Final.pdf`, content: pdfBuffer }]
//     });
//   } catch (err) { console.error("Finalize Error:", err); }
// };
// const generateAndSendFinalDoc = async (doc) => {
//   try {
//     // ১. সাইনসহ PDF তৈরি (নিশ্চিত করুন mergeSignatures লেটেস্ট doc.fields পাচ্ছে)
//     const pdfBytes = await mergeSignatures(doc);
//     const pdfBuffer = Buffer.from(pdfBytes);
    
//     // ২. ক্লাউডিনারি আপলোড (অবশ্যই resource_type: "raw" ব্যবহার করুন)
//     const uploadResult = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream(
//         { 
//           resource_type: "raw", 
//           folder: "completed_docs",
//           public_id: `final_${doc._id}_${Date.now()}.pdf`, // এক্সটেনশন যুক্ত করুন
//           access_mode: 'public'
//         },
//         (err, res) => err ? reject(err) : resolve(res)
//       );
//       stream.end(pdfBuffer);
//     });

//     // ৩. ডাটাবেসে সাইনসহ নতুন URL আপডেট করা
//     doc.fileUrl = uploadResult.secure_url;
//     doc.status = 'completed';
//     await doc.save();

//     // ৪. ইমেইল পাঠানো
//     const recipients = doc.parties.map(p => p.email).filter(e => e);
    
//     if (recipients.length > 0) {
//       await transporter.sendMail({
//         from: `"NexSign" <${process.env.EMAIL_USER}>`,
//         to: recipients.join(','),
//         subject: `Completed: ${doc.title}`,
//         html: `<h3>Signing Complete!</h3><p>The final signed version of <b>${doc.title}</b> is attached.</p>`,
//         attachments: [{ 
//           filename: `${doc.title}_Final.pdf`, 
//           content: pdfBuffer,
//           contentType: 'application/pdf'
//         }]
//       });
//     }
//     console.log("Final document processed and email sent.");
//   } catch (err) { 
//     console.error("Finalize Error Detailed:", err); 
//   }
// };  workable




// const generateAndSendFinalDoc = async (doc) => {
//   try {
//     const basePdfBytes = await mergeSignatures(doc);
//     const pdfDoc = await PDFDocument.load(basePdfBytes);
//     const timesFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
//     const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

//     // ব্র্যান্ড কালার ডিফাইন (#2AAAE0)
//     const brandColor = rgb(0.16, 0.67, 0.88); 

//     let page = pdfDoc.addPage([600, 850]); 
//     const { width, height } = page.getSize();
//     let y = height - 50;

//     page.drawRectangle({
//       x: 20, y: 20, width: width - 40, height: height - 40,
//       borderColor: rgb(0.8, 0.8, 0.8), borderWidth: 1,
//     });

//     // ১. হেডার ব্যাকগ্রাউন্ড কালার পরিবর্তন (#2AAAE0)
//     page.drawRectangle({
//       x: 21, y: y - 50, width: width - 42, height: 60,
//       color: brandColor, 
//     });

//     page.drawText('NEXSIGN DIGITAL AUDIT CERTIFICATE', {
//       x: 50, y: y - 15, size: 20, font: boldFont, color: rgb(1, 1, 1)
//     });
//     page.drawText('Document Evidence Summary & Audit Trail', {
//       x: 50, y: y - 35, size: 10, font: timesFont, color: rgb(0.9, 0.9, 0.9)
//     });
//     y -= 100;

//     const drawInfo = (label, value) => {
//       page.drawText(label, { x: 50, y, size: 11, font: boldFont });
//       page.drawText(String(value || 'N/A'), { x: 150, y, size: 11, font: timesFont });
//       y -= 20;
//     };

//     drawInfo('Document Title:', doc.title);
//     drawInfo('Created By:', `${doc.senderMeta?.name} (${doc.senderMeta?.email})`);
    
//     if (doc.ccEmails && doc.ccEmails.length > 0) {
//       drawInfo('CC Recipients:', doc.ccEmails.join(', '));
//     }

//     drawInfo('Initiated At:', doc.senderMeta?.time);
//     y -= 30;

//     // ২. সাইনার ডিটেইলস হেডার কালার পরিবর্তন (#2AAAE0)
//     page.drawText('SIGNER DETAILS & AUDIT TRAIL', { 
//       x: 50, y, size: 13, font: boldFont, 
//       color: brandColor // এখানে ব্র্যান্ড কালার ব্যবহার করা হয়েছে
//     });
//     y -= 25;

//     // সাইনার লুপ (বাকি অংশ একই থাকবে...)
//     doc.parties.forEach((p, index) => {
//       if (y < 150) {
//         page = pdfDoc.addPage([600, 850]);
//         y = height - 50;
//       }
//       page.drawLine({ start: { x: 50, y: y + 10 }, end: { x: 550, y: y + 10 }, thickness: 0.5, color: rgb(0.9, 0.9, 0.9) });
//       page.drawText(`${index + 1}. ${p.name}`, { x: 50, y, size: 11, font: boldFont });
      
//       // ব্যাজ কালারও ব্র্যান্ড কালারের সাথে সামঞ্জস্যপূর্ণ করা যেতে পারে
//       page.drawRectangle({ x: width - 100, y: y - 5, width: 55, height: 18, color: rgb(0.1, 0.6, 0.1) });
//       page.drawText('SIGNED', { x: width - 92, y: y, size: 8, font: boldFont, color: rgb(1, 1, 1) });
      
//       y -= 18;
//       page.drawText(`Email: ${p.email} | IP: ${p.ipAddress || 'N/A'}`, { x: 70, y, size: 9, font: timesFont });
//       y -= 15;
//       page.drawText(`Location: ${p.location || 'Unknown'}`, { x: 70, y, size: 9, font: timesFont });
//       y -= 15;
      
//       const deviceText = `Device: ${p.device || 'N/A'}`;
//       const charLimit = 85; 
//       for (let i = 0; i < deviceText.length; i += charLimit) {
//         const chunk = deviceText.substring(i, i + charLimit);
//         page.drawText(chunk, { x: 70, y, size: 8, font: timesFont, color: rgb(0.4, 0.4, 0.4) });
//         y -= 12;
//       }
//       page.drawText(`Signed At: ${p.signedAt ? new Date(p.signedAt).toLocaleString() : 'N/A'}`, { x: 70, y, size: 9, font: boldFont });
//       y -= 35; 
//     });

//     // ... বাকি আপলোড এবং ইমেইল লজিক ...
//     const pdfBytesFinal = await pdfDoc.save(); 
//     const pdfBuffer = Buffer.from(pdfBytesFinal);

//     const uploadResult = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream(
//         { resource_type: "raw", folder: "completed_docs", public_id: `final_${doc._id}_${Date.now()}.pdf` },
//         (err, res) => err ? reject(err) : resolve(res)
//       );
//       stream.end(pdfBuffer);
//     });

//     doc.fileUrl = uploadResult.secure_url;
//     doc.status = 'completed';
//     await doc.save();

//     const signers = doc.parties.map(p => p.email).filter(e => e);
//     const validCCs = (doc.ccEmails || []).filter(e => e && e.trim() !== "");
//     const allRecipients = [...new Set([...signers, ...validCCs])];
    
//     if (allRecipients.length > 0) {
//       await transporter.sendMail({
//         from: `"NexSign" <${process.env.EMAIL_USER}>`,
//         to: allRecipients.join(','), 
//         subject: `Fully Executed: ${doc.title}`,
//         html: `<h3 style="color: #2AAAE0;">Signing Complete!</h3><p>The final document for <b>${doc.title}</b> is ready.</p>`,
//         attachments: [{ filename: `${doc.title}_Final.pdf`, content: pdfBuffer, contentType: 'application/pdf' }]
//       });
//     }
//   } catch (err) { 
//     console.error("Finalize Error:", err); 
//   }
// };

const generateAndSendFinalDoc = async (doc) => {
  try {
    const basePdfBytes = await mergeSignatures(doc);
    const pdfDoc = await PDFDocument.load(basePdfBytes);
    const timesFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

    const brandColor = rgb(0.16, 0.67, 0.88); // #2AAAE0

    let page = pdfDoc.addPage([600, 850]); 
    const { width, height } = page.getSize();
    let y = height - 50;

    page.drawRectangle({
      x: 20, y: 20, width: width - 40, height: height - 40,
      borderColor: rgb(0.8, 0.8, 0.8), borderWidth: 1,
    });

    page.drawRectangle({
      x: 21, y: y - 50, width: width - 42, height: 60,
      color: brandColor, 
    });

    page.drawText('NEXSIGN DIGITAL AUDIT CERTIFICATE', {
      x: 50, y: y - 15, size: 20, font: boldFont, color: rgb(1, 1, 1)
    });
    page.drawText('Document Evidence Summary & Audit Trail', {
      x: 50, y: y - 35, size: 10, font: timesFont, color: rgb(0.9, 0.9, 0.9)
    });
    y -= 100;

    const drawInfo = (label, value) => {
      page.drawText(label, { x: 50, y, size: 11, font: boldFont });
      page.drawText(String(value || 'N/A'), { x: 150, y, size: 11, font: timesFont });
      y -= 20;
    };

    drawInfo('Document Title:', doc.title);
    drawInfo('Created By:', `${doc.senderMeta?.name} (${doc.senderMeta?.email})`);
    
    if (doc.ccEmails && doc.ccEmails.length > 0) {
      drawInfo('CC Recipients:', doc.ccEmails.join(', '));
    }

    drawInfo('Initiated At:', doc.senderMeta?.time);
    y -= 30;

    page.drawText('SIGNER DETAILS & AUDIT TRAIL', { x: 50, y, size: 13, font: boldFont, color: brandColor });
    y -= 25;

    // সাইনার লুপ
    doc.parties.forEach((p, index) => {
      if (y < 150) {
        page = pdfDoc.addPage([600, 850]);
        y = height - 50;
      }
      page.drawLine({ start: { x: 50, y: y + 10 }, end: { x: 550, y: y + 10 }, thickness: 0.5, color: rgb(0.9, 0.9, 0.9) });
      page.drawText(`${index + 1}. ${p.name}`, { x: 50, y, size: 11, font: boldFont });
      page.drawRectangle({ x: width - 100, y: y - 5, width: 55, height: 18, color: rgb(0.1, 0.6, 0.1) });
      page.drawText('SIGNED', { x: width - 92, y: y, size: 8, font: boldFont, color: rgb(1, 1, 1) });
      y -= 18;
      page.drawText(`Email: ${p.email} | IP: ${p.ipAddress || 'N/A'}`, { x: 70, y, size: 9, font: timesFont });
      y -= 15;
      page.drawText(`Location: ${p.location || 'Unknown'}`, { x: 70, y, size: 9, font: timesFont });
      y -= 15;
      
      const deviceText = `Device: ${p.device || 'N/A'}`;
      const charLimit = 85; 
      for (let i = 0; i < deviceText.length; i += charLimit) {
        const chunk = deviceText.substring(i, i + charLimit);
        page.drawText(chunk, { x: 70, y, size: 8, font: timesFont, color: rgb(0.4, 0.4, 0.4) });
        y -= 12;
      }

      // 🌟 ফিক্সড টাইমজোন: Bangladesh Time (BST)
      const signedTime = p.signedAt ? new Date(p.signedAt).toLocaleString('en-US', { 
        timeZone: 'Asia/Dhaka',
        dateStyle: 'medium',
        timeStyle: 'medium'
      }) : 'N/A';

      page.drawText(`Signed At: ${signedTime}`, { x: 70, y, size: 9, font: boldFont });
      y -= 35; 
    });

    const pdfBytesFinal = await pdfDoc.save(); 
    const pdfBuffer = Buffer.from(pdfBytesFinal);

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "raw", folder: "completed_docs", public_id: `final_${doc._id}_${Date.now()}.pdf` },
        (err, res) => err ? reject(err) : resolve(res)
      );
      stream.end(pdfBuffer);
    });

    doc.fileUrl = uploadResult.secure_url;
    doc.status = 'completed';
    await doc.save();

    const signers = doc.parties.map(p => p.email).filter(e => e);
    const validCCs = (doc.ccEmails || []).filter(e => e && e.trim() !== "");
    const allRecipients = [...new Set([...signers, ...validCCs])];
    
    // if (allRecipients.length > 0) {
    //   // 🌟 ইমেইল টেমপ্লেটেও টাইমজোন ফিক্স করা হয়েছে
    //   const completedTime = new Date().toLocaleString('en-US', { 
    //     timeZone: 'Asia/Dhaka',
    //     dateStyle: 'medium',
    //     timeStyle: 'short'
    //   });

    //   await transporter.sendMail({
    //     from: `"NexSign" <${process.env.EMAIL_USER}>`,
    //     to: allRecipients.join(','), 
    //     subject: `Fully Executed: ${doc.title}`,
    //     html: `
    //       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e1e1e1; border-radius: 8px; overflow: hidden;">
    //         <div style="background-color: #2AAAE0; padding: 20px; text-align: center; color: #ffffff;">
    //           <h1 style="margin: 0; font-size: 24px;">Signing Complete!</h1>
    //         </div>
    //         <div style="padding: 20px; color: #333333; line-height: 1.6;">
    //           <p>Hello,</p>
    //           <p>Great news! The document <b>"${doc.title}"</b> has been fully executed by all parties.</p>
    //           <p>You can find the final signed PDF attached to this email. This version includes a <b>Digital Audit Certificate</b> for your secure record-keeping.</p>
    //           <div style="background-color: #f4f7f9; border-left: 4px solid #2AAAE0; padding: 15px; margin: 20px 0;">
    //             <p style="margin: 0;"><b>Document Details:</b></p>
    //             <p style="margin: 5px 0 0;">ID: ${doc._id}</p>
    //             <p style="margin: 0;">Completed On: ${completedTime} (BST)</p>
    //           </div>
    //           <p>Thank you for choosing <b>NexSign</b> for your digital document needs.</p>
    //           <p style="margin-top: 30px;">Best regards,<br/>The NexSign Team</p>
    //         </div>
    //         <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #888888;">
    //           This is an automated message. Please do not reply to this email.
    //         </div>
    //       </div>
    //     `,
    //     attachments: [{ filename: `${doc.title}_Final.pdf`, content: pdfBuffer, contentType: 'application/pdf' }]
    //   });
    // }
    if (allRecipients.length > 0) {
  const completedTime = new Date().toLocaleString('en-US', { 
    timeZone: 'Asia/Dhaka',
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  await transporter.sendMail({
    from: `"NeXsign" <${process.env.EMAIL_USER}>`,
    to: allRecipients.join(','), 
    subject: `Fully Executed: ${doc.title}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e1e1e1; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
        <div style="background-color: #2AAAE0; padding: 30px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 26px;">Document Fully Signed!</h1>
          <p style="margin: 10px 0 0; opacity: 0.9;">Great news! Everyone has finished signing.</p>
        </div>
        <div style="padding: 30px; color: #444444; line-height: 1.6;">
          <p>Hello,</p>
          <p>The signing process for <b>"${doc.title}"</b> is now complete. A copy of the fully executed document, including the digital audit certificate, is attached to this email for your records.</p>
          
          <div style="background-color: #f8fcfe; border-left: 4px solid #2AAAE0; padding: 20px; margin: 25px 0; border-radius: 4px;">
            <p style="margin: 0; font-weight: bold; color: #2AAAE0;">Document Summary:</p>
            <p style="margin: 8px 0 0;">📄 <b>Name:</b> ${doc.title}</p>
            <p style="margin: 4px 0 0;">📅 <b>Completed On:</b> ${completedTime} (BST)</p>
          </div>

          <p>You can also view or download this document anytime from your NexSign dashboard.</p>
          <p style="margin-top: 30px;">Best regards,<br/><b>The NexSign Team</b></p>
        </div>
        <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999999; border-top: 1px solid #eee;">
          Securely processed by NexSign Digital Signature Service.
        </div>
      </div>
    `,
    attachments: [{ filename: `${doc.title}_Final.pdf`, content: pdfBuffer, contentType: 'application/pdf' }]
  });
}
  } catch (err) { 
    console.error("Finalize Error:", err); 
  }
}; 
//change for snap problem 




// const mergeSignatures = async (doc) => {
//   const response = await axios.get(doc.fileUrl, { 
//     responseType: 'arraybuffer',
//     timeout: 15000 
//   });
  
//   const pdfDoc = await PDFDocument.load(response.data, { ignoreEncryption: true });
//   const timesFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
//   const pages = pdfDoc.getPages();

//   // ১. ডুপ্লিকেট ফিল্ড রিমুভ এবং ক্লিনআপ
//   const uniqueFields = Array.from(new Map(doc.fields.map(f => {
//     const obj = typeof f === 'string' ? JSON.parse(f) : f;
//     return [obj.id, obj];
//   })).values());

//   for (const fd of uniqueFields) {
//     try {
//       // 🌟 ফিক্স: 'filled' প্রপার্টি চেক বাদ দেওয়া হয়েছে, শুধু value থাকলেই রেন্ডার হবে
//       if (!fd.value) continue; 

//       const pageIndex = Number(fd.page) - 1;
//       if (pageIndex < 0 || pageIndex >= pages.length) continue;

//       const page = pages[pageIndex];
//       const { width, height } = page.getSize();
      
//       const drawW = (Number(fd.width) * width) / 100;
//       const drawH = (Number(fd.height) * height) / 100;
//       const drawX = (Number(fd.x) * width) / 100;
//       const drawY = height - ((Number(fd.y) * height) / 100) - drawH;

//       if (String(fd.value).startsWith('data:image')) {
//         const base64Data = fd.value.split(',')[1];
//         const imgBuffer = Buffer.from(base64Data, 'base64');
        
//         let sigImg;
//         if (fd.value.includes('image/png')) {
//           sigImg = await pdfDoc.embedPng(imgBuffer);
//         } else {
//           sigImg = await pdfDoc.embedJpg(imgBuffer);
//         }
        
//         page.drawImage(sigImg, { x: drawX, y: drawY, width: drawW, height: drawH });
//       } else {
//         page.drawText(String(fd.value), {
//           x: drawX + 2, 
//           y: drawY + (drawH / 4), // 🌟 পজিশন ফিক্স
//           size: 11, font: timesFont, color: rgb(0, 0, 0),
//         });
//       }
//     } catch (e) { 
//       console.error(`Render Error: ${e.message}`); 
//     }
//   }

//   return await pdfDoc.save({ useObjectStreams: true });
// };

// const generateAndSendFinalDoc = async (doc) => {
//   try {
//     const basePdfBytes = await mergeSignatures(doc);
//     const pdfDoc = await PDFDocument.load(basePdfBytes);
//     const timesFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
//     const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

//     const brandColor = rgb(0.16, 0.67, 0.88); 

//     let page = pdfDoc.addPage([600, 850]); 
//     const { width, height } = page.getSize();
//     let y = height - 50;

//     page.drawRectangle({
//       x: 20, y: 20, width: width - 40, height: height - 40,
//       borderColor: rgb(0.8, 0.8, 0.8), borderWidth: 1,
//     });

//     page.drawRectangle({
//       x: 21, y: y - 50, width: width - 42, height: 60,
//       color: brandColor, 
//     });

//     page.drawText('NEXSIGN DIGITAL AUDIT CERTIFICATE', {
//       x: 50, y: y - 15, size: 20, font: boldFont, color: rgb(1, 1, 1)
//     });
//     page.drawText('Document Evidence Summary & Audit Trail', {
//       x: 50, y: y - 35, size: 10, font: timesFont, color: rgb(0.9, 0.9, 0.9)
//     });
//     y -= 100;

//     const drawInfo = (label, value) => {
//       page.drawText(label, { x: 50, y, size: 11, font: boldFont });
//       page.drawText(String(value || 'N/A'), { x: 150, y, size: 11, font: timesFont });
//       y -= 20;
//     };

//     drawInfo('Document Title:', doc.title);
//     drawInfo('Created By:', `${doc.senderMeta?.name} (${doc.senderMeta?.email})`);
    
//     if (doc.ccEmails && doc.ccEmails.length > 0) {
//       drawInfo('CC Recipients:', doc.ccEmails.join(', '));
//     }

//     drawInfo('Initiated At:', doc.senderMeta?.time);
//     y -= 30;

//     page.drawText('SIGNER DETAILS & AUDIT TRAIL', { x: 50, y, size: 13, font: boldFont, color: brandColor });
//     y -= 25;

//     doc.parties.forEach((p, index) => {
//       if (y < 150) {
//         page = pdfDoc.addPage([600, 850]);
//         y = height - 50;
//       }
//       page.drawLine({ start: { x: 50, y: y + 10 }, end: { x: 550, y: y + 10 }, thickness: 0.5, color: rgb(0.9, 0.9, 0.9) });
//       page.drawText(`${index + 1}. ${p.name}`, { x: 50, y, size: 11, font: boldFont });
//       page.drawRectangle({ x: width - 100, y: y - 5, width: 55, height: 18, color: rgb(0.1, 0.6, 0.1) });
//       page.drawText('SIGNED', { x: width - 92, y: y, size: 8, font: boldFont, color: rgb(1, 1, 1) });
//       y -= 18;
//       page.drawText(`Email: ${p.email} | IP: ${p.ipAddress || 'N/A'}`, { x: 70, y, size: 9, font: timesFont });
//       y -= 15;
//       page.drawText(`Location: ${p.location || 'Unknown'}`, { x: 70, y, size: 9, font: timesFont });
//       y -= 15;
      
//       const deviceText = `Device: ${p.device || 'N/A'}`;
//       const charLimit = 85; 
//       for (let i = 0; i < deviceText.length; i += charLimit) {
//         const chunk = deviceText.substring(i, i + charLimit);
//         page.drawText(chunk, { x: 70, y, size: 8, font: timesFont, color: rgb(0.4, 0.4, 0.4) });
//         y -= 12;
//       }

//       const signedTime = p.signedAt ? new Date(p.signedAt).toLocaleString('en-US', { 
//         timeZone: 'Asia/Dhaka',
//         dateStyle: 'medium',
//         timeStyle: 'medium'
//       }) : 'N/A';

//       page.drawText(`Signed At: ${signedTime}`, { x: 70, y, size: 9, font: boldFont });
//       y -= 35; 
//     });

//     const pdfBytesFinal = await pdfDoc.save(); 
//     const pdfBuffer = Buffer.from(pdfBytesFinal);

//     // 🌟 ফিক্স: ক্লাউডিনারি আপলোড অপশন এবং এরর হ্যান্ডলিং
//     const uploadResult = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream(
//         { 
//           resource_type: "raw", 
//           folder: "completed_docs", 
//           public_id: `final_${doc._id}_${Date.now()}` // 🌟 .pdf এক্সটেনশন ক্লাউডিনারি নিজে হ্যান্ডেল করবে
//         },
//         (err, res) => err ? reject(err) : resolve(res)
//       );
//       stream.end(pdfBuffer);
//     });

//     doc.fileUrl = uploadResult.secure_url;
//     doc.status = 'completed';
//     await doc.save();

//     const signers = doc.parties.map(p => p.email).filter(e => e);
//     const validCCs = (doc.ccEmails || []).filter(e => e && e.trim() !== "");
//     const allRecipients = [...new Set([...signers, ...validCCs])];
    
//     if (allRecipients.length > 0) {
//       const completedTime = new Date().toLocaleString('en-US', { 
//         timeZone: 'Asia/Dhaka',
//         dateStyle: 'medium',
//         timeStyle: 'short'
//       });

//       await transporter.sendMail({
//         from: `"NeXsign" <${process.env.EMAIL_USER}>`,
//         to: allRecipients.join(','), 
//         subject: `Fully Executed: ${doc.title}`,
//         html: `
//           <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e1e1e1; border-radius: 12px; overflow: hidden;">
//             <div style="background-color: #2AAAE0; padding: 30px; text-align: center; color: #ffffff;">
//               <h1 style="margin: 0; font-size: 26px;">Document Fully Signed!</h1>
//             </div>
//             <div style="padding: 30px; color: #444444; line-height: 1.6;">
//               <p>Hello,</p>
//               <p>The signing process for <b>"${doc.title}"</b> is now complete. Final PDF is attached.</p>
//               <div style="background-color: #f8fcfe; border-left: 4px solid #2AAAE0; padding: 20px; margin: 25px 0;">
//                 <p style="margin: 0;"><b>Completed On:</b> ${completedTime} (BST)</p>
//               </div>
//               <p>Best regards,<br/><b>The NexSign Team</b></p>
//             </div>
//           </div>
//         `,
//         attachments: [{ 
//           filename: `${doc.title}_Final.pdf`, 
//           content: pdfBuffer, 
//           contentType: 'application/pdf' 
//         }]
//       });
//     }
//   } catch (err) { 
//     console.error("Finalize Error:", err); 
//   }
// };


// const sendSigningEmail = async (party, docTitle, token) => {
//   const baseUrl = process.env.FRONTEND_URL || "https://nexsignfrontend.vercel.app";
//   const signLink = `${baseUrl}/sign?token=${token}`;
  
//   return transporter.sendMail({
//     from: `"NexSign" <${process.env.EMAIL_USER}>`,
//     to: party.email,
//     subject: `Action Required: Signature Request for ${docTitle}`,
//     // HTML-টি আরও সুন্দর করা হয়েছে যেন ক্লিক রেট বাড়ে
//     html: `
//       <div style="font-family: sans-serif; padding: 20px; color: #333;">
//         <h2>Hello ${party.name || 'Signer'},</h2>
//         <p>You have been requested to sign the document: <b>${docTitle}</b>.</p>
//         <p>Please click the button below to review and sign:</p>
//         <a href="${signLink}" style="background: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Sign Document</a>
//         <p>If the button doesn't work, copy and paste this link: <br/> ${signLink}</p>
//         <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;">
//         <p style="font-size: 12px; color: #777;">Sent via NexSign - Secure Electronic Signatures</p>
//       </div>
//     `
//   });
// };
// --- ROUTES (ORDER MATTERS) ---

// ১. ড্যাশবোর্ড ডেটা
//workable

const sendSigningEmail = async (party, docTitle, token) => {
  const baseUrl = process.env.FRONTEND_URL || "https://nexsignfrontend.vercel.app";
  const signLink = `${baseUrl}/sign?token=${token}`;
  
  // 🌟 আপনার ব্র্যান্ড কালার
  const brandColor = "#28ABDF"; 

  return transporter.sendMail({
    from: `"NeXsign" <${process.env.EMAIL_USER}>`,
    to: party.email,
    subject: `Signature Request: ${docTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @media only screen and (max-width: 600px) {
            .container { width: 100% !important; border-radius: 0 !important; }
            .content { padding: 20px !important; }
            .button { width: 100% !important; box-sizing: border-box; text-align: center; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f7f9; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td align="center" style="padding: 20px 0;">
              <table class="container" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border: 1px solid #e1e4e8; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                
                <tr>
                  <td align="center" style="background-color: ${brandColor}; padding: 40px 20px;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -1px;">NexSign</h1>
                  </td>
                </tr>

                <tr>
                  <td class="content" style="padding: 40px 40px 30px 40px;">
                    <h2 style="color: #1a202c; font-size: 24px; margin-top: 0; font-weight: 700;">Signature Requested</h2>
                    <p style="color: #4a5568; font-size: 16px; line-height: 24px;">
                      Hello <strong>${party.name || 'Signer'}</strong>,
                    </p>
                    <p style="color: #4a5568; font-size: 16px; line-height: 24px;">
                      You have been invited to review and sign a document via NexSign. This process is secure and legally binding.
                    </p>

                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border-radius: 8px; margin: 25px 0; border-left: 4px solid ${brandColor};">
                      <tr>
                        <td style="padding: 20px;">
                          <p style="color: #64748b; font-size: 12px; font-weight: bold; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 1px;">Document Name</p>
                          <p style="color: #0f172a; font-size: 18px; font-weight: 600; margin: 0;">${docTitle}</p>
                        </td>
                      </tr>
                    </table>

                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="${signLink}" class="button" style="background-color: ${brandColor}; color: #ffffff; padding: 18px 45px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(40, 171, 223, 0.2);">
                            View & Sign Document
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="color: #718096; font-size: 14px; line-height: 20px; text-align: center; margin-top: 30px;">
                      Questions? Contact the sender directly. <br>
                      <span style="color: #e53e3e;">Important:</span> For security, never share your signing link with anyone.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 30px; background-color: #f9fafb; text-align: center; border-top: 1px solid #edf2f7;">
                    <p style="color: #a0aec0; font-size: 12px; margin: 0;">
                      &copy; 2026 NexSign Digital Signatures. <br>
                      The smarter way to execute documents.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  });
};


router.get('/', auth, async (req, res) => {
  try {
    const docs = await Document.find({ owner: req.user.id }).sort({ updatedAt: -1 });
    res.json(docs);
  } catch (err) { res.status(500).json({ error: "Load failed" }); }
});

// ২. আপলোড রাউট
// router.post('/upload', auth, upload.single('pdf'), async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ error: "No file uploaded" });
//     const result = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream(
//         { resource_type: "raw", folder: "nexsign_docs", format: 'pdf' },
//         (err, res) => err ? reject(err) : resolve(res)
//       );
//       stream.end(req.file.buffer);
//     });
//     const newDoc = new Document({
//       title: req.body.title || 'Untitled Document',
//       fileUrl: result.secure_url,
//       fileId: result.public_id,
//       owner: req.user.id,
//       status: 'draft',
//       parties: JSON.parse(req.body.parties || '[]'),
//       fields: []
//     });
//     await newDoc.save();
//     res.json(newDoc);
//   } catch (err) { res.status(500).json({ error: "Upload failed" }); }
// });
router.post('/upload', auth, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // ১. ক্লাউডিনারি আপলোড স্ট্রিম (উন্নত এরর হ্যান্ডলিং সহ)
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { 
          resource_type: "raw", 
          folder: "nexsign_docs", 
          format: 'pdf',
          access_mode: 'public' 
        },
        (err, res) => {
          if (err) return reject(err);
          resolve(res);
        }
      );
      stream.end(req.file.buffer);
    });

    // ২. পার্টজ (Parties) হ্যান্ডলিং
    let partiesData = [];
    try {
      partiesData = typeof req.body.parties === 'string' ? JSON.parse(req.body.parties) : (req.body.parties || []);
    } catch (e) { partiesData = []; }

    const newDoc = new Document({
      title: req.body.title || 'Untitled Document',
      fileUrl: result.secure_url,
      fileId: result.public_id,
      owner: req.user.id,
      status: 'draft',
      parties: partiesData,
      fields: []
    });

    await newDoc.save();
    res.json(newDoc);
  } catch (err) {
    console.error("Upload Error Details:", err);
    res.status(500).json({ error: "Upload failed on server", details: err.message });
  }
});


// এটি নতুন যোগ করুন (সব রাউটের মাঝে)
// router.post('/upload-metadata', auth, async (req, res) => {
//   try {
//     const { title, fileUrl, fileId } = req.body;
//     const newDoc = new Document({
//       title: title || 'Untitled Document',
//       fileUrl: fileUrl,
//       fileId: fileId,
//       owner: req.user.id,
//       status: 'draft',
//       parties: [],
//       fields: []
//     });
//     await newDoc.save();
//     res.json(newDoc);
//   } catch (err) {
//     res.status(500).json({ error: "Metadata save failed" });
//   }
// });

router.post('/upload-metadata', auth, async (req, res) => {
  try {
    const { title, fileUrl, fileId } = req.body;
    
    // fileId যদি না থাকে তবে URL থেকে সেটি বের করার চেষ্টা করা ভালো
    let finalFileId = fileId;
    if (!finalFileId && fileUrl) {
      // url থেকে nexsign_docs/filename অংশটুকু নেওয়ার জন্য
      const parts = fileUrl.split('/');
      const nexIndex = parts.indexOf('nexsign_docs');
      if (nexIndex !== -1) {
        finalFileId = parts.slice(nexIndex).join('/');
      }
    }

    const newDoc = new Document({
      title: title || 'Untitled Document',
      fileUrl: fileUrl,
      fileId: finalFileId, // প্রক্সির জন্য এই ID-ই ব্যবহৃত হবে
      owner: req.user.id,
      status: 'draft',
      parties: [],
      fields: []
    });
    
    await newDoc.save();
    res.json(newDoc);
  } catch (err) {
    console.error("Metadata Save Error:", err);
    res.status(500).json({ error: "Metadata save failed" });
  }
});
// ৩. সাইনিং লিঙ্ক পাঠানো
router.post('/send', auth, async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.body.id, owner: req.user.id });
    if (!doc) return res.status(404).json({ error: "Not found" });
    const token = crypto.randomBytes(32).toString('hex');
    doc.parties[0].token = token;
    doc.parties[0].status = 'sent';
    doc.status = 'in_progress';
    doc.currentPartyIndex = 0;
    doc.markModified('parties');
    await doc.save();
    await sendSigningEmail(doc.parties[0], doc.title, token);
    res.json({ success: true, signLink: `${process.env.FRONTEND_URL}/sign?token=${token}` });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/sign/submit', async (req, res) => {
  try {
    const { token, fields: incomingFields } = req.body;
    
    // ১. ডকুমেন্ট খুঁজে বের করা
    const doc = await Document.findOne({ "parties.token": token });
    if (!doc) return res.status(404).json({ error: "Invalid link or session expired" });

    const idx = doc.parties.findIndex(p => p.token === token);
    const userAgent = req.headers['user-agent'] || 'Unknown Device';
    
    // ২. নির্ভরযোগ্য আইপি ডিটেকশন
    const ip = (
      req.headers['x-real-ip'] || 
      req.headers['x-forwarded-for']?.split(',')[0] || 
      req.socket.remoteAddress || 
      '127.0.0.1'
    ).trim();

    // ৩. জিও-লোকেশন ফেচ করা
    let locationData = "Unknown Location";
    if (ip !== '127.0.0.1' && ip !== '::1') {
      try {
        const locRes = await axios.get(`http://ip-api.com/json/${ip}`, { timeout: 2500 });
        if (locRes.data?.status === 'success') {
          locationData = `${locRes.data.city}, ${locRes.data.regionName}, ${locRes.data.country}`;
        }
      } catch (locErr) {
        console.error("Geo-location fallback initiated:", locErr.message);
      }
    }

    // ৪. ডকুমেন্টের তথ্য আপডেট
    doc.fields = incomingFields;
    doc.parties[idx].status = 'signed';
    doc.parties[idx].signedAt = new Date();
    doc.parties[idx].device = userAgent;
    doc.parties[idx].ipAddress = ip;
    doc.parties[idx].location = locationData;

    // ৫. অডিট লগ এন্ট্রি
    await AuditLog.create({
      document_id: doc._id,
      action: 'signed',
      performed_by: { 
        name: doc.parties[idx].name, 
        email: doc.parties[idx].email, 
        role: 'signer' 
      },
      ip_address: ip,
      user_agent: userAgent,
      details: `Digitally signed from ${locationData}.`
    });

    doc.markModified('fields'); 
    doc.markModified('parties');

    // ৬. পরবর্তী সাইনার বা সমাপ্তি লজিক
    if (idx + 1 < doc.parties.length) {
      // পরবর্তী সাইনার আছে
      const nextToken = crypto.randomBytes(32).toString('hex');
      doc.parties[idx + 1].token = nextToken;
      doc.parties[idx + 1].status = 'sent';
      doc.currentPartyIndex = idx + 1;
      
      await doc.save();
      await sendSigningEmail(doc.parties[idx + 1], doc.title, nextToken); 
      return res.json({ next: true });
    } else {
      // শেষ সাইনার, ডকুমেন্ট সম্পন্ন
      doc.status = 'completed';
      doc.currentPartyIndex = idx;
      await doc.save(); 

      // 🌟 গুরুত্বপূর্ণ: ডাটাবেস থেকে একদম লেটেস্ট কপি নিয়ে সার্টিফিকেট বানানো
      const finalDoc = await Document.findById(doc._id);
      
      // ব্যাকগ্রাউন্ডে প্রসেস না করে await করা ভালো যাতে রেসপন্স নিশ্চিত হয়
      await generateAndSendFinalDoc(finalDoc); 
      
      return res.json({ completed: true });
    }
  } catch (err) { 
    console.error("Signature Submission Error:", err);
    res.status(500).json({ error: "Failed to process signature" }); 
  }
});

// ৫. সাইনিং পেজের ডেটা লোড
// fix for error the snap 

// router.post('/sign/submit', async (req, res) => {
//   try {
//     const { token, fields: incomingFields } = req.body;
    
//     // ১. ডকুমেন্ট খুঁজে বের করা
//     const doc = await Document.findOne({ "parties.token": token });
//     if (!doc) return res.status(404).json({ error: "Invalid link or session expired" });

//     const idx = doc.parties.findIndex(p => p.token === token);
//     const userAgent = req.headers['user-agent'] || 'Unknown Device';
    
//     // ২. নির্ভরযোগ্য আইপি ডিটেকশন
//     const ip = (
//       req.headers['x-real-ip'] || 
//       req.headers['x-forwarded-for']?.split(',')[0] || 
//       req.socket.remoteAddress || 
//       '127.0.0.1'
//     ).trim();

//     // ৩. জিও-লোকেশন ফেচ করা
//     let locationData = "Unknown Location";
//     if (ip !== '127.0.0.1' && ip !== '::1') {
//       try {
//         const locRes = await axios.get(`http://ip-api.com/json/${ip}`, { timeout: 2500 });
//         if (locRes.data?.status === 'success') {
//           locationData = `${locRes.data.city}, ${locRes.data.regionName}, ${locRes.data.country}`;
//         }
//       } catch (locErr) {
//         console.error("Geo-location fallback initiated:", locErr.message);
//       }
//     }

//     // ৪. ডকুমেন্টের তথ্য আপডেট
//     doc.fields = incomingFields;
//     doc.parties[idx].status = 'signed';
//     doc.parties[idx].signedAt = new Date();
//     doc.parties[idx].device = userAgent;
//     doc.parties[idx].ipAddress = ip;
//     doc.parties[idx].location = locationData;

//     // ৫. অডিট লগ এন্ট্রি (এটি await থাকাই ভালো)
//     await AuditLog.create({
//       document_id: doc._id,
//       action: 'signed',
//       performed_by: { 
//         name: doc.parties[idx].name, 
//         email: doc.parties[idx].email, 
//         role: 'signer' 
//       },
//       ip_address: ip,
//       user_agent: userAgent,
//       details: `Digitally signed from ${locationData}.`
//     });

//     doc.markModified('fields'); 
//     doc.markModified('parties');

//     // ৬. পরবর্তী সাইনার বা সমাপ্তি লজিক
//     if (idx + 1 < doc.parties.length) {
//       const nextToken = crypto.randomBytes(32).toString('hex');
//       doc.parties[idx + 1].token = nextToken;
//       doc.parties[idx + 1].status = 'sent';
//       doc.currentPartyIndex = idx + 1;
      
//       await doc.save();
//       // ইমেইল পাঠানো ব্যাকগ্রাউন্ডে রাখা ভালো
//       sendSigningEmail(doc.parties[idx + 1], doc.title, nextToken).catch(e => console.error("Email Error:", e)); 
//       return res.json({ next: true });
//     } else {
//       // ✅ শেষ সাইনার, ডকুমেন্ট সম্পন্ন
//       doc.status = 'completed';
//       doc.currentPartyIndex = idx;
      
//       // গুরুত্বপূর্ণ: ডাটাবেসে পজিশন সেভ নিশ্চিত করা
//       await doc.save(); 

//       // লেটেস্ট কপি সংগ্রহ
//       const finalDoc = await Document.findById(doc._id);
      
//       // 🚀 ফিক্স: মোবাইল ক্র্যাশ এড়াতে আগে রেসপন্স পাঠানো
//       res.json({ completed: true });

//       // 🚀 ফিক্স: এরর হ্যান্ডলিং সহ ব্যাকগ্রাউন্ডে পিডিএফ জেনারেশন
//       generateAndSendFinalDoc(finalDoc).catch(err => {
//         console.error("🔴 Critical: Background PDF Generation Error:", err.message);
//       });
      
//       return; 
//     }
//   } catch (err) { 
//     console.error("Signature Submission Error:", err);
//     res.status(500).json({ error: "Failed to process signature" }); 
//   }
// });


router.get('/sign/:token', async (req, res) => {
  try {
    const doc = await Document.findOne({ "parties.token": req.params.token });
    if (!doc) return res.status(404).json({ error: "Invalid link" });
    const party = doc.parties.find(p => p.token === req.params.token);
    res.json({ document: doc, party: { ...party.toObject(), index: doc.parties.indexOf(party) } });
  } catch (err) { res.status(500).json({ error: "Session failed" }); }
});

// ৬. পিডিএফ প্রক্সি
// router.get('/proxy/*', async (req, res) => {
//   try {
//     const path = req.params[0];
//     const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${path}`;
//     const response = await axios.get(url, { responseType: 'stream' });
//     res.setHeader('Content-Type', 'application/pdf');
//     response.data.pipe(res);
//   } catch (err) { res.status(404).send("File not found"); }
// });
router.get('/proxy/*', async (req, res) => {
  try {
    const cloudPath = req.params[0];
    if (!cloudPath) return res.status(400).send("Path is required");

    // 🌟 ফিক্স: নির্দিষ্ট অরিজিন সেট করা (CORS Error দূর করবে)
    const allowedOrigins = ['https://nexsignfrontend.vercel.app', 'http://localhost:5173'];
    const origin = req.headers.origin;
    
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    const resourceTypes = ['image', 'raw'];
    
    for (const type of resourceTypes) {
      try {
        const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/${type}/upload/${cloudPath}`;
        
        const response = await axios.get(url, { 
          responseType: 'stream',
          timeout: 10000 
        });

        // ব্রাউজারকে জানানো এটি একটি পিডিএফ
        res.setHeader('Content-Type', 'application/pdf');
        return response.data.pipe(res);
      } catch (e) {
        continue; 
      }
    }

    res.status(404).send("PDF not found on Cloudinary storage");
  } catch (err) {
    console.error("Proxy Server Error:", err.message);
    res.status(500).send("Internal server error during PDF proxying");
  }
});
// ৭. ডাইনামিক আইডি রাউট (অবশ্যই সবার শেষে)
router.get('/:id', auth, async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, owner: req.user.id });
    if (!doc) return res.status(404).json({ error: "Document not found" });
    res.json(doc);
  } catch (err) { res.status(500).json({ error: "Invalid ID" }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const updatedDoc = await Document.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      { $set: req.body },
      { new: true }
    );
    res.json(updatedDoc);
  } catch (err) { res.status(500).json({ error: "Save failed" }); }
});

module.exports = router;