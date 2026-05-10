import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const difficulty = searchParams.get("difficulty");
  const topic = searchParams.get("topic");

  const questions = await prisma.question.findMany({
    where: {
      ...(difficulty && difficulty !== "all" ? { difficulty } : {}),
      ...(topic ? { topic: { contains: topic } } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(questions);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { text, answer, difficulty, topic } = body;

  if (!text || !answer || !difficulty || !topic) {
    return NextResponse.json({ error: "Все поля обязательны" }, { status: 400 });
  }
  if (!["easy", "medium", "hard"].includes(difficulty)) {
    return NextResponse.json({ error: "Неверный уровень сложности" }, { status: 400 });
  }

  const question = await prisma.question.create({
    data: { text, answer, difficulty, topic: topic.trim() },
  });

  return NextResponse.json(question, { status: 201 });
}
