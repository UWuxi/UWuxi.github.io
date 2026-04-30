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

const selectedDice = ref(6) // 默认D6
const diceCount = ref(1)    // 默认1个
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
  
  // 生成结果
  const newResults = []
  for (let i = 0; i < diceCount.value; i++) {
    newResults.push(Math.floor(Math.random() * selectedDice.value) + 1)
  }
  
  // 动画效果
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
      // 添加到历史记录
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

<div style="padding: 24px; background: var(--vp-c-bg-soft); border-radius: 12px; margin: 20px 0;">
  
  <!-- 骰子类型选择 -->
  <div style="margin-bottom: 20px;">
    <label style="display: block; margin-bottom: 10px; font-size: 14px; color: var(--vp-c-text-2);">选择骰子面数</label>
    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
      <button
        v-for="dice in diceTypes"
        :key="dice.faces"
        @click="selectedDice = dice.faces"
        :style="{
          padding: '10px 16px',
          border: '2px solid ' + (selectedDice === dice.faces ? dice.color : 'var(--vp-c-border)'),
          background: selectedDice === dice.faces ? dice.color : 'transparent',
          color: selectedDice === dice.faces ? 'white' : 'var(--vp-c-text-1)',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '600',
          transition: 'all 0.2s'
        }"
      >
        {{ dice.name }}
      </button>
    </div>
  </div>
  
  <!-- 数量选择 -->
  <div style="margin-bottom: 24px;">
    <label style="display: block; margin-bottom: 10px; font-size: 14px; color: var(--vp-c-text-2);">
      骰子数量: <strong style="color: var(--vp-c-brand);">{{ diceCount }}</strong>
    </label>
    <input
      type="range"
      v-model.number="diceCount"
      min="1"
      max="20"
      style="width: 100%; cursor: pointer;"
    />
    <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 12px; color: var(--vp-c-text-2);">
      <span>1</span>
      <span>10</span>
      <span>20</span>
    </div>
  </div>
  
  <!-- 快速预设 -->
  <div style="margin-bottom: 24px;">
    <label style="display: block; margin-bottom: 10px; font-size: 14px; color: var(--vp-c-text-2);">快速预设</label>
    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
      <button @click="quickRoll(6, 3)" style="padding: 6px 12px; font-size: 13px; background: var(--vp-c-bg); border: 1px solid var(--vp-c-border); border-radius: 6px; cursor: pointer;">3D6</button>
      <button @click="quickRoll(6, 4)" style="padding: 6px 12px; font-size: 13px; background: var(--vp-c-bg); border: 1px solid var(--vp-c-border); border-radius: 6px; cursor: pointer;">4D6</button>
      <button @click="quickRoll(20, 1)" style="padding: 6px 12px; font-size: 13px; background: var(--vp-c-bg); border: 1px solid var(--vp-c-border); border-radius: 6px; cursor: pointer;">1D20</button>
      <button @click="quickRoll(20, 2)" style="padding: 6px 12px; font-size: 13px; background: var(--vp-c-bg); border: 1px solid var(--vp-c-border); border-radius: 6px; cursor: pointer;">2D20</button>
      <button @click="quickRoll(10, 2)" style="padding: 6px 12px; font-size: 13px; background: var(--vp-c-bg); border: 1px solid var(--vp-c-border); border-radius: 6px; cursor: pointer;">2D10 (D100)</button>
      <button @click="quickRoll(100, 1)" style="padding: 6px 12px; font-size: 13px; background: var(--vp-c-bg); border: 1px solid var(--vp-c-border); border-radius: 6px; cursor: pointer;">1D100</button>
    </div>
  </div>
  
  <!-- 投掷按钮 -->
  <button
    @click="roll"
    :disabled="rolling"
    :style="{
      width: '100%',
      padding: '16px',
      fontSize: '18px',
      fontWeight: '600',
      background: rolling ? 'var(--vp-c-text-3)' : 'var(--vp-c-brand)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: rolling ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s'
    }"
  >
    {{ rolling ? '投掷中...' : `投掷 ${diceCount}${currentDice.name}` }}
  </button>
  
  <!-- 结果显示 -->
  <div v-if="results.length > 0" style="margin-top: 24px; padding: 20px; background: var(--vp-c-bg); border-radius: 10px;">
    <div style="display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin-bottom: 16px;">
      <div
        v-for="(result, index) in results"
        :key="index"
        :style="{
          width: diceCount.value > 10 ? '50px' : '60px',
          height: diceCount.value > 10 ? '50px' : '60px',
          background: currentDice.color,
          borderRadius: diceCount.value > 10 ? '8px' : '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: diceCount.value > 10 ? '16px' : '20px',
          fontWeight: 'bold',
          color: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          transition: 'transform 0.1s'
        }"
        :class="{ 'rolling-dice': rolling }"
      >
        {{ result }}
      </div>
    </div>
    <div style="text-align: center; font-size: 24px; font-weight: bold; color: var(--vp-c-brand);">
      总计: {{ total }}
    </div>
  </div>
  
</div>

<!-- 历史记录 -->
<div v-if="history.length > 0" style="padding: 20px; background: var(--vp-c-bg-soft); border-radius: 12px; margin-top: 20px;">
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
    <h3 style="margin: 0; font-size: 16px;">历史记录</h3>
    <button @click="clearHistory" style="padding: 4px 12px; font-size: 12px; background: transparent; border: 1px solid var(--vp-c-border); border-radius: 4px; cursor: pointer; color: var(--vp-c-text-2);">清空</button>
  </div>
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <div
      v-for="(record, index) in history"
      :key="index"
      style="padding: 12px; background: var(--vp-c-bg); border-radius: 8px; font-size: 14px; display: flex; justify-content: space-between; align-items: center;"
    >
      <div>
        <span style="font-weight: 600; color: var(--vp-c-brand);">{{ record.count }}{{ record.type }}</span>
        <span style="color: var(--vp-c-text-2); margin-left: 8px;">{{ record.results.join(', ') }}</span>
      </div>
      <div style="text-align: right;">
        <span style="font-weight: bold; font-size: 16px;">= {{ record.total }}</span>
        <span style="color: var(--vp-c-text-3); font-size: 12px; margin-left: 8px;">{{ record.time }}</span>
      </div>
    </div>
  </div>
</div>

<style scoped>
.rolling-dice {
  animation: shake 0.1s infinite;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px) rotate(-2deg); }
  75% { transform: translateX(2px) rotate(2deg); }
}
</style>
