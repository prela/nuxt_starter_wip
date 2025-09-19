import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ImagePresetDemo from '../../../app/components/ImagePresetDemo.vue'

const NuxtImgMock = {
  name: 'NuxtImg',
  template: '<img :alt="alt" />',
  props: ['alt'],
}
const NuxtPictureMock = {
  name: 'NuxtPicture',
  template: '<picture><img alt="picture" /></picture>',
}

describe('imagePresetDemo.vue', () => {
  it('renders demo images and responsive picture', () => {
    const wrapper = mount(ImagePresetDemo, {
      global: { components: { NuxtImg: NuxtImgMock, NuxtPicture: NuxtPictureMock } },
    })

    expect(wrapper.findAll('img[alt="Avatar example"]').length).toBe(1)
    expect(wrapper.findAll('img[alt="Thumbnail example"]').length).toBe(1)
    expect(wrapper.findAll('img[alt="Card example"]').length).toBe(1)
    expect(wrapper.findAll('img[alt="Default preset example"]').length).toBe(1)
    expect(wrapper.find('picture').exists()).toBe(true)
  })
})
