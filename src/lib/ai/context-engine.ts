import { createClient as createServerSupabase } from '@/lib/supabase/server';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ContextOptions {
  includeMemory?: boolean;
  includeVault?: boolean;
  templateId?: string;
  clientId?: string;
  documentContent?: string;
}

// ─── Context Engine ─────────────────────────────────────────────────────────
// Compiles all business context (memory, vault, template, client) into a
// structured prompt for AI generation. This is the backbone of SmartScribe's
// personalization — every AI call should go through this.

export async function buildAIContext(options: ContextOptions = {}): Promise<string> {
  const {
    includeMemory = true,
    includeVault = true,
    templateId,
    clientId,
    documentContent,
  } = options;

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return '';

  const sections: string[] = [];

  // ─── Business Memory ────────────────────────────────────────────────────
  if (includeMemory) {
    const { data: memoryData } = await supabase
      .from('memory_entries')
      .select('category, key, value')
      .eq('user_id', user.id)
      .order('category');

    if (memoryData && memoryData.length > 0) {
      const grouped = memoryData.reduce((acc: Record<string, { key: string; value: string }[]>, entry) => {
        if (!acc[entry.category]) acc[entry.category] = [];
        acc[entry.category].push({ key: entry.key, value: entry.value });
        return acc;
      }, {});

      const memoryLines = Object.entries(grouped).map(([category, items]) => {
        const lines = items.map((item) => `  - ${item.key}: ${item.value}`).join('\n');
        return `[${category.charAt(0).toUpperCase() + category.slice(1)}]\n${lines}`;
      });

      sections.push(`=== BUSINESS MEMORY (Company Knowledge) ===\n${memoryLines.join('\n\n')}\n=== END BUSINESS MEMORY ===`);
    }
  }

  // ─── Knowledge Vault ────────────────────────────────────────────────────
  if (includeVault) {
    const { data: vaultData } = await supabase
      .from('vault_entries')
      .select('category, title, content')
      .eq('user_id', user.id)
      .order('category');

    if (vaultData && vaultData.length > 0) {
      const vaultLines = vaultData.map((entry) =>
        `[${entry.category}] ${entry.title}: ${entry.content}`
      );

      sections.push(`=== KNOWLEDGE VAULT ===\n${vaultLines.join('\n')}\n=== END KNOWLEDGE VAULT ===`);
    }
  }

  // ─── Template ───────────────────────────────────────────────────────────
  if (templateId) {
    const { data: template } = await supabase
      .from('templates')
      .select('name, content, variables, type')
      .eq('id', templateId)
      .single();

    if (template) {
      sections.push(`=== TEMPLATE ===\nTemplate Name: ${template.name}\nType: ${template.type}\nTemplate Content:\n${template.content}\n\nVariables to fill: ${JSON.stringify(template.variables)}\n=== END TEMPLATE ===`);
    }
  }

  // ─── Client Context ─────────────────────────────────────────────────────
  if (clientId) {
    const { data: client } = await supabase
      .from('clients')
      .select('name, company, email, notes')
      .eq('id', clientId)
      .single();

    if (client) {
      sections.push(`=== CLIENT CONTEXT ===\nClient Name: ${client.name}\nCompany: ${client.company || 'N/A'}\nEmail: ${client.email || 'N/A'}\nNotes: ${client.notes || 'None'}\n=== END CLIENT CONTEXT ===`);
    }
  }

  // ─── Current Document ───────────────────────────────────────────────────
  if (documentContent) {
    // Truncate very long documents to avoid token limits
    const truncated = documentContent.length > 8000
      ? documentContent.substring(0, 8000) + '\n... [document truncated for context]'
      : documentContent;

    sections.push(`=== CURRENT DOCUMENT ===\n${truncated}\n=== END CURRENT DOCUMENT ===`);
  }

  return sections.join('\n\n');
}

// ─── System Prompt Builder ──────────────────────────────────────────────────

export function buildSystemPrompt(context: string, taskType?: string): string {
  const basePrompt = `You are SmartScribe AI, a world-class business document intelligence engine.
You generate, improve, and analyze professional business documents with exceptional quality.
You always maintain a highly professional, expert tone.
Format responses cleanly with markdown, bullet points, and headers where applicable.`;

  const contextSection = context
    ? `\n\nYou have access to the following business knowledge about this company. Use it naturally to personalize documents — never sound robotic or templated:\n\n${context}`
    : '';

  const taskInstructions: Record<string, string> = {
    'generate-from-template': `\n\nYou are generating a document from a template. Fill in all template variables with the company's actual data. Maintain the template's structure but make the content feel custom and personalized, not generic.`,
    'generate-from-prompt': `\n\nGenerate a complete, professional business document based on the user's prompt. Use the business memory to personalize it with real company details, pricing, services, and brand voice.`,
    'improve-document': `\n\nYou are improving an existing document. Enhance professionalism, clarity, and impact while maintaining the original intent. Use the business memory to add relevant details and ensure brand voice consistency.`,
    'health-score': `\n\nAnalyze the document and provide a detailed health score assessment. Be specific about what works well and what needs improvement.`,
    'gap-detection': `\n\nReview the document and identify critical gaps, missing sections, risks, or areas that need attention. Be specific and provide actionable suggestions.`,
    'summary': `\n\nGenerate a professional summary based on the provided information. Keep it concise but comprehensive.`,
  };

  return basePrompt + contextSection + (taskType ? taskInstructions[taskType] || '' : '');
}
