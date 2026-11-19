# Question bank expansion and practice sources

The app now contains **8,488 questions**, up from 512. All bundled additions are original SAT-style practice, with answers, explanations, domain/skill labels, and difficulty labels. Difficulty labels are editorial estimates, not calibrated College Board difficulty ratings.

| Bundled material | Count | What the count represents |
|---|---:|---|
| Existing questions | 512 | Original bank retained with stable IDs |
| New generated math | 7,680 | 64 numerical variants for each of 120 authored problem families |
| New conceptual statistics | 24 | Individually written questions, including sampling, causation, experiments, and spread |
| New Reading and Writing | 272 | Individually written questions with distinct passages or sentence-completion contexts across all 11 skills |
| Total | **8,488** | Questions available in practice and test selection |

The 7,680 generated items are numerical variants, not 7,680 independently invented problem structures. They are useful for repetition of a skill. The Reading and Writing expansion uses distinct authored contexts rather than swapping names into a repeated passage. Studies, institutions, stories, and named people invented for these passages are identified as hypothetical or fictional.

## Coverage

| Section | Domain | Questions |
|---|---|---:|
| Math | Algebra | 1,664 |
| Math | Advanced Math | 2,176 |
| Math | Problem-Solving and Data Analysis | 2,200 |
| Math | Geometry and Trigonometry | 1,920 |
| Reading and Writing | Craft and Structure | 136 |
| Reading and Writing | Information and Ideas | 152 |
| Reading and Writing | Expression of Ideas | 118 |
| Reading and Writing | Standard English Conventions | 122 |

All 19 math skills and all 11 Reading and Writing skills used by this bank receive new questions. Family count measures distinct templates rather than skill count.

## Verification and maintenance

- `npm run questions:generate` regenerates the committed JSON from the original content in `scripts/question-bank/`.
- `npm run validate` checks structure, unique IDs, unique stimulus/prompt pairs, numeric answers, answer positions, and KaTeX syntax. It then regenerates in memory and compares output with the committed additions, including forward-model checks of numerical answers and checks that only one numerical option satisfies each problem.
- `npm run build` validates and builds the frontend and backend.
- `npm run questions:runtime`, after building, loads the actual production bank, checks it against the source JSON, exercises the app's grader, renders every question's text using the app's markup component, checks table and blank rendering, and exercises balanced module selection with exclusions for both sections and all three difficulty routes.
- `docs/math-generation-report.json` lists each numerical family, its skill, difficulty, and count.

Automated checks do not replace an independent editorial review of passage interpretation, distractor quality, or difficulty. They do check mathematical consistency, integration, and structural/rendering correctness.

## Practice sources found on the web

Publisher pages were checked on **2026-11-18**. External questions are linked in the app's Reference page; they are not included in the bundled count. Reported external collection sizes below are publishers' descriptions, not independently counted question inventories. Several official resources reuse questions, so their counts must not be added as if they were distinct questions.

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

The publisher pages are the sources for the resource descriptions, not sources of the bundled original questions. None of the provider-reported external counts is included in the app's 8,488-question total. Free-test offers and account requirements can change.

## Additional Reading and Writing batch

The second authored batch adds 144 questions: 96 reading questions and 48 writing questions. It adds sentence-function analysis, evidence that weakens a hypothesis, quotation selection from original stories, raw-count versus percentage comparisons, translation tradeoffs, and sampling/generalization reasoning. The additions retain the existing question IDs and answer-choice positions for all earlier items.

## Additional harder-math batch

The next numerical batch adds 2,048 variants from 32 new families, appended after the earlier 88 families. Topics include extraneous radical solutions, strict discriminant bounds, reciprocal roots, transformed zeros, second differences, perpendicular lines, chord and tangent geometry, truncated-cone volume, conditional probabilities across groups, dilution, and combined means. This batch adds 1,856 questions labeled hard and 192 labeled medium. All 6,440 prior questions were compared with a saved baseline and remained identical, including IDs, answers, and choice order.

## Further expansion

The largest remaining opportunity is more independently authored Reading and Writing passages and more distinct hard-math structures. Increasing the numerical-variant count alone would increase the total without broadening the same amount of conceptual coverage. New work should preserve stable IDs, explain traps, and retain the verification commands above.
