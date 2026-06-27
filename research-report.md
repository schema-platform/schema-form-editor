# 表单设计器与页面搭建器（Form Builder / Page Builder）深度技术研究报告

## Executive Summary

表单设计器和页面搭建器的核心技术挑战在于：如何将可视化编辑操作映射为结构化数据描述（Schema），再将 Schema 高效渲染为可交互的运行时 UI。业界存在三种主流技术路线——Schema 驱动（Formily、RJSF）、组件树编排（LowCodeEngine、Retool）、DSL 解析（amis）——各有其性能取舍和扩展边界。拖拽交互层已从早期的 HTML5 原生 DnD 演进到插件化架构（dnd-kit），布局系统从绝对定位演进到可插拔定位策略（React-Grid-Layout v2）。状态管理是性能瓶颈的核心，Formily 的分布式字段状态和自研响应式层（@formily/reactive）代表了该领域的前沿实践。本报告基于 12 项经过三方交叉验证的技术事实，结合业界主流开源与商业方案，系统性地分析实现技术、功能能力、配置完整性、集成扩展性和通用性。

---

## 1. 实现技术

### 1.1 渲染引擎方案

#### Schema 驱动渲染

Schema 驱动是当前最成熟的表单渲染范式。核心思想是：表单的结构、校验、联动全部由 JSON Schema 描述，渲染引擎递归解析 Schema 并映射到组件实例。

**Formily（阿里巴巴）** 是该方向的代表。Formily v2 采用 monorepo 架构，包含 7+ 个包：`@formily/core`（框架无关核心）、`@formily/reactive`（自研响应式库）、`@formily/reactive-react` / `@formily/reactive-vue`（框架绑定）、`@formily/json-schema`（Schema 协议）、`@formily/validator`（校验器）、`@formily/react` / `@formily/vue`（UI 绑定）[Fact #3, #4]。这种分层使得核心逻辑完全与 UI 框架解耦。

**RJSF（React JSON Schema Form）** 采用双 Schema 架构：JSON Schema 定义数据结构（"what"），uiSchema 控制表单的外观和渲染方式（"how"）[Fact #5]。这种分离使得同一份数据 Schema 可以在不同场景下呈现完全不同的 UI。

**关键差异**：Formily 的 Schema 更侧重表单行为描述（联动、校验、生命周期），RJSF 的 Schema 更侧重 JSON Schema 标准兼容性。

#### 组件树渲染

**阿里低代码引擎** 定位为"为低代码平台开发者提供的，具备强大定制扩展能力的低代码设计器研发框架"，而非直接面向终端用户 [Fact #2]。其设计器核心包括入料、编排、组件配置、画布渲染四大模块，通过组件树描述页面结构，每个节点包含组件类型、属性、子节点等信息。

组件树方案的优势在于表达力强，可以描述任意复杂的组件嵌套关系；劣势在于 Schema 体积大，序列化/反序列化开销高。

#### DSL 解析

**amis（百度）** 采用自定义 JSON DSL，通过声明式配置描述页面。每种页面元素（页面、表单、弹框、表格等）对应一个渲染器，amis 内置 100+ 渲染器。DSL 方案的优势是开发效率极高（纯 JSON 即可搭建页面），劣势是自定义能力受限于渲染器覆盖范围。

### 1.2 拖拽实现

拖拽是页面搭建器的核心交互。业界方案经历了三代演进：

| 方案 | 代表项目 | 架构特点 | 适用场景 |
|------|---------|---------|---------|
| HTML5 DnD API | 原生 | 浏览器内置，不支持触摸设备，API 简陋 | 简单列表排序 |
| 后端适配器模式 | react-dnd | 通过独立包提供不同输入后端（html5-backend、touch-backend）[Fact #9] | React 生态，需要精细 DOM 控制 |
| 插件化架构 | dnd-kit | DragDropManager + 插件 + 传感器 + 修改器，支持实体级插件配置 [Fact #7] | 现代应用，需要多框架支持 |
| SortableJS 封装 | vue.draggable.next | 基于 SortableJS，无自研拖拽引擎 | Vue 生态快速集成 |

**react-dnd** 由 Dan Abramov 创建（最初定位为"HTML5 drag and drop mixin for React with full DOM control"）[Fact #10]，v14 版本进行了重大重构：将 type 与 item 解耦，并支持通过从 begin 返回 null 来取消拖拽操作 [Fact #11]。

**dnd-kit** 采用插件化架构，`DragDropManager` 作为核心协调器，`Plugin` 作为基类提供 `Plugin.configure()` 静态方法创建配置化的插件描述符。可拖拽实体通过 `plugins` 属性接受实体级插件配置 [Fact #7]。其 `OptimisticSortingPlugin` 在拖拽过程中直接物理移动 DOM 元素，无需等待框架重新渲染，使 UI 感觉响应迅速 [Fact #8]。

### 1.3 画布布局

#### 自由布局

自由布局允许组件放置在画布任意位置，通过绝对定位（left/top/width/height）描述位置。适用于仪表盘、大屏等场景。

**React-Grid-Layout v2** 是自由布局的代表方案，进行了完整的 TypeScript 重写，具备模块化、可 tree-shake 的架构。其核心创新在于将布局算法提取到框架无关的核心模块（`react-grid-layout/core`），并通过可插拔的 `PositionStrategy` 接口支持不同的定位策略（默认使用 CSS Transforms 而非绝对定位）[Fact #1]。

模块组成：
- `react-grid-layout` — React 组件和 hooks（v2 API）
- `react-grid-layout/core` — 纯布局算法（框架无关）
- `react-grid-layout/legacy` — v1 扁平 props API（迁移用）
- `react-grid-layout/extras` — 可选组件如 GridBackground

#### 栅格系统

栅格系统将画布划分为等宽列（通常 12 列或 24 列），组件占据整数列宽。适用于表单、后台管理系统等结构化布局场景。Element Plus、Ant Design 等 UI 库均提供 Row/Col 栅格组件。

#### 流式布局

流式布局（FlowLayout）按文档流排列组件，自动换行。适用于内容型页面。CSS Flexbox 和 Grid 是其实现基础。

### 1.4 状态管理

#### Schema 存储

Schema 通常存储在 Pinia/Vuex/Redux 等全局状态管理库中，作为设计器的"单一数据源"。所有编辑操作（拖拽、属性修改、删除）都通过 action 修改 Schema，再由响应式系统驱动 UI 更新。

#### Undo/Redo

常见实现方式：
- **Command 模式**：每个操作封装为 Command 对象，维护 execute/undo 栈
- **快照模式**：每次修改保存完整 Schema 快照，简单但内存开销大
- **Immutable + Patch**：使用 immer 等库生成增量 patch，平衡性能与内存

#### 协同编辑

协同编辑需要解决冲突问题。主流方案：
- **OT（Operational Transformation）**：Google Docs 采用，服务端权威
- **CRDT（Conflict-free Replicated Data Type）**：去中心化，适合离线场景
- **Yjs**：基于 CRDT 的协同框架，可与编辑器集成

#### 性能优化：分布式字段状态

Formily 的核心性能创新在于分布式字段状态管理。在 React 受控模式下，表单的整树渲染问题非常明显，特别是对于数据联动场景，很容易导致页面卡顿。Formily 将每个表单字段的状态做了分布式管理，从而大大提升了表单操作性能 [Fact #1]。

具体实现：每个字段独立调用 `form.registerField()` 并订阅自己的 `forceUpdate`，配合 `form.isHostRendering()` 守卫防止冗余重渲染。这意味着修改单个字段值时，只有该字段及其直接依赖者重新渲染，而非整个表单树。

#### 自研响应式层

`@formily/reactive` 是 Formily 自研的独立响应式状态库，与 MobX 和 `@vue/reactivity` 进行了性能基准测试 [Fact #4]。它采用 Proxy 实现，拥有独立的 reaction tracking、batch processing 和 computed/autorun 原语，而非对现有方案的封装。这一决策使 Formily 能够精确控制响应式粒度，针对表单场景做专项优化。

### 1.5 属性面板设计

#### 配置 Schema

属性面板通常也采用 Schema 驱动方式：每个组件类型关联一个属性 Schema，描述该组件可配置的属性项（类型、默认值、校验规则、联动关系等）。

#### 联动配置

属性面板内部也存在联动逻辑，例如：
- 选择"远程数据源"时，显示 URL 输入框和请求参数配置
- 启用"校验"时，显示校验规则列表

#### 实时预览

属性面板修改需要实时反映到画布。常见做法：
- 直接修改 Schema，响应式系统自动更新画布
- 使用 debounce/throttle 控制更新频率
- 关键属性（如尺寸、位置）使用直接 DOM 操作避免卡顿

---

## 2. 功能能力

### 2.1 表单联动

表单联动是表单设计器最复杂的功能之一，包括：

- **字段间联动**：A 字段值变化时修改 B 字段的值、选项、禁用状态等
- **条件显隐**：根据条件动态显示/隐藏字段
- **数据计算**：根据多个字段值计算派生字段

Formily 通过 Effects（副作用）和 Reactions（响应式表达式）实现联动，配合分布式字段状态确保联动场景下的性能 [Fact #1]。

### 2.2 事件引擎

事件引擎是表单设计器的核心运行时能力。典型动作类型包括：

| 分类 | 动作类型 |
|------|---------|
| 数据操作 | 设置值、获取值、重置、提交 |
| UI 控制 | 显示/隐藏、禁用/启用、加载状态 |
| 导航 | 路由跳转、打开新窗口、关闭弹框 |
| 网络请求 | API 调用、文件上传、WebSocket |
| 消息提示 | Toast、Dialog、Notification |
| 数据处理 | 数据转换、格式化、计算 |
| 自定义 | 执行自定义 JavaScript 代码 |

通过 `EventExecutionContext` 注入运行时上下文，使动作可以访问表单数据、全局变量、API 实例等。

### 2.3 数据绑定

- **双向绑定**：表单字段值与 Schema 数据双向同步
- **表达式引擎**：支持 `{{ }}` 语法在 Schema 中嵌入动态表达式
- **远程数据源**：支持从 API 获取数据填充下拉选项、表格数据等

### 2.4 校验机制

RJSF 从 v5 开始将校验实现与 Form 组件完全解耦，所有 Form 都需要传入实现 `ValidatorType` 接口的 `validator` prop [Fact #6]。这种设计允许用户选择不同的校验策略（AJV、自定义函数等），提高了灵活性。

常见校验能力：
- **实时校验**：输入过程中即时反馈
- **异步校验**：调用后端接口校验（如用户名唯一性）
- **自定义规则**：支持正则、函数、组合规则
- **跨字段校验**：如确认密码与密码一致性

### 2.5 预览与导出

- **多端预览**：PC、平板、手机视口切换
- **代码导出**：将 Schema 导出为可运行的 Vue/React 代码
- **Schema 导入导出**：JSON 格式的 Schema 持久化，支持版本管理

---

## 3. 配置完整性

### 3.1 组件注册机制

组件注册是设计器扩展性的基础。常见模式：

```typescript
// 典型的 Widget 注册接口
interface WidgetRegistration {
  name: string;              // 组件唯一标识
  component: Component;      // Vue/React 组件
  schema: PropertySchema;    // 属性配置 Schema
  designer?: Component;      // 设计态专用组件
  preview?: Component;       // 预览态组件
  icon?: string;             // 组件面板图标
  category?: string;         // 分类
}
```

- **动态注册**：运行时通过 `registry.register()` 动态添加组件
- **懒加载**：组件代码通过 `defineAsyncComponent` / `React.lazy` 按需加载
- **按需加载**：tree-shaking 支持，只打包使用的组件

### 3.2 Schema 规范设计

| 规范 | 特点 | 代表项目 |
|------|------|---------|
| JSON Schema (Draft 7/2020-12) | 标准化、生态丰富、工具链成熟 | RJSF |
| 自定义 JSON DSL | 灵活、可针对业务定制 | amis、Formily |
| 组件树描述 | 表达力强、可描述任意嵌套 | LowCodeEngine |

Formily v2 的 monorepo 中，`@formily/json-schema` 包专门负责 Schema 协议处理，支持 Schema 与表单行为的映射 [Fact #3]。

### 3.3 配置项覆盖度

完整的配置覆盖应包括：

- **样式配置**：尺寸、间距、颜色、字体、边框、背景
- **行为配置**：禁用、只读、隐藏、加载状态
- **事件配置**：点击、输入、变化、焦点等事件绑定
- **数据源配置**：静态数据、远程 API、表达式计算
- **校验配置**：必填、格式、范围、自定义规则
- **布局配置**：栅格占比、对齐方式、排列方向

---

## 4. 集成与扩展

### 4.1 组件扩展机制

**插件化架构**是设计器扩展的核心。阿里低代码引擎的扩展能力覆盖设计器的所有功能点（入料、编排、组件配置、画布渲染四大模块）[Fact #2]。

Formily 的 monorepo 设计天然支持扩展：框架无关的核心层（`@formily/core`、`@formily/reactive`）可以被任意框架绑定层消费 [Fact #3]。社区已基于此构建了 Vue、Angular 等绑定。

### 4.2 第三方库集成

- **UI 库对接**：Element Plus、Ant Design、TDesign 等通过 Widget 注册接入
- **图表库**：ECharts、Chart.js 通过自定义 Widget 封装
- **富文本编辑器**：TinyMCE、Quill、WangEditor 通过组件封装接入
- **代码编辑器**：Monaco Editor 用于表达式编辑、Schema 编辑

### 4.3 微前端 / 模块联邦

设计器的组件库可以通过 Module Federation 动态加载，实现：
- 组件库独立部署、版本管理
- 运行时动态加载远程组件
- 多团队协作开发不同组件库

### 4.4 API 对接与数据持久化

- **Schema 持久化**：Schema JSON 存储到后端数据库
- **表单数据提交**：运行时表单数据通过 API 持久化
- **版本管理**：Schema 版本化，支持回滚和对比

---

## 5. 通用性与业界方案对比

### 5.1 开源方案分析

| 方案 | 技术栈 | 核心定位 | Schema 类型 | 渲染方式 | 扩展性 |
|------|--------|---------|------------|---------|--------|
| **Formily v2** | React/Vue | 表单引擎 | 自定义 JSON Schema | Schema 驱动 | ★★★★★ |
| **LowCodeEngine** | React | 低代码设计器框架 | 组件树 | 组件树渲染 | ★★★★★ |
| **amis** | React | 低代码页面框架 | 自定义 JSON DSL | DSL 解析 | ★★★☆☆ |
| **RJSF** | React | JSON Schema 表单 | JSON Schema + uiSchema | Schema 驱动 | ★★★★☆ |
| **form-create** | Vue | 表单生成器 | 自定义 JSON | Schema 驱动 | ★★★☆☆ |
| **SurveyJS** | React/Vue/Angular | 调查问卷 | 自定义 JSON | Schema 驱动 | ★★★★☆ |
| **rete.js** | 框架无关 | 可视化编程 | 节点图 | 节点渲染 | ★★★★☆ |

#### Formily v2 深度分析

**架构亮点**：
- 分布式字段状态管理，解决 React 整树渲染性能问题 [Fact #1]
- 自研响应式库 `@formily/reactive`，性能对标 MobX 和 Vue Reactivity [Fact #4]
- 框架无关核心 + 多框架绑定的 monorepo 架构 [Fact #3]
- 内置 Effects/Reactions 联动机制
- JSON Schema 协议支持（`@formily/json-schema`）

**适用场景**：复杂表单、数据联动密集、需要高性能的中后台系统。

#### LowCodeEngine 深度分析

**架构亮点**：
- 定位为设计器框架，而非直接面向终端用户 [Fact #2]
- 四大核心模块（入料、编排、组件配置、画布渲染）
- 扩展能力覆盖设计器所有功能点 [Fact #2]
- 与阿里内部低代码生态深度集成

**适用场景**：需要构建自定义低代码平台的团队。

#### RJSF 深度分析

**架构亮点**：
- 双 Schema 架构：JSON Schema 定义数据，uiSchema 控制渲染 [Fact #5]
- v5 校验完全解耦，通过 ValidatorType 接口支持自定义校验策略 [Fact #6]
- 遵循 JSON Schema 标准，与 OpenAPI 生态兼容

**适用场景**：需要标准 JSON Schema 兼容性的场景（API 文档生成表单、配置管理界面）。

### 5.2 商业方案参考

| 方案 | 核心能力 | 技术特点 |
|------|---------|---------|
| **宜搭（阿里）** | 表单/页面搭建 | 与钉钉深度集成，可视化+低代码 |
| **简道云** | 表单/流程搭建 | 零代码，面向业务人员 |
| **明道云** | APaaS 平台 | 表单+工作流+仪表盘 |
| **Retool** | 内部工具搭建 | 组件库丰富，支持自定义 JS |
| **Appsmith** | 开源内部工具平台 | 类似 Retool，开源替代 |

### 5.3 技术选型建议

| 场景 | 推荐方案 | 理由 |
|------|---------|------|
| 复杂表单（数据联动密集） | Formily v2 | 分布式状态管理，联动性能最优 [Fact #1] |
| 标准 JSON Schema 表单 | RJSF | 标准兼容性最好，双 Schema 灵活 [Fact #5, #6] |
| 构建自定义低代码平台 | LowCodeEngine | 框架级扩展能力 [Fact #2] |
| 快速搭建页面（低自定义需求） | amis | 100+ 渲染器，JSON 配置即可 |
| 仪表盘/大屏布局 | React-Grid-Layout v2 | 模块化架构，框架无关核心 [Fact #1] |
| 现代拖拽交互 | dnd-kit | 插件化架构，实体级配置 [Fact #7, #8] |
| Vue 生态表单 | form-create / Formily Vue | Vue 原生支持 |
| 跨框架拖拽需求 | dnd-kit / react-dnd | 成熟稳定，社区活跃 |

---

## 6. 最佳实践

### 6.1 架构分层

```
┌─────────────────────────────────────────┐
│              设计器 UI 层                │
│  (画布、属性面板、组件面板、工具栏)       │
├─────────────────────────────────────────┤
│              编排引擎层                  │
│  (拖拽管理、选中管理、缩放、对齐)         │
├─────────────────────────────────────────┤
│              Schema 层                   │
│  (Schema 解析、校验、序列化)              │
├─────────────────────────────────────────┤
│              状态管理层                  │
│  (Schema Store、Undo/Redo、协同)         │
├─────────────────────────────────────────┤
│              运行时渲染层                │
│  (组件注册、Schema→组件映射、事件引擎)    │
├─────────────────────────────────────────┤
│              组件层                      │
│  (基础组件、业务组件、布局组件)           │
└─────────────────────────────────────────┘
```

### 6.2 关键设计原则

1. **Schema 单一数据源**：所有 UI 状态可从 Schema 推导，设计器不做额外状态存储
2. **组件注册与渲染分离**：组件注册是设计时行为，渲染是运行时行为
3. **框架无关核心**：核心逻辑与 UI 框架解耦，如 Formily 的 `@formily/core` [Fact #3] 和 RGL 的 `react-grid-layout/core` [Fact #1]
4. **插件化扩展**：所有能力通过插件扩展，核心保持最小化，如 dnd-kit 的 DragDropManager + 插件架构 [Fact #7]
5. **性能优先**：分布式状态管理避免整树渲染 [Fact #1]，DOM 直接操作避免框架开销 [Fact #8]

---

## 7. 局限性说明

1. **Formily 性能声明**："显著提升"缺乏具体基准测试数据，分布式状态管理的实际收益取决于表单复杂度和联动模式 [Fact #1]
2. **LowCodeEngine 扩展覆盖**：官方文档使用"基本上覆盖"措辞，暗示可能存在未覆盖的功能点 [Fact #2]
3. **dnd-kit 多框架支持**：Fact #7 确认插件架构，但"支持 5 个框架"的声明未通过交叉验证（tally 0-3），实际框架覆盖范围需查证最新文档
4. **vue.draggable.next**：基于 SortableJS 封装，无自研拖拽引擎，灵活性受限（未通过交叉验证，tally 1-2）
5. **RGL 性能数据**：O(n log n) 算法的性能提升数据（6x-74x）未通过交叉验证（tally 1-2），具体基准需独立验证
6. **商业方案**：宜搭、简道云等商业产品的技术实现细节未公开，分析基于公开文档和产品体验

---

## 8. 未解决的问题

1. **CRDT 在 Schema 协同编辑中的实际应用**：Yjs 等 CRDT 框架在复杂嵌套 JSON Schema 协同编辑中的冲突解决效果如何？是否有生产级案例？
2. **微前端场景下的设计器集成**：当设计器本身作为微应用运行时，画布沙箱隔离（iframe vs Shadow DOM vs Module Federation）的性能和兼容性权衡如何？
3. **AI 辅助表单设计**：LLM 生成 Schema 的可行性和质量控制——能否从自然语言描述生成可用的表单 Schema？
4. **大规模 Schema 性能边界**：当表单字段数量超过 1000+、联动关系超过 500+ 时，分布式状态管理的内存和计算开销是否存在硬边界？

---

## References

- Formily v2: https://github.com/alibaba/formily [Facts #1, #3, #4]
- React-Grid-Layout v2: https://github.com/react-grid-layout/react-grid-layout [Fact #1]
- 阿里低代码引擎: https://lowcode-engine.cn [Fact #2]
- RJSF: https://rjsf-team.github.io/react-jsonschema-form/docs/ [Facts #5, #6]
- dnd-kit: https://dndkit.com [Facts #7, #8]
- react-dnd: https://github.com/react-dnd/react-dnd [Facts #9, #10, #11]
- amis: https://github.com/baidu/amis
- form-create: https://github.com/xaboy/form-create
- SurveyJS: https://surveyjs.io
- Rete.js: https://rete.js.org
