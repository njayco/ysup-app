import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId")
  const networkId = req.nextUrl.searchParams.get("networkId")

  if (!userId) {
    return NextResponse.json({ success: false, message: "userId required" }, { status: 400 })
  }

  try {
    if (networkId) {
      const result = await pool.query(
        `SELECT u.id, u.first_name, u.last_name, u.username
         FROM network_members nm
         JOIN users u ON u.id = nm.user_id
         WHERE nm.network_id = $1 AND nm.user_id != $2
         ORDER BY u.first_name, u.last_name`,
        [networkId, userId]
      )
      return NextResponse.json({ success: true, members: result.rows })
    }

    const result = await pool.query(
      `SELECT cn.id, cn.name, cn.slug, cn.type,
              (SELECT COUNT(*) FROM network_members WHERE network_id = cn.id) AS member_count
       FROM network_members nm
       JOIN class_networks cn ON cn.id = nm.network_id
       WHERE nm.user_id = $1
       ORDER BY cn.name`,
      [userId]
    )
    return NextResponse.json({ success: true, networks: result.rows })
  } catch (err) {
    console.error("Fetch network members error:", err)
    return NextResponse.json({ success: false, message: "Failed to fetch data" }, { status: 500 })
  }
}
