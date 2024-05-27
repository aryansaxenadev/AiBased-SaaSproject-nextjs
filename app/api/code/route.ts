import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";

// Configuration initialization
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openAi = new OpenAIApi(configuration);

// Instruction message
const instructionMessage: ChatCompletionRequestMessage = {
  role: "system",
  content: "You are a code generator. You must answer only in markdown code snippets. Use code comments for explanations.",
};

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { messages } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!messages) {
      return new NextResponse("Missing messages", { status: 400 });
    }

    const isPro = await checkSubscription();
    let retryCount = 0;

    while (true) {
      try {
        // Check API limit
        const isAllowed = await checkApiLimit();
        if (!isAllowed && !isPro) {
          return new NextResponse("API Limit Exceeded", { status: 403 });
        }

        // Call OpenAI API
        const response = await openAi.createChatCompletion({
          model: "gpt-3.5-turbo-1106",
          messages: [instructionMessage, ...messages],
        });

        // Increase API limit for non-pro users
        if (!isPro) {
          await increaseApiLimit();
        }

        return NextResponse.json(response.data.choices[0].message, { status: 200 });
      } catch (error: any) {
        if (error.response && error.response.status === 429 && retryCount < 5) {
          // Exponential backoff: Wait for an increasingly longer period before retrying
          const delay = Math.pow(2, retryCount) * 1000; // exponential backoff in milliseconds
          await new Promise((resolve) => setTimeout(resolve, delay));
          retryCount++;
        } else {
          // Log the error and return internal server error response
          console.error("[CODE_ERROR]", error);
          return new NextResponse("Internal Server Error", { status: 500 });
        }
      }
    }
  } catch (error: any) {
    // Log the error and return internal server error response
    console.error("[CODE_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
