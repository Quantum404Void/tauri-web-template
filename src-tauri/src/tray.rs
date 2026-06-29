/**
 * tray.rs — 系统托盘
 *
 * Tauri 2 托盘 API：TrayIconBuilder。
 * 菜单文案由 i18n.rs 提供，语言切换时刷新。
 */

use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    AppHandle, Manager,
};

use crate::i18n;

/// 创建系统托盘
pub fn create_tray(app: &AppHandle) -> tauri::Result<()> {
    let show_item = MenuItem::with_id(app, "show", i18n::t("tray.showWindow"), true, None::<&str>)?;
    let quit_item = MenuItem::with_id(app, "quit", i18n::t("tray.quit"), true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&show_item, &quit_item])?;

    let icon = app
        .default_window_icon()
        .cloned()
        .unwrap_or_else(|| tauri::image::Image::from_bytes(include_bytes!("../icons/icon.png")).expect("embedded icon"));

    let _tray = TrayIconBuilder::with_id("main")
        .icon(icon)
        .tooltip(i18n::t("tray.tooltip"))
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id().as_ref() {
            "show" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            // 左键点击显示窗口
            if let tauri::tray::TrayIconEvent::Click {
                button: tauri::tray::MouseButton::Left,
                button_state: tauri::tray::MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
        })
        .build(app)?;

    Ok(())
}

/// 刷新托盘菜单（语言切换后调用）
pub fn refresh_tray(app: &AppHandle) -> tauri::Result<()> {
    if let Some(tray) = app.tray_by_id("main") {
        let show_item = MenuItem::with_id(app, "show", i18n::t("tray.showWindow"), true, None::<&str>)?;
        let quit_item = MenuItem::with_id(app, "quit", i18n::t("tray.quit"), true, None::<&str>)?;
        let menu = Menu::with_items(app, &[&show_item, &quit_item])?;
        tray.set_menu(Some(menu))?;
        tray.set_tooltip(Some(i18n::t("tray.tooltip")))?;
    }
    Ok(())
}
