/**
 * types/env.d.ts — 全局类型声明
 */

/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/info" />
/// <reference types="vite-plugin-pwa/vue" />
/// <reference types="unplugin-icons/types/vue" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, any>
  export default component
}

declare module '~icons/*' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent
  export default component
}

/** 构建时由 vite.config.ts define 注入 */
declare const __APP_VERSION__: string
declare const __APP_VITE__: string
declare const __APP_TS__: string
