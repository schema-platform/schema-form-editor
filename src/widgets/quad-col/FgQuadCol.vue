<script setup lang="ts">
/**
 * FgQuadCol — 四列布局容器
 *
 * 纯布局容器，4 列，每列可放置 1 个组件。
 * 通过 CSS flexbox 实现，colIndex 0/1/2/3 绑定子组件。
 * 列宽支持固定 px（>0）和自适应（0），固定列优先占位，剩余空间均分给自适应列。
 */
import { inject, computed } from 'vue'
import { widgetDataKey } from '../base/types'
import type { Widget } from '../base/types'
import SchemaRender from '../../components/WidgetRenderer/SchemaRender.vue'
import styles from './style.module.scss'

const props = defineProps<{ editable?: boolean }>()

const widgetData = inject(widgetDataKey)!

const gutter = computed(() => (widgetData.value.props?.gutter as number) || 0)
const colWidths = computed(() => (widgetData.value.props?.colWidths as number[]) || [0, 0, 0, 0])
const columnCount = computed(() => colWidths.value.length)

function getChildrenByCol(colIndex: number): Widget[] {
  return widgetData.value.children?.filter(
    (c) => (c.colIndex ?? 0) === colIndex,
  ) || []
}

/** 计算列 flex 样式：固定 px 列用 0 0 Xpx，自适应列用 1 1 0 */
function colStyle(idx: number): Record<string, string> {
  const w = colWidths.value[idx] ?? 0
  if (w > 0) {
    return { flex: `0 0 ${w}px` }
  }
  return { flex: '1 1 0' }
}
</script>

<template>
  <div :class="styles.colContainer" :style="{ gap: gutter + 'px' }">
    <div
      v-for="col in columnCount"
      :key="col"
      :class="styles.col"
      :style="colStyle(col - 1)"
    >
      <div :class="styles.colContent">
        <SchemaRender :widgets="getChildrenByCol(col - 1)" />
        <div v-if="props.editable && getChildrenByCol(col - 1).length === 0" :class="styles.colGhost">
          拖入部件
        </div>
      </div>
    </div>
  </div>
</template>
