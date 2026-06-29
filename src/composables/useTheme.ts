/**
 * useTheme.ts — 主题管理
 *
 * 封装 dark/light/system 三态切换、NaiveUI 主题对象。
 * OS 主题同步由 App.vue 统一管理（单例），此处仅读取 store。
 */

import { useAppStore } from '@/stores/app'
import { darkTheme, lightTheme } from 'naive-ui'
import { computed, onMounted } from 'vue'

import type { AppTheme } from '@shared/ipc'

export function useTheme() {
  const appStore = useAppStore()

  const isDark = computed(() => appStore.isDark)
  const naiveTheme = computed(() => (isDark.value ? darkTheme : lightTheme))

  const themeCycle: AppTheme[] = ['dark', 'light', 'system']

  function cycleTheme() {
    const idx = themeCycle.indexOf(appStore.theme)
    appStore.theme = themeCycle[(idx + 1) % themeCycle.length]
  }

  function setTheme(theme: AppTheme) {
    appStore.theme = theme
  }

  onMounted(() => {
    // App.vue watcher handles setTheme on change; this ensures correct state on mount
  })

  return {
    isDark,
    naiveTheme,
    cycleTheme,
    setTheme
  }
}
