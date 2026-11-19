import {readFileSync,readdirSync,writeFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {join} from 'node:path'
import assert from 'node:assert/strict'
import {questionFingerprint} from './question-fingerprint.mjs'
import {sprEntries,isSprEntry} from '../../src/lib/spr.mjs'

const root=fileURLToPath(new URL('../../',import.meta.url)),directory=join(root,'src/data/questions')
const records=readdirSync(directory).filter(f=>f.endsWith('.json')).flatMap(file=>JSON.parse(readFileSync(join(directory,file),'utf8')).map(q=>({file,q})))
const fingerprints=new Map(),duplicates=[],shortPassages=[],longPassages=[],entryIssues=[]
for(const {file,q} of records) {
 const fingerprint=questionFingerprint(q),existing=fingerprints.get(fingerprint)
 if(existing)duplicates.push({first:existing,duplicate:q.id})
 else fingerprints.set(fingerprint,q.id)
 if(q.section==='rw') {
  // Screening count. College Board's technical definition is six characters per word.
  // Source markup is removed; this remains a screen, not an editorial certification.
  const filled=q.passage.replace('______',q.choices[q.answer]).replace(/\*\*|_(?=\S)|(?<=\S)_/g,'').replace(/\|\s*---\s*/g,'').replace(/\|/g,' ').replace(/\s+/g,' ').trim()
  const characters=filled.length
  if(characters<150)shortPassages.push({id:q.id,file,characters})
  if(characters>900)longPassages.push({id:q.id,file,characters})
 } else if(Array.isArray(q.answer)) {
  if(!q.answer.some(a=>sprEntries(a).some(isSprEntry)))entryIssues.push(q.id)
 }
}
const report={status:'Audit in progress; not a certification of every answer or interpretation.',total:records.length,duplicateScope:'Whitespace, canonical Unicode, math spacing, and supported integer quadratic zero equations in expanded, factored, or squared-linear form, including missing terms and nonzero integer scale factors. Surrounding wording, requested targets, and variable/word case are preserved; other semantic repeats require review.',duplicates,passageLengthScreen:{definition:'Six source-text characters per technical word after basic markup removal and filling the keyed choice; inspect rendered passages before final certification.',shortPassages,longPassages},studentProducedResponsesWithoutLegalEntry:entryIssues}
const reportPath=join(root,'docs/question-format-audit.json'),content=JSON.stringify(report,null,2)+'\n'
if(process.argv.includes('--check'))assert.equal(readFileSync(reportPath,'utf8'),content,'Format audit is stale; run npm run questions:audit')
else writeFileSync(reportPath,content)
console.log(JSON.stringify({total:report.total,duplicates:duplicates.length,shortPassages:shortPassages.length,longPassages:longPassages.length,entryIssues:entryIssues.length,sampleDuplicates:duplicates.slice(0,5)},null,2))
assert.equal(duplicates.length+shortPassages.length+longPassages.length+entryIssues.length,0,'Resolve the format or repeat findings before publishing this bank')
