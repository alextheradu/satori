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
import { readingExtended } from './reading-extended.mjs'
import { readingLanguage } from './reading-language.mjs'
import { readingInterpretation } from './reading-interpretation.mjs'
import { reviseReadingFormat } from './reading-format-revisions.mjs'
import { readingFresh } from './reading-fresh.mjs'
import { readingPublicDomain } from './reading-public-domain.mjs'
import { readingEvidenceFresh } from './reading-evidence-fresh.mjs'
import { writingFresh } from './writing-fresh.mjs'
import { readingPublicDomainMore } from './reading-public-domain-more.mjs'
import { readingMeasurement } from './reading-measurement.mjs'
import { readingSourceReview } from './reading-source-review.mjs'
import { readingComparisons } from './reading-comparisons.mjs'
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
for (const row of [...readingLiterary,...writingExpression,...readingReasoning,...readingExtended,...readingLanguage,...readingInterpretation,...readingFresh,...readingPublicDomain,...readingEvidenceFresh,...writingFresh,...readingPublicDomainMore,...readingMeasurement,...readingSourceReview,...readingComparisons]) {
 const words=row.passage.trim().split(/\s+/).length
 assert(words>=25&&words<=150,`${row.skill}: new short passage must contain 25–150 words, got ${words}`)
}
const counts={}, files={}, seen=new Set(), publicDomainItems=[]
const rows=[...reading,...writing,...readingExpansion,...writingExpansion,...readingAdditional,...writingAdditional,...readingLiterary,...writingExpression,...readingReasoning,...readingExtended,...readingLanguage,...readingInterpretation,...readingFresh,...readingPublicDomain,...readingEvidenceFresh,...writingFresh,...readingPublicDomainMore,...readingMeasurement,...readingSourceReview,...readingComparisons]
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
 if(row.source)publicDomainItems.push({questionId:id,excerptId:row.source.id,author:row.source.author,title:row.source.title,sourceUrl:`${row.source.sourceUrl}#${row.source.chapter}`,paragraphIndex:row.source.paragraphIndex,excerptSha256:row.source.textSha256})
 ;(files[file]??=[]).push(reviseReadingFormat(q))
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
const extendedWords=readingExtended.map(row=>row.passage.trim().split(/\s+/).length)
for(const words of extendedWords)assert(words>=70&&words<=150,`Extended reading passage must contain 70–150 words, got ${words}`)
const extendedSkills={}
for(const row of readingExtended)extendedSkills[row.skill]=(extendedSkills[row.skill]??0)+1
const extendedReport=JSON.stringify({provenance:'Individually authored original extended reading passages; no numerical or context-swapping variants.',total:readingExtended.length,skills:extendedSkills,passageWords:{minimum:Math.min(...extendedWords),maximum:Math.max(...extendedWords)},originalPoemPassages:readingExtended.filter(row=>/original poem/.test(row.passage)).length,supportEvidenceQuestions:readingExtended.filter(row=>row.prompt.includes('support the researcher')).length,weakenEvidenceQuestions:readingExtended.filter(row=>row.prompt.includes('weaken the researcher')).length},null,2)+'\n'
const extendedReportPath=fileURLToPath(new URL('../../docs/extended-reading-report.json',import.meta.url))
if(process.argv.includes('--check'))assert.equal(readFileSync(extendedReportPath,'utf8'),extendedReport)
else writeFileSync(extendedReportPath,extendedReport)
const coverageRows=[...readingLanguage,...readingInterpretation]
const coverageWords=coverageRows.map(row=>row.passage.trim().split(/\s+/).length)
const coverageSkills={}
for(const row of coverageRows)coverageSkills[row.skill]=(coverageSkills[row.skill]??0)+1
const coverageReport=JSON.stringify({provenance:'Individually authored original vocabulary, structure, detail, inference, evidence, and paired-text questions; no numerical or context-swapping variants.',total:coverageRows.length,skills:coverageSkills,passageWords:{minimum:Math.min(...coverageWords),maximum:Math.max(...coverageWords)},originalPoemPassages:coverageRows.filter(row=>/original poem/.test(row.passage)&&row.passage.includes('\n\n')).length,explicitDetailQuestions:coverageRows.filter(row=>row.prompt.startsWith('According to the text')).length,quotationEvidenceQuestions:coverageRows.filter(row=>row.prompt.startsWith('Which quotation')).length},null,2)+'\n'
const coverageReportPath=fileURLToPath(new URL('../../docs/verbal-coverage-report.json',import.meta.url))
if(process.argv.includes('--check'))assert.equal(readFileSync(coverageReportPath,'utf8'),coverageReport)
else writeFileSync(coverageReportPath,coverageReport)
const freshWords=readingFresh.map(row=>row.passage.trim().split(/\s+/).length)
const freshSkills={}
for(const row of readingFresh)freshSkills[row.skill]=(freshSkills[row.skill]??0)+1
const freshReport=JSON.stringify({provenance:'64 individually authored original questions with distinct passages and notes; no numerical or name-swapping variants.',total:readingFresh.length,skills:freshSkills,passageWords:{minimum:Math.min(...freshWords),maximum:Math.max(...freshWords)},originalPoemPassages:readingFresh.filter(row=>/original poem/.test(row.passage)&&row.passage.includes('\n\n')).length},null,2)+'\n'
const freshReportPath=fileURLToPath(new URL('../../docs/fresh-reading-report.json',import.meta.url))
if(process.argv.includes('--check'))assert.equal(readFileSync(freshReportPath,'utf8'),freshReport)
else writeFileSync(freshReportPath,freshReport)
const publicDomainRows=[...readingPublicDomain,...readingPublicDomainMore]
const publicDomainWords=publicDomainRows.map(row=>row.passage.trim().split(/\s+/).length)
const publicDomainSkills={}
for(const row of publicDomainRows)publicDomainSkills[row.skill]=(publicDomainSkills[row.skill]??0)+1
assert.equal(new Set(publicDomainItems.map(row=>row.excerptId)).size,publicDomainRows.length,'Each public-domain excerpt must be used exactly once')
const publicDomainReport=JSON.stringify({provenance:'48 newly authored SAT-style questions, one per distinct public-domain literary excerpt; sourced passages are not claimed as original writing. No numerical or name-swapping variants.',total:publicDomainRows.length,skills:publicDomainSkills,passageWords:{minimum:Math.min(...publicDomainWords),maximum:Math.max(...publicDomainWords)},sourceVerification:'verify-public-domain.py compares complete normalized source paragraphs, hashes, and edition rights notices. Question interpretations and distractors were reviewed editorially; source matching alone does not establish their correctness.',items:publicDomainItems},null,2)+'\n'
const publicDomainReportPath=fileURLToPath(new URL('../../docs/public-domain-reading-report.json',import.meta.url))
if(process.argv.includes('--check'))assert.equal(readFileSync(publicDomainReportPath,'utf8'),publicDomainReport)
else writeFileSync(publicDomainReportPath,publicDomainReport)
const evidenceWords=readingEvidenceFresh.map(row=>row.passage.trim().split(/\s+/).length)
const evidenceSkills={}
for(const row of readingEvidenceFresh)evidenceSkills[row.skill]=(evidenceSkills[row.skill]??0)+1
const evidenceReport=JSON.stringify({provenance:'16 individually authored questions with original passages; eight exact-quotation evidence questions and eight paired-text comparisons. No numerical or name-swapping variants.',total:readingEvidenceFresh.length,skills:evidenceSkills,passageWords:{minimum:Math.min(...evidenceWords),maximum:Math.max(...evidenceWords)},originalPoemPassages:readingEvidenceFresh.filter(row=>row.passage.includes('an original poem')).length,verification:'Every quotation option is checked against its passage during generation; all interpretations and distractors were reviewed editorially. Quotation matching and structural checks do not automatically establish the correct interpretation.'},null,2)+'\n'
const evidenceReportPath=fileURLToPath(new URL('../../docs/fresh-evidence-reading-report.json',import.meta.url))
if(process.argv.includes('--check'))assert.equal(readFileSync(evidenceReportPath,'utf8'),evidenceReport)
else writeFileSync(evidenceReportPath,evidenceReport)
const writingWords=writingFresh.map(row=>row.passage.trim().split(/\s+/).length),writingSkills={}
for(const row of writingFresh)writingSkills[row.skill]=(writingSkills[row.skill]??0)+1
const writingReport=JSON.stringify({provenance:'16 individually authored writing questions with distinct passages and note sets; no numerical or name-swapping variants. Grammar rules and rhetorical skills naturally recur.',total:writingFresh.length,skills:writingSkills,passageWords:{minimum:Math.min(...writingWords),maximum:Math.max(...writingWords)},verification:'One blank per completion item; exactly four distinct choices; interpretations, grammatical completions, and distractors reviewed editorially. Arithmetic in synthesis notes checked directly.'},null,2)+'\n'
const writingReportPath=fileURLToPath(new URL('../../docs/fresh-writing-report.json',import.meta.url))
if(process.argv.includes('--check'))assert.equal(readFileSync(writingReportPath,'utf8'),writingReport)
else writeFileSync(writingReportPath,writingReport)
console.log(`${process.argv.includes('--check')?'Verified':'Wrote'} ${rows.length} original Reading and Writing questions across ${Object.keys(counts).length} skills.`)
