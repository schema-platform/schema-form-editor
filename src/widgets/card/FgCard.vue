<script setup lang="ts">
/**
 * FgCard — 卡片容器 Widget
 *
 * 职责：
 * - el-card 包裹，提供卡片视觉容器
 * - 渲染标题和子组件
 */
import { inject, computed } from 'vue'
import { widgetDataKey, widgetStyleKey } from '../base/types'
import styles from './style.module.scss'

const widgetData = inject(widgetDataKey)!
const widgetStyle = inject(widgetStyleKey)!

const dynamicStyle = computed(() => {
  const s: Record<string, string> = {}
  if (widgetStyle.value?.margin) s.margin = widgetStyle.value.margin as string
  if (widgetStyle.value?.padding) s.padding = widgetStyle.value.padding as string
  if (widgetStyle.value?.backgroundColor) s.backgroundColor = widgetStyle.value.backgroundColor as string
  if (widgetStyle.value?.borderRadius) s.borderRadius = widgetStyle.value.borderRadius as string
  return s
})
</script>

<template>
  <el-card
    :class="styles.cardContainer"
    :style="dynamicStyle"
    :shadow="(widgetData.props?.shadow as 'always' | 'hover' | 'never') || 'hover'"
    :header="widgetData.props?.showHeader !== false ? ((widgetData.props?.title as string) || '卡片标题') : undefined"
  >
    <div :class="styles.body">
      <slot />
    </div>
  </el-card>
</template>
