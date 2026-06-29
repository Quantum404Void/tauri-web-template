/**
 * crypto.ts — AES-256-CBC 加密工具（Web Crypto API 原生实现）
 *
 * 格式：<salt_b64>:<iv_b64>:<ciphertext_b64>
 * 派生：PBKDF2 / SHA-256 / 100_000 iterations
 */

const ALGO = 'AES-CBC'
const HASH = 'SHA-256'
const ITERATIONS = 100_000
const KEY_BITS = 256
const SALT_BYTES = 32
const IV_BYTES = 16

// ── 内部工具 ──────────────────────────────────────────────

function toBase64(buf: ArrayBuffer): string {
  let binary = ''
  const bytes = new Uint8Array(buf)
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

function fromBase64(b64: string): ArrayBuffer {
  const s = atob(b64)
  const buf = new Uint8Array(s.length)
  for (let i = 0; i < s.length; i++) buf[i] = s.charCodeAt(i)
  return buf.buffer
}

function encode(s: string): ArrayBuffer {
  return new TextEncoder().encode(s).buffer as ArrayBuffer
}

function decode(buf: ArrayBuffer): string {
  return new TextDecoder().decode(buf)
}

async function deriveKey(password: string, salt: ArrayBuffer): Promise<CryptoKey> {
  const raw = await crypto.subtle.importKey('raw', encode(password), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: HASH },
    raw,
    { name: ALGO, length: KEY_BITS },
    false,
    ['encrypt', 'decrypt']
  )
}

// ── 公开 API ──────────────────────────────────────────────

/**
 * 加密字符串，返回 `salt:iv:ciphertext`（均为 Base64）
 */
export async function encrypt(plaintext: string, password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES)).buffer
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES)).buffer
  const key = await deriveKey(password, salt)
  const cipher = await crypto.subtle.encrypt({ name: ALGO, iv }, key, encode(plaintext))
  return `${toBase64(salt)}:${toBase64(iv)}:${toBase64(cipher)}`
}

/**
 * 解密 `salt:iv:ciphertext` 字符串，返回明文
 */
export async function decrypt(ciphertext: string, password: string): Promise<string> {
  const parts = ciphertext.split(':')
  if (parts.length !== 3) throw new Error('Invalid ciphertext format')
  const [saltB64, ivB64, ctB64] = parts
  const salt = fromBase64(saltB64)
  const iv = fromBase64(ivB64)
  const ct = fromBase64(ctB64)
  const key = await deriveKey(password, salt)
  const plain = await crypto.subtle.decrypt({ name: ALGO, iv }, key, ct)
  return decode(plain)
}

// ── 密码强度 ──────────────────────────────────────────────

export interface PasswordStrength {
  score: number
  strength: 'weak' | 'medium' | 'strong'
}

export function checkPasswordStrength(password: string): PasswordStrength {
  if (password.length < 8) return { score: 0, strength: 'weak' }
  let score = 0
  if (password.length >= 8) score += 25
  if (password.length >= 12) score += 15
  if (/[a-z]/.test(password)) score += 10
  if (/[A-Z]/.test(password)) score += 15
  if (/\d/.test(password)) score += 15
  if (/[^a-zA-Z0-9]/.test(password)) score += 20
  const strength = score >= 75 ? 'strong' : score >= 45 ? 'medium' : 'weak'
  return { score, strength }
}
