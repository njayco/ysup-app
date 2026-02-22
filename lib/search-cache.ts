import pool from "./db"

const CACHE_DURATION_HOURS = 24

export async function getCachedResults(query: string, source: string): Promise<any[] | null> {
  try {
    const result = await pool.query(
      `SELECT results FROM search_cache 
       WHERE query = $1 AND source = $2 
       AND created_at > NOW() - INTERVAL '${CACHE_DURATION_HOURS} hours'`,
      [query.trim().toLowerCase(), source]
    )
    if (result.rows.length > 0) {
      return result.rows[0].results
    }
    return null
  } catch (error) {
    console.error(`Cache read error (${source}):`, error)
    return null
  }
}

export async function setCachedResults(query: string, source: string, results: any[]): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO search_cache (query, source, results, created_at) 
       VALUES ($1, $2, $3, NOW()) 
       ON CONFLICT (query, source) 
       DO UPDATE SET results = $3, created_at = NOW()`,
      [query.trim().toLowerCase(), source, JSON.stringify(results)]
    )
  } catch (error) {
    console.error(`Cache write error (${source}):`, error)
  }
}
