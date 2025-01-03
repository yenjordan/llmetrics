"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const MODELS = ["gpt-4", "llama-70b", "mixtral"];

export function ExperimentForm() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Record<string, any>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResults({}); // Clear previous results

    // Create a request for each model
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
              {isLoading ? "Testing..." : "Test LLMs"}
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
              {results[model] ? (
                <>
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Response:</h3>
                    <p className="text-sm">{results[model].response}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>
                      <p className="font-semibold">Response Time</p>
                      <p>{results[model].responseTime.toFixed(2)}s</p>
                    </div>
                    <div>
                      <p className="font-semibold">Total Tokens</p>
                      <p>{results[model].metrics?.tokenCount || 0}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Prompt Tokens</p>
                      <p>{results[model].metrics?.promptTokens || 0}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Completion Tokens</p>
                      <p>{results[model].metrics?.completionTokens || 0}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Cost</p>
                      <p>${results[model].metrics?.cost || 0}</p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">
                  {isLoading ? "Waiting for response..." : "No result yet"}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
