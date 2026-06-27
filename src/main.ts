import 'element-plus/dist/index.css'
import '@schema-platform/platform-shared/styles/theme.scss'
import '@schema-platform/platform-shared/styles/css-variables.scss'
import '@/styles/variables.scss'

import { createApp, type App } from 'vue'
import { createPinia } from 'pinia'
import { setupElementPlus } from '@schema-platform/platform-shared/config/element'
import AppRoot from './App.vue'
import { createEditorRouter } from './router'
import { configureApiClient } from './utils/apiClient'
import { registerAllWidgets } from './widgets'
import { permissionDirective } from './directives/permission'

registerAllWidgets()

let app: App | null = null
let router: ReturnType<typeof createEditorRouter> | null = null

let currentRouteBase = '/instances'

function render(container?: HTMLElement) {
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

  const mountEl = container?.querySelector('#app') || container || document.getElementById('app')
  if (mountEl) {
    app.mount(mountEl)
  }
}

// ── Qiankun 生命周期 ──

export async function bootstrap() {}

export async function mount(props: { container?: HTMLElement; initialPath?: string; getRouteBase?: () => string }) {
  const token = (props as Record<string, unknown>).token as string | undefined
  if (token) localStorage.setItem('sfp_access_token', token)

  // 从主应用 props 获取 routeBase，解析出子应用路由路径
  if (props.getRouteBase) {
    const routeBase = props.getRouteBase()
    const browserPath = window.location.pathname
    const subPath = browserPath.slice(routeBase.length) || '/instances'
    const search = window.location.search
    currentRouteBase = subPath + search
  }

  render(props.container)
}

export async function unmount() {
  if (app) {
    app.unmount()
    app = null
    router = null
  }
}

// 注册到 vite-plugin-qiankun 全局生命周期
const g = window as unknown as Record<string, unknown>
if (!g.moudleQiankunAppLifeCycles) g.moudleQiankunAppLifeCycles = {}
;(g.moudleQiankunAppLifeCycles as Record<string, unknown>)['editor'] = { bootstrap, mount, unmount }

// 独立模式：延迟检查，让 qiankun 先设置 __POWERED_BY_QIANKUN__
queueMicrotask(() => {
  if (!window.__POWERED_BY_QIANKUN__) {
    render()
  }
})
