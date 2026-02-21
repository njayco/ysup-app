const express = require("express")
const { body, validationResult, query } = require("express-validator")
const GameSession = require("../models/GameSession")
const User = require("../models/User")
const Course = require("../models/Course")

const router = express.Router()

// @route   POST /api/game/session
// @desc    Create a new game session
// @access  Private
router.post(
  "/session",
  [
    body("course").isMongoId().withMessage("Valid course ID is required"),
    body("students").isArray({ min: 1 }).withMessage("At least one student is required"),
    body("students.*").isMongoId().withMessage("All student IDs must be valid"),
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

      const { course, students } = req.body

      // Verify course exists and user has access
      const courseDoc = await Course.findById(course)
      if (!courseDoc) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        })
      }

      // Check if there's already an active session for this course
      const existingSession = await GameSession.findOne({
        course,
        isActive: true,
      })

      if (existingSession) {
        return res.status(400).json({
          success: false,
          message: "An active game session already exists for this course",
        })
      }

      // Verify all students exist
      const studentDocs = await User.find({ _id: { $in: students } })
      if (studentDocs.length !== students.length) {
        return res.status(400).json({
          success: false,
          message: "One or more students not found",
        })
      }

      // Create game session
      const gameSession = new GameSession({
        course,
        teacher: req.user.id,
        students: students.map((studentId, index) => ({
          user: studentId,
          isCaptain: index === 0, // First student is captain
        })),
      })

      await gameSession.save()
      await gameSession.populate("students.user", "firstName lastName username")
      await gameSession.populate("course", "name code")

      res.status(201).json({
        success: true,
        message: "Game session created successfully",
        session: gameSession,
      })
    } catch (error) {
      console.error("Create game session error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @route   GET /api/game/session/:courseId
// @desc    Get active game session for a course
// @access  Private
router.get("/session/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params

    const session = await GameSession.findOne({
      course: courseId,
      isActive: true,
    })
      .populate("students.user", "firstName lastName username profileImage")
      .populate("course", "name code")
      .populate("teacher", "firstName lastName username")

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "No active game session found",
      })
    }

    res.json({
      success: true,
      session,
    })
  } catch (error) {
    console.error("Get game session error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   POST /api/game/award-points
// @desc    Award points to a student
// @access  Private
router.post(
  "/award-points",
  [
    body("sessionId").isMongoId().withMessage("Valid session ID is required"),
    body("studentId").isMongoId().withMessage("Valid student ID is required"),
    body("eventType")
      .isIn(["question", "assist", "correct_answer", "good_behavior", "attendance"])
      .withMessage("Invalid event type"),
    body("points").isInt({ min: 1 }).withMessage("Points must be a positive integer"),
    body("description").optional().isString().withMessage("Description must be a string"),
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

      const { sessionId, studentId, eventType, points, description } = req.body

      const session = await GameSession.findById(sessionId)
      if (!session) {
        return res.status(404).json({
          success: false,
          message: "Game session not found",
        })
      }

      if (!session.isActive) {
        return res.status(400).json({
          success: false,
          message: "Game session is not active",
        })
      }

      // Check if user is the teacher
      if (!session.teacher.equals(req.user.id)) {
        return res.status(403).json({
          success: false,
          message: "Only the teacher can award points",
        })
      }

      // Award points
      await session.awardPoints(studentId, eventType, points, description)

      // Update user's total YBucks
      const user = await User.findById(studentId)
      await user.addYBucks(points)

      await session.populate("students.user", "firstName lastName username")

      res.json({
        success: true,
        message: "Points awarded successfully",
        session,
      })
    } catch (error) {
      console.error("Award points error:", error)
      res.status(500).json({
        success: false,
        message: error.message || "Server error",
      })
    }
  },
)

// @route   POST /api/game/teacher-points
// @desc    Award points to teacher
// @access  Private
router.post(
  "/teacher-points",
  [
    body("sessionId").isMongoId().withMessage("Valid session ID is required"),
    body("points").isInt({ min: 1 }).withMessage("Points must be a positive integer"),
    body("description").optional().isString().withMessage("Description must be a string"),
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

      const { sessionId, points, description = "No questions asked" } = req.body

      const session = await GameSession.findById(sessionId)
      if (!session) {
        return res.status(404).json({
          success: false,
          message: "Game session not found",
        })
      }

      if (!session.teacher.equals(req.user.id)) {
        return res.status(403).json({
          success: false,
          message: "Only the teacher can award themselves points",
        })
      }

      await session.awardTeacherPoints(points, description)

      res.json({
        success: true,
        message: "Teacher points awarded successfully",
        session,
      })
    } catch (error) {
      console.error("Award teacher points error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @route   PUT /api/game/captain
// @desc    Set team captain
// @access  Private
router.put(
  "/captain",
  [
    body("sessionId").isMongoId().withMessage("Valid session ID is required"),
    body("studentId").isMongoId().withMessage("Valid student ID is required"),
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

      const { sessionId, studentId } = req.body

      const session = await GameSession.findById(sessionId)
      if (!session) {
        return res.status(404).json({
          success: false,
          message: "Game session not found",
        })
      }

      if (!session.teacher.equals(req.user.id)) {
        return res.status(403).json({
          success: false,
          message: "Only the teacher can set the captain",
        })
      }

      await session.setCaptain(studentId)
      await session.populate("students.user", "firstName lastName username")

      res.json({
        success: true,
        message: "Captain set successfully",
        session,
      })
    } catch (error) {
      console.error("Set captain error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @route   POST /api/game/attendance
// @desc    Mark student attendance
// @access  Private
router.post(
  "/attendance",
  [
    body("sessionId").isMongoId().withMessage("Valid session ID is required"),
    body("studentId").isMongoId().withMessage("Valid student ID is required"),
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

      const { sessionId, studentId } = req.body

      const session = await GameSession.findById(sessionId)
      if (!session) {
        return res.status(404).json({
          success: false,
          message: "Game session not found",
        })
      }

      if (!session.teacher.equals(req.user.id)) {
        return res.status(403).json({
          success: false,
          message: "Only the teacher can mark attendance",
        })
      }

      await session.markAttendance(studentId)

      // Update user's total YBucks
      const user = await User.findById(studentId)
      await user.addYBucks(session.rules.attendancePoints)

      await session.populate("students.user", "firstName lastName username")

      res.json({
        success: true,
        message: "Attendance marked successfully",
        session,
      })
    } catch (error) {
      console.error("Mark attendance error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @route   GET /api/game/leaderboard/:sessionId
// @desc    Get session leaderboard
// @access  Private
router.get("/leaderboard/:sessionId", async (req, res) => {
  try {
    const session = await GameSession.findById(req.params.sessionId).populate(
      "students.user",
      "firstName lastName username profileImage",
    )

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Game session not found",
      })
    }

    const leaderboard = session.getLeaderboard()

    res.json({
      success: true,
      leaderboard,
      teacherScore: session.teacherYBucks,
      classTotal: session.totalClassYBucks,
    })
  } catch (error) {
    console.error("Get leaderboard error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   PUT /api/game/end-session/:sessionId
// @desc    End game session
// @access  Private
router.put("/end-session/:sessionId", async (req, res) => {
  try {
    const session = await GameSession.findById(req.params.sessionId)
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Game session not found",
      })
    }

    if (!session.teacher.equals(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Only the teacher can end the session",
      })
    }

    await session.endSession()

    res.json({
      success: true,
      message: "Game session ended successfully",
    })
  } catch (error) {
    console.error("End session error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

module.exports = router
