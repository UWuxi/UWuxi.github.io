<template>
  <div class="coin-flipper">
    <div class="coin-container">
      <div class="coin" :class="{ flipping: isFlipping }" :style="coinStyle">
        <div class="face front">正</div>
        <div class="face back">反</div>
      </div>
    </div>
    <div class="result" v-if="result && !isFlipping">
      结果是：<strong>{{ resultText }}</strong>
    </div>
    <button @click="flip" :disabled="isFlipping" class="flip-btn">
      {{ isFlipping ? '翻转中...' : '🪙 抛硬币' }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const isFlipping = ref(false)
const result = ref(null)
const rotation = ref(0)

const coinStyle = computed(() => ({
  transform: `rotateY(${rotation.value}deg)`
}))

const resultText = computed(() => {
  return result.value === 'heads' ? '正面' : '反面'
})

const flip = () => {
  if (isFlipping.value) return
  isFlipping.value = true
  result.value = null
  
  const isHeads = Math.random() < 0.5
  const baseRotation = 1800
  const extraRotation = isHeads ? 0 : 180
  rotation.value += baseRotation + extraRotation
  
  setTimeout(() => {
    result.value = isHeads ? 'heads' : 'tails'
    isFlipping.value = false
  }, 1500)
}
</script>

<style scoped>
.coin-flipper {
  text-align: center;
  padding: 20px;
}
.coin-container {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  perspective: 1000px;
}
.coin {
  width: 100px;
  height: 100px;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 1.5s ease-out;
}
.face {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: bold;
  backface-visibility: hidden;
  box-shadow: 0 8px 25px rgba(0,0,0,0.3);
}
.front {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}
.back {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  transform: rotateY(180deg);
}
.result {
  font-size: 18px;
  margin-bottom: 16px;
  color: var(--vp-c-text-1);
}
.flip-btn {
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
.flip-btn:hover:not(:disabled) {
  background: var(--vp-c-brand-dark);
  transform: translateY(-2px);
}
.flip-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
