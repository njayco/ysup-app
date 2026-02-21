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
    const fileId = searchParams.get("fileId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    if (fileId) {
      const result = await pool.query(
        `SELECT id, name, type, file_data, thumbnail, position_x, position_y, position_rotation, shared_by, course
         FROM user_files WHERE id = $1 AND user_id = $2`,
        [fileId, userId]
      );
      if (result.rows.length === 0) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }
      const row = result.rows[0];
      return NextResponse.json({
        id: row.id.toString(),
        name: row.name,
        type: row.type,
        fileData: row.file_data,
        thumbnail: row.thumbnail || "",
        position: { x: row.position_x, y: row.position_y, rotation: row.position_rotation },
      });
    }

    const result = await pool.query(
      `SELECT id, name, type, thumbnail, position_x, position_y, position_rotation, shared_by, course, created_at
       FROM user_files WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100`,
      [userId]
    );

    const files = result.rows.map((row) => ({
      id: row.id.toString(),
      name: row.name,
      type: row.type,
      thumbnail: row.thumbnail || "",
      position: { x: row.position_x, y: row.position_y, rotation: row.position_rotation },
      sharedBy: row.shared_by,
      course: row.course,
      fromDb: true,
    }));

    return NextResponse.json(files);
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, name, type, fileData, thumbnail, position, sharedBy, course } = body;

    if (!userId || !name) {
      return NextResponse.json({ error: "userId and name required" }, { status: 400 });
    }

    const storageResult = await pool.query(
      `SELECT COALESCE(SUM(LENGTH(file_data)), 0) as total_bytes
       FROM user_files WHERE user_id = $1`,
      [userId]
    );
    const tierResult = await pool.query(
      `SELECT subscription_tier, storage_limit_bytes FROM users WHERE id = $1`,
      [userId]
    );
    const currentUsed = parseInt(storageResult.rows[0]?.total_bytes || "0");
    const limitBytes = parseInt(tierResult.rows[0]?.storage_limit_bytes || "104857600");
    const newFileSize = fileData ? fileData.length : 0;

    if (currentUsed + newFileSize > limitBytes) {
      const tier = tierResult.rows[0]?.subscription_tier || "free";
      return NextResponse.json({
        error: "storage_limit_exceeded",
        tier,
        usedBytes: currentUsed,
        limitBytes,
        message: tier === "free"
          ? "You've reached your 100MB storage limit. Upgrade to YsUp Honors for 10GB of storage and access to YsUp Academy for $5/mo."
          : "You've reached your storage limit.",
      }, { status: 413 });
    }

    const result = await pool.query(
      `INSERT INTO user_files (user_id, name, type, file_data, thumbnail, position_x, position_y, position_rotation, shared_by, course)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
      [
        userId,
        name,
        type || "pdf",
        fileData || null,
        thumbnail || "",
        position?.x || 0,
        position?.y || 0,
        position?.rotation || 0,
        sharedBy || null,
        course || null,
      ]
    );

    return NextResponse.json({ id: result.rows[0].id.toString(), success: true });
  } catch (error) {
    console.error("Error saving file:", error);
    return NextResponse.json({ error: "Failed to save file" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("fileId");
    const userId = searchParams.get("userId");

    if (!fileId || !userId) {
      return NextResponse.json({ error: "fileId and userId required" }, { status: 400 });
    }

    await pool.query(
      `DELETE FROM user_files WHERE id = $1 AND user_id = $2`,
      [fileId, userId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
