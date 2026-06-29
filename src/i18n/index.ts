/**
 * i18n/index.ts — 国际化配置
 *
 * 使用 vue-i18n Composition API（legacy: false）。
 * 后端语言同步由 usePlatform 抽象层处理。
 */

import { normalizeLocale } from '@shared/locale'
import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n'

import en from './en'
import zh from './zh'

import type { Composer } from 'vue-i18n'

export type MessageSchema = typeof zh
export type AppLocale = 'zh' | 'en'

const messages = { zh, en } as const

function detectLocale(): AppLocale {
  return normalizeLocale(navigator.language, Object.keys(messages)) as AppLocale
}

const i18n = createI18n<[MessageSchema], AppLocale>({
  legacy: false,
  locale: detectLocale(),
  fallbackLocale: 'en',
  messages,
  globalInjection: true
})

const composer = i18n.global as unknown as Composer<
  Record<string, MessageSchema>,
  {},
  {},
  AppLocale
>

export async function setI18nLanguage(lang: string): Promise<void> {
  const normalized = normalizeLocale(lang, Object.keys(messages)) as AppLocale
  composer.locale.value = normalized
  document.documentElement.lang = normalized
  await nextTick()
}

export function getCurrentLocale(): AppLocale {
  return composer.locale.value as AppLocale
}

export default i18n
