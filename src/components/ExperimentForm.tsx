"use client";

import { useState } from "react";

const MODELS = ["llama-70b", "mixtral"];

const formatMarkdownText = (text: string) => {
  if (!text) return "";
  return text
    .split("\n")
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
      <div className="form-control">
        <label className="label">
          <span className="label-text">Test Prompt</span>
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt here..."
          className="textarea textarea-bordered min-h-[100px] bg-base-200 text-neutral-content"
        />
        <button className={`btn btn-primary ${isLoading ? "loading" : ""}`} onClick={handleSubmit}>
          {isLoading ? "Processing..." : "Submit"}
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {MODELS.map((model) => (
          <div key={model} className="card w-full bg-base-100 shadow-xl">
            <div className="card-header">
              <h2 className="card-title text-primary">{model}</h2>
            </div>
            <div className="card-body">
              {results[model]?.error ? (
                <p className="text-error">{results[model].error}</p>
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
                  <div className="grid grid-cols-2 gap-2 text-sm text-neutral-content">
                    <div>
                      <p className="font-semibold">Response Time</p>
                      <p>{results[model]?.responseTime?.toFixed(2) ?? "N/A"}s</p>
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
                      <p>{results[model]?.metrics?.completionTokens ?? "N/A"}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Cost</p>
                      <p>${results[model]?.metrics?.cost?.toFixed(6) ?? "N/A"}</p>
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
