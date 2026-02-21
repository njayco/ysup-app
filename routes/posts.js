const express = require("express")
const { body, validationResult, query } = require("express-validator")
const Post = require("../models/Post")
const User = require("../models/User")
const Course = require("../models/Course")

const router = express.Router()

// @route   GET /api/posts
// @desc    Get posts for a course
// @access  Private
router.get(
  "/",
  [
    query("course").isMongoId().withMessage("Valid course ID is required"),
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("Limit must be between 1 and 50"),
    query("sort").optional().isIn(["newest", "oldest", "popular", "activity"]).withMessage("Invalid sort option"),
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

      const { course, page = 1, limit = 20, sort = "activity", search, type } = req.query

      // Check if user is enrolled in the course
      const courseDoc = await Course.findById(course)
      if (!courseDoc) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        })
      }

      if (!courseDoc.students.includes(req.user.id)) {
        return res.status(403).json({
          success: false,
          message: "You are not enrolled in this course",
        })
      }

      // Build query
      const query_obj = { course }
      if (type) query_obj.type = type
      if (search) {
        query_obj.$text = { $search: search }
      }

      // Build sort
      let sortObj = {}
      switch (sort) {
        case "newest":
          sortObj = { createdAt: -1 }
          break
        case "oldest":
          sortObj = { createdAt: 1 }
          break
        case "popular":
          sortObj = { cosigns: -1, createdAt: -1 }
          break
        case "activity":
        default:
          sortObj = { isPinned: -1, lastActivity: -1 }
          break
      }

      const skip = (page - 1) * limit

      const posts = await Post.find(query_obj)
        .populate("author", "firstName lastName username profileImage")
        .populate("responses.author", "firstName lastName username profileImage")
        .populate("cosigns.user", "firstName lastName username")
        .sort(sortObj)
        .skip(skip)
        .limit(Number.parseInt(limit))

      const total = await Post.countDocuments(query_obj)

      res.json({
        success: true,
        posts,
        pagination: {
          current: Number.parseInt(page),
          pages: Math.ceil(total / limit),
          total,
        },
      })
    } catch (error) {
      console.error("Get posts error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post(
  "/",
  [
    body("course").isMongoId().withMessage("Valid course ID is required"),
    body("content").trim().isLength({ min: 1, max: 1000 }).withMessage("Content must be between 1 and 1000 characters"),
    body("type")
      .optional()
      .isIn(["question", "announcement", "discussion", "study-group"])
      .withMessage("Invalid post type"),
    body("tags").optional().isArray().withMessage("Tags must be an array"),
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

      const { course, content, type = "discussion", tags = [] } = req.body

      // Check if user is enrolled in the course
      const courseDoc = await Course.findById(course)
      if (!courseDoc) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        })
      }

      if (!courseDoc.students.includes(req.user.id)) {
        return res.status(403).json({
          success: false,
          message: "You are not enrolled in this course",
        })
      }

      // Create post
      const post = new Post({
        author: req.user.id,
        course,
        content,
        type,
        tags,
      })

      await post.save()

      // Award YBucks to user
      const user = await User.findById(req.user.id)
      await user.addYBucks(100) // 100 YBucks for creating a post

      // Populate post data
      await post.populate("author", "firstName lastName username profileImage")

      res.status(201).json({
        success: true,
        message: "Post created successfully",
        post,
      })
    } catch (error) {
      console.error("Create post error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @route   GET /api/posts/:id
// @desc    Get a specific post
// @access  Private
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "firstName lastName username profileImage")
      .populate("responses.author", "firstName lastName username profileImage")
      .populate("cosigns.user", "firstName lastName username")
      .populate("course", "name code")

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      })
    }

    // Check if user has access to this post (enrolled in course)
    const course = await Course.findById(post.course._id)
    if (!course.students.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      })
    }

    // Increment views
    await post.incrementViews()

    res.json({
      success: true,
      post,
    })
  } catch (error) {
    console.error("Get post error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   POST /api/posts/:id/cosign
// @desc    Cosign/uncosign a post
// @access  Private
router.post("/:id/cosign", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      })
    }

    // Check if user has access
    const course = await Course.findById(post.course)
    if (!course.students.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      })
    }

    const existingCosign = post.cosigns.find((cosign) => cosign.user.equals(req.user.id))

    if (existingCosign) {
      // Remove cosign
      await post.removeCosign(req.user.id)
    } else {
      // Add cosign
      await post.addCosign(req.user.id)

      // Award YBucks to user
      const user = await User.findById(req.user.id)
      await user.addYBucks(100) // 100 YBucks for cosigning
    }

    await post.populate("cosigns.user", "firstName lastName username")

    res.json({
      success: true,
      message: existingCosign ? "Cosign removed" : "Post cosigned",
      cosigns: post.cosigns,
    })
  } catch (error) {
    console.error("Cosign post error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   POST /api/posts/:id/responses
// @desc    Add a response to a post
// @access  Private
router.post(
  "/:id/responses",
  [body("content").trim().isLength({ min: 1, max: 500 }).withMessage("Response must be between 1 and 500 characters")],
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

      const { content } = req.body

      const post = await Post.findById(req.params.id)
      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Post not found",
        })
      }

      // Check if user has access
      const course = await Course.findById(post.course)
      if (!course.students.includes(req.user.id)) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        })
      }

      // Add response
      await post.addResponse(req.user.id, content)

      // Award YBucks to user
      const user = await User.findById(req.user.id)
      await user.addYBucks(100) // 100 YBucks for responding

      // Populate response data
      await post.populate("responses.author", "firstName lastName username profileImage")

      res.status(201).json({
        success: true,
        message: "Response added successfully",
        responses: post.responses,
      })
    } catch (error) {
      console.error("Add response error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      })
    }

    // Check if user is the author
    if (!post.author.equals(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this post",
      })
    }

    await Post.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: "Post deleted successfully",
    })
  } catch (error) {
    console.error("Delete post error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

module.exports = router
