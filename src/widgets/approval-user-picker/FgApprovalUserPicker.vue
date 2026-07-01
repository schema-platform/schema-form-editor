<script setup lang="ts">
import { inject, computed, ref } from 'vue'
import { widgetDataKey } from '../base/types'
import { useWidgetRenderState } from '../../composables/useWidgetRenderState'
import { useExposeWidget } from '../../composables/useExposeWidget'

import { useWidgetControlSize } from '../../composables/useWidgetControlSize'

const widgetData = inject(widgetDataKey)!
const { isDisabled } = useWidgetRenderState()
const { controlStyle: dynamicStyle } = useWidgetControlSize(40)

interface UserItem {
  id: string
  username: string
  displayName: string
  roles: string[]
}

const options = ref<UserItem[]>([])
const loading = ref(false)
const page = ref(1)
const hasMore = ref(true)

useExposeWidget((wd) => ({
  get value() { return wd.value.defaultValue },
  get label() {
    const val = wd.value.defaultValue
    if (!val) return ''
    if (Array.isArray(val)) {
      return val.map(v => {
        const found = options.value.find(u => u.id === v)
        return found?.displayName ?? found?.username ?? v
      }).join(', ')
    }
    const found = options.value.find(u => u.id === val)
    return found?.displayName ?? found?.username ?? ''
  },
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

async function fetchUsers(query: string, reset = false) {
  if (reset) {
    page.value = 1
    options.value = []
    hasMore.value = true
  }
  if (!hasMore.value) return

  loading.value = true
  try {
    const base = getFlowApiBase()
    const params = new URLSearchParams({ q: query || '', page: String(page.value), pageSize: '20' })
    const res = await fetch(`${base}/users?${params}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
    })
    const json = await res.json()
    if (json.success && json.data) {
      const items = json.data.items || []
      if (reset) {
        options.value = items
      } else {
        options.value = [...options.value, ...items]
      }
      hasMore.value = items.length >= 20
    }
  } catch {
    if (reset) options.value = []
  } finally {
    loading.value = false
  }
}

async function remoteSearch(query: string) {
  await fetchUsers(query, true)
}

function loadMore() {
  if (!hasMore.value || loading.value) return
  page.value++
  fetchUsers('', false)
}

function getUserLabel(user: UserItem): string {
  return user.displayName ? `${user.displayName}(${user.username})` : user.username
}
</script>

<template>
  <el-select
    ref="selectRef"
    v-model="widgetData.defaultValue"
    :style="dynamicStyle"
    :placeholder="(widgetData.props?.placeholder as string) || '请选择审批人'"
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
      v-for="user in options"
      :key="user.id"
      :label="getUserLabel(user)"
      :value="user.id"
    />
    <el-option
      v-if="hasMore && options.length > 0"
      :value="'__load_more__'"
      :label="'加载更多...'"
      disabled
      @click="loadMore"
    />
  </el-select>
</template>
