<script setup lang="ts">
import { inject, computed } from 'vue'
import { widgetDataKey, widgetStyleKey } from '../base/types'
import { useWidgetRenderState } from '../../composables/useWidgetRenderState'
import { useExposeWidget } from '../../composables/useExposeWidget'

const widgetData = inject(widgetDataKey)!
const widgetStyle = inject(widgetStyleKey)!
const { isDisabled } = useWidgetRenderState()

useExposeWidget((wd) => ({
  get value() { return wd.value.defaultValue },
}))

const dynamicStyle = computed(() => ({
  width: '100%',
  fontSize: widgetStyle.value?.fontSize as string,
  color: widgetStyle.value?.color as string,
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
