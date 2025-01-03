"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const MODELS = ["gpt-4", "llama-70b", "mixtral"];

interface MarkdownTextFormatter {
  (text: string): string;
}
interface ResultType {
  response: string;
  responseTime: number;
  metrics: {
    tokenCount: number;
    promptTokens: number;
    completionTokens: number;
    cost: number;
  };
}

const formatMarkdownText: MarkdownTextFormatter = (text) => {
  if (!text) return "";

  return text
    .split("\n")
    .map((paragraph) => {
      let formatted = paragraph.replace(
        /\*\*(.*?)\*\*/g,
        '<span class="font-bold">$1</span>'
      );
      formatted = formatted.replace(
        /\*(.*?)\*/g,
        '<span class="italic">$1</span>'
      );
      return formatted;
    })
    .map((paragraph) => `<p class="mb-2">${paragraph}</p>`)
    .join("");
};

export function ExperimentForm() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Record<string, any>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResults({});

    const requests = MODELS.map(async (model) => {
      try {
        const response = await fetch("/api/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, model }),
        });

        const data = await response.json();
        setResults((prev) => ({
          ...prev,
          [model]: data,
        }));
      } catch (error) {
        console.error(`Error with ${model}:`, error);
        setResults((prev) => ({
          ...prev,
          [model]: { error: "Failed to get response" },
        }));
      }
    });

    await Promise.all(requests);
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Prompt</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt here..."
              className="min-h-[100px]"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Processing..." : "Submit"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {MODELS.map((model) => (
          <Card key={model}>
            <CardHeader>
              <CardTitle>{model}</CardTitle>
            </CardHeader>
            <CardContent>
              {results[model]?.error ? (
                <p className="text-red-500">{results[model].error}</p>
              ) : results[model] ? (
                <>
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Response:</h3>
                    <div
                      className="text-sm prose prose-slate max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: formatMarkdownText(results[model].response),
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>
                      <p className="font-semibold">Response Time</p>
                      <p>
                        {results[model]?.responseTime?.toFixed(2) ?? "N/A"}s
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">Total Tokens</p>
                      <p>{results[model]?.metrics?.tokenCount ?? "N/A"}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Prompt Tokens</p>
                      <p>{results[model]?.metrics?.promptTokens ?? "N/A"}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Completion Tokens</p>
                      <p>
                        {results[model]?.metrics?.completionTokens ?? "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">Cost</p>
                      <p>
                        ${results[model]?.metrics?.cost?.toFixed(6) ?? "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">Accuracy</p>
                      <p>{results[model]?.accuracy?.toFixed(2) ?? "N/A"}%</p>
                    </div>
                    <div>
                      <p className="font-semibold">Relevancy</p>
                      <p>{results[model]?.relevancy?.toFixed(2) ?? "N/A"}%</p>
                    </div>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
