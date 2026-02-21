# YsUp Campus Network Backend

Revolutionary educational platform backend that gamifies learning and creates engaging campus communities.

## 🚀 Features

### Core Platform
- **User Authentication & Authorization** - JWT-based secure authentication
- **Real-time Communication** - Socket.io powered messaging and notifications
- **YsUp Game System** - Gamified learning with points and leaderboards
- **Course Management** - Enrollment, announcements, and class networks
- **File Sharing** - Secure document sharing with permission controls
- **Event Management** - Campus calendar with RSVP functionality
- **YBucks Economy** - Point-based reward system
- **YsUp Academy** - Educational content library
- **Bulletin Board** - Campus-wide announcements and events
- **YsUp Bookstore** - Virtual marketplace using YBucks

### Technical Features
- **MongoDB Database** - Scalable NoSQL data storage
- **Express.js API** - RESTful API endpoints
- **Socket.io Integration** - Real-time features
- **Email Notifications** - Automated email system
- **File Upload System** - Multer-based file handling
- **Rate Limiting** - API protection and security
- **Input Validation** - Comprehensive data validation
- **Error Handling** - Centralized error management
- **Logging System** - Detailed application logging

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd ysup-campus-platform
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   \`\`\`env
   # Database
   MONGODB_URI=mongodb://localhost:27017/ysup
   
   # Server
   PORT=5000
   CLIENT_URL=http://localhost:3000
   
   # Authentication
   JWT_SECRET=your-super-secret-jwt-key
   
   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   \`\`\`

4. **Set up database indexes**
   \`\`\`bash
   npm run setup-indexes
   \`\`\`

5. **Seed the database with sample data**
   \`\`\`bash
   npm run seed
   \`\`\`

6. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### User Endpoints
- `GET /api/users/search` - Search users
- `GET /api/users/:id` - Get user profile
- `POST /api/users/:id/friend` - Add friend
- `DELETE /api/users/:id/friend` - Remove friend
- `GET /api/users/leaderboard` - Get YBucks leaderboard

### Course Endpoints
- `GET /api/courses` - Get courses with filters
- `GET /api/courses/:id` - Get course details
- `POST /api/courses/:id/enroll` - Enroll in course
- `DELETE /api/courses/:id/enroll` - Unenroll from course

### Game Endpoints
- `POST /api/game/action` - Record game action
- `GET /api/game/leaderboard` - Get game leaderboard
- `GET /api/game/stats/:userId` - Get user game stats
- `POST /api/game/captain` - Select team captain

### Message Endpoints
- `GET /api/messages/conversations` - Get conversations
- `GET /api/messages/:userId` - Get conversation with user
- `POST /api/messages` - Send message
- `PUT /api/messages/:id/read` - Mark message as read

### Event Endpoints
- `GET /api/events` - Get events (calendar view)
- `POST /api/events` - Create event
- `GET /api/events/:id` - Get event details
- `POST /api/events/:id/attend` - RSVP to event

### File Endpoints
- `GET /api/files` - Get accessible files
- `POST /api/files/upload` - Upload file
- `GET /api/files/:id` - Get file details
- `POST /api/files/:id/download` - Download file

### Bookstore Endpoints
- `GET /api/bookstore/items` - Get store items
- `POST /api/bookstore/purchase` - Purchase with YBucks
- `GET /api/bookstore/balance` - Get YBucks balance

### Academy Endpoints
- `GET /api/academy/featured` - Get featured content
- `GET /api/academy/content` - Get academy content
- `GET /api/academy/movies` - Get YsUp movies

## 🎮 YsUp Game System

The YsUp Game transforms traditional classroom learning into an engaging team sport:

### Point System
- **Ask Question**: 10 YBucks
- **Provide Assistance**: 100 YBucks
- **Correct Answer**: 10 YBucks
- **Perfect Attendance**: 250 YBucks
- **Good Behavior**: 10-250 YBucks
- **Homework Completion**: 10 YBucks
- **Graded Assignments**: 50-100 YBucks

### Game Rules
1. Students ask questions without fear
2. Team members assist with hints, not direct answers
3. Team captains are selected daily
4. Teachers earn bonus points when no questions are asked
5. All actions are tracked and rewarded

## 🔧 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with sample data
- `npm run setup-indexes` - Create database indexes
- `npm test` - Run test suite
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 🏗️ Project Structure

\`\`\`
ysup-campus-platform/
├── models/              # Database models
├── routes/              # API route handlers
├── middleware/          # Custom middleware
├── socket/              # Socket.io handlers
├── utils/               # Utility functions
├── scripts/             # Database and setup scripts
├── tests/               # Test files
├── logs/                # Application logs
├── server.js            # Main server file
└── package.json         # Dependencies and scripts
\`\`\`

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt password encryption
- **Rate Limiting** - API request throttling
- **Input Validation** - Comprehensive data validation
- **CORS Protection** - Cross-origin request security
- **Helmet Security** - HTTP header security
- **File Upload Validation** - Secure file handling

## 📊 Database Models

### User Model
- Personal information and authentication
- YBucks balance and level tracking
- Course enrollments and friendships
- Game statistics and achievements

### Course Model
- Course information and schedules
- Student enrollment management
- Announcements and resources
- Integration with external LMS

### Game Session Model
- Individual game action tracking
- Point calculations and rewards
- Leaderboard generation
- Performance analytics

### Message Model
- Real-time messaging system
- Conversation management
- Read receipts and reactions
- File attachments

## 🚀 Deployment

### Environment Setup
1. Set up MongoDB Atlas or self-hosted MongoDB
2. Configure environment variables for production
3. Set up email service (Gmail, SendGrid, etc.)
4. Configure file storage (AWS S3, Cloudinary, etc.)

### Production Considerations
- Use PM2 for process management
- Set up reverse proxy with Nginx
- Configure SSL certificates
- Implement monitoring and logging
- Set up automated backups

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Core authentication system
- ✅ YsUp Game implementation
- ✅ Real-time messaging
- ✅ Course management
- ✅ File sharing system

### Phase 2 (Next)
- 🔄 Mobile app integration
- 🔄 Advanced analytics dashboard
- 🔄 AI-powered tutoring system
- 🔄 Integration with external LMS
- 🔄 Video conferencing features

### Phase 3 (Future)
- 📋 Blockchain-based credentials
- 📋 VR/AR learning experiences
- 📋 Advanced AI recommendations
- 📋 Global campus network
- 📋 Enterprise partnerships

---

**YsUp Campus Network** - Revolutionizing education through engagement and gamification! 🎓✨
\`\`\`

```typescriptreact file="scripts/seedDatabase.js"
[v0-no-op-code-block-prefix]const mongoose = require("mongoose")
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
