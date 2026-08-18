"use server"
import { prisma } from "@/lib/prisma";
import { google } from "@ai-sdk/google";
import { embed, generateText } from "ai";

export type SearchResult = {
    id:string;
    content:string;
    category:string;
    similarity:number;
}

export async function getEmbeddingVectorString(text:string):Promise<string>{
    const { embedding} = await embed({
        maxRetries:2,
        model:google.embeddingModel("gemini-embedding-001"),
        value:text,
        providerOptions:{
            google:{
                outputDimensionality:768
            }
        }
    })

    return `[${embedding.join(",")}]`
}

export async function insertDocument(formData:{content:string,category:string,}){
    
    const vectorString = await getEmbeddingVectorString(formData.content);
        await prisma.$executeRaw 
        `
        INSERT INTO "documents" ("id","content","category","embedding","createdAt")
        VALUES(gen_random_uuid(),${formData.content},${formData.category},${vectorString}::vector,NOW())
        `
    
    return {message:"Successfully seeded vector items into database"}

}


function contextualizeResults(result:SearchResult[]):string{
    return result.map(r=>r.content).join("\n---\n")
}

export async function searchDatabase(query:string , category:string):Promise<SearchResult[]>{
    if(!query.trim() || !category.trim()) return [];
    const queryVectorString = await getEmbeddingVectorString(query);
    const results = await prisma.$queryRaw<SearchResult[]>
        `
        SELECT id,content,category , similarity 
        FROM( 
            SELECT id,content,category,1-(embedding <=> ${queryVectorString}::vector) AS SIMILARITY
            FROM "documents"
        ) AS results
        WHERE similarity > 0.60
        AND (${category} = 'ALL' OR category = ${category})
        ORDER BY similarity DESC
        LIMIT 3
        `

    return results;
}

export async function generateOutput(results:SearchResult[],question:string):Promise<string>{
    const context = contextualizeResults(results);

    const {output} = await generateText({
        model:google("gemini-3.5-flash-lite"),
        prompt:`You're an expert at summarizing and is a concise and crisp answerer.
        Your job is to look at the context provided : ${context} and answer the question asked by the User :${question}
        You're strictly hereby supposed to answer in points when needed & not hallucinate at all. `
    })

    return output;
}