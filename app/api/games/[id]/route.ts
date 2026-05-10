import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const game = await prisma.game.findUnique({
    where: { id: Number(id) },
    include: {
      players: true,
      rounds: {
        include: { question: true },
        orderBy: { roundNumber: "asc" },
      },
      blitzQuestions: true,
      blackBox: true,
    },
  });

  if (!game) return NextResponse.json({ error: "Игра не найдена" }, { status: 404 });
  return NextResponse.json(game);
}
