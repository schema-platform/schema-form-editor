<script setup lang="ts">
/**
 * EditorCanvas — 编辑器画布 (Phase 3)
 *
 * 简化版画布引擎，包裹 SchemaRender，提供画布上下文。
 * 画布配置从 boardStore 读取，Widget 数据从 widgetStore 读取。
 *
 * 职责：
 * - 渲染画布容器（尺寸、背景、缩放）
 * - 委托 SchemaRender 渲染 Widget 树
 * - 画布交互（选中、拖拽、缩放）后续迭代接入
 */
import { computed, onMounted, onUnmounted, provide, ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import { useBoardStore } from '../../stores/board'
import { useEditorStore } from '../../stores/editor'
import EditorOverlay from './EditorOverlay.vue'
import ZoomIndicator from './ZoomIndicator.vue'
import SchemaRender from '../WidgetRenderer/SchemaRender.vue'
import { useWidgetStore } from '../../stores/widget'
import type { Widget } from '../../widgets/base/types'
import type { PartialWidget, DialogRegistry, EventExecutionContext, FormFieldValue } from '../WidgetRenderer/types'
import { triggerWidgetEvent } from '../../engine'
import { EVENT_CONTEXT_KEY, DIALOG_REGISTRY_KEY, FORM_GRID_LINKAGE_KEY } from '../WidgetRenderer/types'
import { useLinkage } from '../../composables/useLinkage'
import styles from './EditorCanvas.module.scss'
import rendererStyles from '../WidgetRenderer/style.module.scss'

const emit = defineEmits<{
  openEvent: [widget: Widget]
  openRule: [widget: Widget]
  openApi: [widget: Widget]
  openVariables: [widget: Widget]
  savePreview: [dataUrl: string]
}>()

const canvasRef = ref<HTMLElement>()
defineExpose({ canvasRef })

const boardStore = useBoardStore()
const editorStore = useEditorStore()
const widgetStore = useWidgetStore()

const isPreview = computed(() => editorStore.mode === 'preview')

// ---- 百分比模式：监听父容器尺寸 ----

const parentSize = ref({ width: 1920, height: 1080 })
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  const parent = canvasRef.value?.parentElement
  if (parent) {
    const measure = () => {
      parentSize.value = { width: parent.clientWidth, height: parent.clientHeight }
    }
    measure()
    resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(parent)
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})

/** 画布容器样式：尺寸、背景、内边距、缩放 */
const canvasStyle = computed(() => {
  const c = boardStore.canvas
  const wUnit = c.widthUnit ?? 'px'
  const hUnit = c.heightUnit ?? 'px'

  // 编辑模式有 24px margin（标尺空间），百分比时需扣除 margin
  const margin = isPreview.value ? 0 : 24
  const availW = parentSize.value.width - margin * 2
  const availH = parentSize.value.height - margin * 2
  const widthPx = wUnit === '%' ? Math.round(availW * c.width / 100) : c.width
  const heightPx = hUnit === '%' ? Math.round(availH * c.height / 100) : c.height

  boardStore.setCanvasPixelSize(widthPx, heightPx)

  return {
    width: wUnit === '%' ? `calc(${c.width}% - ${margin * 2}px)` : `${c.width}px`,
    height: hUnit === '%' ? `calc(${c.height}% - ${margin * 2}px)` : `${c.height}px`,
    backgroundColor: c.backgroundColor,
    padding: c.padding,
    transform: `scale(${c.zoom / 100})`,
    transformOrigin: 'top left',
    position: 'relative' as const,
  }
})

// ---- 预览模式：弹窗注册表 + 事件执行上下文 ----

const dialogRegistry: DialogRegistry = new Map()
const lastOpenedDialogId = ref<string | undefined>(undefined)
provide(DIALOG_REGISTRY_KEY, dialogRegistry)

// ---- 变量 + exposed 上下文（预览模式） ----

const runtimeVariables = ref<Record<string, unknown>>({})
const exposedContext = ref<Record<string, Record<string, unknown>>>({})

const variablesContext = computed(() => {
  const vars: Record<string, unknown> = {}
  for (const v of boardStore.variables) {
    vars[v.name] = v.defaultValue
  }
  function collect(items: Widget[]) {
    for (const item of items) {
      if (item.variables?.length) {
        for (const v of item.variables) {
          vars[v.name] = v.defaultValue
        }
      }
      if (item.children?.length) collect(item.children as Widget[])
    }
  }
  collect(widgetStore.widgets)
  Object.assign(vars, runtimeVariables.value)
  return vars
})

provide('registerExposed', (widgetId: string, state: Record<string, unknown>) => {
  exposedContext.value = { ...exposedContext.value, [widgetId]: state }
})
provide('unregisterExposed', (widgetId: string) => {
  const { [widgetId]: _, ...rest } = exposedContext.value
  exposedContext.value = rest
})
provide('variablesContext', variablesContext)
provide('exposedContext', exposedContext)

/** 递归查找 widget */
function findWidgetById(items: Widget[], id: string): Widget | undefined {
  for (const item of items) {
    if (item.id === id) return item
    if (item.children?.length) {
      const found = findWidgetById(item.children as Widget[], id)
      if (found) return found
    }
  }
  return undefined
}

const previewEventContext: EventExecutionContext = {
  findWidget: (id: string) => findWidgetById(widgetStore.widgets, id),
  updateWidget: (id: string, patch: Partial<Widget>) => widgetStore.updateWidget(id, patch),
  openDialog: (target: string) => {
    const handler = dialogRegistry.get(target)
    if (handler) {
      lastOpenedDialogId.value = target
      handler(true)
      return
    }
  },
  closeDialog: () => {
    if (lastOpenedDialogId.value) {
      const handler = dialogRegistry.get(lastOpenedDialogId.value)
      if (handler) handler(false)
      lastOpenedDialogId.value = undefined
    }
  },
  submitForm: () => {},
  resetForm: () => {},
  getFormData: () => {
    const values: Record<string, unknown> = {}
    function walk(items: Widget[]) {
      for (const w of items) {
        if (w.field) values[w.field] = w.defaultValue ?? null
        if (w.children?.length) walk(w.children as Widget[])
      }
    }
    walk(widgetStore.widgets)
    return values
  },
  emit: () => {},
  get variables() { return variablesContext.value },
  setVariable: (name: string, value: unknown) => { runtimeVariables.value[name] = value },
  getVariable: (name: string) => variablesContext.value[name],
  get exposed() { return exposedContext.value },
  triggerEvent: (targetId: string, eventName: string) => {
    const widget = findWidgetById(widgetStore.widgets, targetId)
    if (widget) {
      triggerWidgetEvent(widget, eventName, previewEventContext)
    }
  },
  confirm: (message: string) => {
    return ElMessageBox.confirm(message, '确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {})
  },
}
provide(EVENT_CONTEXT_KEY, previewEventContext)

// ---- 共享联动状态（编辑模式：注入给所有 SchemaNode，避免每个节点独立创建 useLinkage） ----

const { stateMap: linkageStateMap } = useLinkage(
  widgetStore.widgets as unknown as PartialWidget[],
  computed(() => {
    const values: Record<string, FormFieldValue> = {}
    function walk(items: Widget[]) {
      for (const w of items) {
        if (w.field) values[w.field] = w.defaultValue ?? null
        if (w.children?.length) walk(w.children as Widget[])
      }
    }
    walk(widgetStore.widgets)
    return values
  }),
  variablesContext,
  exposedContext,
)
provide(FORM_GRID_LINKAGE_KEY, linkageStateMap)

const isPercentWidth = computed(() => (boardStore.canvas.widthUnit ?? 'px') === '%')
const isPercentHeight = computed(() => (boardStore.canvas.heightUnit ?? 'px') === '%')
</script>

<template>
  <div
    ref="canvasRef"
    :class="[
      styles.canvas,
      rendererStyles.fg,
      {
        [styles.canvasGrid]: !isPreview,
        [styles.canvasEdit]: !isPreview,
        [styles.canvasPercentWidth]: !isPreview && isPercentWidth,
        [styles.canvasPercentHeight]: !isPreview && isPercentHeight,
      },
    ]"
    :style="canvasStyle"
  >
    <!-- 预览模式：纯净渲染，无编辑交互层 -->
    <SchemaRender v-if="isPreview" :widgets="widgetStore.widgets" />
    <!-- 编辑模式：带选中、拖拽、缩放的交互层 -->
    <EditorOverlay
      v-else
      @open-event="emit('openEvent', $event)"
      @open-rule="emit('openRule', $event)"
      @open-api="emit('openApi', $event)"
      @open-variables="emit('openVariables', $event)"
      @save-preview="emit('savePreview', $event)"
    />
  </div>
</template>

