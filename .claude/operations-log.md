## Genie 操作日志

### 编码前检查——构建依赖收敛

时间：2026-07-27 00:55:00 +08:00

- [x] 已分析 `api.ts`、`tauri-api.ts`、`SettingsView.vue`、`SceneDetailView.vue`、`SceneListView.vue` 和两份相关测试。
- [x] 已确认两条 Vite 警告由同一模块混用静态/动态导入导致。
- [x] 将复用现有 `getApiKeys`、`saveApiKey` 与 Tauri `getApiKeys` 导出，不新增模块或依赖。
- [x] 将保持桌面存储优先、浏览器 `localStorage` 回退的行为不变。
- [x] 将以 `npm test` 和 `npm run build` 验证，且检查构建输出不存在原有警告。

### 实施记录

时间：2026-07-27 00:56:00 +08:00

- `api.ts` 静态引用 Tauri API 读取函数，保留异常时转到浏览器存储的逻辑。
- `SettingsView.vue` 静态引用浏览器存储函数并以别名区分 Tauri API；加载和保存失败时仍使用原有回退路径。
- 这样每个模块只使用一种导入方式，Vite 可以稳定地构建依赖图。

### 编码后声明

时间：2026-07-27 01:48:00 +08:00

- 复用的既有组件：`api.ts` 的浏览器存储导出和 `tauri-api.ts` 的桌面桥接导出。
- 项目约定：保持 Vue 3 组合式脚本、单引号、分号和相对导入的既有风格。
- 对比的相似实现：与 `SceneDetailView.vue`、`SceneListView.vue` 的静态导入方式保持一致。
- 验证结果：`npm test` 的 54 项测试和无警告的 `npm run build` 均通过。
