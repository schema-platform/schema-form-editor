import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import EnhancedDialog from '@/components/EnhancedDialog.vue'

// Stub TDesign components used by EnhancedDialog
const tDialogStub = {
  template: `<div v-if="visible" class="t-dialog" :class="{ 'is-fullscreen': $attrs.class?.includes('is-fullscreen') }">
    <div class="t-dialog__ctx" :class="{ 'is-fullscreen': $attrs.class?.includes('is-fullscreen') }">
      <div class="t-dialog__header"><slot name="header" /></div>
      <div class="t-dialog__body"><slot /></div>
      <div class="t-dialog__footer"><slot name="footer" /></div>
    </div>
  </div>`,
  props: ['visible', 'header', 'width', 'destroyOnClose', 'destroyOnClose:close', 'closeOnOverlayClick', 'closeBtn', 'attach', 'style'],
  emits: ['close'],
}

const tPopupStub = {
  template: '<span><slot /><slot name="content" /></span>',
  props: ['placement', 'overlayInnerStyle', 'trigger'],
}

// Stub TDesign icons
const iconStub = {
  template: '<span />',
}

const stubs = {
  't-dialog': tDialogStub,
  't-popup': tPopupStub,
  FullscreenIcon: iconStub,
  FullscreenExitIcon: iconStub,
  CloseIcon: iconStub,
  HelpCircleFilledIcon: iconStub,
  AppIcon: iconStub,
}

describe('EnhancedDialog', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders el-dialog', async () => {
    const wrapper = mount(EnhancedDialog, {
      props: { modelValue: true, title: 'Test' },
      global: { stubs },
    })
    await nextTick()
    expect(wrapper.find('.t-dialog').exists()).toBe(true)
    wrapper.unmount()
  })

  it('shows fullscreen button by default', async () => {
    const wrapper = mount(EnhancedDialog, {
      props: { modelValue: true, title: 'Test' },
      global: { stubs },
    })
    await nextTick()
    expect(wrapper.find('[data-testid="fullscreen-btn"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('hides fullscreen button when showFullscreenBtn is false', async () => {
    const wrapper = mount(EnhancedDialog, {
      props: { modelValue: true, title: 'Test', showFullscreenBtn: false },
      global: { stubs },
    })
    await nextTick()
    expect(wrapper.find('[data-testid="fullscreen-btn"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('toggles fullscreen on button click', async () => {
    const wrapper = mount(EnhancedDialog, {
      props: { modelValue: true, title: 'Test' },
      global: { stubs },
    })
    await nextTick()
    const btn = wrapper.find('[data-testid="fullscreen-btn"]')
    expect(btn.exists()).toBe(true)
    await btn.trigger('click')
    await nextTick()
    // After click, fullscreen exit button should appear
    const exitBtn = wrapper.find('[data-testid="fullscreen-btn"]')
    expect(exitBtn.exists()).toBe(true)
    wrapper.unmount()
  })
})
