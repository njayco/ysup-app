const jwt = require("jsonwebtoken")
const User = require("../models/User")
const Message = require("../models/Message")

const socketHandler = (io) => {
  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token
      if (!token) {
        return next(new Error("Authentication error"))
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret")
      const user = await User.findById(decoded.userId)

      if (!user) {
        return next(new Error("User not found"))
      }

      socket.userId = user._id.toString()
      socket.user = user
      next()
    } catch (error) {
      next(new Error("Authentication error"))
    }
  })

  io.on("connection", async (socket) => {
    console.log(`User ${socket.user.username} connected`)

    // Update user online status
    await User.findByIdAndUpdate(socket.userId, {
      isOnline: true,
      lastSeen: new Date(),
    })

    // Join user to their personal room
    socket.join(socket.userId)

    // Handle joining course rooms
    socket.on("join_course", (courseId) => {
      socket.join(`course_${courseId}`)
      console.log(`User ${socket.user.username} joined course ${courseId}`)
    })

    // Handle leaving course rooms
    socket.on("leave_course", (courseId) => {
      socket.leave(`course_${courseId}`)
      console.log(`User ${socket.user.username} left course ${courseId}`)
    })

    // Handle private messages
    socket.on("send_message", async (data) => {
      try {
        const { recipientId, content, type = "text" } = data

        // Create message
        const message = new Message({
          sender: socket.userId,
          recipient: recipientId,
          content,
          type,
        })

        await message.save()
        await message.populate("sender", "firstName lastName username profileImage")

        // Send to recipient if online
        socket.to(recipientId).emit("new_message", message)

        // Send confirmation to sender
        socket.emit("message_sent", {
          messageId: message._id,
          timestamp: message.createdAt,
        })

        console.log(`Message sent from ${socket.user.username} to ${recipientId}`)
      } catch (error) {
        console.error("Send message error:", error)
        socket.emit("message_error", { message: "Failed to send message" })
      }
    })

    // Handle message read receipts
    socket.on("mark_read", async (messageId) => {
      try {
        const message = await Message.findById(messageId)
        if (message && message.recipient.toString() === socket.userId) {
          await message.markAsRead()

          // Notify sender
          socket.to(message.sender.toString()).emit("message_read", {
            messageId,
            readAt: message.readAt,
          })
        }
      } catch (error) {
        console.error("Mark read error:", error)
      }
    })

    // Handle typing indicators
    socket.on("typing_start", (recipientId) => {
      socket.to(recipientId).emit("user_typing", {
        userId: socket.userId,
        username: socket.user.username,
      })
    })

    socket.on("typing_stop", (recipientId) => {
      socket.to(recipientId).emit("user_stopped_typing", {
        userId: socket.userId,
      })
    })

    // Handle course post notifications
    socket.on("new_post", (data) => {
      const { courseId, post } = data
      socket.to(`course_${courseId}`).emit("course_new_post", post)
    })

    // Handle game events
    socket.on("game_event", (data) => {
      const { courseId, event } = data
      socket.to(`course_${courseId}`).emit("game_update", event)
    })

    // Handle disconnect
    socket.on("disconnect", async () => {
      console.log(`User ${socket.user.username} disconnected`)

      // Update user offline status
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date(),
      })

      // Notify friends of offline status
      const user = await User.findById(socket.userId).populate("friends")
      user.friends.forEach((friend) => {
        socket.to(friend._id.toString()).emit("friend_offline", {
          userId: socket.userId,
          lastSeen: new Date(),
        })
      })
    })
  })
}

module.exports = socketHandler
