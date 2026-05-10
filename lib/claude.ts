import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface BlitzQuestion {
  question: string;
  answer: string;
}

export async function generateBlitzQuestions(): Promise<BlitzQuestion[]> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    tools: [
      {
        name: "generate_blitz_questions",
        description: "Generate blitz round questions",
        input_schema: {
          type: "object" as const,
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  answer: { type: "string" },
                },
                required: ["question", "answer"],
              },
              minItems: 5,
              maxItems: 5,
            },
          },
          required: ["questions"],
        },
      },
    ],
    tool_choice: { type: "auto" },
    messages: [
      {
        role: "user",
        content:
          "Придумай 5 коротких вопросов для блиц-раунда игры «Что? Где? Когда?» на русском языке. " +
          "Темы: история, наука, культура, география, литература (по одной теме). " +
          "Ответы должны быть краткими (1–3 слова). " +
          "Вопросы должны быть интересными и подходящими для образованной аудитории.",
      },
    ],
  });

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude did not return tool use response");
  }

  const input = toolUse.input as { questions: BlitzQuestion[] };
  return input.questions;
}

export async function generateBlackBoxQuestion(
  itemName: string,
  description: string
): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content:
          `Ты ведущий программы «Что? Где? Когда?». Ведущий положил в Чёрный ящик предмет и рассказал историю.\n` +
          `Создай красивый, интригующий, метафоричный вопрос в традиции передачи — ` +
          `НЕ называй предмет напрямую, используй образы и намёки из истории. ` +
          `Вопрос должен заканчиваться словами «Что в чёрном ящике?»\n\n` +
          `История от ведущего: ${description}\n` +
          `Предмет: ${itemName}\n\n` +
          `Верни только текст вопроса, без пояснений и лишних слов.`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude did not return text response");
  }
  return textBlock.text.trim();
}
