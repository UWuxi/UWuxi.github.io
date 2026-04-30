<template>
  <div class="dice-roller">
    <div class="dice-display" :class="{ rolling: isRolling }">
      <div class="dice" :style="diceStyle">
        {{ currentValue }}
      </div>
    </div>
    <div class="result" v-if="result && !isRolling">
      掷出了 <strong>{{ result }}</strong> 点！
    </div>
    <button @click="roll" :disabled="isRolling" class="roll-btn">
      {{ isRolling ? '滚动中...' : '🎲 掷骰子' }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const isRolling = ref(false)
const result = ref(null)
const currentValue = ref(1)

const diceStyle = computed(() => ({
  transform: isRolling.value ? 'rotate(720deg)' : 'rotate(0deg)',
  transition: isRolling.value ? 'transform 1s ease-out' : 'none'
}))

const roll = () => {
  if (isRolling.value) return
  isRolling.value = true
  result.value = null
  
  // 滚动动画
  let rolls = 0
  const interval = setInterval(() => {
    currentValue.value = Math.floor(Math.random() * 6) + 1
    rolls++
    if (rolls > 10) {
      clearInterval(interval)
      const final = Math.floor(Math.random() * 6) + 1
      currentValue.value = final
      result.value = final
      isRolling.value = false
    }
  }, 100)
}
</script>

<style scoped>
.dice-roller {
  text-align: center;
  padding: 20px;
}
.dice-display {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}
.dice {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: bold;
  color: white;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
}
.result {
  font-size: 18px;
  margin-bottom: 16px;
  color: var(--vp-c-text-1);
}
.roll-btn {
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  background: var(--vp-c-brand);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}
.roll-btn:hover:not(:disabled) {
  background: var(--vp-c-brand-dark);
  transform: translateY(-2px);
}
.roll-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
