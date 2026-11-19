// Controlled grammar practice: 24 rule families applied to 64 original contexts.
import assert from 'node:assert/strict'
import { readdirSync,readFileSync,writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { conventionsContexts } from './conventions-contexts.mjs'
import { registerConventionsExpansion } from './conventions-expansion.mjs'
const root=fileURLToPath(new URL('../../',import.meta.url)),directory=join(root,'src/data/questions')
const check=process.argv.includes('--check'),families=[]
const splitLast=s=>{const i=s.lastIndexOf(' ');return [s.slice(0,i),s.slice(i+1)]}
const article=s=>/^(?:[aeio]|urban)/i.test(s)?'an':'a'
const opt=(text,construction)=>({text,construction})
const add=(key,skill,difficulty,make)=>families.push({key,skill,difficulty,make})
const item=(passage,required,options,explanation)=>({passage,required,options,explanation})
const FORM='Form, Structure, and Sense',BOUND='Boundaries'
const singularHeads=new Set(['catalog','analysis','inventory','comparison','sequence','summary','reconstruction','description','assessment','arrangement','review','model','account','index','evaluation','outline','distribution','measurement','interpretation','classification','projection','transcription','study','ordering','estimate','diagram','record','mapping'])
const contexts=conventionsContexts.map(([subject,plural,claim,role,recordA,recordB],index)=>{
 assert(singularHeads.has(subject.split(' ')[0]),`Unreviewed subject head: ${subject}`)
 assert(plural.endsWith('s'),`Evidence phrase needs an explicitly plural head: ${plural}`)
 for(const text of [subject,plural,claim,role,recordA,recordB])assert(typeof text==='string'&&text.trim()===text&&text.length>2)
 assert(!/[.!?]$/.test(claim),'Context findings are stored as clauses without terminal punctuation')
 return {subject,plural,claim,role,recordA,recordB,index}
})
assert.equal(contexts.length,64)
add('singular-subject-attractor',FORM,'hard',c=>item(
 `In a hypothetical study, the ${c.subject}, considered alongside the ${c.plural}, ______ that ${c.claim}.`,
 'singular-present',[
  opt('indicates','singular-present'),opt('indicate','plural-present'),opt('have indicated','plural-perfect'),opt('are indicating','plural-progressive')],
 `The singular subject head is “${c.subject.split(' ')[0]}.” The intervening phrase mentioning ${c.plural} does not change its number. “Indicates” supplies the singular finite verb; all other choices require a plural subject.`))
add('plural-subject-attractor',FORM,'medium',c=>item(
 `In an imagined report, the ${c.plural}, despite a discrepancy in the ${c.subject}, ______ that ${c.claim}.`,
 'plural-present',[
  opt('indicate','plural-present'),opt('indicates','singular-present'),opt('has indicated','singular-perfect'),opt('is indicating','singular-progressive')],
 `The subject “${c.plural}” is plural. The intervening despite phrase includes a singular noun, but does not control agreement. “Indicate” is the only plural finite verb offered.`))
add('singular-perfect-auxiliary',FORM,'medium',c=>item(
 `The ${c.subject}, unlike the ${c.plural}, ______ been checked against the ${c.recordA} in a hypothetical review.`,
 'singular-perfect-auxiliary',[
  opt('has','singular-perfect-auxiliary'),opt('have','plural-perfect-auxiliary'),opt('are','present-be'),opt('were','past-be')],
 `The singular head “${c.subject.split(' ')[0]}” takes “has been checked.” “Have” would require a plural subject, while “are been” and “were been” do not form grammatical passive verb phrases.`))
add('past-before-past',FORM,'medium',c=>item(
 `By the time the hypothetical project ended in 2024, the ${c.role} ______ the ${c.plural} twice.`,
 'past-perfect',[
  opt('had examined','past-perfect'),opt('will examine','future'),opt('is examining','present-progressive'),opt('examines','simple-present')],
 `The examination occurred before a stated later event in the past: the project’s end in 2024. “Had examined” expresses that sequence. The other choices place the examination in the present or future.`))
add('introductory-modifier-agent',FORM,'hard',c=>item(
 `After reviewing the ${c.plural}, ______ an inconsistency in the ${c.recordA}.`,
 'human-reviewer',[
  opt(`the ${c.role} identified`,'human-reviewer'),opt('an inconsistency was identified as','modified-object'),opt('there was an identifying of','dummy-subject'),opt('identifying was done to','action-noun-subject')],
 `The introductory phrase describes the person who reviewed the evidence. “The ${c.role} identified” supplies that person as the main-clause subject. The other choices leave the reviewing action without its logical subject, creating a dangling modifier.`))
add('parallel-infinitive-actions',FORM,'medium',c=>item(
 `A hypothetical protocol requires staff to record the ${c.plural}, compare the ${c.recordA}, and ______ the ${c.recordB}.`,
 'base-form',[
  opt('inspect','base-form'),opt('inspecting','gerund'),opt('inspected','past-participle'),opt('inspection of','noun-phrase')],
 `The three coordinated actions follow “requires staff to”: record, compare, and inspect. They must use parallel base-form verbs. The gerund, participle, and noun phrase do not match the other actions.`))
add('regular-plural-possessive',FORM,'easy',c=>item(
 `The two ______ notes on the ${c.subject} were stored with the ${c.recordB} in a hypothetical archive.`,
 'plural-possessive',[
  opt(`${c.role}s’`,'plural-possessive'),opt(`${c.role}’s`,'singular-possessive'),opt(`${c.role}s`,'plain-plural'),opt(`${c.role}s’s`,'malformed-possessive')],
 `The notes belong to two people, so the regular plural “${c.role}s” takes an apostrophe after its final s: “${c.role}s’.” The singular possessive describes one person, the plain plural does not mark possession, and the final form is nonstandard.`))
add('possessive-its',FORM,'easy',c=>item(
 `The ${c.subject} was revised after ______ limitations became clear during a hypothetical review.`,
 'singular-inanimate-possessive',[
  opt('its','singular-inanimate-possessive'),opt('it’s','contraction'),opt('its’','malformed-possessive'),opt('itself','reflexive-pronoun')],
 `“Its” is the possessive determiner referring to the singular ${c.subject.split(' ')[0]}. “It’s” means “it is” or “it has,” “its’” is nonstandard, and the reflexive “itself” cannot serve as a possessive determiner before limitations.`))
add('introductory-dependent-boundary',BOUND,'easy',c=>{
 const [before,last]=splitLast(c.claim)
 return item(`Although ${before} ______ the ${c.role} continued to review the ${c.recordB} in the hypothetical project.`,
 'dependent-comma',[
  opt(`${last},`,'dependent-comma'),opt(`${last};`,'dependent-semicolon'),opt(`${last}.`,'dependent-period'),opt(`${last}:`,'dependent-colon')],
 `The opening “Although ${c.claim}” is a dependent clause. A comma joins it to the main clause about the ${c.role}. A semicolon, period, or colon would incorrectly treat that dependent clause as a complete statement.`)
})
add('paired-nonessential-commas',BOUND,'hard',c=>{
 const [before,last]=splitLast(c.plural)
 return item(`The ${c.subject}, unlike the ${before} ______ was retained when the hypothetical project ended.`,
 'closing-comma',[
  opt(`${last},`,'closing-comma'),opt(`${last};`,'semicolon'),opt(`${last}:`,'colon'),opt(last,'no-close')],
 `The nonessential phrase “unlike the ${c.plural}” begins after a comma and must close with one. The main subject is the ${c.subject.split(' ')[0]}, and the main verb is “was retained.” A semicolon or colon would split that subject from its verb.`)
})
add('semicolon-before-however',BOUND,'medium',c=>item(
 `The ${c.subject} was ______ however, the ${c.plural} required further review in the hypothetical project.`,
 'independent-semicolon',[
  opt('complete;','independent-semicolon'),opt('complete,','comma-splice'),opt('complete','run-on'),opt('complete: and','broken-link')],
 `Both “The ${c.subject} was complete” and “the ${c.plural} required further review” are independent clauses. A semicolon before the conjunctive adverb however is correct. A comma alone creates a comma splice; no boundary creates a run-on.`))
add('colon-introducing-explanation',BOUND,'medium',c=>item(
 `The hypothetical inspection of the ${c.plural} revealed one unresolved ______ an inconsistency in the ${c.recordA}.`,
 'colon-fragment',[
  opt('issue:','colon-fragment'),opt('issue;','semicolon-fragment'),opt('issue.','period-fragment'),opt('issue: and','unnecessary-conjunction')],
 `The complete clause before the blank introduces a noun phrase explaining the issue. A colon does this correctly. “An inconsistency in the ${c.recordA}” is not an independent clause, so it cannot follow a semicolon or period as a complete sentence here.`))
add('compound-predicate-object',BOUND,'easy',c=>item(
 `In the hypothetical project, the ${c.role} recorded the ${c.plural} and ______ the ${c.recordB}.`,
 'unseparated-verb-object',[
  opt('reviewed','unseparated-verb-object'),opt('reviewed,','comma-after-verb'),opt('reviewed;','semicolon-after-verb'),opt('reviewed:','colon-after-verb')],
 `“Recorded” and “reviewed” share the subject “the ${c.role}.” No punctuation should separate the verb reviewed from its direct object, “the ${c.recordB}.” The other choices insert an invalid boundary.`))
add('paired-parenthetical-dashes',BOUND,'medium',c=>{
 const [before,last]=splitLast(c.recordB)
 return item(`The ${c.subject} — along with the ${before} ______ was retained after the hypothetical review.`,
 'closing-dash',[
  opt(`${last} —`,'closing-dash'),opt(`${last},`,'mismatched-comma'),opt(`${last};`,'mismatched-semicolon'),opt(`${last}:`,'mismatched-colon')],
 `The parenthetical phrase begins with an em dash and must close with an em dash. The paired dashes set off “along with the ${c.recordB},” preserving the link between the singular subject and “was retained.”`)
})
add('independent-clause-period',BOUND,'medium',c=>item(
 `The ${c.subject} was revised ______ was then compared with the ${c.recordA} in the hypothetical study.`,
 'period-and-independent-subject',[
  opt('again. It','period-and-independent-subject'),opt('again, it','comma-splice'),opt('again it','run-on'),opt('again; which','dependent-after-semicolon')],
 `A period separates two complete sentences, and “It” supplies the second sentence’s subject. A comma alone would join independent clauses incorrectly; no punctuation creates a run-on; a semicolon followed by which creates a dependent fragment.`))
add('complex-list-separators',BOUND,'hard',c=>item(
 `The hypothetical workshop compared a report on the ${c.plural}, prepared by ${article(c.role)} ______ a timeline of the ${c.recordA}, assembled by an editor; and a checklist of the ${c.recordB}, checked by a coordinator.`,
 'complex-list-semicolon',[
  opt(`${c.role};`,'complex-list-semicolon'),opt(`${c.role}, which`,'incomplete-relative-clause'),opt(`${c.role}.`,'fragmenting-period'),opt(`${c.role}; and;`,'broken-conjunction')],
 `The three compared items each contain an internal comma. A semicolon after “${c.role}” separates the first item from the second and parallels the existing separator before the third. A period fragments the list, which cannot introduce the following noun phrase as a complete relative clause, and an extra semicolon after and is invalid.`))

registerConventionsExpansion({add,item,opt,FORM,BOUND,splitLast})
const seen=new Set(),questions=[],report=[]
for(const file of readdirSync(directory).filter(f=>f.endsWith('.json')&&f!=='generated-rw-conventions.json'))for(const q of JSON.parse(readFileSync(join(directory,file),'utf8')))seen.add(`${q.passage??''}\n${q.prompt}`.replace(/\s+/g,' ').trim())
for(const [familyIndex,family] of families.entries()) {
 const first=questions.length
 for(const c of contexts) {
  const row=family.make(c),valid=row.options.map(o=>o.construction===row.required)
  assert.equal(valid.filter(Boolean).length,1,`${family.key}: rule model needs exactly one valid construction`)
  assert.equal(new Set(row.options.map(o=>o.text)).size,4)
  assert.equal((row.passage.match(/______/g)||[]).length,1)
  const prompt='Which choice completes the text so that it conforms to the conventions of Standard English?'
  const fingerprint=`${row.passage}\n${prompt}`.replace(/\s+/g,' ').trim()
  assert(!seen.has(fingerprint),`${family.key}/${c.index}: repeated stimulus`);seen.add(fingerprint)
  const correctIndex=valid.indexOf(true),correct=row.options[correctIndex].text,choices=row.options.filter((_,i)=>i!==correctIndex).map(o=>o.text),answer=(familyIndex+c.index)%4
  choices.splice(answer,0,correct)
  assert(!row.passage.replace('______',correct).includes('______'))
  questions.push({id:`rw-gen-conventions-${family.key}-${String(c.index+1).padStart(3,'0')}`,section:'rw',domain:'Standard English Conventions',skill:family.skill,difficulty:family.difficulty,passage:row.passage,prompt,choices,answer,explanation:row.explanation})
 }
 report.push({family:family.key,skill:family.skill,difficulty:family.difficulty,questions:questions.length-first})
}
assert.equal(families.length,24)
assert.equal(questions.length,1536)
const save=(path,value)=>{const text=JSON.stringify(value,null,2)+'\n';if(check)assert.equal(readFileSync(path,'utf8'),text,`${path}: regenerate content`);else writeFileSync(path,text)}
save(join(directory,'generated-rw-conventions.json'),questions)
save(join(root,'docs/conventions-generation-report.json'),{provenance:'Original controlled grammar practice: 24 authored rule patterns and 64 original contexts. Construction tags and controlled subject numbers are checked; these checks are not independent natural-language certification.',contexts:contexts.length,total:questions.length,families:report})
console.log(`${check?'Verified':'Generated'} ${questions.length} grammar variants across ${families.length} rule families and ${contexts.length} original contexts.`)
