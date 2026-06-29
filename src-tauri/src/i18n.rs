/**
 * i18n.rs — 后端国际化（托盘菜单文案）
 *
 * 与前端 i18n/zh.ts、en.ts 的 tray 字段对齐。
 */

use std::sync::{Mutex, OnceLock};

struct I18nState {
    locale: String,
}

static STATE: OnceLock<Mutex<I18nState>> = OnceLock::new();

fn state() -> &'static Mutex<I18nState> {
    STATE.get_or_init(|| Mutex::new(I18nState { locale: "zh".to_string() }))
}

/// 设置当前 locale（"zh" | "en"）
pub fn set_locale(locale: &str) {
    let normalized = normalize(locale);
    state().lock().locale = normalized.to_string();
}

/// 翻译 key（仅支持 tray.* 路径）
pub fn t(key: &str) -> String {
    let locale = state().lock().locale.clone();
    let messages = messages_for(&locale);
    messages.get(key).cloned().unwrap_or_else(|| key.to_string())
}

fn normalize(locale: &str) -> &'static str {
    let lower = locale.to_lowercase();
    if lower.starts_with("zh") {
        "zh"
    } else if lower.starts_with("en") {
        "en"
    } else {
        "en"
    }
}

fn messages_for(locale: &str) -> std::collections::HashMap<String, String> {
    let mut map = std::collections::HashMap::new();
    match locale {
        "zh" => {
            map.insert("tray.showWindow".to_string(), "显示窗口".to_string());
            map.insert("tray.quit".to_string(), "退出应用".to_string());
            map.insert("tray.tooltip".to_string(), "Tauri Vue 应用".to_string());
        }
        _ => {
            map.insert("tray.showWindow".to_string(), "Show Window".to_string());
            map.insert("tray.quit".to_string(), "Quit".to_string());
            map.insert("tray.tooltip".to_string(), "Tauri Vue App".to_string());
        }
    }
    map
}
