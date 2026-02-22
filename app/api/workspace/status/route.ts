import { NextResponse } from "next/server"
import { isGoogleConnected } from "@/lib/google"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const connected = await isGoogleConnected()
    return NextResponse.json({ connected })
  } catch (error) {
    console.error("Workspace status error:", error)
    return NextResponse.json({ connected: false })
  }
}
