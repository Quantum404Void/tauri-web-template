/**
 * shared/locale.ts — 语言代码标准化（前端 + 后端共享）
 */

/** 常见浏览器/系统语言代码 → 应用 locale key 映射 */
const LOCALE_MAP: Record<string, string> = {
  zh: 'zh',
  'zh-CN': 'zh',
  'zh-SG': 'zh',
  'zh-TW': 'zh',
  'zh-HK': 'zh',
  en: 'en',
  'en-US': 'en',
  'en-GB': 'en',
  'en-AU': 'en',
  'en-CA': 'en'
}

/**
 * 标准化语言代码
 * @param locale   原始语言代码（如 navigator.language）
 * @param available 应用支持的 locale 列表
 * @param fallback  兜底 locale，默认 'en'
 */
export function normalizeLocale(locale: string, available?: string[], fallback = 'en'): string {
  const mapped = LOCALE_MAP[locale] ?? locale
  if (!available) return mapped
  if (available.includes(mapped)) return mapped
  const prefix = locale.split('-')[0]
  const prefixMapped = LOCALE_MAP[prefix] ?? prefix
  if (available.includes(prefixMapped)) return prefixMapped
  if (available.includes(locale)) return locale
  return available.includes(fallback) ? fallback : (available[0] ?? fallback)
}
