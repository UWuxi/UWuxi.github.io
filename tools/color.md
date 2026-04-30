# 🎨 颜色生成器

简单的随机颜色生成工具。

## 使用方法

即将上线... 敬请期待 🚀

<script setup>
import { ref } from 'vue'
const color = ref('#5f67ee')

const generate = () => {
  const r = Math.floor(Math.random() * 256)
  const g = Math.floor(Math.random() * 256)
  const b = Math.floor(Math.random() * 256)
  color.value = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}
</script>

<div style="text-align: center; padding: 40px;">
  <div :style="{ backgroundColor: color, width: '150px', height: '150px', margin: '0 auto 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'monospace', fontSize: '18px' }">
    {{ color }}
  </div>
  <button @click="generate" style="padding: 12px 24px; font-size: 16px; cursor: pointer;">
    🎨 生成颜色
  </button>
</div>
