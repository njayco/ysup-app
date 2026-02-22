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

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    const result = await pool.query(
      "SELECT ybucks FROM users WHERE id = $1",
      [userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ ybucks: result.rows[0].ybucks || 0 })
  } catch (error) {
    console.error("Error fetching ybucks:", error)
    return NextResponse.json({ error: "Failed to fetch ybucks" }, { status: 500 })
  }
}
