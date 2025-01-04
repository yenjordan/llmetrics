import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

const prisma = new PrismaClient();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const COST_PER_1K_TOKENS: Record<string, number> = {
  "llama-70b": 0.0001,
  mixtral: 0.0001,
};

async function evaluateResponse(prompt: string, response: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are a state-of-the-art AI evaluator tasked with analyzing the quality of responses based on the user's prompt. For each response, you must evaluate two key criteria: 1) Accuracy: how factually correct and precise the response is in addressing the user's query, and 2) Relevancy: how well the response aligns with the user's intent and provides meaningful, on-topic information. Provide a percentage for each criterion and assign a percentage anywhere between 0% to 100% (0 being the lowest and 100 being the highest).
            Original Prompt: "${prompt}"
            Response: "${response}"
            
            Provide a comprehensive evaluation based on the following:

            1. Accuracy: Assess the correctness of information provided, checking for factual errors, unsupported assumptions, or ambiguities. Consider the context of the prompt and the response's alignment with known facts.
            2. Relevancy: Evaluate how well the response directly addresses the user's query. Consider whether it is on-topic, aligns with the intended purpose, and avoids irrelevant details or digressions. Additionally, assess if the response provides actionable insights or information.

            Respond with ONLY a JSON object in the following exact format:
            {
              "accuracy": <percentage anywhere between 0 to 100>,
              "relevancy": <percentage anywhere between 0 to 100>
            }`,
            },
          ],
        },
      ],
    });

    const text = result.response.text().trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Evaluation Error:", error);
    return { accuracy: 0, relevancy: 0 };
  }
}

// const BASE_URL = process.env.VERCEL_URL
//   ? `https://${process.env.VERCEL_URL}`
//   : "http://localhost:3000";

function calculateTokenCost(model: string, tokenCount: number): number {
  return (tokenCount / 1000) * (COST_PER_1K_TOKENS[model] || 0);
}

export async function POST(req: Request) {
  try {
    const { prompt, model } = await req.json();
    let result;

    const startTime = Date.now();

    if (model === "llama-70b") {
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
      });

      result = {
        modelName: "llama-70b",
        response: response.choices[0]?.message?.content,
        responseTime: (Date.now() - startTime) / 1000,
        metrics: {
          tokenCount: response.usage?.total_tokens || 0,
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          cost: calculateTokenCost(
            "llama-70b",
            response.usage?.total_tokens || 0
          ),
        },
      };
    } else if (model === "mixtral") {
      const response = await groq.chat.completions.create({
        model: "mixtral-8x7b-32768",
        messages: [{ role: "user", content: prompt }],
      });

      result = {
        modelName: "mixtral",
        response: response.choices[0]?.message?.content,
        responseTime: (Date.now() - startTime) / 1000,
        metrics: {
          tokenCount: response.usage?.total_tokens || 0,
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          cost: calculateTokenCost(
            "mixtral",
            response.usage?.total_tokens || 0
          ),
        },
      };
    }

    if (!result) {
      throw new Error("No result generated");
    }

    const evaluation = await evaluateResponse(prompt, result.response || "");

    const experiment = await prisma.experiment.create({
      data: {
        prompt,
        results: {
          create: [
            {
              modelName: result.modelName,
              response: result.response || "",
              responseTime: result.responseTime,
              tokenCount: result.metrics.tokenCount,
              promptTokens: result.metrics.promptTokens,
              completionTokens: result.metrics.completionTokens,
              cost: result.metrics.cost,
              accuracy: evaluation.accuracy,
              relevancy: evaluation.relevancy,
            },
          ],
        },
      },
    });

    console.log("Experiment ID:", result);
    console.log("Experiment ID:", evaluation);
    return NextResponse.json({
      ...result,
      accuracy: evaluation.accuracy,
      relevancy: evaluation.relevancy,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
