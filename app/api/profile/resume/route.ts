import { NextResponse } from "next/server"
import pool from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, type, title, org, startDate, endDate, isCurrent, description, url, sortOrder } = body

    if (!userId || !type) {
      return NextResponse.json({ error: "userId and type required" }, { status: 400 })
    }

    const result = await pool.query(
      `INSERT INTO profile_resume_sections (user_id, type, title, org, start_date, end_date, is_current, description, url, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [userId, type, title || "", org || "", startDate || "", endDate || "", isCurrent || false, description || "", url || "", sortOrder || 0]
    )

    return NextResponse.json({ success: true, id: result.rows[0].id })
  } catch (error) {
    console.error("Resume section create error:", error)
    return NextResponse.json({ error: "Failed to create section" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, userId, type, title, org, startDate, endDate, isCurrent, description, url, sortOrder } = body

    if (!id || !userId) {
      return NextResponse.json({ error: "id and userId required" }, { status: 400 })
    }

    await pool.query(
      `UPDATE profile_resume_sections SET type=$1, title=$2, org=$3, start_date=$4, end_date=$5, is_current=$6, description=$7, url=$8, sort_order=$9, updated_at=NOW()
       WHERE id=$10 AND user_id=$11`,
      [type, title || "", org || "", startDate || "", endDate || "", isCurrent || false, description || "", url || "", sortOrder || 0, id, userId]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Resume section update error:", error)
    return NextResponse.json({ error: "Failed to update section" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const userId = searchParams.get("userId")

    if (!id || !userId) {
      return NextResponse.json({ error: "id and userId required" }, { status: 400 })
    }

    await pool.query(`DELETE FROM profile_resume_sections WHERE id=$1 AND user_id=$2`, [id, userId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Resume section delete error:", error)
    return NextResponse.json({ error: "Failed to delete section" }, { status: 500 })
  }
}
