import { NextResponse } from "next/server";
import { Pool } from "pg";

export const dynamic = 'force-dynamic'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    const searchPattern = `%${query}%`;

    const result = await pool.query(
      `SELECT id, username, first_name, last_name, college
       FROM users
       WHERE username ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1
       LIMIT 20`,
      [searchPattern]
    );

    const users = result.rows.map((row) => ({
      id: row.id,
      username: row.username,
      firstName: row.first_name,
      lastName: row.last_name,
      college: row.college,
    }));

    return NextResponse.json(users);
  } catch (error) {
    console.error("Search users error:", error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
}
