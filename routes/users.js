const express = require("express")
const { body, validationResult, query } = require("express-validator")
const User = require("../models/User")
const Course = require("../models/Course")

const router = express.Router()

// @route   GET /api/users/search
// @desc    Search for users
// @access  Private
router.get(
  "/search",
  [
    query("q").trim().isLength({ min: 1 }).withMessage("Search query is required"),
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

      const { q, page = 1, limit = 20, college, major, year } = req.query
      const skip = (page - 1) * limit

      // Build search query
      const searchQuery = {
        $and: [
          {
            $or: [
              { firstName: { $regex: q, $options: "i" } },
              { lastName: { $regex: q, $options: "i" } },
              { username: { $regex: q, $options: "i" } },
              { $text: { $search: q } },
            ],
          },
          { _id: { $ne: req.user.id } }, // Exclude current user
        ],
      }

      // Add filters
      if (college) searchQuery.$and.push({ college: { $regex: college, $options: "i" } })
      if (major) searchQuery.$and.push({ major: { $regex: major, $options: "i" } })
      if (year) searchQuery.$and.push({ year })

      const users = await User.find(searchQuery)
        .select("firstName lastName username profileImage college major year ybucks level isOnline lastSeen")
        .skip(skip)
        .limit(Number.parseInt(limit))
        .sort({ ybucks: -1, firstName: 1 })

      const total = await User.countDocuments(searchQuery)

      res.json({
        success: true,
        users,
        pagination: {
          current: Number.parseInt(page),
          pages: Math.ceil(total / limit),
          total,
        },
      })
    } catch (error) {
      console.error("Search users error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @route   GET /api/users/:id
// @desc    Get user profile
// @access  Private
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password -verificationToken -resetPasswordToken -resetPasswordExpires")
      .populate("courses", "name code")
      .populate("friends", "firstName lastName username profileImage isOnline")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Check if current user is friends with this user
    const isFriend = user.friends.some((friend) => friend._id.equals(req.user.id))

    res.json({
      success: true,
      user: {
        ...user.toJSON(),
        isFriend,
      },
    })
  } catch (error) {
    console.error("Get user profile error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   POST /api/users/:id/friend
// @desc    Send friend request / Add friend
// @access  Private
router.post("/:id/friend", async (req, res) => {
  try {
    const targetUserId = req.params.id

    if (targetUserId === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot add yourself as a friend",
      })
    }

    const targetUser = await User.findById(targetUserId)
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    const currentUser = await User.findById(req.user.id)

    // Check if already friends
    if (currentUser.friends.includes(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: "Already friends with this user",
      })
    }

    // Add to friends list (simplified - in production you'd want friend requests)
    currentUser.friends.push(targetUserId)
    targetUser.friends.push(req.user.id)

    await currentUser.save()
    await targetUser.save()

    // Award YBucks for making friends
    await currentUser.addYBucks(50)
    await targetUser.addYBucks(50)

    res.json({
      success: true,
      message: "Friend added successfully",
    })
  } catch (error) {
    console.error("Add friend error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   DELETE /api/users/:id/friend
// @desc    Remove friend
// @access  Private
router.delete("/:id/friend", async (req, res) => {
  try {
    const targetUserId = req.params.id

    const currentUser = await User.findById(req.user.id)
    const targetUser = await User.findById(targetUserId)

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Remove from friends lists
    currentUser.friends = currentUser.friends.filter((id) => !id.equals(targetUserId))
    targetUser.friends = targetUser.friends.filter((id) => !id.equals(req.user.id))

    await currentUser.save()
    await targetUser.save()

    res.json({
      success: true,
      message: "Friend removed successfully",
    })
  } catch (error) {
    console.error("Remove friend error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/users/me/friends
// @desc    Get user's friends list
// @access  Private
router.get("/me/friends", async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate(
      "friends",
      "firstName lastName username profileImage isOnline lastSeen college major year",
    )

    res.json({
      success: true,
      friends: user.friends,
    })
  } catch (error) {
    console.error("Get friends error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/users/leaderboard
// @desc    Get YBucks leaderboard
// @access  Private
router.get("/leaderboard", async (req, res) => {
  try {
    const { college, limit = 50 } = req.query

    const query = {}
    if (college) query.college = { $regex: college, $options: "i" }

    const users = await User.find(query)
      .select("firstName lastName username profileImage college ybucks level")
      .sort({ ybucks: -1, level: -1 })
      .limit(Number.parseInt(limit))

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      ...user.toJSON(),
    }))

    res.json({
      success: true,
      leaderboard,
    })
  } catch (error) {
    console.error("Get leaderboard error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

module.exports = router
