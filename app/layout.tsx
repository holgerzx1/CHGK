import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Что? Где? Когда?",
  description: "Веб-приложение для игры Что? Где? Когда?",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-background antialiased">
        <header className="border-b bg-card shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-6">
            <a href="/" className="text-xl font-bold text-primary">
              🦉 ЧГК
            </a>
            <nav className="flex gap-4 text-sm">
              <a href="/questions" className="text-muted-foreground hover:text-foreground transition-colors">
                Банк вопросов
              </a>
              <a href="/game/new" className="text-muted-foreground hover:text-foreground transition-colors">
                Новая игра
              </a>
              <a href="/history" className="text-muted-foreground hover:text-foreground transition-colors">
                История игр
              </a>
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
