export type Difficulty = "easy" | "medium" | "hard";
export type RoundWinner = "znatok" | "televiewers";
export type GameStatus = "active" | "completed" | "blitz";

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Лёгкий",
  medium: "Средний",
  hard: "Сложный",
};

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  hard: "bg-red-100 text-red-800",
};

export const WINNER_LABELS: Record<RoundWinner, string> = {
  znatok: "Знатоки",
  televiewers: "Телезрители",
};

// 5 regular rounds + 1 black box (round 4)
export const ROUND_CONFIG = {
  totalRounds: 6,
  blackBoxRound: 4,
  musicPauseAfterRound: 3,
  requiredByDifficulty: { easy: 2, medium: 2, hard: 1 } as Record<Difficulty, number>,
};
