mod commands;

fn main() {
    let mut builder = tauri::Builder::default();

    #[cfg(feature = "devtools")]
    {
        builder = builder.plugin(tauri_plugin_devtools::init());
    }

    builder
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            commands::store_api_key,
            commands::get_api_keys,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
