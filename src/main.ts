import 'element-plus/dist/index.css'
import '@schema-platform/platform-shared/styles/theme.scss'
import '@schema-platform/platform-shared/styles/css-variables.scss'
import '@/styles/variables.scss'

import { createApp, type App } from 'vue'
import { createPinia } from 'pinia'
import { setupElementPlus } from '@schema-platform/platform-shared/config/element'
import { initQiankunProps } from '@schema-platform/platform-shared/qiankun'
import { editorLog } from '@schema-platform/platform-shared/utils/logger'
import AppRoot from './App.vue'
import { createEditorRouter } from './router'
import { configureApiClient } from './utils/apiClient'
import { registerAllWidgets } from './widgets'
import { permissionDirective } from './directives/permission'

let app: App | null = null
let router: ReturnType<typeof createEditorRouter> | null = null

let currentRouteBase: string | undefined
let widgetsRegistered = false

function render() {
  if (!widgetsRegistered) {
    registerAllWidgets()
    widgetsRegistered = true
  }

  router = createEditorRouter(currentRouteBase)
  app = createApp(AppRoot)
  app.use(createPinia())
  app.use(router)
  app.config.errorHandler = (err, _instance, info) => {
    console.error('[GlobalError]', err, info)
  }
  app.directive('permission', permissionDirective)
  setupElementPlus(app)
  configureApiClient({
    baseUrl: import.meta.env.VITE_API_BASE_URL as string | undefined,
    getToken: () => localStorage.getItem('sfp_access_token') || '',
    useMock: import.meta.env.VITE_USE_MOCK === 'true',
  })

  const mountEl = document.getElementById('editor-app')
  if (!mountEl) throw new Error('[editor] #editor-app not found')
  app.mount(mountEl)
}

// ── Qiankun 生命周期 ──

export async function bootstrap() {
  editorLog.lifecycle('bootstrap')
}

export async function mount(props: Record<string, unknown>) {
  editorLog.lifecycle('mount start')

  // 二次 mount 时先清理旧实例（防止 unmount 未正常执行导致残留）
  if (app) {
    try { app.unmount() } catch { /* ignore */ }
    app = null
    router = null
  }

  document.getElementById('loading')?.remove()

  // 注入 shell props → globalState 事件通道
  if (typeof props.onGlobalStateChange === 'function' && typeof props.setGlobalState === 'function') {
    initQiankunProps(props as any)
  }

  // token
  const getToken = props.getToken as (() => string) | undefined
  const token = getToken ? getToken() : (props.token as string)
  if (token) localStorage.setItem('sfp_access_token', token)

  // routeBase：shell 下发优先，否则用环境变量
  const getRouteBase = props.getRouteBase as (() => string) | undefined
  if (getRouteBase) {
    currentRouteBase = getRouteBase()
  }

  render()

  const emitEvent = props.emitEvent as ((event: string, data: unknown) => void) | undefined
  emitEvent?.('shell:sub-app-mounted', { app: 'editor' })
  editorLog.lifecycle('mount done')
}

export async function unmount() {
  editorLog.lifecycle('unmount')
  if (app) {
    app.unmount()
    app = null
    router = null
  }
}

// 独立模式：仅开发环境且非 qiankun 子应用时渲染
if (import.meta.env.DEV && !window.__POWERED_BY_QIANKUN__) {
  render()
}
