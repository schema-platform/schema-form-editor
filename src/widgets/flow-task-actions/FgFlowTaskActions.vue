<script setup lang="ts">
import { inject, computed, ref, onMounted, watch, type ComputedRef, type Ref } from 'vue'
import { ElMessage } from 'element-plus'
import { widgetDataKey } from '../base/types'
import { useExposeWidget } from '../../composables/useExposeWidget'
import {
  fetchFlowTask,
  fetchMyPendingTaskForInstance,
  claimFlowTask,
  completeFlowTask,
  rejectFlowTaskToNode,
  delegateFlowTask,
  fetchRejectTargets,
  fetchApprovalSuggestion,
  type ApprovalSuggestion,
  type FlowTaskData,
} from '@/api/flowApi'
import { WIDGET_SURFACE_KEY, type WidgetSurface } from '../base/widgetMock'
import styles from './style.module.scss'

const widgetData = inject(widgetDataKey)!
const variablesContext = inject<ComputedRef<Record<string, unknown>>>(
  'variablesContext',
  computed(() => ({})),
)
const exposedContext = inject<Ref<Record<string, Record<string, unknown>>>>(
  'exposedContext',
  ref({}),
)
const surface = inject(WIDGET_SURFACE_KEY, 'runtime' as WidgetSurface)

const task = ref<FlowTaskData | null>(null)
const loading = ref(false)
const acting = ref(false)
const aiSuggestion = ref<ApprovalSuggestion | null>(null)
const showReject = ref(false)
const showDelegate = ref(false)
const rejectTarget = ref('')
const rejectTargets = ref<Array<{ nodeId: string; nodeName: string }>>([])
const delegateUserId = ref('')

useExposeWidget(() => ({
  get taskId() { return task.value?.id ?? '' },
  get loading() { return acting.value },
}))

const title = computed(() => (widgetData.value.props?.title as string) || '审批操作')
const canAct = computed(() => task.value && ['pending', 'claimed'].includes(task.value.status))

function readComment(): string {
  const commentWidgetId = widgetData.value.props?.commentWidgetId as string
  if (!commentWidgetId) return ''
  const exposed = exposedContext.value[commentWidgetId]
  const val = exposed?.value ?? exposed?.defaultValue
  return val != null ? String(val) : ''
}

function resolveTaskId(): string {
  const varName = (widgetData.value.props?.taskIdVariable as string) || 'taskId'
  const val = variablesContext.value[varName]
  return val != null ? String(val) : ''
}

function resolveInstanceId(): string {
  const varName = (widgetData.value.props?.instanceIdVariable as string) || 'flowInstanceId'
  const val = variablesContext.value[varName]
  return val != null ? String(val) : ''
}

async function loadTask() {
  if (surface === 'editor') return

  const taskId = resolveTaskId()
  const instanceId = resolveInstanceId()
  if (!taskId && !instanceId) return

  loading.value = true
  try {
    if (taskId) {
      task.value = await fetchFlowTask(taskId)
    } else if (instanceId) {
      task.value = await fetchMyPendingTaskForInstance(instanceId)
    }

    if (task.value && widgetData.value.props?.showAiSuggestion !== false) {
      aiSuggestion.value = await fetchApprovalSuggestion({
        taskId: task.value.id,
        formData: task.value.formData,
      })
    }

    if (task.value) {
      rejectTargets.value = await fetchRejectTargets(task.value.id)
      if (rejectTargets.value.length > 0) {
        rejectTarget.value = rejectTargets.value[0].nodeId
      }
    }
  } catch (err) {
    console.error('[FgFlowTaskActions] load failed:', err)
  } finally {
    loading.value = false
  }
}

async function handleApprove() {
  if (!task.value) return
  acting.value = true
  try {
    await completeFlowTask(task.value.id, {
      outcome: 'approve',
      comment: readComment(),
      formData: task.value.formData,
    })
    ElMessage.success('已通过')
    await loadTask()
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : '操作失败')
  } finally {
    acting.value = false
  }
}

async function handleReject() {
  if (!task.value || !rejectTarget.value) return
  acting.value = true
  try {
    await rejectFlowTaskToNode(task.value.id, {
      targetNodeId: rejectTarget.value,
      comment: readComment(),
    })
    showReject.value = false
    ElMessage.success('已驳回')
    await loadTask()
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : '驳回失败')
  } finally {
    acting.value = false
  }
}

async function handleClaim() {
  if (!task.value) return
  acting.value = true
  try {
    await claimFlowTask(task.value.id)
    ElMessage.success('已认领')
    await loadTask()
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : '认领失败')
  } finally {
    acting.value = false
  }
}

async function handleDelegate() {
  if (!task.value || !delegateUserId.value.trim()) return
  acting.value = true
  try {
    await delegateFlowTask(task.value.id, {
      targetUserId: delegateUserId.value.trim(),
      comment: readComment(),
    })
    showDelegate.value = false
    delegateUserId.value = ''
    ElMessage.success('已委派')
    await loadTask()
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : '委派失败')
  } finally {
    acting.value = false
  }
}

function applySuggestion() {
  if (!aiSuggestion.value) return
  const commentWidgetId = widgetData.value.props?.commentWidgetId as string
  if (!commentWidgetId) return
  const exposed = exposedContext.value[commentWidgetId]
  if (exposed && 'defaultValue' in exposed) {
    exposed.defaultValue = aiSuggestion.value.suggestion
  }
}

onMounted(loadTask)
watch(variablesContext, loadTask, { deep: true })
</script>

<template>
  <div :class="styles.wrapper">
    <h4 v-if="title" :class="styles.title">{{ title }}</h4>

    <div v-if="surface === 'editor'" :class="styles.preview">
      运行时根据 taskId / flowInstanceId 加载待办并展示操作按钮
    </div>

    <template v-else>
      <div v-if="loading" :class="styles.loading">加载任务...</div>
      <div v-else-if="!task" :class="styles.empty">当前无待办任务</div>
      <template v-else>
        <div v-if="aiSuggestion" :class="styles.suggestion">
          <el-alert
            :title="aiSuggestion.suggestion"
            :description="aiSuggestion.reasoning"
            type="info"
            show-icon
            :closable="false"
          />
          <el-button size="small" type="primary" link @click="applySuggestion">采纳建议</el-button>
        </div>

        <div v-if="canAct" :class="styles.actions">
          <el-button type="success" :loading="acting" @click="handleApprove">通过</el-button>
          <el-button type="danger" :loading="acting" @click="showReject = true">驳回</el-button>
          <el-button v-if="task.status === 'pending'" :loading="acting" @click="handleClaim">认领</el-button>
          <el-button :loading="acting" @click="showDelegate = true">委派</el-button>
        </div>
        <div v-else :class="styles.done">任务已处理或无操作权限</div>
      </template>
    </template>

    <el-dialog v-model="showReject" title="驳回" width="420px">
      <el-form label-width="80px">
        <el-form-item label="驳回到">
          <el-select v-model="rejectTarget" placeholder="选择节点">
            <el-option
              v-for="t in rejectTargets"
              :key="t.nodeId"
              :label="t.nodeName"
              :value="t.nodeId"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showReject = false">取消</el-button>
        <el-button type="danger" :loading="acting" @click="handleReject">确认驳回</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showDelegate" title="委派" width="420px">
      <el-form label-width="80px">
        <el-form-item label="委派给">
          <el-input v-model="delegateUserId" placeholder="用户 ID" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDelegate = false">取消</el-button>
        <el-button type="primary" :loading="acting" @click="handleDelegate">确认委派</el-button>
      </template>
    </el-dialog>
  </div>
</template>
