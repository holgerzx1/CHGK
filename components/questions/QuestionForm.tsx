"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DIFFICULTY_LABELS, type Difficulty } from "@/lib/types";

interface Question {
  id?: number;
  text: string;
  answer: string;
  difficulty: string;
  topic: string;
}

interface QuestionFormProps {
  initial?: Question;
  onSave: () => void;
  onCancel: () => void;
}

export function QuestionForm({ initial, onSave, onCancel }: QuestionFormProps) {
  const [text, setText] = useState(initial?.text ?? "");
  const [answer, setAnswer] = useState(initial?.answer ?? "");
  const [difficulty, setDifficulty] = useState(initial?.difficulty ?? "");
  const [topic, setTopic] = useState(initial?.topic ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const url = initial?.id ? `/api/questions/${initial.id}` : "/api/questions";
      const method = initial?.id ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, answer, difficulty, topic }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Ошибка сохранения");
        return;
      }
      onSave();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="topic">Тема</Label>
        <Input
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="например: Кошки, Фараоны, Фамилии"
          required
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="difficulty">Сложность</Label>
        <Select value={difficulty} onValueChange={setDifficulty} required>
          <SelectTrigger>
            <SelectValue placeholder="Выберите сложность" />
          </SelectTrigger>
          <SelectContent>
            {(Object.entries(DIFFICULTY_LABELS) as [Difficulty, string][]).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="text">Вопрос</Label>
        <Textarea
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Текст вопроса..."
          rows={3}
          required
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="answer">Развёрнутый ответ</Label>
        <Textarea
          id="answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Подробный ответ для ведущего..."
          rows={3}
          required
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Отмена
        </Button>
        <Button type="submit" disabled={loading || !difficulty}>
          {loading ? "Сохранение..." : initial?.id ? "Сохранить" : "Добавить"}
        </Button>
      </div>
    </form>
  );
}
