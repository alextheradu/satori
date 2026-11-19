# Question bank expansion and practice sources

The app now contains **1,780 active questions**, up from the original 512. To honor the no-repeat requirement, each declared generated family or task pattern contributes at most one active representative, with eight reviewed overlaps covered by existing questions. Its numerical or contextual siblings are historical only. Another **14,105 records** preserve saved attempts and review; they do not inflate the active practice count. Difficulty labels are editorial estimates rather than calibrated College Board ratings. Broader correctness and cross-family semantic-repeat review remains open.

| Active material | Count | What the count represents |
|---|---:|---|
| Existing questions | 512 | Original bank retained with stable IDs |
| Math family representatives | 176 | Active generated items; eight other declared patterns are covered by existing questions |
| Conceptual statistics | 88 | Individually written questions about study design, inference, and spread |
| Individually written math | 20 | Active individually written items, all independently reviewed |
| Individually written Reading and Writing | 928 | Distinct authored stimuli across all 11 skills; 48 questions use cited public-domain literary excerpts |
| Table-evidence representatives | 16 | One active item per declared evidence family |
| Grammar representatives | 24 | One active item per controlled rule pattern |
| Expression of Ideas representatives | 16 | One active item per declared rhetorical task pattern |
| Total | **1,780** | Questions available in new automatically selected practice and tests |

The generated sets now supply 232 active representatives. Eight declared patterns are covered by existing active questions instead. Their 14,104 historical versions retain their IDs and answer keys in `src/data/retired/`; two families have explanation corrections described in the latest batch below. One separately retired authored overlap brings the historical total to 14,105. This includes restoring the 26 equivalent math records that earlier fingerprint filtering had omitted, so their IDs can again resolve in saved attempts. The generators still reconstruct and check all historical candidates before selecting representatives, but they do not add their siblings to the active bank. The 928 individually authored Reading and Writing additions include 880 original passages or contexts and 48 sourced public-domain excerpts. Invented people, institutions, studies, and stories are identified as fictional or hypothetical.

The family policy removes known repeated generation patterns; it does not claim that every remaining question is conceptually unrelated to all others. Reusing a SAT skill is expected. Cross-family and individually authored overlaps still require editorial review.

## Coverage

| Section | Domain | Questions |
|---|---|---:|
| Math | Algebra | 101 |
| Math | Advanced Math | 119 |
| Math | Problem-Solving and Data Analysis | 205 |
| Math | Geometry and Trigonometry | 115 |
| Reading and Writing | Craft and Structure | 416 |
| Reading and Writing | Information and Ideas | 416 |
| Reading and Writing | Expression of Ideas | 238 |
| Reading and Writing | Standard English Conventions | 170 |

All 19 math skills and all 11 Reading and Writing skills used by this bank receive new questions. Family count measures distinct templates rather than skill count.

## Verification and maintenance

- `npm run questions:generate` regenerates active and historical JSON from the authored content, then refreshes the family-policy report. Historical candidates retain their original IDs and choices before the active representative is selected.
- `npm run validate` checks active and historical structure, globally unique IDs, active stimulus/prompt fingerprints, numeric answers, answer positions, and KaTeX syntax. It also enforces at most one active generated representative per declared family, verifies an existing active representative for documented overlaps, and accounts for every historical ordinal. It then regenerates in memory and compares output with the committed additions, including forward-model checks of numerical answers and checks that only one numerical option satisfies each problem.
- `npm run build` validates and builds the frontend and backend.
- `npm run questions:runtime`, after building, loads the actual production bank, checks it against the source JSON, exercises the app's grader, renders every question's text using the app's markup component, checks table and blank rendering, and exercises balanced module selection with exclusions for both sections and all three difficulty routes, including skill balance within each domain.
- `npm run questions:spr` checks the typed-answer grader against College Board's published accepted/rejected examples and regressions for large fractional answers. Both answer-entry screens enforce five characters for positive entries and six including a minus sign for negative entries.
- `npm run questions:audit` refreshes `docs/question-format-audit.json`; validation checks that the report is current and that its format/repeat screens have no findings. Repeat checks normalize math spacing and supported integer quadratic zero equations in expanded, factored, and squared-linear form, including missing terms and nonzero integer scale factors, as well as whitespace. Word and variable case are preserved. Regression cases ensure that different targets and case-sensitive variables are not incorrectly merged. This is not a complete semantic-equivalence detector.
- Validation checks the source hashes in the eight math review manifests against all 318 reviewed records, their solvers, the shared mathematical parser where used, and the pinned dependency. These comprise all 256 original math questions, 20 active individually authored math additions, one retired authored item, and 41 selected Algebra-family candidates (33 active, eight retired). All 101 active Algebra questions are included. Other bank questions remain outside these reviews.
- The four generation reports identify each active representative, its candidate count, and its archived sibling count. `docs/family-retirement-report.json` aggregates the 232 generated representatives, eight patterns represented by existing questions, and 14,104 historical family versions. Grammar checks validate controlled head numbers, choice-construction tags, completed blanks, distinct choices, and unique stimuli; they do not independently certify natural-language interpretation. The table generator checks numeric assertions and its authored relevance classifications; it does not independently certify natural-language interpretation.

Automated checks do not replace an independent editorial review of passage interpretation, distractor quality, or difficulty. They do check mathematical consistency, integration, and structural/rendering correctness.

## Practice sources found on the web

Publisher pages were checked on **2026-11-18–19**. External questions are linked in the app's Reference page; they are not included in the bundled count. Reported external collection sizes below are publishers' descriptions, not independently counted question inventories. Several official resources reuse questions, so their counts must not be added as if they were distinct questions.

| Resource | Practice available | Access and scope |
|---|---|---|
| [College Board: Bluebook](https://satsuite.collegeboard.org/practice/practice-tests/bluebook) | Official adaptive full-length tests | Free app and College Board account |
| [College Board: Student Question Bank](https://satsuite.collegeboard.org/practice/student-question-bank) | Official questions, filterable by section and skill | Free College Board account; overlaps other official resources |
| [College Board: Educator Question Bank](https://satsuiteeducatorquestionbank.collegeboard.org/digital/search) | Official searchable questions and exports | Includes SAT Suite assessments; select SAT; overlaps student bank |
| [College Board: paper practice tests](https://satsuite.collegeboard.org/practice/practice-tests/paper) | Nonadaptive PDFs, keys, and explanations | Free downloads; includes SAT and PSAT; overlaps Bluebook content |
| [College Board: Question of the Day](https://qotd.collegeboard.org/) | Short official Math and Reading and Writing practice | Free; daily format |
| [Khan Academy: SAT Math](https://www.khanacademy.org/test-prep/v2-sat-math) | Official skill practice and lessons | Free; not the location for full-length Bluebook tests |
| [Khan Academy: SAT Reading and Writing](https://www.khanacademy.org/test-prep/sat-reading-and-writing) | Official reading, grammar, and writing practice | Free |
| [SAT Math Guide](https://www.satmathguide.com/practice/) | Publisher describes 350 original math questions with explanations | Free, no login; topic and difficulty filters |
| [Woodlogos](https://www.woodlogos.net/sat/) | Original Reading and Writing practice across all 11 skills | Free, no account; publisher describes a collection approaching 1,000 items |
| [StudyGlen](https://studyglen.com/exams/sat) | Original questions across all eight domains | Public samples; free account for expanded practice |
| [Magoosh diagnostic quiz](https://magoosh.com/sat/sat-practice-questions-diagnostic-quiz/) | Short mixed-section question set with explanations | Free public article and quiz |
| [Magoosh practice test](https://sat.magoosh.com/practice_tests/free) | Digital SAT practice test | Free test offer; registration may be needed; expanded prep is paid |
| [Kaplan 20-minute workout](https://www.kaptest.com/sat/free/sat-20-minute-workout) | Short question set with explanations | Free offer; registration may be needed |
| [Kaplan practice test](https://www.kaptest.com/sat/free/sat-practice) | Full-length practice and feedback | Free test offer; account required; other products paid |
| [The Princeton Review](https://www.princetonreview.com/college/free-sat-practice-test) | Digital practice test and score feedback | Free offer requiring registration; other products may be paid |
| [Manhattan Review online questions](https://www.manhattanreview.com/sat-practice-questions/) | Online questions with explanations | Free; check individual exercises for current-format relevance |
| [Manhattan Review math book](https://www.manhattanreview.com/free-sat-math-question-bank/) | Publisher describes about 300 math questions | Free book offer; request/registration may be required |
| [Test Innovators](https://testinnovators.com/sat/) | Adaptive tests and targeted practice | Free starting option, paid expanded access; check current limits |
| [Erik the Red](https://www.erikthered.com/tutor/practice.html) | Printable math quizzes, strategies, solutions | Free; explicitly designed for 2005–2016 SAT, so use as supplemental drills |
| [CrackSAT digital index](https://www.cracksat.net/digital/index.html) | Index of practice sets and downloadable materials | Third-party aggregation; check original publishers and individual test formats |

| [Whiz](https://www.whiz.study/sat) | Publisher lists 2,900 drills and free SAT practice exams | Free SAT drills/tests; optional Pro features paid |
| [OnePrep](https://www.oneprep.com/question-bank) | Skill-filtered Math and Reading and Writing bank with explanations | Free sign-in to practice; collection headline is publisher-reported |
| [Varsity Tutors: Reading and Writing](https://www.varsitytutors.com/practice/subjects/sat-reading-and-writing) | Skill quizzes, flashcards, and lessons; publisher lists thousands of questions | Free account offered; verify individual exercise format |
| [Varsity Tutors: full-length tests](https://www.varsitytutors.com/learner/subjects/sat/practice-tests) | Publisher lists seven 98-question SAT tests | Account access may be required; separate listing from topic quizzes |
| [PrepArc](https://preparc.app/) | Publisher lists 4,328 original Math and Reading and Writing questions | Free question practice without account; account for tests and saved progress |
| [One for All SAT](https://oneforallsat.com/sat-prep/) | Publisher lists 1,748 questions, notes, and worked solutions | Free; sign-in optional for cross-device progress |
| [CollegePrepRoom](https://www.collegepreproom.com/sat/practice-test) | Original fixed section tests plus topic practice | Free; distinct from the official tests to which it also links |
| [Colorbook worked questions](https://sat.colorbook.tech/articles/sat-practice-questions/) | 32 public questions spanning all eight domains, with full choice explanations | Free article; links onward to the publisher's larger bank |

| [1600.now](https://1600.now/bank) | Publisher lists over 8,000 Math and Reading and Writing questions with skill and difficulty filters | Free practice; account-related features available |
| [Owl Test Prep](https://owltestprep.com/sat/practice-test) | Public sample questions with every choice explained; links to full tests | Public questions and some free tests; expanded access may be paid |
| [Break the Test](https://breakthetest.app/free-practice-tests) | Publisher lists 12,491 questions and a mixture of standard forms, all-hard forms, and single Math modules | Free; not every listed form is a full-length standard test |
| [SAT Math Lab](https://github.com/echa920/sat-math-lab) | Publisher lists 400 original Math questions with worked explanations and adaptive exams | Public repository links to hosted practice; no account needed |
| [SAT 1600](https://sat1600.io/practice) | Publisher lists 1,200+ original questions and adaptive modules | Free web practice without account; separate paid app features |
| [1600.gg](https://1600.gg/pricing/) | Free plan lists 50 targeted questions monthly, a diagnostic, and plan-limited mock access | Free account; expanded question access and some mock scoring are paid |
| [Acely](https://acely.com/pricing) | Free account includes an assessment, one SAT practice test, and 10 practice questions | No card for free account; full-bank trial is separate, card-based, and time-limited |
| [1600.io resource trial](https://www.1600.io/p/sat-resources-free-trial) | Trial access to Math Orange Book material and explanations for official practice-test questions | One-week trial, not an unlimited free question bank; continued membership paid |

| [Test Ninjas sampler](https://test-ninjas.com/sat-practice-questions) | 16 public questions across all eight domains, with explanations | Free, no account for the sampler; broader products may be paid |
| [Resolve Prep](https://resolveprep.com/pricing) | One free full-length test | Free plan explains only half the questions; full bank and other explanations paid |
| [blueberry](https://www.blueberrysat.com/free-sat-practice-tests) | Publisher lists eight SAT and three PSAT tests | Its listed SAT modules have nonstandard question counts and timing; supplemental practice rather than an exact digital SAT rehearsal |
| [PrepSolution](https://prepsolution.com/free-practice/sat) | 20-question Math and Reading and Writing sampler | Free to start; email required to unlock the results summary |
| [Sharp public question](https://getsharp.app/tools/sat-question-of-the-day) | Public question page with choice explanations | Free, no signup for the displayed question |
| [SAT Owl PDFs](https://satowl.com/sat-practice-test-pdf) | Three original printable tests with keys and alternate second modules | Free downloads without signup; includes both second-module routes rather than counting every PDF question as one sitting |
| [SAT Climb questions](https://satclimb.com/sat-questions) | Publisher lists 775 public hard questions | No account for questions; separate diagnostic requests email for its result |
| [Preply section tests](https://preply.com/en/math-science-tests/sat) | Two fixed 24-question section diagnostics | Free without signup; not full-length or adaptive |

| [The Critical Reader quizzes](https://thecriticalreader.com/quizzes/) | SAT/ACT grammar and reading quizzes plus archived questions | Public quiz index; some exercises use older formats |
| [theSATfix grammar](https://www.thesatfix.com/sat-grammar-practice) | Public grammar and transition samples with explanations | Public samples; account-based expanded practice linked |
| [Sharp grammar workbook](https://getsharp.app/tools/sat-grammar-workbook) | Publisher describes 40 questions across 10 grammar topics with explained answers | Email signup requested for PDF download |
| [Quiz Portal conventions](https://quizportal.info/sat/standard-english-conventions-practice/) | Publisher lists 21 original grammar and punctuation questions | Free to start; account optional for saved progress |
| [1600.now grammar worksheet](https://1600.now/sat-form-structure-sense-worksheet) | Twelve questions, student and explained-answer PDF versions | Public worksheet; use the publisher's download links |
| [EagleTeach Math module](https://www.eagleteach.com/practice-tests/digital-sat-math) | 22 questions in 35 minutes, with worked solutions | Free module; name/email form on the start page; not a full adaptive test |

| [CookSAT synthesis bank](https://cooksat.com/sat-training-bank/reading-writing/expression-of-ideas/rhetorical-synthesis) | Publisher lists 204 questions with difficulty and subskill filters | Public skill page; content may overlap other collections |
| [CookSAT transitions bank](https://cooksat.com/sat-training-bank/reading-writing/expression-of-ideas/transitions) | Publisher lists 194 questions | Public skill page; treat provider counts separately from the bundled bank |
| [SAT Practice Bot transitions](https://satpracticebot.com/practice/reading/transitions) | Original examples with worked explanations and relationship-identification guidance | Public practice page |
| [PeakSAT synthesis](https://www.peaksat.com/practice/rhetorical-synthesis) | Page lists nine original examples | Public examples; expanded platform/trial access separate |
| [FreeTestPrep synthesis](https://freetestprep.com/sat-reading-writing/hard-rhetorical-synthesis/) | Publisher lists 30 free drills, five questions each | Free drills with explanations of all choices |
| [FreeTestPrep transitions](https://freetestprep.com/sat-reading-writing/hard-transitions/) | Publisher lists 150 original questions in 30 drills | Free harder transition practice with explanations |
| [Open Practice Tests synthesis](https://openpracticetests.org/sat/english/expression-of-ideas/rhetorical-synthesis/practice/) | 36 listed untimed exercises | Publicly readable; JavaScript for checking and local progress |
| [Aniko synthesis bank](https://www.aniko.ai/free-resources/sat/question-bank/reading/expression-of-ideas/rhetorical-synthesis) | Free topic catalog lists 250 questions with explanations | Check broader platform/account access separately |
| [Sophic question bank](https://www.sophiclearning.com/sat/question-bank) | Publisher lists 180 questions across Math and Reading and Writing | Questions and choice explanations publicly readable; free account for saved practice |
| [SingleStepSAT Math](https://singlestepsat.com/sat/math/) | Skill pages across four domains; statistical-claims page contains 12 exercises | Public worked examples and practice with distractor explanations |
| [Margin full tests](https://marginsat.com/sat-practice-tests/) | Publisher lists five original 98-question tests, 490 questions total, with PDFs | Free, no signup; always the harder Module 2 rather than adaptive routing |
| [Perfect1600 PDFs](https://perfect1600.com/free-sat-practice-pdfs) | Seven listed 20-question mixed sets with answers and short explanations | Public PDFs; original supplementary sets, not released official exams; optional email subscription |
| [TestPrepKart sampler](https://www.testprepkart.com/sat/blog/sat-practice-questions) | Publisher lists 50 original questions across eight domains | Questions, answers, and explanations public without registration; coaching separate |
| [Brighterly reading assessment](https://brighterly.com/reading-test/sat-reading-practice-test/) | 15 multiple-choice reading questions | Public short unofficial assessment; not a full SAT section |
| [FreeTestPrep inferences](https://freetestprep.com/sat-reading-writing/hard-inferences/) | Publisher lists 150 original questions in 30 drills | Free harder passage-completion practice with explanations |
| [Open Practice Tests inferences](https://openpracticetests.org/sat/english/information-and-ideas/inferences/practice/) | 16 untimed exercises with explanations | Public questions; JavaScript for checking; local browser/device progress |
| [Prep Drills grammar](https://prepdrills.com/blog/sat-grammar-practice-2026/) | 25 original questions labeled medium or hard, with rule and choice explanations | Public interactive article and skill breakdown; a practice set rather than a full section |
| [Test Merkezim conventions](https://testmerkezim.com/en/practice-tests/sat/sat-reading-and-writing-standard-english-conventions-practice-test/) | 11 grammar and punctuation questions with explanations | Public 13-minute focused quiz |
| [PeakSAT grammar packet](https://www.peaksat.com/resources/sat-grammar-boundaries-packet) | 12 original questions, every-choice explanations, transfer checks, printable key | Public packet; broader platform/trial access separate |
| [FreeTestPrep conventions](https://freetestprep.com/sat-reading-writing/hard-standard-english-conventions/) | Publisher lists 150 original questions in 30 drills | Free mixed Boundaries and Form, Structure, and Sense practice with choice explanations |
| [ScoreDino Math workbook](https://scoredino.com/resources/sat-math-worksheets/) | Publisher offers 40 original questions with worked solutions in a 37-page PDF | Free without signup; eight-question starting check reuses the workbook, so it is not 48 distinct questions |
| [SAT Math Practice monthly sampler](https://satmathpractice.com/free-questions) | 12 public questions, three per Math domain, with choice and typed responses | Public set with scoring/explanations after completion; broader account features separate |
| [Brighterly Math assessment](https://brighterly.com/math-test/sat-math-practice-test/) | 15 original multiple-choice questions across Math domains | Public short unofficial assessment rather than a full Math section |

The publisher pages are the sources for the resource descriptions, not sources of the bundled original questions. None of the provider-reported external counts is included in the app's 1,780-question active total. Free-test offers and account requirements can change. Linking a collection does not certify every external answer or imply that its questions are unique relative to all other collections.

## Historical batch notes

The following entries describe earlier bank states and their review work. Earlier totals and variant counts are historical; the active counts and one-representative policy above supersede them.

## Additional Reading and Writing batch

The second authored batch adds 144 questions: 96 reading questions and 48 writing questions. It adds sentence-function analysis, evidence that weakens a hypothesis, quotation selection from original stories, raw-count versus percentage comparisons, translation tradeoffs, and sampling/generalization reasoning. The additions retain the existing question IDs and answer-choice positions for all earlier items.

## Additional harder-math batch

The next numerical batch adds 2,048 variants from 32 new families, appended after the earlier 88 families. Topics include extraneous radical solutions, strict discriminant bounds, reciprocal roots, transformed zeros, second differences, perpendicular lines, chord and tangent geometry, truncated-cone volume, conditional probabilities across groups, dilution, and combined means. This batch adds 1,856 questions labeled hard and 192 labeled medium. All 6,440 prior questions were compared with a saved baseline and remained identical, including IDs, answers, and choice order.

## Table-evidence and additional authored batch

The next batch adds 512 table-evidence variants plus 64 individually written questions in Craft and Structure, Expression of Ideas, and Standard English Conventions. The evidence families cover changes versus endpoints, proportional versus absolute recovery, totals versus rates, differing treatment effects, plateaus, partial recovery, narrowing gaps, adoption versus usage, center versus range, participation share, preference versus performance, relative costs, nonmonotonic outcomes, counterexamples, aggregate reversals, and errors versus time.

All 8,488 prior questions were verified unchanged against a saved baseline. The timed selector now balances skills within each domain as well as domains, so the larger table-evidence pool does not crowd out central ideas, textual evidence, and inference questions. This is an editorial variety policy, not a claim to reproduce College Board’s exact assembly algorithm.

## Controlled grammar batch

The next batch adds 1,024 grammar and punctuation variants, increasing Reading and Writing to 2,128 questions. Each of 16 rule families is applied to 64 authored contexts. The families cover singular and plural agreement with intervening phrases, auxiliary agreement, past perfect, introductory modifiers, parallel verbs, possessives, introductory dependent clauses, nonessential commas, semicolons, explanatory colons, compound predicates, paired dashes, independent sentences, and complex lists.

The rule-pattern review removed a pronoun distractor that could refer to an alternative plural antecedent and replaced a punctuation option that relied on stylistic consistency alone. All 9,064 earlier questions are retained unchanged. Timed selection continues to balance skills within each domain.

## Individually written reading batch

A further 96 individually written questions add 16 each in Central Ideas and Details, Inferences, Command of Evidence (Textual), Text Structure and Purpose, Cross-Text Connections, and Words in Context. They include original poems and prose narratives, both-author agreement questions, methodological critiques, alternative explanations, and quotation selection. The passages contain 25–71 whitespace-delimited words. Their format follows the [College Board short-passage description](https://satsuite.collegeboard.org/sat/whats-on-the-test/reading-writing) and [question-stem guidance](https://satsuite.collegeboard.org/practice/student-question-bank/reading-writing), while the texts and choices are original.

`docs/literary-reading-report.json` records this batch's counts, skill coverage, poem count, and word-length range. Reproducibility checks cover it, and generation enforces a 25–150-word range for the batch. All 10,088 earlier question records remain unchanged. Reading and Writing now contains 2,224 questions.

## Expression of Ideas batch

A further 576 questions add 256 generated rhetorical-synthesis variants, 256 generated transition variants, and 64 individually written questions (32 per skill). The generated material uses 32 fictional paired-project contexts and 16 explicit task patterns. The notes distinguish shared purposes, methods, intended benefits, introduction dates, and pilot sizes without treating participation as measured effectiveness. Synthesis alternatives are designed to be consistent with the notes while serving different goals. Transition patterns cover contrast, similarity, illustration, inference, consequence, sequence, concession, and restatement.

`docs/expression-generation-report.json` records the 512-variant batch. Its checks cover structured goal/relation tags, numeric comparisons, uniqueness, choice positions, and a 25–150-word passage range. These checks do not independently certify natural-language interpretation. All 10,184 earlier records are preserved unchanged. Expression of Ideas now has 710 questions; Reading and Writing has 2,800.

## Study-design and reading-reasoning batch

A further 160 individually written questions add 64 on evaluating statistical claims and 96 reading questions, 16 each in Words in Context, Text Structure and Purpose, Cross-Text Connections, Central Ideas and Details, Inferences, and Command of Evidence (Textual). The statistics additions cover sampling frames, assignment versus selection, confounding, nonresponse, question wording, blinding, comparison conditions, dropout, compliance, and the scope of conclusions. These topics sit within the [College Board Problem-Solving and Data Analysis skill list](https://satsuite.collegeboard.org/sat/whats-on-the-test/math/types/problem-solving); the scenarios and choices are original.

The reading additions use original informational passages, paired arguments, stories, and three poems. Passages contain 30–60 whitespace-delimited words. `docs/reading-reasoning-report.json` records the reading batch; `docs/statistics-generation-report.json` records all 88 authored statistics additions, including this batch. Generation checks their counts, passage lengths for reading, and reproducibility. These checks do not independently certify passage interpretation or difficulty.

All 10,760 earlier records were compared with a saved baseline and remain unchanged, including IDs, answers, and choice order. The bank now has 8,024 Math and 2,896 Reading and Writing questions. The Reference page now links 60 external resources after adding publicly readable Sophic and SingleStepSAT practice; external questions are not bundled or added to the app’s question count.

## Additional math structures and extended reading

A further 2,112 questions add 2,048 numerical variants from 32 new math families and 64 individually written reading questions. The math families include tiered fees, strict integer bounds, counting solutions of a compound inequality, exceptional system parameters, translated intercepts, function composition, average-cost constraints, line-parabola tangency, exponential vertical offsets, three-sided enclosure optimization, biquadratic roots, cubic identities, unknown frequencies inferred from a mean, drain-and-refill concentration, hypotenuse altitudes, and cyclic quadrilaterals. Each of the four Math domains receives eight families and 512 questions. Of the math additions, 1,728 are labeled hard and 320 medium.

The reading batch adds 16 each in Central Ideas and Details, Inferences, Command of Evidence (Textual), and Cross-Text Connections. Its passages contain 71–88 whitespace-delimited words, including three original poems and eight support/eight weaken evidence tasks. `docs/extended-reading-report.json` records the counts and word range. The new texts and options are individually written rather than generated by changing names or numbers.

All 10,920 earlier records remain identical to a saved baseline, including IDs, answers, explanations, and choice order. Numerical checks include substitution and exactly one valid numeric choice. Every new grid-in has an exact fraction or decimal entry fitting the usual five-character positive or six-character negative entry limit. The bank now contains 10,072 Math and 2,960 Reading and Writing questions. The Reference page links 66 external resources after adding the six sources above; their questions remain outside the bundled count. Automated integration and numeric checks do not constitute independent editorial or psychometric certification.

## Vocabulary, interpretation, and additional grammar patterns

A further 640 Reading and Writing questions add 128 individually written items and 512 controlled grammar variants. The authored batch adds 32 each in Words in Context and Text Structure and Purpose, plus 16 each in Central Ideas and Details, Inferences, Command of Evidence (Textual), and Cross-Text Connections. It includes five original poems, eight explicit-detail questions, and four quotation-evidence tasks. Passages contain 37–69 whitespace-delimited words. `docs/verbal-coverage-report.json` records the batch and is included in reproducibility checks.

Eight additional grammar patterns are applied to the same 64 reviewed contexts, preserving earlier family IDs and answer positions. The patterns cover plural agreement within a relative clause, agreement with one of a plural group, a passive past participle, parallel gerunds after by, the possessive determiner their, who as a relative-clause subject, closing parentheses, and a comma with a coordinating conjunction. The new grammar passages contain 25–35 words, with generation enforcing a 25–150-word range. The family report now records 24 patterns and 1,536 variants. Construction tags check the authored model; they do not independently establish that every natural-language interpretation is unambiguous.

All 13,032 earlier records remain unchanged against a saved baseline. The bank now contains 10,072 Math and 3,600 Reading and Writing questions. Four more public practice resources bring the Reference page to 70 links; external questions remain separate from the bundled count.

## Applied-math batch and format/correctness audit

A further 2,048 numerical math questions introduce 32 families: eight per domain. They cover two-concentration mixtures, rate conversion before catch-up calculations, inverse linear composition, symmetric linear outputs, constrained integer coordinates, shared quadratic roots, sums of absolute distances, rewriting exponential bases, negative branches of radical identities, reflected extrema, intersection counts, replacement probabilities, equal-distance average speed, population-weighted estimates, map area scales, and combined geometric constraints. Of these additions, 1,472 are labeled hard and 576 medium. The sample-size family uses an exact fractional margin in the prompt so rounding a displayed threshold cannot change the least valid sample size.

The stronger repeat screen found 26 earlier quadratic questions equivalent under a nonzero integer scaling of the equation. Those items are now excluded by the generator; retained records keep their IDs and choice order. The net addition is 2,022, bringing the bank to 12,094 Math and 3,600 Reading and Writing questions.

The format audit revised 948 Reading and Writing stimuli by adding context: 857 controlled grammar variants and 91 other passages. Their choices and answer keys remain unchanged. The [College Board assessment framework](https://satsuite.collegeboard.org/media/pdf/assessment-framework-for-digital-sat-suite.pdf) defines its technical word count as six characters. The rendered passage-length screen checks 150–900 visible characters, with completed grammar blanks, and currently observes 150–892 characters. Earlier batch sections report ordinary whitespace-delimited words, a different measure.

Typed-response grading now derives permitted exact, truncated, and rounded representations instead of accepting a fixed numerical tolerance. Fifty accepted/rejected regression examples include the framework's examples for fractions, repeating decimals, negative values, and mixed numbers, plus large-answer and input-length cases. The review display preserves an exact answer and supplies a fitting entry when needed. Full production checks exercise those legal entries for every typed-response question.

These checks improve correctness and format coverage; they do not independently prove every natural-language interpretation, every legacy math key, or the absence of every semantic repeat. That review remains open. The current zero-finding audit is limited to its stated screens. Different-number template variants are explicitly counted above and remain under review against the strengthened no-repeat requirement.

## Fresh reading and independent Algebra review

The next 64 additions are individually written, with eight each in Words in Context, Text Structure and Purpose, Central Ideas and Details, Inferences, Command of Evidence (Textual), Cross-Text Connections, Transitions, and Rhetorical Synthesis. They use distinct original passages and notes rather than numerical or name-swapping variants. The batch includes three original poems; its passages contain 39–64 ordinary whitespace-delimited words. `docs/fresh-reading-report.json` records its coverage. Reading and Writing now contains 3,664 questions, and Math remains at 12,094.

All 48 original questions in `m-alg-2.json` were reviewed using fresh exact-arithmetic models of their givens. SymPy solves the equations and systems, compares symbolic expressions, checks inequality solution sets and every mathematical choice, and verifies typed aliases exactly. Prose interpretations include explicit editorial judgments. The review does not automatically understand all natural-language givens; those were transcribed into the models. `docs/legacy-algebra-review.json` records each derivation, result, valid-choice set, and a hash of the full source record. Validation also checks hashes of the solver and pinned dependency specification.

Three editorial changes resulted: `m-alg-114` had a combined-total distractor that could imply the same intercept under the stated budget, so it now describes a different ordered pair; `m-alg-133` mislabeled its distractors in the explanation; and `m-alg-110` attributed a wrong result to a valid operation on both sides of an equation, rather than to an incorrect sign change. Both explanations are corrected. No stored answer key in this file needed changing. The other 45 records and all unrelated earlier questions remain unchanged. At that stage, the Algebra review covered 48 of the 256 legacy math questions. The subsequent Advanced Math review below brings current coverage to 96; the other 160 and broader semantic/reading review remain open.

To reproduce the symbolic review from the project root:

```sh
python3 -m venv /tmp/satori-symbolic-review
/tmp/satori-symbolic-review/bin/pip install -r scripts/question-bank/requirements-review.txt
/tmp/satori-symbolic-review/bin/python scripts/question-bank/review-legacy-algebra.py
node scripts/question-bank/check-editorial-reviews.mjs
```

The production app does not depend on Python or SymPy. The committed review is checked during the normal Node validation; changing a reviewed record requires rechecking its model and regenerating the review. Three newly checked public resources bring the Reference page to 73 links. Numerical template expansion remains on hold while the meaning of no repeats is clarified; this batch adds no generated variants.

## Public-domain reading and independent Advanced Math review

This batch adds 32 newly authored reading questions, one for each of 32 different literary excerpts: eight each in Words in Context, Text Structure and Purpose, Central Ideas and Details, and Inferences. Their full stimuli contain 53–114 ordinary words. The passages are attributed in the questions; the questions, choices, and explanations are new. No numerical or name-swapping variants were added. The app now contains 15,790 questions, including 3,696 Reading and Writing questions and 12,094 Math questions.

The four text sources are [Jane Austen’s Persuasion](https://standardebooks.org/ebooks/jane-austen/persuasion/text/single-page), [Charles Dickens’s Great Expectations](https://standardebooks.org/ebooks/charles-dickens/great-expectations/text/single-page), [Willa Cather’s My Ántonia](https://standardebooks.org/ebooks/willa-cather/my-antonia/text/single-page), and [Edith Wharton’s The Age of Innocence](https://standardebooks.org/ebooks/edith-wharton/the-age-of-innocence/text/single-page), with eight excerpts per book. Standard Ebooks identifies the source texts as United States public domain and dedicates edition contributions under CC0 1.0. Text normalization removes invisible word joiners and collapses whitespace; attribution, context introductions, and vocabulary underlining are added separately. No copyrighted SAT questions were copied. These novels are text sources, separate from the 73 linked external practice resources.

`scripts/question-bank/public-domain-passages.json` records each source URL, chapter, paragraph position, exact normalized text, SHA-256 digest, and access date. `docs/public-domain-reading-report.json` maps excerpt IDs to question IDs. `python3 scripts/question-bank/verify-public-domain.py` downloads the four editions and checks the paragraphs and rights notices; `--directory` can instead verify a saved XHTML cache. Normal Node generation verifies excerpt hashes and ensures one question per excerpt. The new distractors and interpretations were read against each passage; source matching is not an automatic answer check or a claim that all external questions have been reviewed.

All 48 questions in `m-adv-2.json` now have fresh exact-arithmetic models in `scripts/question-bank/review-legacy-advanced.py`. The review compares symbolic expressions, exact roots and solution sets, domain restrictions, table rows, polynomial remainders, exponential growth, and every listed mathematical option. Prose choices have explicit models of their interpretation. No stored key required a change. Four explanations were refined: `m-adv-105` now identifies the incorrect combination of unlike numerator terms; `m-adv-113` describes the wrong-divisor quotient and remainder precisely; `m-adv-137` distinguishes fitting a finite table from proving a global functional form; and `m-adv-142` specifies the omitted factor in a distractor calculation. All other previously bundled records are unchanged in this batch.

`docs/legacy-advanced-review.json` records derivations, results, valid choices, editorial notes, and full source hashes. Reproduce it using the same pinned SymPy environment as the Algebra review:

```sh
/tmp/satori-symbolic-review/bin/python scripts/question-bank/review-legacy-advanced.py
node scripts/question-bank/check-editorial-reviews.mjs
```

At that stage, the independent Algebra and Advanced Math reviews covered 96 of 256 legacy math items. The PSDA review below increases current coverage to 144; broader Reading and Writing interpretation checks and a complete semantic-repeat review also remain open. Automated screening reports zero duplicate fingerprints, out-of-range reading stimuli, or unenterable typed answers; it does not establish that numerical template variants satisfy the user's intended no-repeat rule.

## Independent math additions and PSDA review

This batch adds 12 individually written math questions: six Advanced Math and six Geometry and Trigonometry, with nine multiple-choice items and three student-produced responses. They use distinct sets of constraints rather than numerical or context-swapping variants. Tasks include a polynomial remainder on division by a quadratic, counting distinct roots of a squared quadratic, an excluded output of a rational function, quadratic output differences, simultaneous radical domains, transformation of a known function point, a common chord from two circle equations, a composite perimeter, an area left after a parallel triangle cut, a cone formed from a sector, an intersecting-chords equation, and a triangle’s area from sine and perimeter. The current total is 15,802 questions: 12,106 Math and 3,696 Reading and Writing.

`scripts/question-bank/math-independent.mjs` produces `original-math-distinct.json`, with stable IDs and no variant loop. The new prompts were compared with the 184 existing numerical families and legacy Advanced Math and Geometry prompts for repeated tasks. Their mathematical concepts naturally overlap SAT skills already practiced elsewhere; this does not claim that every concept is new. `review-distinct-math.py` independently derives all 12 results from the prompt constraints and checks every option and typed answer using exact arithmetic. The range question retains the original domain restriction, the function-point question checks what is forced by the one known value, and the quartic question counts distinct roots rather than multiplicity. `docs/distinct-math-report.json` records counts, and `docs/distinct-math-review.json` records derivations and source hashes.

All 48 questions in `m-psda-2.json` now have additional independent review in `review-legacy-psda.py`. Exact calculations cover rates and conversions, percentages, means and standard deviations, model predictions and errors, probability with appropriate denominators, and reported estimate intervals. Study-design questions and other English choices use explicit editorial interpretations recorded alongside the calculations. This is not an automatic natural-language correctness proof or a formal hypothesis-testing procedure inferred from unspecified confidence levels. The source-bound record is `docs/legacy-psda-review.json`.

No stored answer key needed changing. Eight existing records were clarified:

- `m-psda-117` now correctly identifies the mean and median claims as false rather than calling the first two choices false.
- `m-psda-126` identifies fractional membership values as model estimates and asks which equation could define that model.
- `m-psda-136` describes the reported interval without suggesting that values outside it are logically impossible.
- `m-psda-138` distinguishes volunteer selection from restricted geographic coverage and states the comparable-sample conditions for a smaller margin of error.
- `m-psda-141` replaces a logically true distractor: a known sample proportion of 10% is indeed between 8% and 12%. The new distractor incorrectly treats the known sample proportion as uncertain.
- `m-psda-144` removes the false guarantee that random assignment makes treatment groups identical in every other respect.
- `m-psda-145` and `m-psda-147` explain how sampling and assignment support the conclusions in these designs without asserting universal guarantees.

All other previously bundled records are unchanged. At that stage, independent reviews covered 144 of 256 legacy math items. The Geometry review below brings current coverage to 192, leaving 64 legacy items outside these reviews; all 12 separately authored math additions have their own review. The wider reading and semantic-repeat reviews remain open. The normal build now verifies all seven review manifests against their full sources and solvers.

Using the pinned environment documented above, reproduce the new reviews with:

```sh
/tmp/satori-symbolic-review/bin/python scripts/question-bank/review-legacy-psda.py
/tmp/satori-symbolic-review/bin/python scripts/question-bank/review-distinct-math.py
node scripts/question-bank/check-editorial-reviews.mjs
```

## Fresh evidence reading and Geometry review

This batch adds 16 original reading questions with distinct passages: eight quotation-evidence questions, including two original poems, and eight paired-text comparisons. The full stimuli contain 65–103 ordinary words. Each of the four options in a quotation-evidence question is checked as an exact excerpt from that passage; the correct interpretation and distractors were reviewed editorially. The paired texts identify their investigations as hypothetical and cover archaeological dating, manuscript attribution, theater history, ultraviolet flower patterns, reed instruments, clay transport, fish behavior, and coastal measurements. `scripts/question-bank/reading-evidence-fresh.mjs` contains the authored content, and `docs/fresh-evidence-reading-report.json` records the batch. The current bank contains 15,818 questions: 12,106 Math and 3,712 Reading and Writing.

All 48 original questions in `m-geo-2.json` now have independent review in `scripts/question-bank/review-legacy-geometry.py`. The exact models cover area and volume, similarity and positional relationships, angle sums, trigonometric ratios, unit-circle coordinates, and circle equations, arcs, and chords. Geometric relationships are explicitly transcribed from the prompts and relevant theorems; the solver does not automatically infer a diagram from prose. The results and source hashes are in `docs/legacy-geometry-review.json`.

Two older records changed. `m-geo-105` now explains the area change through the product of dimension factors, replacing an incorrect rationale about percentages of different lengths. `m-geo-122` now requires D to be between A and C. Previously D=C met the literal conditions BD=BC and D on AC, giving angle ABD=70 degrees instead of the intended 30. The strictly interior wording removes that alternative. No stored key needed changing, and all other earlier records are unchanged.

The repeat fingerprint now handles supported expanded, factored, and squared-linear integer quadratics equal to zero, including missing linear or constant terms, reordered expanded terms, braced square exponents, and nonzero integer scale factors. It rejects unsupported multivariable forms, zero leading coefficients, and unsafe integer arithmetic. The surrounding prose, conditions, and requested target are retained. Regression checks cover equivalent forms and negative cases so that different targets, inequalities, variables, and prices are not merged. This broader screen found no additional duplicate fingerprints in the current bank; it is still not a general semantic-repeat detector.

At that stage, independent reviews covered 192 of the 256 legacy math items plus all 12 then-active separately authored math additions. The following batch completes review of the remaining 64 original math items. The broader reading interpretation and full semantic-repeat reviews remain open. No numerical variant counts increased in this batch.

Using the pinned environment documented above, reproduce the Geometry review with:

```sh
/tmp/satori-symbolic-review/bin/python scripts/question-bank/review-legacy-geometry.py
node scripts/question-bank/check-editorial-reviews.mjs
```

## Complete original-math review and safe repeat retirement

The current bank contains 15,826 active questions: 12,114 Math and 3,712 Reading and Writing. This batch adds eight individually authored problems across Algebra and Problem-Solving and Data Analysis, plus a new coordinate-geometry replacement for one retired overlap. The new constraints involve a triangle bounded by two lines and an axis, a linear bound that must hold throughout an interval, recovering a negative-slope function from a self-composition identity, the common point of an entire line family, a grouped-data mean bound, conditional rates that reverse when aggregated, a median condition on an unknown frequency, and standard deviation after adding observations at the mean. All new items have independent exact models in `review-distinct-math.py`.

A manual comparison found that `m-original-distinct-009` closely overlapped the older `m-geo-007`: both compute the area remaining after a parallel triangle cut by squared similarity and subtraction. The overlapping item is now outside the active practice bank. Its complete original record, including its answer of 42, is preserved in `src/data/retired/original-math-distinct.json`. Its replacement has the new ID `m-original-distinct-021` and asks for a coordinate triangle’s area after recovering a vertex from a midpoint. Reusing the old ID would have changed what a saved attempt meant, so the replacement has its own ID and answer. The active authored-math collection now has 20 questions; the retired record is not part of that count.

The app’s `QUESTIONS` list contains active items only, while `BY_ID` also resolves retired records for resumed tests, grading, saved results, and historical review. New balanced modules and automatically selected practice pools use the active list. Coverage counts exclude retired records. Validation checks active and retired schemas, math, and globally unique IDs, and applies duplicate-stimulus screening to the active bank. Production checks verify the exact retired content and key in the shipped lookup, its absence from active selection, historical grading, and its exclusion from new modules. The retirement and replacement IDs and reason are recorded in `docs/distinct-math-report.json`.

The final 64 original math items in `math-alg-adv.json` and `math-psda-geo.json` have fresh exact models in `scripts/question-bank/review-legacy-initial.py`. Results are recorded separately in `docs/legacy-initial-math-alg-adv-review.json` and `docs/legacy-initial-math-psda-geo-review.json`. This completes independent review of all 256 original math questions. Every mathematical option and typed alias was checked, with explicit editorial interpretations for prose choices, geometric relationships, and study-design conclusions. Three older records were clarified:

- `m-adv-015` now correctly says a 1.25% monthly decrease compounds to about a 14.01% annual decrease, less than 15%, rather than more.
- `m-psda-010` now respects the puppy model’s stated 8–20-week domain instead of treating its algebraic intercept as an established birth weight.
- `m-psda-014` replaces another logically true margin-of-error distractor. The known sample fraction of 62% is indeed between 58% and 66%; the replacement incorrectly treats that known fraction as unknown.

Every ID and answer key present before this batch is preserved, including the archived question. No original-math key needed changing. The seven source-bound manifests cover 277 records: 256 original math questions, 20 active authored additions, and the one retired item. This completes that original-math review, not the full bank’s correctness or semantic-repeat review. Generated numerical variants, reading interpretations, and further structural overlaps remain under review.

To reproduce the final original-math checks with the pinned environment documented above:

```sh
/tmp/satori-symbolic-review/bin/python scripts/question-bank/review-legacy-initial.py
/tmp/satori-symbolic-review/bin/python scripts/question-bank/review-distinct-math.py
node scripts/question-bank/check-editorial-reviews.mjs
```

## One active item per generated family and fresh writing

The no-repeat rule is now applied conservatively to every known generator family or rule/task pattern, including numerical variants and contextual template siblings. The active count is intentionally lower: 1,772 questions, comprising 548 Math and 1,224 Reading and Writing. All 19 math skills and all 11 Reading and Writing skills remain represented. The active sets include 184 math, 16 table-evidence, 24 grammar, and 16 Expression of Ideas representatives. Their sibling versions are available only through historical lookup.

`partition-family.mjs` selects an existing full record after generation. It does not regenerate choices, renumber IDs, or change keys. Math representatives preserve a mixture of multiple-choice and typed responses; grammar and expression representatives use varied existing contexts. `check-family-policy.mjs` verifies exactly one active item per declared family, the report’s representative ID, the expected archived count, and a complete set of original ordinals across active and historical records. The normal generation and validation commands include this gate. Changing a family’s active output cannot silently reintroduce a sibling.

The retirement preserves every record available before this batch exactly, including prompts and explanations as well as keys. It also restores the 26 earlier-filtered equivalent math records to historical lookup. Of 14,097 retired records, 14,096 are generated siblings and one is the previously identified authored triangle overlap. Archive records remain excluded from new balanced modules and automatically selected practice pools. Saved tests and review resolve their original content through `BY_ID`. Coverage indicators use the active question list.

This batch also adds 16 individually written writing questions: four each in Transitions, Rhetorical Synthesis, Boundaries, and Form, Structure, and Sense. Their passages and notes contain 26–64 ordinary words, with completed-stimulus and rendered-length checks applied as usual. The synthesis items distinguish shared material from different functions, raw counts from proportions, chronology from undocumented causation, and a term’s definition from background details. Grammar items address restrictive-clause boundaries, dependent clauses, clause separation, paired dashes, irregular plurals, pronoun case, a singular field name, and modifier attachment. Each new completion and distractor was read editorially. The arithmetic in the synthesis notes was checked directly. Content is in `writing-fresh.mjs`; `docs/fresh-writing-report.json` records the batch.

The source-bound independent reviews of all 256 original math questions and 20 active authored additions remain current. Other math family representatives, reading interpretation, and overlaps across different declared families or independently authored items remain within the continuing review; the one-per-family policy is not a complete semantic-equivalence proof.

## Generated Algebra review and more literary reading

This batch adds 16 new literary questions using 16 previously unused public-domain excerpts, four from each of the four cited novels. There are four questions each in Words in Context, Text Structure and Purpose, Central Ideas and Details, and Inferences. Their answers and distractors were read against the complete excerpts. Short contextual introductions identify relationships needed to answer a question without knowledge of the rest of the novel. The passage manifest now contains 48 distinct sourced paragraphs, with exact normalized text, source coordinates, and hashes. Both cached and live-source verification passed. `reading-public-domain-more.mjs` contains the new questions; the public-domain report maps all 48 excerpts to their question IDs. Full stimuli across this collection contain 53–114 ordinary words.

The 41 selected generated Algebra candidates now have separate exact models in `review-generated-algebra.py`, with derivations, option checks, and source hashes in `docs/generated-algebra-review.json`. The review reads the selected candidate IDs from the generation report and verifies the candidate even when it has been retired. Normal validation binds the review to that selection, every full question record, the solver, its parser, and pinned dependency. All 101 currently active Algebra questions are now included in independent reviews: 64 original items, four separately authored additions, and 33 active generated representatives. Other generated math domains and the separate conceptual-statistics collection remain outside this additional review.

Eight generated patterns were manually judged to repeat older tasks. Their entire generated families are historical only, with the existing active item serving as representative:

| Generated pattern | Retained existing question | Shared task |
|---|---|---|
| distribute | `m-alg-103` | Distribute a binomial, combine a constant, and solve for x |
| fraction-linear | `m-alg-101` | Undo a rational linear coefficient and offset |
| intercept-standard | `m-alg-005` | Set x to zero and recover the vertical intercept |
| parallel-intercept | `m-alg-116` | Use a parallel slope and a point to recover an intercept |
| system-eliminate | `m-alg-010` | Eliminate opposite y coefficients and return x |
| ticket-system | `m-alg-011` | Use total count and two prices to find one item count |
| compound-integer-count | `m-alg-144` | Invert an affine interval and count integers |
| unique-system-exception | `m-alg-012` | Find the coefficient parameter for parallel distinct lines |

`family-overlaps.json` records the reasons and hashes of both the reviewed generated candidate and the retained existing question. Generation rejects changes to either bound record until the overlap is rechecked. The family-policy gate allows zero generated active records only when a documented existing representative remains active; it still accounts for every original candidate ordinal. This refines the earlier one-per-family policy rather than leaving redundant generated representatives active merely to fill a quota.

Two Algebra explanation templates were corrected. The intercept calculation in linear-from-values now parenthesizes a signed slope instead of producing adjacent minus signs. The two-resource-bound explanation no longer claims that material requirements differ when a particular item happens to use equal amounts for both sizes. These changes affect 64 explanations per family, including two active questions and 126 historical records. No older prompt, answer, or option changed, and no ID was removed.

The active total is now 1,780: 540 Math and 1,240 Reading and Writing. There are 14,105 historical records, including the eight newly retired representatives. The eight review manifests cover 318 records; broader reading and cross-family semantic-repeat review remains open.

Reproduce the new exact review in the pinned environment:

```sh
/tmp/satori-symbolic-review/bin/python scripts/question-bank/review-generated-algebra.py
node scripts/question-bank/check-editorial-reviews.mjs
```

## Further expansion

Further additions should introduce independently authored passages, note sets, and mathematical constraints. More siblings of a declared generator family do not increase the active bank. Continue the editorial answer review and compare remaining representatives with other families and legacy items for structural overlap. Preserve historical IDs and keys when retiring repeats, explain traps, and retain the verification commands above.
