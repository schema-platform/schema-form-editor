<script setup lang="ts">
import { inject, computed, ref, onMounted } from 'vue'
import { widgetDataKey } from '../base/types'
import { useExposeWidget } from '../../composables/useExposeWidget'
import { WIDGET_SURFACE_KEY, type WidgetSurface } from '../base/widgetMock'
import { calendarMock } from './mock'
import styles from './style.module.scss'

interface CalendarEvent {
  date: string
  title: string
  type?: string
}

const widgetData = inject(widgetDataKey)!
const surface = inject(WIDGET_SURFACE_KEY, 'runtime' as WidgetSurface)

const events = ref<CalendarEvent[]>([])
const selectedDate = ref(new Date())

useExposeWidget(() => ({ get events() { return events.value } }))

const title = computed(() => (widgetData.value.props?.title as string) || '日程日历')

const eventsByDate = computed(() => {
  const map = new Map<string, CalendarEvent[]>()
  for (const ev of events.value) {
    const list = map.get(ev.date) ?? []
    list.push(ev)
    map.set(ev.date, list)
  }
  return map
})

function dayEvents(date: Date): CalendarEvent[] {
  const key = date.toISOString().slice(0, 10)
  return eventsByDate.value.get(key) ?? []
}

onMounted(() => {
  const staticData = widgetData.value.props?.staticData as CalendarEvent[] | undefined
  if (staticData?.length) {
    events.value = staticData
  } else if (surface === 'editor') {
    events.value = calendarMock.staticData.events
  }
})
</script>

<template>
  <div :class="styles.wrapper">
    <h4 v-if="title" :class="styles.title">{{ title }}</h4>
    <el-calendar v-model="selectedDate">
      <template #date-cell="{ data }">
        <div :class="styles.cell">
          <span>{{ data.day.split('-').slice(2).join('-') }}</span>
          <ul v-if="dayEvents(data.date).length" :class="styles.dots">
            <li v-for="(ev, i) in dayEvents(data.date).slice(0, 2)" :key="i" :title="ev.title">•</li>
          </ul>
        </div>
      </template>
    </el-calendar>
  </div>
</template>
