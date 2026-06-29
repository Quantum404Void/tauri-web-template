/**
 * router/index.ts — 路由配置
 *
 * Tauri 使用 hash 模式（避免 tauri:// 协议问题），
 * Web 使用 history 模式（SEO 友好）。
 */

import { isTauri } from '@/utils/env'
import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'

import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: { name: 'home' } },
  {
    path: '/home',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: 'nav.home' }
  },
  {
    path: '/file',
    name: 'file',
    component: () => import('@/views/FileView.vue'),
    meta: { title: 'nav.file' }
  },
  {
    path: '/crypto',
    name: 'crypto',
    component: () => import('@/views/CryptoView.vue'),
    meta: { title: 'nav.crypto' }
  },
  {
    path: '/system',
    name: 'system',
    component: () => import('@/views/SystemView.vue'),
    meta: { title: 'nav.system' }
  },
  {
    path: '/update',
    name: 'update',
    component: () => import('@/views/UpdateView.vue'),
    meta: { title: 'nav.update' }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue'),
    meta: { title: 'nav.about' }
  },
  { path: '/:pathMatch(.*)*', redirect: { name: 'home' } }
]

const router = createRouter({
  history: isTauri() ? createWebHashHistory() : createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

export default router
