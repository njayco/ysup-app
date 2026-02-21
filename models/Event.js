const mongoose = require("mongoose")

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      maxlength: 200,
    },
    type: {
      type: String,
      enum: ["class", "study-group", "social", "academic", "sports", "other"],
      default: "other",
    },
    attendees: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        status: {
          type: String,
          enum: ["going", "maybe", "not-going"],
          default: "going",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    invitees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isPublic: {
      type: Boolean,
      default: true,
    },
    maxAttendees: {
      type: Number,
      default: null,
    },
    tags: [String],
    reminders: [
      {
        type: {
          type: String,
          enum: ["email", "push", "sms"],
        },
        time: {
          type: Number, // minutes before event
          required: true,
        },
        sent: {
          type: Boolean,
          default: false,
        },
      },
    ],
    recurrence: {
      type: {
        type: String,
        enum: ["none", "daily", "weekly", "monthly"],
        default: "none",
      },
      interval: {
        type: Number,
        default: 1,
      },
      endDate: Date,
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

// Index for queries
eventSchema.index({ startDate: 1, endDate: 1 })
eventSchema.index({ creator: 1, startDate: -1 })
eventSchema.index({ course: 1, startDate: 1 })
eventSchema.index({ "attendees.user": 1 })

// Virtual for attendee count
eventSchema.virtual("attendeeCount").get(function () {
  return this.attendees.filter((a) => a.status === "going").length
})

// Check if event is full
eventSchema.methods.isFull = function () {
  return this.maxAttendees && this.attendeeCount >= this.maxAttendees
}

// Add attendee
eventSchema.methods.addAttendee = function (userId, status = "going") {
  const existingAttendee = this.attendees.find((a) => a.user.equals(userId))

  if (existingAttendee) {
    existingAttendee.status = status
  } else {
    if (this.isFull() && status === "going") {
      throw new Error("Event is full")
    }
    this.attendees.push({ user: userId, status })
  }

  return this.save()
}

// Remove attendee
eventSchema.methods.removeAttendee = function (userId) {
  this.attendees = this.attendees.filter((a) => !a.user.equals(userId))
  return this.save()
}

// Check if user is invited
eventSchema.methods.isInvited = function (userId) {
  return this.invitees.includes(userId) || this.creator.equals(userId)
}

// Check if user is attending
eventSchema.methods.isAttending = function (userId) {
  const attendee = this.attendees.find((a) => a.user.equals(userId))
  return attendee && attendee.status === "going"
}

// Get events for a specific date range
eventSchema.statics.getEventsInRange = function (startDate, endDate, userId) {
  return this.find({
    $and: [
      {
        $or: [
          { startDate: { $gte: startDate, $lte: endDate } },
          { endDate: { $gte: startDate, $lte: endDate } },
          { startDate: { $lte: startDate }, endDate: { $gte: endDate } },
        ],
      },
      {
        $or: [{ isPublic: true }, { creator: userId }, { invitees: userId }, { "attendees.user": userId }],
      },
      { isActive: true },
    ],
  })
    .populate("creator", "firstName lastName username")
    .populate("course", "name code")
    .populate("attendees.user", "firstName lastName username")
    .sort({ startDate: 1 })
}

module.exports = mongoose.model("Event", eventSchema)
