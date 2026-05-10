interface ScoreBoardProps {
  znatokScore: number;
  teleScore: number;
  teamName: string;
  currentRound?: number;
}

export function ScoreBoard({ znatokScore, teleScore, teamName, currentRound }: ScoreBoardProps) {
  return (
    <div className="flex items-center justify-center gap-6 py-4">
      <div className="text-center">
        <div className="text-xs text-muted-foreground mb-1">Знатоки</div>
        <div className="text-3xl font-bold text-primary">{znatokScore}</div>
        <div className="text-xs text-muted-foreground mt-1 max-w-[120px] truncate">{teamName}</div>
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="text-muted-foreground font-bold text-xl">:</span>
        {currentRound && (
          <span className="text-xs text-muted-foreground">Раунд {currentRound}/6</span>
        )}
      </div>

      <div className="text-center">
        <div className="text-xs text-muted-foreground mb-1">Телезрители</div>
        <div className="text-3xl font-bold text-blue-600">{teleScore}</div>
      </div>
    </div>
  );
}
