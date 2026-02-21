const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const { createServer } = require("http")
const { Server } = require("socket.io")
require("dotenv").config()

// Import routes
const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/users")
const postRoutes = require("./routes/posts")
const courseRoutes = require("./routes/courses")
const fileRoutes = require("./routes/files")
const gameRoutes = require("./routes/game")
const eventRoutes = require("./routes/events")
const messageRoutes = require("./routes/messages")
const bookstoreRoutes = require("./routes/bookstore")
const bulletinRoutes = require("./routes/bulletin")
const academyRoutes = require("./routes/academy")

// Import middleware
const authMiddleware = require("./middleware/auth")
const errorHandler = require("./middleware/errorHandler")

// Import socket handlers
const socketHandler = require("./socket/socketHandler")

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

// Security middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
})
app.use("/api/", limiter)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/ysup", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Socket.io setup
socketHandler(io)

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", authMiddleware, userRoutes)
app.use("/api/posts", authMiddleware, postRoutes)
app.use("/api/courses", authMiddleware, courseRoutes)
app.use("/api/files", authMiddleware, fileRoutes)
app.use("/api/game", authMiddleware, gameRoutes)
app.use("/api/events", authMiddleware, eventRoutes)
app.use("/api/messages", authMiddleware, messageRoutes)
app.use("/api/bookstore", authMiddleware, bookstoreRoutes)
app.use("/api/bulletin", authMiddleware, bulletinRoutes)
app.use("/api/academy", authMiddleware, academyRoutes)

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// Error handling middleware
app.use(errorHandler)

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" })
})

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(`YsUp Backend Server running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`)
})

module.exports = { app, server, io }
