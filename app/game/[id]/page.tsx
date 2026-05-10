import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GameBoard } from "@/components/game/GameBoard";

export default async function GamePage({ params }: { params: Promise<{ id: string }> }) {
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

  if (!game) notFound();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">{game.teamName}</h1>
        <p className="text-sm text-muted-foreground">
          {game.players.map((p) => p.name).join(", ")}
        </p>
      </div>
      <GameBoard initialGame={game} />
    </div>
  );
}
