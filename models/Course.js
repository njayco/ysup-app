const mongoose = require("mongoose")

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    instructor: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      office: String,
      officeHours: String,
    },
    college: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    credits: {
      type: Number,
      required: true,
      min: 1,
      max: 6,
    },
    semester: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    schedule: {
      days: [{ type: String, enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] }],
      startTime: String,
      endTime: String,
      location: String,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    maxStudents: {
      type: Number,
      default: 30,
    },
    syllabus: {
      type: String, // URL to syllabus file
      default: null,
    },
    materials: [
      {
        title: String,
        type: { type: String, enum: ["textbook", "article", "video", "other"] },
        url: String,
        required: { type: Boolean, default: false },
      },
    ],
    announcements: [
      {
        title: String,
        content: String,
        createdAt: { type: Date, default: Date.now },
        priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
      },
    ],
    assignments: [
      {
        title: String,
        description: String,
        dueDate: Date,
        points: Number,
        type: { type: String, enum: ["homework", "quiz", "exam", "project"] },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

// Index for search functionality
courseSchema.index({
  name: "text",
  code: "text",
  description: "text",
  college: "text",
  department: "text",
})

// Virtual for enrollment count
courseSchema.virtual("enrollmentCount").get(function () {
  return this.students.length
})

// Virtual for available spots
courseSchema.virtual("availableSpots").get(function () {
  return this.maxStudents - this.students.length
})

// Check if course is full
courseSchema.methods.isFull = function () {
  return this.students.length >= this.maxStudents
}

// Add student to course
courseSchema.methods.addStudent = function (studentId) {
  if (this.isFull()) {
    throw new Error("Course is full")
  }
  if (!this.students.includes(studentId)) {
    this.students.push(studentId)
  }
  return this.save()
}

// Remove student from course
courseSchema.methods.removeStudent = function (studentId) {
  this.students = this.students.filter((id) => !id.equals(studentId))
  return this.save()
}

module.exports = mongoose.model("Course", courseSchema)
