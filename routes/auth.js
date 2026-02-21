const express = require("express")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const { body, validationResult } = require("express-validator")
const User = require("../models/User")
const authMiddleware = require("../middleware/auth")

const router = express.Router()

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "fallback_secret", {
    expiresIn: "7d",
  })
}

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  "/register",
  [
    body("firstName").trim().isLength({ min: 1 }).withMessage("First name is required"),
    body("lastName").trim().isLength({ min: 1 }).withMessage("Last name is required"),
    body("username").trim().isLength({ min: 3 }).withMessage("Username must be at least 3 characters"),
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("phone").isMobilePhone().withMessage("Please provide a valid phone number"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("college").trim().isLength({ min: 1 }).withMessage("College is required"),
    body("major").trim().isLength({ min: 1 }).withMessage("Major is required"),
    body("year").isIn(["Freshman", "Sophomore", "Junior", "Senior", "Graduate"]).withMessage("Invalid year"),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { firstName, lastName, username, email, phone, password, college, major, year } = req.body

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }, { phone }],
      })

      if (existingUser) {
        let field = "email"
        if (existingUser.username === username) field = "username"
        if (existingUser.phone === phone) field = "phone"

        return res.status(400).json({
          success: false,
          message: `User with this ${field} already exists`,
        })
      }

      // Create new user
      const user = new User({
        firstName,
        lastName,
        username,
        email,
        phone,
        password,
        college,
        major,
        year,
      })

      await user.save()

      // Generate token
      const token = generateToken(user._id)

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
          college: user.college,
          major: user.major,
          year: user.year,
          ybucks: user.ybucks,
          level: user.level,
        },
      })
    } catch (error) {
      console.error("Registration error:", error)
      res.status(500).json({
        success: false,
        message: "Server error during registration",
      })
    }
  },
)

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  "/login",
  [
    body("identifier").trim().isLength({ min: 1 }).withMessage("Email, username, or phone is required"),
    body("password").isLength({ min: 1 }).withMessage("Password is required"),
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

      const { identifier, password } = req.body

      // Find user by email, username, or phone
      const user = await User.findOne({
        $or: [{ email: identifier }, { username: identifier }, { phone: identifier }],
      })

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid credentials",
        })
      }

      // Check password
      const isMatch = await user.comparePassword(password)
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Invalid credentials",
        })
      }

      // Update online status
      user.isOnline = true
      user.lastSeen = new Date()
      await user.save()

      // Generate token
      const token = generateToken(user._id)

      res.json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
          college: user.college,
          major: user.major,
          year: user.year,
          ybucks: user.ybucks,
          level: user.level,
          profileImage: user.profileImage,
        },
      })
    } catch (error) {
      console.error("Login error:", error)
      res.status(500).json({
        success: false,
        message: "Server error during login",
      })
    }
  },
)

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post("/logout", authMiddleware, async (req, res) => {
  try {
    // Update user's online status
    await User.findByIdAndUpdate(req.user.id, {
      isOnline: false,
      lastSeen: new Date(),
    })

    res.json({
      success: true,
      message: "Logout successful",
    })
  } catch (error) {
    console.error("Logout error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during logout",
    })
  }
})

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("courses", "name code")
      .populate("friends", "firstName lastName username profileImage isOnline")

    res.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put(
  "/profile",
  authMiddleware,
  [
    body("firstName").optional().trim().isLength({ min: 1 }),
    body("lastName").optional().trim().isLength({ min: 1 }),
    body("bio").optional().isLength({ max: 500 }),
    body("major").optional().trim().isLength({ min: 1 }),
    body("year").optional().isIn(["Freshman", "Sophomore", "Junior", "Senior", "Graduate"]),
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

      const allowedUpdates = ["firstName", "lastName", "bio", "major", "year", "profileImage"]
      const updates = {}

      Object.keys(req.body).forEach((key) => {
        if (allowedUpdates.includes(key)) {
          updates[key] = req.body[key]
        }
      })

      const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true })

      res.json({
        success: true,
        message: "Profile updated successfully",
        user,
      })
    } catch (error) {
      console.error("Profile update error:", error)
      res.status(500).json({
        success: false,
        message: "Server error during profile update",
      })
    }
  },
)

// @route   PUT /api/auth/password
// @desc    Change password
// @access  Private
router.put(
  "/password",
  authMiddleware,
  [
    body("currentPassword").isLength({ min: 1 }).withMessage("Current password is required"),
    body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
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

      const { currentPassword, newPassword } = req.body

      const user = await User.findById(req.user.id)

      // Verify current password
      const isMatch = await user.comparePassword(currentPassword)
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        })
      }

      // Update password
      user.password = newPassword
      await user.save()

      res.json({
        success: true,
        message: "Password updated successfully",
      })
    } catch (error) {
      console.error("Password change error:", error)
      res.status(500).json({
        success: false,
        message: "Server error during password change",
      })
    }
  },
)

module.exports = router
