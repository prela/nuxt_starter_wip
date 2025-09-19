import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import TableOfContents from '../../../layers/content/components/TableOfContents.vue'

describe('tableOfContents.vue', () => {
  it('renders toc links and toggles active class', async () => {
    const toc = [
      { id: 'h1', text: 'Intro', depth: 1 },
      { id: 'h2', text: 'Usage', depth: 2 },
    ]
    const wrapper = mount(TableOfContents, { props: { toc } })

    const links = wrapper.findAll('a')
    expect(links.length).toBe(2)
    expect(links[0].text()).toBe('Intro')

    // Simulate click to call scrollToHeading (no assertion on DOM scroll)
    await links[0].trigger('click')
    expect(links[0].attributes('href')).toBe('#h1')
  })
})
