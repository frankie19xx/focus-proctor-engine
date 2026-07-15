export interface Exam {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  total_questions: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  exam_id: string;
  question_number: number;
  question_text: string;
  options: string[];
  correct_answer: string;
  points: number;
  created_at: string;
}

export type ResultStatus = "in_progress" | "completed" | "auto_submitted";

export interface Result {
  id: string;
  student_id: string;
  exam_id: string;
  score: number;
  total_questions: number;
  strikes: number;
  started_at: string;
  completed_at: string | null;
  status: ResultStatus;
  created_at: string;
}

export type ViolationType =
  | "tab_switch"
  | "window_blur"
  | "fullscreen_exit"
  | "copy_attempt"
  | "right_click"
  | "other";

export interface CheatingLog {
  id: string;
  result_id: string;
  student_id: string;
  violation_type: ViolationType;
  description: string | null;
  violation_number: number;
  created_at: string;
}

// Convenience joined shapes used by the lecturer dashboard.
export interface ResultWithNames extends Result {
  student_name: string | null;
  student_email: string | null;
  exam_title: string | null;
}
