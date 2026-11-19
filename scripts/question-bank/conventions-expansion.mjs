// Additional controlled constructions; append after the first sixteen families.
export function registerConventionsExpansion({add,item,opt,FORM,BOUND,splitLast}) {
 add('relative-clause-plural-verb',FORM,'hard',c=>item(
  `In a hypothetical project, the ${c.role} checked the ${c.recordA} before revising the ${c.subject}. The revised document includes observations that ______ the conclusion that ${c.claim}.`,
  'plural-relative-verb',[
   opt('support','plural-relative-verb'),opt('supports','singular-present'),opt('has supported','singular-perfect'),opt('is supporting','singular-progressive')],
  'The relative pronoun “that” refers to the plural noun observations, so the relative clause needs the plural verb “support.” The singular subject of the main clause, document, does not control the verb inside the relative clause.'))
 add('one-of-plural-subject',FORM,'medium',c=>item(
  `During a hypothetical inspection last year, one of the ${c.plural} ______ stored beside the ${c.subject}. The ${c.role} recorded this location in the ${c.recordB}.`,
  'singular-past-passive',[
   opt('was','singular-past-passive'),opt('were','plural-past'),opt('have been','plural-perfect'),opt('are','plural-present')],
  'The subject is the singular pronoun one. The prepositional phrase beginning with of does not change its number. “Was stored” agrees with one and places the storage in the specified past period.'))
 add('passive-participle-after-was',FORM,'medium',c=>item(
  `In a hypothetical review, the ${c.subject} was ______ by the ${c.role}, who then compared the ${c.plural} with information from the ${c.recordA}.`,
  'past-participle',[
   opt('examined','past-participle'),opt('examine','base-form'),opt('examining','present-participle'),opt('examination','noun')],
  'The passive construction requires was followed by a past participle: “was examined by.” The base form, the -ing form, and the noun do not complete that passive verb phrase.'))
 add('parallel-gerunds-after-by',FORM,'medium',c=>item(
  `In a hypothetical project, the ${c.role} improved the ${c.subject} by comparing the ${c.recordA}, reviewing the ${c.plural}, and ______ the ${c.recordB}.`,
  'parallel-gerund',[
   opt('checking','parallel-gerund'),opt('checks','finite-present'),opt('checked','past-participle'),opt('to check','infinitive')],
  'The coordinated actions follow the preposition by and share the same form: comparing, reviewing, and checking. A finite verb, past participle, or infinitive would break that parallel structure.'))
 add('plural-possessive-their',FORM,'easy',c=>item(
  `The two ${c.role}s revised ______ shared report on the ${c.subject} after comparing the ${c.plural} with the ${c.recordA} in a hypothetical review.`,
  'plural-possessive-determiner',[
   opt('their','plural-possessive-determiner'),opt('they’re','contraction'),opt('its','singular-possessive'),opt('them','object-pronoun')],
  `The report belongs to the two ${c.role}s, so the plural possessive determiner their is required. “They’re” means “they are,” its is singular, and them cannot modify shared report as a possessive determiner.`))
 add('subject-who-relative-clause',FORM,'medium',c=>item(
  `In a hypothetical project, the director contacted the ${c.role}, ______ had prepared the ${c.subject}, to request a comparison of the ${c.plural} with the ${c.recordB}.`,
  'subject-relative-pronoun',[
   opt('who','subject-relative-pronoun'),opt('whom','object-relative-pronoun'),opt('whose','possessive-relative-pronoun'),opt('who’s','contraction')],
  'The pronoun is the subject of had prepared inside the relative clause, so who is correct. Whom serves as an object, whose marks possession, and who’s would add is or has before an already complete past-perfect verb phrase.'))
 add('closing-parenthesis',BOUND,'medium',c=>{
  const [before,last]=splitLast(c.plural)
  return item(`During a hypothetical review, the ${c.subject} (which summarizes the ${before} ______ was compared with the ${c.recordA} before the ${c.role} revised it.`,
   'closing-parenthesis',[
    opt(`${last})`,'closing-parenthesis'),opt(`${last},`,'unclosed-parenthesis-comma'),opt(`${last};`,'unclosed-parenthesis-semicolon'),opt(`${last}:`,'unclosed-parenthesis-colon')],
   'The supplementary clause begins with an opening parenthesis and must end with a closing parenthesis. After the parenthesis closes, was compared supplies the main predicate. A comma, semicolon, or colon cannot close the parenthetical construction.')
 })
 add('comma-coordinating-conjunction',BOUND,'medium',c=>item(
  `The ${c.subject} was ______ the ${c.role} requested another check of the ${c.plural} before the hypothetical team filed its report with the ${c.recordA}.`,
  'comma-plus-coordinator',[
   opt('complete, but','comma-plus-coordinator'),opt('complete but;','semicolon-after-coordinator'),opt('complete, however','comma-splice-adverb'),opt('complete but,','comma-after-coordinator')],
  'The text joins two independent clauses with the coordinating conjunction but. A comma belongs before but. A semicolon or comma immediately after but breaks the second clause, while however cannot join independent clauses with only a comma.'))
}
