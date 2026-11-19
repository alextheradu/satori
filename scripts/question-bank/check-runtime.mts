// Exercise the production bank, actual grader, and actual markup renderer.
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { join } from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Markup } from '../../src/lib/Markup'
import { isCorrect, parseNumeric } from '../../src/lib/grading'
import { sprEntries } from '../../src/lib/spr.mjs'
import type { Question, Section } from '../../src/data/types'

const root=fileURLToPath(new URL('../../',import.meta.url))
const source=readdirSync(join(root,'src/data/questions')).filter(f=>f.endsWith('.json')).sort()
 .flatMap(f=>JSON.parse(readFileSync(join(root,'src/data/questions',f),'utf8')) as Question[])
const retired=readdirSync(join(root,'src/data/retired')).filter(f=>f.endsWith('.json')).sort()
 .flatMap(f=>JSON.parse(readFileSync(join(root,'src/data/retired',f),'utf8')) as Question[])
const retiredIds=new Set(retired.map(q=>q.id))
const assets=join(root,'dist/assets')
const candidates=readdirSync(assets).filter(f=>f.endsWith('.js')).filter(f=>{
 const content=readFileSync(join(assets,f),'utf8')
 return content.includes(source[0].id)&&content.includes(source[source.length-1].id)
})
assert.equal(candidates.length,1,'Build must contain one discoverable production question-bank chunk; run npm run build')
const file=candidates[0]
const production=await import(pathToFileURL(join(assets,file)).href)
const questions=Object.values(production).find(v=>Array.isArray(v)&&v.length===source.length&&v[0]?.id===source[0].id) as Question[] | undefined
assert(questions,'Production bundle must export its question bank')
assert.deepEqual(questions,source,'Production bank differs from the committed question files')
const lookup=Object.values(production).find(v=>v instanceof Map&&v.has(source[0].id)&&v.has(source[source.length-1].id)) as Map<string,Question>|undefined
assert(lookup,'Production bundle must preserve question lookup for saved attempts')
assert.equal(lookup.size,source.length+retired.length)
for(const q of retired){assert(!questions.some(active=>active.id===q.id),`${q.id}: retired item remains selectable`);assert.deepEqual(lookup.get(q.id),q,`${q.id}: historical question changed in production`)}
const builtGrader=Object.values(production).find(v=>typeof v==='function'&&v.toString().includes('.answer.some')) as typeof isCorrect | undefined
// Bundlers may merge grading and bank code. If merged, verify the shipped grader too.
const graders=builtGrader?[isCorrect,builtGrader]:[isCorrect]
let fields=0,tables=0,blanks=0,lists=0
let readingCharactersMinimum=Infinity,readingCharactersMaximum=0
const visibleText=(html:string)=>html.replace(/<span class="katex-mathml">[\s\S]*?<\/span>/g,'').replace(/<[^>]*>/g,' ').replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16))).replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/\s+/g,' ').trim()
for(const q of [...questions,...retired]) {
 if(q.section==='rw') {
  const passage=q.passage!.replace('______',q.choices![q.answer as number])
  const characters=visibleText(renderToStaticMarkup(createElement(Markup,{text:passage}))).length
  assert(characters>=150&&characters<=900,`${q.id}: rendered reading passage has ${characters}/6 standardized words; expected 25–150`)
  readingCharactersMinimum=Math.min(readingCharactersMinimum,characters)
  readingCharactersMaximum=Math.max(readingCharactersMaximum,characters)
 }
 for(const grade of graders) {
 if(typeof q.answer==='number') {
  for(let i=0;i<4;i++)assert.equal(grade(q,i),i===q.answer,`${q.id}: multiple-choice grading`)
 } else {
  for(const accepted of q.answer) {
   const entries=sprEntries(accepted)
   assert(entries.length,`${q.id}: no legal SAT response`)
   for(const entry of entries)assert(grade(q,entry),`${q.id}: legal grid-in ${entry} rejected`)
   const value=parseNumeric(accepted)
   assert(value!==null)
   assert(!grade(q,String(value+1)),`${q.id}: incorrect grid-in accepted`)
  }
 }
 assert(!grade(q,null),`${q.id}: skipped answer marked correct`)
 }
 for(const text of [q.passage,q.prompt,q.explanation,...(q.choices??[])].filter((s):s is string=>!!s)) {
  const html=renderToStaticMarkup(createElement(Markup,{text}))
  assert(!html.includes('katex-error'),`${q.id}: math failed to render`)
  if(text.includes('\n|')) { assert(html.includes('<table>'),`${q.id}: missing table`); tables++ }
  if(text.includes('\n- ')) {assert(html.includes('<ul'),`${q.id}: notes failed to render as a list`);lists++}
  if(text.includes('______')) {assert(html.includes('aria-label="blank"'),`${q.id}: missing blank`);blanks++}
  fields++
 }
}
console.log(`Rendered reading-length screen: ${readingCharactersMinimum}–${readingCharactersMaximum} visible characters (six characters per technical word).`)
const pick=Object.values(production).find(v=>typeof v==='function'&&v.length===3) as
 ((section:Section,count:number,exclude:Set<string>,bias?:string)=>Question[])|undefined
assert(pick,'Production bundle must include balanced question selection')
for(const section of ['rw','math'] as const) {
 for(const bias of ['mixed','harder','easier']) {
  const first=pick(section,section==='rw'?27:22,new Set(),bias)
  const excluded=new Set(first.map(q=>q.id))
  const second=pick(section,first.length,excluded,bias)
  assert.equal(first.length,section==='rw'?27:22)
  assert.equal(second.length,first.length)
  assert.equal(excluded.size,first.length)
  assert.equal(new Set(second.map(q=>q.id)).size,second.length)
  assert(first.every(q=>q.section===section))
  assert([...first,...second].every(q=>!retiredIds.has(q.id)),'A retired repeat appeared in a new test module')
  assert(second.every(q=>q.section===section&&!excluded.has(q.id)))
  assert.equal(new Set(first.map(q=>q.domain)).size,4)
  assert.equal(new Set(second.map(q=>q.domain)).size,4)
  for(const [module,omitted] of [[first,new Set<string>()],[second,excluded]] as const) {
   for(const domain of new Set(module.map(q=>q.domain))) {
    const selected=module.filter(q=>q.domain===domain)
    const available=questions.filter(q=>q.section===section&&q.domain===domain&&!omitted.has(q.id))
    const skills=new Set(available.map(q=>q.skill))
    const counts=[...skills].map(skill=>selected.filter(q=>q.skill===skill).length)
    assert(Math.max(...counts)-Math.min(...counts)<=1,`${section}/${bias}/${domain}: an oversized skill pool dominated the module`)
   }
  }
 }
}
console.log(`Production integration verified: ${questions.length} active questions; ${retired.length} retired questions preserved for historical grading and excluded from new modules; ${fields} rendered text fields; ${tables} tables; ${blanks} blanks; ${lists} note lists; grading and disjoint domain/skill-balanced modules for both sections and all difficulty routes.`)
