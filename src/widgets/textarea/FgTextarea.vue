<script setup lang="ts">
import { inject, ref } from 'vue'
import { widgetDataKey } from '../base/types'
import { useWidgetRenderState } from '../../composables/useWidgetRenderState'
import { useExposeWidget } from '../../composables/useExposeWidget'
import { useWidgetControlSize } from '../../composables/useWidgetControlSize'

const widgetData = inject(widgetDataKey)!
const { isDisabled } = useWidgetRenderState()
const { controlStyle: dynamicStyle } = useWidgetControlSize(32)

useExposeWidget((wd) => ({
  get value() { return wd.value.defaultValue },
}))

const inputRef = ref<{ $el?: HTMLElement }>()

function forwardNativeChange() {
  inputRef.value?.$el?.dispatchEvent(new Event('change', { bubbles: true }))
}
</script>

<template>
  <el-input
    ref="inputRef"
    v-model="widgetData.defaultValue as string"
    :style="dynamicStyle"
    type="textarea"
    :placeholder="(widgetData.props?.placeholder as string) || '请输入'"
    :disabled="isDisabled"
    :readonly="(widgetData.props?.readonly as boolean) || false"
    :rows="(widgetData.props?.rows as number) ?? 3"
    :maxlength="(widgetData.props?.maxlength as number) || undefined"
    :show-word-limit="(widgetData.props?.showWordLimit as boolean) || false"
    @change="forwardNativeChange"
    @input="forwardNativeChange"
  />
</template>
