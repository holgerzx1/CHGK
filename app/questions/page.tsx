import { QuestionBank } from "@/components/questions/QuestionBank";

export default function QuestionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Банк вопросов</h1>
        <p className="text-muted-foreground mt-1">
          Управляйте вопросами для игры. Для одной игры нужно 5 вопросов: 2 лёгких, 2 средних, 1 сложный.
        </p>
      </div>
      <QuestionBank />
    </div>
  );
}
