const express = require("express")
const { body, validationResult, query } = require("express-validator")
const User = require("../models/User")

const router = express.Router()

// Mock bulletin board posts (in production, this would be a separate model)
const bulletinPosts = [
  {
    id: "1",
    title: "Study Group for Calculus II",
    description:
      "Looking for students to form a study group for Calculus II. We meet every Tuesday and Thursday at 6 PM in the library.",
    author: {
      id: "user1",
      name: "Sarah Johnson",
      username: "sarah_j",
    },
    category: "academic",
    tags: ["study-group", "calculus", "mathematics"],
    location: "Main Library",
    date: "2024-01-15",
    time: "18:00",
    contact: "sarah.j@university.edu",
    isSponsored: false,
    views: 45,
    interested: 12,
    createdAt: new Date("2024-01-10"),
    expiresAt: new Date("2024-02-15"),
    isActive: true,
  },
  {
    id: "2",
    title: "Campus Winter Formal Dance",
    description:
      "Join us for the annual Winter Formal Dance! Tickets are $25 and include dinner and dancing. Dress code: formal attire.",
    author: {
      id: "user2",
      name: "Student Activities Board",
      username: "sab_official",
    },
    category: "social",
    tags: ["dance", "formal", "winter"],
    location: "Student Union Ballroom",
    date: "2024-02-14",
    time: "19:00",
    contact: "sab@university.edu",
    isSponsored: true,
    views: 234,
    interested: 89,
    createdAt: new Date("2024-01-05"),
    expiresAt: new Date("2024-02-14"),
    isActive: true,
  },
  {
    id: "3",
    title: "Free Pizza Night",
    description: "Free pizza for all students! Come hang out and meet new people. First come, first served.",
    author: {
      id: "user3",
      name: "Residence Hall Association",
      username: "rha_official",
    },
    category: "social",
    tags: ["food", "free", "social"],
    location: "Residence Hall Common Room",
    date: "2024-01-20",
    time: "20:00",
    contact: "rha@university.edu",
    isSponsored: false,
    views: 156,
    interested: 67,
    createdAt: new Date("2024-01-12"),
    expiresAt: new Date("2024-01-20"),
    isActive: true,
  },
]

// @route   GET /api/bulletin/posts
// @desc    Get bulletin board posts
// @access  Private
router.get(
  "/posts",
  [
    query("category").optional().isIn(["academic", "social", "sports", "clubs", "jobs", "housing", "other"]),
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

      const { category, search, page = 1, limit = 20, sponsored } = req.query
      let posts = [...bulletinPosts].filter((post) => post.isActive)

      // Apply filters
      if (category) {
        posts = posts.filter((post) => post.category === category)
      }

      if (search) {
        const searchLower = search.toLowerCase()
        posts = posts.filter(
          (post) =>
            post.title.toLowerCase().includes(searchLower) ||
            post.description.toLowerCase().includes(searchLower) ||
            post.tags.some((tag) => tag.toLowerCase().includes(searchLower)),
        )
      }

      if (sponsored === "true") {
        posts = posts.filter((post) => post.isSponsored)
      }

      // Sort by sponsored first, then by creation date
      posts.sort((a, b) => {
        if (a.isSponsored && !b.isSponsored) return -1
        if (!a.isSponsored && b.isSponsored) return 1
        return new Date(b.createdAt) - new Date(a.createdAt)
      })

      // Pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + Number.parseInt(limit)
      const paginatedPosts = posts.slice(startIndex, endIndex)

      res.json({
        success: true,
        posts: paginatedPosts,
        pagination: {
          current: Number.parseInt(page),
          pages: Math.ceil(posts.length / limit),
          total: posts.length,
        },
        categories: ["academic", "social", "sports", "clubs", "jobs", "housing", "other"],
      })
    } catch (error) {
      console.error("Get bulletin posts error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @route   POST /api/bulletin/posts
// @desc    Create a new bulletin post
// @access  Private
router.post(
  "/posts",
  [
    body("title").trim().isLength({ min: 1, max: 100 }).withMessage("Title must be between 1 and 100 characters"),
    body("description")
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage("Description must be between 1 and 1000 characters"),
    body("category")
      .isIn(["academic", "social", "sports", "clubs", "jobs", "housing", "other"])
      .withMessage("Invalid category"),
    body("date").optional().isISO8601().withMessage("Invalid date format"),
    body("time")
      .optional()
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage("Invalid time format"),
    body("tags").optional().isArray().withMessage("Tags must be an array"),
    body("expiresAt").optional().isISO8601().withMessage("Invalid expiration date"),
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

      const { title, description, category, location, date, time, contact, tags = [], expiresAt } = req.body

      // Get user info
      const user = await User.findById(req.user.id).select("firstName lastName username")

      // Create new post
      const newPost = {
        id: Date.now().toString(),
        title,
        description,
        author: {
          id: user._id.toString(),
          name: `${user.firstName} ${user.lastName}`,
          username: user.username,
        },
        category,
        location,
        date,
        time,
        contact: contact || user.email,
        tags,
        isSponsored: false, // Regular users can't create sponsored posts
        views: 0,
        interested: 0,
        createdAt: new Date(),
        expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
        isActive: true,
      }

      bulletinPosts.unshift(newPost)

      // Award YBucks for creating a post
      await user.addYBucks(100)

      res.status(201).json({
        success: true,
        message: "Bulletin post created successfully",
        post: newPost,
      })
    } catch (error) {
      console.error("Create bulletin post error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @route   GET /api/bulletin/posts/:id
// @desc    Get specific bulletin post
// @access  Private
router.get("/posts/:id", async (req, res) => {
  try {
    const post = bulletinPosts.find((post) => post.id === req.params.id && post.isActive)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      })
    }

    // Increment views
    post.views += 1

    res.json({
      success: true,
      post,
    })
  } catch (error) {
    console.error("Get bulletin post error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   POST /api/bulletin/posts/:id/interest
// @desc    Express interest in a bulletin post
// @access  Private
router.post("/posts/:id/interest", async (req, res) => {
  try {
    const post = bulletinPosts.find((post) => post.id === req.params.id && post.isActive)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      })
    }

    // In production, you'd track which users showed interest
    // For now, just increment the counter
    post.interested += 1

    // Award YBucks for showing interest
    const user = await User.findById(req.user.id)
    await user.addYBucks(25)

    res.json({
      success: true,
      message: "Interest recorded successfully",
      interested: post.interested,
    })
  } catch (error) {
    console.error("Express interest error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   DELETE /api/bulletin/posts/:id
// @desc    Delete bulletin post
// @access  Private
router.delete("/posts/:id", async (req, res) => {
  try {
    const postIndex = bulletinPosts.findIndex((post) => post.id === req.params.id)

    if (postIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      })
    }

    const post = bulletinPosts[postIndex]

    // Check if user is the author
    if (post.author.id !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this post",
      })
    }

    // Mark as inactive instead of deleting
    post.isActive = false

    res.json({
      success: true,
      message: "Post deleted successfully",
    })
  } catch (error) {
    console.error("Delete bulletin post error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/bulletin/my-posts
// @desc    Get user's bulletin posts
// @access  Private
router.get("/my-posts", async (req, res) => {
  try {
    const userPosts = bulletinPosts.filter((post) => post.author.id === req.user.id.toString())

    res.json({
      success: true,
      posts: userPosts,
    })
  } catch (error) {
    console.error("Get user posts error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

module.exports = router
