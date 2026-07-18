import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Exam, Question } from "@/types/exam";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Trash2, PlusCircle, GripVertical, Upload, Download } from "lucide-react";
import { toast } from "sonner";
import { parseExamQuestionsCsv } from "@/lib/csv";

interface DraftQuestion {
  // Local id for React keys / DB id if it already exists.
  key: string;
  id?: string;
  question_text: string;
  options: string[];
  correct_answer: string; // stores the option text
  points: number;
}

function emptyQuestion(): DraftQuestion {
  return {
    key: crypto.randomUUID(),
    question_text: "",
    options: ["", "", "", ""],
    correct_answer: "",
    points: 1,
  };
}

interface ExamFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exam: Exam | null; // null = create mode
  onSaved: () => void;
}

export function ExamFormDialog({ open, onOpenChange, exam, onSaved }: ExamFormDialogProps) {
  const { user } = useAuth();
  const isEdit = !!exam;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(30);
  const [isActive, setIsActive] = useState(true);
  const [questions, setQuestions] = useState<DraftQuestion[]>([emptyQuestion()]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (!exam) {
      setTitle("");
      setDescription("");
      setDuration(30);
      setIsActive(true);
      setQuestions([emptyQuestion()]);
      return;
    }

    setTitle(exam.title);
    setDescription(exam.description ?? "");
    setDuration(exam.duration_minutes);
    setIsActive(exam.is_active);
    setLoading(true);

    supabase
      .from("questions")
      .select("*")
      .eq("exam_id", exam.id)
      .order("question_number", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          toast.error("Couldn't load questions", { description: error.message });
          setQuestions([emptyQuestion()]);
        } else {
          const loaded = (data as Question[]).map((q) => ({
            key: q.id,
            id: q.id,
            question_text: q.question_text,
            options: q.options.length ? q.options : ["", "", "", ""],
            correct_answer: q.correct_answer,
            points: q.points,
          }));
          setQuestions(loaded.length ? loaded : [emptyQuestion()]);
        }
        setLoading(false);
      });
  }, [open, exam]);

  const updateQuestion = (key: string, patch: Partial<DraftQuestion>) => {
    setQuestions((prev) => prev.map((q) => (q.key === key ? { ...q, ...patch } : q)));
  };

  const updateOption = (key: string, idx: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.key !== key) return q;
        const options = [...q.options];
        const prevValue = options[idx];
        options[idx] = value;
        // Keep correct_answer pointing at the same option if it was selected.
        const correct_answer = q.correct_answer === prevValue ? value : q.correct_answer;
        return { ...q, options, correct_answer };
      }),
    );
  };

  const addOption = (key: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.key === key ? { ...q, options: [...q.options, ""] } : q)),
    );
  };

  const removeOption = (key: string, idx: number) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.key !== key) return q;
        const removed = q.options[idx];
        const options = q.options.filter((_, i) => i !== idx);
        return {
          ...q,
          options,
          correct_answer: q.correct_answer === removed ? "" : q.correct_answer,
        };
      }),
    );
  };

  const addQuestion = () => setQuestions((prev) => [...prev, emptyQuestion()]);

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    const text = await file.text();
    const { questions: parsed, errors } = parseExamQuestionsCsv(text);

    if (parsed.length > 0) {
      const imported: DraftQuestion[] = parsed.map((q) => ({
        key: crypto.randomUUID(),
        question_text: q.question_text,
        options: q.options,
        correct_answer: q.correct_answer,
        points: q.points,
      }));

      setQuestions((prev) => {
        // Drop a single leftover blank placeholder question rather than
        // leaving it dangling above the imported set.
        const base =
          prev.length === 1 && !prev[0].question_text.trim() && !prev[0].correct_answer
            ? []
            : prev;
        return [...base, ...imported];
      });

      toast.success(`Imported ${parsed.length} question${parsed.length === 1 ? "" : "s"} from CSV`);
    }

    if (errors.length > 0) {
      toast.warning(
        parsed.length > 0
          ? `Imported with ${errors.length} row(s) skipped`
          : "Couldn't import questions",
        { description: errors.slice(0, 3).join(" ") },
      );
    }
  };

  const downloadCsvTemplate = () => {
    const template =
      "question,option_a,option_b,option_c,option_d,correct_answer,points\n" +
      '"What does HTML stand for?","Hyper Text Markup Language","Home Tool Markup Language","Hyperlinks Text Markup Language","Hyper Tool Markup Language",A,1\n' +
      '"Which CSS property changes text color?","font-color","text-color","color","background-color",C,1\n';
    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "exam-questions-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };
  const removeQuestion = (key: string) =>
    setQuestions((prev) => (prev.length > 1 ? prev.filter((q) => q.key !== key) : prev));

  const validate = (): string | null => {
    if (!title.trim()) return "Give the exam a title.";
    if (duration < 1) return "Duration must be at least 1 minute.";
    if (questions.length === 0) return "Add at least one question.";
    for (const [i, q] of questions.entries()) {
      if (!q.question_text.trim()) return `Question ${i + 1} needs text.`;
      const nonEmptyOptions = q.options.filter((o) => o.trim());
      if (nonEmptyOptions.length < 2) return `Question ${i + 1} needs at least 2 options.`;
      if (!q.correct_answer.trim()) return `Question ${i + 1} needs a correct answer selected.`;
      if (!q.options.includes(q.correct_answer)) {
        return `Question ${i + 1}'s correct answer must match one of its options.`;
      }
    }
    return null;
  };

  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      toast.error(validationError);
      return;
    }
    if (!user) return;

    setSaving(true);
    try {
      let examId = exam?.id;

      if (isEdit && examId) {
        const { error } = await supabase
          .from("exams")
          .update({
            title: title.trim(),
            description: description.trim() || null,
            duration_minutes: duration,
            is_active: isActive,
          })
          .eq("id", examId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("exams")
          .insert({
            title: title.trim(),
            description: description.trim() || null,
            duration_minutes: duration,
            is_active: isActive,
            created_by: user.id,
          })
          .select("id")
          .single();
        if (error) throw error;
        examId = data.id as string;
      }

      // Replace-all strategy for questions: simplest way to keep ordering,
      // additions, and deletions consistent without diffing.
      const { error: deleteError } = await supabase
        .from("questions")
        .delete()
        .eq("exam_id", examId!);
      if (deleteError) throw deleteError;

      const rows = questions.map((q, idx) => ({
        exam_id: examId!,
        question_number: idx + 1,
        question_text: q.question_text.trim(),
        options: q.options.filter((o) => o.trim()),
        correct_answer: q.correct_answer,
        points: q.points || 1,
      }));

      const { error: insertError } = await supabase.from("questions").insert(rows);
      if (insertError) throw insertError;

      toast.success(isEdit ? "Exam updated" : "Exam created");
      onSaved();
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error("Couldn't save exam", { description: message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0 pr-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <DialogTitle>{isEdit ? "Edit Exam" : "Create New Exam"}</DialogTitle>
              <DialogDescription>
                {isEdit
                  ? "Update details and questions for this exam."
                  : "Set up the exam details, then add its questions below."}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving || loading}>
                {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Exam"}
              </Button>
            </div>
          </div>
        </DialogHeader>
        <Separator className="shrink-0" />

        {loading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
        ) : (
          <ScrollArea className="flex-1 min-h-0 pr-4 -mr-4">
            <div className="space-y-6 pb-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="exam-title">Title</Label>
                  <Input
                    id="exam-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Advanced Web Development"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="exam-description">Description</Label>
                  <Textarea
                    id="exam-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What this exam covers"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exam-duration">Duration (minutes)</Label>
                  <Input
                    id="exam-duration"
                    type="number"
                    min={1}
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <Switch id="exam-active" checked={isActive} onCheckedChange={setIsActive} />
                  <Label htmlFor="exam-active" className="cursor-pointer">
                    {isActive ? "Active (visible to students)" : "Draft (hidden from students)"}
                  </Label>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="font-semibold">Questions ({questions.length})</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button type="button" variant="ghost" size="sm" onClick={downloadCsvTemplate}>
                      <Download className="w-4 h-4 mr-1" /> Template
                    </Button>
                    <Button type="button" variant="outline" size="sm" asChild>
                      <label className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-1" /> Upload CSV
                        <input
                          type="file"
                          accept=".csv,text/csv"
                          className="hidden"
                          onChange={handleCsvUpload}
                        />
                      </label>
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                      <PlusCircle className="w-4 h-4 mr-1" /> Add Question
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground -mt-2">
                  Upload a CSV of questions instead of typing them in one by one — download the
                  template to see the expected columns. Imported questions appear below for you
                  to review before saving.
                </p>

                {questions.map((q, qIdx) => (
                  <div key={q.key} className="border rounded-lg p-4 space-y-3 bg-muted/20">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <GripVertical className="w-4 h-4" /> Question {qIdx + 1}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={questions.length === 1}
                        onClick={() => removeQuestion(q.key)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>

                    <Textarea
                      value={q.question_text}
                      onChange={(e) => updateQuestion(q.key, { question_text: e.target.value })}
                      placeholder="Question text"
                      rows={2}
                    />

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Options — select the correct answer
                      </Label>
                      <RadioGroup
                        value={q.correct_answer}
                        onValueChange={(val) => updateQuestion(q.key, { correct_answer: val })}
                        className="space-y-2"
                      >
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-2">
                            <RadioGroupItem
                              value={opt}
                              disabled={!opt.trim()}
                              id={`${q.key}-opt-${oIdx}`}
                            />
                            <Input
                              value={opt}
                              onChange={(e) => updateOption(q.key, oIdx, e.target.value)}
                              placeholder={`Option ${oIdx + 1}`}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={q.options.length <= 2}
                              onClick={() => removeOption(q.key, oIdx)}
                            >
                              <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                            </Button>
                          </div>
                        ))}
                      </RadioGroup>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => addOption(q.key)}
                      >
                        <PlusCircle className="w-3.5 h-3.5 mr-1" /> Add option
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 w-32">
                      <Label htmlFor={`${q.key}-points`} className="text-xs whitespace-nowrap">
                        Points
                      </Label>
                      <Input
                        id={`${q.key}-points`}
                        type="number"
                        min={1}
                        value={q.points}
                        onChange={(e) =>
                          updateQuestion(q.key, { points: parseInt(e.target.value) || 1 })
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
