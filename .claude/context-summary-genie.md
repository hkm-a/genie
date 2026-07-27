## 项目上下文摘要（Genie 构建依赖收敛）

生成时间：2026-07-27 00:55:00 +08:00

### 目标与验收

- 目标：移除 Vite 对 `api.ts` 与 `tauri-api.ts` 同时被静态/动态导入的两条构建警告。
- 验收：保持网页端 API Key 回退和 Tauri 存储功能；`npm test`、`npm run build` 通过，构建输出不再出现对应的两条动态导入警告。

### 相似实现分析

- `src/views/SceneDetailView.vue:107` 静态导入 `runScene` 和 Tauri `getApiKeys`，说明应用主体已把两个模块放进主依赖图。
- `src/views/SceneListView.vue:125` 静态导入 `getScenes`，说明 `api.ts` 不是按设置页懒加载的独立功能。
- `src/api.ts:3702` 在 Tauri 桥接异常时读取浏览器存储，保持桌面优先、网页回退的协议。
- `src/views/SettingsView.vue:99` 复用同一协议，却在异常路径动态导入浏览器存储函数，造成与主依赖图不一致。
- `src/__tests__/api.test.ts` 与 `src/__tests__/tauri-api.test.ts` 使用 Vitest 直接测试浏览器回退和 Tauri 调用，是本次回归验证的既有模式。

### 依赖与集成点

```text
SettingsView / SceneDetailView / SceneListView
  -> api.ts（场景、浏览器存储）
  -> tauri-api.ts（桌面存储桥接）
  -> Tauri invoke 或 localStorage 回退
```

- 不新增依赖，不改变调用接口，只把已有动态导入统一为静态导入。
- 风险：必须保留异常回退顺序；测试覆盖 Tauri 可用、不可用与浏览器存储三类路径。

### 约定与充分性检查

- 项目使用 Vue 3、TypeScript、Vite 和 Vitest；源码为分号风格和单引号导入。
- 已确认三处同类导入、测试入口和构建命令。
- 已确认没有可复用的导入适配层；最小且一致的方案是使用现有导出函数的别名静态导入。
