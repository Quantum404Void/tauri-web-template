# Tauri Vue Template

Tauri 2 + Vue 3 + TypeScript 双模式（桌面 + Web）应用模板。

## 技术栈

| 层级       | 技术                                         |
| ---------- | -------------------------------------------- |
| 桌面运行时 | Tauri 2                                      |
| 前端框架   | Vue 3.5 (Composition API + `<script setup>`) |
| 构建工具   | Vite 8 + vite-plus (vp)                      |
| UI 库      | Naive UI 2                                   |
| 状态管理   | Pinia + pinia-plugin-persistedstate          |
| 路由       | Vue Router 5                                 |
| 国际化     | vue-i18n 11                                  |
| 工具链     | Bun                                          |
| 后端       | Rust                                         |

## 功能

- Tauri 2 桌面 + Web 双模式
- 系统托盘（语言切换刷新菜单）
- 开机自启动
- 自动更新（@tauri-apps/plugin-updater）
- 窗口状态持久化（tauri-plugin-window-state）
- 主题：dark / light / system 三态
- 完整 i18n（中/英）
- 文件工具：保存文本/JSON/ZIP，打开文件
- 加密工具：AES-256-CBC（Web Crypto API）
- 全局搜索（Ctrl+K）
- 响应式布局
- PWA（仅 Web 模式）

## 环境要求

- [Rust](https://rustup.rs/) (stable)
- [Bun](https://bun.sh/) ≥ 1.3
- Windows: MSVC Build Tools / macOS: Xcode CLT / Linux: webkit2gtk

## 快速开始

```bash
# 安装依赖
bun install

# 桌面开发模式（启动 Tauri + Vite）
bun run dev

# Web 开发模式（仅 Vite）
bun run dev:web

# 类型检查 + Lint
bun run check

# 构建 Web 产物
bun run build:web

# 构建 Tauri 安装包
bun run build:tauri
```

## 项目结构

```
tauri-web-template/
├── src/                          # 前端源码
│   ├── assets/                   # 静态资源
│   ├── components/               # 公共组件
│   ├── composables/              # 组合式函数
│   ├── i18n/                     # 国际化
│   ├── layouts/                  # 布局组件
│   ├── plugins/                  # Vue 插件注册
│   ├── router/                   # 路由
│   ├── shared/                   # 前后端共享类型
│   ├── stores/                   # Pinia stores
│   ├── types/                    # 类型定义
│   ├── utils/                    # 工具函数
│   ├── views/                    # 页面视图
│   ├── App.vue
│   ├── main.ts
│   └── index.html
├── src-tauri/                    # Tauri 后端
│   ├── src/
│   │   ├── commands.rs           # IPC 命令
│   │   ├── i18n.rs               # 后端国际化
│   │   ├── tray.rs               # 系统托盘
│   │   ├── lib.rs                # 应用入口
│   │   └── main.rs
│   ├── capabilities/             # Tauri 权限配置
│   ├── icons/                    # 应用图标
│   ├── Cargo.toml
│   ├── build.rs
│   └── tauri.conf.json
├── vite.config.ts                # Vite + vp 配置
├── tsconfig.json
├── package.json
└── README.md
```

## IPC 契约

前端 `src/shared/ipc.ts` 与 Rust 后端 `src-tauri/src/commands.rs` 共享类型定义。命令名与事件名集中定义，保证前后端一致性。

## 开发约定

- 使用 `vp` 工具链：`vp check` / `vp lint` / `vp fmt` / `vp test`
- Vue 组件统一 Composition API + `<script setup>` + TypeScript
- API 调用通过 `@/composables/usePlatform` 抽象层，不直接依赖 Tauri API

## License

MIT
