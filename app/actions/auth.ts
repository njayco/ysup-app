"use server"

import { Pool } from "pg"
import bcrypt from "bcryptjs"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-\(\)\+]/g, "")
}

export async function signupUser(formData: FormData) {
  try {
    const college = formData.get("college") as string
    const rawPhone = formData.get("phone") as string
    const phone = normalizePhone(rawPhone)
    const username = (formData.get("username") as string).trim().toLowerCase()
    const password = formData.get("password") as string
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const agreeTerms = formData.get("agreeTerms") === "on"

    if (!phone || !username || !password || !firstName || !lastName) {
      return { success: false, error: "All fields are required" }
    }

    if (username.length < 4) {
      return { success: false, error: "Username must be at least 4 characters long" }
    }

    if (!/^[a-zA-Z0-9_.]+$/.test(username)) {
      return { success: false, error: "Username can only contain letters, numbers, underscores, and dots" }
    }

    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters long" }
    }

    if (!agreeTerms) {
      return { success: false, error: "You must agree to the Terms & Conditions" }
    }

    const existingByPhone = await pool.query(
      "SELECT id FROM users WHERE phone = $1",
      [phone]
    )
    if (existingByPhone.rows.length > 0) {
      return { success: false, error: "User with this phone number already exists" }
    }

    const existingByUsername = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    )
    if (existingByUsername.rows.length > 0) {
      return { success: false, error: "Username is already taken" }
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const result = await pool.query(
      `INSERT INTO users (username, phone, password_hash, first_name, last_name, college)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, username, phone, first_name, last_name, college`,
      [username, phone, passwordHash, firstName, lastName, college || "Howard University"]
    )

    const newUser = result.rows[0]

    if (newUser.college === "Howard University") {
      try {
        const universityEvents = await pool.query(
          `SELECT id FROM calendar_events WHERE source = 'howard_university'`
        )
        for (const event of universityEvents.rows) {
          await pool.query(
            `INSERT INTO event_invites (event_id, user_id, rsvp) VALUES ($1, $2, 'going')
             ON CONFLICT (event_id, user_id) DO NOTHING`,
            [event.id, newUser.id]
          )
        }
      } catch (e) {
        console.error("Failed to auto-enroll user in Howard events:", e)
      }
    }

    return {
      success: true,
      user: {
        id: newUser.id.toString(),
        phone: newUser.phone,
        username: newUser.username,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        college: newUser.college,
      },
    }
  } catch (err) {
    console.error("Signup error:", err)
    return { success: false, error: "Something went wrong. Please try again." }
  }
}

export async function loginUser(formData: FormData) {
  try {
    const identifier = formData.get("identifier") as string
    const password = formData.get("password") as string

    if (!identifier || !password) {
      return { success: false, error: "Please enter your username or phone number and password" }
    }

    const trimmed = identifier.trim()
    const isPhone = /^[\d\s\-\(\)\+]+$/.test(trimmed)

    let result
    if (isPhone) {
      const normalizedPhone = normalizePhone(trimmed)
      result = await pool.query(
        "SELECT * FROM users WHERE phone = $1",
        [normalizedPhone]
      )
    } else {
      const cleanUsername = trimmed.startsWith("+") ? trimmed.slice(1) : trimmed
      result = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [cleanUsername.toLowerCase()]
      )
    }

    if (result.rows.length === 0) {
      return { success: false, error: "Invalid credentials" }
    }

    const user = result.rows[0]
    const passwordMatch = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatch) {
      return { success: false, error: "Invalid credentials" }
    }

    return {
      success: true,
      user: {
        id: user.id.toString(),
        phone: user.phone,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        college: user.college,
      },
    }
  } catch (err) {
    console.error("Login error:", err)
    return { success: false, error: "Something went wrong. Please try again." }
  }
}
