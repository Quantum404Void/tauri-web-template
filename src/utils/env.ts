/**
 * env.ts — 平台环境检测（轻量同步工具函数）
 *
 * 复杂平台逻辑请使用 @/composables/usePlatform
 */

/** 检测是否运行在 Tauri 桌面环境中 */
export function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

/** 获取 Tauri 版本号，非 Tauri 环境返回空字符串 */
export function getTauriVersion(): string {
  if (!isTauri()) return ''
  // Tauri 2 通过 internal payload 暴露版本
  const internal = (window as unknown as { __TAURI_INTERNALS__?: { version?: string } })
    .__TAURI_INTERNALS__
  return internal?.version ?? '2'
}
