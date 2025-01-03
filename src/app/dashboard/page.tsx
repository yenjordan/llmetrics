"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import AccuracyChart from "@/components/charts/AccuracyChart";
import RelevancyChart from "@/components/charts/RelevancyChart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
  const [analyticsData, setAnalyticsData] = useState({
    models: [],
    totalExperiments: 0,
    timeRange: { start: null, end: null },
  });

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((data) => setAnalyticsData(data));
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">LLM Performance Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Accuracy by Model</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <AccuracyChart data={analyticsData.models} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Relevancy Scores</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <RelevancyChart data={analyticsData.models} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response Times</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.models}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="modelName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="averageResponseTime"
                  stroke="#ffc658"
                  name="Response Time (s)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Analysis</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.models}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="modelName" />
                <YAxis />
                <Tooltip
                  formatter={(value) => {
                    if (typeof value === "number") {
                      return [`$${value.toFixed(6)}`, "Cost"];
                    }
                    return [value, "Cost"];
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="totalCost"
                  stroke="#ff7300"
                  name="Total Cost ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
