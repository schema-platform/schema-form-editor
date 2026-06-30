<script setup lang="ts">
import { inject } from 'vue'
import { widgetDataKey } from '../base/types'
import styles from './style.module.scss'
const widgetData = inject(widgetDataKey)!
</script>
<template>
  <div :class="styles.container">
    <div :class="styles.header">{{ (widgetData.props?.title as string) || '树形布局' }}</div>
    <div v-if="widgetData.props?.showSearch" :class="styles.search">
      <el-input placeholder="搜索" size="small" />
    </div>
    <div :class="styles.body">
      <slot />
      <div v-if="!$slots.default" :class="styles.placeholder">树形内容区域</div>
    </div>
  </div>
</template>