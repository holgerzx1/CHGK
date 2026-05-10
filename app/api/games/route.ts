import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateQuestionSelection, assignQuestionsToRounds } from "@/lib/game-utils";

export async function GET() {
  const games = await prisma.game.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      players: true,
      rounds: { include: { question: true }, orderBy: { roundNumber: "asc" } },
      blackBox: true,
    },
  });
  return NextResponse.json(games);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { teamName, players, questionIds, blackBox } = body;

  if (!teamName?.trim()) {
    return NextResponse.json({ error: "Укажите название команды" }, { status: 400 });
  }
  if (!players?.length) {
    return NextResponse.json({ error: "Добавьте хотя бы одного участника" }, { status: 400 });
  }
  if (!blackBox?.itemName || !blackBox?.itemDescription || !blackBox?.generatedQuestion) {
    return NextResponse.json({ error: "Заполните данные для Чёрного ящика" }, { status: 400 });
  }

  // Fetch selected questions
  const questions = await prisma.question.findMany({
    where: { id: { in: questionIds } },
    select: { id: true, difficulty: true, topic: true },
  });

  if (questions.length !== questionIds.length) {
    return NextResponse.json({ error: "Некоторые вопросы не найдены" }, { status: 400 });
  }

  const validation = validateQuestionSelection(questions);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const roundAssignments = assignQuestionsToRounds(questions);

  const game = await prisma.$transaction(async (tx) => {
    const newGame = await tx.game.create({
      data: { teamName: teamName.trim() },
    });

    await tx.player.createMany({
      data: players.map((name: string) => ({ gameId: newGame.id, name: name.trim() })),
    });

    // Create rounds 1-6; round 4 is Black Box (questionId = null)
    const roundData = [];
    for (let round = 1; round <= 6; round++) {
      if (round === 4) {
        roundData.push({ gameId: newGame.id, roundNumber: 4, questionId: null });
      } else {
        const assignment = roundAssignments.find((r) => r.roundNumber === round);
        roundData.push({ gameId: newGame.id, roundNumber: round, questionId: assignment!.questionId });
      }
    }

    await tx.gameRound.createMany({ data: roundData });

    await tx.blackBox.create({
      data: {
        gameId: newGame.id,
        itemName: blackBox.itemName,
        itemDescription: blackBox.itemDescription,
        generatedQuestion: blackBox.generatedQuestion,
      },
    });

    return newGame;
  });

  return NextResponse.json({ id: game.id }, { status: 201 });
}
