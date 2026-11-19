import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { reading } from './reading.mjs'
import { writing } from './writing.mjs'
import { readingExpansion } from './reading-expansion.mjs'
import { writingExpansion } from './writing-expansion.mjs'
import { readingAdditional } from './reading-additional.mjs'
import { writingAdditional } from './writing-additional.mjs'
import { readingLiterary } from './reading-literary.mjs'
import { writingExpression } from './writing-expression.mjs'
import { readingReasoning } from './reading-reasoning.mjs'
const groups={
 'Words in Context':['craft','Craft and Structure','vocab'],
 'Text Structure and Purpose':['craft','Craft and Structure','structure'],
 'Cross-Text Connections':['craft','Craft and Structure','cross'],
 'Central Ideas and Details':['information','Information and Ideas','central'],
 'Inferences':['information','Information and Ideas','inference'],
 'Command of Evidence (Textual)':['information','Information and Ideas','textual'],
 'Command of Evidence (Quantitative)':['information','Information and Ideas','quantitative'],
 'Transitions':['expression','Expression of Ideas','transition'],
 'Rhetorical Synthesis':['expression','Expression of Ideas','synthesis'],
 'Boundaries':['conventions','Standard English Conventions','boundary'],
 'Form, Structure, and Sense':['conventions','Standard English Conventions','form'],
}
for (const row of [...readingLiterary,...writingExpression,...readingReasoning]) {
 const words=row.passage.trim().split(/\s+/).length
 assert(words>=25&&words<=150,`${row.skill}: new short passage must contain 25–150 words, got ${words}`)
}
const counts={}, files={}, seen=new Set()
const rows=[...reading,...writing,...readingExpansion,...writingExpansion,...readingAdditional,...writingAdditional,...readingLiterary,...writingExpression,...readingReasoning]
for(const [i,row] of rows.entries()) {
 const [file,domain,key]=groups[row.skill]
 counts[key]=(counts[key]??0)+1
 const id=`rw-original-${key}-${String(counts[key]).padStart(3,'0')}`
 assert.equal(row.wrong.length,3,id)
 const choices=[row.correct,...row.wrong]
 assert.equal(new Set(choices).size,4,id)
 const fingerprint=row.passage+'\n'+row.prompt
 assert(!seen.has(fingerprint),`${id}: repeated item`); seen.add(fingerprint)
 const answer=i%4
 choices.splice(answer,0,choices.shift())
 const q={id,section:'rw',domain,skill:row.skill,difficulty:row.difficulty,passage:row.passage,prompt:row.prompt,choices,answer,explanation:row.explanation}
 ;(files[file]??=[]).push(q)
}
for(const [file,qs] of Object.entries(files)) {
 const path=fileURLToPath(new URL(`../../src/data/questions/original-rw-${file}.json`,import.meta.url))
 const content=JSON.stringify(qs,null,2)+'\n'
 if(process.argv.includes('--check')) assert.equal(readFileSync(path,'utf8'),content,`${file}: bank differs from authored content`)
 else writeFileSync(path,content)
}
const literaryWords=readingLiterary.map(row=>row.passage.trim().split(/\s+/).length)
const literarySkills={}
for(const row of readingLiterary)literarySkills[row.skill]=(literarySkills[row.skill]??0)+1
const literaryReport=JSON.stringify({provenance:'Individually authored original poems, stories, informational passages, and paired texts; no numerical or context-swapping variants.',total:readingLiterary.length,skills:literarySkills,passageWords:{minimum:Math.min(...literaryWords),maximum:Math.max(...literaryWords)},originalPoemPassages:readingLiterary.filter(row=>row.passage.includes('original poem')).length},null,2)+'\n'
const literaryReportPath=fileURLToPath(new URL('../../docs/literary-reading-report.json',import.meta.url))
if(process.argv.includes('--check'))assert.equal(readFileSync(literaryReportPath,'utf8'),literaryReport)
else writeFileSync(literaryReportPath,literaryReport)
const reasoningWords=readingReasoning.map(row=>row.passage.trim().split(/\s+/).length)
const reasoningSkills={}
for(const row of readingReasoning)reasoningSkills[row.skill]=(reasoningSkills[row.skill]??0)+1
const reasoningReport=JSON.stringify({provenance:'Individually authored original reading passages, paired texts, poems, and stories; no numerical or context-swapping variants.',total:readingReasoning.length,skills:reasoningSkills,passageWords:{minimum:Math.min(...reasoningWords),maximum:Math.max(...reasoningWords)},originalPoemPassages:readingReasoning.filter(row=>/original poem/.test(row.passage)).length},null,2)+'\n'
const reasoningReportPath=fileURLToPath(new URL('../../docs/reading-reasoning-report.json',import.meta.url))
if(process.argv.includes('--check'))assert.equal(readFileSync(reasoningReportPath,'utf8'),reasoningReport)
else writeFileSync(reasoningReportPath,reasoningReport)
console.log(`${process.argv.includes('--check')?'Verified':'Wrote'} ${rows.length} original Reading and Writing questions across ${Object.keys(counts).length} skills.`)
