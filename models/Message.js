const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    type: {
      type: String,
      enum: ["text", "image", "file", "system"],
      default: "text",
    },
    attachments: [
      {
        filename: String,
        url: String,
        type: String,
        size: Number,
      },
    ],
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: Date,
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    reactions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        emoji: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Index for queries
messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 })
messageSchema.index({ recipient: 1, isRead: 1 })
messageSchema.index({ createdAt: -1 })

// Mark message as read
messageSchema.methods.markAsRead = function () {
  if (!this.isRead) {
    this.isRead = true
    this.readAt = new Date()
  }
  return this.save()
}

// Mark message as delivered
messageSchema.methods.markAsDelivered = function () {
  if (!this.isDelivered) {
    this.isDelivered = true
    this.deliveredAt = new Date()
  }
  return this.save()
}

// Delete message for user
messageSchema.methods.deleteForUser = function (userId) {
  if (!this.deletedBy.includes(userId)) {
    this.deletedBy.push(userId)

    // If both users have deleted, mark as deleted
    if (this.deletedBy.length >= 2) {
      this.isDeleted = true
    }
  }
  return this.save()
}

// Add reaction
messageSchema.methods.addReaction = function (userId, emoji) {
  const existingReaction = this.reactions.find((r) => r.user.equals(userId))

  if (existingReaction) {
    existingReaction.emoji = emoji
  } else {
    this.reactions.push({ user: userId, emoji })
  }

  return this.save()
}

// Remove reaction
messageSchema.methods.removeReaction = function (userId) {
  this.reactions = this.reactions.filter((r) => !r.user.equals(userId))
  return this.save()
}

// Get conversation between two users
messageSchema.statics.getConversation = function (user1Id, user2Id, page = 1, limit = 50) {
  const skip = (page - 1) * limit

  return this.find({
    $and: [
      {
        $or: [
          { sender: user1Id, recipient: user2Id },
          { sender: user2Id, recipient: user1Id },
        ],
      },
      {
        $or: [{ isDeleted: false }, { deletedBy: { $nin: [user1Id] } }],
      },
    ],
  })
    .populate("sender", "firstName lastName username profileImage")
    .populate("recipient", "firstName lastName username profileImage")
    .populate("replyTo", "content sender")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
}

// Get user's conversations list
messageSchema.statics.getUserConversations = function (userId) {
  return this.aggregate([
    {
      $match: {
        $or: [{ sender: mongoose.Types.ObjectId(userId) }, { recipient: mongoose.Types.ObjectId(userId) }],
        isDeleted: false,
        deletedBy: { $nin: [mongoose.Types.ObjectId(userId)] },
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $group: {
        _id: {
          $cond: [{ $eq: ["$sender", mongoose.Types.ObjectId(userId)] }, "$recipient", "$sender"],
        },
        lastMessage: { $first: "$$ROOT" },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [{ $eq: ["$recipient", mongoose.Types.ObjectId(userId)] }, { $eq: ["$isRead", false] }],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "otherUser",
      },
    },
    {
      $unwind: "$otherUser",
    },
    {
      $project: {
        otherUser: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          username: 1,
          profileImage: 1,
          isOnline: 1,
          lastSeen: 1,
        },
        lastMessage: 1,
        unreadCount: 1,
      },
    },
    {
      $sort: { "lastMessage.createdAt": -1 },
    },
  ])
}

module.exports = mongoose.model("Message", messageSchema)
