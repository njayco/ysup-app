const express = require("express")
const { body, validationResult, query } = require("express-validator")
const User = require("../models/User")

const router = express.Router()

// Mock bookstore items (in production, this would be a separate model)
const bookstoreItems = [
  {
    id: "1",
    name: "YsUp Campus T-Shirt",
    description: "Official YsUp Campus Network t-shirt",
    price: 500, // in YBucks
    category: "clothing",
    image: "/placeholder.svg?height=200&width=200&query=ysup+tshirt",
    inStock: true,
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "2",
    name: "Calculus Textbook",
    description: "Essential calculus textbook for mathematics courses",
    price: 1200,
    category: "books",
    image: "/placeholder.svg?height=200&width=200&query=calculus+textbook",
    inStock: true,
  },
  {
    id: "3",
    name: "YsUp Hoodie",
    description: "Comfortable hoodie with YsUp logo",
    price: 800,
    category: "clothing",
    image: "/placeholder.svg?height=200&width=200&query=ysup+hoodie",
    inStock: true,
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "4",
    name: "Scientific Calculator",
    description: "Advanced scientific calculator for STEM courses",
    price: 300,
    category: "supplies",
    image: "/placeholder.svg?height=200&width=200&query=scientific+calculator",
    inStock: true,
  },
  {
    id: "5",
    name: "YsUp Notebook Set",
    description: "Set of 3 branded notebooks",
    price: 150,
    category: "supplies",
    image: "/placeholder.svg?height=200&width=200&query=notebook+set",
    inStock: true,
  },
  {
    id: "6",
    name: "Chemistry Lab Kit",
    description: "Basic chemistry laboratory equipment kit",
    price: 2000,
    category: "supplies",
    image: "/placeholder.svg?height=200&width=200&query=chemistry+lab+kit",
    inStock: false,
  },
]

// @route   GET /api/bookstore/items
// @desc    Get bookstore items
// @access  Private
router.get(
  "/items",
  [
    query("category").optional().isIn(["clothing", "books", "supplies"]).withMessage("Invalid category"),
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

      const { category, search, page = 1, limit = 20, inStock } = req.query
      let items = [...bookstoreItems]

      // Apply filters
      if (category) {
        items = items.filter((item) => item.category === category)
      }

      if (search) {
        const searchLower = search.toLowerCase()
        items = items.filter(
          (item) =>
            item.name.toLowerCase().includes(searchLower) || item.description.toLowerCase().includes(searchLower),
        )
      }

      if (inStock === "true") {
        items = items.filter((item) => item.inStock)
      }

      // Pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + Number.parseInt(limit)
      const paginatedItems = items.slice(startIndex, endIndex)

      res.json({
        success: true,
        items: paginatedItems,
        pagination: {
          current: Number.parseInt(page),
          pages: Math.ceil(items.length / limit),
          total: items.length,
        },
        categories: ["clothing", "books", "supplies"],
      })
    } catch (error) {
      console.error("Get bookstore items error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @route   GET /api/bookstore/items/:id
// @desc    Get specific bookstore item
// @access  Private
router.get("/items/:id", async (req, res) => {
  try {
    const item = bookstoreItems.find((item) => item.id === req.params.id)

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      })
    }

    res.json({
      success: true,
      item,
    })
  } catch (error) {
    console.error("Get bookstore item error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   POST /api/bookstore/purchase
// @desc    Purchase item with YBucks
// @access  Private
router.post(
  "/purchase",
  [
    body("itemId").trim().isLength({ min: 1 }).withMessage("Item ID is required"),
    body("quantity").isInt({ min: 1, max: 10 }).withMessage("Quantity must be between 1 and 10"),
    body("size").optional().isIn(["S", "M", "L", "XL"]).withMessage("Invalid size"),
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

      const { itemId, quantity, size } = req.body

      // Find item
      const item = bookstoreItems.find((item) => item.id === itemId)
      if (!item) {
        return res.status(404).json({
          success: false,
          message: "Item not found",
        })
      }

      if (!item.inStock) {
        return res.status(400).json({
          success: false,
          message: "Item is out of stock",
        })
      }

      // Check if size is required and provided
      if (item.sizes && !size) {
        return res.status(400).json({
          success: false,
          message: "Size selection is required for this item",
        })
      }

      if (item.sizes && !item.sizes.includes(size)) {
        return res.status(400).json({
          success: false,
          message: "Invalid size selection",
        })
      }

      const totalCost = item.price * quantity

      // Get user and check YBucks balance
      const user = await User.findById(req.user.id)
      if (user.ybucks < totalCost) {
        return res.status(400).json({
          success: false,
          message: "Insufficient YBucks balance",
          required: totalCost,
          available: user.ybucks,
        })
      }

      // Deduct YBucks
      user.ybucks -= totalCost
      await user.save()

      // In production, you would create an order record here
      const order = {
        id: Date.now().toString(),
        userId: user._id,
        item: {
          id: item.id,
          name: item.name,
          price: item.price,
        },
        quantity,
        size,
        totalCost,
        status: "confirmed",
        orderDate: new Date(),
      }

      res.json({
        success: true,
        message: "Purchase successful",
        order,
        remainingYBucks: user.ybucks,
      })
    } catch (error) {
      console.error("Purchase error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @route   GET /api/bookstore/orders
// @desc    Get user's order history
// @access  Private
router.get("/orders", async (req, res) => {
  try {
    // In production, you would fetch from an orders collection
    // For now, returning empty array as this is a mock
    res.json({
      success: true,
      orders: [],
      message: "Order history feature coming soon",
    })
  } catch (error) {
    console.error("Get orders error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/bookstore/balance
// @desc    Get user's YBucks balance
// @access  Private
router.get("/balance", async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("ybucks level")

    res.json({
      success: true,
      balance: user.ybucks,
      level: user.level,
    })
  } catch (error) {
    console.error("Get balance error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

module.exports = router
