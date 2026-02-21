import { NextResponse } from "next/server"
import pool from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID required" }, { status: 400 })
    }

    const result = await pool.query(
      `SELECT cn.*, 
        (SELECT COUNT(*) FROM network_members WHERE network_id = cn.id) as member_count,
        (cn.moderator_user_id = $1) as is_moderator,
        u.first_name as mod_first_name, u.last_name as mod_last_name
      FROM class_networks cn
      JOIN network_members nm ON nm.network_id = cn.id AND nm.user_id = $1
      JOIN users u ON u.id = cn.moderator_user_id
      ORDER BY cn.updated_at DESC`,
      [parseInt(userId)]
    )

    return NextResponse.json({ success: true, networks: result.rows })
  } catch (error) {
    console.error("Get my networks error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
