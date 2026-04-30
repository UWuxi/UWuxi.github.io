# 🎲 骰子工具

简单的在线骰子工具，点击按钮掷出骰子。

## 使用方法

即将上线... 敬请期待 🚀

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

<div style="text-align: center; padding: 40px;">
  <div v-if="result && !rolling" style="font-size: 48px; margin-bottom: 20px;">
    🎲 {{ result }}
  </div>
  <div v-else-if="rolling" style="font-size: 48px; margin-bottom: 20px;">
    🎲 掷出中...
  </div>
  <div v-else style="font-size: 48px; margin-bottom: 20px;">
    🎲 ?
  </div>
  <button @click="roll" :disabled="rolling" style="padding: 12px 24px; font-size: 16px; cursor: pointer;">
    {{ rolling ? '滚动中...' : '掷骰子' }}
  </button>
</div>
