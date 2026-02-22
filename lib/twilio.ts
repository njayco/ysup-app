import twilio from "twilio"
import crypto from "crypto"

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioPhone = process.env.TWILIO_PHONE_NUMBER

function getClient() {
  if (!accountSid || !authToken) {
    throw new Error("Twilio credentials not configured")
  }
  return twilio(accountSid, authToken)
}

export async function sendSms(to: string, message: string): Promise<{ success: boolean; error?: string; sid?: string }> {
  try {
    const client = getClient()
    if (!twilioPhone) {
      throw new Error("TWILIO_PHONE_NUMBER not configured")
    }
    const result = await client.messages.create({
      body: message,
      from: twilioPhone,
      to,
    })
    return { success: true, sid: result.sid }
  } catch (err: any) {
    console.error("Twilio sendSms error:", err.message)
    return { success: false, error: err.message }
  }
}

export function generateVerificationCode(): string {
  const buffer = crypto.randomBytes(4)
  const num = buffer.readUInt32BE(0) % 1000000
  return num.toString().padStart(6, "0")
}

export function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (digits.length === 10) {
    return `+1${digits}`
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`
  }
  if (digits.startsWith("+")) {
    return digits
  }
  return `+${digits}`
}

export function isValidE164(phone: string): boolean {
  return /^\+[1-9]\d{1,14}$/.test(phone)
}

export function validateTwilioSignature(
  url: string,
  params: Record<string, string>,
  signature: string
): boolean {
  if (!authToken) return false
  return twilio.validateRequest(authToken, signature, url, params)
}
