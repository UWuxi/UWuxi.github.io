<template>
  <div class="coin-flipper">
    <div class="coin-container" :class="{ flipping: isFlipping }">
      <div class="coin" :style="coinStyle">
        <div class="coin-face coin-front">
          <span class="coin-icon">🌕</span>
          <span class="coin-text">正面</span>
        </div>
        <div class="coin-face coin-back">
          <span class="coin-icon">🌑</span>
          <span class="coin-text">反面</span>
        </div>
      </div>
    </div>
    
    <div class="result-display" v-if="result && !isFlipping">
      <div class="result-badge" :class="result">{{ resultText }}</div>
    </div>
    
    <button class="flip-btn" @click="flip" :disabled="isFlipping">
      {{ isFlipping ? ' flipping...' : '🪙 抛硬币' }}
    </button>
    
    <div class="stats" v-if="stats.total > 0">
      <div class="stat-item">
        <span class="stat-label">正面</span>
        <span class="stat-value">{{ stats.heads }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">反面</span>
        <span class="stat-value">{{ stats.tails }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">总计</span>
        <span class="stat-value">{{ stats.total }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'

const isFlipping = ref(false)
const result = ref(null)
const rotation = ref(0)

const stats = reactive({
  heads: 0,
  tails: 0,
  total: 0
})

const coinStyle = computed(() => ({
  transform: `rotateY(${rotation.value}deg)`
}))

const resultText = computed(() => {
  return result.value === 'heads' ? '正面！' : '反面！'
})

const flip = () => {
  if (isFlipping.value) return
  
  isFlipping.value = true
  result.value = null
  
  // 随机决定结果
  const isHeads = Math.random() < 0.5
  
  // 计算旋转角度（至少转5圈）
  const baseRotation = 1800
  const finalRotation = isHeads 
    ? baseRotation + (rotation.value % 360)
    : baseRotation + 180 + (rotation.value % 360)
  
  rotation.value += finalRotation
  
  setTimeout(() => {
    result.value = isHeads ? 'heads' : 'tails'
    stats[isHeads ? 'heads' : 'tails']++
    stats.total++
    isFlipping.value = false
  }, 1500)
}
</script>

<style scoped>
.coin-flipper {
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  padding: 32px;
  text-align: center;
}

.coin-container {
  perspective: 1000px;
  margin-bottom: 24px;
}

.coin {
  width: 120px;
  height: 120px;
  margin: 0 auto;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 1.5s ease-out;
}

.coin-face {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.coin-front {
  background: linear-gradient(135deg, #ffd700, #ffed4a);
  color: #333;
}

.coin-back {
  background: linear-gradient(135deg, #c0c0c0, #e8e8e8);
  color: #333;
  transform: rotateY(180deg);
}

.coin-icon {
  font-size: 40px;
  margin-bottom: 4px;
}

.coin-text {
  font-size: 14px;
  font-weight: 600;
}

.result-display {
  margin: 20px 0;
}

.result-badge {
  display: inline-block;
  padding: 12px 32px;
  border-radius: 24px;
  font-size: 20px;
  font-weight: bold;
  animation: bounce 0.5s ease;
}

.result-badge.heads {
  background: linear-gradient(135deg, #ffd700, #ffed4a);
  color: #333;
}

.result-badge.tails {
  background: linear-gradient(135deg, #c0c0c0, #e8e8e8);
  color: #333;
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.flip-btn {
  padding: 16px 48px;
  font-size: 18px;
  font-weight: 600;
  background: var(--vp-c-brand);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.flip-btn:hover {
  background: var(--vp-c-brand-dark);
  transform: translateY(-2px);
}

.flip-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.stats {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--vp-c-divider);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 12px;
  color: var(--vp-c-text-2);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--vp-c-text-1);
}
</style>