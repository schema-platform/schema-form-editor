<script setup lang="ts">
import { inject, computed, ref, onMounted } from 'vue'
import { widgetDataKey } from '../base/types'
import { useExposeWidget } from '../../composables/useExposeWidget'
import { fetchPublishedNotices, type NoticeItem } from '@/api/noticesApi'
import { WIDGET_SURFACE_KEY, type WidgetSurface } from '../base/widgetMock'
import { notificationMock } from './mock'
import styles from './style.module.scss'

const widgetData = inject(widgetDataKey)!
const surface = inject(WIDGET_SURFACE_KEY, 'runtime' as WidgetSurface)

const items = ref<NoticeItem[]>([])
const loading = ref(false)

useExposeWidget(() => ({ get items() { return items.value } }))

const title = computed(() => (widgetData.value.props?.title as string) || '最新公告')
const pageSize = computed(() => Number(widgetData.value.props?.pageSize ?? 5))

function formatTime(iso?: string): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('zh-CN')
}

async function loadNotices() {
  loading.value = true
  try {
    const res = await fetchPublishedNotices(1, pageSize.value)
    items.value = res.items
  } catch (err) {
    console.error('[FgNotification] load failed:', err)
    if (surface === 'editor') {
      items.value = notificationMock.staticData.items as NoticeItem[]
    } else {
      items.value = []
    }
  } finally {
    loading.value = false
  }
}

onMounted(loadNotices)
</script>

<template>
  <div :class="styles.wrapper">
    <h4 v-if="title" :class="styles.title">{{ title }}</h4>
    <div v-if="loading" :class="styles.loading">加载中...</div>
    <ul v-else-if="items.length" :class="styles.list">
      <li v-for="item in items" :key="item.id" :class="styles.item">
        <div :class="styles.itemTitle">{{ item.title }}</div>
        <div :class="styles.itemContent">{{ item.content }}</div>
        <div :class="styles.itemTime">{{ formatTime(item.publishAt ?? item.createdAt) }}</div>
      </li>
    </ul>
    <div v-else :class="styles.empty">暂无公告</div>
  </div>
</template>
