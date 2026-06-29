/**
 * commands.rs — Tauri IPC 命令
 *
 * 与前端 src/shared/ipc.ts 的 COMMANDS 对齐。
 */

use std::sync::Arc;

use parking_lot::Mutex;
use serde::Serialize;
use tauri::Manager;

use crate::i18n;
use crate::tray;

/// closeToTray 共享状态
#[derive(Default)]
pub struct CloseTrayState {
    pub enabled: bool,
}

#[derive(Serialize)]
pub struct SetCloseTrayResult {
    pub success: bool,
    pub close_to_tray: bool,
}

/// 获取当前系统原生主题（"dark" | "light"）
#[tauri::command]
pub fn get_native_theme(app: tauri::AppHandle) -> String {
    // Tauri 2.x: theme() is on Window/WebviewWindow, not AppHandle
    // Fall back to "dark" if we can't determine the theme
    match app.get_webview_window("main") {
        Some(window) => match window.theme() {
            Ok(tauri::Theme::Dark) => "dark".to_string(),
            Ok(tauri::Theme::Light) => "light".to_string(),
            Ok(_) => {
                // Non-exhaustive: future theme variants
                if cfg!(target_os = "windows") || cfg!(target_os = "macos") {
                    "dark".to_string()
                } else {
                    "light".to_string()
                }
            }
            Err(_) => {
                // macOS 10.14+, Windows: default to dark
                if cfg!(target_os = "windows") || cfg!(target_os = "macos") {
                    "dark".to_string()
                } else {
                    "light".to_string()
                }
            }
        },
        None => {
            // No window yet, assume dark on desktop platforms
            if cfg!(target_os = "windows") || cfg!(target_os = "macos") {
                "dark".to_string()
            } else {
                "light".to_string()
            }
        }
    }
}

/// 设置原生主题源（Tauri 2 无原生 API 设置系统主题，此处仅作占位，
/// 实际主题切换由前端 CSS 处理。保留命令以维持 API 契约一致。）
#[tauri::command]
pub fn set_theme(_theme: String) {
    // no-op: 主题由前端管理
}

/// 设置后端语言（用于托盘菜单文案）
#[tauri::command]
pub fn set_locale(locale: String, app: tauri::AppHandle) {
    i18n::set_locale(&locale);
    // 刷新托盘菜单文案
    let _ = tray::refresh_tray(&app);
}

/// 获取 closeToTray 状态
#[tauri::command]
pub fn get_close_to_tray(state: tauri::State<'_, Arc<Mutex<CloseTrayState>>>) -> bool {
    state.lock().enabled
}

/// 设置 closeToTray 状态
#[tauri::command]
pub fn set_close_to_tray(
    enable: bool,
    state: tauri::State<'_, Arc<Mutex<CloseTrayState>>>,
) -> SetCloseTrayResult {
    let mut guard = state.lock();
    guard.enabled = enable;
    SetCloseTrayResult {
        success: true,
        close_to_tray: enable,
    }
}
