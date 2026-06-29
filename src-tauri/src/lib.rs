/**
 * lib.rs — Tauri 应用入口
 *
 * 职责：插件注册、命令注册、托盘、窗口状态、关闭拦截。
 * closeToTray 配置通过 tauri-plugin-store 持久化到文件。
 */

mod commands;
mod i18n;
mod tray;

use std::sync::Arc;

use parking_lot::Mutex;
use tauri::{Manager, WindowEvent};

use crate::commands::CloseTrayState;

#[cfg(desktop)]
use tauri_plugin_autostart::MacosLauncher;

pub fn run() {
    let close_tray_state = Arc::new(Mutex::new(CloseTrayState::default()));

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .manage(close_tray_state.clone())
        .setup({
            let state = close_tray_state.clone();
            move |app| {
                #[cfg(desktop)]
                {
                    app.handle().plugin(
                        tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, Some(vec![])),
                    )?;
                }

                // 从 store 加载持久化的 closeToTray 设置
                let store = app
                    .store("settings.json")
                    .expect("failed to open settings store");
                if let Some(enabled) = store
                    .get("closeToTray")
                    .and_then(|v| v.as_bool())
                {
                    state.lock().enabled = enabled;
                }

                // 创建系统托盘
                tray::create_tray(app.handle())?;

                // 初始化语言（默认 zh）
                i18n::set_locale("zh");

                Ok(())
            }
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_native_theme,
            commands::set_theme,
            commands::set_locale,
            commands::get_close_to_tray,
            commands::set_close_to_tray,
        ])
        .on_window_event(|window, event| {
            // 关闭拦截：closeToTray=true 时隐藏窗口而非退出
            if let WindowEvent::CloseRequested { api, .. } = event {
                let state = window.app_handle().state::<Arc<Mutex<CloseTrayState>>>();
                let close_to_tray = state.lock().enabled;
                if close_to_tray {
                    api.prevent_close();
                    let _ = window.hide();
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
