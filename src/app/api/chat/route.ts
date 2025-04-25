import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

const SystemPrompt = `You are called health-lab1.0...`; // Same as yours

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!process.env.OPENROUTER_API_KEY) {
    console.error("Missing OpenRouter API Key!");
    return new NextResponse("Server configuration error", { status: 500 });
  }

  const data = await req.json();
  const messages = Array.isArray(data) ? data : [data];

  const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    organization: "Headstarter GH",
    project: "health-lab1.0",
    defaultHeaders: {
      "HTTP-Referer": "https://health-labs-three.vercel.app/",
      "X-Title": "Headstarter Gh",
    },
  });

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: SystemPrompt }, ...messages],
      model: "gpt-3.5-turbo",
      stream: false,
    });

    const content = completion.choices[0]?.message?.content ?? "I'm sorry, I couldn't generate a response.";
    return new NextResponse(content);
  } catch (error) {
    console.error("Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
