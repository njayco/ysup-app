import pool from "./db"

async function getReplitConnectorToken(connectorName: string): Promise<string> {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? "depl " + process.env.WEB_REPL_RENEWAL
    : null

  if (!xReplitToken || !hostname) {
    throw new Error("Replit connector environment not available")
  }

  const res = await fetch(
    `https://${hostname}/api/v2/connection?include_secrets=true&connector_names=${connectorName}`,
    {
      headers: {
        Accept: "application/json",
        X_REPLIT_TOKEN: xReplitToken,
      },
    }
  )

  if (!res.ok) {
    throw new Error(`Failed to get ${connectorName} connection: ${res.status}`)
  }

  const data = await res.json()
  const connection = data.items?.[0]
  const accessToken =
    connection?.settings?.access_token ||
    connection?.settings?.oauth?.credentials?.access_token

  if (!accessToken) {
    throw new Error(`${connectorName} not connected`)
  }

  return accessToken
}

export async function getDocsAccessToken(): Promise<string> {
  return getReplitConnectorToken("google-docs")
}

export async function getSheetsAccessToken(): Promise<string> {
  return getReplitConnectorToken("google-sheet")
}

export async function getDriveAccessToken(): Promise<string> {
  return getReplitConnectorToken("google-drive")
}

export async function isGoogleConnected(): Promise<boolean> {
  try {
    await getDriveAccessToken()
    return true
  } catch {
    return false
  }
}

export async function googleFetch(url: string, init?: RequestInit, connectorName?: string) {
  const tokenFn = connectorName === "google-docs"
    ? getDocsAccessToken
    : connectorName === "google-sheet"
    ? getSheetsAccessToken
    : getDriveAccessToken

  const token = await tokenFn()
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...(init?.headers || {}),
  }
  return fetch(url, { ...init, headers })
}

export async function driveCreateFile(type: "pad" | "calc" | "slideshow", title: string) {
  const mimeTypes: Record<string, string> = {
    pad: "application/vnd.google-apps.document",
    calc: "application/vnd.google-apps.spreadsheet",
    slideshow: "application/vnd.google-apps.presentation",
  }

  const token = await getDriveAccessToken()
  const res = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
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

  try {
    await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}/permissions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: "reader",
        type: "anyone",
      }),
    })
  } catch (e) {
    console.error("Failed to set sharing permissions:", e)
  }

  const urlPrefixes: Record<string, string> = {
    pad: "https://docs.google.com/document/d/",
    calc: "https://docs.google.com/spreadsheets/d/",
    slideshow: "https://docs.google.com/presentation/d/",
  }

  const previewSuffixes: Record<string, string> = {
    pad: "/preview",
    calc: "/preview",
    slideshow: "/embed?start=false&loop=false",
  }

  return {
    fileId: file.id,
    url: `${urlPrefixes[type]}${file.id}/edit`,
    previewUrl: `${urlPrefixes[type]}${file.id}${previewSuffixes[type]}`,
  }
}

export async function docsBatchUpdate(documentId: string, requests: any[]) {
  const token = await getDocsAccessToken()
  const res = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ requests }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Docs batchUpdate failed: ${err}`)
  }
  return res.json()
}

export async function sheetsUpdateValues(spreadsheetId: string, range: string, values: any[][]) {
  const token = await getSheetsAccessToken()
  const encodedRange = encodeURIComponent(range)
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ range, values }),
    }
  )
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Sheets update failed: ${err}`)
  }
  return res.json()
}

export async function slidesBatchUpdate(presentationId: string, requests: any[]) {
  const token = await getDriveAccessToken()
  const res = await fetch(`https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ requests }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Slides batchUpdate failed: ${err}`)
  }
  return res.json()
}

export async function getAccessToken(): Promise<string> {
  return getDriveAccessToken()
}

export async function createMeetSpace(): Promise<{ spaceName: string; meetingUri: string; meetingCode: string }> {
  const token = await getDriveAccessToken()
  const res = await fetch("https://meet.googleapis.com/v2/spaces", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Meet space creation failed: ${err}`)
  }

  const data = await res.json()
  return {
    spaceName: data.name || "",
    meetingUri: data.meetingUri || "",
    meetingCode: data.meetingCode || "",
  }
}

export async function getMeetSpace(spaceName: string): Promise<any> {
  const token = await getDriveAccessToken()
  const res = await fetch(`https://meet.googleapis.com/v2/${spaceName}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Meet space fetch failed: ${err}`)
  }

  return res.json()
}

export async function endMeetSpace(spaceName: string): Promise<void> {
  const token = await getDriveAccessToken()
  await fetch(`https://meet.googleapis.com/v2/${spaceName}:endActiveConference`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  })
}
