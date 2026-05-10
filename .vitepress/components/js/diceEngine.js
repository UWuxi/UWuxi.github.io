/**
 * PDV Dice Engine — 纯前端掷骰引擎
 * 从 msgReply.py (Pan-Dimension Voyager v0.1.4) 移植
 * 
 * 支持: dn(d6) / dl(d3) / dh(d3+3)
 * 表达式: + - * / ()
 * 优劣势替换: advance / disadvantage
 */

// =========================
// 基础骰子
// =========================

/** 掷一颗骰子 */
function rollOne(kind) {
  switch (kind) {
    case 'dn': return Math.floor(Math.random() * 6) + 1    // 1d6
    case 'dl': return Math.floor(Math.random() * 3) + 1    // 1d3
    case 'dh': return Math.floor(Math.random() * 3) + 4    // 1d3+3
    default: throw new Error(`未知骰子类型: ${kind}`)
  }
}

/** 掷 N 颗同类型骰子，返回数组 */
function rollDice(count, kind) {
  count = Math.max(1, Math.min(count || 1, 99))
  return Array.from({ length: count }, () => rollOne(kind))
}

// =========================
// 表达式标准化
// =========================

function normalizeExpr(expr) {
  let s = (expr || '').trim()
  // 运算符标准化: ×→*  ÷→/
  s = s.replace(/[×xX]/g, '*').replace(/÷/g, '/')
  // 统一 dn/dl/dh 大小写 (只保留小写)
  // 注意：保持 'd' 前缀不变，只转换后面的 n/l/h 大小写
  // 使用 'd' 字面量 + i 标志来匹配 D/d
  s = s.replace(/\b(\d*)d([nNlLhH])\b/gi, (m, n, k) => {
    return (n || '') + 'd' + k.toLowerCase()
  })
  // 处理 "3d n" "2d l" 这种空格写法
  s = s.replace(/\b(\d*)d\s+([nNlLhH])\b/gi, (m, n, k) => {
    return (n || '') + 'd' + k.toLowerCase()
  })
  return s
}

// =========================
// 表达式求值
// =========================

/**
 * 安全求值（仅限 + - * / 和数字）
 * 使用 Function 构造器，在浏览器中安全（无 Node 环境变量注入）
 */
function safeEval(numericExpr) {
  // 只允许数字、运算符、括号、小数点、空格
  if (!/^[\d+\-*/().\s]+$/.test(numericExpr)) {
    throw new Error('表达式包含不合法字符')
  }
  try {
    const result = new Function(`return (${numericExpr})`)()
    if (typeof result !== 'number' || !isFinite(result)) {
      throw new Error('计算结果异常')
    }
    return result
  } catch (e) {
    throw new Error(`表达式求值失败: ${e.message}`)
  }
}

/**
 * 匹配所有骰子 token：Ndn / Ndl / Ndh
 */
function findDiceTokens(expr) {
  const tokens = []
  const re = /\b(\d*)(dn|dl|dh)\b/g
  let match
  while ((match = re.exec(expr)) !== null) {
    const count = match[1] ? parseInt(match[1]) : 1
    tokens.push({
      start: match.index,
      end: match.index + match[0].length,
      count,
      kind: match[2],
    })
  }
  return tokens
}

/**
 * 完整求值
 * 返回: { origin, expanded, total, details }
 *   origin: 原始表达式
 *   expanded: 展开后表达式（骰子替换为数值）
 *   total: 最终数值
 *   details: [{ kind, count, rolls: [...] }, ...]
 */
function evalExpr(expr) {
  const origin = normalizeExpr(expr)
  if (!origin) throw new Error('表达式为空')

  const tokens = findDiceTokens(origin)
  const details = []

  // 如果没有骰子，直接求值
  if (tokens.length === 0) {
    const total = safeEval(origin)
    return { origin, expanded: origin, total, details: [] }
  }

  // 替换骰子为具体数值
  let expanded = origin
  const rollResults = []  // 用于构建 expanded 字符串

  // 按 token 反向替换（从右到左，避免位置偏移）
  for (const token of tokens.reverse()) {
    const rolls = rollDice(token.count, token.kind)
    const sum = rolls.reduce((a, b) => a + b, 0)
    const rollStr = rolls.join('+')
    const replaceStr = rolls.length > 1 ? `(${rollStr})` : `${rollStr}`

    expanded = expanded.slice(0, token.start) + replaceStr + expanded.slice(token.end)

    details.push({
      kind: token.kind,
      count: token.count,
      rolls,
    })
  }

  const total = safeEval(expanded)

  return { origin, expanded, total, details }
}

// =========================
// 展开式美化
// =========================

function formatExpanded(origin, expanded) {
  if (origin === expanded) return expanded
  return expanded
}

function formatDetail(detail) {
  const label = { dn: 'd6', dl: 'd3', dh: 'd3+3' }[detail.kind] || detail.kind
  const rolls = detail.rolls.join(', ')
  return `${detail.count}${label} → [${rolls}]`
}

// =========================
// 优劣势替换
// =========================

/**
 * 解析优劣势 token
 * 支持: 优势/优势1/优势2/优势3, 劣势/劣势1/劣势2/劣势3
 *        adv/adv1/adv2/adv3, dis/dis1/dis2/dis3
 * 返回: { adv, dis, rest: string[] }
 */
function parseMod(tokens) {
  let adv = 0
  let dis = 0
  const rest = []

  for (const tok of tokens) {
    const zhMatch = tok.match(/^(优势|劣势)([123])?$/)
    if (zhMatch) {
      const cnt = zhMatch[2] ? parseInt(zhMatch[2]) : 1
      if (zhMatch[1] === '优势') adv += cnt
      else dis += cnt
      continue
    }
    const enMatch = tok.match(/^(adv|dis)([123])?$/i)
    if (enMatch) {
      const cnt = enMatch[2] ? parseInt(enMatch[2]) : 1
      if (enMatch[1].toLowerCase() === 'adv') adv += cnt
      else dis += cnt
      continue
    }
    rest.push(tok)
  }

  return { adv: Math.min(adv, 3), dis: Math.min(dis, 3), rest }
}

/**
 * 将 expr 中的 fromKind 骰子替换 need 颗为 toKind
 * 按出现顺序替换
 */
function replaceKind(expr, fromKind, toKind, need) {
  if (need <= 0) return { expr, replaced: 0 }

  const tokenRe = new RegExp(`\\b(\\d*)${fromKind}\\b`, 'g')
  const tokens = []
  let match
  while ((match = tokenRe.exec(expr)) !== null) {
    tokens.push({
      start: match.index,
      end: match.index + match[0].length,
      count: match[1] ? parseInt(match[1]) : 1,
    })
  }

  let totalFrom = tokens.reduce((s, t) => s + t.count, 0)
  if (totalFrom <= 0) return { expr, replaced: 0 }

  let left = Math.min(need, totalFrom)
  let replaced = 0
  let result = ''
  let lastIndex = 0

  for (const token of tokens) {
    result += expr.slice(lastIndex, token.start)
    if (left <= 0) {
      result += expr.slice(token.start, token.end)
    } else {
      const rep = Math.min(left, token.count)
      const keep = token.count - rep
      left -= rep
      replaced += rep

      const parts = []
      if (keep > 0) parts.push(keep === 1 ? fromKind : `${keep}${fromKind}`)
      if (rep > 0) parts.push(rep === 1 ? toKind : `${rep}${toKind}`)

      if (keep > 0 && rep > 0) {
        result += '(' + parts.join('+') + ')'
      } else {
        result += parts[0]
      }
    }
    lastIndex = token.end
  }

  result += expr.slice(lastIndex)
  return { expr: result, replaced }
}

/**
 * 应用优劣势
 * 优势: dn → dl (优先), dh → dl
 * 劣势: dn → dh (优先), dl → dh
 */
function applyAdvDis(expr, adv, dis) {
  let warn = ''
  let result = expr

  if (adv > 0) {
    const r1 = replaceKind(result, 'dn', 'dl', adv)
    result = r1.expr
    let left = adv - r1.replaced
    if (left > 0) {
      const r2 = replaceKind(result, 'dh', 'dl', left)
      result = r2.expr
      left -= r2.replaced
    }
    if (left > 0) {
      warn += `优势替换不足：需要 ${adv} 颗，实际替换 ${adv - left} 颗；`
    }
  }

  if (dis > 0) {
    const r1 = replaceKind(result, 'dn', 'dh', dis)
    result = r1.expr
    let left = dis - r1.replaced
    if (left > 0) {
      const r2 = replaceKind(result, 'dl', 'dh', left)
      result = r2.expr
      left -= r2.replaced
    }
    if (left > 0) {
      warn += `劣势替换不足：需要 ${dis} 颗，实际替换 ${dis - left} 颗；`
    }
  }

  return { expr: result, warn }
}

// =========================
// 快捷公式
// =========================

const QUICK_EXPRS = {
  '3dn': '3dn',
  'dc': 'dn+dl+dh',
  'dn': 'dn',
  'dl': 'dl',
  'dh': 'dh',
  '2dn': '2dn',
  '3dl': '3dl',
  '2dh': '2dh',
}

// =========================
// 历史记录
// =========================

const HISTORY_KEY = 'pdv-dice-history'

function pushHistory(record) {
  const history = getHistory()
  history.unshift({
    ...record,
    timestamp: Date.now(),
  })
  // 保留最近 100 条
  if (history.length > 100) history.length = 100
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  } catch (e) {
    // localStorage 满时静默忽略
  }
}

function getHistory(limit = 50) {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data.slice(0, limit) : []
  } catch {
    return []
  }
}

function clearHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY)
  } catch {}
}

// =========================
// 导出
// =========================

export {
  rollOne,
  rollDice,
  normalizeExpr,
  safeEval,
  evalExpr,
  formatDetail,
  parseMod,
  replaceKind,
  applyAdvDis,
  QUICK_EXPRS,
  pushHistory,
  getHistory,
  clearHistory,
}
