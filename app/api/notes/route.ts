import { NextResponse } from "next/server";
import { Pool } from "pg";

export const dynamic = 'force-dynamic'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const result = await pool.query(
      `SELECT id, content, position_x, position_y, position_rotation, last_modified
       FROM user_sticky_notes WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100`,
      [userId]
    );

    const notes = result.rows.map((row) => ({
      id: row.id.toString(),
      content: row.content,
      position: { x: row.position_x, y: row.position_y, rotation: row.position_rotation },
      lastModified: row.last_modified ? new Date(row.last_modified).toISOString().slice(0, 16).replace("T", " ") : "",
    }));

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, content, position } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO user_sticky_notes (user_id, content, position_x, position_y, position_rotation, last_modified)
       VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id, last_modified`,
      [
        userId,
        content || "",
        position?.x || 0,
        position?.y || 0,
        position?.rotation || 0,
      ]
    );

    return NextResponse.json({
      id: result.rows[0].id.toString(),
      lastModified: new Date(result.rows[0].last_modified).toISOString().slice(0, 16).replace("T", " "),
      success: true,
    });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { noteId, userId, content, position } = body;

    if (!noteId || !userId) {
      return NextResponse.json({ error: "noteId and userId required" }, { status: 400 });
    }

    if (position) {
      await pool.query(
        `UPDATE user_sticky_notes SET content = $1, position_x = $2, position_y = $3, position_rotation = $4, last_modified = NOW()
         WHERE id = $5 AND user_id = $6`,
        [content || "", position.x || 0, position.y || 0, position.rotation || 0, noteId, userId]
      );
    } else {
      await pool.query(
        `UPDATE user_sticky_notes SET content = $1, last_modified = NOW()
         WHERE id = $2 AND user_id = $3`,
        [content || "", noteId, userId]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get("noteId");
    const userId = searchParams.get("userId");

    if (!noteId || !userId) {
      return NextResponse.json({ error: "noteId and userId required" }, { status: 400 });
    }

    await pool.query(
      `DELETE FROM user_sticky_notes WHERE id = $1 AND user_id = $2`,
      [noteId, userId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
