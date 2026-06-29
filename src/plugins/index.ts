/**
 * plugins/index.ts — 应用插件注册
 *
 * 统一注册 Pinia、Router、i18n 等插件。
 * PWA 仅在 Web 环境下注册。
 */

import i18n from '@/i18n'
import router from '@/router'
import { isTauri } from '@/utils/env'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import type { App } from 'vue'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// PWA Service Worker：仅 Web 环境注册（Tauri 无 Service Worker 支持）
if (!isTauri()) {
  import('./pwa')
    .then(({ setupPWA }) => setupPWA())
    .catch((e) => {
      if (import.meta.env.DEV) console.warn('[PWA] setup failed:', e)
    })
}

export function registerPlugins(app: App): void {
  app.use(pinia).use(router).use(i18n)
}
