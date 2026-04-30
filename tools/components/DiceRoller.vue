<template>
  <div class="dice-roller">
    <div class="dice-result" :class="{ rolling: isRolling }">
      <span class="result-number">{{ displayValue }}</span>
    </div>
    
    <div class="dice-types">
      <button 
        v-for="dice in diceTypes" 
        :key="dice.type"
        :class="['dice-btn', { active: currentType === dice.type }]"
        @click="selectDice(dice.type)"
      >
        {{ dice.label }}
      </button>
    </div>
    
    <button class="roll-btn" @click="roll" :disabled="isRolling">
      {{ isRolling ? '滚动中...' : '🎲 投骰子' }}
    </button>
    
    <div class="history" v-if="history.length > 0">
      <h4>历史记录</h4>
      <div class="history-list">
        <span 
          v-for="(item, index) in history.slice(-8)" 
          :key="index"
          class="history-item"
        >
          {{ item }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const diceTypes = [
  { type: 6, label: 'D6' },
  { type: 10, label: 'D10' },
  { type: 20, label: 'D20' },
  { type: 100, label: 'D100' }
]

const currentType = ref(20)
const currentValue = ref(1)
const displayValue = ref(1)
const isRolling = ref(false)
const history = ref([])

const selectDice = (type) => {
  currentType.value = type
  currentValue.value = 1
  displayValue.value = 1
}

const roll = () => {
  if (isRolling.value) return
  
  isRolling.value = true
  let rolls = 0
  const maxRolls = 10
  const interval = setInterval(() => {
    displayValue.value = Math.floor(Math.random() * currentType.value) + 1
    rolls++
    
    if (rolls >= maxRolls) {
      clearInterval(interval)
      currentValue.value = displayValue.value
      history.value.push(`D${currentType.value}: ${currentValue.value}`)
      isRolling.value = false
    }
  }, 100)
}
</script>

<style scoped>
.dice-roller {
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  padding: 24px;
  margin: 16px 0;
}

.dice-result {
  text-align: center;
  padding: 40px;
  background: var(--vp-c-bg);
  border-radius: 8px;
  margin-bottom: 20px;
}

.result-number {
  font-size: 64px;
  font-weight: bold;
  color: var(--vp-c-brand);
  transition: all 0.1s;
}

.dice-result.rolling .result-number {
  transform: scale(1.1);
  opacity: 0.7;
}

.dice-types {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.dice-btn {
  padding: 10px 20px;
  border: 2px solid var(--vp-c-brand);
  background: transparent;
  color: var(--vp-c-brand);
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.dice-btn:hover {
  background: var(--vp-c-brand);
  color: white;
}

.dice-btn.active {
  background: var(--vp-c-brand);
  color: white;
}

.roll-btn {
  width: 100%;
  padding: 16px 32px;
  font-size: 18px;
  font-weight: 600;
  background: var(--vp-c-brand);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.roll-btn:hover {
  background: var(--vp-c-brand-dark);
  transform: translateY(-2px);
}

.roll-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.history {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--vp-c-divider);
}

.history h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.history-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.history-item {
  padding: 6px 12px;
  background: var(--vp-c-bg);
  border-radius: 4px;
  font-size: 14px;
  font-family: monospace;
  color: var(--vp-c-text-1);
}
</style>
