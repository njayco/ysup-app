const fs = require("fs")
const path = require("path")

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, "../logs")
    this.ensureLogDirectory()
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true })
    }
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta,
    }
    return JSON.stringify(logEntry) + "\n"
  }

  writeToFile(filename, content) {
    const filePath = path.join(this.logDir, filename)
    fs.appendFileSync(filePath, content)
  }

  info(message, meta = {}) {
    const logMessage = this.formatMessage("INFO", message, meta)
    console.log(`ℹ️  ${message}`, meta)
    this.writeToFile("app.log", logMessage)
  }

  error(message, error = null, meta = {}) {
    const errorMeta = {
      ...meta,
      ...(error && {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
      }),
    }
    const logMessage = this.formatMessage("ERROR", message, errorMeta)
    console.error(`❌ ${message}`, errorMeta)
    this.writeToFile("error.log", logMessage)
  }

  warn(message, meta = {}) {
    const logMessage = this.formatMessage("WARN", message, meta)
    console.warn(`⚠️  ${message}`, meta)
    this.writeToFile("app.log", logMessage)
  }

  debug(message, meta = {}) {
    if (process.env.NODE_ENV === "development") {
      const logMessage = this.formatMessage("DEBUG", message, meta)
      console.log(`🐛 ${message}`, meta)
      this.writeToFile("debug.log", logMessage)
    }
  }

  gameEvent(userId, action, points, meta = {}) {
    const gameLogMessage = this.formatMessage("GAME", `User ${userId} performed ${action}`, {
      userId,
      action,
      points,
      ...meta,
    })
    console.log(`🎮 Game Event: User ${userId} - ${action} (+${points} YBucks)`)
    this.writeToFile("game.log", gameLogMessage)
  }

  userActivity(userId, activity, meta = {}) {
    const activityMessage = this.formatMessage("ACTIVITY", activity, {
      userId,
      ...meta,
    })
    this.writeToFile("activity.log", activityMessage)
  }
}

module.exports = new Logger()
