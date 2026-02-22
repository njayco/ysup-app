import crypto from "crypto"

const ALGORITHM = "aes-256-gcm"

function getEncryptionKey(): Buffer {
  const key = process.env.TOKEN_ENCRYPTION_KEY
  if (!key) throw new Error("TOKEN_ENCRYPTION_KEY environment variable is required")
  return Buffer.from(key, "base64")
}

export function encryptToken(plaintext: string): string {
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(plaintext, "utf8", "base64")
  encrypted += cipher.final("base64")
  const authTag = cipher.getAuthTag()
  return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted}`
}

export function decryptToken(ciphertext: string): string {
  const key = getEncryptionKey()
  const parts = ciphertext.split(":")
  if (parts.length !== 3) throw new Error("Invalid encrypted token format")
  const iv = Buffer.from(parts[0], "base64")
  const authTag = Buffer.from(parts[1], "base64")
  const encrypted = parts[2]
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  let decrypted = decipher.update(encrypted, "base64", "utf8")
  decrypted += decipher.final("utf8")
  return decrypted
}
