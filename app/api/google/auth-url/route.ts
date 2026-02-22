import { NextResponse } from "next/server"
import crypto from "crypto"
import pool from "@/lib/db"
import { getGoogleAuthUrl } from "@/lib/google"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    const nonce = crypto.randomBytes(32).toString("hex")
    const state = nonce + ":" + userId

    await pool.query(
      "INSERT INTO oauth_states (state, user_id) VALUES ($1, $2)",
      [state, parseInt(userId)]
    )

    const url = getGoogleAuthUrl(state)

    return NextResponse.json({ url })
  } catch (error) {
    console.error("Google auth URL error:", error)
    return NextResponse.json({ error: "Failed to generate auth URL" }, { status: 500 })
  }
}
