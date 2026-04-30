# 🪙 硬币工具

简单的在线抛硬币工具。

## 使用方法

即将上线... 敬请期待 🚀

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

<div style="text-align: center; padding: 40px;">
  <div style="font-size: 64px; margin-bottom: 20px;">
    {{ flipping ? '🪙' : (result === '正面' ? '🌕' : result === '反面' ? '🌑' : '🪙') }}
  </div>
  <div v-if="result && !flipping" style="font-size: 24px; margin-bottom: 20px;">
    结果：{{ result }}
  </div>
  <button @click="flip" :disabled="flipping" style="padding: 12px 24px; font-size: 16px; cursor: pointer;">
    {{ flipping ? '翻转中...' : '抛硬币' }}
  </button>
</div>
