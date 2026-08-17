"use server"
import { google } from "@ai-sdk/google"
import { generateText, Output } from "ai";
import z from 'zod';

const TaskBreakdownSchema = z.object({
	taskTitle: z.string().describe("Clean , client-ready summary title"),
	estimatedHours: z
		.number()
		.describe("Realistic dev hours between 0.5 and 0.8"),
	category: z.enum(["FRONTEND", "BACKEND", "DATABASE", "DEVOPS"]),
  subtasts: z.array(z.string()).describe("3-4 technical implementation steps"),
	riskNotes: z.string().describe("1 sentence regarding potential edge cases or bugs"),
});

export type TaskBreakdown = z.infer<typeof TaskBreakdownSchema>;

export async function parseDevTask(input: string): Promise<TaskBreakdown> {


  if (!input.trim() || input.length === 0 || input === null || undefined) {
    throw new Error("Input text cannot be empty");
  }
  
  const { output } = await generateText({
    model: google("gemini-3.5-flash-lite"),
    output: Output.object({
      schema:TaskBreakdownSchema,
    }),
    prompt:`Analyze this messy developer work log and extract structured data: "${input}"`
  })

  return output;
}



