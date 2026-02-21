const mongoose = require("mongoose")

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    type: {
      type: String,
      enum: ["question", "announcement", "discussion", "study-group"],
      default: "discussion",
    },
    tags: [String],
    attachments: [
      {
        filename: String,
        url: String,
        type: String,
        size: Number,
      },
    ],
    cosigns: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    responses: [
      {
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        content: {
          type: String,
          required: true,
          maxlength: 500,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        cosigns: [
          {
            user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
            },
            createdAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
      },
    ],
    isPinned: {
      type: Boolean,
      default: false,
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Index for search and sorting
postSchema.index({ course: 1, createdAt: -1 })
postSchema.index({ author: 1, createdAt: -1 })
postSchema.index({ content: "text", tags: "text" })
postSchema.index({ lastActivity: -1 })

// Virtual for cosign count
postSchema.virtual("cosignCount").get(function () {
  return this.cosigns.length
})

// Virtual for response count
postSchema.virtual("responseCount").get(function () {
  return this.responses.length
})

// Update last activity when post is modified
postSchema.pre("save", function (next) {
  if (this.isModified("responses") || this.isModified("cosigns")) {
    this.lastActivity = new Date()
  }
  next()
})

// Add cosign method
postSchema.methods.addCosign = function (userId) {
  const existingCosign = this.cosigns.find((cosign) => cosign.user.equals(userId))
  if (!existingCosign) {
    this.cosigns.push({ user: userId })
    this.lastActivity = new Date()
  }
  return this.save()
}

// Remove cosign method
postSchema.methods.removeCosign = function (userId) {
  this.cosigns = this.cosigns.filter((cosign) => !cosign.user.equals(userId))
  this.lastActivity = new Date()
  return this.save()
}

// Add response method
postSchema.methods.addResponse = function (authorId, content) {
  this.responses.push({
    author: authorId,
    content: content,
  })
  this.lastActivity = new Date()
  return this.save()
}

// Increment views
postSchema.methods.incrementViews = function () {
  this.views += 1
  return this.save()
}

module.exports = mongoose.model("Post", postSchema)
