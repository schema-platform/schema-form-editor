<script setup lang="ts">
import { inject, computed, ref } from 'vue'
import { widgetDataKey } from '../base/types'
import './FgNumber.module.scss'
import { useWidgetRenderState } from '../../composables/useWidgetRenderState'
import { useExposeWidget } from '../../composables/useExposeWidget'

import { useWidgetControlSize } from '../../composables/useWidgetControlSize'

const widgetData = inject(widgetDataKey)!
const { isDisabled } = useWidgetRenderState()
const { widgetHeight, controlStyle } = useWidgetControlSize(32)

useExposeWidget((wd) => ({
  get value() { return wd.value.defaultValue },
}))

const dynamicStyle = computed(() => ({
  ...controlStyle.value,
  '--number-btn-height': `${Math.floor(widgetHeight.value / 2)}px`,
}))

const numberRef = ref<{ $el?: HTMLElement }>()

function forwardNativeChange() {
  numberRef.value?.$el?.dispatchEvent(new Event('change', { bubbles: true }))
}
</script>

<template>
  <el-input-number
    ref="numberRef"
    v-model="widgetData.defaultValue as number"
    :style="dynamicStyle"
    :placeholder="(widgetData.props?.placeholder as string) || '请输入数字'"
    :disabled="isDisabled"
    :min="(widgetData.props?.min as number) || undefined"
    :max="(widgetData.props?.max as number) || undefined"
    :step="(widgetData.props?.step as number) ?? 1"
    :precision="(widgetData.props?.precision as number) || undefined"
    controls-position="right"
    @change="forwardNativeChange"
  />
</template>

