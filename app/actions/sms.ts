"use server"

import { Pool } from "pg"
import bcrypt from "bcryptjs"
import { generateVerificationCode, sendSms, toE164, isValidE164 } from "@/lib/twilio"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const RATE_LIMIT_WINDOW_MINUTES = 15
const MAX_SENDS_PER_WINDOW = 3
const CODE_EXPIRY_MINUTES = 10
const MAX_VERIFY_ATTEMPTS = 5

export async function sendVerificationCode(
  phoneNumber: string,
  purpose: "signup" | "reset_password",
  userId?: number
) {
  try {
    const digits = phoneNumber.replace(/\D/g, "")
    const e164 = toE164(digits)

    if (!isValidE164(e164)) {
      return { success: false, error: "Invalid phone number format" }
    }

    const recentSends = await pool.query(
      `SELECT COUNT(*) as cnt FROM sms_verification_codes
       WHERE phone_number = $1 AND purpose = $2
       AND created_at > now() - interval '${RATE_LIMIT_WINDOW_MINUTES} minutes'`,
      [digits, purpose]
    )

    if (parseInt(recentSends.rows[0].cnt) >= MAX_SENDS_PER_WINDOW) {
      return { success: false, error: "Too many codes sent. Please wait a few minutes and try again." }
    }

    const code = generateVerificationCode()
    const codeHash = await bcrypt.hash(code, 10)

    await pool.query(
      `UPDATE sms_verification_codes SET consumed_at = now()
       WHERE phone_number = $1 AND purpose = $2 AND consumed_at IS NULL AND expires_at > now()`,
      [digits, purpose]
    )

    await pool.query(
      `INSERT INTO sms_verification_codes (user_id, phone_number, code_hash, purpose, expires_at)
       VALUES ($1, $2, $3, $4, now() + interval '${CODE_EXPIRY_MINUTES} minutes')`,
      [userId || null, digits, codeHash, purpose]
    )

    const purposeLabel = purpose === "signup" ? "verify your phone" : "reset your password"
    const smsResult = await sendSms(
      e164,
      `Your YsUp verification code to ${purposeLabel} is: ${code}. It expires in ${CODE_EXPIRY_MINUTES} minutes.`
    )

    if (!smsResult.success) {
      return { success: false, error: "Failed to send SMS. Please check your phone number and try again." }
    }

    const maskedPhone = `(•••) •••-${digits.slice(-4)}`
    return { success: true, maskedPhone }
  } catch (err) {
    console.error("sendVerificationCode error:", err)
    return { success: false, error: "Something went wrong. Please try again." }
  }
}

export async function verifyCode(
  phoneNumber: string,
  code: string,
  purpose: "signup" | "reset_password"
) {
  try {
    const digits = phoneNumber.replace(/\D/g, "")

    const result = await pool.query(
      `SELECT * FROM sms_verification_codes
       WHERE phone_number = $1 AND purpose = $2 AND consumed_at IS NULL AND expires_at > now()
       ORDER BY created_at DESC LIMIT 1`,
      [digits, purpose]
    )

    if (result.rows.length === 0) {
      return { success: false, error: "No valid code found. Please request a new one." }
    }

    const record = result.rows[0]

    if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
      return { success: false, error: "Too many attempts. Please request a new code." }
    }

    await pool.query(
      `UPDATE sms_verification_codes SET attempts = attempts + 1 WHERE id = $1`,
      [record.id]
    )

    const isValid = await bcrypt.compare(code, record.code_hash)

    if (!isValid) {
      const remaining = MAX_VERIFY_ATTEMPTS - record.attempts - 1
      return {
        success: false,
        error: remaining > 0
          ? `Invalid code. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`
          : "Too many attempts. Please request a new code.",
      }
    }

    await pool.query(
      `UPDATE sms_verification_codes SET consumed_at = now() WHERE id = $1`,
      [record.id]
    )

    if (purpose === "signup" && record.user_id) {
      await pool.query(
        `UPDATE users SET phone_verified = true, phone_verified_at = now() WHERE id = $1`,
        [record.user_id]
      )
    }

    return { success: true, userId: record.user_id }
  } catch (err) {
    console.error("verifyCode error:", err)
    return { success: false, error: "Something went wrong. Please try again." }
  }
}

export async function sendResetCode(phoneNumber: string) {
  try {
    const digits = phoneNumber.replace(/\D/g, "")
    const e164 = toE164(digits)

    if (!isValidE164(e164)) {
      return { success: false, error: "Please enter a valid phone number." }
    }

    const userResult = await pool.query(
      `SELECT id FROM users WHERE phone = $1`,
      [digits]
    )

    if (userResult.rows.length === 0) {
      return { success: true, maskedPhone: `(•••) •••-${digits.slice(-4)}` }
    }

    const userId = userResult.rows[0].id
    return await sendVerificationCode(digits, "reset_password", userId)
  } catch (err) {
    console.error("sendResetCode error:", err)
    return { success: false, error: "Something went wrong. Please try again." }
  }
}

export async function resetPassword(phoneNumber: string, newPassword: string) {
  try {
    const digits = phoneNumber.replace(/\D/g, "")

    if (newPassword.length < 6) {
      return { success: false, error: "Password must be at least 6 characters long" }
    }

    const codeCheck = await pool.query(
      `SELECT user_id FROM sms_verification_codes
       WHERE phone_number = $1 AND purpose = 'reset_password' AND consumed_at IS NOT NULL
       AND consumed_at > now() - interval '15 minutes'
       ORDER BY consumed_at DESC LIMIT 1`,
      [digits]
    )

    if (codeCheck.rows.length === 0 || !codeCheck.rows[0].user_id) {
      return { success: false, error: "Please verify your phone number first." }
    }

    const userId = codeCheck.rows[0].user_id
    const passwordHash = await bcrypt.hash(newPassword, 10)

    await pool.query(
      `UPDATE users SET password_hash = $1 WHERE id = $2`,
      [passwordHash, userId]
    )

    const userResult = await pool.query(
      `SELECT id, username, phone, first_name, last_name, college FROM users WHERE id = $1`,
      [userId]
    )

    if (userResult.rows.length === 0) {
      return { success: false, error: "User not found." }
    }

    const user = userResult.rows[0]
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
    console.error("resetPassword error:", err)
    return { success: false, error: "Something went wrong. Please try again." }
  }
}
