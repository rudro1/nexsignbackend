
// // // const User = require('./models/User');
// // // const Document = require('./models/Document');
// // // const AuditLog = require('./models/AuditLog');
// // // const auth = require('./middleware/auth');
// // // require('dotenv').config();

// // // const app = express();

// // // // ⚠️ CORS MUST BE THE VERY FIRST MIDDLEWARE
// // // app.use(cors({
// // //   origin: true,
// // //   credentials: true,
// // //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
// // //   allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
// // // }));

// // // // Request logging for debugging
// // // app.use((req, res, next) => {
// // //   console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
// // //   next();
// // // });

// // // app.use(express.json());
// // // app.use(express.urlencoded({ extended: true }));

// // // // Cloudinary Configuration
// // // cloudinary.config({
// // //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
// // //   api_key: process.env.CLOUDINARY_API_KEY,
// // //   api_secret: process.env.CLOUDINARY_API_SECRET
// // // });

// // // const storage = new CloudinaryStorage({
// // //   cloudinary: cloudinary,
// // //   params: {
// // //     folder: 'nexsign_pdfs',
// // //     resource_type: 'raw',
// // //     format: async () => 'pdf',
// // //   },
// // // });
// // // const upload = multer({ storage: storage });

// // // // MongoDB Connection
// // // mongoose.connect(process.env.MONGO_URI)
// // //   .then(() => console.log("✅ MongoDB Connected!"))
// // //   .catch(err => console.log("❌ MongoDB Error:", err));

// // // // --- API Routes ---

// // // // Health Check
// // // app.get('/api', (req, res) => {
// // //   res.json({ status: 'ok', message: 'NexSign API is running' });
// // // });

// // // // PDF Upload
// // // app.post('/api/documents/upload', auth, upload.single('file'), (req, res) => {
// // //   console.log("📤 Upload request received");
// // //   try {
// // //     if (!req.file) return res.status(400).json({ message: "File not found" });
// // //     console.log("📁 File uploaded:", req.file.path);
// // //     res.json({ url: req.file.path });
// // //   } catch (err) {
// // //     console.error("❌ Upload error:", err);
// // //     res.status(500).json({ message: "Upload error: " + err.message });
// // //   }
// // // });

// // // // Save/Update Document
// // // app.post('/api/documents', auth, async (req, res) => {
// // //   try {
// // //     let doc;
// // //     const data = { ...req.body, owner: req.user.id };
// // //     const docId = req.body.id || req.body._id;

// // //     if (docId) {
// // //       doc = await Document.findByIdAndUpdate(docId, data, { new: true });
// // //     } else {
// // //       doc = new Document(data);
// // //       await doc.save();
      
// // //       await AuditLog.create({
// // //         document_id: doc._id,
// // //         action: 'created',
// // //         details: `Document "${doc.title}" created as draft.`
// // //       });
// // //     }
// // //     res.status(201).json(doc);
// // //   } catch (err) {
// // //     res.status(500).json({ message: "Save error: " + err.message });
// // //   }
// // // });

// // // // Send for Signing
// // // app.post('/api/documents/send', auth, async (req, res) => {
// // //   try {
// // //     const { title, file_url, parties, fields, total_pages, id } = req.body;
// // //     const token = crypto.randomBytes(32).toString('hex');
    
// // //     const updatedParties = parties.map((p, i) => ({
// // //       ...p,
// // //       status: i === 0 ? 'sent' : 'pending',
// // //       token: i === 0 ? token : null
// // //     }));

// // //     const docData = {
// // //       title, file_url, parties: updatedParties, fields, total_pages,
// // //       status: 'in_progress', owner: req.user.id, current_party_index: 0
// // //     };

// // //     const doc = id ? await Document.findByIdAndUpdate(id, docData, { new: true }) : await Document.create(docData);

// // //     await AuditLog.create({
// // //       document_id: doc._id,
// // //       action: 'sent',
// // //       party_name: updatedParties[0].name,
// // //       party_email: updatedParties[0].email,
// // //       details: `Signing request sent to ${updatedParties[0].name}`
// // //     });

// // //     const transporter = nodemailer.createTransport({
// // //       service: 'gmail',
// // //       auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
// // //     });

// // //     const signLink = `${process.env.FRONTEND_URL}/sign?token=${token}`;

// // //     await transporter.sendMail({
// // //       from: `"Nexsign" <${process.env.EMAIL_USER}>`,
// // //       to: updatedParties[0].email,
// // //       subject: `Please sign: ${title}`,
// // //       html: `<h2>Hello ${updatedParties[0].name},</h2>
// // //              <p>You have been requested to sign <b>${title}</b>.</p>
// // //              <a href="${signLink}" style="background:#0ea5e9; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">Sign Document</a>`
// // //     });

// // //     res.json({ success: true, docId: doc._id });
// // //   } catch (err) {
// // //     res.status(500).json({ message: "Send error: " + err.message });
// // //   }
// // // });

// // // // Get Document
// // // app.get('/api/documents/:id', auth, async (req, res) => {
// // //   try {
// // //     const doc = await Document.findById(req.params.id);
// // //     if (!doc) return res.status(404).json({ message: "Document not found" });
// // //     res.json(doc);
// // //   } catch (err) {
// // //     res.status(500).json({ message: "Error: " + err.message });
// // //   }
// // // });

// // // // Get User Documents
// // // app.get('/api/documents/user', auth, async (req, res) => {
// // //   try {
// // //     const docs = await Document.find({ owner: req.user.id }).sort({ createdAt: -1 });
// // //     res.json(docs);
// // //   } catch (err) {
// // //     res.status(500).json({ message: "Error: " + err.message });
// // //   }
// // // });

// // // // Login
// // // app.post('/api/auth/login', async (req, res) => {
// // //   try {
// // //     const { email, password } = req.body;
// // //     const user = await User.findOne({ email });
// // //     if (user && await bcrypt.compare(password, user.password)) {
// // //       const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
// // //       res.json({ token, user: { id: user._id, full_name: user.full_name, email: user.email } });
// // //     } else {
// // //       res.status(400).json({ message: "Invalid credentials" });
// // //     }
// // //   } catch (err) {
// // //     res.status(500).json({ message: "Error: " + err.message });
// // //   }
// // // });

// // // // Register
// // // app.post('/api/auth/register', async (req, res) => {
// // //   try {
// // //     const { full_name, email, password } = req.body;
// // //     const existingUser = await User.findOne({ email });
// // //     if (existingUser) return res.status(400).json({ message: "User already exists" });
    
// // //     const hashedPassword = await bcrypt.hash(password, 10);
// // //     const user = new User({ full_name, email, password: hashedPassword });
// // //     await user.save();
    
// // //     const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
// // //     res.json({ token, user: { id: user._id, full_name: user.full_name, email: user.email } });
// // //   } catch (err) {
// // //     res.status(500).json({ message: "Error: " + err.message });
// // //   }
// // // });

// // // // Sign Document
// // // app.get('/api/documents/sign/:token', async (req, res) => {
// // //   try {
// // //     const doc = await Document.findOne({ 'parties.token': req.params.token });
// // //     if (!doc) return res.status(404).json({ message: "Invalid token" });
    
// // //     const party = doc.parties.find(p => p.token === req.params.token);
// // //     if (!party) return res.status(404).json({ message: "Party not found" });
    
// // //     res.json({ 
// // //       document: doc, 
// // //       party: party,
// // //       signLink: `${process.env.FRONTEND_URL}/sign?token=${req.params.token}`
// // //     });
// // //   } catch (err) {
// // //     res.status(500).json({ message: "Error: " + err.message });
// // //   }
// // // });

// // // // ⚠️ PORT 5001 ব্যবহার করুন (5000 এর বদলে)
// // // const PORT = process.env.PORT || 5001;
// // // app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// // const express = require('express');
// // const mongoose = require('mongoose');
// // const cors = require('cors');
// // const bcrypt = require('bcryptjs');
// // const jwt = require('jsonwebtoken');
// // const multer = require('multer');
// // const cloudinary = require('cloudinary').v2;
// // const { CloudinaryStorage } = require('multer-storage-cloudinary');
// // const nodemailer = require('nodemailer');
// // const crypto = require('crypto');
// // const fetch = require('node-fetch');

// // const User = require('./models/User');
// // const Document = require('./models/Document');
// // const AuditLog = require('./models/AuditLog');
// // const auth = require('./middleware/auth');
// // require('dotenv').config();

// // const app = express();

// // // ⚠️ CORS MUST BE THE VERY FIRST MIDDLEWARE
// // app.use(cors({
// //   origin: true,
// //   credentials: true,
// //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
// //   allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
// // }));

// // // Request logging for debugging
// // app.use((req, res, next) => {
// //   console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
// //   next();
// // });

// // app.use(express.json());
// // app.use(express.urlencoded({ extended: true }));

// // // Cloudinary Configuration
// // cloudinary.config({
// //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
// //   api_key: process.env.CLOUDINARY_API_KEY,
// //   api_secret: process.env.CLOUDINARY_API_SECRET
// // });

// // const storage = new CloudinaryStorage({
// //   cloudinary: cloudinary,
// //   params: {
// //     folder: 'nexsign_pdfs',
// //     resource_type: 'raw',
// //     format: async () => 'pdf',
// //   },
// // });
// // const upload = multer({ storage: storage });

// // // MongoDB Connection
// // mongoose.connect(process.env.MONGO_URI)
// //   .then(() => console.log("✅ MongoDB Connected!"))
// //   .catch(err => console.log("❌ MongoDB Error:", err));

// // // --- API Routes ---

// // // Health Check
// // app.get('/api', (req, res) => {
// //   res.json({ status: 'ok', message: 'NexSign API is running' });
// // });

// // // PDF Upload
// // app.post('/api/documents/upload', auth, upload.single('file'), (req, res) => {
// //   console.log("📤 Upload request received");
// //   try {
// //     if (!req.file) return res.status(400).json({ message: "File not found" });
// //     console.log("📁 File uploaded:", req.file.path);
// //     res.json({ url: req.file.path });
// //   } catch (err) {
// //     console.error("❌ Upload error:", err);
// //     res.status(500).json({ message: "Upload error: " + err.message });
// //   }
// // });

// // // Save/Update Document
// // app.post('/api/documents', auth, async (req, res) => {
// //   try {
// //     let doc;
// //     const data = { ...req.body, owner: req.user.id };
// //     const docId = req.body.id || req.body._id;

// //     if (docId) {
// //       doc = await Document.findByIdAndUpdate(docId, data, { new: true });
// //     } else {
// //       doc = new Document(data);
// //       await doc.save();
      
// //       await AuditLog.create({
// //         document_id: doc._id,
// //         action: 'created',
// //         details: `Document "${doc.title}" created as draft.`
// //       });
// //     }
// //     res.status(201).json(doc);
// //   } catch (err) {
// //     res.status(500).json({ message: "Save error: " + err.message });
// //   }
// // });

// // // Send for Signing
// // app.post('/api/documents/send', auth, async (req, res) => {
// //   try {
// //     const { title, file_url, parties, fields, total_pages, id } = req.body;
// //     const token = crypto.randomBytes(32).toString('hex');
    
// //     const updatedParties = parties.map((p, i) => ({
// //       ...p,
// //       status: i === 0 ? 'sent' : 'pending',
// //       token: i === 0 ? token : null
// //     }));

// //     const docData = {
// //       title, file_url, parties: updatedParties, fields, total_pages,
// //       status: 'in_progress', owner: req.user.id, current_party_index: 0
// //     };

// //     const doc = id ? await Document.findByIdAndUpdate(id, docData, { new: true }) : await Document.create(docData);

// //     await AuditLog.create({
// //       document_id: doc._id,
// //       action: 'sent',
// //       party_name: updatedParties[0].name,
// //       party_email: updatedParties[0].email,
// //       details: `Signing request sent to ${updatedParties[0].name}`
// //     });

// //     const transporter = nodemailer.createTransport({
// //       service: 'gmail',
// //       auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
// //     });

// //     const signLink = `${process.env.FRONTEND_URL}/sign?token=${token}`;

// //     await transporter.sendMail({
// //       from: `"Nexsign" <${process.env.EMAIL_USER}>`,
// //       to: updatedParties[0].email,
// //       subject: `Please sign: ${title}`,
// //       html: `<h2>Hello ${updatedParties[0].name},</h2>
// //              <p>You have been requested to sign <b>${title}</b>.</p>
// //              <a href="${signLink}" style="background:#0ea5e9; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">Sign Document</a>`
// //     });

// //     res.json({ success: true, docId: doc._id });
// //   } catch (err) {
// //     res.status(500).json({ message: "Send error: " + err.message });
// //   }
// // });

// // // Get Document
// // app.get('/api/documents/:id', auth, async (req, res) => {
// //   try {
// //     const doc = await Document.findById(req.params.id);
// //     if (!doc) return res.status(404).json({ message: "Document not found" });
// //     res.json(doc);
// //   } catch (err) {
// //     res.status(500).json({ message: "Error: " + err.message });
// //   }
// // });

// // // Get User Documents
// // app.get('/api/documents/user', auth, async (req, res) => {
// //   try {
// //     const docs = await Document.find({ owner: req.user.id }).sort({ createdAt: -1 });
// //     res.json(docs);
// //   } catch (err) {
// //     res.status(500).json({ message: "Error: " + err.message });
// //   }
// // });

// // // Login
// // app.post('/api/auth/login', async (req, res) => {
// //   try {
// //     const { email, password } = req.body;
// //     const user = await User.findOne({ email });
// //     if (user && await bcrypt.compare(password, user.password)) {
// //       const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
// //       res.json({ token, user: { id: user._id, full_name: user.full_name, email: user.email } });
// //     } else {
// //       res.status(400).json({ message: "Invalid credentials" });
// //     }
// //   } catch (err) {
// //     res.status(500).json({ message: "Error: " + err.message });
// //   }
// // });

// // // Register
// // app.post('/api/auth/register', async (req, res) => {
// //   try {
// //     const { full_name, email, password } = req.body;
// //     const existingUser = await User.findOne({ email });
// //     if (existingUser) return res.status(400).json({ message: "User already exists" });
    
// //     const hashedPassword = await bcrypt.hash(password, 10);
// //     const user = new User({ full_name, email, password: hashedPassword });
// //     await user.save();
    
// //     const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
// //     res.json({ token, user: { id: user._id, full_name: user.full_name, email: user.email } });
// //   } catch (err) {
// //     res.status(500).json({ message: "Error: " + err.message });
// //   }
// // });

// // // Sign Document
// // app.get('/api/documents/sign/:token', async (req, res) => {
// //   try {
// //     const doc = await Document.findOne({ 'parties.token': req.params.token });
// //     if (!doc) return res.status(404).json({ message: "Invalid token" });
    
// //     const party = doc.parties.find(p => p.token === req.params.token);
// //     if (!party) return res.status(404).json({ message: "Party not found" });
    
// //     res.json({ 
// //       document: doc, 
// //       party: party,
// //       signLink: `${process.env.FRONTEND_URL}/sign?token=${req.params.token}`
// //     });
// //   } catch (err) {
// //     res.status(500).json({ message: "Error: " + err.message });
// //   }
// // });

// // // PDF Proxy Route - Cloudinary থেকে PDF সার্ভ করবে
// // app.get('/api/documents/proxy/:publicId', async (req, res) => {
// //   try {
// //     const { publicId } = req.params;
// //     const cloudinaryUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${publicId}`;
    
// //     const response = await fetch(cloudinaryUrl);
// //     if (!response.ok) {
// //       return res.status(404).json({ message: "PDF not found" });
// //     }
    
// //     const arrayBuffer = await response.arrayBuffer();
// //     res.set('Content-Type', 'application/pdf');
// //     res.set('Access-Control-Allow-Origin', '*');
// //     res.send(Buffer.from(arrayBuffer));
// //   } catch (err) {
// //     console.error("PDF Proxy Error:", err);
// //     res.status(500).json({ message: "Error fetching PDF" });
// //   }
// // });

// // // ⚠️ PORT 5001 ব্যবহার করুন
// // const PORT = process.env.PORT || 5001;
// // app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
// // const express = require('express');
// // const mongoose = require('mongoose');
// // const cors = require('cors');
// // const bcrypt = require('bcryptjs');
// // const jwt = require('jsonwebtoken');
// // const multer = require('multer');
// // const path = require('path');
// // const fs = require('fs');
// // const nodemailer = require('nodemailer');
// // const crypto = require('crypto');

// // const User = require('./models/User');
// // const Document = require('./models/Document');
// // const AuditLog = require('./models/AuditLog');
// // const auth = require('./middleware/auth');
// // require('dotenv').config();

// // const app = express();

// // // ⚠️ CORS MUST BE THE VERY FIRST MIDDLEWARE
// // app.use(cors({
// //   origin: true,
// //   credentials: true,
// //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
// //   allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
// // }));

// // // Request logging for debugging
// // app.use((req, res, next) => {
// //   console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
// //   next();
// // });

// // app.use(express.json());
// // app.use(express.urlencoded({ extended: true }));

// // // Create uploads folder if not exists
// // const uploadsDir = path.join(__dirname, 'uploads');
// // if (!fs.existsSync(uploadsDir)) {
// //   fs.mkdirSync(uploadsDir, { recursive: true });
// // }

// // // Create cmap folder if not exists
// // const cmapDir = path.join(__dirname, 'cmaps');
// // if (!fs.existsSync(cmapDir)) {
// //   fs.mkdirSync(cmapDir, { recursive: true });
// // }

// // // Serve uploaded files
// // app.use('/uploads', express.static(uploadsDir));

// // // Serve CMap files
// // app.use('/cmaps', express.static(cmapDir));

// // // Multer Setup - Local Storage
// // const storage = multer.diskStorage({
// //   destination: (req, file, cb) => {
// //     cb(null, 'uploads/');
// //   },
// //   filename: (req, file, cb) => {
// //     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
// //     cb(null, uniqueSuffix + path.extname(file.originalname));
// //   }
// // });

// // const upload = multer({ 
// //   storage: storage,
// //   fileFilter: (req, file, cb) => {
// //     if (file.mimetype === 'application/pdf') {
// //       cb(null, true);
// //     } else {
// //       cb(new Error('Only PDF files are allowed'), false);
// //     }
// //   }
// // });

// // // MongoDB Connection
// // mongoose.connect(process.env.MONGO_URI)
// //   .then(() => console.log("✅ MongoDB Connected!"))
// //   .catch(err => console.log("❌ MongoDB Error:", err));

// // // --- API Routes ---

// // // Health Check
// // app.get('/api', (req, res) => {
// //   res.json({ status: 'ok', message: 'NexSign API is running' });
// // });

// // // PDF Upload (Local Storage)
// // app.post('/api/documents/upload', auth, upload.single('file'), (req, res) => {
// //   console.log("📤 Upload request received");
// //   try {
// //     if (!req.file) return res.status(400).json({ message: "File not found" });
    
// //     // Save file path
// //     const fileUrl = `/uploads/${req.file.filename}`;
// //     console.log("📁 File uploaded:", fileUrl);
// //     res.json({ url: fileUrl });
// //   } catch (err) {
// //     console.error("❌ Upload error:", err);
// //     res.status(500).json({ message: "Upload error: " + err.message });
// //   }
// // });

// // // Save/Update Document
// // app.post('/api/documents', auth, async (req, res) => {
// //   try {
// //     let doc;
// //     const data = { ...req.body, owner: req.user.id };
// //     const docId = req.body.id || req.body._id;

// //     if (docId) {
// //       doc = await Document.findByIdAndUpdate(docId, data, { new: true });
// //     } else {
// //       doc = new Document(data);
// //       await doc.save();
      
// //       await AuditLog.create({
// //         document_id: doc._id,
// //         action: 'created',
// //         details: `Document "${doc.title}" created as draft.`
// //       });
// //     }
// //     res.status(201).json(doc);
// //   } catch (err) {
// //     res.status(500).json({ message: "Save error: " + err.message });
// //   }
// // });

// // // Send for Signing
// // app.post('/api/documents/send', auth, async (req, res) => {
// //   try {
// //     const { title, file_url, parties, fields, total_pages, id } = req.body;
// //     const token = crypto.randomBytes(32).toString('hex');
    
// //     const updatedParties = parties.map((p, i) => ({
// //       ...p,
// //       status: i === 0 ? 'sent' : 'pending',
// //       token: i === 0 ? token : null
// //     }));

// //     const docData = {
// //       title, file_url, parties: updatedParties, fields, total_pages,
// //       status: 'in_progress', owner: req.user.id, current_party_index: 0
// //     };

// //     const doc = id ? await Document.findByIdAndUpdate(id, docData, { new: true }) : await Document.create(docData);

// //     await AuditLog.create({
// //       document_id: doc._id,
// //       action: 'sent',
// //       party_name: updatedParties[0].name,
// //       party_email: updatedParties[0].email,
// //       details: `Signing request sent to ${updatedParties[0].name}`
// //     });

// //     const transporter = nodemailer.createTransport({
// //       service: 'gmail',
// //       auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
// //     });

// //     const signLink = `${process.env.FRONTEND_URL}/sign?token=${token}`;

// //     await transporter.sendMail({
// //       from: `"Nexsign" <${process.env.EMAIL_USER}>`,
// //       to: updatedParties[0].email,
// //       subject: `Please sign: ${title}`,
// //       html: `<h2>Hello ${updatedParties[0].name},</h2>
// //              <p>You have been requested to sign <b>${title}</b>.</p>
// //              <a href="${signLink}" style="background:#0ea5e9; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">Sign Document</a>`
// //     });

// //     res.json({ success: true, docId: doc._id });
// //   } catch (err) {
// //     res.status(500).json({ message: "Send error: " + err.message });
// //   }
// // });

// // // Get Document
// // app.get('/api/documents/:id', auth, async (req, res) => {
// //   try {
// //     const doc = await Document.findById(req.params.id);
// //     if (!doc) return res.status(404).json({ message: "Document not found" });
// //     res.json(doc);
// //   } catch (err) {
// //     res.status(500).json({ message: "Error: " + err.message });
// //   }
// // });

// // // Get User Documents
// // app.get('/api/documents/user', auth, async (req, res) => {
// //   try {
// //     const docs = await Document.find({ owner: req.user.id }).sort({ createdAt: -1 });
// //     res.json(docs);
// //   } catch (err) {
// //     res.status(500).json({ message: "Error: " + err.message });
// //   }
// // });

// // // Login
// // app.post('/api/auth/login', async (req, res) => {
// //   try {
// //     const { email, password } = req.body;
// //     const user = await User.findOne({ email });
// //     if (user && await bcrypt.compare(password, user.password)) {
// //       const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
// //       res.json({ token, user: { id: user._id, full_name: user.full_name, email: user.email } });
// //     } else {
// //       res.status(400).json({ message: "Invalid credentials" });
// //     }
// //   } catch (err) {
// //     res.status(500).json({ message: "Error: " + err.message });
// //   }
// // });

// // // Register
// // app.post('/api/auth/register', async (req, res) => {
// //   try {
// //     const { full_name, email, password } = req.body;
// //     const existingUser = await User.findOne({ email });
// //     if (existingUser) return res.status(400).json({ message: "User already exists" });
    
// //     const hashedPassword = await bcrypt.hash(password, 10);
// //     const user = new User({ full_name, email, password: hashedPassword });
// //     await user.save();
    
// //     const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
// //     res.json({ token, user: { id: user._id, full_name: user.full_name, email: user.email } });
// //   } catch (err) {
// //     res.status(500).json({ message: "Error: " + err.message });
// //   }
// // });

// // // Sign Document
// // app.get('/api/documents/sign/:token', async (req, res) => {
// //   try {
// //     const doc = await Document.findOne({ 'parties.token': req.params.token });
// //     if (!doc) return res.status(404).json({ message: "Invalid token" });
    
// //     const party = doc.parties.find(p => p.token === req.params.token);
// //     if (!party) return res.status(404).json({ message: "Party not found" });
    
// //     res.json({ 
// //       document: doc, 
// //       party: party,
// //       signLink: `${process.env.FRONTEND_URL}/sign?token=${req.params.token}`
// //     });
// //   } catch (err) {
// //     res.status(500).json({ message: "Error: " + err.message });
// //   }
// // });

// // // PDF Proxy Route - Local File থেকে PDF সার্ভ করবে
// // app.get('/api/documents/proxy/:filename', async (req, res) => {
// //   try {
// //     const { filename } = req.params;
// //     const filePath = path.join(__dirname, 'uploads', filename);
    
// //     console.log("📥 Proxy Request:", req.path);
// //     console.log("📥 File Path:", filePath);
    
// //     if (!fs.existsSync(filePath)) {
// //       console.error("❌ File not found:", filePath);
// //       return res.status(404).json({ message: "PDF not found" });
// //     }
    
// //     const fileBuffer = fs.readFileSync(filePath);
// //     console.log("✅ PDF sent successfully, size:", fileBuffer.length, "bytes");
// //     res.set('Content-Type', 'application/pdf');
// //     res.set('Access-Control-Allow-Origin', '*');
// //     res.send(fileBuffer);
// //   } catch (err) {
// //     console.error("❌ PDF Proxy Error:", err);
// //     res.status(500).json({ message: "Error fetching PDF" });
// //   }
// // });

// // // ⚠️ PORT 5001 ব্যবহার করুন
// // const PORT = process.env.PORT || 5001;
// // app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
// // const express = require('express');
// // const mongoose = require('mongoose');
// // const cors = require('cors');
// // const bcrypt = require('bcryptjs');
// // const jwt = require('jsonwebtoken');
// // const multer = require('multer');
// // const path = require('path');
// // const fs = require('fs');
// // const nodemailer = require('nodemailer');
// // const crypto = require('crypto');

// // const User = require('./models/User');
// // const Document = require('./models/Document');
// // const AuditLog = require('./models/AuditLog');
// // const auth = require('./middleware/auth');
// // require('dotenv').config();

// // const app = express();

// // // ⚠️ CORS MUST BE THE VERY FIRST MIDDLEWARE
// // app.use(cors({
// //   origin: true,
// //   credentials: true,
// //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
// //   allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'Authorization']
// // }));

// // // Request logging for debugging
// // app.use((req, res, next) => {
// //   console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
// //   console.log('Authorization Header:', req.headers.authorization);
// //   next();
// // });

// // app.use(express.json());
// // app.use(express.urlencoded({ extended: true }));

// // // Create uploads folder if not exists
// // const uploadsDir = path.join(__dirname, 'uploads');
// // if (!fs.existsSync(uploadsDir)) {
// //   fs.mkdirSync(uploadsDir, { recursive: true });
// // }

// // // Serve uploaded files
// // app.use('/uploads', express.static(uploadsDir));

// // // Multer Setup - Local Storage
// // const storage = multer.diskStorage({
// //   destination: (req, file, cb) => {
// //     cb(null, 'uploads/');
// //   },
// //   filename: (req, file, cb) => {
// //     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
// //     cb(null, uniqueSuffix + path.extname(file.originalname));
// //   }
// // });

// // const upload = multer({ 
// //   storage: storage,
// //   fileFilter: (req, file, cb) => {
// //     if (file.mimetype === 'application/pdf') {
// //       cb(null, true);
// //     } else {
// //       cb(new Error('Only PDF files are allowed'), false);
// //     }
// //   }
// // });

// // // MongoDB Connection
// // mongoose.connect(process.env.MONGO_URI)
// //   .then(() => console.log("✅ MongoDB Connected!"))
// //   .catch(err => console.log("❌ MongoDB Error:", err));

// // // --- API Routes ---

// // // Health Check
// // app.get('/api', (req, res) => {
// //   res.json({ status: 'ok', message: 'NexSign API is running' });
// // });

// // // PDF Upload (Local Storage) - AUTH REQUIRED
// // app.post('/api/documents/upload', auth, upload.single('file'), (req, res) => {
// //   console.log("📤 Upload request received");
// //   console.log("User ID:", req.user?.id);
// //   try {
// //     if (!req.file) return res.status(400).json({ message: "File not found" });
    
// //     const fileUrl = `/uploads/${req.file.filename}`;
// //     console.log("📁 File uploaded:", fileUrl);
// //     res.json({ url: fileUrl });
// //   } catch (err) {
// //     console.error("❌ Upload error:", err);
// //     res.status(500).json({ message: "Upload error: " + err.message });
// //   }
// // });

// // // Save/Update Document
// // app.post('/api/documents', auth, async (req, res) => {
// //   try {
// //     let doc;
// //     const data = { ...req.body, owner: req.user.id };
// //     const docId = req.body.id || req.body._id;

// //     if (docId) {
// //       doc = await Document.findByIdAndUpdate(docId, data, { new: true });
// //     } else {
// //       doc = new Document(data);
// //       await doc.save();
      
// //       await AuditLog.create({
// //         document_id: doc._id,
// //         action: 'created',
// //         details: `Document "${doc.title}" created as draft.`
// //       });
// //     }
// //     res.status(201).json(doc);
// //   } catch (err) {
// //     res.status(500).json({ message: "Save error: " + err.message });
// //   }
// // });

// // // Send for Signing
// // app.post('/api/documents/send', auth, async (req, res) => {
// //   try {
// //     const { title, file_url, parties, fields, total_pages, id } = req.body;
// //     const token = crypto.randomBytes(32).toString('hex');
    
// //     const updatedParties = parties.map((p, i) => ({
// //       ...p,
// //       status: i === 0 ? 'sent' : 'pending',
// //       token: i === 0 ? token : null
// //     }));

// //     const docData = {
// //       title, file_url, parties: updatedParties, fields, total_pages,
// //       status: 'in_progress', owner: req.user.id, current_party_index: 0
// //     };

// //     const doc = id ? await Document.findByIdAndUpdate(id, docData, { new: true }) : await Document.create(docData);

// //     await AuditLog.create({
// //       document_id: doc._id,
// //       action: 'sent',
// //       party_name: updatedParties[0].name,
// //       party_email: updatedParties[0].email,
// //       details: `Signing request sent to ${updatedParties[0].name}`
// //     });

// //     const transporter = nodemailer.createTransport({
// //       service: 'gmail',
// //       auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
// //     });

// //     const signLink = `${process.env.FRONTEND_URL}/sign?token=${token}`;

// //     await transporter.sendMail({
// //       from: `"Nexsign" <${process.env.EMAIL_USER}>`,
// //       to: updatedParties[0].email,
// //       subject: `Please sign: ${title}`,
// //       html: `<h2>Hello ${updatedParties[0].name},</h2>
// //              <p>You have been requested to sign <b>${title}</b>.</p>
// //              <a href="${signLink}" style="background:#0ea5e9; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">Sign Document</a>`
// //     });

// //     res.json({ success: true, docId: doc._id });
// //   } catch (err) {
// //     res.status(500).json({ message: "Send error: " + err.message });
// //   }
// // });

// // // Get Document
// // app.get('/api/documents/:id', auth, async (req, res) => {
// //   try {
// //     const doc = await Document.findById(req.params.id);
// //     if (!doc) return res.status(404).json({ message: "Document not found" });
// //     res.json(doc);
// //   } catch (err) {
// //     res.status(500).json({ message: "Error: " + err.message });
// //   }
// // });

// // // ✅ Get User Documents - FIXED
// // app.get('/api/documents/user', auth, async (req, res) => {
// //   try {
// //     console.log("📥 User Documents Request - User ID:", req.user?.id);
    
// //     if (!req.user?.id) {
// //       return res.status(401).json({ message: "Unauthorized" });
// //     }

// //     const docs = await Document.find({ owner: req.user.id }).sort({ createdAt: -1 });
    
// //     console.log("✅ Documents found:", docs.length);
// //     res.json(docs);
// //   } catch (err) {
// //     console.error("❌ Get User Documents Error:", err);
// //     res.status(500).json({ message: "Error fetching documents: " + err.message });
// //   }
// // });

// // // Login
// // app.post('/api/auth/login', async (req, res) => {
// //   try {
// //     const { email, password } = req.body;
// //     const user = await User.findOne({ email });
// //     if (user && await bcrypt.compare(password, user.password)) {
// //       const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
// //       res.json({ token, user: { id: user._id, full_name: user.full_name, email: user.email } });
// //     } else {
// //       res.status(400).json({ message: "Invalid credentials" });
// //     }
// //   } catch (err) {
// //     res.status(500).json({ message: "Error: " + err.message });
// //   }
// // });

// // // Register
// // app.post('/api/auth/register', async (req, res) => {
// //   try {
// //     const { full_name, email, password } = req.body;
// //     const existingUser = await User.findOne({ email });
// //     if (existingUser) return res.status(400).json({ message: "User already exists" });
    
// //     const hashedPassword = await bcrypt.hash(password, 10);
// //     const user = new User({ full_name, email, password: hashedPassword });
// //     await user.save();
    
// //     const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
// //     res.json({ token, user: { id: user._id, full_name: user.full_name, email: user.email } });
// //   } catch (err) {
// //     res.status(500).json({ message: "Error: " + err.message });
// //   }
// // });

// // // Sign Document
// // app.get('/api/documents/sign/:token', async (req, res) => {
// //   try {
// //     const doc = await Document.findOne({ 'parties.token': req.params.token });
// //     if (!doc) return res.status(404).json({ message: "Invalid token" });
    
// //     const party = doc.parties.find(p => p.token === req.params.token);
// //     if (!party) return res.status(404).json({ message: "Party not found" });
    
// //     res.json({ 
// //       document: doc, 
// //       party: party,
// //       signLink: `${process.env.FRONTEND_URL}/sign?token=${req.params.token}`
// //     });
// //   } catch (err) {
// //     res.status(500).json({ message: "Error: " + err.message });
// //   }
// // });

// // // PDF Proxy Route - Local File থেকে PDF সার্ভ করবে
// // app.get('/api/documents/proxy/:filename', async (req, res) => {
// //   try {
// //     const { filename } = req.params;
// //     const filePath = path.join(__dirname, 'uploads', filename);
    
// //     console.log("📥 Proxy Request:", req.path);
// //     console.log("📥 File Path:", filePath);
    
// //     if (!fs.existsSync(filePath)) {
// //       console.error("❌ File not found:", filePath);
// //       return res.status(404).json({ message: "PDF not found" });
// //     }
    
// //     const fileBuffer = fs.readFileSync(filePath);
// //     console.log("✅ PDF sent successfully, size:", fileBuffer.length, "bytes");
// //     res.set('Content-Type', 'application/pdf');
// //     res.set('Access-Control-Allow-Origin', '*');
// //     res.send(fileBuffer);
// //   } catch (err) {
// //     console.error("❌ PDF Proxy Error:", err);
// //     res.status(500).json({ message: "Error fetching PDF" });
// //   }
// // });

// // // ⚠️ PORT 5001 ব্যবহার করুন
// // const PORT = process.env.PORT || 5001;
// // app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


// // const express = require('express');
// // const mongoose = require('mongoose');
// // const cors = require('cors');
// // const bcrypt = require('bcryptjs');
// // const jwt = require('jsonwebtoken');
// // const multer = require('multer');
// // const path = require('path');
// // const fs = require('fs');
// // const nodemailer = require('nodemailer');
// // const crypto = require('crypto');

// // const User = require('./models/User');
// // const Document = require('./models/Document');
// // const AuditLog = require('./models/AuditLog');
// // const auth = require('./middleware/auth');
// // require('dotenv').config();

// // const app = express();

// // // ⚠️ CORS - FIXED
// // app.use(cors({
// //   origin: ['http://localhost:5173', 'http://localhost:3000'],
// //   credentials: true,
// //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
// //   allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
// // }));

// // // Request logging for debugging
// // app.use((req, res, next) => {
// //   console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
// //   console.log('Authorization Header:', req.headers.authorization);
// //   next();
// // });

// // app.use(express.json());
// // app.use(express.urlencoded({ extended: true }));

// // // Create uploads folder if not exists
// // const uploadsDir = path.join(__dirname, 'uploads');
// // if (!fs.existsSync(uploadsDir)) {
// //   fs.mkdirSync(uploadsDir, { recursive: true });
// // }

// // // Serve uploaded files
// // app.use('/uploads', express.static(uploadsDir));

// // // Multer Setup - Local Storage
// // const storage = multer.diskStorage({
// //   destination: (req, file, cb) => {
// //     cb(null, 'uploads/');
// //   },
// //   filename: (req, file, cb) => {
// //     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
// //     cb(null, uniqueSuffix + path.extname(file.originalname));
// //   }
// // });

// // const upload = multer({ 
// //   storage: storage,
// //   fileFilter: (req, file, cb) => {
// //     if (file.mimetype === 'application/pdf') {
// //       cb(null, true);
// //     } else {
// //       cb(new Error('Only PDF files are allowed'), false);
// //     }
// //   }
// // });

// // // MongoDB Connection
// // mongoose.connect(process.env.MONGO_URI)
// //   .then(() => console.log("✅ MongoDB Connected!"))
// //   .catch(err => console.log("❌ MongoDB Error:", err));

// // // --- API Routes ---

// // // Health Check
// // app.get('/api', (req, res) => {
// //   res.json({ status: 'ok', message: 'NexSign API is running' });
// // });

// // // PDF Upload (Local Storage) - AUTH REQUIRED
// // app.post('/api/documents/upload', auth, upload.single('file'), (req, res) => {
// //   console.log("📤 Upload request received");
// //   console.log("User ID:", req.user?.id);
// //   try {
// //     if (!req.file) return res.status(400).json({ message: "File not found" });
    
// //     const fileUrl = `/uploads/${req.file.filename}`;
// //     console.log("📁 File uploaded:", fileUrl);
// //     res.json({ url: fileUrl });
// //   } catch (err) {
// //     console.error("❌ Upload error:", err);
// //     res.status(500).json({ message: "Upload error: " + err.message });
// //   }
// // });

// // // Save/Update Document
// // app.post('/api/documents', auth, async (req, res) => {
// //   try {
// //     let doc;
// //     const data = { ...req.body, owner: req.user.id };
// //     const docId = req.body.id || req.body._id;

// //     if (docId) {
// //       doc = await Document.findByIdAndUpdate(docId, data, { new: true });
// //     } else {
// //       doc = new Document(data);
// //       await doc.save();
      
// //       await AuditLog.create({
// //         document_id: doc._id,
// //         action: 'created',
// //         details: `Document "${doc.title}" created as draft.`
// //       });
// //     }
// //     res.status(201).json(doc);
// //   } catch (err) {
// //     res.status(500).json({ message: "Save error: " + err.message });
// //   }
// // });

// // // Send for Signing
// // app.post('/api/documents/send', auth, async (req, res) => {
// //   try {
// //     const { title, file_url, parties, fields, total_pages, id } = req.body;
// //     const token = crypto.randomBytes(32).toString('hex');
    
// //     const updatedParties = parties.map((p, i) => ({
// //       ...p,
// //       status: i === 0 ? 'sent' : 'pending',
// //       token: i === 0 ? token : null
// //     }));

// //     const docData = {
// //       title, file_url, parties: updatedParties, fields, total_pages,
// //       status: 'in_progress', owner: req.user.id, current_party_index: 0
// //     };

// //     const doc = id ? await Document.findByIdAndUpdate(id, docData, { new: true }) : await Document.create(docData);

// //     await AuditLog.create({
// //       document_id: doc._id,
// //       action: 'sent',
// //       party_name: updatedParties[0].name,
// //       party_email: updatedParties[0].email,
// //       details: `Signing request sent to ${updatedParties[0].name}`
// //     });

// //     const transporter = nodemailer.createTransport({
// //       service: 'gmail',
// //       auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
// //     });

// //     const signLink = `${process.env.FRONTEND_URL}/sign?token=${token}`;

// //     await transporter.sendMail({
// //       from: `"Nexsign" <${process.env.EMAIL_USER}>`,
// //       to: updatedParties[0].email,
// //       subject: `Please sign: ${title}`,
// //       html: `<h2>Hello ${updatedParties[0].name},</h2>
// //              <p>You have been requested to sign <b>${title}</b>.</p>
// //              <a href="${signLink}" style="background:#0ea5e9; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">Sign Document</a>`
// //     });

// //     res.json({ success: true, docId: doc._id });
// //   } catch (err) {
// //     res.status(500).json({ message: "Send error: " + err.message });
// //   }
// // });

// // // Get Document
// // app.get('/api/documents/:id', auth, async (req, res) => {
// //   try {
// //     const doc = await Document.findById(req.params.id);
// //     if (!doc) return res.status(404).json({ message: "Document not found" });
// //     res.json(doc);
// //   } catch (err) {
// //     res.status(500).json({ message: "Error: " + err.message });
// //   }
// // });

// // // ✅ Get User Documents - FIXED
// // app.get('/api/documents/user', auth, async (req, res) => {
// //   try {
// //     console.log("📥 User Documents Request - User ID:", req.user?.id);
    
// //     if (!req.user?.id) {
// //       return res.status(401).json({ message: "Unauthorized" });
// //     }

// //     const docs = await Document.find({ owner: req.user.id }).sort({ createdAt: -1 });
    
// //     console.log("✅ Documents found:", docs.length);
// //     res.json(docs);
// //   } catch (err) {
// //     console.error("❌ Get User Documents Error:", err);
// //     res.status(500).json({ message: "Error fetching documents: " + err.message });
// //   }
// // });

// // // Login
// // app.post('/api/auth/login', async (req, res) => {
// //   try {
// //     const { email, password } = req.body;
// //     const user = await User.findOne({ email });
// //     if (user && await bcrypt.compare(password, user.password)) {
// //       const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
// //       res.json({ token, user: { id: user._id, full_name: user.full_name, email: user.email } });
// //     } else {
// //       res.status(400).json({ message: "Invalid credentials" });
// //     }
// //   } catch (err) {
// //     res.status(500).json({ message: "Error: " + err.message });
// //   }
// // });

// // // Register
// // app.post('/api/auth/register', async (req, res) => {
// //   try {
// //     const { full_name, email, password } = req.body;
// //     const existingUser = await User.findOne({ email });
// //     if (existingUser) return res.status(400).json({ message: "User already exists" });
    
// //     const hashedPassword = await bcrypt.hash(password, 10);
// //     const user = new User({ full_name, email, password: hashedPassword });
// //     await user.save();
    
// //     const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
// //     res.json({ token, user: { id: user._id, full_name: user.full_name, email: user.email } });
// //   } catch (err) {
// //     res.status(500).json({ message: "Error: " + err.message });
// //   }
// // });

// // // Sign Document
// // app.get('/api/documents/sign/:token', async (req, res) => {
// //   try {
// //     const doc = await Document.findOne({ 'parties.token': req.params.token });
// //     if (!doc) return res.status(404).json({ message: "Invalid token" });
    
// //     const party = doc.parties.find(p => p.token === req.params.token);
// //     if (!party) return res.status(404).json({ message: "Party not found" });
    
// //     res.json({ 
// //       document: doc, 
// //       party: party,
// //       signLink: `${process.env.FRONTEND_URL}/sign?token=${req.params.token}`
// //     });
// //   } catch (err) {
// //     res.status(500).json({ message: "Error: " + err.message });
// //   }
// // });

// // // PDF Proxy Route - Local File থেকে PDF সার্ভ করবে
// // app.get('/api/documents/proxy/:filename', async (req, res) => {
// //   try {
// //     const { filename } = req.params;
// //     const filePath = path.join(__dirname, 'uploads', filename);
    
// //     console.log("📥 Proxy Request:", req.path);
// //     console.log("📥 File Path:", filePath);
    
// //     if (!fs.existsSync(filePath)) {
// //       console.error("❌ File not found:", filePath);
// //       return res.status(404).json({ message: "PDF not found" });
// //     }
    
// //     const fileBuffer = fs.readFileSync(filePath);
// //     console.log("✅ PDF sent successfully, size:", fileBuffer.length, "bytes");
// //     res.set('Content-Type', 'application/pdf');
// //     res.set('Access-Control-Allow-Origin', '*');
// //     res.send(fileBuffer);
// //   } catch (err) {
// //     console.error("❌ PDF Proxy Error:", err);
// //     res.status(500).json({ message: "Error fetching PDF" });
// //   }
// // });

// // // ⚠️ PORT 5001 ব্যবহার করুন
// // const PORT = process.env.PORT || 5001;
// // app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
// // const express = require('express');
// // const mongoose = require('mongoose');
// // const cors = require('cors');
// // const bcrypt = require('bcryptjs');
// // const jwt = require('jsonwebtoken');
// // const multer = require('multer');
// // const { v4: uuidv4 } = require('uuid');
// // const { v2: cloudinary } = require('cloudinary');
// // const crypto = require('crypto');
// // const fs = require('fs');
// // const path = require('path');

// // const User = require('./models/User');
// // const Document = require('./models/Document');
// // const AuditLog = require('./models/AuditLog');
// // const auth = require('./middleware/auth');

// // require('dotenv').config();

// // // ✅ Cloudinary Configuration
// // cloudinary.config({
// //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
// //   api_key: process.env.CLOUDINARY_API_KEY,
// //   api_secret: process.env.CLOUDINARY_API_SECRET
// // });

// // const app = express();

// // // ✅ CORS
// // app.use(cors({
// //   origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:3000'],
// //   credentials: true,
// //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
// //   allowedHeaders: ['Content-Type', 'Authorization']
// // }));

// // app.use(express.json());
// // app.use(express.urlencoded({ extended: true }));

// // // Create uploads folder
// // const uploadsDir = path.join(__dirname, 'uploads');
// // if (!fs.existsSync(uploadsDir)) {
// //   fs.mkdirSync(uploadsDir, { recursive: true });
// // }

// // // Multer Setup - Memory Storage for Cloudinary
// // const storage = multer.memoryStorage();
// // const upload = multer({ 
// //   storage: storage,
// //   fileFilter: (req, file, cb) => {
// //     if (file.mimetype === 'application/pdf') {
// //       cb(null, true);
// //     } else {
// //       cb(new Error('Only PDF files are allowed'), false);
// //     }
// //   }
// // });

// // // MongoDB Connection
// // mongoose.connect(process.env.MONGO_URI)
// //   .then(() => console.log("✅ MongoDB Connected!"))
// //   .catch(err => console.log("❌ MongoDB Error:", err));

// // // --- API Routes ---

// // // Health Check
// // app.get('/api', (req, res) => {
// //   res.json({ status: 'ok', message: 'NexSign API is running' });
// // });

// // // ✅ PDF Upload to Cloudinary - FIXED (Auto-save document)
// // app.post('/api/documents/upload', auth, upload.single('file'), async (req, res) => {
// //   console.log("📤 Upload request received");
// //   console.log("User ID:", req.user?.id);
  
// //   try {
// //     if (!req.file) {
// //       console.log("❌ No file uploaded");
// //       return res.status(400).json({ message: "File not found" });
// //     }
    
// //     console.log("📁 File details:", {
// //       originalname: req.file.originalname,
// //       size: req.file.size,
// //       mimetype: req.file.mimetype
// //     });
    
// //     // ✅ Save file temporarily to disk
// //     const tempPath = path.join(__dirname, 'uploads', `temp_${Date.now()}_${req.file.originalname}`);
// //     fs.writeFileSync(tempPath, req.file.buffer);
    
// //     console.log("📁 Temp file saved:", tempPath);
    
// //     // ✅ Upload to Cloudinary
// //     const result = await cloudinary.uploader.upload(tempPath, {
// //       resource_type: 'raw',
// //       public_id: `nexsign/${Date.now()}-${uuidv4()}`,
// //       folder: 'documents',
// //       format: 'pdf'
// //     });
    
// //     // ✅ Delete temporary file
// //     fs.unlinkSync(tempPath);
// //     console.log("📁 Temp file deleted");
    
// //     const fileUrl = result.secure_url;
    
// //     // ✅ Extract fileId from URL
// //     const fileId = fileUrl.split('/').pop();
// //     console.log("📁 File ID:", fileId);
    
// //     // ✅ Auto-create document in MongoDB
// //     const newDoc = await Document.create({
// //       title: req.file.originalname.replace('.pdf', ''),
// //       fileUrl,
// //       fileId,
// //       owner: req.user.id,
// //       status: 'draft',
// //       parties: [],
// //       fields: [],
// //       totalPages: 1
// //     });
    
// //     console.log("📁 Document created in MongoDB:", newDoc._id);
// //     console.log("📁 File uploaded to Cloudinary:", fileUrl);
// //     console.log("📁 File size:", req.file.size, "bytes");
    
// //     res.json({ url: fileUrl, fileId, docId: newDoc._id });
// //   } catch (err) {
// //     console.error("❌ Upload error:", err);
// //     console.error("❌ Error details:", err.message);
// //     console.error("❌ Error stack:", err.stack);
// //     res.status(500).json({ message: "Upload error: " + err.message });
// //   }
// // });

// // // ✅ PDF Proxy Endpoint - FIXED (Find by fileId or fileUrl)
// // app.get('/api/documents/proxy/:fileId', async (req, res) => {
// //   try {
// //     const fileId = req.params.fileId;
// //     console.log("📄 Proxy request for:", fileId);
    
// //     // ✅ Find the document by fileId
// //     const doc = await Document.findOne({ fileId });
    
// //     if (doc) {
// //       console.log("📄 Found document by fileId:", doc.fileUrl);
// //       return res.redirect(doc.fileUrl);
// //     }
    
// //     // ✅ If not found, try to find by fileUrl pattern
// //     const docByUrl = await Document.findOne({ 
// //       fileUrl: { $regex: fileId } 
// //     });
    
// //     if (docByUrl) {
// //       console.log("📄 Found document by fileUrl:", docByUrl.fileUrl);
// //       return res.redirect(docByUrl.fileUrl);
// //     }
    
// //     // ✅ If still not found, return 404
// //     console.log("❌ Document not found for fileId:", fileId);
// //     return res.status(404).json({ message: "Document not found" });
// //   } catch (err) {
// //     console.error("❌ Proxy error:", err);
// //     console.error("❌ Error details:", err.message);
// //     res.status(500).json({ message: "Proxy error: " + err.message });
// //   }
// // });

// // // Save/Update Document - FIXED (Save fileId)
// // app.post('/api/documents', auth, async (req, res) => {
// //   try {
// //     const data = { 
// //       ...req.body, 
// //       owner: req.user.id,
// //       fileUrl: req.body.file_url || req.body.fileUrl,
// //       fileId: req.body.file_id || req.body.fileId
// //     };
// //     const docId = req.body.id || req.body._id;

// //     if (docId) {
// //       const doc = await Document.findByIdAndUpdate(docId, data, { new: true });
// //       res.json(doc);
// //     } else {
// //       const doc = new Document(data);
// //       await doc.save();
// //       res.status(201).json(doc);
// //     }
// //   } catch (err) {
// //     res.status(500).json({ message: "Save error: " + err.message });
// //   }
// // });

// // // Update Document
// // app.put('/api/documents/:id', auth, async (req, res) => {
// //   try {
// //     const doc = await Document.findById(req.params.id);
// //     if (!doc) return res.status(404).json({ message: "Document not found" });
// //     if (doc.owner.toString() !== req.user.id.toString()) {
// //       return res.status(403).json({ message: "Unauthorized" });
// //     }

// //     const data = { 
// //       ...req.body, 
// //       fileUrl: req.body.file_url || req.body.fileUrl,
// //       fileId: req.body.file_id || req.body.fileId
// //     };

// //     const updatedDoc = await Document.findByIdAndUpdate(req.params.id, data, { new: true });
// //     res.json(updatedDoc);
// //   } catch (err) {
// //     res.status(500).json({ message: "Update error: " + err.message });
// //   }
// // });

// // // Send for Signing
// // app.post('/api/documents/send', auth, async (req, res) => {
// //   try {
// //     const { title, fileUrl, parties, fields, totalPages, id, fileId } = req.body;
// //     const token = crypto.randomBytes(32).toString('hex');
    
// //     const updatedParties = parties.map((p, i) => ({
// //       ...p,
// //       status: i === 0 ? 'sent' : 'pending',
// //       token: i === 0 ? token : null
// //     }));

// //     const docData = {
// //       title, fileUrl, fileId, parties: updatedParties, fields, totalPages,
// //       status: 'in_progress', owner: req.user.id, currentPartyIndex: 0
// //     };

// //     const doc = id 
// //       ? await Document.findByIdAndUpdate(id, docData, { new: true }) 
// //       : await Document.create(docData);

// //     res.json({ success: true, docId: doc._id });
// //   } catch (err) {
// //     res.status(500).json({ message: "Send error: " + err.message });
// //   }
// // });

// // // Get Document
// // app.get('/api/documents/:id', auth, async (req, res) => {
// //   try {
// //     const doc = await Document.findById(req.params.id);
// //     if (!doc) return res.status(404).json({ message: "Document not found" });
// //     res.json(doc);
// //   } catch (err) {
// //     res.status(500).json({ message: "Error: " + err.message });
// //   }
// // });

// // // Get User Documents
// // app.get('/api/documents/user', auth, async (req, res) => {
// //   try {
// //     const docs = await Document.find({ owner: req.user.id }).sort({ createdAt: -1 });
// //     res.json(docs);
// //   } catch (err) {
// //     res.status(500).json({ message: "Error fetching documents: " + err.message });
// //   }
// // });

// // // Login
// // app.post('/api/auth/login', async (req, res) => {
// //   try {
// //     const { email, password } = req.body;
    
// //     if (!email || !password) {
// //       return res.status(400).json({ message: "Email and password are required" });
// //     }
    
// //     const user = await User.findOne({ email });
    
// //     if (!user) {
// //       return res.status(400).json({ message: "User not found" });
// //     }
    
// //     if (await bcrypt.compare(password, user.password)) {
// //       const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
// //       res.json({ 
// //         token, 
// //         user: { 
// //           id: user._id, 
// //           full_name: user.full_name, 
// //           email: user.email 
// //         } 
// //       });
// //     } else {
// //       res.status(400).json({ message: "Invalid credentials" });
// //     }
// //   } catch (err) {
// //     res.status(500).json({ message: "Error: " + err.message });
// //   }
// // });

// // // ✅ Register - FIXED
// // app.post('/api/auth/register', async (req, res) => {
// //   try {
// //     const { full_name, email, password } = req.body;
    
// //     console.log("📝 Register request:", { full_name, email, password });
    
// //     // ✅ Validate required fields
// //     if (!full_name || !email || !password) {
// //       return res.status(400).json({ 
// //         message: "Missing required fields: full_name, email, password" 
// //       });
// //     }
    
// //     // ✅ Validate email format
// //     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// //     if (!emailRegex.test(email)) {
// //       return res.status(400).json({ 
// //         message: "Invalid email format" 
// //       });
// //     }
    
// //     // ✅ Validate password length
// //     if (password.length < 6) {
// //       return res.status(400).json({ 
// //         message: "Password must be at least 6 characters" 
// //       });
// //     }
    
// //     // ✅ Check if user exists
// //     const existingUser = await User.findOne({ email });
// //     if (existingUser) {
// //       return res.status(400).json({ 
// //         message: "User with this email already exists" 
// //       });
// //     }
    
// //     // ✅ Hash password
// //     const hashedPassword = await bcrypt.hash(password, 10);
    
// //     // ✅ Create user
// //     const user = new User({ 
// //       full_name, 
// //       email, 
// //       password: hashedPassword 
// //     });
    
// //     await user.save();
    
// //     // ✅ Generate token
// //     const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
// //     console.log("✅ User registered:", user.email);
    
// //     res.json({ 
// //       success: true,
// //       token, 
// //       user: { 
// //         id: user._id, 
// //         full_name: user.full_name, 
// //         email: user.email 
// //       } 
// //     });
    
// //   } catch (err) {
// //     console.error("❌ Register error:", err);
// //     res.status(500).json({ 
// //       message: "Registration failed", 
// //       error: err.message 
// //     });
// //   }
// // });

// // // Sign Document
// // app.get('/api/documents/sign/:token', async (req, res) => {
// //   try {
// //     const doc = await Document.findOne({ 'parties.token': req.params.token });
// //     if (!doc) return res.status(404).json({ message: "Invalid token" });
    
// //     const party = doc.parties.find(p => p.token === req.params.token);
// //     if (!party) return res.status(404).json({ message: "Party not found" });
    
// //     res.json({ 
// //       document: doc, 
// //       party: party,
// //       signLink: `${process.env.FRONTEND_URL}/sign?token=${req.params.token}`
// //     });
// //   } catch (err) {
// //     res.status(500).json({ message: "Error: " + err.message });
// //   }
// // });

// // // Sign Document (POST)
// // app.post('/api/documents/sign/:token', auth, async (req, res) => {
// //   try {
// //     const token = req.params.token;
    
// //     const doc = await Document.findOne({ 'parties.token': token });
// //     if (!doc) return res.status(404).json({ message: "Invalid token" });
    
// //     const party = doc.parties.find(p => p.token === token);
// //     if (!party) return res.status(404).json({ message: "Party not found" });
    
// //     party.status = 'signed';
// //     party.signedAt = new Date().toISOString();
    
// //     const allSigned = doc.parties.every(p => p.status === 'signed');
// //     if (allSigned) {
// //       doc.status = 'completed';
// //     }
    
// //     await doc.save();
    
// //     res.json({ success: true, message: "Document signed successfully" });
// //   } catch (err) {
// //     res.status(500).json({ message: "Error: " + err.message });
// //   }
// // });

// // // Delete Document
// // app.delete('/api/documents/:id', auth, async (req, res) => {
// //   try {
// //     const doc = await Document.findById(req.params.id);
// //     if (!doc) return res.status(404).json({ message: "Document not found" });
// //     if (doc.owner.toString() !== req.user.id.toString()) {
// //       return res.status(403).json({ message: "Unauthorized" });
// //     }
    
// //     await doc.deleteOne();
// //     res.json({ message: "Document deleted successfully" });
// //   } catch (err) {
// //     res.status(500).json({ message: "Error: " + err.message });
// //   }
// // });

// // // Error Handler
// // app.use((err, req, res, next) => {
// //   console.error("Server Error:", err);
// //   res.status(500).json({ message: "Internal server error", error: err.message });
// // });

// // // 404 Handler
// // app.use((req, res) => {
// //   res.status(404).json({ message: "Route not found" });
// // });

// // // Start Server
// // const PORT = process.env.PORT || 5001;
// // app.listen(PORT, () => {
// //   console.log(`🚀 Server running on port ${PORT}`);
// //   console.log(`📡 API available at http://localhost:${PORT}/api`);
// // });
// // server/index.js
// // require('dotenv').config();
// // const express = require('express');
// // const cors = require('cors');
// // const mongoose = require('mongoose');
// // const documentRoutes = require('./routes/documentRoutes');

// // const app = express();

// // // Middleware
// // app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
// // app.use(express.json());

// // // ১. মেইন API চেক (এটি আপনার /api 404 ফিক্স করবে)
// // app.get('/api', (req, res) => {
// //   res.json({ 
// //     status: "Online", 
// //     db: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected" 
// //   });
// // });

// // // ২. রাউট মাউন্ট করা
// // app.use('/api/documents', documentRoutes);

// // // MongoDB Connection
// // mongoose.connect(process.env.MONGO_URI)
// //   .then(() => console.log('✅ Connected to MongoDB Atlas'))
// //   .catch(err => console.error('❌ DB Error:', err));

// // // Catch-all 404 for debugging
// // app.use((req, res) => {
// //   console.log(`🔍 Missing Route: ${req.method} ${req.originalUrl}`);
// //   res.status(404).json({ error: "Route not found on server", path: req.originalUrl });
// // });

// // const PORT = 5001;
// // app.listen(PORT, () => console.log(`🚀 Server on: http://localhost:${PORT}`));

// // require('dotenv').config();
// // const express = require('express');
// // const cors = require('cors');
// // const mongoose = require('mongoose');
// // const helmet = require('helmet');

// // // রাউট ইম্পোর্ট (নিশ্চিত করুন এই ফাইলগুলো আপনার routes ফোল্ডারে আছে)
// // const authRoutes = require('./routes/authRoutes'); 
// // const documentRoutes = require('./routes/documentRoutes');
// // const adminRoutes = require('./routes/adminRoutes');

// // const app = express();

// // // ১. সিকিউরিটি মিডলওয়্যার
// // app.use(helmet({
// //   crossOriginResourcePolicy: false, // Cloudinary বা বাইরের রিসোর্স লোড করার জন্য
// // }));

// // // ২. CORS কনফিগারেশন (এটি আপনার মেইন এরর সমাধান করবে)
// // app.use(cors({
// //   origin: 'http://localhost:5173', // আপনার ফ্রন্টএন্ড অরিজিন
// //   credentials: true,
// //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
// //   allowedHeaders: ['Content-Type', 'Authorization']
// // }));
// // app.options('*', cors());

// // // ৩. রিকোয়েস্ট বডি পার্সার
// // app.use(express.json({ limit: '10mb' }));

// // // ৪. ডাটাবেস কানেকশন
// // mongoose.connect(process.env.MONGO_URI)
// //   .then(() => console.log('✅ Connected to MongoDB Atlas'))
// //   .catch(err => console.error('❌ DB Error:', err.message));

// // // ৫. রাউট মাউন্ট করা (অর্ডার খুব গুরুত্বপূর্ণ)
// // app.use('/api/auth', authRoutes);      // লগইন এখন এখানে হিট করবে
// // app.use('/api/documents', documentRoutes);
// // app.use('/api/admin', adminRoutes);

// // // ৬. হেলথ চেক রাউট
// // app.get('/api', (req, res) => {
// //   res.json({ 
// //     status: "Online", 
// //     db: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected" 
// //   });
// // });

// // // ৭. গ্লোবাল এরর হ্যান্ডলার
// // app.use((err, req, res, next) => {
// //   console.error(err.stack);
// //   res.status(500).json({ 
// //     error: 'Server Error', 
// //     message: err.message 
// //   });
// // });

// // // ৮. পোর্ট ফিক্স (ফ্রন্টএন্ডের ৫০০০ পোর্টের রিকোয়েস্টের সাথে ম্যাচ করা হয়েছে)
// // const PORT = 5001; 
// // app.listen(PORT, () => {
// //   console.log(`🚀 NexSign Server running on: http://localhost:${PORT}`);
// // });

// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');
// const helmet = require('helmet');

// // রাউট ইম্পোর্ট
// const authRoutes = require('./routes/authRoutes'); 
// const documentRoutes = require('./routes/documentRoutes');
// const adminRoutes = require('./routes/adminRoutes');

// const app = express();

// // ✅ ১. সিকিউরিটি মিডলওয়্যার (CSP ফিক্স করা হয়েছে)
// app.use(helmet({
//   crossOriginResourcePolicy: { policy: "cross-origin" }, // ক্লাউডিনারি থেকে ইমেজ/পিডিএফ দেখানোর জন্য
//   contentSecurityPolicy: {
//     directives: {
//       "default-src": ["'self'"],
//       "script-src": ["'self'", "'unsafe-inline'", "https://unpkg.com", "https://cdnjs.cloudflare.com"],
//       "connect-src": ["'self'", "http://localhost:5001", "https://res.cloudinary.com"],
//       "img-src": ["'self'", "data:", "blob:", "https://res.cloudinary.com"],
//       "style-src": ["'self'", "'unsafe-inline'"],
//       "frame-src": ["'self'"],
//       "object-src": ["'none'"]
//     },
//   },
// }));

// // ✅ ২. CORS কনফিগারেশন
// app.use(cors({
//   origin: 'http://localhost:5173', 
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));
// app.options('*', cors());

// // ৩. রিকোয়েস্ট বডি পার্সার
// app.use(express.json({ limit: '10mb' }));

// // ৪. ডাটাবেস কানেকশন
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log('✅ Connected to MongoDB Atlas'))
//   .catch(err => console.error('❌ DB Error:', err.message));

// // ৫. রাউট মাউন্ট করা
// app.use('/api/auth', authRoutes);      
// app.use('/api/documents', documentRoutes);
// app.use('/api/admin', adminRoutes);

// // ৬. হেলথ চেক রাউট
// app.get('/api', (req, res) => {
//   res.json({ 
//     status: "Online", 
//     db: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected" 
//   });
// });

// // ৭. গ্লোবাল এরর হ্যান্ডলার
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ 
//     error: 'Server Error', 
//     message: err.message 
//   });
// });

// // ৮. পোর্ট
// const PORT = 5001; 
// app.listen(PORT, () => {
//   console.log(`🚀 NexSign Server running on: http://localhost:${PORT}`);
// });

// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');
// const helmet = require('helmet');

// const authRoutes = require('./routes/authRoutes'); 
// const documentRoutes = require('./routes/documentRoutes');
// const adminRoutes = require('./routes/adminRoutes');

// const app = express();

// // ✅ 1. Updated Security for Cloudinary/Production
// app.use(helmet({
//   crossOriginResourcePolicy: { policy: "cross-origin" },
//   contentSecurityPolicy: false, // Set to false temporarily if you face UI issues, or refine later
// }));

// // ✅ 2. Production CORS
// const allowedOrigins = ['http://localhost:5173', 'https://nexsignfrontend.vercel.app'];
// app.use(cors({
//   origin: (origin, callback) => {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('CORS blocked this request'));
//     }
//   },
//   credentials: true
// }));

// // app.use(express.json({ limit: '10mb' }));
// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ limit: '50mb', extended: true }));
// // ✅ 3. Database with Error Handling
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log('✅ MongoDB Connected'))
//   .catch(err => console.error('❌ MongoDB Connection Error:', err));

// // 4. Routes
// app.get('/', (req, res) => res.send('NexSign Server is Online')); // Fixes "Cannot GET /"
// app.use('/api/auth', authRoutes);      
// app.use('/api/documents', documentRoutes);
// app.use('/api/admin', adminRoutes);

// app.get('/api/health', (req, res) => {
//   res.json({ status: "Online", db: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected" });
// });

// // 5. Global Error Handler
// app.use((err, req, res, next) => {
//   res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
// });

// // ✅ 6. Dynamic Port for Render
// const PORT = process.env.PORT || 10000; 
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });

//vercel deploy

// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');
// const helmet = require('helmet');

// // রাউট ইম্পোর্ট
// const authRoutes = require('./routes/authRoutes'); 
// const documentRoutes = require('./routes/documentRoutes');
// const adminRoutes = require('./routes/adminRoutes');

// const app = express();

// // ✅ ১. সিকিউরিটি মিডলওয়্যার (CSP ফিক্স করা হয়েছে)
// app.use(helmet({
//   crossOriginResourcePolicy: { policy: "cross-origin" }, // ক্লাউডিনারি থেকে ইমেজ/পিডিএফ দেখানোর জন্য
//   contentSecurityPolicy: {
//     directives: {
//       "default-src": ["'self'"],
//       "script-src": ["'self'", "'unsafe-inline'", "https://unpkg.com", "https://cdnjs.cloudflare.com"],
//       "connect-src": ["'self'", "http://localhost:5001", "https://res.cloudinary.com"],
//       "img-src": ["'self'", "data:", "blob:", "https://res.cloudinary.com"],
//       "style-src": ["'self'", "'unsafe-inline'"],
//       "frame-src": ["'self'"],
//       "object-src": ["'none'"]
//     },
//   },
// }));

// // ✅ ২. CORS কনফিগারেশন
// app.use(cors({
//   origin: 'http://localhost:5173', 
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));
// app.options('*', cors());

// // ৩. রিকোয়েস্ট বডি পার্সার
// app.use(express.json({ limit: '10mb' }));

// // ৪. ডাটাবেস কানেকশন
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log('✅ Connected to MongoDB Atlas'))
//   .catch(err => console.error('❌ DB Error:', err.message));

// // ৫. রাউট মাউন্ট করা
// app.use('/api/auth', authRoutes);      
// app.use('/api/documents', documentRoutes);
// app.use('/api/admin', adminRoutes);

// // ৬. হেলথ চেক রাউট
// app.get('/api', (req, res) => {
//   res.json({ 
//     status: "Online", 
//     db: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected" 
//   });
// });

// // ৭. গ্লোবাল এরর হ্যান্ডলার
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ 
//     error: 'Server Error', 
//     message: err.message 
//   });
// });

// // ৮. পোর্ট
// const PORT = 5001; 
// app.listen(PORT, () => {
//   console.log(`🚀 NexSign Server running on: http://localhost:${PORT}`);
// });
// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');
// const helmet = require('helmet');


// require('./models/User');
// require('./models/Document');
// require('./models/AuditLog'); 
// const authRoutes = require('./routes/authRoutes'); 
// const documentRoutes = require('./routes/documentRoutes');
// const adminRoutes = require('./routes/adminRoutes');

// const app = express();

// // ১. হেলমেট সিকিউরিটি (Cloudinary ইমেজ রেন্ডারিং এর জন্য)
// app.use(helmet({
//   crossOriginResourcePolicy: { policy: "cross-origin" },
//   contentSecurityPolicy: false,
// }));

// // ২. উন্নত CORS কনফিগারেশন
// const allowedOrigins = [
//   'http://localhost:5173', 
//   'https://nexsignfrontend.vercel.app',
//   'https://nexsignfrontend-git-main-bisal-sahas-projects.vercel.app'
// ];

// app.use(cors({
//   origin: (origin, callback) => {
//     // অরিজিন চেক লজিক
//     if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
//       callback(null, true);
//     } else {
//       callback(new Error('CORS blocked this request'));
//     }
//   },
//   credentials: true, // এটি বাধ্যতামূলক যেহেতু ফ্রন্টএন্ডে withCredentials: true আছে
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
// }));

// // ৩. প্রি-ফ্লাইট (OPTIONS) রিকোয়েস্ট গ্লোবাল হ্যান্ডলার
// app.options('*', cors());

// // ৪. পে-লোড লিমিট মিডলওয়্যার
// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ limit: '50mb', extended: true }));

// // ৫. ডাটাবেস কানেকশন
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log('✅ MongoDB Connected'))
//   .catch(err => console.error('❌ MongoDB Connection Error:', err));

// // ৬. রাউটস
// app.get('/', (req, res) => res.send('NexSign Server is Online'));
// app.use('/api/auth', authRoutes);      
// app.use('/api/documents', documentRoutes);
// app.use('/api/admin', adminRoutes);

// app.get('/api/health', (req, res) => {
//   res.json({ status: "Online", db: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected" });
// });

// // ৭. গ্লোবাল এরর হ্যান্ডলার
// app.use((err, req, res, next) => {
//   const status = err.status || 500;
//   res.status(status).json({ error: err.message || 'Internal Server Error' });
// });

// const PORT = process.env.PORT || 5001;

// if (process.env.NODE_ENV !== 'production') {
//   app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
// }

// module.exports = app;




// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');
// const helmet = require('helmet');

// // ১. মডেল ইমপোর্ট (কানেকশনের আগে ইমপোর্ট করা ভালো)
// require('./models/User');
// require('./models/Document');
// require('./models/AuditLog'); 

// const authRoutes = require('./routes/authRoutes'); 
// const documentRoutes = require('./routes/documentRoutes');
// const adminRoutes = require('./routes/adminRoutes');
// const feedbackRoutes = require('./routes/feedbackRoutes');
// const app = express();

// // ২. হেলমেট ও সিকিউরিটি
// app.use(helmet({
//   crossOriginResourcePolicy: { policy: "cross-origin" },
//   contentSecurityPolicy: false,
// }));

// // ৩. CORS কনফিগারেশন
// const allowedOrigins = [
//   'http://localhost:5173', 
//   'https://nexsignfrontend.vercel.app',
//   'https://nexsignfrontend-git-main-bisal-sahas-projects.vercel.app'
// ];

// app.use(cors({
//   origin: (origin, callback) => {
//     if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
//       callback(null, true);
//     } else {
//       callback(new Error('CORS blocked this request'));
//     }
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
// }));

// app.options('*', cors());

// // ৪. পে-লোড লিমিট
// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ limit: '50mb', extended: true }));

// // ৫. ডাটাবেস কানেকশন হ্যান্ডলার (Vercel অপ্টিমাইজড)
// const connectDB = async () => {
//   // যদি আগে থেকেই কানেক্টেড থাকে তবে নতুন করে কানেক্ট হবে না
//   if (mongoose.connection.readyState >= 1) return;

//   try {
//     await mongoose.connect(process.env.MONGO_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       serverSelectionTimeoutMS: 5000, // ৫ সেকেন্ড পর টাইমআউট
//       socketTimeoutMS: 45000,
//     });
//     console.log('✅ MongoDB Connected');
//   } catch (err) {
//     console.error('❌ MongoDB Connection Error:', err.message);
//     // সার্ভারলেস ফাংশনে এরর থ্রো করা উচিত যাতে বাফারিং না হয়
//     throw new Error('Database connection failed');
//   }
// };

// // কানেকশন মিডলওয়্যার (প্রতিটি রিকোয়েস্টে কানেকশন নিশ্চিত করবে)
// app.use(async (req, res, next) => {
//   try {
//     await connectDB();
//     next();
//   } catch (err) {
//     res.status(503).json({ error: "Service Unavailable: Database Connection Error" });
//   }
// });

// // ৬. রাউটস
// app.get('/', (req, res) => res.send('NexSign Server is Online'));
// app.use('/api/auth', authRoutes);      
// app.use('/api/documents', documentRoutes);
// app.use('/api/admin', adminRoutes);

// app.get('/api/health', (req, res) => {
//   res.json({ 
//     status: "Online", 
//     db: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected" 
//   });
// });
// app.use('/api/feedback', feedbackRoutes);

// // ৭. গ্লোবাল এরর হ্যান্ডলার
// app.use((err, req, res, next) => {
//   console.error("Global Error Log:", err.stack);
//   const status = err.status || 500;
//   res.status(status).json({ 
//     error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message 
//   });
// });


// // লোকাল সার্ভার লজিক
// if (process.env.NODE_ENV !== 'production') {
//   const PORT = process.env.PORT || 5001;
//   app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
// }


// //google login

// app.use("/api/auth", authRoutes);

// module.exports = app;


require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');

// মডেল ইমপোর্ট
require('./models/User');
require('./models/Document');
require('./models/AuditLog'); 

const authRoutes = require('./routes/authRoutes'); 
const documentRoutes = require('./routes/documentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

const app = express();

// ১. সিকিউরিটি এবং মিডলওয়্যার
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  // এই নিচের লাইনটি যোগ করুন 🌟
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }, 
  contentSecurityPolicy: false,
}));
const allowedOrigins = [
  'http://localhost:5173', 
  'https://nexsignfrontend.vercel.app',
  'https://nexsignfrontend-git-main-bisal-sahas-projects.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('CORS blocked this request'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ২. ডাটাবেস কানেকশন (Vercel-এর জন্য অপ্টিমাইজড)
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Error:', err.message);
    throw new Error('Database connection failed');
  }
};

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({ error: "Service Unavailable" });
  }
});

// ৩. রাউটস
app.get('/', (req, res) => res.send('NexSign Server is Online'));
app.use('/api/auth', authRoutes);      
app.use('/api/documents', documentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feedback', feedbackRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: "Online", 
    db: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected" 
  });
});

// ৪. গ্লোবাল এরর হ্যান্ডলার
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(err.status || 500).json({ 
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message 
  });
});

// ৫. লোকাল সার্ভার রান
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

module.exports = app;