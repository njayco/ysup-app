const request = require("supertest")
const mongoose = require("mongoose")
const { app } = require("../server")
const User = require("../models/User")

describe("Authentication Endpoints", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/ysup_test")
  })

  beforeEach(async () => {
    await User.deleteMany({})
  })

  afterAll(async () => {
    await mongoose.connection.close()
  })

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        username: "johndoe",
        email: "john@example.com",
        password: "Password123",
        phone: "+1234567890",
        college: "Howard University",
        major: "Computer Science",
        year: "Junior",
      }

      const response = await request(app).post("/api/auth/register").send(userData)

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.user.email).toBe(userData.email)
      expect(response.body.token).toBeDefined()
    })

    it("should not register user with invalid email", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        username: "johndoe",
        email: "invalid-email",
        password: "Password123",
        college: "Howard University",
        major: "Computer Science",
        year: "Junior",
      }

      const response = await request(app).post("/api/auth/register").send(userData)

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })
  })

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      const user = new User({
        firstName: "John",
        lastName: "Doe",
        username: "johndoe",
        email: "john@example.com",
        password: "Password123",
        college: "Howard University",
        major: "Computer Science",
        year: "Junior",
      })
      await user.save()
    })

    it("should login user with correct credentials", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "john@example.com",
        password: "Password123",
      })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.token).toBeDefined()
    })

    it("should not login user with incorrect password", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "john@example.com",
        password: "wrongpassword",
      })

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
    })
  })
})
