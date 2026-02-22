import { NextResponse } from "next/server"
import { getGoogleAccount } from "@/lib/google"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    const account = await getGoogleAccount(parseInt(userId))
    if (!account) {
      return NextResponse.json({ connected: false })
    }

    return NextResponse.json({
      connected: true,
      scope: account.scope,
      tokenExpiry: account.token_expiry,
      googleUserId: account.google_user_id,
    })
  } catch (error) {
    console.error("Workspace status error:", error)
    return NextResponse.json({ error: "Failed to check status" }, { status: 500 })
  }
}
