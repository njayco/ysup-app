const express = require("express")
const { body, validationResult, query } = require("express-validator")
const Event = require("../models/Event")
const User = require("../models/User")
const Course = require("../models/Course")

const router = express.Router()

// @route   GET /api/events
// @desc    Get events (calendar view)
// @access  Private
router.get(
  "/",
  [
    query("start").isISO8601().withMessage("Valid start date is required"),
    query("end").isISO8601().withMessage("Valid end date is required"),
    query("type").optional().isIn(["class", "study-group", "social", "academic", "sports", "other"]),
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

      const { start, end, type, course } = req.query

      const events = await Event.getEventsInRange(new Date(start), new Date(end), req.user.id)

      // Filter by type if specified
      let filteredEvents = events
      if (type) {
        filteredEvents = events.filter((event) => event.type === type)
      }
      if (course) {
        filteredEvents = filteredEvents.filter((event) => event.course && event.course._id.toString() === course)
      }

      res.json({
        success: true,
        events: filteredEvents,
      })
    } catch (error) {
      console.error("Get events error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @route   POST /api/events
// @desc    Create a new event
// @access  Private
router.post(
  "/",
  [
    body("title").trim().isLength({ min: 1, max: 100 }).withMessage("Title must be between 1 and 100 characters"),
    body("startDate").isISO8601().withMessage("Valid start date is required"),
    body("endDate").isISO8601().withMessage("Valid end date is required"),
    body("type")
      .optional()
      .isIn(["class", "study-group", "social", "academic", "sports", "other"])
      .withMessage("Invalid event type"),
    body("course").optional().isMongoId().withMessage("Valid course ID required"),
    body("maxAttendees").optional().isInt({ min: 1 }).withMessage("Max attendees must be a positive integer"),
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

      const {
        title,
        description,
        startDate,
        endDate,
        location,
        type = "other",
        course,
        isPublic = true,
        maxAttendees,
        tags = [],
      } = req.body

      // Validate dates
      if (new Date(startDate) >= new Date(endDate)) {
        return res.status(400).json({
          success: false,
          message: "End date must be after start date",
        })
      }

      // Verify course if provided
      if (course) {
        const courseDoc = await Course.findById(course)
        if (!courseDoc) {
          return res.status(404).json({
            success: false,
            message: "Course not found",
          })
        }
        if (!courseDoc.students.includes(req.user.id)) {
          return res.status(403).json({
            success: false,
            message: "You are not enrolled in this course",
          })
        }
      }

      // Create event
      const event = new Event({
        title,
        description,
        creator: req.user.id,
        course,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location,
        type,
        isPublic,
        maxAttendees,
        tags,
      })

      await event.save()
      await event.populate("creator", "firstName lastName username")
      await event.populate("course", "name code")

      // Creator automatically attends
      await event.addAttendee(req.user.id, "going")

      res.status(201).json({
        success: true,
        message: "Event created successfully",
        event,
      })
    } catch (error) {
      console.error("Create event error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @route   GET /api/events/:id
// @desc    Get event details
// @access  Private
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("creator", "firstName lastName username profileImage")
      .populate("course", "name code")
      .populate("attendees.user", "firstName lastName username profileImage")

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      })
    }

    // Check if user has access to this event
    const hasAccess =
      event.isPublic ||
      event.creator.equals(req.user.id) ||
      event.invitees.includes(req.user.id) ||
      event.attendees.some((a) => a.user._id.equals(req.user.id))

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      })
    }

    const userAttendance = event.attendees.find((a) => a.user._id.equals(req.user.id))

    res.json({
      success: true,
      event: {
        ...event.toJSON(),
        userAttendanceStatus: userAttendance ? userAttendance.status : null,
        isCreator: event.creator._id.equals(req.user.id),
      },
    })
  } catch (error) {
    console.error("Get event error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   POST /api/events/:id/attend
// @desc    RSVP to event
// @access  Private
router.post(
  "/:id/attend",
  [body("status").isIn(["going", "maybe", "not-going"]).withMessage("Invalid attendance status")],
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

      const { status } = req.body

      const event = await Event.findById(req.params.id)
      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        })
      }

      if (!event.isActive) {
        return res.status(400).json({
          success: false,
          message: "Event is not active",
        })
      }

      // Check if user has access
      const hasAccess =
        event.isPublic ||
        event.creator.equals(req.user.id) ||
        event.invitees.includes(req.user.id) ||
        event.attendees.some((a) => a.user.equals(req.user.id))

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "You are not invited to this event",
        })
      }

      await event.addAttendee(req.user.id, status)

      // Award YBucks for attending events
      if (status === "going") {
        const user = await User.findById(req.user.id)
        await user.addYBucks(50)
      }

      res.json({
        success: true,
        message: `RSVP updated to ${status}`,
        attendeeCount: event.attendeeCount,
      })
    } catch (error) {
      console.error("RSVP event error:", error)
      res.status(500).json({
        success: false,
        message: error.message || "Server error",
      })
    }
  },
)

// @route   DELETE /api/events/:id/attend
// @desc    Remove RSVP from event
// @access  Private
router.delete("/:id/attend", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      })
    }

    await event.removeAttendee(req.user.id)

    res.json({
      success: true,
      message: "RSVP removed successfully",
    })
  } catch (error) {
    console.error("Remove RSVP error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   DELETE /api/events/:id
// @desc    Delete event
// @access  Private
router.delete("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      })
    }

    if (!event.creator.equals(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Only the event creator can delete this event",
      })
    }

    await Event.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: "Event deleted successfully",
    })
  } catch (error) {
    console.error("Delete event error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

module.exports = router
