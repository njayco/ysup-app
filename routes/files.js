const express = require("express")
const multer = require("multer")
const { body, validationResult, query } = require("express-validator")
const File = require("../models/File")
const User = require("../models/User")
const Course = require("../models/Course")

const router = express.Router()

// Configure multer for file uploads (in production, use cloud storage)
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "image/jpeg",
      "image/png",
      "image/gif",
      "video/mp4",
      "audio/mpeg",
    ]

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error("File type not allowed"), false)
    }
  },
})

// @route   GET /api/files
// @desc    Get user's accessible files
// @access  Private
router.get(
  "/",
  [
    query("course").optional().isMongoId().withMessage("Valid course ID required"),
    query("type").optional().isIn(["pdf", "doc", "docx", "ppt", "pptx", "image", "video", "audio", "other"]),
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("Limit must be between 1 and 50"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { course, type, search, page = 1, limit = 20 } = req.query
      const skip = (page - 1) * limit

      const filters = { course, type, search }
      const files = await File.getAccessibleFiles(req.user.id, filters).skip(skip).limit(Number.parseInt(limit))

      const total = await File.countDocuments({
        $and: [
          {
            $or: [{ owner: req.user.id }, { isPublic: true }, { "sharedWith.user": req.user.id }],
          },
          { isActive: true },
          ...(course ? [{ course }] : []),
          ...(type ? [{ type }] : []),
          ...(search ? [{ $text: { $search: search } }] : []),
        ],
      })

      res.json({
        success: true,
        files,
        pagination: {
          current: Number.parseInt(page),
          pages: Math.ceil(total / limit),
          total,
        },
      })
    } catch (error) {
      console.error("Get files error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @route   POST /api/files/upload
// @desc    Upload a file
// @access  Private
router.post(
  "/upload",
  upload.single("file"),
  [
    body("description").optional().isLength({ max: 500 }).withMessage("Description too long"),
    body("course").optional().isMongoId().withMessage("Valid course ID required"),
    body("tags").optional().isArray().withMessage("Tags must be an array"),
    body("isPublic").optional().isBoolean().withMessage("isPublic must be boolean"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        })
      }

      const { description, course, tags = [], isPublic = false } = req.body

      // Verify course if provided
      if (course) {
        const courseDoc = await Course.findById(course)
        if (!courseDoc || !courseDoc.students.includes(req.user.id)) {
          return res.status(403).json({
            success: false,
            message: "You are not enrolled in this course",
          })
        }
      }

      // Determine file type
      const getFileType = (mimetype) => {
        if (mimetype.includes("pdf")) return "pdf"
        if (mimetype.includes("word") || mimetype.includes("document")) return "doc"
        if (mimetype.includes("powerpoint") || mimetype.includes("presentation")) return "ppt"
        if (mimetype.includes("image")) return "image"
        if (mimetype.includes("video")) return "video"
        if (mimetype.includes("audio")) return "audio"
        return "other"
      }

      // In production, upload to cloud storage (Cloudinary, AWS S3, etc.)
      const filename = `${Date.now()}-${req.file.originalname}`
      const url = `/uploads/${filename}` // Mock URL

      // Create file record
      const file = new File({
        filename,
        originalName: req.file.originalname,
        url,
        type: getFileType(req.file.mimetype),
        size: req.file.size,
        owner: req.user.id,
        course,
        description,
        tags,
        isPublic,
      })

      await file.save()
      await file.populate("owner", "firstName lastName username")
      await file.populate("course", "name code")

      // Award YBucks for sharing files
      const user = await User.findById(req.user.id)
      await user.addYBucks(150)

      res.status(201).json({
        success: true,
        message: "File uploaded successfully",
        file,
      })
    } catch (error) {
      console.error("Upload file error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @route   GET /api/files/:id
// @desc    Get file details
// @access  Private
router.get("/:id", async (req, res) => {
  try {
    const file = await File.findById(req.params.id)
      .populate("owner", "firstName lastName username")
      .populate("course", "name code")
      .populate("sharedWith.user", "firstName lastName username")

    if (!file || !file.isActive) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      })
    }

    // Check access permissions
    if (!file.hasAccess(req.user.id, "view")) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      })
    }

    // Record view
    await file.recordView(req.user.id)

    res.json({
      success: true,
      file,
    })
  } catch (error) {
    console.error("Get file error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   POST /api/files/:id/download
// @desc    Download a file
// @access  Private
router.post("/:id/download", async (req, res) => {
  try {
    const file = await File.findById(req.params.id)

    if (!file || !file.isActive) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      })
    }

    // Check download permissions
    if (!file.hasAccess(req.user.id, "download")) {
      return res.status(403).json({
        success: false,
        message: "Download access denied",
      })
    }

    // Record download
    await file.recordDownload(req.user.id)

    // Award YBucks for downloading educational content
    const user = await User.findById(req.user.id)
    await user.addYBucks(25)

    res.json({
      success: true,
      message: "Download recorded",
      downloadUrl: file.url,
    })
  } catch (error) {
    console.error("Download file error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   POST /api/files/:id/share
// @desc    Share file with user
// @access  Private
router.post(
  "/:id/share",
  [
    body("userId").isMongoId().withMessage("Valid user ID required"),
    body("permission").isIn(["view", "download", "edit"]).withMessage("Invalid permission level"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { userId, permission } = req.body

      const file = await File.findById(req.params.id)
      if (!file || !file.isActive) {
        return res.status(404).json({
          success: false,
          message: "File not found",
        })
      }

      // Check if user owns the file
      if (!file.owner.equals(req.user.id)) {
        return res.status(403).json({
          success: false,
          message: "Only file owner can share files",
        })
      }

      // Verify target user exists
      const targetUser = await User.findById(userId)
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        })
      }

      await file.shareWith(userId, permission)

      res.json({
        success: true,
        message: "File shared successfully",
      })
    } catch (error) {
      console.error("Share file error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @route   DELETE /api/files/:id
// @desc    Delete file
// @access  Private
router.delete("/:id", async (req, res) => {
  try {
    const file = await File.findById(req.params.id)
    if (!file || !file.isActive) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      })
    }

    // Check if user owns the file
    if (!file.owner.equals(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Only file owner can delete files",
      })
    }

    // Soft delete
    file.isActive = false
    await file.save()

    res.json({
      success: true,
      message: "File deleted successfully",
    })
  } catch (error) {
    console.error("Delete file error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

module.exports = router
