const mongoose = require("mongoose")

const fileSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["pdf", "doc", "docx", "ppt", "pptx", "image", "video", "audio", "other"],
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    description: {
      type: String,
      maxlength: 500,
    },
    tags: [String],
    isPublic: {
      type: Boolean,
      default: false,
    },
    sharedWith: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        permission: {
          type: String,
          enum: ["view", "download", "edit"],
          default: "view",
        },
        sharedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    downloads: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        downloadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    views: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
    },
    thumbnail: String,
    metadata: {
      pages: Number,
      duration: Number,
      dimensions: {
        width: Number,
        height: Number,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

// Index for search and queries
fileSchema.index({ owner: 1, createdAt: -1 })
fileSchema.index({ course: 1, createdAt: -1 })
fileSchema.index({ filename: "text", originalName: "text", description: "text", tags: "text" })
fileSchema.index({ type: 1 })
fileSchema.index({ isPublic: 1 })

// Virtual for download count
fileSchema.virtual("downloadCount").get(function () {
  return this.downloads.length
})

// Virtual for view count
fileSchema.virtual("viewCount").get(function () {
  return this.views.length
})

// Share file with user
fileSchema.methods.shareWith = function (userId, permission = "view") {
  const existingShare = this.sharedWith.find((s) => s.user.equals(userId))

  if (existingShare) {
    existingShare.permission = permission
    existingShare.sharedAt = new Date()
  } else {
    this.sharedWith.push({ user: userId, permission })
  }

  return this.save()
}

// Remove share
fileSchema.methods.removeShare = function (userId) {
  this.sharedWith = this.sharedWith.filter((s) => !s.user.equals(userId))
  return this.save()
}

// Record download
fileSchema.methods.recordDownload = function (userId) {
  this.downloads.push({ user: userId })
  return this.save()
}

// Record view
fileSchema.methods.recordView = function (userId) {
  // Only record if user hasn't viewed in last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  const recentView = this.views.find((v) => v.user.equals(userId) && v.viewedAt > oneHourAgo)

  if (!recentView) {
    this.views.push({ user: userId })
    return this.save()
  }

  return Promise.resolve(this)
}

// Check if user has access
fileSchema.methods.hasAccess = function (userId, permission = "view") {
  // Owner always has access
  if (this.owner.equals(userId)) {
    return true
  }

  // Public files can be viewed
  if (this.isPublic && permission === "view") {
    return true
  }

  // Check shared permissions
  const share = this.sharedWith.find((s) => s.user.equals(userId))
  if (share) {
    const permissions = ["view", "download", "edit"]
    const userLevel = permissions.indexOf(share.permission)
    const requiredLevel = permissions.indexOf(permission)
    return userLevel >= requiredLevel
  }

  return false
}

// Get files accessible by user
fileSchema.statics.getAccessibleFiles = function (userId, filters = {}) {
  const query = {
    $and: [
      {
        $or: [{ owner: userId }, { isPublic: true }, { "sharedWith.user": userId }],
      },
      { isActive: true },
    ],
  }

  // Add filters
  if (filters.course) query.$and.push({ course: filters.course })
  if (filters.type) query.$and.push({ type: filters.type })
  if (filters.search) {
    query.$and.push({
      $text: { $search: filters.search },
    })
  }

  return this.find(query)
    .populate("owner", "firstName lastName username")
    .populate("course", "name code")
    .sort({ createdAt: -1 })
}

module.exports = mongoose.model("File", fileSchema)
