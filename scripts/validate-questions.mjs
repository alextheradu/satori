// Validates every question file in src/data/questions. Run: npm run validate
import { readdirSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import katex from 'katex'

const dir = join(dirname(fileURLToPath(import.meta.url)), '../src/data/questions')
const DOMAINS = {
  rw: ['Information and Ideas', 'Craft and Structure', 'Expression of Ideas', 'Standard English Conventions'],
  math: ['Algebra', 'Advanced Math', 'Problem-Solving and Data Analysis', 'Geometry and Trigonometry'],
}
const MATH_RE = /(?<!\\)\$((?:\\.|[^$\\])+?)\$/g
const num = (s) => {
  const t = s.replace(/\s+/g, '')
  const f = /^(-?)(\d+(?:\.\d+)?|\.\d+)\/(\d+(?:\.\d+)?|\.\d+)$/.exec(t)
  if (f) return (f[1] ? -1 : 1) * (Number(f[2]) / Number(f[3]))
  return /^-?(\d+\.?\d*|\.\d+)$/.test(t) ? Number(t) : null
}

const errors = []
const ids = new Set()
let total = 0
const stats = {}

for (const f of readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
  let list
  try {
    list = JSON.parse(readFileSync(join(dir, f), 'utf8'))
  } catch (e) {
    errors.push(`${f}: invalid JSON (${e.message})`)
    continue
  }
  for (const q of list) {
    total++
    const at = `${f}#${q.id}`
    const err = (m) => errors.push(`${at}: ${m}`)
    if (!q.id || ids.has(q.id)) err('missing or duplicate id')
    ids.add(q.id)
    if (!DOMAINS[q.section]) err(`bad section ${q.section}`)
    else if (!DOMAINS[q.section].includes(q.domain)) err(`bad domain ${q.domain}`)
    if (!['easy', 'medium', 'hard'].includes(q.difficulty)) err('bad difficulty')
    for (const k of ['skill', 'prompt', 'explanation']) if (typeof q[k] !== 'string' || !q[k].trim()) err(`missing ${k}`)
    if (q.choices) {
      if (q.choices.length !== 4) err('needs exactly 4 choices')
      if (new Set(q.choices).size !== q.choices.length) err('duplicate choices')
      if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) err('MC answer must be 0-3')
      else (stats[`${q.section}:idx${q.answer}`] = (stats[`${q.section}:idx${q.answer}`] ?? 0) + 1)
    } else {
      if (!Array.isArray(q.answer) || !q.answer.length) err('SPR needs answer array')
      else if (q.answer.some((a) => num(a) === null)) err(`SPR answer not numeric: ${q.answer}`)
      else {
        const vals = q.answer.map(num)
        if (vals.some((v) => Math.abs(v - vals[0]) > 0.0015)) err(`SPR answers disagree: ${q.answer}`)
      }
      stats[`${q.section}:spr`] = (stats[`${q.section}:spr`] ?? 0) + 1
    }
    const texts = [q.passage, q.prompt, q.explanation, ...(q.choices ?? [])].filter(Boolean)
    for (const t of texts) {
      const stripped = t.replace(MATH_RE, '').replace(/\\\$/g, '')
      if (stripped.includes('$')) err(`unbalanced $ in: ${t.slice(0, 60)}…`)
      for (const m of t.matchAll(MATH_RE)) {
        try {
          katex.renderToString(m[1], { throwOnError: true, strict: false })
        } catch (e) {
          err(`KaTeX error "${m[1]}": ${e.message.split('\n')[0]}`)
        }
      }
    }
    stats[`${q.section}:${q.difficulty}`] = (stats[`${q.section}:${q.difficulty}`] ?? 0) + 1
  }
}

console.log(`${total} questions checked`)
console.log(Object.entries(stats).sort().map(([k, v]) => `  ${k}: ${v}`).join('\n'))
if (errors.length) {
  console.error(`\n${errors.length} problem(s):\n` + errors.join('\n'))
  process.exit(1)
}
console.log('All good.')
