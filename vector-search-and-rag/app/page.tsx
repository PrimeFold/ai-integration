"use client";

import React, { useState } from "react";
import { searchDatabase, generateOutput, type SearchResult } from "./action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Sparkles, Bot, Loader2, Send } from "lucide-react";
import { InsertDocumentForm } from "@/components/insert-document";
import ReactMarkdown from "react-markdown";


export enum Category {
  ALL = "ALL",
  TECH = "TECH",
  APPAREL = "APPAREL",
  ENGINEERING = "ENGINEERING",
}

export default function VectorSearchPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>(Category.ALL);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [output, setOutput] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setOutput(""); // Reset previous answer on new search
    try {
      const data = await searchDatabase(query, category);
      setResults(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateOutput() {
    if (!query.trim() || results.length === 0) return;
    setGenerating(true);
    try {
      const response = await generateOutput(results, query);
      if (response?.error && !response.output) {
        throw new Error(response.error);
      }
      setOutput(response.output || "");
    } catch (error) {
      console.error((error as Error).message);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Semantic Vector Search & RAG
        </h1>
        <p className="text-sm text-muted-foreground">
          Hybrid search combining pgvector cosine similarity with relational SQL filters.
        </p>
      </div>

      {/* Insert Form */}
      <div>
        <InsertDocumentForm />
      </div>

      {/* Search Bar & Category Filter */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., 'warm clothing for sub-zero weather' or 'cookie auth error'..."
          className="flex-1"
        />

        <Select value={category} onValueChange={(value) => setCategory(value as Category)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={Category.ALL}>All Categories</SelectItem>
            <SelectItem value={Category.APPAREL}>Apparel</SelectItem>
            <SelectItem value={Category.TECH}>Tech</SelectItem>
            <SelectItem value={Category.ENGINEERING}>Engineering</SelectItem>
          </SelectContent>
        </Select>

        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
          Search
        </Button>
      </form>

      {/* Loading Skeletons */}
      {loading && (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      )}

      {/* Generated AI Answer Output */}
      {output && (
        <Card className="border-primary/40 bg-primary/5 shadow-sm">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b border-primary/10">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary">
              <Bot className="w-4 h-4" />
              Synthesized Answer
            </CardTitle>
            <Badge variant="outline" className="text-[10px] font-mono">
              Grounded Context
            </Badge>
          </CardHeader>
          <CardContent className="py-3 px-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
               <ReactMarkdown>{output}</ReactMarkdown>
              </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results List */}
      {!loading && results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Retrieved Context ({results.length} matches)
            </h2>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleGenerateOutput}
              disabled={generating}
            >
              {generating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Synthesizing...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Answer with Gemini
                </>
              )}
            </Button>
          </div>

          {results.map((item) => (
            <Card key={item.id} className="transition-all hover:border-primary/50">
              <CardHeader className="py-2.5 px-4 flex flex-row items-center justify-between space-y-0">
                <Badge variant="secondary" className="font-mono text-xs">
                  {item.category}
                </Badge>
                <Badge
                  variant={item.similarity > 0.75 ? "default" : "outline"}
                  className="font-mono text-xs"
                >
                  {(item.similarity * 100).toFixed(1)}% Match
                </Badge>
              </CardHeader>
              <CardContent className="py-2 px-4 pb-3">
                <p className="text-sm text-foreground leading-relaxed">{item.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && results.length === 0 && query && (
        <div className="text-center py-12 text-sm text-muted-foreground border border-dashed rounded-lg">
          No matching documents found for this query in the selected category.
        </div>
      )}
    </main>
  );
}