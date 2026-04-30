# 骰子工具

TRPG风格的多面骰子投掷工具，支持D4/D6/D8/D10/D12/D20/D100。

## 使用方法

选择骰子面数和数量，点击投掷。

<script setup>
import { ref, computed } from 'vue'

const diceTypes = [
  { faces: 4, name: 'D4', color: '#ff6b6b' },
  { faces: 6, name: 'D6', color: '#4ecdc4' },
  { faces: 8, name: 'D8', color: '#45b7d1' },
  { faces: 10, name: 'D10', color: '#96ceb4' },
  { faces: 12, name: 'D12', color: '#dda0dd' },
  { faces: 20, name: 'D20', color: '#ffd93d' },
  { faces: 100, name: 'D100', color: '#6bcf7f' }
]

const selectedDice = ref(6)
const diceCount = ref(1)
const rolling = ref(false)
const results = ref([])
const history = ref([])

const currentDice = computed(() => {
  return diceTypes.find(d => d.faces === selectedDice.value) || diceTypes[1]
})

const total = computed(() => {
  return results.value.reduce((sum, r) => sum + r, 0)
})

const roll = () => {
  if (rolling.value) return
  rolling.value = true
  results.value = []
  
  const newResults = []
  for (let i = 0; i < diceCount.value; i++) {
    newResults.push(Math.floor(Math.random() * selectedDice.value) + 1)
  }
  
  let steps = 0
  const maxSteps = 10
  const interval = setInterval(() => {
    results.value = newResults.map(() => 
      Math.floor(Math.random() * selectedDice.value) + 1
    )
    steps++
    if (steps >= maxSteps) {
      clearInterval(interval)
      results.value = newResults
      history.value.unshift({
        type: currentDice.value.name,
        count: diceCount.value,
        results: [...newResults],
        total: newResults.reduce((sum, r) => sum + r, 0),
        time: new Date().toLocaleTimeString()
      })
      if (history.value.length > 10) history.value.pop()
      rolling.value = false
    }
  }, 80)
}

const quickRoll = (faces, count) => {
  selectedDice.value = faces
  diceCount.value = count
  roll()
}

const clearHistory = () => {
  history.value = []
}
</script>

<div class="dice-container">
  
  <div class="dice-section">
    <label class="section-label">选择骰子面数</label>
    <div class="dice-types">
      <div
        v-for="dice in diceTypes"
        :key="dice.faces"
        @click="selectedDice = dice.faces"
        class="dice-type-btn"
        :class="{ active: selectedDice === dice.faces }"
        :style="selectedDice === dice.faces ? { background: dice.color, borderColor: dice.color } : {}"
      >
        {{ dice.name }}
      </div>
    </div>
  </div>
  
  <div class="dice-section">
    <label class="section-label">
      骰子数量: <strong class="count-display">{{ diceCount }}</strong>
    </label>
    <input
      type="range"
      v-model.number="diceCount"
      min="1"
      max="20"
      class="range-slider"
    />
    <div class="range-labels">
      <span>1</span>
      <span>10</span>
      <span>20</span>
    </div>
  </div>
  
  <div class="dice-section">
    <label class="section-label">快速预设</label>
    <div class="quick-presets">
      <span @click="quickRoll(6, 3)" class="preset-btn">3D6</span>
      <span @click="quickRoll(6, 4)" class="preset-btn">4D6</span>
      <span @click="quickRoll(20, 1)" class="preset-btn">1D20</span>
      <span @click="quickRoll(20, 2)" class="preset-btn">2D20</span>
      <span @click="quickRoll(10, 2)" class="preset-btn">2D10</span>
      <span @click="quickRoll(100, 1)" class="preset-btn">1D100</span>
    </div>
  </div>
  
  <div
    @click="roll"
    class="roll-btn"
    :class="{ disabled: rolling }"
  >
    {{ rolling ? '投掷中...' : `投掷 ${diceCount}${currentDice.name}` }}
  </div>
  
  <div v-if="results.length > 0" class="results-area">
    <div class="dice-results">
      <div
        v-for="(result, index) in results"
        :key="index"
        class="dice-box"
        :class="{ small: diceCount > 10 }"
        :style="{ background: currentDice.color }"
      >
        {{ result }}
      </div>
    </div>
    <div class="total-display">
      总计: {{ total }}
    </div>
  </div>
  
</div>

<div v-if="history.length > 0" class="history-container">
  <div class="history-header">
    <h3>历史记录</h3>
    <span @click="clearHistory" class="clear-btn">清空</span>
  </div>
  <div class="history-list">
    <div
      v-for="(record, index) in history"
      :key="index"
      class="history-item"
    >
      <div class="history-left">
        <span class="history-type">{{ record.count }}{{ record.type }}</span>
        <span class="history-results">{{ record.results.join(', ') }}</span>
      </div>
      <div class="history-right">
        <span class="history-total">= {{ record.total }}</span>
        <span class="history-time">{{ record.time }}</span>
      </div>
    </div>
  </div>
</div>

<style>
.dice-container {
  padding: 24px;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  margin: 20px 0;
}

.dice-section {
  margin-bottom: 20px;
}

.section-label {
  display: block;
  margin-bottom: 10px;
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.count-display {
  color: var(--vp-c-brand);
}

.dice-types {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.dice-type-btn {
  padding: 10px 16px;
  border: 2px solid var(--vp-c-border);
  background: transparent;
  color: var(--vp-c-text-1);
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.dice-type-btn.active {
  color: white;
}

.range-slider {
  width: 100%;
  cursor: pointer;
}

.range-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.quick-presets {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.preset-btn {
  padding: 6px 12px;
  font-size: 13px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  cursor: pointer;
  color: var(--vp-c-text-1);
}

.preset-btn:hover {
  background: var(--vp-c-bg-mute);
}

.roll-btn {
  width: 100%;
  padding: 16px;
  font-size: 18px;
  font-weight: 600;
  background: var(--vp-c-brand);
  color: white;
  border-radius: 10px;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
}

.roll-btn.disabled {
  background: var(--vp-c-text-3);
  cursor: not-allowed;
}

.results-area {
  margin-top: 24px;
  padding: 20px;
  background: var(--vp-c-bg);
  border-radius: 10px;
}

.dice-results {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin-bottom: 16px;
}

.dice-box {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  color: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.dice-box.small {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  font-size: 16px;
}

.total-display {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  color: var(--vp-c-brand);
}

.history-container {
  padding: 20px;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  margin-top: 20px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.history-header h3 {
  margin: 0;
  font-size: 16px;
}

.clear-btn {
  padding: 4px 12px;
  font-size: 12px;
  background: transparent;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  cursor: pointer;
  color: var(--vp-c-text-2);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  padding: 12px;
  background: var(--vp-c-bg);
  border-radius: 8px;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-left {
  display: flex;
  gap: 8px;
  align-items: center;
}

.history-type {
  font-weight: 600;
  color: var(--vp-c-brand);
}

.history-results {
  color: var(--vp-c-text-2);
}

.history-right {
  text-align: right;
}

.history-total {
  font-weight: bold;
  font-size: 16px;
}

.history-time {
  color: var(--vp-c-text-3);
  font-size: 12px;
  margin-left: 8px;
}
</style>
