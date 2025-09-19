import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import BlogCard from '../../../layers/content/components/BlogCard.vue'

const NuxtImgMock = {
  name: 'NuxtImg',
  template: '<img :src="src" :alt="alt" />',
  props: ['src', 'alt'],
}
const NuxtLinkMock = {
  name: 'NuxtLink',
  template: '<a><slot /></a>',
  props: ['to'],
}

describe('blogCard.vue', () => {
  const basePost = {
    _path: '/posts/hello',
    title: 'Hello World',
    description: 'Post description',
    author: 'Jane',
    publishedAt: '2024-01-02T00:00:00.000Z',
    tags: ['nuxt', 'testing'],
    image: '/icon-green.png',
  }

  it('renders title, description, meta, tags and image', () => {
    const wrapper = mount(BlogCard, {
      props: { post: basePost },
      global: { components: { NuxtImg: NuxtImgMock, NuxtLink: NuxtLinkMock } },
    })

    expect(wrapper.text()).toContain('Hello World')
    expect(wrapper.text()).toContain('Post description')
    expect(wrapper.find('time').exists()).toBe(true)
    expect(wrapper.findAll('.tag').length).toBe(2)
    expect(wrapper.find('img').attributes('alt')).toBe('Hello World')
  })

  it('does not render image and tags when absent', () => {
    const noMedia = { ...basePost, image: undefined, tags: undefined }
    const wrapper = mount(BlogCard, {
      props: { post: noMedia },
      global: { components: { NuxtImg: NuxtImgMock, NuxtLink: NuxtLinkMock } },
    })

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.findAll('.tag').length).toBe(0)
  })
})
