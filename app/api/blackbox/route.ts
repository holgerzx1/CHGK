import { NextRequest, NextResponse } from "next/server";
import { generateBlackBoxQuestion } from "@/lib/claude";

export async function POST(req: NextRequest) {
  const { itemName, description } = await req.json();

  if (!itemName || !description) {
    return NextResponse.json({ error: "Укажите предмет и историю" }, { status: 400 });
  }

  const question = await generateBlackBoxQuestion(itemName, description);
  return NextResponse.json({ question });
}
