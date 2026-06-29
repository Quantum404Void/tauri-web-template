/**
 * PWA Service Worker 注册（仅 Web 环境）
 * Tauri 环境下跳过（无 Service Worker 支持）
 */
export async function setupPWA(): Promise<void> {
  if (typeof navigator !== 'undefined' && '__TAURI_INTERNALS__' in navigator) return

  try {
    const { useRegisterSW } = await import('virtual:pwa-register/vue')
    useRegisterSW({
      immediate: true,
      onRegisterError(error: unknown) {
        if (import.meta.env.DEV) console.error('Service Worker 注册失败:', error)
      }
    })
  } catch {
    // vite-plugin-pwa 未配置时静默跳过
  }
}
