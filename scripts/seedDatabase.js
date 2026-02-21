const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
require("dotenv").config()

// Import models
const User = require("../models/User")
const Course = require("../models/Course")
const Post = require("../models/Post")
const Event = require("../models/Event")

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/ysup")
    console.log("Connected to MongoDB")

    // Clear existing data
    await User.deleteMany({})
    await Course.deleteMany({})
    await Post.deleteMany({})
    await Event.deleteMany({})
    console.log("Cleared existing data")

    // Create sample users
    const users = [
      {
        firstName: "John",
        lastName: "Doe",
        username: "johndoe",
        email: "john@example.com",
        phone: "+1234567890",
        password: "password123",
        college: "Howard University",
        major: "Computer Science",
        year: "Junior",
        ybucks: 1500,
        bio: "Passionate about technology and education",
      },
      {
        firstName: "Jane",
        lastName: "Smith",
        username: "janesmith",
        email: "jane@example.com",
        phone: "+1234567891",
        password: "password123",
        college: "Howard University",
        major: "Mathematics",
        year: "Sophomore",
        ybucks: 1200,
        bio: "Math enthusiast and tutor",
      },
      {
        firstName: "Mike",
        lastName: "Johnson",
        username: "mikej",
        email: "mike@example.com",
        phone: "+1234567892",
        password: "password123",
        college: "Howard University",
        major: "Biology",
        year: "Senior",
        ybucks: 2000,
        bio: "Pre-med student interested in research",
      },
      {
        firstName: "Sarah",
        lastName: "Williams",
        username: "sarahw",
        email: "sarah@example.com",
        phone: "+1234567893",
        password: "password123",
        college: "Howard University",
        major: "Psychology",
        year: "Freshman",
        ybucks: 800,
        bio: "New to campus and excited to learn",
      },
    ]

    const createdUsers = await User.insertMany(users)
    console.log(`Created ${createdUsers.length} users`)

    // Create sample courses
    const courses = [
      {
        name: "Introduction to Computer Science",
        code: "CS101",
        description: "Fundamental concepts of computer science and programming",
        instructor: {
          name: "Dr. Robert Chen",
          email: "rchen@howard.edu",
          office: "Science Building 301",
          officeHours: "MWF 2-4 PM",
        },
        college: "Howard University",
        department: "Computer Science",
        credits: 3,
        semester: "Fall 2024",
        year: 2024,
        schedule: {
          days: ["Monday", "Wednesday", "Friday"],
          startTime: "10:00",
          endTime: "11:00",
          location: "Science Building 101",
        },
        students: [createdUsers[0]._id, createdUsers[1]._id, createdUsers[3]._id],
        maxStudents: 30,
      },
      {
        name: "Calculus I",
        code: "MATH151",
        description: "Differential and integral calculus of functions of one variable",
        instructor: {
          name: "Dr. Maria Rodriguez",
          email: "mrodriguez@howard.edu",
          office: "Math Building 205",
          officeHours: "TTh 1-3 PM",
        },
        college: "Howard University",
        department: "Mathematics",
        credits: 4,
        semester: "Fall 2024",
        year: 2024,
        schedule: {
          days: ["Tuesday", "Thursday"],
          startTime: "9:00",
          endTime: "10:30",
          location: "Math Building 150",
        },
        students: [createdUsers[1]._id, createdUsers[2]._id, createdUsers[3]._id],
        maxStudents: 25,
      },
      {
        name: "General Biology",
        code: "BIOL101",
        description: "Introduction to biological principles and processes",
        instructor: {
          name: "Dr. James Wilson",
          email: "jwilson@howard.edu",
          office: "Biology Building 401",
          officeHours: "MWF 3-5 PM",
        },
        college: "Howard University",
        department: "Biology",
        credits: 4,
        semester: "Fall 2024",
        year: 2024,
        schedule: {
          days: ["Monday", "Wednesday", "Friday"],
          startTime: "11:00",
          endTime: "12:00",
          location: "Biology Building 201",
        },
        students: [createdUsers[2]._id, createdUsers[3]._id],
        maxStudents: 20,
      },
    ]

    const createdCourses = await Course.insertMany(courses)
    console.log(`Created ${createdCourses.length} courses`)

    // Update users with course references
    await User.findByIdAndUpdate(createdUsers[0]._id, {
      courses: [createdCourses[0]._id],
    })
    await User.findByIdAndUpdate(createdUsers[1]._id, {
      courses: [createdCourses[0]._id, createdCourses[1]._id],
    })
    await User.findByIdAndUpdate(createdUsers[2]._id, {
      courses: [createdCourses[1]._id, createdCourses[2]._id],
    })
    await User.findByIdAndUpdate(createdUsers[3]._id, {
      courses: [createdCourses[0]._id, createdCourses[1]._id, createdCourses[2]._id],
    })

    // Create sample posts
    const posts = [
      {
        author: createdUsers[0]._id,
        course: createdCourses[0]._id,
        content: "Can someone explain the difference between arrays and linked lists?",
        type: "question",
        tags: ["data-structures", "arrays", "linked-lists"],
      },
      {
        author: createdUsers[1]._id,
        course: createdCourses[1]._id,
        content: "Study group forming for the upcoming calculus exam. Meeting in library room 301 tomorrow at 6 PM.",
        type: "study-group",
        tags: ["study-group", "calculus", "exam"],
      },
      {
        author: createdUsers[2]._id,
        course: createdCourses[2]._id,
        content: "Great lecture today on cellular respiration! The diagrams really helped me understand the process.",
        type: "discussion",
        tags: ["cellular-respiration", "biology"],
      },
    ]

    const createdPosts = await Post.insertMany(posts)
    console.log(`Created ${createdPosts.length} posts`)

    // Create sample events
    const events = [
      {
        title: "CS Study Group",
        description: "Weekly study group for Computer Science students",
        creator: createdUsers[0]._id,
        course: createdCourses[0]._id,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
        location: "Library Study Room A",
        type: "study-group",
        tags: ["computer-science", "study-group"],
      },
      {
        title: "Math Tutoring Session",
        description: "Free tutoring for calculus students",
        creator: createdUsers[1]._id,
        course: createdCourses[1]._id,
        startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // In 3 days
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000), // 1.5 hours later
        location: "Math Building Tutoring Center",
        type: "academic",
        tags: ["mathematics", "tutoring", "calculus"],
      },
    ]

    const createdEvents = await Event.insertMany(events)
    console.log(`Created ${createdEvents.length} events`)

    console.log("Database seeded successfully!")
    console.log("\nSample login credentials:")
    console.log("Email: john@example.com, Password: password123")
    console.log("Email: jane@example.com, Password: password123")
    console.log("Email: mike@example.com, Password: password123")
    console.log("Email: sarah@example.com, Password: password123")

    process.exit(0)
  } catch (error) {
    console.error("Error seeding database:", error)
    process.exit(1)
  }
}

// Run the seed function
seedDatabase()
