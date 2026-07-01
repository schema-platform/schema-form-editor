<script setup lang="ts">
import { inject, computed, ref } from 'vue'
import { widgetDataKey } from '../base/types'
import './FgCascader.module.scss'
import { useWidgetRenderState } from '../../composables/useWidgetRenderState'
import { useExposeWidget } from '../../composables/useExposeWidget'

import { useWidgetControlSize } from '../../composables/useWidgetControlSize'

const widgetData = inject(widgetDataKey)!
const { isDisabled } = useWidgetRenderState()
const { controlStyle: dynamicStyle } = useWidgetControlSize(32)

useExposeWidget((wd) => ({
  get value() { return wd.value.defaultValue },
}))

const cascaderProps = computed(() => ({
  multiple: (widgetData.value.props?.multiple as boolean) || false,
}))

const cascaderRef = ref<{ $el?: HTMLElement }>()

function forwardNativeChange() {
  cascaderRef.value?.$el?.dispatchEvent(new Event('change', { bubbles: true }))
}
</script>

<template>
  <el-cascader
    ref="cascaderRef"
    v-model="widgetData.defaultValue"
    :style="dynamicStyle"
    :options="(widgetData.props?.options as any[]) || []"
    :placeholder="(widgetData.props?.placeholder as string) || '请选择'"
    :disabled="isDisabled"
    :clearable="(widgetData.props?.clearable as boolean) ?? true"
    :show-all-levels="(widgetData.props?.showAllLevels as boolean) ?? true"
    :collapse-tags="(widgetData.props?.collapseTags as boolean) || false"
    :check-strictly="(widgetData.props?.checkStrictly as boolean) || false"
    :props="cascaderProps"
    @change="forwardNativeChange"
  />
</template>

