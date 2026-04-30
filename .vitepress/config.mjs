import { defineConfig } from 'vitepress'
import vue from '@vitejs/plugin-vue'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "舞溪的树洞",
  description: "AI 调研 · 项目进度 · 工具箱",
  lang: 'zh-CN',
  
  head: [
    ['meta', { name: 'theme-color', content: '#5f67ee' }],
  ],

  vite: {
    plugins: [vue()]
  },

  themeConfig: {
    nav: [
      { text: '🏠 首页', link: '/' },
      { text: '📚 AI 调研', link: '/ai-research/' },
      { text: '🚀 项目进度', link: '/projects/' },
      { text: '🎲 工具箱', link: '/tools/' },
    ],

    sidebar: {
      '/ai-research/': [
        {
          text: '📚 AI 调研',
          items: [
            { text: '调研总览', link: '/ai-research/' },
            // 待定添加...
          ]
        }
      ],
      '/projects/': [
        {
          text: '🚀 项目进度',
          items: [
            { text: '项目总览', link: '/projects/' },
            // 待定添加...
          ]
        }
      ],
      '/tools/': [
        {
          text: '🎲 工具箱',
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
      copyright: '© 2026'
    },

    outline: {
      label: '页面导航'
    },
  }
})
