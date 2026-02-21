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

    const storageResult = await pool.query(
      `SELECT COALESCE(SUM(LENGTH(file_data)), 0) as total_bytes
       FROM user_files WHERE user_id = $1`,
      [userId]
    );

    const tierResult = await pool.query(
      `SELECT subscription_tier, storage_limit_bytes FROM users WHERE id = $1`,
      [userId]
    );

    const totalBytes = parseInt(storageResult.rows[0]?.total_bytes || "0");
    const tier = tierResult.rows[0]?.subscription_tier || "free";
    const limitBytes = parseInt(tierResult.rows[0]?.storage_limit_bytes || "104857600");

    return NextResponse.json({
      usedBytes: totalBytes,
      limitBytes,
      tier,
      usedMB: Math.round(totalBytes / 1024 / 1024 * 100) / 100,
      limitMB: Math.round(limitBytes / 1024 / 1024),
    });
  } catch (error) {
    console.error("Error fetching storage info:", error);
    return NextResponse.json({ error: "Failed to fetch storage info" }, { status: 500 });
  }
}
