const mongoose = require("mongoose")

const gameSessionSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    students: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        ybucks: {
          type: Number,
          default: 0,
        },
        assists: {
          type: Number,
          default: 0,
        },
        questions: {
          type: Number,
          default: 0,
        },
        correctAnswers: {
          type: Number,
          default: 0,
        },
        isCaptain: {
          type: Boolean,
          default: false,
        },
        attendance: {
          type: Boolean,
          default: false,
        },
      },
    ],
    teacherYBucks: {
      type: Number,
      default: 0,
    },
    totalClassYBucks: {
      type: Number,
      default: 0,
    },
    sessionDate: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    gameEvents: [
      {
        type: {
          type: String,
          enum: ["question", "assist", "correct_answer", "good_behavior", "attendance", "teacher_no_questions"],
          required: true,
        },
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        points: {
          type: Number,
          required: true,
        },
        description: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    rules: {
      assistPoints: { type: Number, default: 100 },
      questionPoints: { type: Number, default: 10 },
      correctAnswerPoints: { type: Number, default: 10 },
      attendancePoints: { type: Number, default: 250 },
      teacherNoQuestionsPoints: { type: Number, default: 250 },
    },
  },
  {
    timestamps: true,
  },
)

// Index for queries
gameSessionSchema.index({ course: 1, sessionDate: -1 })
gameSessionSchema.index({ teacher: 1, sessionDate: -1 })
gameSessionSchema.index({ isActive: 1 })

// Virtual for class total YBucks
gameSessionSchema.virtual("classTotal").get(function () {
  return this.students.reduce((total, student) => total + student.ybucks, 0)
})

// Award points to student
gameSessionSchema.methods.awardPoints = function (studentId, eventType, points, description) {
  const student = this.students.find((s) => s.user.equals(studentId))
  if (!student) {
    throw new Error("Student not found in session")
  }

  // Update student stats
  student.ybucks += points

  switch (eventType) {
    case "assist":
      student.assists += 1
      break
    case "question":
      student.questions += 1
      break
    case "correct_answer":
      student.correctAnswers += 1
      break
  }

  // Add game event
  this.gameEvents.push({
    type: eventType,
    student: studentId,
    points: points,
    description: description,
  })

  // Update totals
  this.totalClassYBucks = this.students.reduce((total, s) => total + s.ybucks, 0)

  return this.save()
}

// Award teacher points
gameSessionSchema.methods.awardTeacherPoints = function (points, description) {
  this.teacherYBucks += points

  this.gameEvents.push({
    type: "teacher_no_questions",
    points: points,
    description: description,
  })

  return this.save()
}

// Set team captain
gameSessionSchema.methods.setCaptain = function (studentId) {
  // Remove captain status from all students
  this.students.forEach((student) => {
    student.isCaptain = false
  })

  // Set new captain
  const newCaptain = this.students.find((s) => s.user.equals(studentId))
  if (newCaptain) {
    newCaptain.isCaptain = true
  }

  return this.save()
}

// Mark attendance
gameSessionSchema.methods.markAttendance = function (studentId) {
  const student = this.students.find((s) => s.user.equals(studentId))
  if (student && !student.attendance) {
    student.attendance = true
    return this.awardPoints(studentId, "attendance", this.rules.attendancePoints, "Perfect attendance")
  }
  return this.save()
}

// End session
gameSessionSchema.methods.endSession = function () {
  this.isActive = false
  return this.save()
}

// Get leaderboard
gameSessionSchema.methods.getLeaderboard = function () {
  return this.students
    .sort((a, b) => b.ybucks - a.ybucks)
    .map((student, index) => ({
      rank: index + 1,
      user: student.user,
      ybucks: student.ybucks,
      assists: student.assists,
      questions: student.questions,
      correctAnswers: student.correctAnswers,
      isCaptain: student.isCaptain,
    }))
}

module.exports = mongoose.model("GameSession", gameSessionSchema)
