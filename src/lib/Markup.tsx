import katex from 'katex'
import { Fragment, type ReactNode } from 'react'

const MATH_RE = /(?<!\\)\$((?:\\.|[^$\\])+?)\$/g

function renderTex(tex: string, key: number) {
  const html = katex.renderToString(tex, { throwOnError: false, strict: false })
  return <span key={key} dangerouslySetInnerHTML={{ __html: html }} />
}

/** bold / underline / blanks inside a non-math run of text */
function renderText(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = []
  const re = /(_{4,})|\*\*(.+?)\*\*|(?<![\w\\])_([^_\n]+?)_(?![\w])/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const k = `${keyBase}-${i++}`
    if (m[1]) out.push(<span key={k} className="blank" aria-label="blank" />)
    else if (m[2] !== undefined) out.push(<strong key={k}>{renderInline(m[2], k)}</strong>)
    else out.push(<u key={k}>{renderInline(m[3], k)}</u>)
    last = m.index + m[0].length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

export function renderInline(text: string, keyBase = 'i'): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  let n = 0
  for (const m of text.matchAll(MATH_RE)) {
    const idx = m.index ?? 0
    if (idx > last) out.push(...renderText(unescape(text.slice(last, idx)), `${keyBase}-t${n}`))
    out.push(renderTex(m[1], n))
    last = idx + m[0].length
    n++
  }
  if (last < text.length) out.push(...renderText(unescape(text.slice(last)), `${keyBase}-t${n}`))
  return out
}

const unescape = (s: string) => s.replace(/\\\$/g, '$')

type Block =
  | { kind: 'p'; lines: string[] }
  | { kind: 'ul'; items: string[] }
  | { kind: 'table'; rows: string[][]; header: boolean }

function parseBlocks(src: string): Block[] {
  const blocks: Block[] = []
  let cur: Block | null = null
  const flush = () => {
    if (cur) blocks.push(cur)
    cur = null
  }
  for (const raw of src.replace(/\r/g, '').split('\n')) {
    const line = raw.trimEnd()
    if (!line.trim()) {
      flush()
      continue
    }
    if (/^\s*\|.*\|\s*$/.test(line)) {
      const cells = line.trim().slice(1, -1).split('|').map((c) => c.trim())
      const isSep = cells.every((c) => /^:?-{2,}:?$/.test(c))
      if (cur?.kind !== 'table') {
        flush()
        cur = { kind: 'table', rows: [], header: false }
      }
      if (isSep) cur.header = cur.rows.length === 1
      else cur.rows.push(cells)
      continue
    }
    const li = /^\s*[-•]\s+(.*)$/.exec(line)
    if (li) {
      if (cur?.kind !== 'ul') {
        flush()
        cur = { kind: 'ul', items: [] }
      }
      cur.items.push(li[1])
      continue
    }
    if (cur?.kind !== 'p') {
      flush()
      cur = { kind: 'p', lines: [] }
    }
    cur.lines.push(line)
  }
  flush()
  return blocks
}

export function Markup({ text, className = '' }: { text: string; className?: string }) {
  const blocks = parseBlocks(text)
  return (
    <div className={`markup ${className}`}>
      {blocks.map((b, bi) => {
        if (b.kind === 'p')
          return (
            <p key={bi}>
              {b.lines.map((l, li) => (
                <Fragment key={li}>
                  {li > 0 && <br />}
                  {renderInline(l, `${bi}-${li}`)}
                </Fragment>
              ))}
            </p>
          )
        if (b.kind === 'ul')
          return (
            <ul key={bi}>
              {b.items.map((it, ii) => (
                <li key={ii}>{renderInline(it, `${bi}-${ii}`)}</li>
              ))}
            </ul>
          )
        const [head, ...body] = b.header ? b.rows : [null, ...b.rows]
        return (
          <div key={bi} className="table-wrap">
            <table>
              {head && (
                <thead>
                  <tr>
                    {head.map((c, ci) => (
                      <th key={ci}>{renderInline(c, `${bi}-h${ci}`)}</th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {body.map((r, ri) => (
                  <tr key={ri}>
                    {r!.map((c, ci) => (
                      <td key={ci}>{renderInline(c, `${bi}-${ri}-${ci}`)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      })}
    </div>
  )
}

/** Inline-only variant for short strings such as answer choices. */
export function Inline({ text }: { text: string }) {
  if (text.includes('\n')) return <Markup text={text} />
  return <>{renderInline(text)}</>
}
