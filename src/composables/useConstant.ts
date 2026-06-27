/**
 * useConstant — 全局常量集中管理
 *
 * 消除项目中的魔法数字/字符串，统一引用。
 * 容器类型从 registry 动态获取，支持新增部件自动适配。
 */
import { computed } from 'vue'
import type { SchemaType } from '@/components/WidgetRenderer/types'
import { getAllWidgets, type WidgetRegistryItem } from '@/widgets/registry'

/**
 * 静态容器类型集合（用于非组件上下文，如工具函数、碰撞检测等）
 * 当 registry 未初始化时作为 fallback。
 */
export const LAYOUT_CONTAINER_TYPES: ReadonlySet<SchemaType> = new Set<SchemaType>([
  'form', 'card', 'tabs', 'dialog',
  'single-col', 'double-col', 'triple-col', 'quad-col',
])

/** 编辑历史最大快照数 */
export const MAX_HISTORY_SIZE = 30

/** 组件 ID Hash 长度 */
export const ID_HASH_LENGTH = 5

/**
 * 从 registry 动态获取容器类型集合
 * container 分组的 widget 都是容器
 * 当 registry 为空时 fallback 到 LAYOUT_CONTAINER_TYPES
 */
function getContainerTypesFromRegistry(): Set<SchemaType> {
  const types = new Set<SchemaType>()
  for (const item of getAllWidgets()) {
    if (item.group === 'container' || item.group === 'layout') {
      types.add(item.type)
    }
  }
  if (types.size === 0) {
    return new Set(LAYOUT_CONTAINER_TYPES)
  }
  return types
}

/** 可容纳子节点的布局容器类型（动态） */
export function useLayoutContainerTypes(): ReadonlySet<SchemaType> {
  return computed(() => getContainerTypesFromRegistry())
}

/** 编辑器中可接受拖放的容器类型（动态） */
export function useEditableContainerTypes(): ReadonlySet<SchemaType> {
  return computed(() => getContainerTypesFromRegistry())
}

/** 交互模式 */
export const INTERACTION_MODES = ['edit', 'preview', 'publish-interactive', 'publish-readonly'] as const

export type InteractionMode = (typeof INTERACTION_MODES)[number]

/**
 * 判断组件类型是否为可嵌套容器（动态）
 */
export function canNest(type: SchemaType): boolean {
  return getContainerTypesFromRegistry().has(type)
}

/**
 * 获取所有容器类型（静态缓存，用于非响应式场景）
 * 注意：此函数每次调用都会遍历所有 widgets，建议在非频繁调用场景使用
 */
export function useAllContainerTypes(): Set<SchemaType> {
  return getContainerTypesFromRegistry()
}

/** @deprecated 使用 useAllContainerTypes 替代 */
export const getAllContainerTypes = useAllContainerTypes

/** 布局/容器组件（layout + container 分组，动态） */
export function useLayoutTypes(): ReadonlySet<SchemaType> {
  return computed(() => {
    const types = new Set<SchemaType>()
    for (const item of getAllWidgets()) {
      if (item.group === 'layout' || item.group === 'container') {
        types.add(item.type)
      }
    }
    return types
  })
}

/** 静态基础类型 fallback（registry 未初始化时） */
const FALLBACK_BASIC_TYPES = new Set<SchemaType>([
  'input', 'select', 'number', 'radio', 'checkbox', 'date', 'textarea', 'switch', 'slider',
  'title', 'divider', 'spacer', 'toolbar-buttons', 'button',
  'table', 'richtext', 'upload', 'banner', 'tree-layout', 'date-time-slot', 'time-picker',
  'file-list', 'transfer', 'cascader', 'rate', 'color-picker', 'tag-input', 'autocomplete',
  'descriptions', 'advanced-table', 'statistic', 'iframe',
  'bar-chart', 'stacked-bar-chart', 'horizontal-bar-chart',
  'line-chart', 'area-chart',
  'pie-chart', 'donut-chart',
  'scatter-chart', 'bubble-chart',
  'radar', 'filled-radar',
  'gauge', 'multi-gauge',
  'heatmap',
  'funnel', 'compare-funnel',
  'candlestick',
])

/** 静态业务类型 fallback（registry 未初始化时） */
const FALLBACK_BUSINESS_TYPES = new Set<SchemaType>([
  'tree-layout', 'upload', 'file-list',
  'approval-user-picker', 'approval-role-picker', 'approval-comment',
])

/** 表单控件 + 操作按钮 + 静态展示 + 表格（动态） */
export function useBasicTypes(): ReadonlySet<SchemaType> {
  return computed(() => {
    const types = new Set<SchemaType>()
    for (const item of getAllWidgets()) {
      if (['form', 'action', 'static', 'table'].includes(item.group)) {
        types.add(item.type)
      }
    }
    if (types.size === 0) {
      return FALLBACK_BASIC_TYPES
    }
    return types
  })
}

/** 业务组件（business 分组，动态） */
export function useBusinessTypes(): ReadonlySet<SchemaType> {
  return computed(() => {
    const types = new Set<SchemaType>()
    for (const item of getAllWidgets()) {
      if (item.group === 'business') {
        types.add(item.type)
      }
    }
    if (types.size === 0) {
      return FALLBACK_BUSINESS_TYPES
    }
    return types
  })
}

/**
 * 获取指定分组的所有组件类型
 */
export function useTypesByGroup(group: WidgetRegistryItem['group']): Set<SchemaType> {
  const types = new Set<SchemaType>()
  for (const item of getAllWidgets()) {
    if (item.group === group) {
      types.add(item.type)
    }
  }
  return types
}

/** @deprecated 使用 useTypesByGroup 替代 */
export const getTypesByGroup = useTypesByGroup
