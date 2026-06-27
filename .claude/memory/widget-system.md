# Widget 体系设计

## 类型分类
- **容器组件**（ContainerType）：form / card / tabs / dialog / single-col / double-col / triple-col / quad-col
- **基础组件**（BasicType）：input / number / select / radio / checkbox / date / textarea / richtext / button / upload / switch / slider / rate / table / title / divider / spacer 等
- **图表组件**：bar / line / pie / scatter / radar / gauge / heatmap / funnel / candlestick
- **业务组件**：advanced-table / tree-layout / file-list / transfer / user-management / role-management

## 容器嵌套规则
- **容器禁止互相嵌套**，只允许普通组件嵌套在布局组件内
- `sanitizeContainerNesting()` 自动清理非法嵌套，将内层容器提升到根级
- 列容器（single/double/triple/quad-col）自动分配 `colIndex`
- tabs 容器自动分配 `tabKey`

## Widget 数据模型关键字段
- `position`：绝对定位（x, y, w, h）+ 单位（wUnit, hUnit）+ 层级（zIndex）
- `formId`：绑定到表单容器
- `tabKey`：绑定到标签页
- `colIndex`：绑定到列容器
- `linkages`：联动规则（SchemaLinkage[]）
- `events`：事件列表（WidgetEvent[]）
- `api`：数据源配置（SchemaApiConfig）

## 全宽组件
以下组件在 grid-col 中渲染时 span 强制为 24：
table / upload / transfer / banner / tree-layout / file-list / descriptions / 所有图表组件

## 属性面板配置
- `propertyPanel`：声明属性面板的 basic / style / props 分区
- `configPanels`：底部弹框入口（events / rules / api / variables）
- `eventTargets`：声明组件内可独立绑定事件的子元素
- `exposedValues`：组件暴露的运行时值，供联动条件引用
- `receivableEvents`：组件可接收的外部事件
