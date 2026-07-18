// Small, dependency-free CSV parser. Handles quoted fields (with embedded
// commas, newlines, and escaped "" quotes), which is all we need for
// spreadsheet-exported CSVs — no need to pull in a library for this.
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  // Normalize line endings so \r\n and \r don't produce extra blank rows.
  const input = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (inQuotes) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  // Flush the last field/row if the file doesn't end with a newline.
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

export interface ParsedExamQuestion {
  question_text: string;
  options: string[];
  correct_answer: string;
  points: number;
}

export interface ParsedExamCsvResult {
  questions: ParsedExamQuestion[];
  errors: string[];
}

const OPTION_COLUMN_RE = /^option[_ ]?([a-z0-9]+)$/i;

/**
 * Expected header row (case-insensitive, order-independent):
 *   question, option_a, option_b, option_c, option_d[, option_e, ...],
 *   correct_answer, points
 *
 * - Any number of option_* columns is supported (at least 2 required).
 * - correct_answer may be the option's letter (A/B/C/D/E) or its exact text.
 * - points is optional and defaults to 1.
 */
export function parseExamQuestionsCsv(text: string): ParsedExamCsvResult {
  const rows = parseCsv(text);
  const errors: string[] = [];

  if (rows.length === 0) {
    return { questions: [], errors: ["The file is empty."] };
  }

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const questionIdx = header.findIndex((h) => h === "question" || h === "question_text");
  const correctIdx = header.findIndex((h) => h === "correct_answer" || h === "answer");
  const pointsIdx = header.findIndex((h) => h === "points");

  const optionColumns: { index: number; letter: string }[] = [];
  header.forEach((h, idx) => {
    const match = h.match(OPTION_COLUMN_RE);
    if (match) optionColumns.push({ index: idx, letter: match[1].toUpperCase() });
  });

  if (questionIdx === -1) {
    return { questions: [], errors: ['Missing a "question" column in the header row.'] };
  }
  if (correctIdx === -1) {
    return { questions: [], errors: ['Missing a "correct_answer" column in the header row.'] };
  }
  if (optionColumns.length < 2) {
    return {
      questions: [],
      errors: ['Need at least 2 "option_*" columns (e.g. option_a, option_b, ...).'],
    };
  }

  const questions: ParsedExamQuestion[] = [];

  for (let r = 1; r < rows.length; r++) {
    const raw = rows[r];
    const questionText = (raw[questionIdx] ?? "").trim();
    if (!questionText) continue; // skip blank rows

    const options = optionColumns
      .map((col) => (raw[col.index] ?? "").trim())
      .filter((opt) => opt.length > 0);

    if (options.length < 2) {
      errors.push(`Row ${r + 1}: needs at least 2 non-empty options — skipped.`);
      continue;
    }

    const rawCorrect = (raw[correctIdx] ?? "").trim();
    let correctAnswer = "";

    if (rawCorrect.length <= 2) {
      // Looks like a letter reference (A, B, C1, etc.) — resolve via the
      // matching option_<letter> column, falling back to positional index
      // (A -> 1st option, B -> 2nd, ...) if no exact letter match exists.
      const byLetter = optionColumns.find(
        (col) => col.letter === rawCorrect.toUpperCase(),
      );
      if (byLetter) {
        correctAnswer = (raw[byLetter.index] ?? "").trim();
      } else {
        const letterIndex = rawCorrect.toUpperCase().charCodeAt(0) - 65; // A=0
        correctAnswer = options[letterIndex] ?? "";
      }
    }

    if (!correctAnswer) {
      // Fall back to treating it as the exact option text.
      correctAnswer = options.find((o) => o.toLowerCase() === rawCorrect.toLowerCase()) ?? "";
    }

    if (!correctAnswer) {
      errors.push(
        `Row ${r + 1}: correct_answer "${rawCorrect}" doesn't match any option — skipped.`,
      );
      continue;
    }

    const points = pointsIdx !== -1 ? parseInt(raw[pointsIdx], 10) || 1 : 1;

    questions.push({ question_text: questionText, options, correct_answer: correctAnswer, points });
  }

  if (questions.length === 0 && errors.length === 0) {
    errors.push("No valid question rows found below the header.");
  }

  return { questions, errors };
}
