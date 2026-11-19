export type Section = 'rw' | 'math'
export type Difficulty = 'easy' | 'medium' | 'hard'

export const RW_DOMAINS = [
  'Information and Ideas',
  'Craft and Structure',
  'Expression of Ideas',
  'Standard English Conventions',
] as const

export const MATH_DOMAINS = [
  'Algebra',
  'Advanced Math',
  'Problem-Solving and Data Analysis',
  'Geometry and Trigonometry',
] as const

export type Domain = (typeof RW_DOMAINS)[number] | (typeof MATH_DOMAINS)[number]

/**
 * A single SAT-style question.
 *
 * Text fields support a tiny markup:
 *  - `$...$` inline LaTeX (rendered with KaTeX). Escape a literal dollar sign as `\$`.
 *  - `**bold**`, `_underline_` (used to mark the underlined portion in RW questions)
 *  - blank lines separate paragraphs
 *  - `______` (six underscores) renders as a fill-in blank
 *  - Markdown-style pipe tables (`| a | b |` rows, header separator `|---|---|`)
 */
export interface Question {
  /** Unique, stable id, e.g. "rw-ii-001" or "m-alg-014" */
  id: string
  section: Section
  domain: Domain
  /** Skill within the domain, e.g. "Words in Context", "Linear equations in one variable" */
  skill: string
  difficulty: Difficulty
  /** Optional passage / stimulus shown above the prompt (RW mostly). */
  passage?: string
  /** The question stem. */
  prompt: string
  /** Exactly 4 choices for multiple choice. Omit for student-produced response (math grid-in). */
  choices?: [string, string, string, string]
  /**
   * MC: index 0-3 of the correct choice.
   * SPR: list of acceptable answers as strings, e.g. ["3/4", "0.75", ".75"]. Numeric equivalence is also accepted.
   */
  answer: number | string[]
  /** Explanation shown after answering. Explain why the correct answer is right and briefly why traps are wrong. */
  explanation: string
}
