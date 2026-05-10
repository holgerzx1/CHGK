"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

interface Question {
  id: number;
  text: string;
  answer: string;
  difficulty: string;
  topic: string;
}

interface RoundCardProps {
  roundNumber: number;
  question: Question;
  onWinner: (winner: "znatok" | "televiewers") => void;
  loading: boolean;
}

export function RoundCard({ roundNumber, question, onWinner, loading }: RoundCardProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [winnerChosen, setWinnerChosen] = useState<"znatok" | "televiewers" | null>(null);

  function choose(winner: "znatok" | "televiewers") {
    setWinnerChosen(winner);
    onWinner(winner);
  }

  return (
    <div className="border rounded-xl bg-card p-6 space-y-6 shadow-md">
      <div className="text-center">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Раунд {roundNumber}
        </span>
        <div className="flex gap-2 justify-center mt-1">
          <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{question.topic}</span>
        </div>
      </div>

      {/* Question */}
      <div className="bg-muted/40 rounded-lg p-4">
        <p className="text-sm text-muted-foreground mb-1 font-medium">Вопрос:</p>
        <p className="text-base leading-relaxed">{question.text}</p>
      </div>

      {/* Answer */}
      <div className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAnswer(!showAnswer)}
          className="w-full"
        >
          {showAnswer ? (
            <><EyeOff className="h-4 w-4 mr-2" /> Скрыть ответ</>
          ) : (
            <><Eye className="h-4 w-4 mr-2" /> Показать ответ</>
          )}
        </Button>

        {showAnswer && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm font-medium text-green-800 mb-1">Правильный ответ:</p>
            <p className="text-sm text-green-700">{question.answer}</p>
          </div>
        )}
      </div>

      {/* Winner buttons */}
      {!winnerChosen ? (
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => choose("znatok")}
            disabled={loading}
            className="h-14 text-base bg-amber-500 hover:bg-amber-600 text-white"
          >
            🦉 Знатоки
          </Button>
          <Button
            onClick={() => choose("televiewers")}
            disabled={loading}
            className="h-14 text-base bg-blue-500 hover:bg-blue-600 text-white"
          >
            📺 Телезрители
          </Button>
        </div>
      ) : (
        <div className={`text-center py-3 rounded-lg font-medium ${
          winnerChosen === "znatok"
            ? "bg-amber-100 text-amber-800"
            : "bg-blue-100 text-blue-800"
        }`}>
          {winnerChosen === "znatok" ? "🦉 Победа Знатоков!" : "📺 Победа Телезрителей!"}
        </div>
      )}
    </div>
  );
}
