/**
 * file.ts — 文件操作工具（File System Access API + Tauri 插件双模式）
 *
 * 接受平台 API 对象作为参数，避免直接依赖 Tauri API。
 */

import JSZip from 'jszip'

// ── 类型 ──────────────────────────────────────────────────

export interface FileType {
  description: string
  extensions: string[]
  mimeType: string
}

export interface SaveOptions {
  fileName?: string
  fileType?: FileType
}

export interface ZipEntry {
  name: string
  data: string | ArrayBuffer | Blob
}

/** 平台文件 API 最小接口（与 usePlatform.api 对齐） */
export interface PlatformFileApi {
  showSaveDialog?(opts: {
    defaultPath?: string
    filters?: { name: string; extensions: string[] }[]
  }): Promise<{ canceled: boolean; filePath?: string }>
  saveFile?(filePath: string, data: Uint8Array): Promise<void>
}

// ── 预定义文件类型 ─────────────────────────────────────────

export const FILE_TYPES = {
  TEXT: {
    description: 'Text File',
    extensions: ['.txt'],
    mimeType: 'text/plain'
  },
  JSON: {
    description: 'JSON File',
    extensions: ['.json'],
    mimeType: 'application/json'
  },
  CSV: { description: 'CSV File', extensions: ['.csv'], mimeType: 'text/csv' },
  ZIP: {
    description: 'ZIP File',
    extensions: ['.zip'],
    mimeType: 'application/zip'
  }
} as const satisfies Record<string, FileType>

// ── 内部工具 ──────────────────────────────────────────────

function toBlob(data: string | ArrayBuffer | Blob, mimeType: string): Blob {
  if (data instanceof Blob) return data
  return new Blob([data], { type: mimeType })
}

function downloadBlob(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob)
  const a = Object.assign(document.createElement('a'), {
    href: url,
    download: name
  })
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

// ── 文件保存 ──────────────────────────────────────────────

/**
 * 保存文件。
 * - Tauri：原生保存对话框
 * - Web：File System Access API，降级到 <a> 下载
 * - 用户取消时抛出 AbortError
 */
export async function saveFile(
  data: string | ArrayBuffer | Blob,
  opts: SaveOptions = {},
  api?: PlatformFileApi
): Promise<void> {
  const { fileName = 'download', fileType } = opts
  const mimeType = fileType?.mimeType ?? 'application/octet-stream'
  const blob = toBlob(data, mimeType)

  // Tauri
  if (api?.showSaveDialog) {
    const filters = fileType
      ? [
          {
            name: fileType.description,
            extensions: fileType.extensions.map((e) => e.replace(/^\./, ''))
          }
        ]
      : [{ name: 'All Files', extensions: ['*'] }]
    const result = await api.showSaveDialog({ defaultPath: fileName, filters })
    if (result.canceled || !result.filePath)
      throw Object.assign(new Error('canceled'), { name: 'AbortError' })
    await api.saveFile?.(result.filePath, new Uint8Array(await blob.arrayBuffer()))
    return
  }

  // Web — File System Access API
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await (
        window as Window & {
          showSaveFilePicker: (opts?: unknown) => Promise<FileSystemFileHandle>
        }
      ).showSaveFilePicker({
        suggestedName: fileName,
        types: fileType
          ? [
              {
                description: fileType.description,
                accept: { [mimeType]: fileType.extensions }
              }
            ]
          : undefined
      })
      const writable = await handle.createWritable()
      await writable.write(blob)
      await writable.close()
      return
    } catch (e: unknown) {
      if ((e as { name?: string })?.name === 'AbortError') throw e
      throw e
    }
  }

  downloadBlob(blob, fileName)
}

// ── 文件打开（Web 环境） ──────────────────────────────────

/** 打开文件对话框，返回选择的 File（multiple=true 时返回数组） */
export function openFile(
  opts: { multiple?: boolean; accept?: string } = {}
): Promise<File | File[] | null> {
  return new Promise((resolve) => {
    const input = Object.assign(document.createElement('input'), {
      type: 'file',
      multiple: opts.multiple ?? false,
      accept: opts.accept ?? ''
    })
    let settled = false
    input.onchange = () => {
      settled = true
      const files = Array.from(input.files ?? [])
      resolve(opts.multiple ? files : (files[0] ?? null))
    }
    function onFocus() {
      window.removeEventListener('focus', onFocus)
      setTimeout(() => {
        if (!settled) resolve(null)
      }, 300)
    }
    window.addEventListener('focus', onFocus)
    input.click()
  })
}

/** 读取 File 为 UTF-8 文本 */
export async function readText(file: File): Promise<string> {
  return new TextDecoder().decode(await file.arrayBuffer())
}

// ── ZIP ───────────────────────────────────────────────────

/** 将多个文件打包为 ZIP 并触发保存 */
export async function saveZip(
  entries: ZipEntry[],
  fileName = 'archive.zip',
  api?: PlatformFileApi
): Promise<void> {
  const zip = new JSZip()
  for (const entry of entries) zip.file(entry.name, entry.data)
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  })
  await saveFile(blob, { fileName, fileType: FILE_TYPES.ZIP }, api)
}
