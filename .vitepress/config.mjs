import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "舞溪的树洞",
  description: "TRPG · Blog · 工具箱",
  lang: 'zh-CN',

  head: [
    ['meta', { name: 'theme-color', content: '#5f67ee' }],
  ],

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: 'TRPG', link: '/trpg/' },
      { text: 'Blog', link: '/blog/' },
      { text: '工具箱', link: '/tools/' },
    ],

    sidebar: {
      '/trpg/': [
        {
          text: 'TRPG',
          items: [
            { text: 'TRPG 首页', link: '/trpg/' },
            { text: '随机骰子', link: '/tools/dice' },
            // 待定添加...
          ]
        }
      ],
      '/blog/': [
        {
          text: 'Blog',
          items: [
            { text: '文章列表', link: '/blog/' },
            // 待定添加...
          ]
        }
      ],
      '/tools/': [
        {
          text: '工具箱',
          items: [
            { text: '工具总览', link: '/tools/' },
            { text: '随机骰子', link: '/tools/dice' },
            { text: '决策硬币', link: '/tools/coin' },
            { text: '随机颜色', link: '/tools/color' },
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/UWuxi' }
    ],

    search: {
      provider: 'local'
    },

    footer: {
      message: 'Powered by VitePress',
      copyright: '2026'
    },

    outline: {
      label: '页面导航'
    },
  }
})
