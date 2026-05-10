import type { Difficulty } from "@/lib/types";
import { ROUND_CONFIG } from "@/lib/types";

export interface QuestionForValidation {
  id: number;
  difficulty: string;
  topic: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateQuestionSelection(
  questions: QuestionForValidation[]
): ValidationResult {
  if (questions.length !== 5) {
    return { valid: false, error: "Необходимо выбрать ровно 5 вопросов" };
  }

  const countByDifficulty: Record<string, number> = { easy: 0, medium: 0, hard: 0 };
  const topics = new Set<string>();

  for (const q of questions) {
    if (!["easy", "medium", "hard"].includes(q.difficulty)) {
      return { valid: false, error: `Неверный уровень сложности: ${q.difficulty}` };
    }
    countByDifficulty[q.difficulty]++;

    if (topics.has(q.topic.toLowerCase())) {
      return { valid: false, error: `Тема «${q.topic}» встречается дважды` };
    }
    topics.add(q.topic.toLowerCase());
  }

  const required = ROUND_CONFIG.requiredByDifficulty;
  for (const [diff, count] of Object.entries(required) as [Difficulty, number][]) {
    if (countByDifficulty[diff] !== count) {
      const diffLabels: Record<Difficulty, string> = {
        easy: "лёгких",
        medium: "средних",
        hard: "сложных",
      };
      return {
        valid: false,
        error: `Нужно ${count} ${diffLabels[diff]} вопроса, выбрано: ${countByDifficulty[diff]}`,
      };
    }
  }

  return { valid: true };
}

// Assign questions to round numbers: rounds 1,2,3,5,6
// Round 4 is always Black Box
export function assignQuestionsToRounds(
  questions: QuestionForValidation[]
): Array<{ roundNumber: number; questionId: number }> {
  const regularRounds = [1, 2, 3, 5, 6];
  return regularRounds.map((roundNumber, index) => ({
    roundNumber,
    questionId: questions[index].id,
  }));
}
