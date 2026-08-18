
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { insertDocument } from "@/app/action";

interface InsertDocumentFormProps {
  onDocumentAdded?: () => void;
}

export function InsertDocumentForm({ onDocumentAdded }: InsertDocumentFormProps) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<string>("TECH");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setStatus(null);

    try {
      const res = await insertDocument({content,category});
      setStatus({ type: "success", message: "Vector generated and stored in PostgreSQL!" });
      setContent(""); // Reset form input
      onDocumentAdded?.();
      
    } catch (err) {
      setStatus({ type: "error", message: "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border border-border/80 bg-card/50 shadow-sm">
      <CardHeader className="py-4 px-6 border-b">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-primary" />
          Add Custom Vector Document
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Category Dropdown */}
            <div className="md:col-span-1 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <Select value={category} onValueChange={setCategory} disabled={loading}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TECH">Tech</SelectItem>
                  <SelectItem value="APPAREL">Apparel</SelectItem>
                  <SelectItem value="ENGINEERING">Engineering</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Document Content Textarea */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Document Content / Description</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="e.g., 'Ergonomic split mechanical keyboard with OLED display and wireless Bluetooth'..."
                rows={2}
                disabled={loading}
                className="resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {/* Status Message */}
            <div className="text-xs font-mono">
              {status?.type === "success" && (
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {status.message}
                </span>
              )}
              {status?.type === "error" && (
                <span className="flex items-center gap-1.5 text-destructive">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {status.message}
                </span>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" size="sm" disabled={loading || !content.trim()}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Embedding & Storing...
                </>
              ) : (
                "Embed & Store Vector"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}