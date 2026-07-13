export default {
  nav: {
    home: 'Home',
    file: 'File Tools',
    crypto: 'Crypto',
    system: 'System',
    update: 'Update',
    about: 'About'
  },
  home: {
    title: 'Tauri + Vue3 Template',
    subtitle: 'Production-ready desktop app template',
    feature1: 'Tauri 2 + Vite 8 + Vue 3.5',
    feature2: 'Naive UI with auto-import',
    feature3: 'Full i18n support',
    feature4: 'Auto-update via Tauri updater',
    feature5: 'Multi-format file preview and encryption',
    feature6: 'Pinia with persisted state',
    startBtn: 'Get Started',
    docsBtn: 'View Docs',
    version: 'Version'
  },
  file: {
    title: 'File Tools',
    openFile: 'Open File',
    empty: 'Open a file to preview, search, zoom, print, and download it here',
    saved: 'File saved successfully',
    opened: 'Opened: {name} ({size} bytes)',
    canceled: 'Operation canceled',
    failed: 'Operation failed: {msg}'
  },
  crypto: {
    title: 'Encryption / Decryption',
    inputLabel: 'Plaintext',
    inputPlaceholder: 'Enter text to encrypt...',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter encryption password...',
    encryptBtn: 'Encrypt',
    decryptBtn: 'Decrypt',
    result: 'Result',
    strength: 'Password Strength',
    weak: 'Weak',
    medium: 'Medium',
    strong: 'Strong',
    emptyInput: 'Please enter text and password',
    failed: 'Failed: {msg}'
  },
  system: {
    title: 'System Settings',
    autoLaunch: 'Launch at startup',
    closeToTray: 'Minimize to tray on close',
    theme: 'Theme',
    darkTheme: 'Dark',
    lightTheme: 'Light',
    systemTheme: 'System',
    language: 'Language',
    applySuccess: 'Settings applied',
    applyFailed: 'Failed to apply: {msg}',
    tauriOnly: 'Only available in Tauri desktop'
  },
  update: {
    title: 'Auto Update',
    checkBtn: 'Check for Updates',
    downloadBtn: 'Download Update',
    installBtn: 'Install & Restart',
    status: {
      idle: 'Up to date',
      checking: 'Checking...',
      available: 'New version available: {ver}',
      downloading: 'Downloading... {progress}%',
      ready: 'Ready to install'
    },
    tauriOnly: 'Only available in Tauri desktop',
    error: 'Update error: {msg}'
  },
  about: {
    title: 'About',
    name: 'Tauri Vue Template',
    version: 'Version',
    desc: 'A production-ready Tauri 2 + Vue3 desktop application template.',
    stack: 'Technology Stack',
    links: 'Links',
    tauri: 'Tauri docs',
    vite: 'Vite docs',
    vue: 'Vue 3 docs',
    naiveui: 'Naive UI docs'
  },
  search: {
    placeholder: 'Search pages...',
    noResult: 'No results found'
  },
  tray: {
    tooltip: 'Tauri Vue App',
    showWindow: 'Show Window',
    quit: 'Quit'
  },
  common: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    reset: 'Reset',
    copy: 'Copy',
    copied: 'Copied!',
    loading: 'Loading...',
    success: 'Success',
    error: 'Error'
  }
}
