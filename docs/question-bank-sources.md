# Question bank expansion and practice sources

The app now contains **6,296 questions**, up from 512. All bundled additions are original SAT-style practice, with answers, explanations, domain/skill labels, and difficulty labels. Difficulty labels are editorial estimates, not calibrated College Board difficulty ratings.

| Bundled material | Count | What the count represents |
|---|---:|---|
| Existing questions | 512 | Original bank retained with stable IDs |
| New generated math | 5,632 | 64 numerical variants for each of 88 authored problem families |
| New conceptual statistics | 24 | Individually written questions, including sampling, causation, experiments, and spread |
| New Reading and Writing | 128 | Individually written questions with distinct passages or sentence-completion contexts across all 11 skills |
| Total | **6,296** | Questions available in practice and test selection |

The 5,632 generated items are numerical variants, not 5,632 independently invented problem structures. They are useful for repetition of a skill. The Reading and Writing expansion uses distinct authored contexts rather than swapping names into a repeated passage. Studies, institutions, stories, and named people invented for these passages are identified as hypothetical or fictional.

## Coverage

| Section | Domain | Questions |
|---|---|---:|
| Math | Algebra | 1,408 |
| Math | Advanced Math | 1,280 |
| Math | Problem-Solving and Data Analysis | 1,816 |
| Math | Geometry and Trigonometry | 1,408 |
| Reading and Writing | Craft and Structure | 96 |
| Reading and Writing | Information and Ideas | 96 |
| Reading and Writing | Expression of Ideas | 94 |
| Reading and Writing | Standard English Conventions | 98 |

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

The publisher pages are the sources for the resource descriptions, not sources of the bundled original questions. None of the provider-reported external counts is included in the app's 6,296-question total. Free-test offers and account requirements can change.

## Further expansion

The largest remaining opportunity is more independently authored Reading and Writing passages and more distinct hard-math structures. Increasing the numerical-variant count alone would increase the total without broadening the same amount of conceptual coverage. New work should preserve stable IDs, explain traps, and retain the verification commands above.
