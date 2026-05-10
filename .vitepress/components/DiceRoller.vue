<template>
  <div class="pdv-dice-roller">
    <!-- 掷骰面板 -->
    <div class="panel">
      <h3>掷骰</h3>
      <div class="input-row">
        <input
          v-model="exprInput"
          type="text"
          class="dice-input"
          placeholder='输入表达式，如 3dn、dn+2dl+dh、dc'
          @keyup.enter="doRoll"
        />
        <button class="btn btn-roll" @click="doRoll">掷骰</button>
      </div>

      <!-- 快捷公式 -->
      <div class="quick-btns">
        <button
          v-for="(expr, label) in quickExprs"
          :key="label"
          class="btn btn-quick"
          :class="{ active: exprInput === expr }"
          @click="exprInput = expr; doRoll()"
        >
          {{ label }}
        </button>
      </div>

      <!-- 优劣势 -->
      <div class="mod-row">
        <label>优劣势：</label>
        <div class="mod-btns">
          <button
            v-for="n in 3" :key="'adv'+n"
            class="btn btn-mod btn-adv"
            :class="{ active: advCount === n }"
            @click="advCount = advCount === n ? 0 : n"
          >
            优势{{ n }}
          </button>
          <button
            v-for="n in 3" :key="'dis'+n"
            class="btn btn-mod btn-dis"
            :class="{ active: disCount === n }"
            @click="disCount = disCount === n ? 0 : n"
          >
            劣势{{ n }}
          </button>
        </div>
        <button class="btn btn-sm" @click="advCount = 0; disCount = 0">清除</button>
      </div>
    </div>

    <!-- 结果区 -->
    <div v-if="result" class="result-panel" :class="resultClass">
      <div class="result-origin">{{ result.origin }}</div>
      <div class="result-expanded">= {{ result.expanded }}</div>
      <div class="result-total">= <strong>{{ result.total }}</strong></div>
      <div v-if="result.warn" class="result-warn">{{ result.warn }}</div>
      <div v-if="result.details.length" class="result-details">
        <div v-for="(d, i) in result.details" :key="i" class="detail-item">
          <span class="detail-kind">{{ d.kind === 'dn' ? 'd6' : d.kind === 'dl' ? 'd3' : 'd3+3' }}</span>
          <span class="detail-count">×{{ d.count }}</span>
          <span class="detail-rolls">[{{ d.rolls.join(', ') }}]</span>
          <span class="detail-sum">= {{ d.rolls.reduce((a,b) => a+b, 0) }}</span>
        </div>
      </div>
    </div>

    <!-- 自定义判定 -->
    <div class="panel judge-panel">
      <h3>自定义判定</h3>
      <div class="judge-row">
        <div class="judge-field">
          <label>检定项</label>
          <input v-model="judgeName" type="text" class="dice-input" placeholder="如 攀爬、潜行、演说" />
        </div>
        <div class="judge-field">
          <label>难度</label>
          <input v-model.number="judgeDiff" type="number" class="dice-input judge-diff" min="1" max="99" />
        </div>
      </div>
      <div class="judge-row">
        <div class="judge-field">
          <label>骰子公式 <span class="label-hint">(默认3dn)</span></label>
          <input v-model="judgeExpr" type="text" class="dice-input" placeholder="3dn" @keyup.enter="doJudge" />
        </div>
        <div class="judge-field judge-mod-field">
          <label>优劣势</label>
          <div class="mod-btns mod-inline">
            <button
              v-for="n in 3" :key="'jad'+n"
              class="btn btn-mod btn-adv btn-xs"
              :class="{ active: judgeAdv === n }"
              @click="judgeAdv = judgeAdv === n ? 0 : n"
            >优{{ n }}</button>
            <button
              v-for="n in 3" :key="'jds'+n"
              class="btn btn-mod btn-dis btn-xs"
              :class="{ active: judgeDis === n }"
              @click="judgeDis = judgeDis === n ? 0 : n"
            >劣{{ n }}</button>
          </div>
        </div>
      </div>
      <button class="btn btn-judge" @click="doJudge">判定</button>

      <!-- 判定结果 -->
      <div v-if="judgeResult" class="judge-result" :class="judgeSuccess ? 'judge-success' : 'judge-fail'">
        <div class="judge-header">
          【判定】{{ judgeResult.name }} 难度 {{ judgeResult.diff }}
        </div>
        <div class="judge-dice">
          {{ judgeResult.origin }} = {{ judgeResult.expanded }} = <strong>{{ judgeResult.total }}</strong>
        </div>
        <div v-if="judgeResult.warn" class="judge-warn">{{ judgeResult.warn }}</div>
        <div class="judge-verdict">
          <span class="verdict-label">{{ judgeSuccess ? '成功' : '失败' }}</span>
          <span class="verdict-detail">
            （{{ judgeResult.total }} {{ judgeSuccess ? '≤' : '>' }} {{ judgeResult.diff }}）
          </span>
        </div>
        <div v-if="judgeSuccess" class="judge-degree">
          成功度：{{ judgeResult.diff }} − {{ judgeResult.total }} = {{ judgeDegree }}
        </div>
      </div>
    </div>

    <!-- 历史记录 -->
    <div class="panel history-panel">
      <div class="history-header">
        <h3>历史记录</h3>
        <button v-if="history.length" class="btn btn-sm" @click="clearHist">清除</button>
      </div>
      <div v-if="!history.length" class="history-empty">暂无记录</div>
      <div v-else class="history-list">
        <div v-for="(h, i) in history" :key="i" class="history-item">
          <span class="h-type">{{ h.type === 'roll' ? '掷骰' : '判定' }}</span>
          <span class="h-expr">{{ h.origin }}</span>
          <span class="h-result">= <strong>{{ h.total }}</strong></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  evalExpr,
  normalizeExpr,
  parseMod,
  applyAdvDis,
  QUICK_EXPRS,
  pushHistory,
  getHistory,
  clearHistory as clearHistStorage,
} from './js/diceEngine.js'

// =========================
// 掷骰
// =========================
const exprInput = ref('3dn')
const advCount = ref(0)
const disCount = ref(0)
const result = ref(null)
const resultClass = ref('')

function doRoll() {
  if (!exprInput.value.trim()) return

  try {
    let expr = normalizeExpr(exprInput.value)
    let warn = ''

    // 应用优劣势
    if (advCount.value > 0 || disCount.value > 0) {
      const r = applyAdvDis(expr, advCount.value, disCount.value)
      expr = r.expr
      warn = r.warn
    }

    const out = evalExpr(expr)
    out.warn = warn
    out.origin = exprInput.value
    out.type = 'roll'
    result.value = out

    const total = out.total
    resultClass.value = total >= 10 ? 'result-high' : total <= 3 ? 'result-low' : ''

    pushHistory({ type: 'roll', origin: exprInput.value, total })
  } catch (e) {
    result.value = { origin: exprInput.value, expanded: '错误', total: e.message, details: [], warn: '' }
    resultClass.value = 'result-error'
  }
}

// =========================
// 判定
// =========================
const judgeName = ref('')
const judgeDiff = ref(12)
const judgeExpr = ref('3dn')
const judgeAdv = ref(0)
const judgeDis = ref(0)
const judgeResult = ref(null)
const judgeSuccess = computed(() => judgeResult.value && judgeResult.value.total <= judgeResult.value.diff)
const judgeDegree = computed(() => {
  if (!judgeResult.value || !judgeSuccess.value) return 0
  return judgeResult.value.diff - judgeResult.value.total
})

function doJudge() {
  if (!judgeName.value.trim()) {
    judgeResult.value = null
    return
  }

  try {
    let expr = normalizeExpr(judgeExpr.value || '3dn')
    let warn = ''

    if (judgeAdv.value > 0 || judgeDis.value > 0) {
      const r = applyAdvDis(expr, judgeAdv.value, judgeDis.value)
      expr = r.expr
      warn = r.warn
    }

    const out = evalExpr(expr)
    out.warn = warn
    out.name = judgeName.value
    out.diff = judgeDiff.value

    judgeResult.value = out
    pushHistory({ type: 'judge', origin: `${judgeName.value} ${judgeDiff.value}`, total: out.total })
  } catch (e) {
    judgeResult.value = {
      name: judgeName.value,
      diff: judgeDiff.value,
      origin: judgeExpr.value,
      expanded: '错误',
      total: e.message,
      warn: '',
    }
  }
}

// =========================
// 历史
// =========================
const history = ref(getHistory())

function clearHist() {
  clearHistStorage()
  history.value = []
}

// =========================
// 快捷公式
// =========================
const quickExprs = QUICK_EXPRS
</script>

<style scoped>
.pdv-dice-roller {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 600px;
  margin: 0 auto;
}

.panel {
  background: var(--vp-c-bg-soft, #f6f6f7);
  border: 1px solid var(--vp-c-divider, #e2e2e3);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.panel h3 {
  margin: 0 0 12px 0;
  font-size: 15px;
  font-weight: 600;
}

/* 输入行 */
.input-row {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.dice-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--vp-c-divider, #ddd);
  border-radius: 6px;
  font-size: 16px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  background: var(--vp-c-bg, #fff);
  color: var(--vp-c-text-1, #333);
  outline: none;
  transition: border-color 0.2s;
}

.dice-input:focus {
  border-color: var(--vp-c-brand, #646cff);
}

/* 按钮 */
.btn {
  padding: 8px 16px;
  border: 1px solid var(--vp-c-divider, #ddd);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.15s;
  background: var(--vp-c-bg, #fff);
  color: var(--vp-c-text-1, #333);
  white-space: nowrap;
}

.btn:hover {
  border-color: var(--vp-c-brand, #646cff);
  color: var(--vp-c-brand, #646cff);
}

.btn-roll {
  background: var(--vp-c-brand, #646cff);
  color: #fff;
  border-color: var(--vp-c-brand, #646cff);
}

.btn-roll:hover {
  opacity: 0.85;
  color: #fff;
}

.btn-sm {
  padding: 4px 10px;
  font-size: 12px;
}

.btn-xs {
  padding: 3px 8px;
  font-size: 11px;
}

/* 快捷公式 */
.quick-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.btn-quick {
  padding: 4px 10px;
  font-size: 12px;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.btn-quick.active {
  background: var(--vp-c-brand-soft, #e8e8ff);
  border-color: var(--vp-c-brand, #646cff);
}

/* 优劣势 */
.mod-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.mod-row label {
  font-size: 13px;
  color: var(--vp-c-text-2, #666);
}

.mod-btns {
  display: flex;
  gap: 4px;
}

.mod-inline {
  display: inline-flex;
}

.btn-mod {
  padding: 4px 10px;
  font-size: 12px;
}

.btn-adv { color: #2d8a4e; }
.btn-adv.active { background: #d4edda; border-color: #2d8a4e; color: #155724; }
.btn-dis { color: #b02a37; }
.btn-dis.active { background: #f8d7da; border-color: #b02a37; color: #721c24; }

/* 结果区 */
.result-panel {
  background: var(--vp-c-bg-soft, #f6f6f7);
  border: 2px solid var(--vp-c-divider, #e2e2e3);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  text-align: center;
}

.result-high { border-color: #2d8a4e; }
.result-low { border-color: #b02a37; }
.result-error { border-color: #dc3545; }

.result-origin {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

.result-expanded {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 14px;
  color: var(--vp-c-text-2, #666);
  margin-bottom: 4px;
  word-break: break-all;
}

.result-total {
  font-size: 28px;
  font-weight: 700;
  margin: 8px 0;
}

.result-total strong {
  color: var(--vp-c-brand, #646cff);
}

.result-warn {
  font-size: 12px;
  color: #b02a37;
  margin-top: 4px;
}

.result-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
}

.detail-item {
  font-size: 13px;
  display: flex;
  justify-content: center;
  gap: 8px;
}

.detail-kind { font-weight: 600; }
.detail-rolls { color: var(--vp-c-text-2, #666); }
.detail-sum { font-weight: 600; }

/* 判定面板 */
.judge-panel {
  border-color: var(--vp-c-brand, #646cff);
}

.judge-row {
  display: flex;
  gap: 12px;
  margin-bottom: 10px;
}

.judge-field {
  flex: 1;
}

.judge-field label {
  display: block;
  font-size: 12px;
  color: var(--vp-c-text-2, #666);
  margin-bottom: 4px;
}

.label-hint {
  font-weight: 400;
  color: var(--vp-c-text-3, #999);
}

.judge-diff {
  max-width: 80px;
}

.judge-mod-field {
  flex: 0 0 auto;
}

.btn-judge {
  width: 100%;
  padding: 10px;
  background: var(--vp-c-brand, #646cff);
  color: #fff;
  border-color: var(--vp-c-brand, #646cff);
  font-size: 15px;
}

.btn-judge:hover { opacity: 0.85; color: #fff; }

/* 判定结果 */
.judge-result {
  margin-top: 12px;
  padding: 12px;
  border-radius: 6px;
  background: var(--vp-c-bg, #fff);
  border: 1px solid var(--vp-c-divider, #ddd);
  text-align: center;
}

.judge-success { border-color: #2d8a4e; }
.judge-fail { border-color: #b02a37; }

.judge-header {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 6px;
}

.judge-dice {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 14px;
  color: var(--vp-c-text-2, #666);
  margin-bottom: 6px;
}

.judge-warn {
  font-size: 12px;
  color: #b02a37;
  margin-bottom: 4px;
}

.judge-verdict {
  font-size: 20px;
  font-weight: 700;
  margin: 8px 0;
}

.judge-success .verdict-label { color: #2d8a4e; }
.judge-fail .verdict-label { color: #b02a37; }

.verdict-detail {
  font-size: 14px;
  font-weight: 400;
  color: var(--vp-c-text-2, #666);
}

.judge-degree {
  font-size: 13px;
  color: var(--vp-c-text-2, #666);
}

/* 历史 */
.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.history-header h3 { margin: 0; }

.history-empty {
  color: var(--vp-c-text-3, #999);
  font-size: 13px;
  text-align: center;
  padding: 12px;
}

.history-list {
  max-height: 200px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-size: 13px;
  border-bottom: 1px solid var(--vp-c-divider, #eee);
}

.history-item:last-child { border-bottom: none; }

.h-type {
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 3px;
  background: var(--vp-c-brand-soft, #e8e8ff);
  color: var(--vp-c-brand, #646cff);
}

.h-expr {
  font-family: 'SF Mono', 'Fira Code', monospace;
  flex: 1;
  color: var(--vp-c-text-2, #666);
}

.h-result {
  font-family: 'SF Mono', 'Fira Code', monospace;
}

/* 暗色模式适配 */
:root.dark .panel {
  background: var(--vp-c-bg-soft, #1e1e20);
}

:root.dark .dice-input {
  background: var(--vp-c-bg, #242424);
  color: var(--vp-c-text-1, #ddd);
}

:root.dark .btn {
  background: var(--vp-c-bg, #242424);
  color: var(--vp-c-text-1, #ddd);
}

:root.dark .result-panel,
:root.dark .judge-result {
  background: var(--vp-c-bg, #242424);
}

@media (max-width: 480px) {
  .judge-row {
    flex-direction: column;
    gap: 8px;
  }
  .judge-diff { max-width: 100%; }
}
</style>
