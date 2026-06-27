# 通信架构

## 四层通信体系

### 1. postMessage — 跨窗口通信
- `src/microapp/bridge.ts`：微前端 iframe ↔ 宿主通信
- 事件引擎 `post-message` 动作：运行时向父窗口发消息，支持 `formData.xxx` 动态解析
- AI sidebar：editor ↔ AI iframe 双向通信
  - `ai:ready`：iframe 就绪信号
  - `ai:set-context`：编辑器发送上下文
  - `ai:current-schema`：编辑器发送当前 Schema

### 2. Socket — 实时推送
- `@schema-form/platform-shared/socket`
- `connect()`：建立连接
- `onAiApply()`：监听 AI 应用 Schema 事件
- `onAiPublished()`：监听 AI 发布事件
- AI 生成 Schema 后实时推送回编辑器，逐个插入到画布

### 3. Web Worker — 离线缓存
- `src/workers/cacheWorker.ts`：
  - L1：内存 Map（快速访问）
  - L2：IndexedDB（持久化）
  - 预取队列：`prefetch:add` / `prefetch:flush`
  - 每 5 分钟自动清理过期缓存
- `src/workers/indexedDb.ts`：IndexedDB 封装

### 4. Fetch 请求队列
- `src/utils/requestQueue.ts`：
  - `collectApiTasks()`：递归遍历 Schema 树，收集所有 `api.url` 配置
  - `executeQueue()`：顺序执行，自动去重（method + url + params）
  - 命中 `optionsCache` 直接跳过
- `src/utils/apiClient.ts`：
  - 统一 API 客户端（单例）
  - 请求/响应拦截器链
  - token 自动注入
  - Mock 降级支持
  - `requestRaw()`：外部 URL 请求（不解析 ApiResponse 包装）
  - `requestUrl()`：完整 URL 请求（不拼接 baseUrl）

## 动态选项加载
- `src/composables/useDynamicOptions.ts`：
  - dictCode → 字典查找（优先）
  - API 请求 → 响应归一化 → 缓存
  - 支持 `${fieldName}` 参数模板插值
  - 支持 `childrenKey` 树形数据
  - 联动切换 API 配置时自动重新加载
