const express = require("express")
const { query, validationResult } = require("express-validator")

const router = express.Router()

// Mock academy content (in production, this would be from a database)
const academyContent = {
  featured: [
    {
      id: "1",
      title: "Introduction to College Success",
      description: "Learn the essential skills needed to succeed in your college journey",
      type: "course",
      duration: "2 hours",
      thumbnail: "/placeholder.svg?height=200&width=300&query=college+success",
      category: "study-skills",
      difficulty: "beginner",
      rating: 4.8,
      enrollments: 1250,
    },
    {
      id: "2",
      title: "The Science of Learning",
      description: "Discover how your brain learns and how to optimize your study methods",
      type: "video",
      duration: "45 minutes",
      thumbnail: "/placeholder.svg?height=200&width=300&query=brain+learning",
      category: "study-skills",
      difficulty: "intermediate",
      rating: 4.9,
      enrollments: 890,
    },
    {
      id: "3",
      title: "Financial Literacy for Students",
      description: "Master personal finance, budgeting, and student loan management",
      type: "course",
      duration: "3 hours",
      thumbnail: "/placeholder.svg?height=200&width=300&query=financial+literacy",
      category: "life-skills",
      difficulty: "beginner",
      rating: 4.7,
      enrollments: 2100,
    },
  ],
  categories: [
    {
      id: "study-skills",
      name: "Study Skills",
      description: "Improve your learning techniques and academic performance",
      icon: "📚",
      courseCount: 25,
    },
    {
      id: "life-skills",
      name: "Life Skills",
      description: "Essential skills for personal and professional success",
      icon: "🎯",
      courseCount: 18,
    },
    {
      id: "career-prep",
      name: "Career Preparation",
      description: "Get ready for your future career with practical skills",
      icon: "💼",
      courseCount: 22,
    },
    {
      id: "wellness",
      name: "Health & Wellness",
      description: "Maintain physical and mental health during college",
      icon: "🧘",
      courseCount: 15,
    },
    {
      id: "technology",
      name: "Technology Skills",
      description: "Master digital tools and technologies for academic success",
      icon: "💻",
      courseCount: 30,
    },
    {
      id: "communication",
      name: "Communication",
      description: "Develop strong written and verbal communication skills",
      icon: "🗣️",
      courseCount: 20,
    },
  ],
  movies: [
    {
      id: "movie1",
      title: "The Power of Persistence",
      description: "An inspiring story about overcoming academic challenges",
      type: "movie",
      duration: "90 minutes",
      thumbnail: "/placeholder.svg?height=200&width=300&query=persistence+movie",
      category: "motivation",
      rating: 4.6,
      views: 15000,
      releaseYear: 2023,
    },
    {
      id: "movie2",
      title: "Innovation in Education",
      description: "Exploring how technology is transforming learning",
      type: "documentary",
      duration: "75 minutes",
      thumbnail: "/placeholder.svg?height=200&width=300&query=education+innovation",
      category: "technology",
      rating: 4.8,
      views: 8500,
      releaseYear: 2023,
    },
  ],
}

// @route   GET /api/academy/featured
// @desc    Get featured academy content
// @access  Private
router.get("/featured", async (req, res) => {
  try {
    res.json({
      success: true,
      featured: academyContent.featured,
    })
  } catch (error) {
    console.error("Get featured content error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/academy/categories
// @desc    Get academy categories
// @access  Private
router.get("/categories", async (req, res) => {
  try {
    res.json({
      success: true,
      categories: academyContent.categories,
    })
  } catch (error) {
    console.error("Get categories error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/academy/content
// @desc    Get academy content with filters
// @access  Private
router.get(
  "/content",
  [
    query("category").optional().isString().withMessage("Category must be a string"),
    query("type").optional().isIn(["course", "video", "movie", "documentary"]).withMessage("Invalid content type"),
    query("difficulty").optional().isIn(["beginner", "intermediate", "advanced"]).withMessage("Invalid difficulty"),
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

      const { category, type, difficulty, search, page = 1, limit = 20 } = req.query

      // Combine all content
      let allContent = [...academyContent.featured, ...academyContent.movies]

      // Apply filters
      if (category) {
        allContent = allContent.filter((content) => content.category === category)
      }

      if (type) {
        allContent = allContent.filter((content) => content.type === type)
      }

      if (difficulty) {
        allContent = allContent.filter((content) => content.difficulty === difficulty)
      }

      if (search) {
        const searchLower = search.toLowerCase()
        allContent = allContent.filter(
          (content) =>
            content.title.toLowerCase().includes(searchLower) ||
            content.description.toLowerCase().includes(searchLower),
        )
      }

      // Sort by rating and enrollments
      allContent.sort((a, b) => {
        const aScore = (a.rating || 0) * (a.enrollments || a.views || 0)
        const bScore = (b.rating || 0) * (b.enrollments || b.views || 0)
        return bScore - aScore
      })

      // Pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + Number.parseInt(limit)
      const paginatedContent = allContent.slice(startIndex, endIndex)

      res.json({
        success: true,
        content: paginatedContent,
        pagination: {
          current: Number.parseInt(page),
          pages: Math.ceil(allContent.length / limit),
          total: allContent.length,
        },
        filters: {
          categories: academyContent.categories.map((cat) => ({ id: cat.id, name: cat.name })),
          types: ["course", "video", "movie", "documentary"],
          difficulties: ["beginner", "intermediate", "advanced"],
        },
      })
    } catch (error) {
      console.error("Get academy content error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @route   GET /api/academy/content/:id
// @desc    Get specific academy content
// @access  Private
router.get("/content/:id", async (req, res) => {
  try {
    const { id } = req.params

    // Search in all content
    const allContent = [...academyContent.featured, ...academyContent.movies]
    const content = allContent.find((item) => item.id === id)

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      })
    }

    // Increment views if it's a movie/video
    if (content.views !== undefined) {
      content.views += 1
    }

    // Award YBucks for viewing content
    const User = require("../models/User")
    const user = await User.findById(req.user.id)
    await user.addYBucks(50) // 50 YBucks for viewing educational content

    res.json({
      success: true,
      content,
    })
  } catch (error) {
    console.error("Get academy content error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/academy/movies
// @desc    Get YsUp Academy movies
// @access  Private
router.get("/movies", async (req, res) => {
  try {
    const { genre, year, page = 1, limit = 20 } = req.query

    let movies = [...academyContent.movies]

    // Apply filters
    if (genre) {
      movies = movies.filter((movie) => movie.category === genre)
    }

    if (year) {
      movies = movies.filter((movie) => movie.releaseYear === Number.parseInt(year))
    }

    // Sort by rating and views
    movies.sort((a, b) => b.rating * b.views - a.rating * a.views)

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + Number.parseInt(limit)
    const paginatedMovies = movies.slice(startIndex, endIndex)

    res.json({
      success: true,
      movies: paginatedMovies,
      pagination: {
        current: Number.parseInt(page),
        pages: Math.ceil(movies.length / limit),
        total: movies.length,
      },
    })
  } catch (error) {
    console.error("Get academy movies error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   POST /api/academy/progress
// @desc    Track user progress in academy content
// @access  Private
router.post("/progress", async (req, res) => {
  try {
    const { contentId, progress, completed = false } = req.body

    // In production, you would save this to a UserProgress model
    // For now, just award YBucks for completion
    if (completed) {
      const User = require("../models/User")
      const user = await User.findById(req.user.id)
      await user.addYBucks(200) // 200 YBucks for completing content

      res.json({
        success: true,
        message: "Progress saved and YBucks awarded",
        ybucksAwarded: 200,
      })
    } else {
      res.json({
        success: true,
        message: "Progress saved",
      })
    }
  } catch (error) {
    console.error("Save progress error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

module.exports = router
