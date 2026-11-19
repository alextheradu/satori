import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { reading } from './reading.mjs'
import { writing } from './writing.mjs'
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
const counts={}, files={}, seen=new Set()
for(const [i,row] of [...reading,...writing].entries()) {
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
console.log(`${process.argv.includes('--check')?'Verified':'Wrote'} ${reading.length+writing.length} original Reading and Writing questions across ${Object.keys(counts).length} skills.`)
