/**
 * @vitest-environment jsdom
 */
/* eslint-disable vue/one-component-per-file */
import type { mastodon } from 'masto'
import { describe, expect, it, vi } from 'vitest'
import { renderToString } from 'vue/server-renderer'
import { format } from 'prettier'
import { contentToVNode } from '~/composables/content-render'

describe('content-rich', () => {
  it('empty', async () => {
    const { formatted } = await render('')
    expect(formatted).toMatchSnapshot()
  })

  it('link + mention', async () => {
    // https://fosstodon.org/@ayo/109383002937620723
    const { formatted } = await render('<p>Happy 🤗 we’re now using <span class="h-card"><a href="https://mas.to/@vitest" class="u-url mention" rel="nofollow noopener noreferrer" target="_blank">@<span>vitest</span></a></span> (migrated from chai+mocha) <a href="https://github.com/ayoayco/astro-reactive-library/pull/203" rel="nofollow noopener noreferrer" target="_blank"><span class="invisible">https://</span><span class="ellipsis">github.com/ayoayco/astro-react</span><span class="invisible">ive-library/pull/203</span></a></p>')
    expect(formatted).toMatchSnapshot()
  })

  it ('block with backticks', async () => {
    const { formatted } = await render('<p>```<br />[(`number string) (`tag string)]<br />```</p>')
    expect(formatted).toMatchSnapshot()
  })

  it('group mention', async () => {
    const { formatted } = await render('<p><span class="h-card"><a href="https://lemmy.ml/c/pilipinas" class="u-url mention" rel="nofollow noopener noreferrer" target="_blank">@<span>pilipinas</span></a></span></p>', undefined, [{ id: '', username: 'pilipinas', url: 'https://lemmy.ml/c/pilipinas', acct: 'pilipinas@lemmy.ml' }])
    expect(formatted).toMatchSnapshot('html')
  })

  it('inline code with link', async () => {
    const { formatted } = await render('<p>Inline code with link: `<a href="https://api.iconify.design/noto.css?icons=1st-place-medal,2nd-place-medal" target="_blank" rel="nofollow noopener noreferrer" class="status-link unhandled-link" title="https://api.iconify.design/noto.css?icons=1st-place-medal,2nd-place-medal"><span class="invisible">https://</span><span class="ellipsis">api.iconify.design/noto.css?ic</span><span class="invisible">ons=1st-place-medal,2nd-place-medal</span></a>`</p>')
    expect(formatted).toMatchSnapshot()
  })

  it('handles html within code blocks', async () => {
    const { formatted } = await render('<p>HTML block code:<br>```html<br>&lt;span class="icon--noto icon--noto--1st-place-medal"&gt;&lt;/span&gt;<br>&lt;span class="icon--noto icon--noto--2nd-place-medal-medal"&gt;&lt;/span&gt;<br>```</p>')
    expect(formatted).toMatchSnapshot()
  })

  it('custom emoji', async () => {
    const { formatted } = await render('Daniel Roe :nuxt:', {
      nuxt: {
        shortcode: 'nuxt',
        url: 'https://media.mas.to/masto-public/cache/custom_emojis/images/000/288/667/original/c96ba3cb0e0e1eac.png',
        staticUrl: 'https://media.mas.to/masto-public/cache/custom_emojis/images/000/288/667/static/c96ba3cb0e0e1eac.png',
        visibleInPicker: true,
      },
    })
    expect(formatted).toMatchSnapshot()
  })

  it('code frame', async () => {
    // https://mas.to/@antfu/109396489827394721
    const { formatted } = await render('<p>Testing code block</p><p>```ts<br />import { useMouse, usePreferredDark } from &#39;@vueuse/core&#39;</p><p>// tracks mouse position<br />const { x, y } = useMouse()</p><p>// is the user prefers dark theme<br />const isDark = usePreferredDark()<br />```</p>')
    expect(formatted).toMatchSnapshot()
  })

  it('code frame 2', async () => {
    const { formatted } = await render('<p><span class=\"h-card\"><a href=\"https://mas.to/@antfu\" class=\"u-url mention\">@<span>antfu</span></a></span> Testing<br />```ts<br />const a = hello<br />```</p>')
    expect(formatted).toMatchSnapshot()
  })

  it('code frame no lang', async () => {
    const { formatted } = await render('<p>```<br />hello world<br />```<br />no lang</p>')
    expect(formatted).toMatchSnapshot()
  })

  it('code frame empty', async () => {
    const { formatted } = await render('<p>```<br /><br />```<br /></p>')
    expect(formatted).toMatchSnapshot()
  })
})

async function render(content: string, emojis?: Record<string, mastodon.v1.CustomEmoji>, mentions?: mastodon.v1.StatusMention[]) {
  const vnode = contentToVNode(content, { emojis, mentions })
  const html = (await renderToString(vnode))
    .replace(/<!--[\[\]]-->/g, '')
  let formatted = ''

  try {
    formatted = format(html, {
      parser: 'html',
    })
  }
  catch (e) {
    formatted = html
  }

  return {
    vnode,
    html,
    formatted,
  }
}

// mocks
vi.mock('vue-router', () => {
  return {
    RouterLink: defineComponent((attrs) => {
      return () => h('a', attrs)
    }),
  }
})

vi.mock('~/composables/dialog.ts', () => {
  return {}
})

vi.mock('~/components/content/ContentCode.vue', () => {
  return {
    default: defineComponent({
      props: {
        code: {
          type: String,
          required: true,
        },
        lang: {
          type: String,
        },
      },
      setup(props) {
        const raw = computed(() => decodeURIComponent(props.code).replace(/&#39;/g, '\''))
        return () => h('pre', { lang: props.lang }, raw.value)
      },
    }),
  }
})

vi.mock('~/components/account/AccountHoverWrapper.vue', () => {
  return {
    default: defineComponent({
      props: ['handle', 'class'],
      setup(_, { slots }) {
        return () => slots?.default?.()
      },
    }),
  }
})
