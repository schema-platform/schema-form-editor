<script setup lang="ts">
import { inject, computed, ref } from 'vue'
import { widgetDataKey } from '../base/types'
import { useExposeWidget } from '../../composables/useExposeWidget'
import styles from './style.module.scss'

interface CheckItem {
  key: string
  label: string
}

const widgetData = inject(widgetDataKey)!
const checked = ref<Record<string, boolean>>({})
const remark = ref('')

useExposeWidget(() => ({
  get checkedItems() { return checked.value },
  get remark() { return remark.value },
}))

const title = computed(() => (widgetData.value.props?.title as string) || '合规检查')
const items = computed<CheckItem[]>(() =>
  (widgetData.value.props?.items as CheckItem[]) ?? [],
)

function toggle(key: string, val: boolean) {
  checked.value = { ...checked.value, [key]: val }
}
</script>

<template>
  <div :class="styles.wrapper">
    <h4 v-if="title" :class="styles.title">{{ title }}</h4>
    <el-checkbox
      v-for="item in items"
      :key="item.key"
      :model-value="checked[item.key] ?? false"
      @update:model-value="(v: boolean) => toggle(item.key, v)"
    >
      {{ item.label }}
    </el-checkbox>
    <el-input v-model="remark" type="textarea" :rows="2" placeholder="备注" :class="styles.remark" />
  </div>
</template>
