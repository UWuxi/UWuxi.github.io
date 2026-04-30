# 颜色生成器

简单的随机颜色生成工具。

## 使用方法

即将上线... 敬请期待

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

<div style="text-align: center; padding: 40px; background: var(--vp-c-bg-soft); border-radius: 12px; margin: 20px 0;">
  <div :style="{ backgroundColor: color, width: '150px', height: '150px', margin: '0 auto 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontSize: '16px', fontWeight: 'bold', color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }">
    {{ color }}
  </div>
  <button 
    @click="generate" 
    style="padding: 12px 32px; font-size: 16px; cursor: pointer; background: var(--vp-c-brand); color: white; border: none; border-radius: 8px; transition: opacity 0.2s;"
  >
    生成颜色
  </button>
</div>
