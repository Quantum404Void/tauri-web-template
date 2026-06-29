export default {
  nav: {
    home: '首页',
    file: '文件工具',
    crypto: '加密解密',
    system: '系统设置',
    update: '自动更新',
    about: '关于'
  },
  home: {
    title: 'Tauri + Vue3 模板',
    subtitle: '开箱即用的桌面应用模板',
    feature1: 'Tauri 2 + Vite 8 + Vue 3.5',
    feature2: 'Naive UI 按需自动导入',
    feature3: '完整的国际化支持',
    feature4: 'Tauri updater 自动更新',
    feature5: '文件加密与 ZIP 工具库',
    feature6: 'Pinia 状态持久化',
    startBtn: '开始使用',
    docsBtn: '查看文档',
    version: '版本'
  },
  file: {
    title: '文件工具',
    saveText: '保存文本文件',
    saveJson: '保存 JSON 文件',
    saveZip: '保存 ZIP 压缩包',
    openFile: '打开文件',
    result: '操作结果',
    noResult: '暂无结果',
    content: '内容',
    placeholder: '输入要保存的内容...',
    editTab: '编辑',
    previewTab: '预览',
    saved: '文件保存成功',
    opened: '已打开：{name}（{size} 字节）',
    canceled: '操作已取消',
    failed: '操作失败：{msg}'
  },
  crypto: {
    title: '加密 / 解密',
    inputLabel: '明文',
    inputPlaceholder: '输入要加密的文本...',
    passwordLabel: '密码',
    passwordPlaceholder: '输入加密密码...',
    encryptBtn: '加密',
    decryptBtn: '解密',
    result: '结果',
    strength: '密码强度',
    weak: '弱',
    medium: '中',
    strong: '强',
    emptyInput: '请输入文本和密码',
    failed: '操作失败：{msg}'
  },
  system: {
    title: '系统设置',
    autoLaunch: '开机自启动',
    closeToTray: '关闭时最小化到托盘',
    theme: '主题',
    darkTheme: '深色',
    lightTheme: '浅色',
    systemTheme: '跟随系统',
    language: '语言',
    applySuccess: '设置已应用',
    applyFailed: '应用失败：{msg}',
    tauriOnly: '仅在 Tauri 桌面环境中可用'
  },
  update: {
    title: '自动更新',
    checkBtn: '检查更新',
    downloadBtn: '下载更新',
    installBtn: '安装并重启',
    status: {
      idle: '已是最新版本',
      checking: '检查中...',
      available: '发现新版本：{ver}',
      downloading: '下载中... {progress}%',
      ready: '准备安装'
    },
    tauriOnly: '仅在 Tauri 桌面环境中可用',
    error: '更新出错：{msg}'
  },
  about: {
    title: '关于',
    name: 'Tauri Vue 模板',
    version: '版本',
    desc: '一个开箱即用的 Tauri 2 + Vue3 桌面应用模板，集成了生产环境所需的各种工具。',
    stack: '技术栈',
    links: '相关链接',
    tauri: 'Tauri 文档',
    vite: 'Vite 文档',
    vue: 'Vue 3 文档',
    naiveui: 'Naive UI 文档'
  },
  search: {
    placeholder: '搜索页面...',
    noResult: '无匹配结果'
  },
  tray: {
    tooltip: 'Tauri Vue 应用',
    showWindow: '显示窗口',
    quit: '退出'
  },
  common: {
    confirm: '确认',
    cancel: '取消',
    save: '保存',
    reset: '重置',
    copy: '复制',
    copied: '已复制！',
    loading: '加载中...',
    success: '成功',
    error: '错误'
  }
}
