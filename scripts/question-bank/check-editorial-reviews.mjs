import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
const hash=value=>createHash('sha256').update(value).digest('hex')
const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])])):value
const readQuestions=(name,directory='questions')=>JSON.parse(readFileSync(new URL(`../../src/data/${directory}/${name}.json`,import.meta.url),'utf8'))
const legacyPsdaFiles=['m-psda-2','math-psda-geo']
const legacyPsdaArchive=legacyPsdaFiles.flatMap(name=>readQuestions(name,'retired'))
const legacyPsdaActive=new Set(legacyPsdaFiles.flatMap(name=>readQuestions(name)).map(q=>q.id))
const legacyPsdaOverlaps=JSON.parse(readFileSync(new URL('../../docs/legacy-psda-overlaps.json',import.meta.url),'utf8'))
assert.deepEqual(legacyPsdaArchive.map(q=>q.id).sort(),legacyPsdaOverlaps.map(row=>row.retiredQuestionId).sort())
for(const row of legacyPsdaOverlaps){
 assert(!legacyPsdaActive.has(row.retiredQuestionId),row.retiredQuestionId)
 assert(legacyPsdaActive.has(row.retainedQuestionId),row.retainedQuestionId)
 assert(row.reason.trim(),row.retiredQuestionId)
}
let totalReviewed=0
for(const [reportName,file,solver,helper,count,selectedDomain] of [
 ['legacy-algebra-review','m-alg-2','review-legacy-algebra.py',null,48],
 ['legacy-advanced-review','m-adv-2','review-legacy-advanced.py','review_math_common.py',48],
 ['legacy-psda-review',['m-psda-2','../retired/m-psda-2'],'review-legacy-psda.py','review_math_common.py',48],
 ['legacy-geometry-review','m-geo-2','review-legacy-geometry.py','review_math_common.py',48],
 ['legacy-initial-math-alg-adv-review','math-alg-adv','review-legacy-initial.py','review_math_common.py',32],
 ['legacy-initial-math-psda-geo-review',['math-psda-geo','../retired/math-psda-geo'],'review-legacy-initial.py','review_math_common.py',32],
 ['distinct-math-review',['original-math-distinct','../retired/original-math-distinct'],'review-distinct-math.py','review_math_common.py',39],
 ['generated-algebra-review',['generated-math-algebra','../retired/generated-math-algebra'],'review-generated-algebra.py','review_math_common.py',41,'Algebra'],
 ['generated-advanced-review',['generated-math-advanced','../retired/generated-math-advanced'],'review-generated-advanced.py','review_math_common.py',49,'Advanced Math'],
 ['generated-psda-review',['generated-math-data','../retired/generated-math-data'],'review-generated-psda.py','review_math_common.py',49,'Problem-Solving and Data Analysis'],
 ['generated-geometry-review',['generated-math-geometry','../retired/generated-math-geometry'],'review-generated-geometry.py','review_math_common.py',45,'Geometry and Trigonometry'],
]) {
let questions=(Array.isArray(file)?file:[file]).flatMap(name=>readQuestions(name))
const report=JSON.parse(readFileSync(new URL(`../../docs/${reportName}.json`,import.meta.url),'utf8'))
let reviewedActivity
if(selectedDomain){
 const generation=JSON.parse(readFileSync(new URL('../../docs/math-generation-report.json',import.meta.url),'utf8'))
 const selected=generation.families.filter(row=>row.domain===selectedDomain)
 const ids=selected.map(row=>row.reviewCandidate)
 assert.equal(new Set(ids).size,count)
 assert.equal(report.selectionSha256,hash(JSON.stringify(ids)),'Reviewed representative selection changed')
 reviewedActivity=new Map(selected.map(row=>[row.reviewCandidate,row.questions===1]))
 assert.equal(report.activeQuestionsReviewed,selected.filter(row=>row.questions===1).length,'Reviewed active count changed')
 const byId=new Map(questions.map(q=>[q.id,q]))
 questions=ids.map(id=>{assert(byId.has(id),`${id}: reviewed candidate missing from active and historical records`);return byId.get(id)})
}
const requirements=readFileSync(new URL('./requirements-review.txt',import.meta.url))
assert.equal(report.solverSha256,hash(readFileSync(new URL(`./${solver}`,import.meta.url))),'Review solver changed: rerun the symbolic review after checking its models')
if(helper)assert.equal(report.helperSha256,hash(readFileSync(new URL(`./${helper}`,import.meta.url))),'Review parser changed: rerun the symbolic review')
assert.equal(report.requirementsSha256,hash(requirements))
assert.equal(report.engine,`SymPy ${/sympy==([^\s]+)/.exec(requirements.toString())[1]}`)
assert.equal(report.questionsReviewed,count);assert.equal(report.items.length,count);assert.equal(questions.length,count)
const byId=new Map(report.items.map(row=>[row.id,row]));assert.equal(byId.size,count)
for(const q of questions){
 const row=byId.get(q.id)
 assert(row,`${q.id}: missing review`)
 assert.equal(row.sourceSha256,hash(JSON.stringify(canonical(q))),`${q.id}: source changed since the independent review`)
 if(reviewedActivity)assert.equal(row.active,reviewedActivity.get(q.id),`${q.id}: active status changed since the independent review`)
 if(q.choices){
  assert.equal(row.validChoices.length,4,q.id)
  assert.equal(row.validChoices.filter(Boolean).length,1,q.id)
  assert(row.validChoices[q.answer],q.id)
 }
}
totalReviewed+=count
}
console.log(`Independent math reviews are current for all ${totalReviewed} reviewed source records, keys, choices, and solvers, including explicit editorial interpretations for study-design questions.`)
