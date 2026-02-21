const User = require("../models/User")
const GameSession = require("../models/GameSession")
const logger = require("./logger")
const emailService = require("./emailService")

class GameEngine {
  constructor() {
    this.pointValues = {
      ask_question: 10,
      provide_assistance: 100,
      correct_answer: 10,
      attendance: 250,
      good_behavior: { min: 10, max: 250 },
      homework_completion: 10,
      graded_assignment: { min: 50, max: 100 },
      no_questions_bonus: 250, // Teacher bonus
    }
  }

  async awardPoints(userId, action, courseId, description = "", customPoints = null) {
    try {
      const user = await User.findById(userId)
      if (!user) {
        throw new Error("User not found")
      }

      // Calculate points based on action
      const points = customPoints || this.calculatePoints(action)

      // Create game session record
      const gameSession = new GameSession({
        user: userId,
        course: courseId,
        action,
        points,
        description,
      })

      await gameSession.save()

      // Award YBucks to user
      await user.addYBucks(points)

      // Log the game event
      logger.gameEvent(userId, action, points, {
        courseId,
        description,
        newBalance: user.ybucks + points,
      })

      // Send notification email for significant achievements
      if (points >= 100) {
        await emailService.sendGameNotification(user, {
          type: action,
          points,
          description,
        })
      }

      return {
        success: true,
        points,
        newBalance: user.ybucks + points,
        level: user.level,
        gameSession,
      }
    } catch (error) {
      logger.error("Error awarding game points", error, {
        userId,
        action,
        courseId,
      })
      throw error
    }
  }

  calculatePoints(action) {
    const pointValue = this.pointValues[action]

    if (typeof pointValue === "number") {
      return pointValue
    }

    if (typeof pointValue === "object" && pointValue.min && pointValue.max) {
      // For variable point actions, return middle value
      return Math.floor((pointValue.min + pointValue.max) / 2)
    }

    return 10 // Default points
  }

  async getLeaderboard(courseId = null, limit = 50) {
    try {
      const matchStage = courseId ? { course: courseId } : {}

      const leaderboard = await GameSession.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: "$user",
            totalPoints: { $sum: "$points" },
            sessionsCount: { $sum: 1 },
            lastActivity: { $max: "$createdAt" },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            _id: 1,
            totalPoints: 1,
            sessionsCount: 1,
            lastActivity: 1,
            user: {
              firstName: 1,
              lastName: 1,
              username: 1,
              profileImage: 1,
              level: 1,
            },
          },
        },
        { $sort: { totalPoints: -1 } },
        { $limit: limit },
      ])

      return leaderboard.map((entry, index) => ({
        rank: index + 1,
        ...entry,
      }))
    } catch (error) {
      logger.error("Error generating leaderboard", error, { courseId })
      throw error
    }
  }

  async getUserGameStats(userId, courseId = null) {
    try {
      const matchStage = {
        user: userId,
        ...(courseId && { course: courseId }),
      }

      const stats = await GameSession.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalPoints: { $sum: "$points" },
            totalSessions: { $sum: 1 },
            averagePoints: { $avg: "$points" },
            actionBreakdown: {
              $push: {
                action: "$action",
                points: "$points",
                date: "$createdAt",
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            totalPoints: 1,
            totalSessions: 1,
            averagePoints: { $round: ["$averagePoints", 2] },
            actionBreakdown: 1,
          },
        },
      ])

      const user = await User.findById(userId).select("ybucks level")

      return {
        gameStats: stats[0] || {
          totalPoints: 0,
          totalSessions: 0,
          averagePoints: 0,
          actionBreakdown: [],
        },
        currentYBucks: user.ybucks,
        currentLevel: user.level,
      }
    } catch (error) {
      logger.error("Error getting user game stats", error, { userId, courseId })
      throw error
    }
  }

  async selectTeamCaptain(courseId, userId) {
    try {
      // In a real implementation, you might have a separate model for daily captains
      // For now, we'll just award bonus points for being selected as captain
      await this.awardPoints(userId, "good_behavior", courseId, "Selected as team captain", 100)

      logger.info(`User ${userId} selected as team captain for course ${courseId}`)

      return {
        success: true,
        message: "Team captain selected successfully",
        bonusPoints: 100,
      }
    } catch (error) {
      logger.error("Error selecting team captain", error, { courseId, userId })
      throw error
    }
  }

  async endGameSession(courseId, teacherBonus = false) {
    try {
      const results = {
        courseId,
        endTime: new Date(),
        teacherBonus,
      }

      if (teacherBonus) {
        // Award teacher bonus for no questions asked
        logger.info(`Teacher earned bonus for course ${courseId} - no questions asked`)
        results.teacherBonusPoints = this.pointValues.no_questions_bonus
      }

      return results
    } catch (error) {
      logger.error("Error ending game session", error, { courseId })
      throw error
    }
  }
}

module.exports = new GameEngine()
