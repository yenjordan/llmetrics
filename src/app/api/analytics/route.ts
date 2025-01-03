import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const results = await prisma.result.findMany({
      include: {
        experiment: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const modelMetrics = results.reduce(
      (acc: { [key: string]: any }, result) => {
        const model = result.modelName;
        if (!acc[model]) {
          acc[model] = {
            totalAccuracy: 0,
            totalRelevancy: 0,
            totalResponseTime: 0,
            totalCost: 0,
            totalTokens: 0,
            count: 0,
            responses: [],
          };
        }

        acc[model].totalAccuracy += result.accuracy || 0;
        acc[model].totalRelevancy += result.relevancy || 0;
        acc[model].totalResponseTime += result.responseTime;
        acc[model].totalCost += result.cost || 0;
        acc[model].totalTokens += result.tokenCount || 0;
        acc[model].count += 1;
        acc[model].responses.push({
          timestamp: result.createdAt,
          accuracy: result.accuracy,
          relevancy: result.relevancy,
          responseTime: result.responseTime,
          cost: result.cost,
          tokens: result.tokenCount,
        });

        return acc;
      },
      {}
    );

    // Format data for dashboard
    const analyticsData = Object.entries(modelMetrics).map(([model, data]) => ({
      modelName: model,
      averageAccuracy: data.totalAccuracy / data.count,
      averageRelevancy: data.totalRelevancy / data.count,
      averageResponseTime: data.totalResponseTime / data.count,
      totalCost: data.totalCost,
      averageTokens: data.totalTokens / data.count,
      responseHistory: data.responses,
      totalResponses: data.count,
    }));

    return NextResponse.json({
      models: analyticsData,
      totalExperiments: results.length,
      timeRange: {
        start: results[results.length - 1]?.createdAt,
        end: results[0]?.createdAt,
      },
    });
  } catch (error) {
    console.error("Analytics API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
