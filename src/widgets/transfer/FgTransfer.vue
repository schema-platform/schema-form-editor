<script setup lang="ts">
import { inject, computed, ref } from 'vue'
import { widgetDataKey } from '../base/types'
import './FgTransfer.module.scss'
import { useExposeWidget } from '../../composables/useExposeWidget'
import { useWidgetControlSize } from '../../composables/useWidgetControlSize'

const widgetData = inject(widgetDataKey)!
const { widgetWidth, controlStyle } = useWidgetControlSize(300, 700)
const value = ref<Array<string | number>>([])
useExposeWidget(() => ({
  get value() { return value.value },
}))
const dynamicStyle = computed(() => ({
  fontSize: controlStyle.value.fontSize,
  color: controlStyle.value.color,
}))
const titles = computed(() => [
  (widgetData.value.props?.leftTitle as string) || '待选',
  (widgetData.value.props?.rightTitle as string) || '已选',
])

/** 根据解析宽度计算每个面板宽度：(总宽 - 按钮区) / 2 */
const panelWidth = computed(() => {
  const totalW = widgetWidth.value
  const btnArea = 124
  return Math.max(0, (totalW - btnArea) / 2)
})

const transferStyle = computed(() => ({
  ...dynamicStyle.value,
  '--transfer-panel-width': `${panelWidth.value}px`,
}))
</script>
<template>
  <el-transfer
    v-model="value"
    :data="[]"
    :titles="titles"
    :filterable="widgetData.props?.filterable !== false"
    :style="transferStyle"
  />
</template>

