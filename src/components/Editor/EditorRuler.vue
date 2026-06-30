<script setup lang="ts">
/**
 * EditorRuler — 画布标尺组件
 *
 * 使用 canvas 绘制水平和垂直标尺，与画布背景点对齐。
 * 固定在滚动容器边缘，不随内容滚动。
 */
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import { useBoardStore } from '../../stores/board'

const props = defineProps<{
  /** 滚动容器 */
  scrollContainer?: HTMLElement | null
}>()

const boardStore = useBoardStore()

const horizontalCanvas = ref<HTMLCanvasElement>()
const verticalCanvas = ref<HTMLCanvasElement>()
const cornerCanvas = ref<HTMLCanvasElement>()

const RULER_SIZE = 24
const DOT_INTERVAL = 20
const LABEL_INTERVAL = 100

let animFrameId: number | null = null

/** 获取缩放比例 */
const zoom = computed(() => boardStore.canvas.zoom / 100)

/** 绘制水平标尺 */
function drawHorizontalRuler(scrollLeft: number) {
  const canvas = horizontalCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  const width = canvas.clientWidth
  const height = RULER_SIZE

  canvas.width = width * dpr
  canvas.height = height * dpr
  ctx.scale(dpr, dpr)

  // 背景
  ctx.fillStyle = '#f8f9fa'
  ctx.fillRect(0, 0, width, height)

  // 底部边框
  ctx.strokeStyle = '#dee2e6'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, height - 0.5)
  ctx.lineTo(width, height - 0.5)
  ctx.stroke()

  const scaledInterval = DOT_INTERVAL * zoom.value

  // 计算起始位置
  const startPx = scrollLeft
  const startTick = Math.floor(startPx / scaledInterval) * scaledInterval

  ctx.fillStyle = '#6c757d'
  ctx.strokeStyle = '#6c757d'
  ctx.font = '10px -apple-system, BlinkMacSystemFont, sans-serif'
  ctx.textAlign = 'center'

  for (let px = startTick; px < startPx + width + scaledInterval; px += scaledInterval) {
    const screenX = px - startPx
    const value = Math.round(px / zoom.value)

    const isMajor = value % LABEL_INTERVAL === 0
    const tickHeight = isMajor ? 12 : 6

    ctx.beginPath()
    ctx.moveTo(screenX + 0.5, height - tickHeight)
    ctx.lineTo(screenX + 0.5, height)
    ctx.lineWidth = isMajor ? 1 : 0.5
    ctx.stroke()

    if (isMajor) {
      ctx.fillText(String(value), screenX, height - 14)
    }
  }
}

/** 绘制垂直标尺 */
function drawVerticalRuler(scrollTop: number) {
  const canvas = verticalCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  const width = RULER_SIZE
  const height = canvas.clientHeight

  canvas.width = width * dpr
  canvas.height = height * dpr
  ctx.scale(dpr, dpr)

  // 背景
  ctx.fillStyle = '#f8f9fa'
  ctx.fillRect(0, 0, width, height)

  // 右侧边框
  ctx.strokeStyle = '#dee2e6'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(width - 0.5, 0)
  ctx.lineTo(width - 0.5, height)
  ctx.stroke()

  const scaledInterval = DOT_INTERVAL * zoom.value

  // 计算起始位置
  const startPx = scrollTop
  const startTick = Math.floor(startPx / scaledInterval) * scaledInterval

  ctx.fillStyle = '#6c757d'
  ctx.strokeStyle = '#6c757d'
  ctx.font = '10px -apple-system, BlinkMacSystemFont, sans-serif'

  for (let px = startTick; px < startPx + height + scaledInterval; px += scaledInterval) {
    const screenY = px - startPx
    const value = Math.round(px / zoom.value)

    const isMajor = value % LABEL_INTERVAL === 0
    const tickWidth = isMajor ? 12 : 6

    ctx.beginPath()
    ctx.moveTo(width - tickWidth, screenY + 0.5)
    ctx.lineTo(width, screenY + 0.5)
    ctx.lineWidth = isMajor ? 1 : 0.5
    ctx.stroke()

    if (isMajor) {
      ctx.save()
      ctx.translate(width - 14, screenY + 0.5)
      ctx.rotate(-Math.PI / 2)
      ctx.textAlign = 'center'
      ctx.fillText(String(value), 0, 0)
      ctx.restore()
    }
  }
}

/** 绘制左上角 */
function drawCorner() {
  const canvas = cornerCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  const size = RULER_SIZE

  canvas.width = size * dpr
  canvas.height = size * dpr
  ctx.scale(dpr, dpr)

  // 背景
  ctx.fillStyle = '#f8f9fa'
  ctx.fillRect(0, 0, size, size)

  // 边框
  ctx.strokeStyle = '#dee2e6'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, size - 0.5)
  ctx.lineTo(size, size - 0.5)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(size - 0.5, 0)
  ctx.lineTo(size - 0.5, size)
  ctx.stroke()

  // 对角线
  ctx.strokeStyle = '#ced4da'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(size, size)
  ctx.stroke()
}

/** 同步滚动位置 */
function syncScroll() {
  if (!props.scrollContainer) return

  const { scrollLeft, scrollTop } = props.scrollContainer
  drawHorizontalRuler(scrollLeft)
  drawVerticalRuler(scrollTop)
}

/** 处理滚动事件 */
function handleScroll() {
  if (animFrameId) cancelAnimationFrame(animFrameId)
  animFrameId = requestAnimationFrame(syncScroll)
}

/** 监听容器变化 */
let resizeObserver: ResizeObserver | null = null

onMounted(async () => {
  await nextTick()
  drawCorner()
  syncScroll()

  if (props.scrollContainer) {
    props.scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
    resizeObserver = new ResizeObserver(() => {
      syncScroll()
    })
    resizeObserver.observe(props.scrollContainer)
  }
})

onUnmounted(() => {
  if (animFrameId) cancelAnimationFrame(animFrameId)
  if (props.scrollContainer) {
    props.scrollContainer.removeEventListener('scroll', handleScroll)
  }
  resizeObserver?.disconnect()
})

// 监听滚动容器变化
watch(() => props.scrollContainer, async (newContainer, oldContainer) => {
  if (oldContainer) {
    oldContainer.removeEventListener('scroll', handleScroll)
  }
  if (newContainer) {
    newContainer.addEventListener('scroll', handleScroll, { passive: true })
    resizeObserver?.disconnect()
    resizeObserver = new ResizeObserver(() => syncScroll())
    resizeObserver.observe(newContainer)
  }
  await nextTick()
  syncScroll()
})

// 监听缩放变化
watch(zoom, () => {
  drawCorner()
  syncScroll()
})
</script>

<template>
  <div class="editor-ruler">
    <!-- 左上角 -->
    <div class="ruler-corner">
      <canvas ref="cornerCanvas" class="ruler-canvas" />
    </div>

    <!-- 水平标尺 -->
    <div class="ruler-horizontal">
      <canvas ref="horizontalCanvas" class="ruler-canvas" />
    </div>

    <!-- 垂直标尺 -->
    <div class="ruler-vertical">
      <canvas ref="verticalCanvas" class="ruler-canvas" />
    </div>
  </div>
</template>

<style scoped>
.editor-ruler {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 10;
}

.ruler-corner {
  position: absolute;
  top: 0;
  left: 0;
  width: 24px;
  height: 24px;
  pointer-events: auto;
  z-index: 12;
}

.ruler-horizontal {
  position: absolute;
  top: 0;
  left: 24px;
  right: 0;
  height: 24px;
  pointer-events: auto;
  z-index: 11;
}

.ruler-vertical {
  position: absolute;
  top: 24px;
  left: 0;
  bottom: 0;
  width: 24px;
  pointer-events: auto;
  z-index: 11;
}

.ruler-canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
