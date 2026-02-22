import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    return NextResponse.json({ success: true, message: "Google integration is managed through Replit settings" })
  } catch (error) {
    console.error("Google disconnect error:", error)
    return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 })
  }
}
