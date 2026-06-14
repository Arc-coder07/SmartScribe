import { generateObject, generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { checkRateLimit } from '@/lib/api/rate-limit';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { prompt, type, vaultContext } = await req.json();

    const estimatedTokens = Math.ceil((prompt?.length || 0) / 4) + 1500; 
    const { allowed, remaining } = await checkRateLimit(estimatedTokens);

    if (!allowed) {
      return NextResponse.json({ error: `Rate limit exceeded. Remaining tokens: ${remaining}` }, { status: 429 });
    }

    const systemPrompt = `You are SmartScribe AI, a world-class business document generator.
    You have access to the following business knowledge vault context about this company:
    ---
    ${vaultContext || 'No specific vault context provided.'}
    ---
    Use this knowledge to personalize the document seamlessly without sounding robotic.`;

    if (type === 'health-score') {
      const result = await generateObject({
        model: groq('openai/gpt-oss-20b'),
        system: systemPrompt,
        prompt: `Analyze the following document and provide a health score and suggestions:\n\n${prompt}`,
        schema: z.object({
          score: z.number().min(0).max(100),
          metrics: z.object({
            professionalism: z.number().min(0).max(100),
            completeness: z.number().min(0).max(100),
            readability: z.number().min(0).max(100),
          }),
          suggestions: z.array(z.string()),
        }),
      });
      return NextResponse.json(result.object);
    }

    if (type === 'gap-detection') {
      const result = await generateObject({
        model: groq('openai/gpt-oss-20b'),
        system: systemPrompt,
        prompt: `Review this document and detect any critical business gaps, missing sections, or risks:\n\n${prompt}`,
        schema: z.object({
          gaps: z.array(z.object({
            id: z.string(),
            title: z.string(),
            description: z.string(),
            severity: z.enum(['high', 'medium', 'low']),
          }))
        }),
      });
      return NextResponse.json(result.object);
    }

    // Default: generate standard text document
    const result = await generateText({
      model: groq('openai/gpt-oss-20b'),
      system: systemPrompt,
      prompt: prompt,
    });

    return NextResponse.json({ content: result.text });
  } catch (error: any) {
    console.error('Generate API Error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during generation.' },
      { status: 500 }
    );
  }
}
