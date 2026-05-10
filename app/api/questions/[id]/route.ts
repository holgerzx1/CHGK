import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const question = await prisma.question.findUnique({ where: { id: Number(id) } });
  if (!question) return NextResponse.json({ error: "Вопрос не найден" }, { status: 404 });
  return NextResponse.json(question);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { text, answer, difficulty, topic } = body;

  if (difficulty && !["easy", "medium", "hard"].includes(difficulty)) {
    return NextResponse.json({ error: "Неверный уровень сложности" }, { status: 400 });
  }

  const question = await prisma.question.update({
    where: { id: Number(id) },
    data: {
      ...(text && { text }),
      ...(answer && { answer }),
      ...(difficulty && { difficulty }),
      ...(topic && { topic: topic.trim() }),
    },
  });

  return NextResponse.json(question);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);

  const usedInRound = await prisma.gameRound.findFirst({ where: { questionId: numId } });
  if (usedInRound) {
    return NextResponse.json(
      { error: "Вопрос используется в игре и не может быть удалён" },
      { status: 409 }
    );
  }

  await prisma.question.delete({ where: { id: numId } });
  return NextResponse.json({ success: true });
}
