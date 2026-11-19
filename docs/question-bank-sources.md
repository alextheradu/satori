# Question bank expansion and practice sources

The app now contains **13,672 questions**, up from 512. All bundled additions are original SAT-style practice, with answers, explanations, domain/skill labels, and difficulty labels. Difficulty labels are editorial estimates, not calibrated College Board difficulty ratings.

| Bundled material | Count | What the count represents |
|---|---:|---|
| Existing questions | 512 | Original bank retained with stable IDs |
| New generated math | 9,728 | 64 numerical variants for each of 152 authored problem families |
| New conceptual statistics | 88 | Individually written questions, including sampling, causation, experiments, and spread |
| New individually written Reading and Writing | 784 | Individually written questions with distinct passages or sentence-completion contexts across all 11 skills |
| New table-evidence Reading and Writing | 512 | 32 numerical variants for each of 16 authored evidence families |
| New grammar and punctuation variants | 1,536 | 24 rule families applied to 64 original contexts |
| New Expression of Ideas variants | 512 | 16 task patterns applied to 32 original fictional project comparisons |
| Total | **13,672** | Questions available in practice and test selection |

The 9,728 generated math items and 512 table-evidence reading items are numerical variants. The 1,536 grammar additions apply 24 controlled rule patterns to 64 original contexts. The additional 512 Expression of Ideas variants apply 16 task patterns to 32 fictional project comparisons. These 12,288 variants are not 12,288 independently invented problem structures. They are useful for repetition of a skill. The separate 784 individually written Reading and Writing additions use distinct authored contexts rather than swapping names into a repeated passage. Studies, institutions, stories, and named people invented for these passages are identified as hypothetical or fictional.

## Coverage

| Section | Domain | Questions |
|---|---|---:|
| Math | Algebra | 2,176 |
| Math | Advanced Math | 2,688 |
| Math | Problem-Solving and Data Analysis | 2,776 |
| Math | Geometry and Trigonometry | 2,432 |
| Reading and Writing | Craft and Structure | 360 |
| Reading and Writing | Information and Ideas | 856 |
| Reading and Writing | Expression of Ideas | 710 |
| Reading and Writing | Standard English Conventions | 1,674 |

All 19 math skills and all 11 Reading and Writing skills used by this bank receive new questions. Family count measures distinct templates rather than skill count.

## Verification and maintenance

- `npm run questions:generate` regenerates the committed JSON from the original content in `scripts/question-bank/`.
- `npm run validate` checks structure, unique IDs, unique stimulus/prompt pairs, numeric answers, answer positions, and KaTeX syntax. It then regenerates in memory and compares output with the committed additions, including forward-model checks of numerical answers and checks that only one numerical option satisfies each problem.
- `npm run build` validates and builds the frontend and backend.
- `npm run questions:runtime`, after building, loads the actual production bank, checks it against the source JSON, exercises the app's grader, renders every question's text using the app's markup component, checks table and blank rendering, and exercises balanced module selection with exclusions for both sections and all three difficulty routes, including skill balance within each domain.
- `docs/math-generation-report.json` lists each math family, its skill, difficulty, and count. `docs/quantitative-reading-report.json` records the 16 table-evidence families and their counts. `docs/conventions-generation-report.json` lists grammar families and the 64-context count. Grammar checks validate controlled head numbers, choice-construction tags, completed blanks, distinct choices, and unique stimuli; they do not independently certify natural-language interpretation. The table generator checks numeric assertions and its authored relevance classifications; it does not independently certify natural-language interpretation.

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

The publisher pages are the sources for the resource descriptions, not sources of the bundled original questions. None of the provider-reported external counts is included in the app's 13,672-question total. Free-test offers and account requirements can change.

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

## Further expansion

The largest remaining opportunity is more independently authored Reading and Writing passages and more distinct hard-math structures. Increasing the numerical-variant count alone would increase the total without broadening the same amount of conceptual coverage. New work should preserve stable IDs, explain traps, and retain the verification commands above.
