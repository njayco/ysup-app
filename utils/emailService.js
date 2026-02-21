const nodemailer = require("nodemailer")

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  }

  async sendWelcomeEmail(user) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Welcome to YsUp Campus Network! 🎓",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb; text-align: center;">Welcome to YsUp! 🎉</h1>
            
            <p>Hi ${user.firstName},</p>
            
            <p>Welcome to the YsUp Campus Network! We're excited to have you join our community of students who are revolutionizing education through engagement and collaboration.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin-top: 0;">Your YsUp Journey Starts Now:</h3>
              <ul style="color: #374151;">
                <li>🎮 Participate in the YsUp Game to earn YBucks</li>
                <li>💬 Connect with classmates in course networks</li>
                <li>📚 Access YsUp Academy for educational content</li>
                <li>🛍️ Use YBucks in the YsUp Bookstore</li>
                <li>📅 Stay organized with the YsUp Calendar</li>
              </ul>
            </div>
            
            <p>You've been awarded <strong>100 YBucks</strong> to get you started! Use them to purchase items in the bookstore or unlock premium features.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL}/dashboard" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Get Started
              </a>
            </div>
            
            <p>If you have any questions, feel free to reach out to our support team.</p>
            
            <p>Welcome to the movement!<br>
            The YsUp Team</p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="font-size: 12px; color: #6b7280; text-align: center;">
              YsUp Campus Network - Revolutionizing Education Through Engagement
            </p>
          </div>
        `,
      }

      await this.transporter.sendMail(mailOptions)
      console.log(`Welcome email sent to ${user.email}`)
    } catch (error) {
      console.error("Error sending welcome email:", error)
    }
  }

  async sendGameNotification(user, gameEvent) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: `YsUp Game Update: ${gameEvent.type} 🎮`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">YsUp Game Update! 🎮</h1>
            
            <p>Hi ${user.firstName},</p>
            
            <p>Great job in today's YsUp Game session!</p>
            
            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
              <h3 style="margin-top: 0; color: #1e40af;">Points Earned: ${gameEvent.points} YBucks</h3>
              <p style="margin-bottom: 0;"><strong>Action:</strong> ${gameEvent.description}</p>
            </div>
            
            <p>Keep up the great work and continue engaging in class to earn more YBucks!</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL}/the-game" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Game Stats
              </a>
            </div>
            
            <p>Best regards,<br>
            The YsUp Team</p>
          </div>
        `,
      }

      await this.transporter.sendMail(mailOptions)
      console.log(`Game notification sent to ${user.email}`)
    } catch (error) {
      console.error("Error sending game notification:", error)
    }
  }

  async sendEventReminder(user, event) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: `Reminder: ${event.title} 📅`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Event Reminder 📅</h1>
            
            <p>Hi ${user.firstName},</p>
            
            <p>This is a reminder about the upcoming event you're attending:</p>
            
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
              <h3 style="margin-top: 0; color: #1f2937;">${event.title}</h3>
              <p><strong>Date:</strong> ${new Date(event.startDate).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${new Date(event.startDate).toLocaleTimeString()}</p>
              <p><strong>Location:</strong> ${event.location}</p>
              <p><strong>Description:</strong> ${event.description}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL}/events/${event._id}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Event Details
              </a>
            </div>
            
            <p>See you there!</p>
            
            <p>Best regards,<br>
            The YsUp Team</p>
          </div>
        `,
      }

      await this.transporter.sendMail(mailOptions)
      console.log(`Event reminder sent to ${user.email}`)
    } catch (error) {
      console.error("Error sending event reminder:", error)
    }
  }
}

module.exports = new EmailService()
