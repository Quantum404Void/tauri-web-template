/**
 * stores/persist.ts — Pinia 持久化配置工厂
 *
 * 在官方 pinia-plugin-persistedstate 基础上增加版本控制（版本不匹配时清空，避免结构污染）。
 */

import type { StateTree } from 'pinia'
import type { PersistenceOptions } from 'pinia-plugin-persistedstate'

export interface PersistOptions<S extends StateTree = StateTree> extends Omit<
  PersistenceOptions<S>,
  'serializer'
> {
  /** 语义化版本号，升级后自动清空旧数据 */
  version?: string
}

/**
 * 创建持久化配置，透传给 defineStore 第三个参数
 */
export function createPersist<S extends StateTree>(
  storeId: string,
  options: PersistOptions<S> = {}
): PersistenceOptions<S> {
  const { version, ...rest } = options

  const serializer: PersistenceOptions<S>['serializer'] = version
    ? {
        serialize(state: S): string {
          return JSON.stringify({ __v: version, state })
        },
        deserialize(raw: string): S {
          try {
            const parsed = JSON.parse(raw)
            if (parsed?.__v === version) return parsed.state as S
            if (import.meta.env.DEV) console.info(`[persist] ${storeId}: version mismatch, reset`)
          } catch {
            // JSON parse error: fall through to throw
          }
          throw new Error(`[persist] ${storeId}: invalid or version-mismatched data`)
        }
      }
    : undefined

  return {
    key: storeId,
    storage: localStorage,
    serializer,
    ...rest
  }
}
