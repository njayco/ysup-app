import { NextResponse } from "next/server"
import pool from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    const result = await pool.query(
      `SELECT cn.id, cn.name, cn.slug, cn.type, cn.privacy, cn.logo_url,
              (SELECT COUNT(*) FROM network_members WHERE network_id = cn.id) as member_count
       FROM class_networks cn
       INNER JOIN network_members nm ON nm.network_id = cn.id
       WHERE nm.user_id = $1 AND cn.privacy = 'public'
       ORDER BY cn.name ASC`,
      [parseInt(userId)]
    )

    return NextResponse.json({ success: true, networks: result.rows })
  } catch (error) {
    console.error("Profile networks error:", error)
    return NextResponse.json({ error: "Failed to get networks" }, { status: 500 })
  }
}
