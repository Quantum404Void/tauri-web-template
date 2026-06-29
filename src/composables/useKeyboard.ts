/**
 * useKeyboard.ts — 全局键盘快捷键
 *
 * 注册/注销快捷键，自动在组件卸载时清理。
 */

import { onMounted, onUnmounted } from 'vue'

export interface KeyBinding {
  key: string
  ctrl?: boolean
  meta?: boolean
  alt?: boolean
  shift?: boolean
  handler: (e: KeyboardEvent) => void
  prevent?: boolean
}

export function useKeyboard(bindings: KeyBinding[]) {
  function onKeyDown(e: KeyboardEvent) {
    for (const b of bindings) {
      if (e.key.toLowerCase() !== b.key.toLowerCase()) continue
      if (!!b.ctrl !== (e.ctrlKey || e.metaKey)) continue
      if (b.meta !== undefined && !!b.meta !== e.metaKey) continue
      if (!!b.alt !== e.altKey) continue
      if (!!b.shift !== e.shiftKey) continue
      if (b.prevent) e.preventDefault()
      b.handler(e)
    }
  }

  onMounted(() => document.addEventListener('keydown', onKeyDown))
  onUnmounted(() => document.removeEventListener('keydown', onKeyDown))
}
