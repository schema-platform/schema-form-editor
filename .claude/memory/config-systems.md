# 配置系统

## 1. 表达式引擎（expression.ts）
- **用途**：条件属性求值（visibleOn / disabledOn / requiredOn）
- **语法**：`${field}` 引用表单字段，支持比较/逻辑/三元/空值合并
- **安全机制**：
  - Blocklist 阻止：window / document / globalThis / eval / Function / import / require / while / for / do
  - 500 字符长度限制
  - 100ms 执行超时检测
- **性能**：LRU 编译缓存（1000 条上限）
- **API**：
  - `evaluateExpression<T>(expression, context)` → 求值结果
  - `validateExpression(expression)` → 验证结果
  - `checkSecurity(expression)` → 安全检查

## 2. 联动系统（useLinkage）
- **用途**：字段间联动（visible / disabled / required / options / set-value / reset-fields）
- **设计要点**：
  - 递归遍历 schema 收集所有带 `linkages` 的节点
  - 按 `watchFields` 建立依赖图
  - DFS 检测循环依赖，发现后降级处理
  - condition 支持函数和字符串表达式两种模式
- **响应式**：通过在 computed 内部读取 formData[watchField] 建立依赖
- **API**：`useLinkage(schema, formData, variables?, exposed?)` → `{ stateMap }`

## 3. 事件引擎（eventEngine.ts）
- **用途**：Widget 事件触发和动作执行
- **18 种动作类型**：
  - UI 操作：show / hide / open-dialog / close-dialog / switch-tab
  - 数据操作：set-value / submit / reset / emit
  - 变量操作：set-variable
  - 组件交互：trigger-event / refresh
  - 外部通信：post-message / copy / close-tab
  - API 调用：api
  - 路由跳转：navigate
  - 流程操作：startFlow / endFlow
- **执行上下文**（EventExecutionContext）：
  - findWidget / updateWidget / openDialog / closeDialog
  - submitForm / resetForm / getFormData / emit
  - confirm / variables / setVariable / getVariable
  - exposed / triggerEvent
- **安全**：表达式复用 checkSecurity，支持 formData.xxx 引用解析

## 4. 动态选项加载（useDynamicOptions）
- **优先级**：dictCode 字典查找 > API 请求 > 缓存
- **特性**：
  - `${fieldName}` 参数模板插值
  - 响应归一化（dataPath 配置或自动探测）
  - 树形数据支持（childrenKey）
  - 联动切换 API 配置时自动重新加载
  - 重试机制（executeWithRetry）
