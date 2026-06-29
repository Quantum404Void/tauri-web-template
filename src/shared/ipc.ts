/**
 * shared/ipc.ts — IPC 类型契约（前端 + Rust 后端共享类型）
 *
 * Tauri 2 使用 invoke + event，通道名为字符串。
 * 类型集中定义在这里，保证前后端一致性。
 */

// ── 参数/返回类型 ─────────────────────────────────────────

export interface AutoLaunchResult {
  success: boolean
  changed: boolean
}

export interface SetCloseTrayResult {
  success: boolean
  closeToTray: boolean
}

export type AppTheme = 'dark' | 'light' | 'system'

export interface UpdateInfo {
  version: string
  [key: string]: unknown
}

export interface DownloadProgress {
  percent: number
  bytesPerSecond: number
  total: number
  transferred: number
}

// ── Rust command 名称（与 src-tauri/src/commands.rs 对齐） ──────────

export const COMMANDS = {
  GET_NATIVE_THEME: 'get_native_theme',
  SET_THEME: 'set_theme',
  SET_LOCALE: 'set_locale',
  GET_AUTO_LAUNCH: 'get_auto_launch_status',
  SET_AUTO_LAUNCH: 'set_auto_launch',
  GET_CLOSE_TRAY: 'get_close_to_tray',
  SET_CLOSE_TRAY: 'set_close_to_tray',
  GET_VERSION: 'get_app_version'
} as const

// ── Rust event 名称（与 src-tauri/src/events.rs 对齐） ──────────

export const EVENTS = {
  NATIVE_THEME_CHANGED: 'native-theme-changed',
  UPDATE_AVAILABLE: 'update-available',
  UPDATE_NOT_AVAILABLE: 'update-not-available',
  UPDATE_ERROR: 'update-error',
  DOWNLOAD_PROGRESS: 'download-progress',
  UPDATE_DOWNLOADED: 'update-downloaded'
} as const
