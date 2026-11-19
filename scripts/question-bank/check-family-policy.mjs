import assert from 'node:assert/strict'
import {readFileSync,readdirSync,writeFileSync} from 'node:fs'
import {join} from 'node:path'
import {fileURLToPath} from 'node:url'
import {loadFamilyOverlaps} from './partition-family.mjs'

const root=fileURLToPath(new URL('../../',import.meta.url))
const readQuestions=directory=>readdirSync(directory).filter(name=>name.endsWith('.json')).flatMap(name=>JSON.parse(readFileSync(join(directory,name),'utf8')))
const active=readQuestions(join(root,'src/data/questions')),retired=readQuestions(join(root,'src/data/retired'))
const collections=[
 ['math-generation-report.json','m-gen-',64],
 ['quantitative-reading-report.json','rw-gen-quant-',32],
 ['conventions-generation-report.json','rw-gen-conventions-',64],
 ['expression-generation-report.json','rw-gen-expression-',32],
]
const summaries=[],recordedOverlaps=[]
for(const [filename,prefix,candidates] of collections){
 const report=JSON.parse(readFileSync(join(root,'docs',filename),'utf8'))
 assert.equal(report.maximumActivePerFamily,1,filename)
 assert.equal(report.candidatesPerFamily,candidates,filename)
 const familyNames=new Set(report.families.map(row=>row.family))
 assert.equal(familyNames.size,report.families.length,filename)
 const identify=id=>{
  const match=/^(.+)-(\d{3})$/.exec(id.slice(prefix.length))
  assert(match&&familyNames.has(match[1]),`${id}: unknown or malformed generated family`)
  return {family:match[1],ordinal:Number(match[2])}
 }
 const live=active.filter(q=>q.id.startsWith(prefix)),history=retired.filter(q=>q.id.startsWith(prefix))
 for(const q of [...live,...history])identify(q.id)
 for(const row of report.families){
  const current=live.filter(q=>identify(q.id).family===row.family)
  const siblings=history.filter(q=>identify(q.id).family===row.family)
  const expected=row.overlap?0:1
  assert.equal(current.length,expected,`${row.family}: active count violates the reviewed family policy`)
  if(row.overlap){
   recordedOverlaps.push(row.overlap)
   assert(active.some(q=>q.id===row.representative),`${row.family}: retained existing question is not active`)
   assert.equal(row.representative,row.overlap.retainedQuestionId,row.family)
   assert.equal(row.reviewCandidate,row.overlap.candidateQuestionId,row.family)
   assert(siblings.some(q=>q.id===row.reviewCandidate),`${row.family}: reviewed overlap was not preserved`)
   assert(row.overlap.reason.length>20,`${row.family}: missing editorial overlap reason`)
  }else assert.equal(current[0].id,row.representative,`${row.family}: representative changed`)
  assert.equal(row.questions,expected,row.family)
  assert.equal(siblings.length,candidates-expected,`${row.family}: historical versions missing`)
  assert.equal(row.archived,siblings.length,row.family)
  const ordinals=[...current,...siblings].map(q=>identify(q.id).ordinal).sort((a,b)=>a-b)
  assert.deepEqual(ordinals,Array.from({length:candidates},(_,i)=>i+1),`${row.family}: a historical ID was dropped or duplicated`)
 }
 assert.equal(report.total,live.length,filename)
 assert.equal(report.archivedTotal,history.length,filename)
 summaries.push({collection:filename,families:familyNames.size,active:live.length,representedByExistingQuestions:report.families.filter(row=>row.overlap).length,retired:history.length,candidates:live.length+history.length})
}
const byCandidate=(a,b)=>a.candidateQuestionId.localeCompare(b.candidateQuestionId)
assert.deepEqual(recordedOverlaps.sort(byCandidate),loadFamilyOverlaps().sort(byCandidate),'Family reports must include every reviewed overlap')
const report={policy:'At most one generated active representative per declared family or pattern. A reviewed overlap can instead be represented by an existing active question; its source-bound reason is recorded in the generation report. Sibling versions remain historical only.',activeFamilyRepresentatives:summaries.reduce((sum,row)=>sum+row.active,0),familiesRepresentedByExistingQuestions:summaries.reduce((sum,row)=>sum+row.representedByExistingQuestions,0),retiredFamilyVariants:summaries.reduce((sum,row)=>sum+row.retired,0),collections:summaries,scope:'Enforces declared family boundaries and recorded editorial overlaps. It does not independently detect every remaining overlap or certify every reading interpretation.'}
const path=join(root,'docs/family-retirement-report.json'),content=JSON.stringify(report,null,2)+'\n'
if(process.argv.includes('--write'))writeFileSync(path,content)
else assert.equal(readFileSync(path,'utf8'),content,'Family retirement report is stale; regenerate the question bank')
console.log(`Family policy verified: ${report.activeFamilyRepresentatives} generated representatives; ${report.familiesRepresentedByExistingQuestions} patterns covered by existing items; ${report.retiredFamilyVariants} preserved versions; all original ordinals accounted for.`)
