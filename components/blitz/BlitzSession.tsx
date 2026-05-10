"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface BlitzQuestion {
  id: number;
  questionText: string;
  answerText: string;
  wasCorrect: boolean | null;
}

interface BlitzSessionProps {
  gameId: number;
  teamName: string;
  onComplete: (winner: "znatok" | "televiewers") => void;
}

export function BlitzSession({ gameId, teamName, onComplete }: BlitzSessionProps) {
  const [questions, setQuestions] = useState<BlitzQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scores, setScores] = useState<boolean[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [finished, setFinished] = useState(false);
  const [winner, setWinner] = useState<"znatok" | "televiewers" | null>(null);

  useEffect(() => {
    fetch("/api/blitz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId }),
    })
      .then((r) => r.json())
      .then((data) => {
        setQuestions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [gameId]);

  async function answer(correct: boolean) {
    const q = questions[currentIdx];
    await fetch("/api/blitz", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: q.id, wasCorrect: correct }),
    });

    const newScores = [...scores, correct];
    setScores(newScores);
    setShowAnswer(false);

    if (currentIdx + 1 >= questions.length) {
      const correctCount = newScores.filter(Boolean).length;
      const w = correctCount >= 3 ? "znatok" : "televiewers";
      setWinner(w);
      setFinished(true);

      await fetch("/api/blitz", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, finalWinner: w }),
      });

      onComplete(w);
    } else {
      setCurrentIdx(currentIdx + 1);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
        <p className="text-muted-foreground">ИИ генерирует вопросы блиц-раунда...</p>
      </div>
    );
  }

  if (finished && winner) {
    const zScore = scores.filter(Boolean).length;
    const tScore = scores.length - zScore;
    return (
      <div className={`border rounded-xl p-8 text-center space-y-4 ${
        winner === "znatok"
          ? "bg-amber-50 border-amber-300"
          : "bg-blue-50 border-blue-300"
      }`}>
        <div className="text-5xl">{winner === "znatok" ? "🏆" : "📺"}</div>
        <h2 className="text-2xl font-bold">
          {winner === "znatok" ? `Победа Знатоков!` : "Победа Телезрителей!"}
        </h2>
        <p className="text-muted-foreground">
          Блиц-раунд: Знатоки — {zScore}, Телезрители — {tScore}
        </p>
      </div>
    );
  }

  const q = questions[currentIdx];
  if (!q) return null;

  return (
    <div className="border rounded-xl bg-card p-6 space-y-6 shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          Блиц-раунд
        </span>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-2 w-8 rounded-full ${
                i < currentIdx
                  ? scores[i]
                    ? "bg-green-500"
                    : "bg-red-400"
                  : i === currentIdx
                  ? "bg-primary"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-medium">
          {currentIdx + 1} / {questions.length}
        </span>
      </div>

      <div className="space-y-1 text-center">
        <p className="text-xs text-muted-foreground">Правильных: {scores.filter(Boolean).length}</p>
        <p className="text-xs text-muted-foreground">Для победы нужно 3+</p>
      </div>

      <div className="bg-muted/40 rounded-lg p-4">
        <p className="text-sm text-muted-foreground mb-1 font-medium">Вопрос:</p>
        <p className="text-base leading-relaxed">{q.questionText}</p>
      </div>

      {!showAnswer ? (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowAnswer(true)}
        >
          Показать ответ
        </Button>
      ) : (
        <div className="space-y-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm font-medium text-green-800 mb-1">Ответ:</p>
            <p className="text-sm text-green-700">{q.answerText}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => answer(true)}
              className="bg-green-600 hover:bg-green-700 text-white h-12"
            >
              ✓ Правильно
            </Button>
            <Button
              onClick={() => answer(false)}
              className="bg-red-500 hover:bg-red-600 text-white h-12"
            >
              ✗ Неправильно
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
