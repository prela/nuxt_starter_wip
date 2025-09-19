import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Probe from '../../../layers/ui/components/DesignSystemProbe.vue'

describe('design system probe', () => {
  it('renders and applies token classes', async () => {
    const wrapper = mount(Probe)
    expect(wrapper.find('h1').classes()).toContain('heading-1')
    expect(wrapper.find('p').classes()).toContain('body-base')
    expect(wrapper.find('span').classes()).toContain('caption')
    expect(wrapper.find('button').classes()).toContain('focus-ring')
  })

  it('includes animation utility class', async () => {
    const wrapper = mount(Probe)
    expect(wrapper.find('section').classes()).toContain('animate-fade-in')
  })
})
