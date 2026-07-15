import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Exam } from "@/types/exam";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PlusCircle, Pencil, Trash2, FileQuestion } from "lucide-react";
import { toast } from "sonner";
import { ExamFormDialog } from "./ExamFormDialog";
import { Skeleton } from "@/components/ui/skeleton";

export function ExamsTab() {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Exam | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("exams")
      .select("*")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Couldn't load exams", { description: error.message });
    } else {
      setExams((data ?? []) as Exam[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingExam(null);
    setFormOpen(true);
  };

  const openEdit = (exam: Exam) => {
    setEditingExam(exam);
    setFormOpen(true);
  };

  const toggleActive = async (exam: Exam) => {
    const { error } = await supabase
      .from("exams")
      .update({ is_active: !exam.is_active })
      .eq("id", exam.id);
    if (error) {
      toast.error("Couldn't update exam", { description: error.message });
      return;
    }
    setExams((prev) =>
      prev.map((e) => (e.id === exam.id ? { ...e, is_active: !e.is_active } : e)),
    );
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase.from("exams").delete().eq("id", deleteTarget.id);
    setDeleting(false);
    if (error) {
      toast.error("Couldn't delete exam", { description: error.message });
      return;
    }
    toast.success("Exam deleted");
    setExams((prev) => prev.filter((e) => e.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Your Exams</h2>
          <p className="text-sm text-muted-foreground">Create, edit, and manage your examinations</p>
        </div>
        <Button onClick={openCreate} className="flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> Create New Exam
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : exams.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <FileQuestion className="w-10 h-10 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">You haven't created any exams yet.</p>
            <Button onClick={openCreate}>
              <PlusCircle className="w-4 h-4 mr-2" /> Create your first exam
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {exams.map((exam) => (
            <Card key={exam.id}>
              <CardContent className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    📝
                  </div>
                  <div>
                    <h3 className="font-semibold">{exam.title}</h3>
                    {exam.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">{exam.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {exam.total_questions} questions • {exam.duration_minutes} minutes
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <Badge
                    variant={exam.is_active ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => toggleActive(exam)}
                  >
                    {exam.is_active ? "ACTIVE" : "DRAFT"}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => openEdit(exam)}>
                    <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setDeleteTarget(exam)}>
                    <Trash2 className="w-3.5 h-3.5 mr-1 text-destructive" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ExamFormDialog open={formOpen} onOpenChange={setFormOpen} exam={editingExam} onSaved={load} />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the exam, its questions, and can't be undone. Existing
              student results referencing it will also be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
