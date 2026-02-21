const mongoose = require("mongoose")
require("dotenv").config()

const setupIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/ysup")
    console.log("Connected to MongoDB")

    const db = mongoose.connection.db

    // User indexes
    await db.collection("users").createIndex({ email: 1 }, { unique: true })
    await db.collection("users").createIndex({ username: 1 }, { unique: true })
    await db.collection("users").createIndex({ college: 1, major: 1 })
    await db.collection("users").createIndex({ ybucks: -1 })
    await db.collection("users").createIndex({ level: -1 })
    await db.collection("users").createIndex({ isOnline: 1 })
    await db.collection("users").createIndex({ firstName: "text", lastName: "text", username: "text" })

    // Course indexes
    await db.collection("courses").createIndex({ code: 1 }, { unique: true })
    await db.collection("courses").createIndex({ college: 1, department: 1 })
    await db.collection("courses").createIndex({ semester: 1, year: 1 })
    await db.collection("courses").createIndex({ isActive: 1 })
    await db.collection("courses").createIndex({ name: "text", description: "text" })

    // Post indexes
    await db.collection("posts").createIndex({ author: 1, createdAt: -1 })
    await db.collection("posts").createIndex({ course: 1, createdAt: -1 })
    await db.collection("posts").createIndex({ type: 1 })
    await db.collection("posts").createIndex({ tags: 1 })
    await db.collection("posts").createIndex({ content: "text" })

    // Message indexes
    await db.collection("messages").createIndex({ sender: 1, recipient: 1, createdAt: -1 })
    await db.collection("messages").createIndex({ recipient: 1, isRead: 1 })
    await db.collection("messages").createIndex({ createdAt: -1 })

    // Event indexes
    await db.collection("events").createIndex({ startDate: 1, endDate: 1 })
    await db.collection("events").createIndex({ creator: 1 })
    await db.collection("events").createIndex({ course: 1 })
    await db.collection("events").createIndex({ type: 1 })
    await db.collection("events").createIndex({ isActive: 1 })
    await db.collection("events").createIndex({ title: "text", description: "text" })

    // GameSession indexes
    await db.collection("gamesessions").createIndex({ user: 1, createdAt: -1 })
    await db.collection("gamesessions").createIndex({ course: 1, createdAt: -1 })
    await db.collection("gamesessions").createIndex({ action: 1 })
    await db.collection("gamesessions").createIndex({ points: -1 })

    // File indexes
    await db.collection("files").createIndex({ owner: 1, createdAt: -1 })
    await db.collection("files").createIndex({ course: 1 })
    await db.collection("files").createIndex({ type: 1 })
    await db.collection("files").createIndex({ isPublic: 1 })
    await db.collection("files").createIndex({ isActive: 1 })
    await db.collection("files").createIndex({ filename: "text", originalName: "text" })

    console.log("✅ All database indexes created successfully!")

    // Display index information
    const collections = ["users", "courses", "posts", "messages", "events", "gamesessions", "files"]

    for (const collectionName of collections) {
      const indexes = await db.collection(collectionName).indexes()
      console.log(`\n📊 ${collectionName} indexes:`)
      indexes.forEach((index) => {
        console.log(`  - ${JSON.stringify(index.key)} ${index.unique ? "(unique)" : ""}`)
      })
    }

    process.exit(0)
  } catch (error) {
    console.error("❌ Error setting up indexes:", error)
    process.exit(1)
  }
}

setupIndexes()
