<script setup lang="ts">
import { inject, computed } from 'vue'
import { widgetDataKey, widgetStyleKey } from '../base/types'
const widgetData = inject(widgetDataKey)!
const widgetStyle = inject(widgetStyleKey)!

const dynamicStyle = computed(() => {
  const s: Record<string, string> = {}
  if (widgetStyle.value?.margin) s.margin = widgetStyle.value.margin as string
  if (widgetStyle.value?.padding) s.padding = widgetStyle.value.padding as string
  return s
})
</script>
<template>
  <el-alert
    :title="(widgetData.props?.text as string) || '提示信息'"
    :type="(widgetData.props?.type as 'info' | 'success' | 'warning' | 'error') || 'info'"
    :closable="widgetData.props?.closable !== false"
    :style="dynamicStyle"
  />
</template>
