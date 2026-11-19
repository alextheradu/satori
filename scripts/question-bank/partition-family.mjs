import assert from 'node:assert/strict'

// Generate historical records unchanged, then select one existing representative.
// Never renumber or rebuild choices when retiring template siblings.
export function partitionFamily(questions,representativeId=questions[0]?.id) {
 assert(questions.length,'A family needs at least one question')
 assert.equal(new Set(questions.map(q=>q.id)).size,questions.length)
 const active=questions.filter(q=>q.id===representativeId)
 assert.equal(active.length,1,`${representativeId}: missing or ambiguous representative`)
 return {active,retired:questions.filter(q=>q.id!==representativeId)}
}
