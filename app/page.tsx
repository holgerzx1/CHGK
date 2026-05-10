import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const [questionCount, gameCount, activeGames] = await Promise.all([
    prisma.question.count(),
    prisma.game.count(),
    prisma.game.findMany({
      where: { status: "active" },
      take: 3,
      orderBy: { createdAt: "desc" },
      include: { players: true, rounds: true },
    }),
  ]);

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="text-center space-y-3 py-8">
        <h1 className="text-4xl font-bold tracking-tight">
          🦉 Что? Где? Когда?
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Игровая платформа для ведущего. Управляйте вопросами, создавайте игры и следите за счётом в реальном времени.
        </p>
      </div>

      {/* Navigation cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href="/questions"
          className="border rounded-xl p-6 bg-card hover:shadow-md transition-shadow space-y-2"
        >
          <div className="text-3xl">📚</div>
          <h2 className="font-semibold text-lg">Банк вопросов</h2>
          <p className="text-sm text-muted-foreground">
            {questionCount} вопросов в банке
          </p>
          <p className="text-xs text-muted-foreground">
            Добавляйте, редактируйте и фильтруйте вопросы по теме и сложности
          </p>
        </a>

        <a
          href="/game/new"
          className="border-2 border-primary rounded-xl p-6 bg-primary/5 hover:shadow-md transition-shadow space-y-2"
        >
          <div className="text-3xl">🎮</div>
          <h2 className="font-semibold text-lg">Новая игра</h2>
          <p className="text-sm text-muted-foreground">
            Создайте новую игру прямо сейчас
          </p>
          <p className="text-xs text-muted-foreground">
            6 раундов, Чёрный ящик, музыкальная пауза со Spotify
          </p>
        </a>

        <a
          href="/history"
          className="border rounded-xl p-6 bg-card hover:shadow-md transition-shadow space-y-2"
        >
          <div className="text-3xl">📜</div>
          <h2 className="font-semibold text-lg">История игр</h2>
          <p className="text-sm text-muted-foreground">
            {gameCount} {gameCount === 1 ? "игра сыграна" : "игр сыграно"}
          </p>
          <p className="text-xs text-muted-foreground">
            Просматривайте результаты и вопросы прошедших игр
          </p>
        </a>
      </div>

      {/* Game structure */}
      <div className="border rounded-xl p-6 bg-card space-y-4">
        <h2 className="font-semibold text-lg">Структура игры</h2>
        <div className="grid grid-cols-6 gap-2 text-center text-sm">
          {[1, 2, 3].map((r) => (
            <div key={r} className="border rounded-lg p-3 bg-muted/30">
              <div className="font-bold">Раунд {r}</div>
              <div className="text-xs text-muted-foreground mt-1">Обычный</div>
            </div>
          ))}
          <div className="border rounded-lg p-3 bg-yellow-50 border-yellow-200 col-span-1">
            <div className="font-bold">🎵</div>
            <div className="text-xs text-muted-foreground mt-1">Муз. пауза</div>
          </div>
          <div className="border-2 border-gray-800 rounded-lg p-3 bg-gray-900 text-gray-100 col-span-1">
            <div className="font-bold">🎁</div>
            <div className="text-xs text-gray-400 mt-1">Чёрный ящик</div>
          </div>
          {[5, 6].map((r) => (
            <div key={r} className="border rounded-lg p-3 bg-muted/30">
              <div className="font-bold">Раунд {r}</div>
              <div className="text-xs text-muted-foreground mt-1">Обычный</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          При ничье после 6 раундов — блиц-раунд с вопросами от ИИ (Claude)
        </p>
      </div>

      {/* Active games */}
      {activeGames.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-lg">Незавершённые игры</h2>
          {activeGames.map((game) => {
            const zScore = game.rounds.filter((r) => r.winner === "znatok").length;
            const tScore = game.rounds.filter((r) => r.winner === "televiewers").length;
            return (
              <a
                key={game.id}
                href={`/game/${game.id}`}
                className="flex items-center justify-between border rounded-lg p-4 bg-card hover:shadow-sm transition-shadow"
              >
                <div>
                  <p className="font-medium">{game.teamName}</p>
                  <p className="text-xs text-muted-foreground">
                    {game.players.map((p) => p.name).join(", ")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">
                    <span className="text-amber-600">{zScore}</span>
                    <span className="text-muted-foreground mx-1">:</span>
                    <span className="text-blue-600">{tScore}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">Продолжить →</p>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
