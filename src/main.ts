import 'element-plus/dist/index.css'
import '@schema-platform/platform-shared/styles/theme.scss'
import '@schema-platform/platform-shared/styles/css-variables.scss'
import '@/styles/variables.scss'

import { createApp, type App } from 'vue'
import { createPinia } from 'pinia'
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper'
import { setupElementPlus } from '@schema-platform/platform-shared/config/element'
import { initQiankunProps, initQiankunShellProps } from '@schema-platform/platform-shared/qiankun'
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

renderWithQiankun({
  bootstrap() {
    editorLog.lifecycle('bootstrap')
  },
  mount(props) {
    editorLog.lifecycle('mount start')

    document.getElementById('loading')?.remove()

    if (typeof props.onGlobalStateChange === 'function' && typeof props.setGlobalState === 'function') {
      initQiankunProps(props as Parameters<typeof initQiankunProps>[0])
    }
    initQiankunShellProps(props)

    const getToken = props.getToken as (() => string) | undefined
    const token = getToken ? getToken() : (props.token as string)
    if (token) localStorage.setItem('sfp_access_token', token)

    const getRouteBase = props.getRouteBase as (() => string) | undefined
    if (getRouteBase) {
      currentRouteBase = getRouteBase()
    }

    render()
    editorLog.lifecycle('mount done')
  },
  unmount() {
    editorLog.lifecycle('unmount')
    if (app) {
      app.unmount()
      app = null
      router = null
    }
  },
})

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render()
}
