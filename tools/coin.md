# 硬币工具

简单的在线抛硬币工具。

## 使用方法

即将上线... 敬请期待

<script setup>
import { ref } from 'vue'
const result = ref(null)
const flipping = ref(false)

const flip = () => {
  flipping.value = true
  setTimeout(() => {
    result.value = Math.random() < 0.5 ? '正面' : '反面'
    flipping.value = false
  }, 1000)
}
</script>

<div style="text-align: center; padding: 40px; background: var(--vp-c-bg-soft); border-radius: 12px; margin: 20px 0;">
  <div style="width: 100px; height: 100px; margin: 0 auto 20px; border-radius: 50%; background: linear-gradient(135deg, var(--vp-c-brand), var(--vp-c-brand-light)); display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; color: white; transition: transform 1s;" :style="{ transform: flipping ? 'rotateY(720deg)' : 'rotateY(0deg)' }">
    {{ flipping ? '?' : (result ? result[0] : '?') }}
  </div>
  <div v-if="result && !flipping" style="font-size: 18px; margin-bottom: 16px; color: var(--vp-c-text-1);">
    结果：{{ result }}
  </div>
  <button 
    @click="flip" 
    :disabled="flipping" 
    style="padding: 12px 32px; font-size: 16px; cursor: pointer; background: var(--vp-c-brand); color: white; border: none; border-radius: 8px; transition: opacity 0.2s;"
    :style="{ opacity: flipping ? 0.6 : 1 }"
  >
    {{ flipping ? '翻转中...' : '抛硬币' }}
  </button>
</div>
