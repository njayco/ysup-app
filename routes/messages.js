const express = require("express")
const { body, validationResult, query } = require("express-validator")
const Message = require("../models/Message")
const User = require("../models/User")

const router = express.Router()

// @route   GET /api/messages/conversations
// @desc    Get user's conversations
// @access  Private
router.get("/conversations", async (req, res) => {
  try {
    const conversations = await Message.getUserConversations(req.user.id)

    res.json({
      success: true,
      conversations,
    })
  } catch (error) {
    console.error("Get conversations error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/messages/:userId
// @desc    Get conversation with specific user
// @access  Private
router.get(
  "/:userId",
  [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
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

      const { userId } = req.params
      const { page = 1, limit = 50 } = req.query

      // Verify other user exists
      const otherUser = await User.findById(userId).select("firstName lastName username profileImage")
      if (!otherUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        })
      }

      const messages = await Message.getConversation(req.user.id, userId, page, limit)

      res.json({
        success: true,
        messages: messages.reverse(), // Reverse to show oldest first
        otherUser,
        pagination: {
          current: Number.parseInt(page),
          hasMore: messages.length === Number.parseInt(limit),
        },
      })
    } catch (error) {
      console.error("Get conversation error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @route   POST /api/messages
// @desc    Send a message
// @access  Private
router.post(
  "/",
  [
    body("recipient").isMongoId().withMessage("Valid recipient ID is required"),
    body("content").trim().isLength({ min: 1, max: 1000 }).withMessage("Message must be between 1 and 1000 characters"),
    body("type").optional().isIn(["text", "image", "file"]).withMessage("Invalid message type"),
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

      const { recipient, content, type = "text", replyTo } = req.body

      if (recipient === req.user.id.toString()) {
        return res.status(400).json({
          success: false,
          message: "Cannot send message to yourself",
        })
      }

      // Verify recipient exists
      const recipientUser = await User.findById(recipient)
      if (!recipientUser) {
        return res.status(404).json({
          success: false,
          message: "Recipient not found",
        })
      }

      // Create message
      const message = new Message({
        sender: req.user.id,
        recipient,
        content,
        type,
        replyTo,
      })

      await message.save()
      await message.populate("sender", "firstName lastName username profileImage")
      await message.populate("recipient", "firstName lastName username profileImage")

      if (replyTo) {
        await message.populate("replyTo", "content sender")
      }

      res.status(201).json({
        success: true,
        message: "Message sent successfully",
        data: message,
      })
    } catch (error) {
      console.error("Send message error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @route   PUT /api/messages/:id/read
// @desc    Mark message as read
// @access  Private
router.put("/:id/read", async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      })
    }

    if (!message.recipient.equals(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to mark this message as read",
      })
    }

    await message.markAsRead()

    res.json({
      success: true,
      message: "Message marked as read",
    })
  } catch (error) {
    console.error("Mark message read error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   DELETE /api/messages/:id
// @desc    Delete message for user
// @access  Private
router.delete("/:id", async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      })
    }

    if (!message.sender.equals(req.user.id) && !message.recipient.equals(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this message",
      })
    }

    await message.deleteForUser(req.user.id)

    res.json({
      success: true,
      message: "Message deleted successfully",
    })
  } catch (error) {
    console.error("Delete message error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   POST /api/messages/:id/reaction
// @desc    Add reaction to message
// @access  Private
router.post(
  "/:id/reaction",
  [body("emoji").trim().isLength({ min: 1, max: 10 }).withMessage("Emoji is required")],
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

      const { emoji } = req.body

      const message = await Message.findById(req.params.id)
      if (!message) {
        return res.status(404).json({
          success: false,
          message: "Message not found",
        })
      }

      if (!message.sender.equals(req.user.id) && !message.recipient.equals(req.user.id)) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to react to this message",
        })
      }

      await message.addReaction(req.user.id, emoji)

      res.json({
        success: true,
        message: "Reaction added successfully",
        reactions: message.reactions,
      })
    } catch (error) {
      console.error("Add reaction error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

module.exports = router
