import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

// Generate historical records unchanged, then select one existing representative.
// Never renumber or rebuild choices when retiring template siblings.
export function partitionFamily(questions,representativeId=questions[0]?.id) {
 assert(questions.length,'A family needs at least one question')
 assert.equal(new Set(questions.map(q=>q.id)).size,questions.length)
 const active=questions.filter(q=>q.id===representativeId)
 assert.equal(active.length,1,`${representativeId}: missing or ambiguous representative`)
 return {active,retired:questions.filter(q=>q.id!==representativeId)}
}

export function loadFamilyOverlaps() {
 return JSON.parse(readFileSync(new URL('./family-overlaps.json',import.meta.url),'utf8'))
}

export function familyOverlapsByName(prefix) {
 const rows=loadFamilyOverlaps().filter(row=>row.candidateQuestionId.startsWith(prefix))
 const overlaps=new Map(rows.map(row=>[row.family,row]))
 assert.equal(overlaps.size,rows.length,`${prefix}: repeated overlap declaration`)
 return overlaps
}

const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])])):value
const digest=value=>createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex')

export function partitionReviewedFamily(questions,representative,overlap,sourceById) {
 const partition=partitionFamily(questions,representative.id)
 if(!overlap)return partition
 const {family,candidateQuestionId,candidateSha256,retainedQuestionId,retainedSha256}=overlap
 assert.equal(representative.id,candidateQuestionId,`${family}: recheck the overlap after changing its candidate`)
 assert.equal(digest(representative),candidateSha256,`${family}: candidate changed since overlap review`)
 const retained=sourceById.get(retainedQuestionId)
 assert(retained,`${family}: retained question must remain active`)
 assert.equal(digest(retained),retainedSha256,`${family}: retained question changed since overlap review`)
 return {active:[],retired:questions}
}
