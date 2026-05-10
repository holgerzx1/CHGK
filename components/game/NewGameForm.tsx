"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2 } from "lucide-react";
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
import {
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
  ROUND_CONFIG,
  type Difficulty,
} from "@/lib/types";

interface Question {
  id: number;
  text: string;
  answer: string;
  difficulty: string;
  topic: string;
}

export function NewGameForm() {
  const router = useRouter();
  const [teamName, setTeamName] = useState("");
  const [players, setPlayers] = useState<string[]>(["", ""]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [filterDiff, setFilterDiff] = useState("all");
  const [filterTopic, setFilterTopic] = useState("");
  const [blackBoxItem, setBlackBoxItem] = useState("");
  const [blackBoxDesc, setBlackBoxDesc] = useState("");
  const [blackBoxQuestion, setBlackBoxQuestion] = useState("");
  const [generatingBB, setGeneratingBB] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/questions").then((r) => r.json()).then(setAllQuestions);
  }, []);

  const selectedQuestions = allQuestions.filter((q) => selectedIds.has(q.id));

  const countByDiff = (diff: Difficulty) =>
    selectedQuestions.filter((q) => q.difficulty === diff).length;

  const required = ROUND_CONFIG.requiredByDifficulty;

  const validSelection = () => {
    if (selectedIds.size !== 5) return false;
    const topics = selectedQuestions.map((q) => q.topic.toLowerCase());
    const uniqueTopics = new Set(topics);
    if (uniqueTopics.size !== 5) return false;
    return (
      countByDiff("easy") === required.easy &&
      countByDiff("medium") === required.medium &&
      countByDiff("hard") === required.hard
    );
  };

  const validTeam = () =>
    teamName.trim() && players.filter((p) => p.trim()).length > 0;

  const filteredQuestions = allQuestions.filter((q) => {
    if (filterDiff !== "all" && q.difficulty !== filterDiff) return false;
    if (filterTopic && !q.topic.toLowerCase().includes(filterTopic.toLowerCase())) return false;
    return true;
  });

  function toggleQuestion(q: Question) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(q.id)) {
        next.delete(q.id);
      } else {
        next.add(q.id);
      }
      return next;
    });
  }

  // Detect duplicate topics among selected
  const selectedTopics = selectedQuestions.map((q) => q.topic.toLowerCase());
  const duplicateTopics = selectedTopics.filter(
    (t, i) => selectedTopics.indexOf(t) !== i
  );

  async function generateBlackBox() {
    if (!blackBoxItem || !blackBoxDesc) return;
    setGeneratingBB(true);
    setError("");
    try {
      const res = await fetch("/api/blackbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemName: blackBoxItem, description: blackBoxDesc }),
      });
      const data = await res.json();
      if (res.ok) {
        setBlackBoxQuestion(data.question);
      } else {
        setError(data.error ?? "Ошибка генерации");
      }
    } finally {
      setGeneratingBB(false);
    }
  }

  async function handleSubmit() {
    if (!validSelection() || !validTeam() || !blackBoxQuestion) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName,
          players: players.filter((p) => p.trim()),
          questionIds: [...selectedIds],
          blackBox: {
            itemName: blackBoxItem,
            itemDescription: blackBoxDesc,
            generatedQuestion: blackBoxQuestion,
          },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push(`/game/${data.id}`);
      } else {
        setError(data.error ?? "Ошибка создания игры");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Step indicator */}
      <div className="flex gap-2">
        {[1, 2, 3].map((s) => (
          <button
            key={s}
            onClick={() => setStep(s as 1 | 2 | 3)}
            className={`flex-1 py-2 text-sm rounded-md font-medium transition-colors ${
              step === s
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {s === 1 && "1. Команда"}
            {s === 2 && "2. Вопросы"}
            {s === 3 && "3. Чёрный ящик"}
          </button>
        ))}
      </div>

      {/* Step 1: Team */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="space-y-1">
            <Label>Название команды знатоков</Label>
            <Input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Команда «Эрудит»"
            />
          </div>

          <div className="space-y-2">
            <Label>Участники</Label>
            {players.map((p, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={p}
                  onChange={(e) => {
                    const next = [...players];
                    next[i] = e.target.value;
                    setPlayers(next);
                  }}
                  placeholder={`Участник ${i + 1}`}
                />
                {players.length > 1 && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => setPlayers(players.filter((_, j) => j !== i))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPlayers([...players, ""])}
            >
              <Plus className="h-4 w-4 mr-1" /> Добавить участника
            </Button>
          </div>

          <Button onClick={() => setStep(2)} disabled={!validTeam()}>
            Далее →
          </Button>
        </div>
      )}

      {/* Step 2: Questions */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50 text-sm space-y-1">
            <p className="font-medium">Нужно выбрать 5 вопросов:</p>
            <div className="flex gap-4">
              {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
                <span key={d} className={`px-2 py-0.5 rounded-full text-xs ${
                  countByDiff(d) === required[d]
                    ? "bg-green-100 text-green-800"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {DIFFICULTY_LABELS[d]}: {countByDiff(d)}/{required[d]}
                </span>
              ))}
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                selectedIds.size === 5 ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"
              }`}>
                Всего: {selectedIds.size}/5
              </span>
            </div>
            {duplicateTopics.length > 0 && (
              <p className="text-destructive text-xs">
                ⚠ Повторяющаяся тема: «{duplicateTopics[0]}»
              </p>
            )}
          </div>

          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <Select value={filterDiff} onValueChange={setFilterDiff}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Сложность" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все уровни</SelectItem>
                {(Object.entries(DIFFICULTY_LABELS) as [Difficulty, string][]).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Фильтр по теме..."
              value={filterTopic}
              onChange={(e) => setFilterTopic(e.target.value)}
              className="w-48"
            />
          </div>

          {/* Question list */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredQuestions.map((q) => {
              const isSelected = selectedIds.has(q.id);
              const isDuplicateTopic =
                isSelected &&
                selectedQuestions.filter(
                  (s) => s.topic.toLowerCase() === q.topic.toLowerCase() && s.id !== q.id
                ).length > 0;

              return (
                <div
                  key={q.id}
                  onClick={() => toggleQuestion(q)}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    isSelected
                      ? isDuplicateTopic
                        ? "border-destructive bg-destructive/5"
                        : "border-primary bg-primary/5"
                      : "hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="accent-primary"
                    />
                    <span className={`text-xs px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[q.difficulty as Difficulty]}`}>
                      {DIFFICULTY_LABELS[q.difficulty as Difficulty]}
                    </span>
                    <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                      {q.topic}
                    </span>
                    {isDuplicateTopic && (
                      <span className="text-xs text-destructive font-medium">⚠ Тема повторяется</span>
                    )}
                  </div>
                  <p className="text-sm pl-6 line-clamp-2">{q.text}</p>
                </div>
              );
            })}
            {filteredQuestions.length === 0 && (
              <p className="text-center text-muted-foreground py-8 text-sm">
                Вопросов не найдено
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)}>← Назад</Button>
            <Button onClick={() => setStep(3)} disabled={!validSelection()}>
              Далее →
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Black Box */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="p-4 bg-gray-900 text-gray-100 rounded-xl space-y-1">
            <h2 className="font-bold text-lg">🎁 Чёрный ящик — Раунд 4</h2>
            <p className="text-sm text-gray-300">
              Опишите предмет и его историю — ИИ создаст метафоричный вопрос
            </p>
          </div>

          <div className="space-y-1">
            <Label>Что в ящике (только для ведущего)</Label>
            <Input
              value={blackBoxItem}
              onChange={(e) => setBlackBoxItem(e.target.value)}
              placeholder="например: старый советский рубль"
            />
          </div>

          <div className="space-y-1">
            <Label>История / описание (личный контекст, мемы компании)</Label>
            <Textarea
              value={blackBoxDesc}
              onChange={(e) => setBlackBoxDesc(e.target.value)}
              placeholder="Расскажите историю: почему именно этот предмет, что он значит для команды..."
              rows={4}
            />
          </div>

          <Button
            onClick={generateBlackBox}
            disabled={!blackBoxItem || !blackBoxDesc || generatingBB}
            variant="outline"
          >
            {generatingBB ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Генерирую...</>
            ) : (
              "✨ Сгенерировать вопрос"
            )}
          </Button>

          {blackBoxQuestion && (
            <div className="space-y-1">
              <Label>Сгенерированный вопрос (можно отредактировать)</Label>
              <Textarea
                value={blackBoxQuestion}
                onChange={(e) => setBlackBoxQuestion(e.target.value)}
                rows={4}
                className="font-medium"
              />
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(2)}>← Назад</Button>
            <Button
              onClick={handleSubmit}
              disabled={!blackBoxQuestion || submitting}
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Создаём игру...</>
              ) : (
                "🎉 Начать игру"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
