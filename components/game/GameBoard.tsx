"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScoreBoard } from "./ScoreBoard";
import { RoundCard } from "./RoundCard";
import { BlackBoxRound } from "./BlackBoxRound";
import { MusicalPause } from "@/components/musical-pause/MusicalPause";
import { BlitzSession } from "@/components/blitz/BlitzSession";

interface Question {
  id: number;
  text: string;
  answer: string;
  difficulty: string;
  topic: string;
}

interface GameRound {
  id: number;
  roundNumber: number;
  questionId: number | null;
  winner: string | null;
  question: Question | null;
}

interface BlackBox {
  itemName: string;
  itemDescription: string;
  generatedQuestion: string;
}

interface Game {
  id: number;
  teamName: string;
  status: string;
  winner: string | null;
  players: { id: number; name: string }[];
  rounds: GameRound[];
  blackBox: BlackBox | null;
}

type GamePhase =
  | { type: "pre-round"; roundNumber: number }
  | { type: "round"; roundNumber: number }
  | { type: "musical-pause" }
  | { type: "blitz" }
  | { type: "ended" };

function computePhase(game: Game): GamePhase {
  if (game.status === "completed") return { type: "ended" };
  if (game.status === "blitz") return { type: "blitz" };

  const nextUnplayed = game.rounds.find((r) => r.winner === null);
  if (!nextUnplayed) return { type: "ended" };

  return { type: "pre-round", roundNumber: nextUnplayed.roundNumber };
}

export function GameBoard({ initialGame }: { initialGame: Game }) {
  const [game, setGame] = useState(initialGame);
  const [phase, setPhase] = useState<GamePhase>(() => computePhase(initialGame));
  const [roundLoading, setRoundLoading] = useState(false);
  const [finalWinner, setFinalWinner] = useState<string | null>(initialGame.winner);

  const znatokScore = game.rounds.filter((r) => r.winner === "znatok").length;
  const teleScore = game.rounds.filter((r) => r.winner === "televiewers").length;
  const playedRounds = game.rounds.filter((r) => r.winner !== null).length;

  const recordRoundWinner = useCallback(
    async (roundNumber: number, winner: "znatok" | "televiewers") => {
      setRoundLoading(true);
      try {
        const res = await fetch(`/api/games/${game.id}/rounds`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roundNumber, winner }),
        });
        const updated = await res.json();
        setGame(updated);

        // Determine next phase
        if (updated.status === "completed") {
          setFinalWinner(updated.winner);
          setPhase({ type: "ended" });
        } else if (updated.status === "blitz") {
          setPhase({ type: "blitz" });
        } else if (roundNumber === 3) {
          setPhase({ type: "musical-pause" });
        } else {
          const nextRound = updated.rounds.find((r: GameRound) => r.winner === null);
          if (nextRound) {
            setPhase({ type: "pre-round", roundNumber: nextRound.roundNumber });
          }
        }
      } finally {
        setRoundLoading(false);
      }
    },
    [game.id]
  );

  function spinTop() {
    if (phase.type === "pre-round") {
      setPhase({ type: "round", roundNumber: phase.roundNumber });
    }
  }

  const currentRoundData = phase.type === "round"
    ? game.rounds.find((r) => r.roundNumber === phase.roundNumber)
    : null;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Score */}
      <ScoreBoard
        znatokScore={znatokScore}
        teleScore={teleScore}
        teamName={game.teamName}
        currentRound={playedRounds + 1 <= 6 ? playedRounds + 1 : 6}
      />

      {/* Players */}
      <div className="flex flex-wrap gap-1 justify-center">
        {game.players.map((p) => (
          <span key={p.id} className="text-xs bg-secondary px-2 py-0.5 rounded-full">
            {p.name}
          </span>
        ))}
      </div>

      {/* Phase content */}
      {phase.type === "pre-round" && (
        <div className="text-center py-8 space-y-4">
          <div className="text-muted-foreground">
            {phase.roundNumber === 4 ? (
              <p className="text-lg font-medium">Вносим Чёрный ящик...</p>
            ) : (
              <p className="text-lg font-medium">Раунд {phase.roundNumber}</p>
            )}
          </div>
          <Button
            onClick={spinTop}
            size="xl"
            className="text-xl font-bold px-12 py-6 h-auto rounded-2xl shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-transform active:scale-95"
          >
            🌀 Крутить волчок!
          </Button>
          {phase.roundNumber === 4 && (
            <p className="text-sm text-muted-foreground">
              Специальный раунд — Чёрный ящик
            </p>
          )}
        </div>
      )}

      {phase.type === "round" && currentRoundData && (
        <>
          {phase.roundNumber === 4 && game.blackBox ? (
            <BlackBoxRound
              blackBox={game.blackBox}
              onWinner={(winner) => recordRoundWinner(4, winner)}
              loading={roundLoading}
            />
          ) : currentRoundData.question ? (
            <RoundCard
              roundNumber={phase.roundNumber}
              question={currentRoundData.question}
              onWinner={(winner) => recordRoundWinner(phase.roundNumber, winner)}
              loading={roundLoading}
            />
          ) : null}

          {/* After winner is recorded, show spin button for next round */}
          {currentRoundData.winner && phase.type === "round" && (
            <div className="text-center">
              <Button
                onClick={() => {
                  const next = game.rounds.find((r) => r.winner === null);
                  if (next) setPhase({ type: "pre-round", roundNumber: next.roundNumber });
                }}
                variant="outline"
              >
                → Следующий раунд
              </Button>
            </div>
          )}
        </>
      )}

      {phase.type === "musical-pause" && (
        <MusicalPause
          gameId={game.id}
          onContinue={() => {
            const next = game.rounds.find((r) => r.winner === null);
            if (next) setPhase({ type: "pre-round", roundNumber: next.roundNumber });
          }}
        />
      )}

      {phase.type === "blitz" && (
        <div className="space-y-4">
          <div className="text-center p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <h2 className="text-xl font-bold">🎯 Ничья! Блиц-раунд!</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Счёт {znatokScore}:{teleScore} — определяем победителя в блиц-раунде
            </p>
          </div>
          <BlitzSession
            gameId={game.id}
            teamName={game.teamName}
            onComplete={(winner) => {
              setFinalWinner(winner);
              setPhase({ type: "ended" });
            }}
          />
        </div>
      )}

      {phase.type === "ended" && (
        <div
          className={`border rounded-xl p-8 text-center space-y-4 ${
            finalWinner === "znatok"
              ? "bg-amber-50 border-amber-300"
              : "bg-blue-50 border-blue-300"
          }`}
        >
          <div className="text-5xl">
            {finalWinner === "znatok" ? "🏆" : "📺"}
          </div>
          <h2 className="text-3xl font-bold">
            {finalWinner === "znatok"
              ? `Победа Знатоков!`
              : "Победа Телезрителей!"}
          </h2>
          <p className="text-xl">
            {znatokScore} : {teleScore}
          </p>
          {finalWinner === "znatok" && (
            <p className="text-muted-foreground">{game.teamName}</p>
          )}
          <div className="pt-4 flex gap-3 justify-center">
            <a
              href="/game/new"
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium"
            >
              Новая игра
            </a>
            <a
              href="/history"
              className="inline-flex items-center px-4 py-2 border rounded-md hover:bg-muted text-sm font-medium"
            >
              История игр
            </a>
          </div>
        </div>
      )}

      {/* Round progress dots */}
      <div className="flex justify-center gap-2 pb-2">
        {game.rounds.map((r) => (
          <div
            key={r.roundNumber}
            className={`h-3 w-3 rounded-full border-2 ${
              r.roundNumber === 4
                ? r.winner === "znatok"
                  ? "bg-amber-500 border-amber-500"
                  : r.winner === "televiewers"
                  ? "bg-blue-500 border-blue-500"
                  : "bg-gray-800 border-gray-800"
                : r.winner === "znatok"
                ? "bg-amber-500 border-amber-500"
                : r.winner === "televiewers"
                ? "bg-blue-500 border-blue-500"
                : "bg-white border-muted-foreground"
            }`}
            title={`Раунд ${r.roundNumber}${r.roundNumber === 4 ? " (Чёрный ящик)" : ""}`}
          />
        ))}
      </div>
    </div>
  );
}
