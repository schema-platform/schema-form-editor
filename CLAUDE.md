# schema-form-editor

`@schema-form/editor-web` — Schema 驱动的可视化自由布局表单设计器。

## 项目规则

### 技术栈
- Vue 3.5 + `<script setup>` + TypeScript 5.7
- Element Plus 2.9 + ECharts 6.1
- CSS Module 样式隔离（全局强制）

### 架构规则
- **组件嵌套唯一规则**：基础组件、业务组件禁止互相嵌套，只允许嵌套在布局组件内部
- **样式 100% Schema 驱动**：删除所有硬编码样式、固定宽高，所有组件样式由 Schema 配置驱动
- **属性面板完整性**：每个组件必须有对应属性配置面板，配置项必须能正常生效
- **事件引擎**：`engine/eventEngine.ts`，18 种动作类型，通过 `EventExecutionContext` 注入运行时
- **Widget 注册**：`src/widgets/` 目录，通过 `registry.ts` 注册，`base/types.ts` 定义 `SchemaType`

### 分层规范
1. 全局状态 → Pinia Store（`src/stores/`）
2. 公共逻辑 → 组合式 API（`src/composables/`）
3. API 接口 → `src/api/`（禁止组件直接 fetch）
4. UI 组件 → 只做渲染，不写复杂业务逻辑

### 路径别名
- `@/` → `src/`

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
