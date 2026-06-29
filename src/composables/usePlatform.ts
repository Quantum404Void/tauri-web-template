/**
 * usePlatform.ts — 平台抽象层
 *
 * 统一 Tauri / Web 差异，视图层无需散落 isTauri() 判断。
 * 返回的 API 在 Web 环境下自动降级为 no-op 或模拟实现。
 */

import { getTauriVersion, isTauri } from '@/utils/env'
import { readonly, ref, shallowRef } from 'vue'

import type {
  AppTheme,
  AutoLaunchResult,
  DownloadProgress,
  SetCloseTrayResult,
  UpdateInfo
} from '@shared/ipc'
import type { Update as TauriUpdate } from '@tauri-apps/plugin-updater'

// Tauri API 动态导入（Web 构建时不会执行）
async function tauriInvoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  const { invoke } = await import('@tauri-apps/api/core')
  return invoke<T>(cmd, args)
}

export function usePlatform() {
  const platform: 'tauri' | 'web' = isTauri() ? 'tauri' : 'web'
  const tauriVersion = shallowRef(getTauriVersion())
  const nativeDark = ref(false)

  // ── 主题同步 ──────────────────────────────────────────

  let _unsubTheme: (() => void) | undefined

  async function startThemeSync(onChange: (dark: boolean) => void) {
    if (platform === 'tauri') {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window')
        const win = getCurrentWindow()
        const initial = await win.theme()
        nativeDark.value = initial === 'dark'
        onChange(nativeDark.value)
        const unlisten = await win.onThemeChanged((e) => {
          nativeDark.value = e.payload === 'dark'
          onChange(nativeDark.value)
        })
        _unsubTheme = unlisten
      } catch {
        // window API 不可用时降级
      }
    } else {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      nativeDark.value = mq.matches
      onChange(mq.matches)
      const handler = (e: MediaQueryListEvent) => {
        nativeDark.value = e.matches
        onChange(e.matches)
      }
      mq.addEventListener('change', handler)
      _unsubTheme = () => mq.removeEventListener('change', handler)
    }
  }

  function stopThemeSync() {
    _unsubTheme?.()
  }

  // ── Tauri-only API（Web 环境为 no-op） ────────────

  // 缓存 check() 返回的 Update 对象，避免 downloadUpdate 重复请求
  let _pendingUpdate: TauriUpdate | null = null

  const api = {
    /** 设置原生主题源 */
    async setTheme(theme: AppTheme) {
      if (platform !== 'tauri') return
      try {
        await tauriInvoke('set_theme', { theme })
      } catch {
        /* ignore */
      }
    },

    /** 设置后端语言（用于托盘菜单等） */
    async setLocale(locale: string) {
      if (platform !== 'tauri') return
      try {
        await tauriInvoke('set_locale', { locale })
      } catch {
        /* ignore */
      }
    },

    /** 获取完整版本号 */
    async getAppVersion(): Promise<string> {
      if (platform !== 'tauri') return __APP_VERSION__
      try {
        const { getVersion } = await import('@tauri-apps/api/app')
        return await getVersion()
      } catch {
        return __APP_VERSION__
      }
    },

    /** 文件对话框：保存（Tauri 返回路径字符串 | null，统一为标准结构） */
    async showSaveDialog(opts: {
      defaultPath?: string
      filters?: { name: string; extensions: string[] }[]
    }): Promise<{ canceled: boolean; filePath?: string }> {
      if (platform !== 'tauri') return { canceled: true }
      try {
        const { save } = await import('@tauri-apps/plugin-dialog')
        const filePath = await save({
          defaultPath: opts.defaultPath,
          filters: opts.filters
        })
        return { canceled: !filePath, filePath: filePath ?? undefined }
      } catch {
        return { canceled: true }
      }
    },

    /** 文件对话框：打开（Tauri 返回路径字符串 | 数组 | null） */
    async openFileDialog(opts: {
      multiple?: boolean
      filters?: { name: string; extensions: string[] }[]
    }): Promise<{ canceled: boolean; filePaths: string[] }> {
      if (platform !== 'tauri') return { canceled: true, filePaths: [] }
      try {
        const { open } = await import('@tauri-apps/plugin-dialog')
        const result = await open({
          multiple: opts.multiple ?? false,
          filters: opts.filters,
          directory: false
        })
        if (result === null) return { canceled: true, filePaths: [] }
        const filePaths = Array.isArray(result) ? result : [result]
        return { canceled: false, filePaths }
      } catch {
        return { canceled: true, filePaths: [] }
      }
    },

    /** 读文件为 Uint8Array */
    async readFileBytes(filePath: string): Promise<Uint8Array> {
      if (platform !== 'tauri') return new Uint8Array()
      const { readFile } = await import('@tauri-apps/plugin-fs')
      return await readFile(filePath)
    },

    /** 写文件到磁盘 */
    async saveFile(filePath: string, data: Uint8Array): Promise<void> {
      if (platform !== 'tauri') return
      const { writeFile } = await import('@tauri-apps/plugin-fs')
      await writeFile(filePath, data)
    },

    /** 自启动 */
    async getAutoLaunchStatus(): Promise<boolean> {
      if (platform !== 'tauri') return false
      try {
        const { isEnabled } = await import('@tauri-apps/plugin-autostart')
        return await isEnabled()
      } catch {
        return false
      }
    },

    async setAutoLaunch(enable: boolean): Promise<AutoLaunchResult> {
      if (platform !== 'tauri') return { success: false, changed: false }
      try {
        const mod = await import('@tauri-apps/plugin-autostart')
        const current = await mod.isEnabled()
        if (current === enable) return { success: true, changed: false }
        if (enable) await mod.enable()
        else await mod.disable()
        return { success: true, changed: true }
      } catch {
        return { success: false, changed: false }
      }
    },

    /** 托盘行为 */
    async getCloseToTray(): Promise<boolean> {
      if (platform !== 'tauri') return false
      try {
        return await tauriInvoke<boolean>('get_close_to_tray')
      } catch {
        return false
      }
    },

    async setCloseToTray(enable: boolean): Promise<SetCloseTrayResult> {
      if (platform !== 'tauri') return { success: false, closeToTray: false }
      try {
        return await tauriInvoke<SetCloseTrayResult>('set_close_to_tray', { enable })
      } catch {
        return { success: false, closeToTray: false }
      }
    },

    // ── 更新（仅 Tauri） ──────────────────────────────
    // 使用 @tauri-apps/plugin-updater，前端主动 check + downloadAndInstall
    // 缓存 check() 返回的 Update 对象，避免重复请求
    async checkUpdate(): Promise<void> {
      if (platform !== 'tauri') return
      try {
        const { check } = await import('@tauri-apps/plugin-updater')
        _pendingUpdate = await check()
        if (_pendingUpdate) {
          _updateAvailable?.({ version: _pendingUpdate.version })
        } else {
          _updateNotAvailable?.()
        }
      } catch (e) {
        _updateError?.((e as Error)?.message ?? 'unknown')
      }
    },

    async downloadUpdate(onProgress?: (p: DownloadProgress) => void): Promise<void> {
      if (platform !== 'tauri') return
      try {
        if (!_pendingUpdate) return
        let total = 0
        let transferred = 0
        let percent = 0
        await _pendingUpdate.downloadAndInstall((event) => {
          switch (event.event) {
            case 'Started':
              total = event.data.contentLength ?? 0
              transferred = 0
              break
            case 'Progress':
              transferred += event.data.chunkLength
              percent = total > 0 ? Math.round((transferred / total) * 100) : 0
              onProgress?.({ percent, bytesPerSecond: 0, total, transferred })
              _downloadProgress?.({ percent, bytesPerSecond: 0, total, transferred })
              break
            case 'Finished':
              percent = 100
              _updateDownloaded?.()
              break
          }
        })
      } catch (e) {
        _updateError?.((e as Error)?.message ?? 'unknown')
      }
    },

    async installUpdate(): Promise<void> {
      if (platform !== 'tauri') return
      try {
        const { relaunch } = await import('@tauri-apps/plugin-process')
        await relaunch()
      } catch {
        /* ignore */
      }
    },

    // 事件回调注册（Tauri 2 updater 无全局事件，由 checkUpdate/downloadUpdate 触发本地回调）
    onUpdateAvailable(cb: (info: UpdateInfo) => void) {
      _updateAvailable = cb
      return () => {
        _updateAvailable = undefined
      }
    },
    onDownloadProgress(cb: (p: DownloadProgress) => void) {
      _downloadProgress = cb
      return () => {
        _downloadProgress = undefined
      }
    },
    onUpdateDownloaded(cb: () => void) {
      _updateDownloaded = cb
      return () => {
        _updateDownloaded = undefined
      }
    },
    onUpdateNotAvailable(cb: () => void) {
      _updateNotAvailable = cb
      return () => {
        _updateNotAvailable = undefined
      }
    },
    onUpdateError(cb: (msg: string) => void) {
      _updateError = cb
      return () => {
        _updateError = undefined
      }
    }
  }

  // 内部回调槽（替代 Tauri 全局事件）
  let _updateAvailable: ((info: UpdateInfo) => void) | undefined
  let _downloadProgress: ((p: DownloadProgress) => void) | undefined
  let _updateDownloaded: (() => void) | undefined
  let _updateNotAvailable: (() => void) | undefined
  let _updateError: ((msg: string) => void) | undefined

  return {
    platform,
    tauriVersion: readonly(tauriVersion),
    nativeDark: readonly(nativeDark),
    startThemeSync,
    stopThemeSync,
    api
  }
}
