/**
 * commands.rs — Tauri IPC 命令
 *
 * 与前端 src/shared/ipc.ts 的 COMMANDS 对齐。
 * 状态管理遵循 Tauri 2 官方模式：State<'_, Mutex<T>>
 */

use std::sync::Mutex;

use serde::Serialize;
use serde_json::json;
use tauri::Manager;
use tauri_plugin_store::StoreExt;

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

fn fallback_theme() -> &'static str {
    if cfg!(target_os = "windows") || cfg!(target_os = "macos") {
        "dark"
    } else {
        "light"
    }
}

/// 获取当前系统原生主题（"dark" | "light"）
#[tauri::command]
pub fn get_native_theme(app: tauri::AppHandle) -> String {
    match app.get_webview_window("main") {
        Some(window) => match window.theme() {
            Ok(tauri::Theme::Dark) => "dark".to_string(),
            Ok(tauri::Theme::Light) => "light".to_string(),
            Ok(_) => fallback_theme().to_string(),
            Err(_) => fallback_theme().to_string(),
        },
        None => fallback_theme().to_string(),
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
    let _ = tray::refresh_tray(&app);
}

/// 获取 closeToTray 状态
#[tauri::command]
pub fn get_close_to_tray(state: tauri::State<'_, Mutex<CloseTrayState>>) -> bool {
    state.lock().unwrap().enabled
}

/// 设置 closeToTray 状态（同步持久化到 store）
#[tauri::command]
pub fn set_close_to_tray(
    enable: bool,
    state: tauri::State<'_, Mutex<CloseTrayState>>,
    app: tauri::AppHandle,
) -> SetCloseTrayResult {
    state.lock().unwrap().enabled = enable;
    // 持久化到文件
    if let Ok(store) = app.store("settings.json") {
        store.set("closeToTray", json!(enable));
        let _ = store.save();
    }
    SetCloseTrayResult {
        success: true,
        close_to_tray: enable,
    }
}
