import { NextResponse } from "next/server"
import { Pool } from "pg"

export const dynamic = 'force-dynamic'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const fileId = searchParams.get("fileId")

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    if (fileId) {
      const result = await pool.query(
        `SELECT nsf.file_data, nsf.file_name, nsf.file_type
         FROM network_shared_files nsf
         JOIN network_members nm ON nm.network_id = nsf.network_id AND nm.user_id = $1
         WHERE nsf.id = $2`,
        [userId, fileId]
      )
      if (result.rows.length === 0) {
        return NextResponse.json({ error: "File not found" }, { status: 404 })
      }
      return NextResponse.json(result.rows[0])
    }

    const files = await pool.query(
      `SELECT nsf.id, nsf.file_name, nsf.file_type, nsf.file_size, nsf.created_at,
              u.username as uploader_username,
              cn.name as network_name, cn.slug as network_slug
       FROM network_shared_files nsf
       JOIN users u ON u.id = nsf.uploader_id
       JOIN class_networks cn ON cn.id = nsf.network_id
       JOIN network_members nm ON nm.network_id = nsf.network_id AND nm.user_id = $1
       ORDER BY nsf.created_at DESC
       LIMIT 50`,
      [userId]
    )

    return NextResponse.json({ files: files.rows })
  } catch (error) {
    console.error("Error fetching shared files:", error)
    return NextResponse.json({ error: "Failed to fetch shared files" }, { status: 500 })
  }
}
