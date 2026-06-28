# schema-form-editor

`@schema-form/editor-web` — Schema 驱动的可视化自由布局表单设计器。

## 技术栈

- Vue 3.5 + `<script setup>` + TypeScript 5.7
- Element Plus 2.9 + ECharts 6.1
- CSS Module 样式隔离（全局强制，`.module.scss`）
- Pinia 状态管理 + Vitest 测试

## 架构概览

```
src/
├── api/                 # API 接口层（authApi/dataApi/schemaApi/roleApi/userApi/widgetApi/runtimeApi/requestApi）
├── components/
│   ├── Editor/          # 编辑器 UI（85 个组件：Canvas/Overlay/PropertyPanel/LeftPanel/RightPanel/Toolbar 等）
│   ├── WidgetRenderer/  # 渲染引擎（SchemaRender → SchemaNode → WidgetNode）
│   ├── Credential/      # 凭证管理
│   └── System/          # 系统级组件
├── composables/         # 组合式 API（37 个，见下表）
├── engine/              # 事件引擎（eventEngine.ts，18 种动作类型）
├── locales/             # i18n
├── microapp/            # qiankun 微前端集成
├── router/              # Vue Router
├── stores/              # Pinia Store（11 个：api/app/board/credential/drag/editor/request/schemaVersion/template/tenant/widget）
├── styles/              # 全局样式
├── types/               # TypeScript 类型定义
├── utils/               # 工具函数（expression/schemaValidate/apiClient/unitResolver 等 20 个）
├── views/               # 页面级视图
├── widgets/             # Widget 组件库（64 个目录，38+ 类型）
│   ├── base/types.ts    # 核心类型定义（SchemaType/Widget/Board/EventAction 等）
│   ├── registry.ts      # Widget 注册表
│   └── index.ts         # 统一注册入口
└── workers/             # Web Worker（cacheWorker/indexedDb — L1 内存 + L2 IndexedDB 缓存）
```

## 核心架构规则

### 组件嵌套规则
- **基础组件、业务组件禁止互相嵌套**，只允许嵌套在布局组件（single-col/double-col/triple-col/quad-col）内部
- 容器组件（form/card/tabs/dialog）可直接包含基础组件

### 样式规则
- **样式 100% Schema 驱动**：删除所有硬编码样式、固定宽高，所有组件样式由 Schema 配置驱动
- **CSS Module 强制**：所有组件样式使用 `.module.scss`，禁止全局样式污染

### 属性面板规则
- 每个 Widget 必须有对应属性配置面板（config.ts 中 propertyPanel 声明）
- 配置项必须能正常生效，支持 basic/style/props 三个分组

### Widget 注册规则
- Widget 目录：`src/widgets/<name>/`，包含组件 `.vue` + 配置 `config.ts`
- 通过 `registry.ts` 注册，`base/types.ts` 定义 `SchemaType`
- 新增 Widget 必须在 `src/widgets/index.ts` 中 import 并 registerWidget

### Widget 位置单位
- Widget position 支持 `xUnit/yUnit/wUnit/hUnit`（`'px' | '%'`），默认 `'px'`
- 百分比单位相对于画布尺寸计算，编辑器和渲染器均支持

## 分层规范

1. **全局状态** → Pinia Store（`src/stores/`）
2. **公共逻辑** → 组合式 API（`src/composables/`）
3. **API 接口** → `src/api/`（禁止组件直接 fetch）
4. **UI 组件** → 只做渲染，不写复杂业务逻辑

## 四大配置系统

所有 Widget 通过 config.ts 声明以下配置，编辑器统一弹窗编辑：

| 系统 | 类型 | 入口 | 说明 |
|---|---|---|---|
| 事件配置 | `events` | ActionListEditor | 18 种动作类型，支持 confirm + condition |
| 联动配置 | `linkages` | LinkageEditor | 6 种联动类型（visible/disabled/required/options/set-value/reset-fields） |
| API 配置 | `api` | ApiConfig | 动态数据源，支持 dictCode/url/ttl/retry/cache |
| 变量配置 | `variables` | VariableEditor | Widget 内部变量 |

## 条件表达式系统

- `visibleOn` / `disabledOn` / `requiredOn` — 字符串表达式，编译为 `(formData, ctx) => boolean`
- 沙箱执行：禁止访问 `constructor/__proto__/prototype`，LRU 缓存编译结果
- 安全检查：`utils/expression.ts` 中 `checkSecurity()` 阻断原型链攻击

## 事件引擎

- 入口：`engine/eventEngine.ts`
- 通过 `EventExecutionContext` 注入运行时（findWidget/formData/globalVars/messageBus 等）
- 18 种动作类型：show/hide, open-dialog/close-dialog, switch-tab, set-value, submit/reset, emit, set-variable, trigger-event, post-message, close-tab, copy, refresh, api, navigate, startFlow/endFlow

## Widget 类型枚举

**容器类型（ContainerType）**：form, card, tabs, dialog, single-col, double-col, triple-col, quad-col, micro-app-container

**基础类型（BasicType）**：input, number, select, radio, checkbox, date, textarea, richtext, button, upload, switch, slider, rate, table, title, divider, spacer, toolbar-buttons, file-list, transfer, banner, tree-layout, date-time-slot, time-picker, cascader, color-picker, tag-input, autocomplete, descriptions, advanced-table, statistic, 以及所有图表变体（bar/line/pie/scatter/radar/gauge/heatmap/funnel/candlestick），审批组件（approval-user-picker/approval-role-picker/approval-comment）

## Composables 清单

| 名称 | 职责 |
|---|---|
| useApiRequest | API 请求封装 |
| useAutoSave | 自动保存 |
| useBreakpoint | 响应式断点 |
| useCache | LRU 缓存 |
| useClipboard | 剪贴板操作 |
| useConditionReferences | 条件引用解析 |
| useConstant | 全局常量（MAX_HISTORY_SIZE=30, FALLBACK 类型列表） |
| useDrag | 拖拽定位（支持 % 单位） |
| useDragEditor | 编辑器拖拽交互 |
| useDynamicOptions | 动态选项加载（防竞态，generation 计数器） |
| useEditorLayout | 编辑器布局 |
| useEventLog | 事件日志 |
| useExposeWidget | Widget 暴露值 |
| useFormData | 表单数据管理 |
| useHistory | 撤销/重做（maxSize=30） |
| useIdGenerate | ID 生成 |
| useInteractionControl | 交互控制 |
| useLeftPanelManage | 左侧面板管理 |
| useLifecycle | 生命周期（防定时器泄漏） |
| useLinkage | 联动引擎（依赖图 + DFS 环检测） |
| useListData | 列表数据 |
| useLocale | 国际化 |
| useLogger | 日志工具 |
| useModeControl | 模式控制 |
| usePermission | 权限控制 |
| usePropertyAdapters | 属性适配器 |
| useResize | 尺寸调整 |
| useRightPanelConfig | 右侧面板配置 |
| useSchemaValidation | Schema 校验 |
| useSnapshot | 快照 |
| useWidgetIndex | Widget 索引 |
| useWidgetLifecycle | Widget 生命周期执行 |
| useWidgetOptions | Widget 选项管理 |
| useWidgetPanel | Widget 面板 |
| useWidgetRenderState | Widget 渲染状态（visible/disabled/required） |
| useWorkerRequest | Web Worker 请求 |

## Utils 清单

| 名称 | 职责 |
|---|---|
| actionExecutor | 动作执行器 |
| apiClient | 统一 HTTP 客户端（替代 genericFetchApi） |
| collision | 碰撞检测 |
| coordinate | 坐标转换 |
| exportUtils | 导出工具 |
| expression | 表达式编译沙箱（安全检查 + LRU 缓存） |
| guidelines | 辅助线 |
| jsonToSchema | JSON → Schema 转换 |
| mockApi | Mock 数据 |
| optionsCache | 选项缓存（L1 内存 + L2 IndexedDB） |
| parseSchemaJson | Schema JSON 解析 |
| requestQueue | 请求队列 |
| responseNormalizer | 响应标准化 |
| retryRequest | 重试请求 |
| schemaDefaults | Schema 默认值 |
| schemaDiff | Schema 差异对比 |
| schemaExport | Schema 导出 |
| schemaTransform | Schema 转换 |
| schemaValidate | Schema 校验（FALLBACK_SCHEMA_TYPES 同步） |
| unitResolver | 单位解析（px/% 转换） |

## 路径别名

- `@/` → `src/`

## 公共包规则

- **修改公共包必须发包并拉取**：修改 `@schema-platform/platform-shared` 等公共包源码后，必须发包（更新版本号 → `pnpm publish`），然后在本项目执行 `pnpm update` 拉取新版本。仅修改源码不发包 = 改动不生效。

## 环境规则

- **gh CLI 已认证**：`gh` 已登录、`GITHUB_TOKEN` 环境变量已就绪，禁止检查 token、禁止询问用户设置

### 代码质量规则
- **禁止跳过问题**：遇到任何报错、警告、异常，必须找到根因并修复，不能以"预存问题""之前就有""不影响运行"为由跳过。每个问题都要记录原因和修复方式

## 迭代规则

- **禁止回滚 git**，渐进式推进
- 复杂场景必须完整实现，不简化需求
- 能力不够就扩展 Widget，不硬编码绕过

## 常用命令

```bash
pnpm dev          # vite dev server（端口 5173）
pnpm build        # vite build
pnpm build:check  # vue-tsc + vite build
pnpm test         # vitest run
pnpm test:coverage
```

## Claude Code Agent

- `.claude/agents/schema-editor-expert.md` — 全链路专家级工程师 Agent，专注产品设计/开发/迭代/验证
- `.claude/memory/` — Agent 持久化记忆（architecture/widget-system/communication/config-systems/dev-rules/iteration-log）
