// app/page.tsx
"use client";

import { useState } from "react";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { Textarea } from "@/ui/textarea";
import { parseDevTask, type TaskBreakdown } from "./action";

const PRESET_PROMPTS = [
  {
    label: "Session Cookie Bug",
    text: "Spent 3 hours tracking down why 401 was thrown on /otp/generate. In dev HTTP browser drops secure:true cookies so session was missing. Changed auth config to conditional sameSite and secure flags.",
  },
  {
    label: "Redis Caching Invalidation",
    text: "Implemented redis cache for pending food spots queue. Added dynamic cache invalidation on spot approve/reject mutations so admin UI doesn't show stale feed data.",
  },
  {
    label: "Prisma Schema Drift",
    text: "Ran into 400 Bad Request on /get-food-spots because createdAt field in schema.prisma was never migrated to PostgreSQL. Ran prisma migrate dev and regenerated client.",
  },
];

export default function AIPlayground() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<TaskBreakdown | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExtract() {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const data = await parseDevTask(input);
      setResult(data);
    } catch (err: any) {
      setError(err?.message || "Failed to process text with Gemini");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12 font-sans selection:bg-muted">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b pb-5">
          <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground mb-1">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            STAGE_1 // STRUCTURED_OUTPUTS_PLAYGROUND
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Unstructured Text → Zod-Validated JSON
          </h1>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            Powered by Google Gemini 1.5 Flash + Vercel AI SDK (generateText +
            Output.object)
          </p>
        </div>

        {/* Presets & Input Section */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">
              Quick Test Cases:
            </span>
            {PRESET_PROMPTS.map((preset, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => setInput(preset.text)}
                className="font-mono text-xs h-7"
              >
                {preset.label}
              </Button>
            ))}
          </div>

          <Textarea
            className="w-full h-32 text-sm placeholder:text-muted-foreground font-mono leading-relaxed resize-none"
            placeholder="Paste any messy dev log, commit message, or unformatted work note here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <div className="flex items-center justify-between">
            <Button
              onClick={handleExtract}
              disabled={loading || !input.trim()}
              className="font-mono text-xs"
            >
              {loading ? (
                <>
                  <span className="size-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Parsing Schema...
                </>
              ) : (
                "Extract Structured Data →"
              )}
            </Button>

            {result && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setResult(null);
                  setInput("");
                }}
                className="text-xs font-mono text-muted-foreground"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-xs font-mono text-destructive">
            {error}
          </div>
        )}

        {/* Results Layout */}
        {result && (
          <div className="grid md:grid-cols-2 gap-6 pt-4 border-t">
            {/* Visual Structured Card */}
            <Card className="flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {result.category}
                  </Badge>
                  <Badge
                    variant={
                      result.priority === "CRITICAL" ||
                      result.priority === "HIGH"
                        ? "destructive"
                        : "secondary"
                    }
                    className="font-mono text-[10px]"
                  >
                    {result.priority}
                  </Badge>
                </div>
                <CardTitle className="text-base font-semibold mt-2">
                  {result.taskTitle}
                </CardTitle>
                <CardDescription className="font-mono text-xs text-muted-foreground">
                  Est. Duration:{" "}
                  <span className="text-emerald-500 font-bold">
                    {result.estimatedHours} hrs
                  </span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 text-xs font-mono">
                <div className="space-y-2">
                  <p className="text-muted-foreground font-semibold">
                    Subtasks:
                  </p>
                  <ul className="space-y-1.5 list-none p-0">
                    {result.subtasks?.map((step, i: number) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 bg-muted/50 p-3 rounded border border-border text-foreground text-xs"
                      >
                        <span className="text-emerald-500 font-bold shrink-0">
                          0{i + 1}.
                        </span>
                        <span className="break-words">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded p-3 text-amber-600 dark:text-amber-400">
                  <span className="font-bold">Risk / Edge Case: </span>
                  {result.riskNotes}
                </div>
              </CardContent>
            </Card>

            {/* Raw JSON Schema Output */}
            <Card className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Zod-Verified JSON Output
                  </CardTitle>
                  <span className="text-[10px] font-mono text-emerald-500 font-bold">
                    100% Typed
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <pre className="h-full p-3 bg-muted/40 rounded border text-emerald-600 dark:text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
