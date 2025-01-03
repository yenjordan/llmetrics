import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY });
const groq = new Groq({ apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const COST_PER_1K_TOKENS: Record<string, number> = {
  "gpt-4": 0.03,
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
              text: `You are an AI evaluator. Rate this response on accuracy and relevancy.
            Original Prompt: "${prompt}"
            Response: "${response}"
            
            Score from 0-100 for:
            - Accuracy (factual correctness)
            - Relevancy (how well it addresses the prompt)
            
            Respond with ONLY a JSON object in this exact format:
            {"accuracy": <number>, "relevancy": <number>}`,
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

    if (model === "gpt-4") {
      const response = await openai.chat.completions.create({
        model: "chatgpt-4o-latest",
        messages: [{ role: "user", content: prompt }],
      });

      result = {
        modelName: "gpt-4",
        response: response.choices[0].message.content,
        responseTime: (Date.now() - startTime) / 1000,
        metrics: {
          tokenCount: response.usage?.total_tokens || 0,
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          cost: calculateTokenCost("gpt-4", response.usage?.total_tokens || 0),
        },
      };
    } else if (model === "llama-70b") {
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
              response: result.response,
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
