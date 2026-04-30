<template>
  <div class="color-generator">
    <div class="color-display" :style="{ backgroundColor: currentColor }">
      <div class="color-info">
        <div class="color-value">{{ currentColor }}</div>
        <div class="color-rgb">{{ rgbValue }}</div>
      </div>
    </div>
    
    <div class="format-tabs">
      <button 
        v-for="fmt in formats" 
        :key="fmt"
        :class="['tab-btn', { active: format === fmt }]"
        @click="format = fmt"
      >
        {{ fmt.toUpperCase() }}
      </button>
    </div>
    
    <div class="color-code">
      <code>{{ formattedColor }}</code>
      <button class="copy-btn" @click="copyToClipboard">
        {{ copied ? '✓ 已复制' : '📋 复制' }}
      </button>
    </div>
    
    <button class="generate-btn" @click="generate">
      🎨 生成颜色
    </button>
    
    <div class="history" v-if="history.length > 0">
      <h4>最近生成</h4>
      <div class="history-colors">
        <div 
          v-for="(color, index) in history.slice(0, 8)" 
          :key="index"
          class="history-color"
          :style="{ backgroundColor: color }"
          @click="setColor(color)"
          :title="color"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const formats = ['hex', 'rgb', 'hsl']
const format = ref('hex')
const currentColor = ref(generateRandomColor())
const history = ref([])
const copied = ref(false)

function generateRandomColor() {
  const r = Math.floor(Math.random() * 256)
  const g = Math.floor(Math.random() * 256)
  const b = Math.floor(Math.random() * 256)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

function hexToHsl(hex) {
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2

  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

const rgbValue = computed(() => {
  const rgb = hexToRgb(currentColor.value)
  return rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : ''
})

const formattedColor = computed(() => {
  switch (format.value) {
    case 'rgb':
      return rgbValue.value
    case 'hsl': {
      const hsl = hexToHsl(currentColor.value)
      return hsl ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : ''
    }
    default:
      return currentColor.value
  }
})

function generate() {
  history.value.unshift(currentColor.value)
  if (history.value.length > 16) history.value.pop()
  currentColor.value = generateRandomColor()
  copied.value = false
}

function setColor(color) {
  currentColor.value = color
  copied.value = false
}

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(formattedColor.value)
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  } catch (err) {
    console.error('复制失败:', err)
  }
}
</script>

<style scoped>
.color-generator {
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  padding: 24px;
}

.color-display {
  height: 160px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
  margin-bottom: 20px;
}

.color-info {
  background: rgba(0, 0, 0, 0.7);
  padding: 12px 24px;
  border-radius: 8px;
  text-align: center;
}

.color-value {
  font-size: 24px;
  font-weight: bold;
  font-family: monospace;
  color: white;
}

.color-rgb {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 4px;
}

.format-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.tab-btn {
  flex: 1;
  padding: 10px;
  border: 1px solid var(--vp-c-brand);
  background: transparent;
  color: var(--vp-c-brand);
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: var(--vp-c-brand-dimm);
}

.tab-btn.active {
  background: var(--vp-c-brand);
  color: white;
}

.color-code {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.color-code code {
  flex: 1;
  padding: 12px 16px;
  background: var(--vp-c-bg);
  border-radius: 6px;
  font-family: monospace;
  font-size: 14px;
  color: var(--vp-c-text-1);
}

.copy-btn {
  padding: 12px 20px;
  background: var(--vp-c-brand);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.copy-btn:hover {
  background: var(--vp-c-brand-dark);
}

.generate-btn {
  width: 100%;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, var(--vp-c-brand), var(--vp-c-brand-light));
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.generate-btn:hover {
  transform: translateY(-2px);
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

.history-colors {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.history-color {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.history-color:hover {
  transform: scale(1.1);
  border-color: var(--vp-c-brand);
}
</style>