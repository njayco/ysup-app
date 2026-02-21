const express = require("express")
const { body, validationResult, query } = require("express-validator")
const Course = require("../models/Course")
const User = require("../models/User")

const router = express.Router()

// @route   GET /api/courses
// @desc    Get courses (with search and filters)
// @access  Private
router.get(
  "/",
  [
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

      const { page = 1, limit = 20, search, college, department, semester, year } = req.query
      const skip = (page - 1) * limit

      // Build query
      const query = { isActive: true }

      if (search) {
        query.$text = { $search: search }
      }
      if (college) query.college = { $regex: college, $options: "i" }
      if (department) query.department = { $regex: department, $options: "i" }
      if (semester) query.semester = semester
      if (year) query.year = Number.parseInt(year)

      const courses = await Course.find(query)
        .populate("students", "firstName lastName username")
        .skip(skip)
        .limit(Number.parseInt(limit))
        .sort({ createdAt: -1 })

      const total = await Course.countDocuments(query)

      res.json({
        success: true,
        courses,
        pagination: {
          current: Number.parseInt(page),
          pages: Math.ceil(total / limit),
          total,
        },
      })
    } catch (error) {
      console.error("Get courses error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @route   GET /api/courses/:id
// @desc    Get course details
// @access  Private
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate("students", "firstName lastName username profileImage")

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    // Check if user is enrolled
    const isEnrolled = course.students.some((student) => student._id.equals(req.user.id))

    res.json({
      success: true,
      course: {
        ...course.toJSON(),
        isEnrolled,
      },
    })
  } catch (error) {
    console.error("Get course error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   POST /api/courses/:id/enroll
// @desc    Enroll in a course
// @access  Private
router.post("/:id/enroll", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    if (!course.isActive) {
      return res.status(400).json({
        success: false,
        message: "Course is not active",
      })
    }

    if (course.isFull()) {
      return res.status(400).json({
        success: false,
        message: "Course is full",
      })
    }

    if (course.students.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "Already enrolled in this course",
      })
    }

    // Add student to course
    await course.addStudent(req.user.id)

    // Add course to user
    const user = await User.findById(req.user.id)
    if (!user.courses.includes(course._id)) {
      user.courses.push(course._id)
      await user.save()
    }

    // Award YBucks for enrollment
    await user.addYBucks(100)

    res.json({
      success: true,
      message: "Successfully enrolled in course",
    })
  } catch (error) {
    console.error("Enroll in course error:", error)
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    })
  }
})

// @route   DELETE /api/courses/:id/enroll
// @desc    Unenroll from a course
// @access  Private
router.delete("/:id/enroll", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    if (!course.students.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "Not enrolled in this course",
      })
    }

    // Remove student from course
    await course.removeStudent(req.user.id)

    // Remove course from user
    const user = await User.findById(req.user.id)
    user.courses = user.courses.filter((courseId) => !courseId.equals(course._id))
    await user.save()

    res.json({
      success: true,
      message: "Successfully unenrolled from course",
    })
  } catch (error) {
    console.error("Unenroll from course error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/courses/me/enrolled
// @desc    Get user's enrolled courses
// @access  Private
router.get("/me/enrolled", async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "courses",
      match: { isActive: true },
      populate: {
        path: "students",
        select: "firstName lastName username",
      },
    })

    res.json({
      success: true,
      courses: user.courses,
    })
  } catch (error) {
    console.error("Get enrolled courses error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   POST /api/courses/:id/announcements
// @desc    Add course announcement (instructor only)
// @access  Private
router.post(
  "/:id/announcements",
  [
    body("title").trim().isLength({ min: 1, max: 100 }).withMessage("Title must be between 1 and 100 characters"),
    body("content").trim().isLength({ min: 1, max: 1000 }).withMessage("Content must be between 1 and 1000 characters"),
    body("priority").optional().isIn(["low", "medium", "high"]).withMessage("Invalid priority level"),
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

      const { title, content, priority = "medium" } = req.body

      const course = await Course.findById(req.params.id)
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        })
      }

      // Add announcement
      course.announcements.unshift({
        title,
        content,
        priority,
      })

      await course.save()

      res.status(201).json({
        success: true,
        message: "Announcement added successfully",
        announcement: course.announcements[0],
      })
    } catch (error) {
      console.error("Add announcement error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

module.exports = router
