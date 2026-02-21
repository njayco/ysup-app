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
  const college = formData.get("college") as string
  const rawPhone = formData.get("phone") as string
  const phone = normalizePhone(rawPhone)
  const username = (formData.get("username") as string).trim().toLowerCase()
  const password = formData.get("password") as string
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const agreeTerms = formData.get("agreeTerms") === "on"

  if (!phone || !username || !password || !firstName || !lastName) {
    throw new Error("All fields are required")
  }

  if (username.length < 4) {
    throw new Error("Username must be at least 4 characters long")
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters long")
  }

  if (!agreeTerms) {
    throw new Error("You must agree to the Terms & Conditions")
  }

  const existingUser = await pool.query(
    "SELECT id, phone, username FROM users WHERE phone = $1 OR username = $2",
    [phone, username]
  )

  if (existingUser.rows.length > 0) {
    const existing = existingUser.rows[0]
    if (existing.phone === phone) {
      throw new Error("User with this phone number already exists")
    } else {
      throw new Error("Username is already taken")
    }
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const result = await pool.query(
    `INSERT INTO users (username, phone, password_hash, first_name, last_name, college)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, username, phone, first_name, last_name, college`,
    [username, phone, passwordHash, firstName, lastName, college || "Howard University"]
  )

  const newUser = result.rows[0]

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
}

export async function loginUser(formData: FormData) {
  const identifier = formData.get("identifier") as string
  const password = formData.get("password") as string

  if (!identifier || !password) {
    throw new Error("Please enter your username or phone number and password")
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
    throw new Error("Invalid credentials")
  }

  const user = result.rows[0]
  const passwordMatch = await bcrypt.compare(password, user.password_hash)

  if (!passwordMatch) {
    throw new Error("Invalid credentials")
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
}
