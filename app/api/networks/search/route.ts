import { NextResponse } from "next/server"
import pool from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")

    if (!query || query.trim().length < 1) {
      return NextResponse.json({ success: true, networks: [] })
    }

    const result = await pool.query(
      `SELECT cn.*, 
        (SELECT COUNT(*) FROM network_members WHERE network_id = cn.id) as member_count,
        u.first_name as mod_first_name, u.last_name as mod_last_name
      FROM class_networks cn
      JOIN users u ON u.id = cn.moderator_user_id
      WHERE cn.name ILIKE $1
      ORDER BY cn.name
      LIMIT 20`,
      [`%${query.trim()}%`]
    )

    return NextResponse.json({ success: true, networks: result.rows })
  } catch (error) {
    console.error("Search networks error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
