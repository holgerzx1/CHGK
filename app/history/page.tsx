import { prisma } from "@/lib/prisma";
import { DIFFICULTY_LABELS, WINNER_LABELS, type Difficulty, type RoundWinner } from "@/lib/types";

export default async function HistoryPage() {
  const games = await prisma.game.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      players: true,
      rounds: { include: { question: true }, orderBy: { roundNumber: "asc" } },
      blackBox: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">История игр</h1>
        <p className="text-muted-foreground mt-1">Всего сыграно: {games.length}</p>
      </div>

      {games.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">Игр пока нет</p>
          <a href="/game/new" className="text-primary hover:underline text-sm mt-2 inline-block">
            Создать первую игру →
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {games.map((game) => {
            const zScore = game.rounds.filter((r) => r.winner === "znatok").length;
            const tScore = game.rounds.filter((r) => r.winner === "televiewers").length;
            const playedCount = game.rounds.filter((r) => r.winner !== null).length;

            return (
              <div key={game.id} className="border rounded-xl bg-card overflow-hidden">
                <div className="p-4 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <a
                        href={`/game/${game.id}`}
                        className="font-semibold hover:text-primary transition-colors"
                      >
                        {game.teamName}
                      </a>
                      {game.status === "active" && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          В игре
                        </span>
                      )}
                      {game.status === "completed" && game.winner && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          game.winner === "znatok"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-800"
                        }`}>
                          Победа: {WINNER_LABELS[game.winner as RoundWinner]}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {game.players.map((p) => p.name).join(", ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(game.createdAt).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-2xl font-bold">
                      <span className="text-amber-600">{zScore}</span>
                      <span className="text-muted-foreground mx-1">:</span>
                      <span className="text-blue-600">{tScore}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {playedCount} / 6 раундов
                    </p>
                  </div>
                </div>

                {/* Rounds detail */}
                <div className="border-t px-4 py-3 bg-muted/20">
                  <div className="grid grid-cols-6 gap-1.5">
                    {game.rounds.map((r) => (
                      <div
                        key={r.roundNumber}
                        className={`rounded p-2 text-center text-xs ${
                          r.winner === "znatok"
                            ? "bg-amber-100 text-amber-800"
                            : r.winner === "televiewers"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <div className="font-bold">
                          {r.roundNumber === 4 ? "🎁" : r.roundNumber}
                        </div>
                        {r.roundNumber === 4 ? (
                          <div className="text-[10px] mt-0.5 truncate">
                            {game.blackBox?.itemName ?? "Ящик"}
                          </div>
                        ) : r.question ? (
                          <div className="text-[10px] mt-0.5 truncate" title={r.question.topic}>
                            {r.question.topic}
                          </div>
                        ) : null}
                        {r.winner && (
                          <div className="text-[10px]">
                            {r.winner === "znatok" ? "🦉" : "📺"}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
