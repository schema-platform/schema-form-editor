<script setup lang="ts">
import { inject } from 'vue'
import { widgetDataKey } from '../base/types'
import { useExposeWidget } from '../../composables/useExposeWidget'
import { useWidgetLayoutStyle } from '../../composables/useWidgetControlSize'
import styles from './style.module.scss'

const widgetData = inject(widgetDataKey)!
const { layoutStyle: dynamicStyle } = useWidgetLayoutStyle(200)

useExposeWidget((wd) => ({
  get value() { return wd.value.defaultValue },
}))
</script>

<template>
  <div
    :class="styles.richtext"
    :style="dynamicStyle"
  >
    <div :class="styles.toolbar">
      <span>B</span>
      <span>I</span>
      <span>U</span>
    </div>
    <div
      :class="styles.content"
      :contenteditable="!(widgetData.props?.readonly as boolean)"
    >
      {{ (widgetData.props?.placeholder as string) || '请输入内容' }}
    </div>
  </div>
</template>
