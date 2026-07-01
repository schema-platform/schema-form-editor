<script setup lang="ts">
import { inject, computed } from 'vue'
import { widgetDataKey } from '../base/types'
import styles from './style.module.scss'

const props = defineProps<{ editable?: boolean }>()

const widgetData = inject(widgetDataKey)!
const hasChildren = computed(() => (widgetData.value.children?.length ?? 0) > 0)
const showHeader = computed(() => widgetData.value.props?.showHeader !== false)
const showSearch = computed(() => widgetData.value.props?.showSearch !== false)
</script>
<template>
  <div :class="styles.container">
    <div v-if="showHeader" :class="styles.header">{{ (widgetData.props?.title as string) || '树形布局' }}</div>
    <div v-if="showSearch" :class="styles.search">
      <el-input placeholder="搜索" size="small" />
    </div>
    <div :class="styles.body">
      <slot />
      <div v-if="props.editable && !hasChildren" :class="styles.placeholder">拖入部件</div>
    </div>
  </div>
</template>
