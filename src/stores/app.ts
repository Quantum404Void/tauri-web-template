/**
 * stores/app.ts — 全局应用状态
 *
 * 管理主题、语言、侧边栏、更新状态等全局设置。
 * 使用 pinia-plugin-persistedstate 持久化关键字段。
 */

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { createPersist } from './persist'

import type { AppTheme } from '@shared/ipc'

export type { AppTheme }
export type Lang = 'zh' | 'en'
export type UpdateStatus = 'idle' | 'checking' | 'available' | 'downloading' | 'ready'

export const useAppStore = defineStore(
  'app',
  () => {
    const theme = ref<AppTheme>('dark')
    const lang = ref<Lang>('zh')
    const sidebarCollapsed = ref(false)
    const updateStatus = ref<UpdateStatus>('idle')
    const downloadProgress = ref(0)
    const updateVersion = ref('')

    /** system 模式下由 useTheme composable 写入的实际主题 */
    const _systemActualDark = ref(false)

    /** 当前是否为暗色（感知 system 模式） */
    const isDark = computed(() => {
      if (theme.value === 'system') return _systemActualDark.value
      return theme.value === 'dark'
    })

    function setTheme(t: AppTheme) {
      theme.value = t
    }

    function setLang(l: Lang) {
      lang.value = l
    }

    function toggleSidebar() {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }

    function setActualDark(dark: boolean) {
      _systemActualDark.value = dark
    }

    function setUpdateStatus(status: UpdateStatus, version?: string) {
      updateStatus.value = status
      if (version !== undefined) updateVersion.value = version
    }

    function setDownloadProgress(percent: number) {
      if (updateStatus.value !== 'downloading') return
      downloadProgress.value = Math.round(percent)
    }

    return {
      theme,
      lang,
      sidebarCollapsed,
      updateStatus,
      downloadProgress,
      updateVersion,
      isDark,
      setTheme,
      setLang,
      toggleSidebar,
      setActualDark,
      setUpdateStatus,
      setDownloadProgress
    }
  },
  {
    persist: createPersist('app', {
      version: '1.0.0',
      pick: ['theme', 'lang', 'sidebarCollapsed']
    })
  }
)
