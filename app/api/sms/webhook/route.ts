import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"
import { validateTwilioSignature } from "@/lib/twilio"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const params: Record<string, string> = {}
    formData.forEach((value, key) => {
      params[key] = value.toString()
    })

    const signature = req.headers.get("x-twilio-signature") || ""
    const forwardedProto = req.headers.get("x-forwarded-proto") || "https"
    const forwardedHost = req.headers.get("x-forwarded-host") || req.headers.get("host") || ""
    const pathname = new URL(req.url).pathname
    const publicUrl = `${forwardedProto}://${forwardedHost}${pathname}`

    if (process.env.TWILIO_AUTH_TOKEN && !validateTwilioSignature(publicUrl, params, signature)) {
      console.error("Invalid Twilio signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 })
    }

    const fromNumber = params["From"] || ""
    const toNumber = params["To"] || ""
    const body = params["Body"] || ""
    const messageSid = params["MessageSid"] || ""

    if (!messageSid) {
      return NextResponse.json({ error: "Missing MessageSid" }, { status: 400 })
    }

    await pool.query(
      `INSERT INTO sms_inbound_messages (from_number, to_number, body, message_sid, raw_payload)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (message_sid) DO NOTHING`,
      [fromNumber, toNumber, body, messageSid, JSON.stringify(params)]
    )

    const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`
    return new NextResponse(twiml, {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    })
  } catch (err) {
    console.error("SMS webhook error:", err)
    const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`
    return new NextResponse(twiml, {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    })
  }
}
