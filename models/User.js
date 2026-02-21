const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    college: {
      type: String,
      required: true,
    },
    major: {
      type: String,
      required: true,
    },
    year: {
      type: String,
      enum: ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"],
      required: true,
    },
    profileImage: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: 500,
      default: "",
    },
    ybucks: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    settings: {
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        messages: { type: Boolean, default: true },
        posts: { type: Boolean, default: true },
      },
      privacy: {
        profileVisibility: { type: String, enum: ["public", "friends", "private"], default: "public" },
        showOnlineStatus: { type: Boolean, default: true },
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  },
)

// Index for search functionality
userSchema.index({
  firstName: "text",
  lastName: "text",
  username: "text",
  college: "text",
  major: "text",
})

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`
})

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Calculate level based on YBucks
userSchema.methods.calculateLevel = function () {
  this.level = Math.floor(this.ybucks / 1000) + 1
  return this.level
}

// Add YBucks and update level
userSchema.methods.addYBucks = function (amount) {
  this.ybucks += amount
  this.calculateLevel()
  return this.save()
}

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject()
  delete user.password
  delete user.verificationToken
  delete user.resetPasswordToken
  delete user.resetPasswordExpires
  return user
}

module.exports = mongoose.model("User", userSchema)
