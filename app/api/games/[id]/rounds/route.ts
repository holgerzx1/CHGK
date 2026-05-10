import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const gameId = Number(id);
  const body = await req.json();
  const { roundNumber, winner } = body;

  if (!roundNumber || !winner) {
    return NextResponse.json({ error: "Укажите номер раунда и победителя" }, { status: 400 });
  }
  if (!["znatok", "televiewers"].includes(winner)) {
    return NextResponse.json({ error: "Неверный победитель" }, { status: 400 });
  }

  await prisma.gameRound.update({
    where: { gameId_roundNumber: { gameId, roundNumber } },
    data: { winner },
  });

  // Fetch all rounds to compute score
  const allRounds = await prisma.gameRound.findMany({
    where: { gameId },
    orderBy: { roundNumber: "asc" },
  });

  const playedRounds = allRounds.filter((r) => r.winner !== null);
  const znatokScore = playedRounds.filter((r) => r.winner === "znatok").length;
  const teleScore = playedRounds.filter((r) => r.winner === "televiewers").length;
  const allPlayed = playedRounds.length === 6;

  if (allPlayed) {
    if (znatokScore === teleScore) {
      // Tie → blitz
      await prisma.game.update({ where: { id: gameId }, data: { status: "blitz" } });
    } else {
      const gameWinner = znatokScore > teleScore ? "znatok" : "televiewers";
      await prisma.game.update({
        where: { id: gameId },
        data: { status: "completed", winner: gameWinner },
      });
    }
  }

  const updatedGame = await prisma.game.findUnique({
    where: { id: gameId },
    include: {
      rounds: { include: { question: true }, orderBy: { roundNumber: "asc" } },
      blitzQuestions: true,
      blackBox: true,
      players: true,
    },
  });

  return NextResponse.json(updatedGame);
}
