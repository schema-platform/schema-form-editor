<script setup lang="ts">
import { inject, computed, ref } from 'vue'
import { widgetDataKey, widgetStyleKey } from '../base/types'
import { useWidgetRenderState } from '../../composables/useWidgetRenderState'
import { useExposeWidget } from '../../composables/useExposeWidget'

const widgetData = inject(widgetDataKey)!
const widgetStyle = inject(widgetStyleKey)!
const { isDisabled } = useWidgetRenderState()

interface RoleItem {
  id: string
  name: string
  description?: string
}

const options = ref<RoleItem[]>([])
const loading = ref(false)

useExposeWidget((wd) => ({
  get value() { return wd.value.defaultValue },
  get label() {
    const val = wd.value.defaultValue
    if (!val) return ''
    if (Array.isArray(val)) {
      return val.map(v => {
        const found = options.value.find(r => r.id === v)
        return found?.name ?? v
      }).join(', ')
    }
    const found = options.value.find(r => r.id === val)
    return found?.name ?? ''
  },
}))

const dynamicStyle = computed(() => ({
  width: '100%',
  height: `${widgetData.value.position?.h ?? 40}px`,
  '--el-component-size': `${widgetData.value.position?.h ?? 40}px`,
  '--el-component-size-small': `${widgetData.value.position?.h ?? 40}px`,
  fontSize: widgetStyle.value?.fontSize as string,
  color: widgetStyle.value?.color as string,
}))

const selectRef = ref<{ $el?: HTMLElement }>()

function forwardNativeChange() {
  selectRef.value?.$el?.dispatchEvent(new Event('change', { bubbles: true }))
}

function getFlowApiBase(): string {
  return (widgetData.value.props?.apiBaseUrl as string)
    || (import.meta.env.VITE_FLOW_API_BASE_URL as string)
    || ''
}

function getToken(): string {
  return localStorage.getItem('token') || ''
}

async function fetchRoles(query: string) {
  loading.value = true
  try {
    const base = getFlowApiBase()
    const params = new URLSearchParams({ q: query || '', page: '1', pageSize: '50' })
    const res = await fetch(`${base}/roles?${params}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
    })
    const json = await res.json()
    if (json.success && json.data) {
      options.value = json.data.items || []
    }
  } catch {
    options.value = []
  } finally {
    loading.value = false
  }
}

async function remoteSearch(query: string) {
  await fetchRoles(query)
}
</script>

<template>
  <el-select
    ref="selectRef"
    v-model="widgetData.defaultValue"
    :style="dynamicStyle"
    :placeholder="(widgetData.props?.placeholder as string) || '请选择审批角色'"
    :disabled="isDisabled"
    :clearable="(widgetData.props?.clearable as boolean) ?? true"
    :multiple="(widgetData.props?.multiple as boolean) || false"
    filterable
    remote
    :remote-method="remoteSearch"
    :loading="loading"
    @change="forwardNativeChange"
  >
    <el-option
      v-for="role in options"
      :key="role.id"
      :label="role.name"
      :value="role.id"
    />
  </el-select>
</template>
