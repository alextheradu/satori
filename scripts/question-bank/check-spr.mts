import assert from 'node:assert/strict'
import { isCorrect, correctLabel } from '../../src/lib/grading'
import { isSprEntry, sprEntries, matchesSprAnswer, sanitizeSprInput } from '../../src/lib/spr.mjs'
import type { Question } from '../../src/data/types'

// College Board framework, Appendix D, and large-answer regressions.
const cases: [string,string[],string[]][]=[
 ['7/2',['7/2','3.5','3.50'],['31/2','3 1/2','3.49']],
 ['2/3',['2/3','.6666','.6667','0.666','0.667'],['0.66','.66','0.67','.67']],
 ['-1/3',['-1/3','-.3333','-.333','-0.333'],['-.33','-0.33','1/3']],
 ['3.55555555',['3.555','3.556'],['3.55','3.56','3.5555']],
 ['4301/2',['2150','2151'],['2150.5','2152','4301/2']],
 ['30/209',['.1435','0.143','0.144'],['.14','.15','30/209']],
 ['1/2',['.5','0.5','1/2'],['.499','.501','1.0/2']],
 ['12',['12','12.0','24/2'],['12.01','120','12%']],
]
let checks=0
for(const [exact,accepted,rejected] of cases) {
 const q={id:'spr-check',section:'math',domain:'Algebra',skill:'Linear equations in one variable',difficulty:'medium',prompt:'Find the value.',answer:[exact],explanation:'Entry-rule regression.'} satisfies Question
 for(const value of accepted){assert(isSprEntry(value));assert(matchesSprAnswer(exact,value));assert(isCorrect(q,value));checks++}
 for(const value of rejected){assert(!matchesSprAnswer(exact,value),`${exact}: accepted ${value}`);assert(!isCorrect(q,value));checks++}
 for(const value of sprEntries(exact))assert(isCorrect(q,value))
 assert(!isCorrect(q,null))
 if(!isSprEntry(exact))assert(correctLabel(q).includes('(enter '))
}
assert.equal(sanitizeSprInput('-.3333'),'-.3333','Negative paste needs all six characters')
assert.equal(sanitizeSprInput('123456'),'12345','Positive entries have five characters')
assert.equal(sanitizeSprInput('−.3333'),'-.3333')
assert(!isSprEntry('1/0'));assert(!isSprEntry('1.5/2'));assert(!isSprEntry('1e3'))
console.log(`SPR rules verified against ${checks} accepted/rejected examples and input-limit regressions.`)
