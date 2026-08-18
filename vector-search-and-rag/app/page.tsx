"use client";

import React, { useState } from "react";
import { searchDatabase, type SearchResult } from "./action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Sparkles, CheckCircle2 } from "lucide-react";
import { InsertDocumentForm } from "@/components/insert-document";
import { generateOutput } from "./action";

export enum Category {
  ALL="ALL",
  TECH="TECH",
  APPAREL="APPAREL",
  ENGINEERING="ENGINEERING"
}

export default function VectorSearchPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>(Category.ALL);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [seedStatus, setSeedStatus] = useState("");
  const [output , setOutput] = useState("");


  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const data = await searchDatabase(query, category);
      setResults(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateOutput(){
    
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Semantic Vector Search
          </h1>
          <p className="text-sm text-muted-foreground">
            Hybrid search combining pgvector cosine similarity with relational SQL filters.
          </p>
        </div>
      </div>

      <div className="w-180 h-70 ">
        <InsertDocumentForm/>
      </div>

      {seedStatus && (
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-2.5 rounded-md">
          <CheckCircle2 className="w-4 h-4" />
          {seedStatus}
        </div>
      )}

      {/* Search Bar & Category Filter */}
      <form onSubmit={handleSearch} className="flex gap-2 mt-15">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., 'warm clothing for sub-zero weather' or 'cookie auth error'..."
          className="flex-1"
        />

        <Select value={category} onValueChange={(value)=>setCategory(value as Category)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            <SelectItem value="APPAREL">Apparel</SelectItem>
            <SelectItem value="TECH">Tech</SelectItem>
            <SelectItem value="ENGINEERING">Engineering</SelectItem>
          </SelectContent>
        </Select>

        <Button type="submit" disabled={loading}>
          <Search className="w-4 h-4 mr-2" />
          {loading ? "Searching..." : "Search"}
        </Button>
      </form>

      {/* Results Container */}
      <div className="space-y-3">
        {loading && (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        )}

        {!loading &&
          results.map((item) => (
            <Card key={item.id} className="transition-all hover:border-primary/50">
              <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
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
              <CardContent className="py-2 px-4 pb-4">
                <p className="text-sm text-foreground leading-relaxed">{item.content}</p>
              </CardContent>
            </Card>
          ))}

        {!loading && results.length === 0 && query && (
          <div className="text-center py-12 text-sm text-muted-foreground border border-dashed rounded-lg">
            No matching documents found for this query in the selected category.
          </div>
        )}
      </div>
    </main>
  );
}