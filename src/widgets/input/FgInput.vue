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

/** el-input 的 change/input 是 Vue 组件事件，不冒泡为原生 DOM 事件。
 *  手动派发原生 change 事件，让 SchemaNode 的 @change 能拦截到。 */
function forwardNativeChange() {
  inputRef.value?.$el?.dispatchEvent(new Event('change', { bubbles: true }))
}
</script>

<template>
  <el-input
    ref="inputRef"
    v-model="widgetData.defaultValue as string"
    :style="dynamicStyle"
    :placeholder="(widgetData.props?.placeholder as string) || '请输入'"
    :disabled="isDisabled"
    :readonly="(widgetData.props?.readonly as boolean) || false"
    :clearable="(widgetData.props?.clearable as boolean) ?? true"
    :maxlength="(widgetData.props?.maxlength as number) || undefined"
    :show-password="(widgetData.props?.showPassword as boolean) || false"
    @change="forwardNativeChange"
    @input="forwardNativeChange"
  />
</template>
