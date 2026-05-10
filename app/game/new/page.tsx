import { NewGameForm } from "@/components/game/NewGameForm";

export default function NewGamePage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Новая игра</h1>
        <p className="text-muted-foreground mt-1">
          Выберите вопросы, настройте команду и заполните данные для Чёрного ящика.
        </p>
      </div>
      <NewGameForm />
    </div>
  );
}
