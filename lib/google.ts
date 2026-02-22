import pool from "./db"
import { encryptToken, decryptToken } from "./google-crypto"

const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/documents",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/presentations",
].join(" ")

export function getGoogleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    redirect_uri: process.env.GOOGLE_REDIRECT_URI || "",
    response_type: "code",
    scope: GOOGLE_SCOPES,
    access_type: "offline",
    prompt: "consent",
    state,
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export async function exchangeCodeForTokens(code: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirect_uri: process.env.GOOGLE_REDIRECT_URI || "",
      grant_type: "authorization_code",
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Token exchange failed: ${err}`)
  }
  return res.json()
}

export async function getGoogleAccount(userId: number) {
  const result = await pool.query(
    "SELECT * FROM google_accounts WHERE user_id = $1",
    [userId]
  )
  return result.rows[0] || null
}

export async function storeGoogleTokens(
  userId: number,
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
  scope: string,
  googleUserId?: string
) {
  const tokenExpiry = new Date(Date.now() + expiresIn * 1000)
  const encAccessToken = encryptToken(accessToken)
  const encRefreshToken = encryptToken(refreshToken)

  await pool.query(
    `INSERT INTO google_accounts (user_id, google_user_id, encrypted_access_token, encrypted_refresh_token, token_expiry, scope, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     ON CONFLICT (user_id)
     DO UPDATE SET encrypted_access_token = $3, encrypted_refresh_token = $4, token_expiry = $5, scope = $6, google_user_id = COALESCE($2, google_accounts.google_user_id), updated_at = NOW()`,
    [userId, googleUserId || null, encAccessToken, encRefreshToken, tokenExpiry, scope]
  )
}

export async function getAccessToken(userId: number): Promise<string> {
  const account = await getGoogleAccount(userId)
  if (!account) throw new Error("Google account not connected")

  const now = new Date()
  const expiry = new Date(account.token_expiry)

  if (expiry > new Date(now.getTime() + 60000)) {
    return decryptToken(account.encrypted_access_token)
  }

  const refreshToken = decryptToken(account.encrypted_refresh_token)
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      grant_type: "refresh_token",
    }),
  })

  if (!res.ok) throw new Error("Failed to refresh Google token")

  const data = await res.json()
  const newExpiry = new Date(Date.now() + data.expires_in * 1000)
  const encNewAccess = encryptToken(data.access_token)

  await pool.query(
    "UPDATE google_accounts SET encrypted_access_token = $1, token_expiry = $2, updated_at = NOW() WHERE user_id = $3",
    [encNewAccess, newExpiry, userId]
  )

  return data.access_token
}

export async function googleFetch(userId: number, url: string, init?: RequestInit) {
  const token = await getAccessToken(userId)
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...(init?.headers || {}),
  }
  return fetch(url, { ...init, headers })
}

export async function driveCreateFile(userId: number, type: "pad" | "calc" | "slideshow", title: string) {
  const mimeTypes: Record<string, string> = {
    pad: "application/vnd.google-apps.document",
    calc: "application/vnd.google-apps.spreadsheet",
    slideshow: "application/vnd.google-apps.presentation",
  }

  const res = await googleFetch(userId, "https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    body: JSON.stringify({
      name: title,
      mimeType: mimeTypes[type],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Drive create failed: ${err}`)
  }

  const file = await res.json()

  const urlPrefixes: Record<string, string> = {
    pad: "https://docs.google.com/document/d/",
    calc: "https://docs.google.com/spreadsheets/d/",
    slideshow: "https://docs.google.com/presentation/d/",
  }

  return {
    fileId: file.id,
    url: `${urlPrefixes[type]}${file.id}/edit`,
  }
}

export async function docsBatchUpdate(userId: number, documentId: string, requests: any[]) {
  const res = await googleFetch(userId, `https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: "POST",
    body: JSON.stringify({ requests }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Docs batchUpdate failed: ${err}`)
  }
  return res.json()
}

export async function sheetsUpdateValues(userId: number, spreadsheetId: string, range: string, values: any[][]) {
  const encodedRange = encodeURIComponent(range)
  const res = await googleFetch(
    userId,
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      body: JSON.stringify({ range, values }),
    }
  )
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Sheets update failed: ${err}`)
  }
  return res.json()
}

export async function slidesBatchUpdate(userId: number, presentationId: string, requests: any[]) {
  const res = await googleFetch(userId, `https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`, {
    method: "POST",
    body: JSON.stringify({ requests }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Slides batchUpdate failed: ${err}`)
  }
  return res.json()
}

export async function deleteGoogleAccount(userId: number) {
  await pool.query("DELETE FROM google_accounts WHERE user_id = $1", [userId])
}
