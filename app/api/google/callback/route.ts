import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { exchangeCodeForTokens, storeGoogleTokens } from "@/lib/google"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    if (error) {
      return NextResponse.redirect(new URL("/dashboard?google_error=" + error, request.url))
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL("/dashboard?google_error=missing_params", request.url))
    }

    const stateCheck = await pool.query(
      "DELETE FROM oauth_states WHERE state = $1 AND expires_at > NOW() RETURNING user_id",
      [state]
    )

    if (stateCheck.rows.length === 0) {
      return NextResponse.redirect(new URL("/dashboard?google_error=invalid_state", request.url))
    }

    const userId = stateCheck.rows[0].user_id

    const tokens = await exchangeCodeForTokens(code)

    let googleUserId: string | undefined
    try {
      const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      })
      if (userInfoRes.ok) {
        const userInfo = await userInfoRes.json()
        googleUserId = userInfo.id
      }
    } catch {}

    await storeGoogleTokens(
      userId,
      tokens.access_token,
      tokens.refresh_token,
      tokens.expires_in,
      tokens.scope || "",
      googleUserId
    )

    await pool.query("DELETE FROM oauth_states WHERE user_id = $1", [userId])

    return NextResponse.redirect(new URL("/dashboard?google_connected=1", request.url))
  } catch (error) {
    console.error("Google callback error:", error)
    return NextResponse.redirect(new URL("/dashboard?google_error=token_exchange_failed", request.url))
  }
}
