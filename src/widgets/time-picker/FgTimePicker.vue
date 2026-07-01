<script setup lang="ts">
import { inject, computed } from 'vue'
import { widgetDataKey } from '../base/types'
import './FgTimePicker.module.scss'
import { useWidgetRenderState } from '../../composables/useWidgetRenderState'
import { useExposeWidget } from '../../composables/useExposeWidget'

import { useWidgetControlSize } from '../../composables/useWidgetControlSize'

const widgetData = inject(widgetDataKey)!
const { isDisabled } = useWidgetRenderState()
const { controlStyle: dynamicStyle } = useWidgetControlSize(32)

useExposeWidget((wd) => ({
  get value() { return wd.value.defaultValue },
}))
</script>

<template>
  <el-time-picker
    v-model="widgetData.defaultValue as any"
    :style="dynamicStyle"
    :placeholder="(widgetData.props?.placeholder as string) || '请选择时间'"
    :disabled="isDisabled"
    :readonly="(widgetData.props?.readonly as boolean) || false"
    :clearable="(widgetData.props?.clearable as boolean) ?? true"
    :is-range="(widgetData.props?.isRange as boolean) || false"
    :format="(widgetData.props?.format as string) || 'HH:mm:ss'"
    :arrow-control="(widgetData.props?.arrowControl as boolean) || false"
  />
</template>

