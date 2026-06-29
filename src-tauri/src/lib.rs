/**
 * lib.rs — Tauri 应用入口
 *
 * 职责：插件注册、命令注册、托盘、窗口状态、关闭拦截。
 * closeToTray 配置通过 tauri-plugin-store 持久化到文件。
 * 状态管理遵循 Tauri 2 官方模式：app.manage(Mutex<T>) + State<'_, Mutex<T>>
 */

mod commands;
mod i18n;
mod tray;

use std::sync::Mutex;

use tauri::{Manager, WindowEvent};
use tauri_plugin_store::StoreExt;

use crate::commands::CloseTrayState;

#[cfg(desktop)]
use tauri_plugin_autostart::MacosLauncher;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .manage(Mutex::new(CloseTrayState::default()))
        .setup(|app| {
            #[cfg(desktop)]
            {
                app.handle().plugin(
                    tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, Some(vec![])),
                )?;
            }

            // 从 store 加载持久化的 closeToTray 设置
            if let Ok(store) = app.store("settings.json") {
                if let Some(enabled) = store.get("closeToTray").and_then(|v| v.as_bool()) {
                    *app.state::<Mutex<CloseTrayState>>().lock().unwrap() =
                        CloseTrayState { enabled };
                }
            }

            // 创建系统托盘
            tray::create_tray(app.handle())?;

            // 初始化语言（默认 zh）
            i18n::set_locale("zh");

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_native_theme,
            commands::set_theme,
            commands::set_locale,
            commands::get_close_to_tray,
            commands::set_close_to_tray,
        ])
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                let state = window
                    .app_handle()
                    .state::<Mutex<CloseTrayState>>();
                if state.lock().unwrap().enabled {
                    api.prevent_close();
                    let _ = window.hide();
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
