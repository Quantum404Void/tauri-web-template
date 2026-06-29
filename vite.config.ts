import vue from '@vitejs/plugin-vue'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { visualizer } from 'rollup-plugin-visualizer'
import AutoImport from 'unplugin-auto-import/vite'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { VitePWA } from 'vite-plugin-pwa'
import VueDevTools from 'vite-plugin-vue-devtools'
import { defineConfig } from 'vite-plus'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const { version, devDependencies } = JSON.parse(
  readFileSync(join(__dirname, 'package.json'), 'utf-8')
)

const define = {
  __APP_VERSION__: JSON.stringify(version),
  __APP_VITE__: JSON.stringify((devDependencies?.vite ?? '').replace(/^\^/, '').split('.')[0]),
  __APP_TS__: JSON.stringify(
    (devDependencies?.typescript ?? '').replace(/^\^/, '').split('.').slice(0, 2).join('.')
  )
}

// Tauri dev 模式下固定端口，与 tauri.conf.json 的 devUrl 对齐
const TAURI_DEV_PORT = 26888
// TAURI_ENV_PLATFORM 在 `tauri dev` 和 `tauri build` 时都会被设置
const isTauri = process.env.TAURI_ENV_PLATFORM !== undefined
// iOS/Android 真机调试时 Tauri 会注入 TAURI_DEV_HOST
const tauriDevHost = process.env.TAURI_DEV_HOST

export default defineConfig({
  root: join(__dirname, 'src'),
  envDir: __dirname,
  publicDir: join(__dirname, 'src/public'),
  // 防止 Vite 清屏冲掉 Rust 编译错误
  clearScreen: false,
  // 暴露 Tauri 环境变量到 import.meta.env
  envPrefix: ['VITE_', 'TAURI_ENV_*'],
  plugins: [
    vue(),
    AutoImport({ imports: ['vue'] }),
    Components({
      resolvers: [
        NaiveUiResolver(),
        IconsResolver({
          prefix: 'icon',
          alias: { system: 'system-uicons' },
          customCollections: ['svg']
        })
      ]
    }),
    Icons({
      autoInstall: true,
      customCollections: {
        svg: FileSystemIconLoader('src/assets/icons')
      }
    }),
    VueDevTools(),
    visualizer({ filename: 'stats.html', gzipSize: true, brotliSize: true }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'favicon-16x16.png',
        'favicon-32x32.png',
        'apple-touch-icon.png'
      ],
      manifest: {
        name: 'Tauri Vue Template',
        short_name: 'Tauri Vue',
        description: 'Tauri 2 + Vue 3 + TypeScript template',
        theme_color: '#1a1a2e',
        background_color: '#1a1a2e',
        display: 'standalone',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/pwa-maskable-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /\.(?:woff|woff2|ttf|otf)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'font-cache',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      },
      devOptions: { enabled: false, type: 'module' }
    })
  ],
  resolve: {
    alias: {
      '@': join(__dirname, 'src'),
      '@shared': join(__dirname, 'src/shared')
    }
  },
  // Tauri dev: 固定 host/port；Web dev: 监听 0.0.0.0；移动端真机调试走 TAURI_DEV_HOST
  server: {
    host: tauriDevHost || (isTauri ? '127.0.0.1' : '0.0.0.0'),
    port: TAURI_DEV_PORT,
    strictPort: isTauri,
    open: false,
    hmr: tauriDevHost ? { protocol: 'ws', host: tauriDevHost, port: 1421 } : undefined,
    watch: {
      // 忽略 Rust 代码变更，避免 Vite 触发不必要的 HMR/重启
      ignored: ['**/src-tauri/**']
    }
  },
  define,
  build: {
    outDir: join(__dirname, 'dist'),
    emptyOutDir: true,
    assetsDir: 'assets',
    // Tauri: Windows 用 WebView2 (Chromium) → chrome105；macOS/Linux 用 WebKit → safari13
    // Web: 兼容更广的浏览器 → es2022
    target: isTauri
      ? process.env.TAURI_ENV_PLATFORM === 'windows'
        ? 'chrome105'
        : 'safari13'
      : 'es2022',
    // Tauri debug 构建不压缩、产 sourcemap；release 反之；Web 始终压缩无 sourcemap
    minify: isTauri ? !process.env.TAURI_ENV_DEBUG : true,
    sourcemap: isTauri ? !!process.env.TAURI_ENV_DEBUG : false,
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id): string | undefined {
          if (id.includes('naive-ui')) return 'naive-ui'
          if (
            id.includes('/node_modules/vue/') ||
            id.includes('/node_modules/vue-router/') ||
            id.includes('/node_modules/pinia') ||
            id.includes('/node_modules/vue-i18n/')
          )
            return 'vue-vendor'
          if (id.includes('@vueuse/core')) return 'vueuse'
          if (id.includes('@tauri-apps')) return 'tauri'
          return undefined
        }
      }
    }
  },
  // ── Vite+ 工具链配置 ──────────────────────────────────
  fmt: {
    semi: false,
    singleQuote: true,
    trailingComma: 'none',
    experimentalSortImports: {
      internalPattern: ['@/**', '~/**'],
      groups: [['builtin', 'external'], ['internal'], ['parent', 'sibling', 'index'], ['type']]
    },
    ignorePatterns: [
      'node_modules',
      'dist',
      'src-tauri',
      'certs',
      '*.log',
      '*.min.js',
      '*.min.css',
      '*-lock.yaml',
      '*-lock.json',
      '*.d.ts',
      'auto-imports.d.ts',
      'components.d.ts'
    ]
  },
  lint: {
    options: { typeAware: true, typeCheck: true },
    ignorePatterns: [
      'node_modules',
      'dist',
      'src-tauri',
      '*.d.ts',
      'auto-imports.d.ts',
      'components.d.ts'
    ],
    plugins: ['import', 'typescript', 'unicorn', 'promise'],
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
      'typescript/no-explicit-any': 'warn',
      'typescript/consistent-type-imports': 'warn',
      'import/no-duplicates': 'error',
      'unicorn/prefer-node-protocol': 'warn',
      'promise/catch-or-return': 'warn'
    }
  }
})
