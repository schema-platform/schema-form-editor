# 核心架构决策

## 设计哲学
- **Schema 驱动**：所有界面由 JSON Schema 描述，运行时解析渲染
- **配置替代编码**：通过属性面板配置实现功能，而非手写代码
- **通用性优先**：Widget 设计考虑通用场景，避免业务硬编码

## 分层规范（严格单向依赖）
```
Store → Composable → API → UI
```
- 全局状态 → Pinia Store（`src/stores/`）
- 公共逻辑 → 组合式 API（`src/composables/`）
- API 接口 → `src/api/`（禁止组件直接 fetch）
- UI 组件 → 只做渲染，不写复杂业务逻辑

## Store 设计
- `widgetStore` 是 Widget 数据的**唯一 source of truth**
- `editorStore` 管理编辑状态（选中、历史、模式、剪贴板）
- `boardStore` 管理画布配置（尺寸、背景、变量、事件）
- `dragStore` 管理拖拽状态

## Widget 注册机制
- 每个 Widget 独立目录：`src/widgets/[name]/`
- 必须包含：`index.vue`（渲染）+ `config.ts`（配置）
- 通过 `registry.ts` 统一注册
- `base/types.ts` 定义 `SchemaType` 枚举和 `Widget` 接口

## 微前端支持
- qiankun 模式下使用 `createMemoryHistory`
- 独立模式使用 `createWebHistory`
- 通过 `window.__POWERED_BY_QIANKUN__` 判断
