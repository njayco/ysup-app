import { NextResponse } from "next/server"
import { Pool } from "pg"

export const dynamic = 'force-dynamic'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    const networkResult = await pool.query(
      `SELECT cn.id FROM class_networks cn
       JOIN network_members nm ON nm.network_id = cn.id
       WHERE cn.slug = $1 AND nm.user_id = $2`,
      [params.slug, userId]
    )

    if (networkResult.rows.length === 0) {
      return NextResponse.json({ error: "Not a member of this network" }, { status: 403 })
    }

    const networkId = networkResult.rows[0].id

    const files = await pool.query(
      `SELECT nsf.id, nsf.file_name, nsf.file_type, nsf.file_size, nsf.created_at,
              u.username as uploader_username, u.first_name as uploader_first_name, u.last_name as uploader_last_name
       FROM network_shared_files nsf
       JOIN users u ON u.id = nsf.uploader_id
       WHERE nsf.network_id = $1
       ORDER BY nsf.created_at DESC`,
      [networkId]
    )

    return NextResponse.json({ files: files.rows })
  } catch (error) {
    console.error("Error fetching network files:", error)
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  try {
    const body = await request.json()
    const { userId, fileName, fileType, fileSize, fileData } = body

    if (!userId || !fileName || !fileData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const networkResult = await pool.query(
      `SELECT cn.id FROM class_networks cn
       JOIN network_members nm ON nm.network_id = cn.id
       WHERE cn.slug = $1 AND nm.user_id = $2`,
      [params.slug, userId]
    )

    if (networkResult.rows.length === 0) {
      return NextResponse.json({ error: "Not a member of this network" }, { status: 403 })
    }

    const networkId = networkResult.rows[0].id

    const result = await pool.query(
      `INSERT INTO network_shared_files (network_id, uploader_id, file_name, file_type, file_size, file_data)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, created_at`,
      [networkId, userId, fileName, fileType || null, fileSize || null, fileData]
    )

    const uploader = await pool.query(
      `SELECT username, first_name, last_name FROM users WHERE id = $1`,
      [userId]
    )

    return NextResponse.json({
      id: result.rows[0].id,
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize,
      created_at: result.rows[0].created_at,
      uploader_username: uploader.rows[0].username,
      uploader_first_name: uploader.rows[0].first_name,
      uploader_last_name: uploader.rows[0].last_name,
    })
  } catch (error) {
    console.error("Error sharing file:", error)
    return NextResponse.json({ error: "Failed to share file" }, { status: 500 })
  }
}
