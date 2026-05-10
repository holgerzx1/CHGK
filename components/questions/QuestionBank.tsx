"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QuestionForm } from "./QuestionForm";
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS, type Difficulty } from "@/lib/types";

interface Question {
  id: number;
  text: string;
  answer: string;
  difficulty: string;
  topic: string;
  createdAt: string;
}

export function QuestionBank() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [difficulty, setDifficulty] = useState("all");
  const [topicFilter, setTopicFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Question | undefined>();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchQuestions = useCallback(async () => {
    const params = new URLSearchParams();
    if (difficulty !== "all") params.set("difficulty", difficulty);
    if (topicFilter) params.set("topic", topicFilter);
    const res = await fetch(`/api/questions?${params}`);
    setQuestions(await res.json());
  }, [difficulty, topicFilter]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  async function handleDelete(id: number) {
    if (!confirm("Удалить вопрос?")) return;
    const res = await fetch(`/api/questions/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchQuestions();
    } else {
      const data = await res.json();
      alert(data.error);
    }
  }

  const allTopics = [...new Set(questions.map((q) => q.topic))].sort();

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-3 flex-wrap">
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Сложность" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все уровни</SelectItem>
              {(Object.entries(DIFFICULTY_LABELS) as [Difficulty, string][]).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Фильтр по теме..."
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="w-48"
            list="topics-list"
          />
          <datalist id="topics-list">
            {allTopics.map((t) => <option key={t} value={t} />)}
          </datalist>
        </div>

        <Button onClick={() => { setEditing(undefined); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Добавить вопрос
        </Button>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>Всего: <strong className="text-foreground">{questions.length}</strong></span>
        {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
          <span key={d}>
            {DIFFICULTY_LABELS[d]}: <strong className="text-foreground">
              {questions.filter((q) => q.difficulty === d).length}
            </strong>
          </span>
        ))}
      </div>

      {/* Question list */}
      {questions.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">Вопросов пока нет</p>
          <p className="text-sm mt-1">Добавьте первый вопрос в банк</p>
        </div>
      ) : (
        <div className="space-y-2">
          {questions.map((q) => (
            <div key={q.id} className="border rounded-lg bg-card overflow-hidden">
              <div
                className="flex items-start gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
              >
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 mt-0.5 ${DIFFICULTY_COLORS[q.difficulty as Difficulty]}`}>
                  {DIFFICULTY_LABELS[q.difficulty as Difficulty]}
                </span>
                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full shrink-0 mt-0.5">
                  {q.topic}
                </span>
                <p className="text-sm flex-1 line-clamp-2">{q.text}</p>
                <div className="flex gap-1 shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={(e) => { e.stopPropagation(); setEditing(q); setDialogOpen(true); }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={(e) => { e.stopPropagation(); handleDelete(q.id); }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              {expandedId === q.id && (
                <div className="border-t bg-muted/20 px-4 py-3 space-y-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Вопрос</p>
                    <p className="text-sm">{q.text}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Ответ</p>
                    <p className="text-sm text-green-700 dark:text-green-400">{q.answer}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Редактировать вопрос" : "Новый вопрос"}
            </DialogTitle>
          </DialogHeader>
          <QuestionForm
            initial={editing}
            onSave={() => { setDialogOpen(false); fetchQuestions(); }}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
