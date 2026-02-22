import { NextResponse } from "next/server"
import { deleteGoogleAccount } from "@/lib/google"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const userId = body.userId
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    await deleteGoogleAccount(userId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Google disconnect error:", error)
    return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 })
  }
}
