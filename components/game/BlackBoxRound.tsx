"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

interface BlackBox {
  itemName: string;
  itemDescription: string;
  generatedQuestion: string;
}

interface BlackBoxRoundProps {
  blackBox: BlackBox;
  onWinner: (winner: "znatok" | "televiewers") => void;
  loading: boolean;
}

export function BlackBoxRound({ blackBox, onWinner, loading }: BlackBoxRoundProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [winnerChosen, setWinnerChosen] = useState<"znatok" | "televiewers" | null>(null);

  function choose(winner: "znatok" | "televiewers") {
    setWinnerChosen(winner);
    onWinner(winner);
  }

  return (
    <div className="border border-gray-700 rounded-xl bg-gray-900 text-gray-100 p-6 space-y-6 shadow-xl">
      <div className="text-center space-y-1">
        <div className="text-4xl">🎁</div>
        <h2 className="text-xl font-bold tracking-wide">ЧЁРНЫЙ ЯЩИК</h2>
        <p className="text-xs text-gray-400 uppercase tracking-widest">Раунд 4</p>
      </div>

      {/* Question */}
      <div className="bg-gray-800 rounded-lg p-4">
        <p className="text-xs text-gray-400 mb-2 font-medium">Вопрос:</p>
        <p className="text-base leading-relaxed text-gray-100 italic">
          {blackBox.generatedQuestion}
        </p>
      </div>

      {/* Answer (only visible to host) */}
      <div className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAnswer(!showAnswer)}
          className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-gray-100"
        >
          {showAnswer ? (
            <><EyeOff className="h-4 w-4 mr-2" /> Скрыть ответ</>
          ) : (
            <><Eye className="h-4 w-4 mr-2" /> Показать ответ (только ведущему)</>
          )}
        </Button>

        {showAnswer && (
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 space-y-2">
            <div>
              <p className="text-xs text-gray-400 mb-1">В ящике:</p>
              <p className="text-amber-400 font-bold text-lg">{blackBox.itemName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">История:</p>
              <p className="text-sm text-gray-300">{blackBox.itemDescription}</p>
            </div>
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
            ? "bg-amber-900 text-amber-200"
            : "bg-blue-900 text-blue-200"
        }`}>
          {winnerChosen === "znatok" ? "🦉 Победа Знатоков!" : "📺 Победа Телезрителей!"}
        </div>
      )}
    </div>
  );
}
