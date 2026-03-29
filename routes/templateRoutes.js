const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { adminProtect } = require("../middleware/adminAuth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  createTemplate,
  getTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  launchTemplateSession,
  getTemplateSessions,
  getTemplateSessionById,
  getSignerView,
  submitSignerSignature,
  finalizeSession,
  getSessionAuditLog,
  duplicateTemplate,
  archiveTemplate,
  getTemplateStats,
  sendReminderToSigner,
  voidSession,
  downloadSignedDocument,
  getMySigningTasks,
} = require("../controllers/templateController");

// ─── Multer Setup ────────────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, "../uploads/temp");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
});

// ─── Error wrapper ────────────────────────────────────────────────────────────
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// ════════════════════════════════════════════════════════════════════════════
//  PUBLIC / SIGNER ROUTES  (no auth required — token-based access)
// ════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/templates/sign/:token
 * Signer accesses their signing view via unique token link
 */
router.get("/sign/:token", asyncHandler(getSignerView));

/**
 * POST /api/templates/sign/:token
 * Signer submits signature + field data
 */
router.post("/sign/:token", asyncHandler(submitSignerSignature));

/**
 * GET /api/templates/sign/:token/download
 * Signer downloads their completed signed PDF
 */
router.get("/sign/:token/download", asyncHandler(downloadSignedDocument));

// ════════════════════════════════════════════════════════════════════════════
//  AUTHENTICATED ROUTES
// ════════════════════════════════════════════════════════════════════════════

// ─── My Signing Tasks ────────────────────────────────────────────────────────

/**
 * GET /api/templates/my-tasks
 * Get all pending/completed signing tasks for current user
 */
router.get("/my-tasks", protect, asyncHandler(getMySigningTasks));

// ─── Template CRUD ───────────────────────────────────────────────────────────

/**
 * GET /api/templates
 * List all templates owned by authenticated user
 * Query: ?status=active|archived&page=1&limit=10&search=keyword
 */
router.get("/", protect, asyncHandler(getTemplates));

/**
 * POST /api/templates
 * Create new template (upload PDF + define fields)
 * multipart/form-data: pdf file + JSON metadata
 */
router.post(
  "/",
  protect,
  upload.single("pdf"),
  asyncHandler(createTemplate)
);

/**
 * GET /api/templates/stats
 * Aggregate stats: total templates, sessions, completion rate
 */
router.get("/stats", protect, asyncHandler(getTemplateStats));

/**
 * GET /api/templates/:id
 * Get single template with field definitions
 */
router.get("/:id", protect, asyncHandler(getTemplateById));

/**
 * PUT /api/templates/:id
 * Update template metadata / fields
 * Optional: re-upload PDF
 */
router.put(
  "/:id",
  protect,
  upload.single("pdf"),
  asyncHandler(updateTemplate)
);

/**
 * DELETE /api/templates/:id
 * Soft-delete template (sets deletedAt)
 */
router.delete("/:id", protect, asyncHandler(deleteTemplate));

/**
 * POST /api/templates/:id/duplicate
 * Clone a template (new copy with same fields)
 */
router.post("/:id/duplicate", protect, asyncHandler(duplicateTemplate));

/**
 * PATCH /api/templates/:id/archive
 * Toggle archive status
 */
router.patch("/:id/archive", protect, asyncHandler(archiveTemplate));

// ─── Session Management ───────────────────────────────────────────────────────

/**
 * POST /api/templates/:id/sessions
 * Launch a new signing session from this template
 * Body: { signers: [{name, email, designation}], ccList: [...], message: "" }
 */
router.post(
  "/:id/sessions",
  protect,
  asyncHandler(launchTemplateSession)
);

/**
 * GET /api/templates/:id/sessions
 * List all sessions for a template
 * Query: ?status=pending|completed|voided&page=1&limit=10
 */
router.get(
  "/:id/sessions",
  protect,
  asyncHandler(getTemplateSessions)
);

/**
 * GET /api/templates/:id/sessions/:sessionId
 * Get single session detail (all signers + progress)
 */
router.get(
  "/:id/sessions/:sessionId",
  protect,
  asyncHandler(getTemplateSessionById)
);

/**
 * POST /api/templates/:id/sessions/:sessionId/finalize
 * Manually trigger finalization check
 * (auto-triggered when last signer completes)
 */
router.post(
  "/:id/sessions/:sessionId/finalize",
  protect,
  asyncHandler(finalizeSession)
);

/**
 * POST /api/templates/:id/sessions/:sessionId/void
 * Void/cancel an active session
 * Body: { reason: "string" }
 */
router.post(
  "/:id/sessions/:sessionId/void",
  protect,
  asyncHandler(voidSession)
);

/**
 * POST /api/templates/:id/sessions/:sessionId/remind
 * Send reminder email to pending signers
 * Body: { signerIds: ["all" | "...id"] }
 */
router.post(
  "/:id/sessions/:sessionId/remind",
  protect,
  asyncHandler(sendReminderToSigner)
);

/**
 * GET /api/templates/:id/sessions/:sessionId/audit
 * Full audit log for a session
 */
router.get(
  "/:id/sessions/:sessionId/audit",
  protect,
  asyncHandler(getSessionAuditLog)
);

// ─── Admin-only Routes ────────────────────────────────────────────────────────

/**
 * GET /api/templates/admin/all
 * Admin: see all templates across all users
 */
router.get(
  "/admin/all",
  protect,
  adminProtect,
  asyncHandler(async (req, res) => {
    const Template = require("../models/Template");
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [templates, total] = await Promise.all([
      Template.find({ deletedAt: null })
        .populate("owner", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Template.countDocuments({ deletedAt: null }),
    ]);

    res.json({
      success: true,
      data: templates,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  })
);

// ─── Multer Error Handler ─────────────────────────────────────────────────────
router.use((err, _req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 25MB.",
      });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err.message === "Only PDF files are allowed") {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
});

module.exports = router;