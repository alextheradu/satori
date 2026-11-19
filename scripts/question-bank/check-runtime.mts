// Exercise the production bank, actual grader, and actual markup renderer.
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { join } from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Markup } from '../../src/lib/Markup'
import { isCorrect, parseNumeric } from '../../src/lib/grading'
import type { Question, Section } from '../../src/data/types'

const root=fileURLToPath(new URL('../../',import.meta.url))
const source=readdirSync(join(root,'src/data/questions')).filter(f=>f.endsWith('.json')).sort()
 .flatMap(f=>JSON.parse(readFileSync(join(root,'src/data/questions',f),'utf8')) as Question[])
const assets=join(root,'dist/assets')
const candidates=readdirSync(assets).filter(f=>f.endsWith('.js')).filter(f=>{
 const content=readFileSync(join(assets,f),'utf8')
 return content.includes(source[0].id)&&content.includes(source[source.length-1].id)
})
assert.equal(candidates.length,1,'Build must contain one discoverable production question-bank chunk; run npm run build')
const file=candidates[0]
const production=await import(pathToFileURL(join(assets,file)).href)
const questions=Object.values(production).find(v=>Array.isArray(v)&&v[0]?.id) as Question[] | undefined
assert(questions,'Production bundle must export its question bank')
assert.deepEqual(questions,source,'Production bank differs from the committed question files')
const builtGrader=Object.values(production).find(v=>typeof v==='function'&&v.toString().includes('.answer.some')) as typeof isCorrect | undefined
// Bundlers may merge grading and bank code. If merged, verify the shipped grader too.
const graders=builtGrader?[isCorrect,builtGrader]:[isCorrect]
let fields=0,tables=0,blanks=0
for(const q of questions) {
 for(const grade of graders) {
 if(typeof q.answer==='number') {
  for(let i=0;i<4;i++)assert.equal(grade(q,i),i===q.answer,`${q.id}: multiple-choice grading`)
 } else {
  for(const accepted of q.answer) {
   assert(grade(q,accepted),`${q.id}: canonical grid-in rejected`)
   const value=parseNumeric(accepted)
   assert(value!==null)
   assert(grade(q,String(value)),`${q.id}: equivalent decimal rejected`)
   assert(!grade(q,String(value+1)),`${q.id}: incorrect grid-in accepted`)
  }
 }
 assert(!grade(q,null),`${q.id}: skipped answer marked correct`)
 }
 for(const text of [q.passage,q.prompt,q.explanation,...(q.choices??[])].filter((s):s is string=>!!s)) {
  const html=renderToStaticMarkup(createElement(Markup,{text}))
  assert(!html.includes('katex-error'),`${q.id}: math failed to render`)
  if(text.includes('\n|')) { assert(html.includes('<table>'),`${q.id}: missing table`); tables++ }
  if(text.includes('______')) {assert(html.includes('aria-label="blank"'),`${q.id}: missing blank`);blanks++}
  fields++
 }
}
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
console.log(`Production integration verified: ${questions.length} questions; ${fields} rendered text fields; ${tables} tables; ${blanks} blanks; grading and disjoint domain/skill-balanced modules for both sections and all difficulty routes.`)
