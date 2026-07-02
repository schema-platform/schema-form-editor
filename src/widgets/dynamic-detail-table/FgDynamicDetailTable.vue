<script setup lang="ts">
import { inject, computed, ref, watch, onMounted } from 'vue'
import { widgetDataKey } from '../base/types'
import { useExposeWidget } from '../../composables/useExposeWidget'
import type { DetailColumn } from './config'
import { WIDGET_SURFACE_KEY, type WidgetSurface } from '../base/widgetMock'
import { dynamicDetailTableMock } from './mock'
import styles from './style.module.scss'

const widgetData = inject(widgetDataKey)!
const surface = inject(WIDGET_SURFACE_KEY, 'runtime' as WidgetSurface)

const rows = ref<Record<string, unknown>[]>([])

function sumAmountColumn(): number {
  const amountCol = columns.value.find((c) => c.prop === 'amount' || c.type === 'number')
  if (!amountCol) return 0
  return rows.value.reduce((sum, row) => sum + (Number(row[amountCol.prop]) || 0), 0)
}

function syncFieldValue() {
  widgetData.value.defaultValue = rows.value
  const total = sumAmountColumn()
  if (total > 0 || rows.value.length > 0) {
    widgetData.value.props = {
      ...widgetData.value.props,
      staticData: rows.value,
      computedTotalAmount: total,
    }
  }
}

useExposeWidget(() => ({
  get rows() { return rows.value },
  set rows(v: Record<string, unknown>[]) { rows.value = v; syncFieldValue() },
  get totalAmount() { return sumAmountColumn() },
}))

const title = computed(() => (widgetData.value.props?.title as string) || '费用明细')
const columns = computed<DetailColumn[]>(() =>
  (widgetData.value.props?.columns as DetailColumn[]) ?? dynamicDetailTableMock.defaultProps.columns,
)

function addRow() {
  const row: Record<string, unknown> = {}
  for (const col of columns.value) {
    row[col.prop] = col.type === 'number' ? 0 : ''
  }
  rows.value = [...rows.value, row]
}

function removeRow(index: number) {
  rows.value = rows.value.filter((_, i) => i !== index)
}

onMounted(() => {
  const staticData = widgetData.value.props?.staticData as Record<string, unknown>[] | undefined
  if (staticData?.length) {
    rows.value = staticData.map((r) => ({ ...r }))
  } else if (surface === 'editor') {
    rows.value = dynamicDetailTableMock.staticData.rows.map((r) => ({ ...r }))
  } else {
    addRow()
  }
})

watch(rows, () => {
  syncFieldValue()
}, { deep: true })
</script>

<template>
  <div :class="styles.wrapper">
    <div :class="styles.header">
      <h4 v-if="title" :class="styles.title">{{ title }}</h4>
      <el-button type="primary" size="small" @click="addRow">添加行</el-button>
    </div>
    <el-table :data="rows" border size="small" :class="styles.table">
      <el-table-column
        v-for="col in columns"
        :key="col.prop"
        :label="col.label"
        :width="col.width"
      >
        <template #default="{ row }">
          <el-input-number
            v-if="col.type === 'number'"
            v-model="row[col.prop]"
            :min="0"
            size="small"
            controls-position="right"
          />
          <el-input v-else v-model="row[col.prop]" size="small" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="80" fixed="right">
        <template #default="{ $index }">
          <el-button link type="danger" size="small" @click="removeRow($index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
