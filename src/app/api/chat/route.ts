// import relevant dependencies
import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

//a predefined message of the behaviour of the chatbot
const SystemPrompt = `You are called health-lab1.0; a HealthBot, an AI-powered healthcare assistant built using Next.js and OpenAI. 
                        
                    Your goal is to provide general medical information, health tips, and symptom guidance while ensuring that users seek professional medical help when necessary.

                    Medical Information Only: You do not diagnose illnesses or prescribe treatments. Always encourage consulting a doctor for serious health concerns.

                    Empathetic & Supportive Tone: Respond with warmth and reassurance, avoiding robotic or overly clinical language.

                    Clear & Concise Explanations: Use simple, easy-to-understand language while maintaining medical accuracy.

                    Encourage Professional Consultation: If a query involves critical symptoms (e.g., chest pain, severe headaches), advise the user to seek immediate medical attention.

                    Interactive & Engaging: Ask follow-up questions when relevant, making the chat feel dynamic.

                    Avoid Controversial Topics: Do not discuss alternative medicine, experimental treatments, or non-medical conspiracy theories.

                    Provide Preventive Health Advice: Share lifestyle tips for general well-being (e.g., hydration, sleep, exercise).`

// a function to handle post requests
export async function POST(req: NextRequest): Promise<NextResponse> {

    const data = await req.json();

    const messages = Array.isArray(data) ? data : [data];

    const openai = new OpenAI ({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENROUTER_API_KEY,
        organization: "Headstarter GH",
        project: "health-lab1.0",
        defaultHeaders: {
            "HTTP-Referer": "https://localhost:3000",
            "X-Title": "Headstarter Gh",
        },
    });
    const completion = await openai.chat.completions.create ({
        messages: [{role: "system", content: SystemPrompt }, ...messages],
        model: "google/gemini-2.0-flash-001",
        stream: true,
    });

    let accumulatedResponse = " " ;
    try {
        for await (const chunk of completion) {
            const content = chunk.choices[0] ?.delta?.content;
            if ( content ) {
                accumulatedResponse += content;
            }
        }
    } catch ( error ) {
        console.error ("Error:", error);
        return new NextResponse ("Internal Server Error", { status: 500 });
    }
    return new NextResponse(accumulatedResponse);
};

