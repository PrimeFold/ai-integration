import { google } from "@ai-sdk/google";
import { cosineSimilarity, embed, embedMany } from "ai";
import { prisma } from "@/lib/prisma";

async function getEmbedding(text: string) {
  const { embedding } = await embed({
    model: google.embeddingModel("gemini-embedding-001"),
    value: text,
    providerOptions: {
      google: {
        outputDimensionality: 768,
      },
    }
  });
  return `[${embedding.join(",")}]`;
}

async function main() {
  console.log("1. Seeding items into PostgreSQL...\n");
  const sampleArticles = [
    {
      text: "Heavyweight fleece hoodie and insulated jacket for freezing winter",
      category: "APPAREL",
    },
    {
      text: "Breathable linen shirt and cotton shorts for hot summer beach days",
      category: "APPAREL",
    },
    {
      text: "Budget Android smartphone with 5000mAh battery and fast charging",
      category: "TECH",
    },
    {
      text: "Fixing 401 unauthorized errors by setting secure cookie flags in Next.js",
      category: "CODE",
    },
  ];

  for (const item of sampleArticles) {
    const vector = await getEmbedding(item.text);
    await prisma.$executeRaw`
      INSERT INTO "documents" ("id", "content", "category", "embedding", "createdAt")
      VALUES (
        gen_random_uuid(),
        ${item.text},
        ${item.category},
        ${vector}::vector,
        NOW()
      )`;
    console.log(` Inserted: "${item.text.slice(0, 45)}..."`);
  }
  console.log("\n---------------------------------------------------------");
  console.log("2. Running Vector Similarity Search directly in PostgreSQL\n");
  const userQuery = "warm clothes for cold weather";
  console.log(`User Query: "${userQuery}"\n`);
  const queryVector = await getEmbedding(userQuery);

  const results = await prisma.$queryRaw<
    Array<{ id: string; content: string; category: string; similarity: number }> //This raw query will return search results based upon embedding.
  >`
      SELECT
      id,
      content,
      category, 1 - (embedding <=> ${queryVector}::vector) AS similarity
      FROM "documents"
      ORDER BY embedding <=> ${queryVector}::vector
      LIMIT 2;
    `;
  console.log("Top Database Matches:");
  results.forEach((row, i) => {
    console.log(
      `${i + 1}. [${(row.similarity * 100).toFixed(2)}% Match] (${row.category})`,
    );
    console.log(`   "${row.content}"\n`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
