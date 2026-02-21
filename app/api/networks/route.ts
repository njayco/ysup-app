import { NextResponse } from "next/server"
import pool from "@/lib/db"

export const dynamic = "force-dynamic"

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

async function generateUniqueSlug(name: string): Promise<string> {
  const base = slugify(name)
  let slug = base
  let counter = 2
  while (true) {
    const existing = await pool.query("SELECT id FROM class_networks WHERE slug = $1", [slug])
    if (existing.rows.length === 0) break
    slug = `${base}-${counter}`
    counter++
  }
  return slug
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, type, privacy, userId } = body

    if (!name || !description || !type || !privacy || !userId) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 })
    }

    if (!["club", "organization", "class"].includes(type)) {
      return NextResponse.json({ success: false, message: "Invalid type" }, { status: 400 })
    }

    if (!["public", "private"].includes(privacy)) {
      return NextResponse.json({ success: false, message: "Invalid privacy setting" }, { status: 400 })
    }

    const slug = await generateUniqueSlug(name)
    const parsedUserId = parseInt(userId)

    const result = await pool.query(
      `INSERT INTO class_networks (name, slug, description, type, privacy, moderator_user_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name.trim(), slug, description.trim(), type, privacy, parsedUserId]
    )

    const network = result.rows[0]

    await pool.query(
      "INSERT INTO network_members (network_id, user_id) VALUES ($1, $2)",
      [network.id, parsedUserId]
    )

    return NextResponse.json({
      success: true,
      network,
      inviteLink: `/invite/network/${slug}`,
    }, { status: 201 })
  } catch (error: unknown) {
    console.error("Create network error:", error)
    const pgError = error as { code?: string }
    if (pgError.code === "23505") {
      return NextResponse.json({ success: false, message: "A network with that name already exists" }, { status: 400 })
    }
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
