import { inject, computed, type ComputedRef } from 'vue'
import { widgetDataKey, widgetStyleKey, widgetBoundsKey } from '../widgets/base/types'

/**
 * 画布内部件尺寸：与 overlay 使用同一套 position → 像素换算。
 * 通过 SchemaNode 注入的 widgetBoundsKey 获取解析后的宽高，
 * 再写入 Element Plus 的 --el-component-size，使实际渲染与选框一致。
 */
export function useWidgetControlSize(defaultHeight = 32, defaultWidth = 240) {
  const widgetData = inject(widgetDataKey)!
  const widgetStyle = inject(widgetStyleKey)! as ComputedRef<Record<string, unknown>>
  const bounds = inject(widgetBoundsKey, null)

  const widgetWidth = computed(() =>
    bounds?.value.widthPx ?? widgetData.value.position?.w ?? defaultWidth,
  )

  const widgetHeight = computed(() =>
    bounds?.value.heightPx ?? widgetData.value.position?.h ?? defaultHeight,
  )

  const controlStyle = computed(() => {
    const h = widgetHeight.value
    const style: Record<string, string> = {
      width: '100%',
      height: '100%',
      '--el-component-size': `${h}px`,
      '--el-component-size-small': `${h}px`,
      '--el-component-size-large': `${h}px`,
    }
    const fontSize = widgetStyle.value?.fontSize as string | undefined
    const color = widgetStyle.value?.color as string | undefined
    if (fontSize) style.fontSize = fontSize
    if (color) style.color = color
    return style
  })

  return { widgetWidth, widgetHeight, controlStyle }
}

/**
 * 通用布局样式：部件根节点填满 SchemaNode wrapper（100%）。
 * 用于图表、富文本、自定义 div 等非 EP 表单控件。
 */
export function useWidgetLayoutStyle(defaultHeight = 32, defaultWidth = 240) {
  const { widgetWidth, widgetHeight, controlStyle } = useWidgetControlSize(defaultHeight, defaultWidth)
  const layoutStyle = computed(() => ({
    width: '100%',
    height: '100%',
    minWidth: 0,
    minHeight: 0,
    boxSizing: 'border-box' as const,
    fontSize: controlStyle.value.fontSize,
    color: controlStyle.value.color,
  }))
  return { widgetWidth, widgetHeight, layoutStyle, controlStyle }
}
