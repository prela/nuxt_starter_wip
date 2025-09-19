/**
 * Unit Tests for Button.vue Component
 * Following TDD principles - tests written before implementation
 * Tests cover all variants, sizes, states, and interactions
 */

import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import Button from '../../../../layers/ui/components/atoms/Button.vue'

// Mock UIcon component for testing
const UIconMock = {
  name: 'UIcon',
  template: `<span :class="['mock-icon', name, $attrs.class]" v-bind="$attrs"></span>`,
  props: {
    name: {
      type: String,
      required: true,
    },
  },
}

describe('button.vue', () => {
  let wrapper: VueWrapper<any>

  // Helper function to mount Button with UIcon mock
  const mountButton = (options: any = {}) => {
    return mount(Button, {
      ...options,
      global: {
        components: {
          UIcon: UIconMock,
        },
        ...options.global,
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('content Rendering', () => {
    it('renders label prop as button text', () => {
      wrapper = mountButton({
        props: {
          label: 'Test Button',
        },
      })

      expect(wrapper.text()).toContain('Test Button')
    })

    it('renders default slot content', () => {
      wrapper = mountButton({
        slots: {
          default: 'Slot Content',
        },
      })

      expect(wrapper.text()).toContain('Slot Content')
    })

    it('prioritizes slot content over label prop', () => {
      wrapper = mountButton({
        props: {
          label: 'Label Prop',
        },
        slots: {
          default: 'Slot Content',
        },
      })

      expect(wrapper.text()).toContain('Slot Content')
      expect(wrapper.text()).not.toContain('Label Prop')
    })

    it('renders without content when no label or slot provided', () => {
      wrapper = mountButton()

      expect(wrapper.find('button').exists()).toBe(true)
      expect(wrapper.text().trim()).toBe('')
    })
  })

  describe('variant Classes', () => {
    const variants = ['solid', 'outline', 'soft', 'subtle', 'ghost', 'link'] as const

    variants.forEach((variant) => {
      it(`applies correct classes for ${variant} variant`, () => {
        wrapper = mountButton({
          props: {
            variant,
            color: 'primary',
          },
        })

        const button = wrapper.find('button')
        expect(button.classes()).toContain(`btn-${variant}`)
        expect(button.classes()).toContain('btn-primary')
      })
    })

    it('defaults to solid variant when not specified', () => {
      wrapper = mountButton({
        props: {
          color: 'primary',
        },
      })

      expect(wrapper.find('button').classes()).toContain('btn-solid')
    })
  })

  describe('color Classes', () => {
    const colors = ['primary', 'secondary', 'success', 'info', 'warning', 'error', 'neutral'] as const

    colors.forEach((color) => {
      it(`applies correct classes for ${color} color`, () => {
        wrapper = mountButton({
          props: {
            color,
            variant: 'solid',
          },
        })

        expect(wrapper.find('button').classes()).toContain(`btn-${color}`)
        expect(wrapper.find('button').classes()).toContain('btn-solid')
      })
    })

    it('defaults to primary color when not specified', () => {
      wrapper = mountButton({
        props: {
          variant: 'solid',
        },
      })

      expect(wrapper.find('button').classes()).toContain('btn-primary')
    })
  })

  describe('size Classes', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const

    sizes.forEach((size) => {
      it(`applies correct classes for ${size} size`, () => {
        wrapper = mountButton({
          props: {
            size,
          },
        })

        expect(wrapper.find('button').classes()).toContain(`btn-${size}`)
      })
    })

    it('defaults to md size when not specified', () => {
      wrapper = mountButton()

      expect(wrapper.find('button').classes()).toContain('btn-md')
    })
  })

  describe('disabled State', () => {
    it('adds disabled attribute when disabled prop is true', () => {
      wrapper = mountButton({
        props: {
          disabled: true,
        },
      })

      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeDefined()
      expect(button.classes()).toContain('btn-disabled')
    })

    it('does not add disabled attribute when disabled prop is false', () => {
      wrapper = mountButton({
        props: {
          disabled: false,
        },
      })

      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeUndefined()
      expect(button.classes()).not.toContain('btn-disabled')
    })

    it('does not emit click event when disabled', async () => {
      const clickSpy = vi.fn()
      wrapper = mountButton({
        props: {
          disabled: true,
          onClick: clickSpy,
        },
      })

      await wrapper.find('button').trigger('click')
      expect(clickSpy).not.toHaveBeenCalled()
    })
  })

  describe('loading State', () => {
    it('adds loading classes when loading prop is true', () => {
      wrapper = mountButton({
        props: {
          loading: true,
        },
      })

      const button = wrapper.find('button')
      expect(button.classes()).toContain('btn-loading')
      expect(button.attributes('disabled')).toBeDefined()
    })

    it('shows loading icon when loading', () => {
      wrapper = mountButton({
        props: {
          loading: true,
          loadingIcon: 'i-lucide-loader-circle',
        },
      })

      expect(wrapper.find('.loading-icon').exists()).toBe(true)
    })

    it('does not emit click event when loading', async () => {
      const clickSpy = vi.fn()
      wrapper = mountButton({
        props: {
          loading: true,
          onClick: clickSpy,
        },
      })

      await wrapper.find('button').trigger('click')
      expect(clickSpy).not.toHaveBeenCalled()
    })

    it('hides content icons when loading', () => {
      wrapper = mountButton({
        props: {
          loading: true,
          leadingIcon: 'i-lucide-home',
          trailingIcon: 'i-lucide-arrow-right',
        },
      })

      expect(wrapper.find('.leading-icon').classes()).toContain('hidden')
      expect(wrapper.find('.trailing-icon').classes()).toContain('hidden')
    })
  })

  describe('icon Handling', () => {
    it('renders leading icon when leadingIcon prop is provided', () => {
      wrapper = mountButton({
        props: {
          leadingIcon: 'i-lucide-home',
          label: 'Home',
        },
      })

      const leadingIcon = wrapper.find('.leading-icon')
      expect(leadingIcon.exists()).toBe(true)
      expect(leadingIcon.classes()).toContain('i-lucide-home')
    })

    it('renders trailing icon when trailingIcon prop is provided', () => {
      wrapper = mountButton({
        props: {
          trailingIcon: 'i-lucide-arrow-right',
          label: 'Next',
        },
      })

      const trailingIcon = wrapper.find('.trailing-icon')
      expect(trailingIcon.exists()).toBe(true)
      expect(trailingIcon.classes()).toContain('i-lucide-arrow-right')
    })

    it('renders icon based on icon prop and leading/trailing boolean', () => {
      wrapper = mountButton({
        props: {
          icon: 'i-lucide-star',
          leading: true,
          label: 'Favorite',
        },
      })

      const leadingIcon = wrapper.find('.leading-icon')
      expect(leadingIcon.exists()).toBe(true)
      expect(leadingIcon.classes()).toContain('i-lucide-star')
    })

    it('renders trailing icon when trailing is true', () => {
      wrapper = mountButton({
        props: {
          icon: 'i-lucide-star',
          trailing: true,
          label: 'Favorite',
        },
      })

      const trailingIcon = wrapper.find('.trailing-icon')
      expect(trailingIcon.exists()).toBe(true)
      expect(trailingIcon.classes()).toContain('i-lucide-star')
    })

    it('renders icon-only button without label', () => {
      wrapper = mountButton({
        props: {
          icon: 'i-lucide-search',
        },
      })

      expect(wrapper.find('.leading-icon').exists()).toBe(true)
      expect(wrapper.text().trim()).toBe('')
      expect(wrapper.find('button').classes()).toContain('btn-icon-only')
    })

    it('renders both leading and trailing icons', () => {
      wrapper = mountButton({
        props: {
          leadingIcon: 'i-lucide-home',
          trailingIcon: 'i-lucide-arrow-right',
          label: 'Go Home',
        },
      })

      expect(wrapper.find('.leading-icon').exists()).toBe(true)
      expect(wrapper.find('.trailing-icon').exists()).toBe(true)
    })
  })

  describe('icon Slots', () => {
    it('renders leading slot content', () => {
      wrapper = mountButton({
        slots: {
          leading: h('span', { class: 'custom-leading' }, 'Leading'),
          default: 'Button Text',
        },
      })

      expect(wrapper.find('.custom-leading').exists()).toBe(true)
      expect(wrapper.find('.custom-leading').text()).toBe('Leading')
    })

    it('renders trailing slot content', () => {
      wrapper = mountButton({
        slots: {
          trailing: h('span', { class: 'custom-trailing' }, 'Trailing'),
          default: 'Button Text',
        },
      })

      expect(wrapper.find('.custom-trailing').exists()).toBe(true)
      expect(wrapper.find('.custom-trailing').text()).toBe('Trailing')
    })

    it('prioritizes slots over icon props', () => {
      wrapper = mountButton({
        props: {
          leadingIcon: 'i-lucide-home',
          trailingIcon: 'i-lucide-arrow-right',
        },
        slots: {
          leading: h('span', { class: 'custom-leading' }, 'Custom Leading'),
          trailing: h('span', { class: 'custom-trailing' }, 'Custom Trailing'),
          default: 'Button Text',
        },
      })

      expect(wrapper.find('.custom-leading').exists()).toBe(true)
      expect(wrapper.find('.custom-trailing').exists()).toBe(true)
      expect(wrapper.find('.leading-icon').exists()).toBe(false)
      expect(wrapper.find('.trailing-icon').exists()).toBe(false)
    })
  })

  describe('event Handling', () => {
    it('emits click event when enabled and not loading', async () => {
      wrapper = mountButton({
        props: {
          label: 'Test Button',
        },
      })

      await wrapper.find('button').trigger('click')
      expect(wrapper.emitted('click')).toHaveLength(1)
      expect(wrapper.emitted('click')?.[0]).toHaveLength(1)
    })

    it('does not emit click when disabled', async () => {
      const clickSpy = vi.fn()
      wrapper = mountButton({
        props: {
          disabled: true,
          onClick: clickSpy,
        },
      })

      await wrapper.find('button').trigger('click')
      expect(clickSpy).not.toHaveBeenCalled()
    })

    it('does not emit click when loading', async () => {
      const clickSpy = vi.fn()
      wrapper = mountButton({
        props: {
          loading: true,
          onClick: clickSpy,
        },
      })

      await wrapper.find('button').trigger('click')
      expect(clickSpy).not.toHaveBeenCalled()
    })

    it('supports multiple click handlers', async () => {
      const clickSpy1 = vi.fn()
      const clickSpy2 = vi.fn()
      wrapper = mountButton({
        props: {
          onClick: [clickSpy1, clickSpy2],
        },
      })

      await wrapper.find('button').trigger('click')
      // Each handler should be called at least once (Vue may call handlers multiple times due to event propagation)
      expect(clickSpy1).toHaveBeenCalled()
      expect(clickSpy2).toHaveBeenCalled()
      expect(wrapper.emitted('click')).toHaveLength(1)
    })
  })

  describe('button Element Attributes', () => {
    it('sets correct button type', () => {
      wrapper = mountButton({
        props: {
          type: 'submit',
        },
      })

      expect(wrapper.find('button').attributes('type')).toBe('submit')
    })

    it('defaults to button type', () => {
      wrapper = mountButton()

      expect(wrapper.find('button').attributes('type')).toBe('button')
    })

    it('passes through aria attributes', () => {
      wrapper = mountButton({
        attrs: {
          'aria-label': 'Close dialog',
          'aria-describedby': 'help-text',
        },
      })

      const button = wrapper.find('button')
      expect(button.attributes('aria-label')).toBe('Close dialog')
      expect(button.attributes('aria-describedby')).toBe('help-text')
    })
  })

  describe('additional Modifiers', () => {
    it('applies square modifier classes', () => {
      wrapper = mountButton({
        props: {
          square: true,
        },
      })

      expect(wrapper.find('button').classes()).toContain('btn-square')
    })

    it('applies block modifier classes', () => {
      wrapper = mountButton({
        props: {
          block: true,
        },
      })

      expect(wrapper.find('button').classes()).toContain('btn-block')
    })

    it('applies multiple modifiers together', () => {
      wrapper = mountButton({
        props: {
          square: true,
          block: true,
          disabled: true,
        },
      })

      const button = wrapper.find('button')
      expect(button.classes()).toContain('btn-square')
      expect(button.classes()).toContain('btn-block')
      expect(button.classes()).toContain('btn-disabled')
    })
  })

  describe('cSS Class Computation', () => {
    it('combines all class modifiers correctly', () => {
      wrapper = mountButton({
        props: {
          variant: 'outline',
          color: 'success',
          size: 'lg',
          disabled: true,
          square: true,
        },
      })

      const button = wrapper.find('button')
      const classes = button.classes()

      expect(classes).toContain('btn')
      expect(classes).toContain('btn-outline')
      expect(classes).toContain('btn-success')
      expect(classes).toContain('btn-lg')
      expect(classes).toContain('btn-disabled')
      expect(classes).toContain('btn-square')
    })

    it('applies base button classes', () => {
      wrapper = mountButton()

      const button = wrapper.find('button')
      expect(button.classes()).toContain('btn')
      expect(button.classes()).toContain('btn-solid')
      expect(button.classes()).toContain('btn-primary')
      expect(button.classes()).toContain('btn-md')
    })
  })

  describe('design Token Integration', () => {
    it('uses design token classes for spacing and sizing', () => {
      wrapper = mountButton({
        props: {
          size: 'sm',
        },
      })

      const button = wrapper.find('button')
      expect(button.classes()).toContain('btn-sm')
      // The component should map to CSS custom properties defined in design-system.css
    })

    it('uses design token classes for colors', () => {
      wrapper = mountButton({
        props: {
          color: 'primary',
          variant: 'solid',
        },
      })

      const button = wrapper.find('button')
      expect(button.classes()).toContain('btn-primary')
      expect(button.classes()).toContain('btn-solid')
      // These should map to the CSS variables defined in the design system
    })
  })

  describe('accessibility', () => {
    it('maintains focus management', async () => {
      wrapper = mountButton({
        props: {
          label: 'Focusable Button',
        },
      })

      const button = wrapper.find('button')
      expect(button.element.tagName).toBe('BUTTON')
      expect(button.attributes('tabindex')).toBeUndefined()
    })

    it('prevents focus when disabled', () => {
      wrapper = mountButton({
        props: {
          disabled: true,
          label: 'Disabled Button',
        },
      })

      const button = wrapper.find('button')
      expect(button.attributes('tabindex')).toBe('-1')
    })

    it('maintains semantic button role', () => {
      wrapper = mountButton()

      const button = wrapper.find('button')
      expect(button.element.tagName).toBe('BUTTON')
      expect(button.attributes('role')).toBeUndefined() // Native button role
    })
  })
})
