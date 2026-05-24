use serde::{Deserialize, Serialize};
use tauri::Runtime;
use tauri_plugin_store::StoreExt;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiKeyEntry {
    pub provider: String,
    pub api_key: String,
}

const STORE_FILE: &str = "genie-config.json";
const STORE_KEY: &str = "api_keys";

fn load_keys<R: Runtime>(app: &tauri::AppHandle<R>) -> Result<Vec<ApiKeyEntry>, String> {
    let store = app.store(STORE_FILE).map_err(|e| e.to_string())?;
    let keys = store
        .get(STORE_KEY)
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or_default();
    Ok(keys)
}

fn save_keys<R: Runtime>(app: &tauri::AppHandle<R>, keys: &[ApiKeyEntry]) -> Result<(), String> {
    let store = app.store(STORE_FILE).map_err(|e| e.to_string())?;
    let value = serde_json::to_value(keys).map_err(|e| e.to_string())?;
    store.set(STORE_KEY, value);
    store.save().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn store_api_key(
    app: tauri::AppHandle,
    provider: String,
    api_key: String,
) -> Result<(), String> {
    let mut keys = load_keys(&app)?;

    if let Some(existing) = keys.iter_mut().find(|k| k.provider == provider) {
        existing.api_key = api_key;
    } else {
        keys.push(ApiKeyEntry { provider, api_key });
    }

    save_keys(&app, &keys)?;
    Ok(())
}

#[tauri::command]
pub async fn get_api_keys(app: tauri::AppHandle) -> Result<Vec<ApiKeyEntry>, String> {
    load_keys(&app)
}

#[cfg(test)]
mod tests {
    use super::*;
    use tauri::test::mock_builder;

    /// Each test uses a unique store filename to avoid cross-test pollution.
    /// The counter ensures uniqueness across tests running in parallel.
    fn test_app() -> (tauri::AppHandle<tauri::test::MockRuntime>, String) {
        use std::sync::atomic::{AtomicU64, Ordering};
        static COUNTER: AtomicU64 = AtomicU64::new(0);
        let id = COUNTER.fetch_add(1, Ordering::SeqCst);
        let store_file = format!("genie-test-{id}.json");

        let app = mock_builder()
            .plugin(tauri_plugin_store::Builder::default().build())
            .build(tauri::generate_context!())
            .expect("should build test app")
            .handle()
            .clone();
        (app, store_file)
    }

    #[test]
    fn test_get_api_keys_returns_empty_initial() {
        let (app, store_file) = test_app();
        let keys = load_keys_for_store(&app, &store_file).expect("should load keys");
        assert!(keys.is_empty());
    }

    #[test]
    fn test_store_and_retrieve_api_key() {
        let (app, store_file) = test_app();

        let entry = ApiKeyEntry {
            provider: "openai".to_string(),
            api_key: "sk-test123".to_string(),
        };
        save_keys_for_store(&app, &store_file, &[entry.clone()]).expect("should save keys");

        let loaded = load_keys_for_store(&app, &store_file).expect("should load keys");
        assert_eq!(loaded.len(), 1);
        assert_eq!(loaded[0].provider, "openai");
        assert_eq!(loaded[0].api_key, "sk-test123");
    }

    #[test]
    fn test_store_overwrites_existing_key() {
        let (app, store_file) = test_app();

        save_keys_for_store(
            &app,
            &store_file,
            &[ApiKeyEntry {
                provider: "openai".to_string(),
                api_key: "sk-first".to_string(),
            }],
        )
        .expect("should save first");

        save_keys_for_store(
            &app,
            &store_file,
            &[ApiKeyEntry {
                provider: "openai".to_string(),
                api_key: "sk-second".to_string(),
            }],
        )
        .expect("should save second");

        let loaded = load_keys_for_store(&app, &store_file).expect("should load keys");
        assert_eq!(loaded.len(), 1);
        assert_eq!(loaded[0].api_key, "sk-second");
    }

    #[test]
    fn test_store_multiple_providers() {
        let (app, store_file) = test_app();

        save_keys_for_store(
            &app,
            &store_file,
            &[
                ApiKeyEntry {
                    provider: "openai".to_string(),
                    api_key: "sk-openai".to_string(),
                },
                ApiKeyEntry {
                    provider: "gemini".to_string(),
                    api_key: "sk-gemini".to_string(),
                },
                ApiKeyEntry {
                    provider: "deepseek".to_string(),
                    api_key: "sk-deepseek".to_string(),
                },
            ],
        )
        .expect("should save all keys");

        let loaded = load_keys_for_store(&app, &store_file).expect("should load keys");
        assert_eq!(loaded.len(), 3);

        let providers: Vec<String> = loaded.iter().map(|k| k.provider.clone()).collect();
        assert!(providers.contains(&"openai".to_string()));
        assert!(providers.contains(&"gemini".to_string()));
        assert!(providers.contains(&"deepseek".to_string()));
    }

    /// Test helpers that use a dynamic store file path to avoid cross-test pollution.
    fn load_keys_for_store<R: tauri::Runtime>(
        app: &tauri::AppHandle<R>,
        store_file: &str,
    ) -> Result<Vec<ApiKeyEntry>, String> {
        let store = app.store(store_file).map_err(|e| e.to_string())?;
        Ok(store
            .get(STORE_KEY)
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .unwrap_or_default())
    }

    fn save_keys_for_store<R: tauri::Runtime>(
        app: &tauri::AppHandle<R>,
        store_file: &str,
        keys: &[ApiKeyEntry],
    ) -> Result<(), String> {
        let store = app.store(store_file).map_err(|e| e.to_string())?;
        let value = serde_json::to_value(keys).map_err(|e| e.to_string())?;
        store.set(STORE_KEY, value);
        store.save().map_err(|e| e.to_string())?;
        Ok(())
    }
}
