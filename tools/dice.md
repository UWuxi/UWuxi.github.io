# 骰子工具

简单的在线骰子工具，点击按钮掷出骰子。

## 使用方法

即将上线... 敬请期待

<script setup>
import { ref } from 'vue'
const result = ref(null)
const rolling = ref(false)

const roll = () => {
  rolling.value = true
  setTimeout(() => {
    result.value = Math.floor(Math.random() * 6) + 1
    rolling.value = false
  }, 500)
}
</script>

<div style="text-align: center; padding: 40px; background: var(--vp-c-bg-soft); border-radius: 12px; margin: 20px 0;">
  <div style="font-size: 48px; margin-bottom: 20px; font-weight: bold; color: var(--vp-c-brand);">
    <span v-if="rolling">...</span>
    <span v-else-if="result">{{ result }}</span>
    <span v-else>?</span>
  </div>
  <button 
    @click="roll" 
    :disabled="rolling" 
    style="padding: 12px 32px; font-size: 16px; cursor: pointer; background: var(--vp-c-brand); color: white; border: none; border-radius: 8px; transition: opacity 0.2s;"
    :style="{ opacity: rolling ? 0.6 : 1 }"
  >
    {{ rolling ? '滚动中...' : '掷骰子' }}
  </button>
</div>
