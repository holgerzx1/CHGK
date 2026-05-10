import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateBlitzQuestions } from "@/lib/claude";

export async function POST(req: NextRequest) {
  const { gameId } = await req.json();

  if (!gameId) return NextResponse.json({ error: "gameId обязателен" }, { status: 400 });

  // Delete any existing blitz questions for this game
  await prisma.blitzQuestion.deleteMany({ where: { gameId: Number(gameId) } });

  const questions = await generateBlitzQuestions();

  const created = await prisma.blitzQuestion.createManyAndReturn({
    data: questions.map((q) => ({
      gameId: Number(gameId),
      questionText: q.question,
      answerText: q.answer,
    })),
  });

  return NextResponse.json(created);
}

export async function PATCH(req: NextRequest) {
  const { questionId, wasCorrect, gameId, finalWinner } = await req.json();

  if (questionId !== undefined) {
    await prisma.blitzQuestion.update({
      where: { id: Number(questionId) },
      data: { wasCorrect },
    });
  }

  if (finalWinner) {
    await prisma.game.update({
      where: { id: Number(gameId) },
      data: { status: "completed", winner: finalWinner },
    });
  }

  return NextResponse.json({ success: true });
}
