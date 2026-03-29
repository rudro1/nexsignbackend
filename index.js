
// // // // // const User = require('./models/User');
// // // // // const Document = require('./models/Document');
// // // // // const AuditLog = require('./models/AuditLog');
// // // // // const auth = require('./middleware/auth');
// // // // // require('dotenv').config();

// // // // // const app = express();

// // // // // // ⚠️ CORS MUST BE THE VERY FIRST MIDDLEWARE
// // // // // app.use(cors({
// // // // //   origin: true,
// // // // //   credentials: true,
// // // // //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
// // // // //   allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
// // // // // }));

// // // // // // Request logging for debugging
// // // // // app.use((req, res, next) => {
// // // // //   console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
// // // // //   next();
// // // // // });

// // // // // app.use(express.json());
// // // // // app.use(express.urlencoded({ extended: true }));

// // // // // // Cloudinary Configuration
// // // // // cloudinary.config({
// // // // //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
// // // // //   api_key: process.env.CLOUDINARY_API_KEY,
// // // // //   api_secret: process.env.CLOUDINARY_API_SECRET
// // // // // });

// // // // // const storage = new CloudinaryStorage({
// // // // //   cloudinary: cloudinary,
// // // // //   params: {
// // // // //     folder: 'nexsign_pdfs',
// // // // //     resource_type: 'raw',
// // // // //     format: async () => 'pdf',
// // // // //   },
// // // // // });
// // // // // const upload = multer({ storage: storage });

// // // // // // MongoDB Connection
// // // // // mongoose.connect(process.env.MONGO_URI)
// // // // //   .then(() => console.log("✅ MongoDB Connected!"))
// // // // //   .catch(err => console.log("❌ MongoDB Error:", err));

// // // // // // --- API Routes ---

// // // // // // Health Check
// // // // // app.get('/api', (req, res) => {
// // // // //   res.json({ status: 'ok', message: 'NexSign API is running' });
// // // // // });

// // // // // // PDF Upload
// // // // // app.post('/api/documents/upload', auth, upload.single('file'), (req, res) => {
// // // // //   console.log("📤 Upload request received");
// // // // //   try {
// // // // //     if (!req.file) return res.status(400).json({ message: "File not found" });
// // // // //     console.log("📁 File uploaded:", req.file.path);
// // // // //     res.json({ url: req.file.path });
// // // // //   } catch (err) {
// // // // //     console.error("❌ Upload error:", err);
// // // // //     res.status(500).json({ message: "Upload error: " + err.message });
// // // // //   }
// // // // // });

// // // // // // Save/Update Document
// // // // // app.post('/api/documents', auth, async (req, res) => {
// // // // //   try {
// // // // //     let doc;
// // // // //     const data = { ...req.body, owner: req.user.id };
// // // // //     const docId = req.body.id || req.body._id;

// // // // //     if (docId) {
// // // // //       doc = await Document.findByIdAndUpdate(docId, data, { new: true });
// // // // //     } else {
// // // // //       doc = new Document(data);
// // // // //       await doc.save();
      
// // // // //       await AuditLog.create({
// // // // //         document_id: doc._id,
// // // // //         action: 'created',
// // // // //         details: `Document "${doc.title}" created as draft.`
// // // // //       });
// // // // //     }
// // // // //     res.status(201).json(doc);
// // // // //   } catch (err) {
// // // // //     res.status(500).json({ message: "Save error: " + err.message });
// // // // //   }
// // // // // });

// // // // // // Send for Signing
// // // // // app.post('/api/documents/send', auth, async (req, res) => {
// // // // //   try {
// // // // //     const { title, file_url, parties, fields, total_pages, id } = req.body;
// // // // //     const token = crypto.randomBytes(32).toString('hex');
    
// // // // //     const updatedParties = parties.map((p, i) => ({
// // // // //       ...p,
// // // // //       status: i === 0 ? 'sent' : 'pending',
// // // // //       token: i === 0 ? token : null
// // // // //     }));

// // // // //     const docData = {
// // // // //       title, file_url, parties: updatedParties, fields, total_pages,
// // // // //       status: 'in_progress', owner: req.user.id, current_party_index: 0
// // // // //     };

// // // // //     const doc = id ? await Document.findByIdAndUpdate(id, docData, { new: true }) : await Document.create(docData);

// // // // //     await AuditLog.create({
// // // // //       document_id: doc._id,
// // // // //       action: 'sent',
// // // // //       party_name: updatedParties[0].name,
// // // // //       party_email: updatedParties[0].email,
// // // // //       details: `Signing request sent to ${updatedParties[0].name}`
// // // // //     });

// // // // //     const transporter = nodemailer.createTransport({
// // // // //       service: 'gmail',
// // // // //       auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
// // // // //     });

// // // // //     const signLink = `${process.env.FRONTEND_URL}/sign?token=${token}`;

// // // // //     await transporter.sendMail({
// // // // //       from: `"Nexsign" <${process.env.EMAIL_USER}>`,
// // // // //       to: updatedParties[0].email,
// // // // //       subject: `Please sign: ${title}`,
// // // // //       html: `<h2>Hello ${updatedParties[0].name},</h2>
// // // // //              <p>You have been requested to sign <b>${title}</b>.</p>
// // // // //              <a href="${signLink}" style="background:#0ea5e9; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">Sign Document</a>`
// // // // //     });

// // // // //     res.json({ success: true, docId: doc._id });
// // // // //   } catch (err) {
// // // // //     res.status(500).json({ message: "Send error: " + err.message });
// // // // //   }
// // // // // });

// // // // // // Get Document
// // // // // app.get('/api/documents/:id', auth, async (req, res) => {
// // // // //   try {
// // // // //     const doc = await Document.findById(req.params.id);
// // // // //     if (!doc) return res.status(404).json({ message: "Document not found" });
// // // // //     res.json(doc);
// // // // //   } catch (err) {
// // // // //     res.status(500).json({ message: "Error: " + err.message });
// // // // //   }
// // // // // });

// // // // // // Get User Documents
// // // // // app.get('/api/documents/user', auth, async (req, res) => {
// // // // //   try {
// // // // //     const docs = await Document.find({ owner: req.user.id }).sort({ createdAt: -1 });
// // // // //     res.json(docs);
// // // // //   } catch (err) {
// // // // //     res.status(500).json({ message: "Error: " + err.message });
// // // // //   }
// // // // // });

// // // // // // Login
// // // // // app.post('/api/auth/login', async (req, res) => {
// // // // //   try {
// // // // //     const { email, password } = req.body;
// // // // //     const user = await User.findOne({ email });
// // // // //     if (user && await bcrypt.compare(password, user.password)) {
// // // // //       const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
// // // // //       res.json({ token, user: { id: user._id, full_name: user.full_name, email: user.email } });
// // // // //     } else {
// // // // //       res.status(400).json({ message: "Invalid credentials" });
// // // // //     }
// // // // //   } catch (err) {
// // // // //     res.status(500).json({ message: "Error: " + err.message });
// // // // //   }
// // // // // });

// // // // // // Register
// // // // // app.post('/api/auth/register', async (req, res) => {
// // // // //   try {
// // // // //     const { full_name, email, password } = req.body;
// // // // //     const existingUser = await User.findOne({ email });
// // // // //     if (existingUser) return res.status(400).json({ message: "User already exists" });
    
// // // // //     const hashedPassword = await bcrypt.hash(password, 10);
// // // // //     const user = new User({ full_name, email, password: hashedPassword });
// // // // //     await user.save();
    
// // // // //     const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
// // // // //     res.json({ token, user: { id: user._id, full_name: user.full_name, email: user.email } });
// // // // //   } catch (err) {
// // // // //     res.status(500).json({ message: "Error: " + err.message });
// // // // //   }
// // // // // });

// // // // // // Sign Document
// // // // // app.get('/api/documents/sign/:token', async (req, res) => {
// // // // //   try {
// // // // //     const doc = await Document.findOne({ 'parties.token': req.params.token });
// // // // //     if (!doc) return res.status(404).json({ message: "Invalid token" });
    
// // // // //     const party = doc.parties.find(p => p.token === req.params.token);
// // // // //     if (!party) return res.status(404).json({ message: "Party not found" });
    
// // // // //     res.json({ 
// // // // //       document: doc, 
// // // // //       party: party,
// // // // //       signLink: `${process.env.FRONTEND_URL}/sign?token=${req.params.token}`
// // // // //     });
// // // // //   } catch (err) {
// // // // //     res.status(500).json({ message: "Error: " + err.message });
// // // // //   }
// // // // // });

// // // // // // ⚠️ PORT 5001 ব্যবহার করুন (5000 এর বদলে)
// // // // // const PORT = process.env.PORT || 5001;
// // // // // app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// // // // const express = require('express');
// // // // const mongoose = require('mongoose');
// // // // const cors = require('cors');
// // // // const bcrypt = require('bcryptjs');
// // // // const jwt = require('jsonwebtoken');
// // // // const multer = require('multer');
// // // // const cloudinary = require('cloudinary').v2;
// // // // const { CloudinaryStorage } = require('multer-storage-cloudinary');
// // // // const nodemailer = require('nodemailer');
// // // // const crypto = require('crypto');
// // // // const fetch = require('node-fetch');

// // // // const User = require('./models/User');
// // // // const Document = require('./models/Document');
// // // // const AuditLog = require('./models/AuditLog');
// // // // const auth = require('./middleware/auth');
// // // // require('dotenv').config();

// // // // const app = express();

// // // // // ⚠️ CORS MUST BE THE VERY FIRST MIDDLEWARE
// // // // app.use(cors({
// // // //   origin: true,
// // // //   credentials: true,
// // // //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
// // // //   allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
// // // // }));

// // // // // Request logging for debugging
// // // // app.use((req, res, next) => {
// // // //   console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
// // // //   next();
// // // // });

// // // // app.use(express.json());
// // // // app.use(express.urlencoded({ extended: true }));

// // // // // Cloudinary Configuration
// // // // cloudinary.config({
// // // //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
// // // //   api_key: process.env.CLOUDINARY_API_KEY,
// // // //   api_secret: process.env.CLOUDINARY_API_SECRET
// // // // });

// // // // const storage = new CloudinaryStorage({
// // // //   cloudinary: cloudinary,
// // // //   params: {
// // // //     folder: 'nexsign_pdfs',
// // // //     resource_type: 'raw',
// // // //     format: async () => 'pdf',
// // // //   },
// // // // });
// // // // const upload = multer({ storage: storage });

// // // // // MongoDB Connection
// // // // mongoose.connect(process.env.MONGO_URI)
// // // //   .then(() => console.log("✅ MongoDB Connected!"))
// // // //   .catch(err => console.log("❌ MongoDB Error:", err));

// // // // // --- API Routes ---

// // // // // Health Check
// // // // app.get('/api', (req, res) => {
// // // //   res.json({ status: 'ok', message: 'NexSign API is running' });
// // // // });

// // // // // PDF Upload
// // // // app.post('/api/documents/upload', auth, upload.single('file'), (req, res) => {
// // // //   console.log("📤 Upload request received");
// // // //   try {
// // // //     if (!req.file) return res.status(400).json({ message: "File not found" });
// // // //     console.log("📁 File uploaded:", req.file.path);
// // // //     res.json({ url: req.file.path });
// // // //   } catch (err) {
// // // //     console.error("❌ Upload error:", err);
// // // //     res.status(500).json({ message: "Upload error: " + err.message });
// // // //   }
// // // // });

// // // // // Save/Update Document
// // // // app.post('/api/documents', auth, async (req, res) => {
// // // //   try {
// // // //     let doc;
// // // //     const data = { ...req.body, owner: req.user.id };
// // // //     const docId = req.body.id || req.body._id;

// // // //     if (docId) {
// // // //       doc = await Document.findByIdAndUpdate(docId, data, { new: true });
// // // //     } else {
// // // //       doc = new Document(data);
// // // //       await doc.save();
      
// // // //       await AuditLog.create({
// // // //         document_id: doc._id,
// // // //         action: 'created',
// // // //         details: `Document "${doc.title}" created as draft.`
// // // //       });
// // // //     }
// // // //     res.status(201).json(doc);
// // // //   } catch (err) {
// // // //     res.status(500).json({ message: "Save error: " + err.message });
// // // //   }
// // // // });

// // // // // Send for Signing
// // // // app.post('/api/documents/send', auth, async (req, res) => {
// // // //   try {
// // // //     const { title, file_url, parties, fields, total_pages, id } = req.body;
// // // //     const token = crypto.randomBytes(32).toString('hex');
    
// // // //     const updatedParties = parties.map((p, i) => ({
// // // //       ...p,
// // // //       status: i === 0 ? 'sent' : 'pending',
// // // //       token: i === 0 ? token : null
// // // //     }));

// // // //     const docData = {
// // // //       title, file_url, parties: updatedParties, fields, total_pages,
// // // //       status: 'in_progress', owner: req.user.id, current_party_index: 0
// // // //     };

// // // //     const doc = id ? await Document.findByIdAndUpdate(id, docData, { new: true }) : await Document.create(docData);

// // // //     await AuditLog.create({
// // // //       document_id: doc._id,
// // // //       action: 'sent',
// // // //       party_name: updatedParties[0].name,
// // // //       party_email: updatedParties[0].email,
// // // //       details: `Signing request sent to ${updatedParties[0].name}`
// // // //     });

// // // //     const transporter = nodemailer.createTransport({
// // // //       service: 'gmail',
// // // //       auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
// // // //     });

// // // //     const signLink = `${process.env.FRONTEND_URL}/sign?token=${token}`;

// // // //     await transporter.sendMail({
// // // //       from: `"Nexsign" <${process.env.EMAIL_USER}>`,
// // // //       to: updatedParties[0].email,
// // // //       subject: `Please sign: ${title}`,
// // // //       html: `<h2>Hello ${updatedParties[0].name},</h2>
// // // //              <p>You have been requested to sign <b>${title}</b>.</p>
// // // //              <a href="${signLink}" style="background:#0ea5e9; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">Sign Document</a>`
// // // //     });

// // // //     res.json({ success: true, docId: doc._id });
// // // //   } catch (err) {
// // // //     res.status(500).json({ message: "Send error: " + err.message });
// // // //   }
// // // // });

// // // // // Get Document
// // // // app.get('/api/documents/:id', auth, async (req, res) => {
// // // //   try {
// // // //     const doc = await Document.findById(req.params.id);
// // // //     if (!doc) return res.status(404).json({ message: "Document not found" });
// // // //     res.json(doc);
// // // //   } catch (err) {
// // // //     res.status(500).json({ message: "Error: " + err.message });
// // // //   }
// // // // });

// // // // // Get User Documents
// // // // app.get('/api/documents/user', auth, async (req, res) => {
// // // //   try {
// // // //     const docs = await Document.find({ owner: req.user.id }).sort({ createdAt: -1 });
// // // //     res.json(docs);
// // // //   } catch (err) {
// // // //     res.status(500).json({ message: "Error: " + err.message });
// // // //   }
// // // // });

// // // // // Login
// // // // app.post('/api/auth/login', async (req, res) => {
// // // //   try {
// // // //     const { email, password } = req.body;
// // // //     const user = await User.findOne({ email });
// // // //     if (user && await bcrypt.compare(password, user.password)) {
// // // //       const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
// // // //       res.json({ token, user: { id: user._id, full_name: user.full_name, email: user.email } });
// // // //     } else {
// // // //       res.status(400).json({ message: "Invalid credentials" });
// // // //     }
// // // //   } catch (err) {
// // // //     res.status(500).json({ message: "Error: " + err.message });
// // // //   }
// // // // });

// // // // // Register
// // // // app.post('/api/auth/register', async (req, res) => {
// // // //   try {
// // // //     const { full_name, email, password } = req.body;
// // // //     const existingUser = await User.findOne({ email });
// // // //     if (existingUser) return res.status(400).json({ message: "User already exists" });
    
// // // //     const hashedPassword = await bcrypt.hash(password, 10);
// // // //     const user = new User({ full_name, email, password: hashedPassword });
// // // //     await user.save();
    
// // // //     const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
// // // //     res.json({ token, user: { id: user._id, full_name: user.full_name, email: user.email } });
// // // //   } catch (err) {
// // // //     res.status(500).json({ message: "Error: " + err.message });
// // // //   }
// // // // });

// // // // // Sign Document
// // // // app.get('/api/documents/sign/:token', async (req, res) => {
// // // //   try {
// // // //     const doc = await Document.findOne({ 'parties.token': req.params.token });
// // // //     if (!doc) return res.status(404).json({ message: "Invalid token" });
    
// // // //     const party = doc.parties.find(p => p.token === req.params.token);
// // // //     if (!party) return res.status(404).json({ message: "Party not found" });
    
// // // //     res.json({ 
// // // //       document: doc, 
// // // //       party: party,
// // // //       signLink: `${process.env.FRONTEND_URL}/sign?token=${req.params.token}`
// // // //     });
// // // //   } catch (err) {
// // // //     res.status(500).json({ message: "Error: " + err.message });
// // // //   }
// // // // });

// // // // // PDF Proxy Route - Cloudinary থেকে PDF সার্ভ করবে
// // // // app.get('/api/documents/proxy/:publicId', async (req, res) => {
// // // //   try {
// // // //     const { publicId } = req.params;
// // // //     const cloudinaryUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${publicId}`;
    
// // // //     const response = await fetch(cloudinaryUrl);
// // // //     if (!response.ok) {
// // // //       return res.status(404).json({ message: "PDF not found" });
// // // //     }
    
// // // //     const arrayBuffer = await response.arrayBuffer();
// // // //     res.set('Content-Type', 'application/pdf');
// // // //     res.set('Access-Control-Allow-Origin', '*');
// // // //     res.send(Buffer.from(arrayBuffer));
// // // //   } catch (err) {
// // // //     console.error("PDF Proxy Error:", err);
// // // //     res.status(500).json({ message: "Error fetching PDF" });
// // // //   }
// // // // });

// // // // // ⚠️ PORT 5001 ব্যবহার করুন
// // // // const PORT = process.env.PORT || 5001;
// // // // app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
// // // // const express = require('express');
// // // // const mongoose = require('mongoose');
// // // // const cors = require('cors');
// // // // const bcrypt = require('bcryptjs');
// // // // const jwt = require('jsonwebtoken');
// // // // const multer = require('multer');
// // // // const path = require('path');
// // // // const fs = require('fs');
// // // // const nodemailer = require('nodemailer');
// // // // const crypto = require('crypto');

// // // // const User = require('./models/User');
// // // // const Document = require('./models/Document');
// // // // const AuditLog = require('./models/AuditLog');
// // // // const auth = require('./middleware/auth');
// // // // require('dotenv').config();

// // // // const app = express();

// // // // // ⚠️ CORS MUST BE THE VERY FIRST MIDDLEWARE
// // // // app.use(cors({
// // // //   origin: true,
// // // //   credentials: true,
// // // //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
// // // //   allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
// // // // }));

// // // // // Request logging for debugging
// // // // app.use((req, res, next) => {
// // // //   console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
// // // //   next();
// // // // });

// // // // app.use(express.json());
// // // // app.use(express.urlencoded({ extended: true }));

// // // // // Create uploads folder if not exists
// // // // const uploadsDir = path.join(__dirname, 'uploads');
// // // // if (!fs.existsSync(uploadsDir)) {
// // // //   fs.mkdirSync(uploadsDir, { recursive: true });
// // // // }

// // // // // Create cmap folder if not exists
// // // // const cmapDir = path.join(__dirname, 'cmaps');
// // // // if (!fs.existsSync(cmapDir)) {
// // // //   fs.mkdirSync(cmapDir, { recursive: true });
// // // // }

// // // // // Serve uploaded files
// // // // app.use('/uploads', express.static(uploadsDir));

// // // // // Serve CMap files
// // // // app.use('/cmaps', express.static(cmapDir));

// // // // // Multer Setup - Local Storage
// // // // const storage = multer.diskStorage({
// // // //   destination: (req, file, cb) => {
// // // //     cb(null, 'uploads/');
// // // //   },
// // // //   filename: (req, file, cb) => {
// // // //     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
// // // //     cb(null, uniqueSuffix + path.extname(file.originalname));
// // // //   }
// // // // });

// // // // const upload = multer({ 
// // // //   storage: storage,
// // // //   fileFilter: (req, file, cb) => {
// // // //     if (file.mimetype === 'application/pdf') {
// // // //       cb(null, true);
// // // //     } else {
// // // //       cb(new Error('Only PDF files are allowed'), false);
// // // //     }
// // // //   }
// // // // });

// // // // // MongoDB Connection
// // // // mongoose.connect(process.env.MONGO_URI)
// // // //   .then(() => console.log("✅ MongoDB Connected!"))
// // // //   .catch(err => console.log("❌ MongoDB Error:", err));

// // // // // --- API Routes ---

// // // // // Health Check
// // // // app.get('/api', (req, res) => {
// // // //   res.json({ status: 'ok', message: 'NexSign API is running' });
// // // // });

// // // // // PDF Upload (Local Storage)
// // // // app.post('/api/documents/upload', auth, upload.single('file'), (req, res) => {
// // // //   console.log("📤 Upload request received");
// // // //   try {
// // // //     if (!req.file) return res.status(400).json({ message: "File not found" });
    
// // // //     // Save file path
// // // //     const fileUrl = `/uploads/${req.file.filename}`;
// // // //     console.log("📁 File uploaded:", fileUrl);
// // // //     res.json({ url: fileUrl });
// // // //   } catch (err) {
// // // //     console.error("❌ Upload error:", err);
// // // //     res.status(500).json({ message: "Upload error: " + err.message });
// // // //   }
// // // // });

// // // // // Save/Update Document
// // // // app.post('/api/documents', auth, async (req, res) => {
// // // //   try {
// // // //     let doc;
// // // //     const data = { ...req.body, owner: req.user.id };
// // // //     const docId = req.body.id || req.body._id;

// // // //     if (docId) {
// // // //       doc = await Document.findByIdAndUpdate(docId, data, { new: true });
// // // //     } else {
// // // //       doc = new Document(data);
// // // //       await doc.save();
      
// // // //       await AuditLog.create({
// // // //         document_id: doc._id,
// // // //         action: 'created',
// // // //         details: `Document "${doc.title}" created as draft.`
// // // //       });
// // // //     }
// // // //     res.status(201).json(doc);
// // // //   } catch (err) {
// // // //     res.status(500).json({ message: "Save error: " + err.message });
// // // //   }
// // // // });

// // // // // Send for Signing
// // // // app.post('/api/documents/send', auth, async (req, res) => {
// // // //   try {
// // // //     const { title, file_url, parties, fields, total_pages, id } = req.body;
// // // //     const token = crypto.randomBytes(32).toString('hex');
    
// // // //     const updatedParties = parties.map((p, i) => ({
// // // //       ...p,
// // // //       status: i === 0 ? 'sent' : 'pending',
// // // //       token: i === 0 ? token : null
// // // //     }));

// // // //     const docData = {
// // // //       title, file_url, parties: updatedParties, fields, total_pages,
// // // //       status: 'in_progress', owner: req.user.id, current_party_index: 0
// // // //     };

// // // //     const doc = id ? await Document.findByIdAndUpdate(id, docData, { new: true }) : await Document.create(docData);

// // // //     await AuditLog.create({
// // // //       document_id: doc._id,
// // // //       action: 'sent',
// // // //       party_name: updatedParties[0].name,
// // // //       party_email: updatedParties[0].email,
// // // //       details: `Signing request sent to ${updatedParties[0].name}`
// // // //     });

// // // //     const transporter = nodemailer.createTransport({
// // // //       service: 'gmail',
// // // //       auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
// // // //     });

// // // //     const signLink = `${process.env.FRONTEND_URL}/sign?token=${token}`;

// // // //     await transporter.sendMail({
// // // //       from: `"Nexsign" <${process.env.EMAIL_USER}>`,
// // // //       to: updatedParties[0].email,
// // // //       subject: `Please sign: ${title}`,
// // // //       html: `<h2>Hello ${updatedParties[0].name},</h2>
// // // //              <p>You have been requested to sign <b>${title}</b>.</p>
// // // //              <a href="${signLink}" style="background:#0ea5e9; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">Sign Document</a>`
// // // //     });

// // // //     res.json({ success: true, docId: doc._id });
// // // //   } catch (err) {
// // // //     res.status(500).json({ message: "Send error: " + err.message });
// // // //   }
// // // // });

// // // // // Get Document
// // // // app.get('/api/documents/:id', auth, async (req, res) => {
// // // //   try {
// // // //     const doc = await Document.findById(req.params.id);
// // // //     if (!doc) return res.status(404).json({ message: "Document not found" });
// // // //     res.json(doc);
// // // //   } catch (err) {
// // // //     res.status(500).json({ message: "Error: " + err.message });
// // // //   }
// // // // });

// // // // // Get User Documents
// // // // app.get('/api/documents/user', auth, async (req, res) => {
// // // //   try {
// // // //     const docs = await Document.find({ owner: req.user.id }).sort({ createdAt: -1 });
// // // //     res.json(docs);
// // // //   } catch (err) {
// // // //     res.status(500).json({ message: "Error: " + err.message });
// // // //   }
// // // // });

// // // // // Login
// // // // app.post('/api/auth/login', async (req, res) => {
// // // //   try {
// // // //     const { email, password } = req.body;
// // // //     const user = await User.findOne({ email });
// // // //     if (user && await bcrypt.compare(password, user.password)) {
// // // //       const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
// // // //       res.json({ token, user: { id: user._id, full_name: user.full_name, email: user.email } });
// // // //     } else {
// // // //       res.status(400).json({ message: "Invalid credentials" });
// // // //     }
// // // //   } catch (err) {
// // // //     res.status(500).json({ message: "Error: " + err.message });
// // // //   }
// // // // });

// // // // // Register
// // // // app.post('/api/auth/register', async (req, res) => {
// // // //   try {
// // // //     const { full_name, email, password } = req.body;
// // // //     const existingUser = await User.findOne({ email });
// // // //     if (existingUser) return res.status(400).json({ message: "User already exists" });
    
// // // //     const hashedPassword = await bcrypt.hash(password, 10);
// // // //     const user = new User({ full_name, email, password: hashedPassword });
// // // //     await user.save();
    
// // // //     const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
// // // //     res.json({ token, user: { id: user._id, full_name: user.full_name, email: user.email } });
// // // //   } catch (err) {
// // // //     res.status(500).json({ message: "Error: " + err.message });
// // // //   }
// // // // });

// // // // // Sign Document
// // // // app.get('/api/documents/sign/:token', async (req, res) => {
// // // //   try {
// // // //     const doc = await Document.findOne({ 'parties.token': req.params.token });
// // // //     if (!doc) return res.status(404).json({ message: "Invalid token" });
    
// // // //     const party = doc.parties.find(p => p.token === req.params.token);
// // // //     if (!party) return res.status(404).json({ message: "Party not found" });
    
// // // //     res.json({ 
// // // //       document: doc, 
// // // //       party: party,
// // // //       signLink: `${process.env.FRONTEND_URL}/sign?token=${req.params.token}`
// // // //     });
// // // //   } catch (err) {
// // // //     res.status(500).json({ message: "Error: " + err.message });
// // // //   }
// // // // });

// // // // // PDF Proxy Route - Local File থেকে PDF সার্ভ করবে
// // // // app.get('/api/documents/proxy/:filename', async (req, res) => {
// // // //   try {
// // // //     const { filename } = req.params;
// // // //     const filePath = path.join(__dirname, 'uploads', filename);
    
// // // //     console.log("📥 Proxy Request:", req.path);
// // // //     console.log("📥 File Path:", filePath);
    
// // // //     if (!fs.existsSync(filePath)) {
// // // //       console.error("❌ File not found:", filePath);
// // // //       return res.status(404).json({ message: "PDF not found" });
// // // //     }
    
// // // //     const fileBuffer = fs.readFileSync(filePath);
// // // //     console.log("✅ PDF sent successfully, size:", fileBuffer.length, "bytes");
// // // //     res.set('Content-Type', 'application/pdf');
// // // //     res.set('Access-Control-Allow-Origin', '*');
// // // //     res.send(fileBuffer);
// // // //   } catch (err) {
// // // //     console.error("❌ PDF Proxy Error:", err);
// // // //     res.status(500).json({ message: "Error fetching PDF" });
// // // //   }
// // // // });

// // // // // ⚠️ PORT 5001 ব্যবহার করুন
// // // // const PORT = process.env.PORT || 5001;
// // // // app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
// // // // const express = require('express');
// // // // const mongoose = require('mongoose');
// // // // const cors = require('cors');
// // // // const bcrypt = require('bcryptjs');
// // // // const jwt = require('jsonwebtoken');
// // // // const multer = require('multer');
// // // // const path = require('path');
// // // // const fs = require('fs');
// // // // const nodemailer = require('nodemailer');
// // // // const crypto = require('crypto');

// // // // const User = require('./models/User');
// // // // const Document = require('./models/Document');
// // // // const AuditLog = require('./models/AuditLog');
// // // // const auth = require('./middleware/auth');
// // // // require('dotenv').config();

// // // // const app = express();

// // // // // ⚠️ CORS MUST BE THE VERY FIRST MIDDLEWARE
// // // // app.use(cors({
// // // //   origin: true,
// // // //   credentials: true,
// // // //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
// // // //   allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'Authorization']
// // // // }));

// // // // // Request logging for debugging
// // // // app.use((req, res, next) => {
// // // //   console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
// // // //   console.log('Authorization Header:', req.headers.authorization);
// // // //   next();
// // // // });

// // // // app.use(express.json());
// // // // app.use(express.urlencoded({ extended: true }));

// // // // // Create uploads folder if not exists
// // // // const uploadsDir = path.join(__dirname, 'uploads');
// // // // if (!fs.existsSync(uploadsDir)) {
// // // //   fs.mkdirSync(uploadsDir, { recursive: true });
// // // // }

// // // // // Serve uploaded files
// // // // app.use('/uploads', express.static(uploadsDir));

// // // // // Multer Setup - Local Storage
// // // // const storage = multer.diskStorage({
// // // //   destination: (req, file, cb) => {
// // // //     cb(null, 'uploads/');
// // // //   },
// // // //   filename: (req, file, cb) => {
// // // //     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
// // // //     cb(null, uniqueSuffix + path.extname(file.originalname));
// // // //   }
// // // // });

// // // // const upload = multer({ 
// // // //   storage: storage,
// // // //   fileFilter: (req, file, cb) => {
// // // //     if (file.mimetype === 'application/pdf') {
// // // //       cb(null, true);
// // // //     } else {
// // // //       cb(new Error('Only PDF files are allowed'), false);
// // // //     }
// // // //   }
// // // // });

// // // // // MongoDB Connection
// // // // mongoose.connect(process.env.MONGO_URI)
// // // //   .then(() => console.log("✅ MongoDB Connected!"))
// // // //   .catch(err => console.log("❌ MongoDB Error:", err));

// // // // // --- API Routes ---

// // // // // Health Check
// // // // app.get('/api', (req, res) => {
// // // //   res.json({ status: 'ok', message: 'NexSign API is running' });
// // // // });

// // // // // PDF Upload (Local Storage) - AUTH REQUIRED
// // // // app.post('/api/documents/upload', auth, upload.single('file'), (req, res) => {
// // // //   console.log("📤 Upload request received");
// // // //   console.log("User ID:", req.user?.id);
// // // //   try {
// // // //     if (!req.file) return res.status(400).json({ message: "File not found" });
    
// // // //     const fileUrl = `/uploads/${req.file.filename}`;
// // // //     console.log("📁 File uploaded:", fileUrl);
// // // //     res.json({ url: fileUrl });
// // // //   } catch (err) {
// // // //     console.error("❌ Upload error:", err);
// // // //     res.status(500).json({ message: "Upload error: " + err.message });
// // // //   }
// // // // });

// // // // // Save/Update Document
// // // // app.post('/api/documents', auth, async (req, res) => {
// // // //   try {
// // // //     let doc;
// // // //     const data = { ...req.body, owner: req.user.id };
// // // //     const docId = req.body.id || req.body._id;

// // // //     if (docId) {
// // // //       doc = await Document.findByIdAndUpdate(docId, data, { new: true });
// // // //     } else {
// // // //       doc = new Document(data);
// // // //       await doc.save();
      
// // // //       await AuditLog.create({
// // // //         document_id: doc._id,
// // // //         action: 'created',
// // // //         details: `Document "${doc.title}" created as draft.`
// // // //       });
// // // //     }
// // // //     res.status(201).json(doc);
// // // //   } catch (err) {
// // // //     res.status(500).json({ message: "Save error: " + err.message });
// // // //   }
// // // // });

// // // // // Send for Signing
// // // // app.post('/api/documents/send', auth, async (req, res) => {
// // // //   try {
// // // //     const { title, file_url, parties, fields, total_pages, id } = req.body;
// // // //     const token = crypto.randomBytes(32).toString('hex');
    
// // // //     const updatedParties = parties.map((p, i) => ({
// // // //       ...p,
// // // //       status: i === 0 ? 'sent' : 'pending',
// // // //       token: i === 0 ? token : null
// // // //     }));

// // // //     const docData = {
// // // //       title, file_url, parties: updatedParties, fields, total_pages,
// // // //       status: 'in_progress', owner: req.user.id, current_party_index: 0
// // // //     };

// // // //     const doc = id ? await Document.findByIdAndUpdate(id, docData, { new: true }) : await Document.create(docData);

// // // //     await AuditLog.create({
// // // //       document_id: doc._id,
// // // //       action: 'sent',
// // // //       party_name: updatedParties[0].name,
// // // //       party_email: updatedParties[0].email,
// // // //       details: `Signing request sent to ${updatedParties[0].name}`
// // // //     });

// // // //     const transporter = nodemailer.createTransport({
// // // //       service: 'gmail',
// // // //       auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
// // // //     });

// // // //     const signLink = `${process.env.FRONTEND_URL}/sign?token=${token}`;

// // // //     await transporter.sendMail({
// // // //       from: `"Nexsign" <${process.env.EMAIL_USER}>`,
// // // //       to: updatedParties[0].email,
// // // //       subject: `Please sign: ${title}`,
// // // //       html: `<h2>Hello ${updatedParties[0].name},</h2>
// // // //              <p>You have been requested to sign <b>${title}</b>.</p>
// // // //              <a href="${signLink}" style="background:#0ea5e9; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">Sign Document</a>`
// // // //     });

// // // //     res.json({ success: true, docId: doc._id });
// // // //   } catch (err) {
// // // //     res.status(500).json({ message: "Send error: " + err.message });
// // // //   }
// // // // });

// // // // // Get Document
// // // // app.get('/api/documents/:id', auth, async (req, res) => {
// // // //   try {
// // // //     const doc = await Document.findById(req.params.id);
// // // //     if (!doc) return res.status(404).json({ message: "Document not found" });
// // // //     res.json(doc);
// // // //   } catch (err) {
// // // //     res.status(500).json({ message: "Error: " + err.message });
// // // //   }
// // // // });

// // // // // ✅ Get User Documents - FIXED
// // // // app.get('/api/documents/user', auth, async (req, res) => {
// // // //   try {
// // // //     console.log("📥 User Documents Request - User ID:", req.user?.id);
    
// // // //     if (!req.user?.id) {
// // // //       return res.status(401).json({ message: "Unauthorized" });
// // // //     }

// // // //     const docs = await Document.find({ owner: req.user.id }).sort({ createdAt: -1 });
    
// // // //     console.log("✅ Documents found:", docs.length);
// // // //     res.json(docs);
// // // //   } catch (err) {
// // // //     console.error("❌ Get User Documents Error:", err);
// // // //     res.status(500).json({ message: "Error fetching documents: " + err.message });
// // // //   }
// // // // });

// // // // // Login
// // // // app.post('/api/auth/login', async (req, res) => {
// // // //   try {
// // // //     const { email, password } = req.body;
// // // //     const user = await User.findOne({ email });
// // // //     if (user && await bcrypt.compare(password, user.password)) {
// // // //       const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
// // // //       res.json({ token, user: { id: user._id, full_name: user.full_name, email: user.email } });
// // // //     } else {
// // // //       res.status(400).json({ message: "Invalid credentials" });
// // // //     }
// // // //   } catch (err) {
// // // //     res.status(500).json({ message: "Error: " + err.message });
// // // //   }
// // // // });

// // // // // Register
// // // // app.post('/api/auth/register', async (req, res) => {
// // // //   try {
// // // //     const { full_name, email, password } = req.body;
// // // //     const existingUser = await User.findOne({ email });
// // // //     if (existingUser) return res.status(400).json({ message: "User already exists" });
    
// // // //     const hashedPassword = await bcrypt.hash(password, 10);
// // // //     const user = new User({ full_name, email, password: hashedPassword });
// // // //     await user.save();
    
// // // //     const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
// // // //     res.json({ token, user: { id: user._id, full_name: user.full_name, email: user.email } });
// // // //   } catch (err) {
// // // //     res.status(500).json({ message: "Error: " + err.message });
// // // //   }
// // // // });

// // // // // Sign Document
// // // // app.get('/api/documents/sign/:token', async (req, res) => {
// // // //   try {
// // // //     const doc = await Document.findOne({ 'parties.token': req.params.token });
// // // //     if (!doc) return res.status(404).json({ message: "Invalid token" });
    
// // // //     const party = doc.parties.find(p => p.token === req.params.token);
// // // //     if (!party) return res.status(404).json({ message: "Party not found" });
    
// // // //     res.json({ 
// // // //       document: doc, 
// // // //       party: party,
// // // //       signLink: `${process.env.FRONTEND_URL}/sign?token=${req.params.token}`
// // // //     });
// // // //   } catch (err) {
// // // //     res.status(500).json({ message: "Error: " + err.message });
// // // //   }
// // // // });

// // // // // PDF Proxy Route - Local File থেকে PDF সার্ভ করবে
// // // // app.get('/api/documents/proxy/:filename', async (req, res) => {
// // // //   try {
// // // //     const { filename } = req.params;
// // // //     const filePath = path.join(__dirname, 'uploads', filename);
    
// // // //     console.log("📥 Proxy Request:", req.path);
// // // //     console.log("📥 File Path:", filePath);
    
// // // //     if (!fs.existsSync(filePath)) {
// // // //       console.error("❌ File not found:", filePath);
// // // //       return res.status(404).json({ message: "PDF not found" });
// // // //     }
    
// // // //     const fileBuffer = fs.readFileSync(filePath);
// // // //     console.log("✅ PDF sent successfully, size:", fileBuffer.length, "bytes");
// // // //     res.set('Content-Type', 'application/pdf');
// // // //     res.set('Access-Control-Allow-Origin', '*');
// // // //     res.send(fileBuffer);
// // // //   } catch (err) {
// // // //     console.error("❌ PDF Proxy Error:", err);
// // // //     res.status(500).json({ message: "Error fetching PDF" });
// // // //   }
// // // // });

// // // // // ⚠️ PORT 5001 ব্যবহার করুন
// // // // const PORT = process.env.PORT || 5001;
// // // // app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


// // // // const express = require('express');
// // // // const mongoose = require('mongoose');
// // // // const cors = require('cors');
// // // // const bcrypt = require('bcryptjs');
// // // // const jwt = require('jsonwebtoken');
// // // // const multer = require('multer');
// // // // const path = require('path');
// // // // const fs = require('fs');
// // // // const nodemailer = require('nodemailer');
// // // // const crypto = require('crypto');

// // // // const User = require('./models/User');
// // // // const Document = require('./models/Document');
// // // // const AuditLog = require('./models/AuditLog');
// // // // const auth = require('./middleware/auth');
// // // // require('dotenv').config();

// // // // const app = express();

// // // // // ⚠️ CORS - FIXED
// // // // app.use(cors({
// // // //   origin: ['http://localhost:5173', 'http://localhost:3000'],
// // // //   credentials: true,
// // // //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
// // // //   allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
// // // // }));

// // // // // Request logging for debugging
// // // // app.use((req, res, next) => {
// // // //   console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
// // // //   console.log('Authorization Header:', req.headers.authorization);
// // // //   next();
// // // // });

// // // // app.use(express.json());
// // // // app.use(express.urlencoded({ extended: true }));

// // // // // Create uploads folder if not exists
// // // // const uploadsDir = path.join(__dirname, 'uploads');
// // // // if (!fs.existsSync(uploadsDir)) {
// // // //   fs.mkdirSync(uploadsDir, { recursive: true });
// // // // }

// // // // // Serve uploaded files
// // // // app.use('/uploads', express.static(uploadsDir));

// // // // // Multer Setup - Local Storage
// // // // const storage = multer.diskStorage({
// // // //   destination: (req, file, cb) => {
// // // //     cb(null, 'uploads/');
// // // //   },
// // // //   filename: (req, file, cb) => {
// // // //     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
// // // //     cb(null, uniqueSuffix + path.extname(file.originalname));
// // // //   }
// // // // });

// // // // const upload = multer({ 
// // // //   storage: storage,
// // // //   fileFilter: (req, file, cb) => {
// // // //     if (file.mimetype === 'application/pdf') {
// // // //       cb(null, true);
// // // //     } else {
// // // //       cb(new Error('Only PDF files are allowed'), false);
// // // //     }
// // // //   }
// // // // });

// // // // // MongoDB Connection
// // // // mongoose.connect(process.env.MONGO_URI)
// // // //   .then(() => console.log("✅ MongoDB Connected!"))
// // // //   .catch(err => console.log("❌ MongoDB Error:", err));

// // // // // --- API Routes ---

// // // // // Health Check
// // // // app.get('/api', (req, res) => {
// // // //   res.json({ status: 'ok', message: 'NexSign API is running' });
// // // // });

// // // // // PDF Upload (Local Storage) - AUTH REQUIRED
// // // // app.post('/api/documents/upload', auth, upload.single('file'), (req, res) => {
// // // //   console.log("📤 Upload request received");
// // // //   console.log("User ID:", req.user?.id);
// // // //   try {
// // // //     if (!req.file) return res.status(400).json({ message: "File not found" });
    
// // // //     const fileUrl = `/uploads/${req.file.filename}`;
// // // //     console.log("📁 File uploaded:", fileUrl);
// // // //     res.json({ url: fileUrl });
// // // //   } catch (err) {
// // // //     console.error("❌ Upload error:", err);
// // // //     res.status(500).json({ message: "Upload error: " + err.message });
// // // //   }
// // // // });

// // // // // Save/Update Document
// // // // app.post('/api/documents', auth, async (req, res) => {
// // // //   try {
// // // //     let doc;
// // // //     const data = { ...req.body, owner: req.user.id };
// // // //     const docId = req.body.id || req.body._id;

// // // //     if (docId) {
// // // //       doc = await Document.findByIdAndUpdate(docId, data, { new: true });
// // // //     } else {
// // // //       doc = new Document(data);
// // // //       await doc.save();
      
// // // //       await AuditLog.create({
// // // //         document_id: doc._id,
// // // //         action: 'created',
// // // //         details: `Document "${doc.title}" created as draft.`
// // // //       });
// // // //     }
// // // //     res.status(201).json(doc);
// // // //   } catch (err) {
// // // //     res.status(500).json({ message: "Save error: " + err.message });
// // // //   }
// // // // });

// // // // // Send for Signing
// // // // app.post('/api/documents/send', auth, async (req, res) => {
// // // //   try {
// // // //     const { title, file_url, parties, fields, total_pages, id } = req.body;
// // // //     const token = crypto.randomBytes(32).toString('hex');
    
// // // //     const updatedParties = parties.map((p, i) => ({
// // // //       ...p,
// // // //       status: i === 0 ? 'sent' : 'pending',
// // // //       token: i === 0 ? token : null
// // // //     }));

// // // //     const docData = {
// // // //       title, file_url, parties: updatedParties, fields, total_pages,
// // // //       status: 'in_progress', owner: req.user.id, current_party_index: 0
// // // //     };

// // // //     const doc = id ? await Document.findByIdAndUpdate(id, docData, { new: true }) : await Document.create(docData);

// // // //     await AuditLog.create({
// // // //       document_id: doc._id,
// // // //       action: 'sent',
// // // //       party_name: updatedParties[0].name,
// // // //       party_email: updatedParties[0].email,
// // // //       details: `Signing request sent to ${updatedParties[0].name}`
// // // //     });

// // // //     const transporter = nodemailer.createTransport({
// // // //       service: 'gmail',
// // // //       auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
// // // //     });

// // // //     const signLink = `${process.env.FRONTEND_URL}/sign?token=${token}`;

// // // //     await transporter.sendMail({
// // // //       from: `"Nexsign" <${process.env.EMAIL_USER}>`,
// // // //       to: updatedParties[0].email,
// // // //       subject: `Please sign: ${title}`,
// // // //       html: `<h2>Hello ${updatedParties[0].name},</h2>
// // // //              <p>You have been requested to sign <b>${title}</b>.</p>
// // // //              <a href="${signLink}" style="background:#0ea5e9; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">Sign Document</a>`
// // // //     });

// // // //     res.json({ success: true, docId: doc._id });
// // // //   } catch (err) {
// // // //     res.status(500).json({ message: "Send error: " + err.message });
// // // //   }
// // // // });

// // // // // Get Document
// // // // app.get('/api/documents/:id', auth, async (req, res) => {
// // // //   try {
// // // //     const doc = await Document.findById(req.params.id);
// // // //     if (!doc) return res.status(404).json({ message: "Document not found" });
// // // //     res.json(doc);
// // // //   } catch (err) {
// // // //     res.status(500).json({ message: "Error: " + err.message });
// // // //   }
// // // // });

// // // // // ✅ Get User Documents - FIXED
// // // // app.get('/api/documents/user', auth, async (req, res) => {
// // // //   try {
// // // //     console.log("📥 User Documents Request - User ID:", req.user?.id);
    
// // // //     if (!req.user?.id) {
// // // //       return res.status(401).json({ message: "Unauthorized" });
// // // //     }

// // // //     const docs = await Document.find({ owner: req.user.id }).sort({ createdAt: -1 });
    
// // // //     console.log("✅ Documents found:", docs.length);
// // // //     res.json(docs);
// // // //   } catch (err) {
// // // //     console.error("❌ Get User Documents Error:", err);
// // // //     res.status(500).json({ message: "Error fetching documents: " + err.message });
// // // //   }
// // // // });

// // // // // Login
// // // // app.post('/api/auth/login', async (req, res) => {
// // // //   try {
// // // //     const { email, password } = req.body;
// // // //     const user = await User.findOne({ email });
// // // //     if (user && await bcrypt.compare(password, user.password)) {
// // // //       const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
// // // //       res.json({ token, user: { id: user._id, full_name: user.full_name, email: user.email } });
// // // //     } else {
// // // //       res.status(400).json({ message: "Invalid credentials" });
// // // //     }
// // // //   } catch (err) {
// // // //     res.status(500).json({ message: "Error: " + err.message });
// // // //   }
// // // // });

// // // // // Register
// // // // app.post('/api/auth/register', async (req, res) => {
// // // //   try {
// // // //     const { full_name, email, password } = req.body;
// // // //     const existingUser = await User.findOne({ email });
// // // //     if (existingUser) return res.status(400).json({ message: "User already exists" });
    
// // // //     const hashedPassword = await bcrypt.hash(password, 10);
// // // //     const user = new User({ full_name, email, password: hashedPassword });
// // // //     await user.save();
    
// // // //     const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
// // // //     res.json({ token, user: { id: user._id, full_name: user.full_name, email: user.email } });
// // // //   } catch (err) {
// // // //     res.status(500).json({ message: "Error: " + err.message });
// // // //   }
// // // // });

// // // // // Sign Document
// // // // app.get('/api/documents/sign/:token', async (req, res) => {
// // // //   try {
// // // //     const doc = await Document.findOne({ 'parties.token': req.params.token });
// // // //     if (!doc) return res.status(404).json({ message: "Invalid token" });
    
// // // //     const party = doc.parties.find(p => p.token === req.params.token);
// // // //     if (!party) return res.status(404).json({ message: "Party not found" });
    
// // // //     res.json({ 
// // // //       document: doc, 
// // // //       party: party,
// // // //       signLink: `${process.env.FRONTEND_URL}/sign?token=${req.params.token}`
// // // //     });
// // // //   } catch (err) {
// // // //     res.status(500).json({ message: "Error: " + err.message });
// // // //   }
// // // // });

// // // // // PDF Proxy Route - Local File থেকে PDF সার্ভ করবে
// // // // app.get('/api/documents/proxy/:filename', async (req, res) => {
// // // //   try {
// // // //     const { filename } = req.params;
// // // //     const filePath = path.join(__dirname, 'uploads', filename);
    
// // // //     console.log("📥 Proxy Request:", req.path);
// // // //     console.log("📥 File Path:", filePath);
    
// // // //     if (!fs.existsSync(filePath)) {
// // // //       console.error("❌ File not found:", filePath);
// // // //       return res.status(404).json({ message: "PDF not found" });
// // // //     }
    
// // // //     const fileBuffer = fs.readFileSync(filePath);
// // // //     console.log("✅ PDF sent successfully, size:", fileBuffer.length, "bytes");
// // // //     res.set('Content-Type', 'application/pdf');
// // // //     res.set('Access-Control-Allow-Origin', '*');
// // // //     res.send(fileBuffer);
// // // //   } catch (err) {
// // // //     console.error("❌ PDF Proxy Error:", err);
// // // //     res.status(500).json({ message: "Error fetching PDF" });
// // // //   }
// // // // });

// // // // // ⚠️ PORT 5001 ব্যবহার করুন
// // // // const PORT = process.env.PORT || 5001;
// // // // app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
// // // // const express = require('express');
// // // // const mongoose = require('mongoose');
// // // // const cors = require('cors');
// // // // const bcrypt = require('bcryptjs');
// // // // const jwt = require('jsonwebtoken');
// // // // const multer = require('multer');
// // // // const { v4: uuidv4 } = require('uuid');
// // // // const { v2: cloudinary } = require('cloudinary');
// // // // const crypto = require('crypto');
// // // // const fs = require('fs');
// // // // const path = require('path');

// // // // const User = require('./models/User');
// // // // const Document = require('./models/Document');
// // // // const AuditLog = require('./models/AuditLog');
// // // // const auth = require('./middleware/auth');

// // // // require('dotenv').config();

// // // // // ✅ Cloudinary Configuration
// // // // cloudinary.config({
// // // //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
// // // //   api_key: process.env.CLOUDINARY_API_KEY,
// // // //   api_secret: process.env.CLOUDINARY_API_SECRET
// // // // });

// // // // const app = express();

// // // // // ✅ CORS
// // // // app.use(cors({
// // // //   origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:3000'],
// // // //   credentials: true,
// // // //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
// // // //   allowedHeaders: ['Content-Type', 'Authorization']
// // // // }));

// // // // app.use(express.json());
// // // // app.use(express.urlencoded({ extended: true }));

// // // // // Create uploads folder
// // // // const uploadsDir = path.join(__dirname, 'uploads');
// // // // if (!fs.existsSync(uploadsDir)) {
// // // //   fs.mkdirSync(uploadsDir, { recursive: true });
// // // // }

// // // // // Multer Setup - Memory Storage for Cloudinary
// // // // const storage = multer.memoryStorage();
// // // // const upload = multer({ 
// // // //   storage: storage,
// // // //   fileFilter: (req, file, cb) => {
// // // //     if (file.mimetype === 'application/pdf') {
// // // //       cb(null, true);
// // // //     } else {
// // // //       cb(new Error('Only PDF files are allowed'), false);
// // // //     }
// // // //   }
// // // // });

// // // // // MongoDB Connection
// // // // mongoose.connect(process.env.MONGO_URI)
// // // //   .then(() => console.log("✅ MongoDB Connected!"))
// // // //   .catch(err => console.log("❌ MongoDB Error:", err));

// // // // // --- API Routes ---

// // // // // Health Check
// // // // app.get('/api', (req, res) => {
// // // //   res.json({ status: 'ok', message: 'NexSign API is running' });
// // // // });

// // // // // ✅ PDF Upload to Cloudinary - FIXED (Auto-save document)
// // // // app.post('/api/documents/upload', auth, upload.single('file'), async (req, res) => {
// // // //   console.log("📤 Upload request received");
// // // //   console.log("User ID:", req.user?.id);
  
// // // //   try {
// // // //     if (!req.file) {
// // // //       console.log("❌ No file uploaded");
// // // //       return res.status(400).json({ message: "File not found" });
// // // //     }
    
// // // //     console.log("📁 File details:", {
// // // //       originalname: req.file.originalname,
// // // //       size: req.file.size,
// // // //       mimetype: req.file.mimetype
// // // //     });
    
// // // //     // ✅ Save file temporarily to disk
// // // //     const tempPath = path.join(__dirname, 'uploads', `temp_${Date.now()}_${req.file.originalname}`);
// // // //     fs.writeFileSync(tempPath, req.file.buffer);
    
// // // //     console.log("📁 Temp file saved:", tempPath);
    
// // // //     // ✅ Upload to Cloudinary
// // // //     const result = await cloudinary.uploader.upload(tempPath, {
// // // //       resource_type: 'raw',
// // // //       public_id: `nexsign/${Date.now()}-${uuidv4()}`,
// // // //       folder: 'documents',
// // // //       format: 'pdf'
// // // //     });
    
// // // //     // ✅ Delete temporary file
// // // //     fs.unlinkSync(tempPath);
// // // //     console.log("📁 Temp file deleted");
    
// // // //     const fileUrl = result.secure_url;
    
// // // //     // ✅ Extract fileId from URL
// // // //     const fileId = fileUrl.split('/').pop();
// // // //     console.log("📁 File ID:", fileId);
    
// // // //     // ✅ Auto-create document in MongoDB
// // // //     const newDoc = await Document.create({
// // // //       title: req.file.originalname.replace('.pdf', ''),
// // // //       fileUrl,
// // // //       fileId,
// // // //       owner: req.user.id,
// // // //       status: 'draft',
// // // //       parties: [],
// // // //       fields: [],
// // // //       totalPages: 1
// // // //     });
    
// // // //     console.log("📁 Document created in MongoDB:", newDoc._id);
// // // //     console.log("📁 File uploaded to Cloudinary:", fileUrl);
// // // //     console.log("📁 File size:", req.file.size, "bytes");
    
// // // //     res.json({ url: fileUrl, fileId, docId: newDoc._id });
// // // //   } catch (err) {
// // // //     console.error("❌ Upload error:", err);
// // // //     console.error("❌ Error details:", err.message);
// // // //     console.error("❌ Error stack:", err.stack);
// // // //     res.status(500).json({ message: "Upload error: " + err.message });
// // // //   }
// // // // });

// // // // // ✅ PDF Proxy Endpoint - FIXED (Find by fileId or fileUrl)
// // // // app.get('/api/documents/proxy/:fileId', async (req, res) => {
// // // //   try {
// // // //     const fileId = req.params.fileId;
// // // //     console.log("📄 Proxy request for:", fileId);
    
// // // //     // ✅ Find the document by fileId
// // // //     const doc = await Document.findOne({ fileId });
    
// // // //     if (doc) {
// // // //       console.log("📄 Found document by fileId:", doc.fileUrl);
// // // //       return res.redirect(doc.fileUrl);
// // // //     }
    
// // // //     // ✅ If not found, try to find by fileUrl pattern
// // // //     const docByUrl = await Document.findOne({ 
// // // //       fileUrl: { $regex: fileId } 
// // // //     });
    
// // // //     if (docByUrl) {
// // // //       console.log("📄 Found document by fileUrl:", docByUrl.fileUrl);
// // // //       return res.redirect(docByUrl.fileUrl);
// // // //     }
    
// // // //     // ✅ If still not found, return 404
// // // //     console.log("❌ Document not found for fileId:", fileId);
// // // //     return res.status(404).json({ message: "Document not found" });
// // // //   } catch (err) {
// // // //     console.error("❌ Proxy error:", err);
// // // //     console.error("❌ Error details:", err.message);
// // // //     res.status(500).json({ message: "Proxy error: " + err.message });
// // // //   }
// // // // });

// // // // // Save/Update Document - FIXED (Save fileId)
// // // // app.post('/api/documents', auth, async (req, res) => {
// // // //   try {
// // // //     const data = { 
// // // //       ...req.body, 
// // // //       owner: req.user.id,
// // // //       fileUrl: req.body.file_url || req.body.fileUrl,
// // // //       fileId: req.body.file_id || req.body.fileId
// // // //     };
// // // //     const docId = req.body.id || req.body._id;

// // // //     if (docId) {
// // // //       const doc = await Document.findByIdAndUpdate(docId, data, { new: true });
// // // //       res.json(doc);
// // // //     } else {
// // // //       const doc = new Document(data);
// // // //       await doc.save();
// // // //       res.status(201).json(doc);
// // // //     }
// // // //   } catch (err) {
// // // //     res.status(500).json({ message: "Save error: " + err.message });
// // // //   }
// // // // });

// // // // // Update Document
// // // // app.put('/api/documents/:id', auth, async (req, res) => {
// // // //   try {
// // // //     const doc = await Document.findById(req.params.id);
// // // //     if (!doc) return res.status(404).json({ message: "Document not found" });
// // // //     if (doc.owner.toString() !== req.user.id.toString()) {
// // // //       return res.status(403).json({ message: "Unauthorized" });
// // // //     }

// // // //     const data = { 
// // // //       ...req.body, 
// // // //       fileUrl: req.body.file_url || req.body.fileUrl,
// // // //       fileId: req.body.file_id || req.body.fileId
// // // //     };

// // // //     const updatedDoc = await Document.findByIdAndUpdate(req.params.id, data, { new: true });
// // // //     res.json(updatedDoc);
// // // //   } catch (err) {
// // // //     res.status(500).json({ message: "Update error: " + err.message });
// // // //   }
// // // // });

// // // // // Send for Signing
// // // // app.post('/api/documents/send', auth, async (req, res) => {
// // // //   try {
// // // //     const { title, fileUrl, parties, fields, totalPages, id, fileId } = req.body;
// // // //     const token = crypto.randomBytes(32).toString('hex');
    
// // // //     const updatedParties = parties.map((p, i) => ({
// // // //       ...p,
// // // //       status: i === 0 ? 'sent' : 'pending',
// // // //       token: i === 0 ? token : null
// // // //     }));

// // // //     const docData = {
// // // //       title, fileUrl, fileId, parties: updatedParties, fields, totalPages,
// // // //       status: 'in_progress', owner: req.user.id, currentPartyIndex: 0
// // // //     };

// // // //     const doc = id 
// // // //       ? await Document.findByIdAndUpdate(id, docData, { new: true }) 
// // // //       : await Document.create(docData);

// // // //     res.json({ success: true, docId: doc._id });
// // // //   } catch (err) {
// // // //     res.status(500).json({ message: "Send error: " + err.message });
// // // //   }
// // // // });

// // // // // Get Document
// // // // app.get('/api/documents/:id', auth, async (req, res) => {
// // // //   try {
// // // //     const doc = await Document.findById(req.params.id);
// // // //     if (!doc) return res.status(404).json({ message: "Document not found" });
// // // //     res.json(doc);
// // // //   } catch (err) {
// // // //     res.status(500).json({ message: "Error: " + err.message });
// // // //   }
// // // // });

// // // // // Get User Documents
// // // // app.get('/api/documents/user', auth, async (req, res) => {
// // // //   try {
// // // //     const docs = await Document.find({ owner: req.user.id }).sort({ createdAt: -1 });
// // // //     res.json(docs);
// // // //   } catch (err) {
// // // //     res.status(500).json({ message: "Error fetching documents: " + err.message });
// // // //   }
// // // // });

// // // // // Login
// // // // app.post('/api/auth/login', async (req, res) => {
// // // //   try {
// // // //     const { email, password } = req.body;
    
// // // //     if (!email || !password) {
// // // //       return res.status(400).json({ message: "Email and password are required" });
// // // //     }
    
// // // //     const user = await User.findOne({ email });
    
// // // //     if (!user) {
// // // //       return res.status(400).json({ message: "User not found" });
// // // //     }
    
// // // //     if (await bcrypt.compare(password, user.password)) {
// // // //       const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
// // // //       res.json({ 
// // // //         token, 
// // // //         user: { 
// // // //           id: user._id, 
// // // //           full_name: user.full_name, 
// // // //           email: user.email 
// // // //         } 
// // // //       });
// // // //     } else {
// // // //       res.status(400).json({ message: "Invalid credentials" });
// // // //     }
// // // //   } catch (err) {
// // // //     res.status(500).json({ message: "Error: " + err.message });
// // // //   }
// // // // });

// // // // // ✅ Register - FIXED
// // // // app.post('/api/auth/register', async (req, res) => {
// // // //   try {
// // // //     const { full_name, email, password } = req.body;
    
// // // //     console.log("📝 Register request:", { full_name, email, password });
    
// // // //     // ✅ Validate required fields
// // // //     if (!full_name || !email || !password) {
// // // //       return res.status(400).json({ 
// // // //         message: "Missing required fields: full_name, email, password" 
// // // //       });
// // // //     }
    
// // // //     // ✅ Validate email format
// // // //     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// // // //     if (!emailRegex.test(email)) {
// // // //       return res.status(400).json({ 
// // // //         message: "Invalid email format" 
// // // //       });
// // // //     }
    
// // // //     // ✅ Validate password length
// // // //     if (password.length < 6) {
// // // //       return res.status(400).json({ 
// // // //         message: "Password must be at least 6 characters" 
// // // //       });
// // // //     }
    
// // // //     // ✅ Check if user exists
// // // //     const existingUser = await User.findOne({ email });
// // // //     if (existingUser) {
// // // //       return res.status(400).json({ 
// // // //         message: "User with this email already exists" 
// // // //       });
// // // //     }
    
// // // //     // ✅ Hash password
// // // //     const hashedPassword = await bcrypt.hash(password, 10);
    
// // // //     // ✅ Create user
// // // //     const user = new User({ 
// // // //       full_name, 
// // // //       email, 
// // // //       password: hashedPassword 
// // // //     });
    
// // // //     await user.save();
    
// // // //     // ✅ Generate token
// // // //     const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
// // // //     console.log("✅ User registered:", user.email);
    
// // // //     res.json({ 
// // // //       success: true,
// // // //       token, 
// // // //       user: { 
// // // //         id: user._id, 
// // // //         full_name: user.full_name, 
// // // //         email: user.email 
// // // //       } 
// // // //     });
    
// // // //   } catch (err) {
// // // //     console.error("❌ Register error:", err);
// // // //     res.status(500).json({ 
// // // //       message: "Registration failed", 
// // // //       error: err.message 
// // // //     });
// // // //   }
// // // // });

// // // // // Sign Document
// // // // app.get('/api/documents/sign/:token', async (req, res) => {
// // // //   try {
// // // //     const doc = await Document.findOne({ 'parties.token': req.params.token });
// // // //     if (!doc) return res.status(404).json({ message: "Invalid token" });
    
// // // //     const party = doc.parties.find(p => p.token === req.params.token);
// // // //     if (!party) return res.status(404).json({ message: "Party not found" });
    
// // // //     res.json({ 
// // // //       document: doc, 
// // // //       party: party,
// // // //       signLink: `${process.env.FRONTEND_URL}/sign?token=${req.params.token}`
// // // //     });
// // // //   } catch (err) {
// // // //     res.status(500).json({ message: "Error: " + err.message });
// // // //   }
// // // // });

// // // // // Sign Document (POST)
// // // // app.post('/api/documents/sign/:token', auth, async (req, res) => {
// // // //   try {
// // // //     const token = req.params.token;
    
// // // //     const doc = await Document.findOne({ 'parties.token': token });
// // // //     if (!doc) return res.status(404).json({ message: "Invalid token" });
    
// // // //     const party = doc.parties.find(p => p.token === token);
// // // //     if (!party) return res.status(404).json({ message: "Party not found" });
    
// // // //     party.status = 'signed';
// // // //     party.signedAt = new Date().toISOString();
    
// // // //     const allSigned = doc.parties.every(p => p.status === 'signed');
// // // //     if (allSigned) {
// // // //       doc.status = 'completed';
// // // //     }
    
// // // //     await doc.save();
    
// // // //     res.json({ success: true, message: "Document signed successfully" });
// // // //   } catch (err) {
// // // //     res.status(500).json({ message: "Error: " + err.message });
// // // //   }
// // // // });

// // // // // Delete Document
// // // // app.delete('/api/documents/:id', auth, async (req, res) => {
// // // //   try {
// // // //     const doc = await Document.findById(req.params.id);
// // // //     if (!doc) return res.status(404).json({ message: "Document not found" });
// // // //     if (doc.owner.toString() !== req.user.id.toString()) {
// // // //       return res.status(403).json({ message: "Unauthorized" });
// // // //     }
    
// // // //     await doc.deleteOne();
// // // //     res.json({ message: "Document deleted successfully" });
// // // //   } catch (err) {
// // // //     res.status(500).json({ message: "Error: " + err.message });
// // // //   }
// // // // });

// // // // // Error Handler
// // // // app.use((err, req, res, next) => {
// // // //   console.error("Server Error:", err);
// // // //   res.status(500).json({ message: "Internal server error", error: err.message });
// // // // });

// // // // // 404 Handler
// // // // app.use((req, res) => {
// // // //   res.status(404).json({ message: "Route not found" });
// // // // });

// // // // // Start Server
// // // // const PORT = process.env.PORT || 5001;
// // // // app.listen(PORT, () => {
// // // //   console.log(`🚀 Server running on port ${PORT}`);
// // // //   console.log(`📡 API available at http://localhost:${PORT}/api`);
// // // // });
// // // // server/index.js
// // // // require('dotenv').config();
// // // // const express = require('express');
// // // // const cors = require('cors');
// // // // const mongoose = require('mongoose');
// // // // const documentRoutes = require('./routes/documentRoutes');

// // // // const app = express();

// // // // // Middleware
// // // // app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
// // // // app.use(express.json());

// // // // // ১. মেইন API চেক (এটি আপনার /api 404 ফিক্স করবে)
// // // // app.get('/api', (req, res) => {
// // // //   res.json({ 
// // // //     status: "Online", 
// // // //     db: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected" 
// // // //   });
// // // // });

// // // // // ২. রাউট মাউন্ট করা
// // // // app.use('/api/documents', documentRoutes);

// // // // // MongoDB Connection
// // // // mongoose.connect(process.env.MONGO_URI)
// // // //   .then(() => console.log('✅ Connected to MongoDB Atlas'))
// // // //   .catch(err => console.error('❌ DB Error:', err));

// // // // // Catch-all 404 for debugging
// // // // app.use((req, res) => {
// // // //   console.log(`🔍 Missing Route: ${req.method} ${req.originalUrl}`);
// // // //   res.status(404).json({ error: "Route not found on server", path: req.originalUrl });
// // // // });

// // // // const PORT = 5001;
// // // // app.listen(PORT, () => console.log(`🚀 Server on: http://localhost:${PORT}`));

// // // // require('dotenv').config();
// // // // const express = require('express');
// // // // const cors = require('cors');
// // // // const mongoose = require('mongoose');
// // // // const helmet = require('helmet');

// // // // // রাউট ইম্পোর্ট (নিশ্চিত করুন এই ফাইলগুলো আপনার routes ফোল্ডারে আছে)
// // // // const authRoutes = require('./routes/authRoutes'); 
// // // // const documentRoutes = require('./routes/documentRoutes');
// // // // const adminRoutes = require('./routes/adminRoutes');

// // // // const app = express();

// // // // // ১. সিকিউরিটি মিডলওয়্যার
// // // // app.use(helmet({
// // // //   crossOriginResourcePolicy: false, // Cloudinary বা বাইরের রিসোর্স লোড করার জন্য
// // // // }));

// // // // // ২. CORS কনফিগারেশন (এটি আপনার মেইন এরর সমাধান করবে)
// // // // app.use(cors({
// // // //   origin: 'http://localhost:5173', // আপনার ফ্রন্টএন্ড অরিজিন
// // // //   credentials: true,
// // // //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
// // // //   allowedHeaders: ['Content-Type', 'Authorization']
// // // // }));
// // // // app.options('*', cors());

// // // // // ৩. রিকোয়েস্ট বডি পার্সার
// // // // app.use(express.json({ limit: '10mb' }));

// // // // // ৪. ডাটাবেস কানেকশন
// // // // mongoose.connect(process.env.MONGO_URI)
// // // //   .then(() => console.log('✅ Connected to MongoDB Atlas'))
// // // //   .catch(err => console.error('❌ DB Error:', err.message));

// // // // // ৫. রাউট মাউন্ট করা (অর্ডার খুব গুরুত্বপূর্ণ)
// // // // app.use('/api/auth', authRoutes);      // লগইন এখন এখানে হিট করবে
// // // // app.use('/api/documents', documentRoutes);
// // // // app.use('/api/admin', adminRoutes);

// // // // // ৬. হেলথ চেক রাউট
// // // // app.get('/api', (req, res) => {
// // // //   res.json({ 
// // // //     status: "Online", 
// // // //     db: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected" 
// // // //   });
// // // // });

// // // // // ৭. গ্লোবাল এরর হ্যান্ডলার
// // // // app.use((err, req, res, next) => {
// // // //   console.error(err.stack);
// // // //   res.status(500).json({ 
// // // //     error: 'Server Error', 
// // // //     message: err.message 
// // // //   });
// // // // });

// // // // // ৮. পোর্ট ফিক্স (ফ্রন্টএন্ডের ৫০০০ পোর্টের রিকোয়েস্টের সাথে ম্যাচ করা হয়েছে)
// // // // const PORT = 5001; 
// // // // app.listen(PORT, () => {
// // // //   console.log(`🚀 NexSign Server running on: http://localhost:${PORT}`);
// // // // });

// // // require('dotenv').config();
// // // const express = require('express');
// // // const cors = require('cors');
// // // const mongoose = require('mongoose');
// // // const helmet = require('helmet');

// // // // রাউট ইম্পোর্ট
// // // const authRoutes = require('./routes/authRoutes'); 
// // // const documentRoutes = require('./routes/documentRoutes');
// // // const adminRoutes = require('./routes/adminRoutes');

// // // const app = express();

// // // // ✅ ১. সিকিউরিটি মিডলওয়্যার (CSP ফিক্স করা হয়েছে)
// // // app.use(helmet({
// // //   crossOriginResourcePolicy: { policy: "cross-origin" }, // ক্লাউডিনারি থেকে ইমেজ/পিডিএফ দেখানোর জন্য
// // //   contentSecurityPolicy: {
// // //     directives: {
// // //       "default-src": ["'self'"],
// // //       "script-src": ["'self'", "'unsafe-inline'", "https://unpkg.com", "https://cdnjs.cloudflare.com"],
// // //       "connect-src": ["'self'", "http://localhost:5001", "https://res.cloudinary.com"],
// // //       "img-src": ["'self'", "data:", "blob:", "https://res.cloudinary.com"],
// // //       "style-src": ["'self'", "'unsafe-inline'"],
// // //       "frame-src": ["'self'"],
// // //       "object-src": ["'none'"]
// // //     },
// // //   },
// // // }));

// // // // ✅ ২. CORS কনফিগারেশন
// // // app.use(cors({
// // //   origin: 'http://localhost:5173', 
// // //   credentials: true,
// // //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
// // //   allowedHeaders: ['Content-Type', 'Authorization']
// // // }));
// // // app.options('*', cors());

// // // // ৩. রিকোয়েস্ট বডি পার্সার
// // // app.use(express.json({ limit: '10mb' }));

// // // // ৪. ডাটাবেস কানেকশন
// // // mongoose.connect(process.env.MONGO_URI)
// // //   .then(() => console.log('✅ Connected to MongoDB Atlas'))
// // //   .catch(err => console.error('❌ DB Error:', err.message));

// // // // ৫. রাউট মাউন্ট করা
// // // app.use('/api/auth', authRoutes);      
// // // app.use('/api/documents', documentRoutes);
// // // app.use('/api/admin', adminRoutes);

// // // // ৬. হেলথ চেক রাউট
// // // app.get('/api', (req, res) => {
// // //   res.json({ 
// // //     status: "Online", 
// // //     db: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected" 
// // //   });
// // // });

// // // // ৭. গ্লোবাল এরর হ্যান্ডলার
// // // app.use((err, req, res, next) => {
// // //   console.error(err.stack);
// // //   res.status(500).json({ 
// // //     error: 'Server Error', 
// // //     message: err.message 
// // //   });
// // // });

// // // // ৮. পোর্ট
// // // const PORT = 5001; 
// // // app.listen(PORT, () => {
// // //   console.log(`🚀 NexSign Server running on: http://localhost:${PORT}`);
// // // });

// // // require('dotenv').config();
// // // const express = require('express');
// // // const cors = require('cors');
// // // const mongoose = require('mongoose');
// // // const helmet = require('helmet');

// // // const authRoutes = require('./routes/authRoutes'); 
// // // const documentRoutes = require('./routes/documentRoutes');
// // // const adminRoutes = require('./routes/adminRoutes');

// // // const app = express();

// // // // ✅ 1. Updated Security for Cloudinary/Production
// // // app.use(helmet({
// // //   crossOriginResourcePolicy: { policy: "cross-origin" },
// // //   contentSecurityPolicy: false, // Set to false temporarily if you face UI issues, or refine later
// // // }));

// // // // ✅ 2. Production CORS
// // // const allowedOrigins = ['http://localhost:5173', 'https://nexsignfrontend.vercel.app'];
// // // app.use(cors({
// // //   origin: (origin, callback) => {
// // //     if (!origin || allowedOrigins.includes(origin)) {
// // //       callback(null, true);
// // //     } else {
// // //       callback(new Error('CORS blocked this request'));
// // //     }
// // //   },
// // //   credentials: true
// // // }));

// // // // app.use(express.json({ limit: '10mb' }));
// // // app.use(express.json({ limit: '50mb' }));
// // // app.use(express.urlencoded({ limit: '50mb', extended: true }));
// // // // ✅ 3. Database with Error Handling
// // // mongoose.connect(process.env.MONGO_URI)
// // //   .then(() => console.log('✅ MongoDB Connected'))
// // //   .catch(err => console.error('❌ MongoDB Connection Error:', err));

// // // // 4. Routes
// // // app.get('/', (req, res) => res.send('NexSign Server is Online')); // Fixes "Cannot GET /"
// // // app.use('/api/auth', authRoutes);      
// // // app.use('/api/documents', documentRoutes);
// // // app.use('/api/admin', adminRoutes);

// // // app.get('/api/health', (req, res) => {
// // //   res.json({ status: "Online", db: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected" });
// // // });

// // // // 5. Global Error Handler
// // // app.use((err, req, res, next) => {
// // //   res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
// // // });

// // // // ✅ 6. Dynamic Port for Render
// // // const PORT = process.env.PORT || 10000; 
// // // app.listen(PORT, () => {
// // //   console.log(`🚀 Server running on port ${PORT}`);
// // // });

// // //vercel deploy

// // // require('dotenv').config();
// // // const express = require('express');
// // // const cors = require('cors');
// // // const mongoose = require('mongoose');
// // // const helmet = require('helmet');

// // // // রাউট ইম্পোর্ট
// // // const authRoutes = require('./routes/authRoutes'); 
// // // const documentRoutes = require('./routes/documentRoutes');
// // // const adminRoutes = require('./routes/adminRoutes');

// // // const app = express();

// // // // ✅ ১. সিকিউরিটি মিডলওয়্যার (CSP ফিক্স করা হয়েছে)
// // // app.use(helmet({
// // //   crossOriginResourcePolicy: { policy: "cross-origin" }, // ক্লাউডিনারি থেকে ইমেজ/পিডিএফ দেখানোর জন্য
// // //   contentSecurityPolicy: {
// // //     directives: {
// // //       "default-src": ["'self'"],
// // //       "script-src": ["'self'", "'unsafe-inline'", "https://unpkg.com", "https://cdnjs.cloudflare.com"],
// // //       "connect-src": ["'self'", "http://localhost:5001", "https://res.cloudinary.com"],
// // //       "img-src": ["'self'", "data:", "blob:", "https://res.cloudinary.com"],
// // //       "style-src": ["'self'", "'unsafe-inline'"],
// // //       "frame-src": ["'self'"],
// // //       "object-src": ["'none'"]
// // //     },
// // //   },
// // // }));

// // // // ✅ ২. CORS কনফিগারেশন
// // // app.use(cors({
// // //   origin: 'http://localhost:5173', 
// // //   credentials: true,
// // //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
// // //   allowedHeaders: ['Content-Type', 'Authorization']
// // // }));
// // // app.options('*', cors());

// // // // ৩. রিকোয়েস্ট বডি পার্সার
// // // app.use(express.json({ limit: '10mb' }));

// // // // ৪. ডাটাবেস কানেকশন
// // // mongoose.connect(process.env.MONGO_URI)
// // //   .then(() => console.log('✅ Connected to MongoDB Atlas'))
// // //   .catch(err => console.error('❌ DB Error:', err.message));

// // // // ৫. রাউট মাউন্ট করা
// // // app.use('/api/auth', authRoutes);      
// // // app.use('/api/documents', documentRoutes);
// // // app.use('/api/admin', adminRoutes);

// // // // ৬. হেলথ চেক রাউট
// // // app.get('/api', (req, res) => {
// // //   res.json({ 
// // //     status: "Online", 
// // //     db: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected" 
// // //   });
// // // });

// // // // ৭. গ্লোবাল এরর হ্যান্ডলার
// // // app.use((err, req, res, next) => {
// // //   console.error(err.stack);
// // //   res.status(500).json({ 
// // //     error: 'Server Error', 
// // //     message: err.message 
// // //   });
// // // });

// // // // ৮. পোর্ট
// // // const PORT = 5001; 
// // // app.listen(PORT, () => {
// // //   console.log(`🚀 NexSign Server running on: http://localhost:${PORT}`);
// // // });
// // // require('dotenv').config();
// // // const express = require('express');
// // // const cors = require('cors');
// // // const mongoose = require('mongoose');
// // // const helmet = require('helmet');


// // // require('./models/User');
// // // require('./models/Document');
// // // require('./models/AuditLog'); 
// // // const authRoutes = require('./routes/authRoutes'); 
// // // const documentRoutes = require('./routes/documentRoutes');
// // // const adminRoutes = require('./routes/adminRoutes');

// // // const app = express();

// // // // ১. হেলমেট সিকিউরিটি (Cloudinary ইমেজ রেন্ডারিং এর জন্য)
// // // app.use(helmet({
// // //   crossOriginResourcePolicy: { policy: "cross-origin" },
// // //   contentSecurityPolicy: false,
// // // }));

// // // // ২. উন্নত CORS কনফিগারেশন
// // // const allowedOrigins = [
// // //   'http://localhost:5173', 
// // //   'https://nexsignfrontend.vercel.app',
// // //   'https://nexsignfrontend-git-main-bisal-sahas-projects.vercel.app'
// // // ];

// // // app.use(cors({
// // //   origin: (origin, callback) => {
// // //     // অরিজিন চেক লজিক
// // //     if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
// // //       callback(null, true);
// // //     } else {
// // //       callback(new Error('CORS blocked this request'));
// // //     }
// // //   },
// // //   credentials: true, // এটি বাধ্যতামূলক যেহেতু ফ্রন্টএন্ডে withCredentials: true আছে
// // //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
// // //   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
// // // }));

// // // // ৩. প্রি-ফ্লাইট (OPTIONS) রিকোয়েস্ট গ্লোবাল হ্যান্ডলার
// // // app.options('*', cors());

// // // // ৪. পে-লোড লিমিট মিডলওয়্যার
// // // app.use(express.json({ limit: '50mb' }));
// // // app.use(express.urlencoded({ limit: '50mb', extended: true }));

// // // // ৫. ডাটাবেস কানেকশন
// // // mongoose.connect(process.env.MONGO_URI)
// // //   .then(() => console.log('✅ MongoDB Connected'))
// // //   .catch(err => console.error('❌ MongoDB Connection Error:', err));

// // // // ৬. রাউটস
// // // app.get('/', (req, res) => res.send('NexSign Server is Online'));
// // // app.use('/api/auth', authRoutes);      
// // // app.use('/api/documents', documentRoutes);
// // // app.use('/api/admin', adminRoutes);

// // // app.get('/api/health', (req, res) => {
// // //   res.json({ status: "Online", db: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected" });
// // // });

// // // // ৭. গ্লোবাল এরর হ্যান্ডলার
// // // app.use((err, req, res, next) => {
// // //   const status = err.status || 500;
// // //   res.status(status).json({ error: err.message || 'Internal Server Error' });
// // // });

// // // const PORT = process.env.PORT || 5001;

// // // if (process.env.NODE_ENV !== 'production') {
// // //   app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
// // // }

// // // module.exports = app;




// // // require('dotenv').config();
// // // const express = require('express');
// // // const cors = require('cors');
// // // const mongoose = require('mongoose');
// // // const helmet = require('helmet');

// // // // ১. মডেল ইমপোর্ট (কানেকশনের আগে ইমপোর্ট করা ভালো)
// // // require('./models/User');
// // // require('./models/Document');
// // // require('./models/AuditLog'); 

// // // const authRoutes = require('./routes/authRoutes'); 
// // // const documentRoutes = require('./routes/documentRoutes');
// // // const adminRoutes = require('./routes/adminRoutes');
// // // const feedbackRoutes = require('./routes/feedbackRoutes');
// // // const app = express();

// // // // ২. হেলমেট ও সিকিউরিটি
// // // app.use(helmet({
// // //   crossOriginResourcePolicy: { policy: "cross-origin" },
// // //   contentSecurityPolicy: false,
// // // }));

// // // // ৩. CORS কনফিগারেশন
// // // const allowedOrigins = [
// // //   'http://localhost:5173', 
// // //   'https://nexsignfrontend.vercel.app',
// // //   'https://nexsignfrontend-git-main-bisal-sahas-projects.vercel.app'
// // // ];

// // // app.use(cors({
// // //   origin: (origin, callback) => {
// // //     if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
// // //       callback(null, true);
// // //     } else {
// // //       callback(new Error('CORS blocked this request'));
// // //     }
// // //   },
// // //   credentials: true,
// // //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
// // //   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
// // // }));

// // // app.options('*', cors());

// // // // ৪. পে-লোড লিমিট
// // // app.use(express.json({ limit: '50mb' }));
// // // app.use(express.urlencoded({ limit: '50mb', extended: true }));

// // // // ৫. ডাটাবেস কানেকশন হ্যান্ডলার (Vercel অপ্টিমাইজড)
// // // const connectDB = async () => {
// // //   // যদি আগে থেকেই কানেক্টেড থাকে তবে নতুন করে কানেক্ট হবে না
// // //   if (mongoose.connection.readyState >= 1) return;

// // //   try {
// // //     await mongoose.connect(process.env.MONGO_URI, {
// // //       useNewUrlParser: true,
// // //       useUnifiedTopology: true,
// // //       serverSelectionTimeoutMS: 5000, // ৫ সেকেন্ড পর টাইমআউট
// // //       socketTimeoutMS: 45000,
// // //     });
// // //     console.log('✅ MongoDB Connected');
// // //   } catch (err) {
// // //     console.error('❌ MongoDB Connection Error:', err.message);
// // //     // সার্ভারলেস ফাংশনে এরর থ্রো করা উচিত যাতে বাফারিং না হয়
// // //     throw new Error('Database connection failed');
// // //   }
// // // };

// // // // কানেকশন মিডলওয়্যার (প্রতিটি রিকোয়েস্টে কানেকশন নিশ্চিত করবে)
// // // app.use(async (req, res, next) => {
// // //   try {
// // //     await connectDB();
// // //     next();
// // //   } catch (err) {
// // //     res.status(503).json({ error: "Service Unavailable: Database Connection Error" });
// // //   }
// // // });

// // // // ৬. রাউটস
// // // app.get('/', (req, res) => res.send('NexSign Server is Online'));
// // // app.use('/api/auth', authRoutes);      
// // // app.use('/api/documents', documentRoutes);
// // // app.use('/api/admin', adminRoutes);

// // // app.get('/api/health', (req, res) => {
// // //   res.json({ 
// // //     status: "Online", 
// // //     db: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected" 
// // //   });
// // // });
// // // app.use('/api/feedback', feedbackRoutes);

// // // // ৭. গ্লোবাল এরর হ্যান্ডলার
// // // app.use((err, req, res, next) => {
// // //   console.error("Global Error Log:", err.stack);
// // //   const status = err.status || 500;
// // //   res.status(status).json({ 
// // //     error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message 
// // //   });
// // // });


// // // // লোকাল সার্ভার লজিক
// // // if (process.env.NODE_ENV !== 'production') {
// // //   const PORT = process.env.PORT || 5001;
// // //   app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
// // // }


// // // //google login

// // // app.use("/api/auth", authRoutes);

// // // module.exports = app;

// // require('dotenv').config();
// // const express = require('express');
// // const cors = require('cors');
// // const mongoose = require('mongoose');
// // const helmet = require('helmet');

// // // Model Imports
// // require('./models/User');
// // require('./models/Document');
// // require('./models/AuditLog'); 

// // const authRoutes = require('./routes/authRoutes'); 
// // const documentRoutes = require('./routes/documentRoutes');
// // const adminRoutes = require('./routes/adminRoutes');
// // const feedbackRoutes = require('./routes/feedbackRoutes');

// // const app = express();

// // // 1. Security & Middleware
// // app.use(helmet({
// //   crossOriginResourcePolicy: { policy: "cross-origin" },
// //   crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }, 
// //   contentSecurityPolicy: false,
// // }));

// // const allowedOrigins = [
// //   'http://localhost:5173', 
// //   'https://nexsignfrontend.vercel.app',
// //   'https://nexsignfrontend-git-main-bisal-sahas-projects.vercel.app'
// // ];

// // app.use(cors({
// //   origin: (origin, callback) => {
// //     // Allows requests with no origin (like mobile apps/curl) or specific allowed domains
// //     if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
// //       callback(null, true);
// //     } else {
// //       callback(new Error('CORS policy: This origin is not allowed'));
// //     }
// //   },
// //   credentials: true,
// //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
// //   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
// // }));

// // app.use(express.json({ limit: '50mb' }));
// // app.use(express.urlencoded({ limit: '50mb', extended: true }));

// // // 2. Database Connection (Optimized for Serverless)
// // let isConnected = false;
// // const connectDB = async () => {
// //   if (isConnected) return;
  
// //   try {
// //     const db = await mongoose.connect(process.env.MONGO_URI);
// //     isConnected = db.connections[0].readyState === 1;
// //     console.log('✅ MongoDB Connected');
// //   } catch (err) {
// //     console.error('❌ MongoDB Connection Error:', err.message);
// //     throw new Error('Database connection failed');
// //   }
// // };

// // // Middleware to ensure DB is connected before processing requests
// // app.use(async (req, res, next) => {
// //   try {
// //     await connectDB();
// //     next();
// //   } catch (err) {
// //     res.status(503).json({ error: "Service temporarily unavailable due to DB connection" });
// //   }
// // });

// // // 3. Routes
// // app.get('/', (req, res) => res.send('NexSign Server is Online'));
// // app.use('/api/auth', authRoutes);      
// // app.use('/api/documents', documentRoutes);
// // app.use('/api/admin', adminRoutes);
// // app.use('/api/feedback', feedbackRoutes);

// // app.get('/api/health', (req, res) => {
// //   res.json({ 
// //     status: "Online", 
// //     db: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected" 
// //   });
// // });

// // // 4. Global Error Handler
// // app.use((err, req, res, next) => {
// //   console.error("Critical Error:", err.stack);
// //   res.status(err.status || 500).json({ 
// //     error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message 
// //   });
// // });

// // // 5. Port Listening (Only for Local Development)
// // if (process.env.NODE_ENV !== 'production') {
// //   const PORT = process.env.PORT || 5001;
// //   app.listen(PORT, () => console.log(`🚀 Local server running on port ${PORT}`));
// // }

// // module.exports = app;
// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');
// const helmet = require('helmet');

// const app = express();

// // ১. Vercel এর জন্য প্রক্সি ট্রাস্ট করা (Rate Limit এর জন্য জরুরি)
// app.set('trust proxy', 1);

// // ২. হেলমেট (Security)
// app.use(helmet({
//   crossOriginResourcePolicy: { policy: "cross-origin" },
//   contentSecurityPolicy: false,
//   crossOriginEmbedderPolicy: false,
// }));

// // ৩. CORS কনফিগারেশন
// const allowedOrigins = [
//   'http://localhost:5173', 
//   'https://nexsignfrontend.vercel.app'
// ];

// app.use(cors({
//   origin: (origin, callback) => {
//     if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
//       return callback(null, true);
//     }
//     return callback(new Error('CORS blocked by NexSign Policy'));
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
//   optionsSuccessStatus: 204
// }));

// // ৪. CRITICAL: Manual OPTIONS Handler (Vercel Preflight Fix)
// app.options('*', (req, res) => {
//   const origin = req.headers.origin;
//   if (origin && (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app'))) {
//     res.header('Access-Control-Allow-Origin', origin);
//   }
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
//   res.header('Access-Control-Allow-Credentials', 'true');
//   return res.sendStatus(204);
// });

// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ limit: '10mb', extended: true }));

// // ৫. ডাটাবেস কানেকশন (Optimized for Serverless)
// const connectDB = async () => {
//   if (mongoose.connection.readyState >= 1) return;
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log('✅ MongoDB Connected');
//   } catch (err) {
//     console.error('❌ MongoDB Connection Error:', err.message);
//   }
// };
// connectDB();

// app.use(async (req, res, next) => {
//   if (mongoose.connection.readyState === 0) await connectDB();
//   next();
// });

// // ৬. আপনার সমস্ত রাউটস
// app.use('/api/auth', require('./routes/authRoutes'));      
// app.use('/api/documents', require('./routes/documentRoutes'));
// app.use('/api/admin', require('./routes/adminRoutes'));
// app.use('/api/feedback', require('./routes/feedbackRoutes'));

// // ৭. গ্লোবাল এরর হ্যান্ডলার (CORS হেডারসহ)
// app.use((err, req, res, next) => {
//   const status = err.status || 500;
//   const origin = req.headers.origin;
//   if (origin && (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app'))) {
//     res.header("Access-Control-Allow-Origin", origin);
//     res.header("Access-Control-Allow-Credentials", "true");
//   }
//   res.status(status).json({ 
//     success: false,
//     message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message 
//   });
// });

// module.exports = app;
// require('dotenv').config();
// const express  = require('express');
// const cors     = require('cors');
// const mongoose = require('mongoose');
// const helmet   = require('helmet');

// const app = express();
// app.set('trust proxy', 1);

// const allowedOrigins = [
//   'http://localhost:5173',
//   'https://nexsignfrontend.vercel.app',
// ];

// const corsOptions = {
//   origin: (origin, callback) => {
//     if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app'))
//       return callback(null, true);
//     return callback(new Error('CORS blocked'));
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   optionsSuccessStatus: 200,
// };

// app.use(cors(corsOptions));
// app.options('*', cors(corsOptions));
// app.use(helmet({
//   crossOriginResourcePolicy: { policy: 'cross-origin' },
//   contentSecurityPolicy:     false,
//   crossOriginEmbedderPolicy: false,
// }));
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ limit: '10mb', extended: true }));

// // Serverless DB connection cache
// let cachedDb = null;
// const connectDB = async () => {
//   if (cachedDb && mongoose.connection.readyState >= 1) return;
//   cachedDb = await mongoose.connect(process.env.MONGO_URI);
// };

// app.use(async (req, res, next) => {
//   try { await connectDB(); next(); }
//   catch (err) { res.status(500).json({ error: 'Database connection failed' }); }
// });

// app.use('/api/auth',      require('./routes/authRoutes'));
// app.use('/api/documents', require('./routes/documentRoutes'));
// app.use('/api/admin',     require('./routes/adminRoutes'));
// app.use('/api/feedback',  require('./routes/feedbackRoutes'));

// app.use((err, req, res, next) => {
//   res.status(err.status || 500).json({
//     success: false,
//     message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
//   });
// });

// module.exports = app; workable

// 'use strict';

// require('dotenv').config();

// const express  = require('express');
// const mongoose = require('mongoose');
// const helmet   = require('helmet');

// const app = express();
// app.set('trust proxy', 1);

// // ════════════════════════════════════════════════════════════════
// // CORS — must be FIRST, before everything else
// // ════════════════════════════════════════════════════════════════
// const ALLOWED_ORIGINS = [
//   'http://localhost:5173',
//   'http://localhost:3000',
//   'https://nexsignfrontend.vercel.app',
// ];

// function isOriginAllowed(origin) {
//   if (!origin) return true;                    // Postman / server-to-server
//   if (ALLOWED_ORIGINS.includes(origin)) return true;
//   if (origin.endsWith('.vercel.app')) return true;
//   return false;
// }

// // ── Manual CORS middleware (no cors package needed) ──────────────
// // This approach works reliably on Vercel serverless because we
// // handle OPTIONS ourselves and set headers on EVERY response.
// app.use((req, res, next) => {
//   const origin = req.headers.origin;

//   if (isOriginAllowed(origin)) {
//     res.setHeader('Access-Control-Allow-Origin',      origin || '*');
//     res.setHeader('Access-Control-Allow-Credentials', 'true');
//     res.setHeader(
//       'Access-Control-Allow-Methods',
//       'GET,POST,PUT,PATCH,DELETE,OPTIONS'
//     );
//     res.setHeader(
//       'Access-Control-Allow-Headers',
//       'Content-Type,Authorization,X-Requested-With'
//     );
//     res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count');
//     res.setHeader('Access-Control-Max-Age',         '86400');   // 24h preflight cache
//   } else {
//     console.warn('🚫 CORS blocked:', origin);
//   }

//   // Preflight — respond immediately with 200, no body
//   if (req.method === 'OPTIONS') {
//     return res.status(200).end();
//   }

//   next();
// });

// // ════════════════════════════════════════════════════════════════
// // SECURITY HEADERS
// // ════════════════════════════════════════════════════════════════
// app.use(helmet({
//   crossOriginResourcePolicy: { policy: 'cross-origin' },
//   contentSecurityPolicy:     false,
//   crossOriginEmbedderPolicy: false,
// }));

// // ════════════════════════════════════════════════════════════════
// // REQUEST TIMEOUT
// // ════════════════════════════════════════════════════════════════
// app.use((req, res, next) => {
//   const isUpload = req.path.includes('upload') ||
//                    req.path.includes('sign');
//   const timeout  = isUpload ? 29000 : 15000;

//   const timer = setTimeout(() => {
//     if (!res.headersSent) {
//       console.error(`⏰ Timeout: ${req.method} ${req.path}`);
//       res.status(503).json({
//         success: false,
//         message: 'Request timed out. Please try again.',
//         code:    'TIMEOUT',
//       });
//     }
//   }, timeout);

//   res.on('finish', () => clearTimeout(timer));
//   res.on('close',  () => clearTimeout(timer));
//   next();
// });

// // ════════════════════════════════════════════════════════════════
// // BODY PARSER
// // ════════════════════════════════════════════════════════════════
// app.use(express.json({ limit: '15mb' }));
// app.use(express.urlencoded({ limit: '15mb', extended: true }));

// // JSON parse error handler
// app.use((err, req, res, next) => {
//   if (err.type === 'entity.parse.failed') {
//     return res.status(400).json({ success: false, message: 'Invalid JSON.' });
//   }
//   next(err);
// });

// // ════════════════════════════════════════════════════════════════
// // MONGODB — connection with retry
// // ════════════════════════════════════════════════════════════════
// let dbConnection = null;
// let isConnecting = false;

// const MONGO_OPTIONS = {
//   maxPoolSize:              10,
//   minPoolSize:              2,
//   serverSelectionTimeoutMS: 8000,
//   socketTimeoutMS:          45000,
//   connectTimeoutMS:         10000,
//   heartbeatFrequencyMS:     10000,
//   retryWrites:              true,
//   retryReads:               true,
// };

// async function connectDB(retries = 3) {
//   if (dbConnection && mongoose.connection.readyState === 1) return dbConnection;

//   if (isConnecting) {
//     await new Promise(r => setTimeout(r, 1000));
//     return connectDB(retries);
//   }

//   isConnecting = true;
//   try {
//     console.log('🔄 Connecting to MongoDB...');
//     dbConnection = await mongoose.connect(process.env.MONGO_URI, MONGO_OPTIONS);
//     console.log('✅ MongoDB connected');
//     isConnecting = false;
//     return dbConnection;
//   } catch (err) {
//     isConnecting = false;
//     console.error(`❌ MongoDB Error: ${err.message}`);
//     if (retries > 0) {
//       const delay = (4 - retries) * 2000;
//       await new Promise(r => setTimeout(r, delay));
//       return connectDB(retries - 1);
//     }
//     throw err;
//   }
// }

// mongoose.connection.on('disconnected', () => { dbConnection = null; });
// mongoose.connection.on('error',        () => { dbConnection = null; });

// app.use(async (req, res, next) => {
//   try {
//     await connectDB();
//     next();
//   } catch (err) {
//     res.status(503).json({
//       success: false,
//       message: 'Database temporarily unavailable. Please retry.',
//       code:    'DB_ERROR',
//       retry:   true,
//     });
//   }
// });

// // ════════════════════════════════════════════════════════════════
// // HEALTH CHECK
// // ════════════════════════════════════════════════════════════════
// app.get('/api/health', (req, res) => {
//   const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
//   res.json({
//     status:    'ok',
//     timestamp: new Date().toISOString(),
//     db:        states[mongoose.connection.readyState] || 'unknown',
//     env:       process.env.NODE_ENV || 'development',
//     uptime:    Math.floor(process.uptime()),
//   });
// });

// // ════════════════════════════════════════════════════════════════
// // ROUTES
// // ════════════════════════════════════════════════════════════════
// app.use('/api/auth',      require('./routes/authRoutes'));
// app.use('/api/documents', require('./routes/documentRoutes'));
// app.use('/api/admin',     require('./routes/adminRoutes'));
// app.use('/api/feedback',  require('./routes/feedbackRoutes'));

// // 404
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     message: `Route not found: ${req.method} ${req.path}`,
//   });
// });

// // ════════════════════════════════════════════════════════════════
// // GLOBAL ERROR HANDLER
// // ════════════════════════════════════════════════════════════════
// app.use((err, req, res, next) => {
//   if (res.headersSent) return next(err);

//   if (err.code === 'LIMIT_FILE_SIZE') {
//     return res.status(413).json({ success: false, message: 'File too large. Max 20MB.' });
//   }
//   if (err.name === 'ValidationError') {
//     const messages = Object.values(err.errors).map(e => e.message);
//     return res.status(400).json({ success: false, message: messages.join(', ') });
//   }
//   if (err.name === 'CastError') {
//     return res.status(400).json({ success: false, message: 'Invalid ID format.' });
//   }
//   if (err.name === 'JsonWebTokenError') {
//     return res.status(401).json({ success: false, message: 'Invalid token.' });
//   }
//   if (err.name === 'TokenExpiredError') {
//     return res.status(401).json({ success: false, message: 'Token expired.' });
//   }

//   const statusCode = err.status || err.statusCode || 500;
//   console.error(`❌ ${req.method} ${req.path} →`, err.message);

//   res.status(statusCode).json({
//     success: false,
//     message: process.env.NODE_ENV === 'production'
//       ? 'Something went wrong. Please try again.'
//       : err.message,
//   });
// });

// // ════════════════════════════════════════════════════════════════
// // LOCAL DEV STARTUP
// // ════════════════════════════════════════════════════════════════
// if (process.env.NODE_ENV !== 'production') {
//   const PORT = process.env.PORT || 5000;
//   connectDB()
//     .then(() => {
//       app.listen(PORT, () => {
//         console.log(`🚀 Server: http://localhost:${PORT}`);
//         console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
//       });
//     })
//     .catch(err => {
//       console.error('Failed to start:', err.message);
//       process.exit(1);
//     });
// }

// process.on('unhandledRejection', (reason) => {
//   console.error('⚠️ Unhandled Rejection:', reason);
// });
// process.on('uncaughtException', (err) => {
//   console.error('💥 Uncaught Exception:', err.message);
//   if (process.env.NODE_ENV !== 'production') process.exit(1);
// });

// // ✅ Vercel serverless export
// module.exports = app;

'use strict';

require('dotenv').config();

const express  = require('express');
const mongoose = require('mongoose');
const helmet   = require('helmet');
const cors     = require('cors');

const app = express();

// Vercel/Proxy support
app.set('trust proxy', 1);

// ════════════════════════════════════════════════════════════════
// ALLOWED ORIGINS (SECURE & OPTIMIZED)
// ════════════════════════════════════════════════════════════════
const ALLOWED_ORIGINS = [
  'https://nexsignfrontend.vercel.app', // Your Live Frontend
  'http://localhost:5173',               // Local Development
  'http://localhost:3000'
];

// ════════════════════════════════════════════════════════════════
// CORS CONFIGURATION (FIXES PREFLIGHT & LOCALHOST ERRORS)
// ════════════════════════════════════════════════════════════════
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    const isAllowed = ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.vercel.app');
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200 // Essential for Legacy browsers & Preflight
};

// Apply CORS before any other middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ════════════════════════════════════════════════════════════════
// SECURITY HEADERS (PRODUCTION GRADE)
// ════════════════════════════════════════════════════════════════
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // Set to false to allow PDF rendering/blobs
  crossOriginEmbedderPolicy: false,
}));

// ════════════════════════════════════════════════════════════════
// BODY PARSER & TIMEOUT
// ════════════════════════════════════════════════════════════════
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// Dynamic Timeout Middleware
app.use((req, res, next) => {
  const isLargeRequest = req.path.includes('upload') || req.path.includes('sign');
  const timeout = isLargeRequest ? 28000 : 15000; // Vercel limit is 30s

  const timer = setTimeout(() => {
    if (!res.headersSent) {
      res.status(503).json({
        success: false,
        message: 'Request timed out. Please try again.',
        code: 'TIMEOUT'
      });
    }
  }, timeout);

  res.on('finish', () => clearTimeout(timer));
  res.on('close', () => clearTimeout(timer));
  next();
});

// ════════════════════════════════════════════════════════════════
// MONGODB CONNECTION (SERVERLESS OPTIMIZED)
// ════════════════════════════════════════════════════════════════
let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) return;

  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    isConnected = db.connections[0].readyState;
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error(`❌ DB Error: ${err.message}`);
    // Don't exit process in serverless, just throw to let middleware handle it
    throw err;
  }
};

// DB Connection Middleware
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({ success: false, message: 'Database Unavailable' });
  }
});

// ════════════════════════════════════════════════════════════════
// ROUTES
// ════════════════════════════════════════════════════════════════
app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/admin',     require('./routes/adminRoutes'));
app.use('/api/feedback',  require('./routes/feedbackRoutes'));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'active', uptime: process.uptime() });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.path} not found` });
});

// ════════════════════════════════════════════════════════════════
// GLOBAL ERROR HANDLER
// ════════════════════════════════════════════════════════════════
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  const statusCode = err.status || err.statusCode || 500;
  console.error(`💥 Error [${req.method} ${req.path}]:`, err.message);

  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'An internal error occurred.' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// ════════════════════════════════════════════════════════════════
// SERVER EXPORT (FOR VERCEL)
// ════════════════════════════════════════════════════════════════
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Dev Server: http://localhost:${PORT}`));
}

module.exports = app;