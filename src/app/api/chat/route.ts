import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { checkRateLimit } from '@/lib/api/rate-limit';
import { buildAIContext, buildSystemPrompt } from '@/lib/ai/context-engine';
import { NextResponse } from 'next/server';

// Configure the Groq client using the OpenAI compatibility layer
const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages, documentContent } = await req.json();

    // Estimate tokens: roughly 4 chars per token. Very rough heuristic.
    // Adding 500 for the expected completion.
    const estimatedPromptLength = messages.reduce((acc: number, m: { content?: string }) => acc + (m.content?.length || 0), 0);
    const estimatedTokens = Math.ceil(estimatedPromptLength / 4) + 500; 

    // Check rate limits
    const { allowed, remaining } = await checkRateLimit(estimatedTokens);

    if (!allowed) {
      return NextResponse.json(
        { error: `Daily token limit exceeded. You have ${remaining} tokens remaining, but this request requires ~${estimatedTokens} tokens.` },
        { status: 429 }
      );
    }

    // Build full context from memory + vault
    const context = await buildAIContext({
      includeMemory: true,
      includeVault: true,
      documentContent,
    });

    const systemPrompt = buildSystemPrompt(context);

    const result = await streamText({
      model: groq('openai/gpt-oss-20b'),
      system: systemPrompt,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred during chat generation.';
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
