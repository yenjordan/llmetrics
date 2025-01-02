'use client';

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
        setResults(prev => ({
          ...prev,
          [model]: data
        }));
      } catch (error) {
        console.error(`Error with ${model}:`, error);
        setResults(prev => ({
          ...prev,
          [model]: { error: 'Failed to get response' }
        }));
      }
    });

    await Promise.all(requests);
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">LLM Evaluation Platform</h1>

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
                  <p>{results[model].response}</p>
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Response Time: {results[model].responseTime}s</p>
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