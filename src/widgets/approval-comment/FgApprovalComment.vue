<script setup lang="ts">
import { inject } from 'vue'
import { widgetDataKey } from '../base/types'
import { useWidgetRenderState } from '../../composables/useWidgetRenderState'
import { useExposeWidget } from '../../composables/useExposeWidget'

import { useWidgetControlSize } from '../../composables/useWidgetControlSize'

const widgetData = inject(widgetDataKey)!
const { isDisabled } = useWidgetRenderState()
const { controlStyle: dynamicStyle } = useWidgetControlSize(120)

useExposeWidget((wd) => ({
  get value() { return wd.value.defaultValue },
}))
</script>

<template>
  <el-input
    v-model="widgetData.defaultValue"
    type="textarea"
    :style="dynamicStyle"
    :placeholder="(widgetData.props?.placeholder as string) || '请输入审批意见'"
    :disabled="isDisabled"
    :rows="(widgetData.props?.rows as number) || 4"
    :maxlength="(widgetData.props?.maxlength as number) || 1000"
    :show-word-limit="(widgetData.props?.showWordLimit as boolean) ?? true"
    :clearable="(widgetData.props?.clearable as boolean) ?? true"
  />
</template>
