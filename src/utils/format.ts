/**
 * format.ts — 格式化工具
 */

/**
 * 将 Blob 转换为 Base64 Data URL
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

/**
 * 将 Base64 Data URL 转换为 Blob
 */
export function base64ToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(',')
  if (!header || !data) throw new Error('Invalid Base64 Data URL')
  const mime = header.match(/:(.*?);/)?.[1] ?? 'application/octet-stream'
  const binary = atob(data)
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return new Blob([bytes], { type: mime })
}

/**
 * 验证是否为合法的 Base64 Data URL
 */
export function isBase64DataUrl(value: string): boolean {
  return /^data:[a-zA-Z0-9+\-.]+;base64,[A-Za-z0-9+/=]+$/.test(value)
}

/**
 * 格式化文件大小（B / KB / MB / GB）
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`
}
