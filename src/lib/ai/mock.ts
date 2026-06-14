import type {
  GenerationRequest,
  AISuggestion,
  HealthScore,
  GapDetection,
} from '@/lib/types';

// ─── Helpers ────────────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const uid = () => Math.random().toString(36).substring(2, 10);

// ─── Generate Document ─────────────────────────────────────────────────────

export async function generateDocument(request: GenerationRequest): Promise<string> {
  await delay(500);

  const templates: Record<string, string> = {
    proposal: `# ${request.type === 'proposal' ? 'Business Proposal' : 'Document'}\n\n## Prepared for ${request.clientName}\n**Prepared by:** TechVenture Solutions\n**Date:** ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\n\n---\n\n## Executive Summary\n\nTechVenture Solutions is pleased to present this proposal to ${request.clientName} for ${request.objectives}. With deep expertise in the ${request.industry} sector and a proven track record of delivering measurable results, we are uniquely positioned to help your organization achieve its strategic goals.\n\n## Understanding Your Needs\n\nBased on our discovery conversations, ${request.clientName} is looking to:\n- Modernize existing systems to improve operational efficiency\n- Enhance customer experience through data-driven personalization\n- Build a scalable technology foundation for future growth\n- Reduce time-to-market for new product features\n\n## Proposed Solution\n\n### Phase 1: Discovery & Strategy (Weeks 1–3)\n- Stakeholder interviews and requirements gathering\n- Current-state technology assessment\n- Solution architecture and roadmap development\n- Risk assessment and mitigation planning\n\n### Phase 2: Design & Development (Weeks 4–12)\n- UI/UX design with iterative prototyping\n- Agile development in 2-week sprints\n- Continuous integration and automated testing\n- Bi-weekly demo sessions with your team\n\n### Phase 3: Launch & Optimize (Weeks 13–16)\n- Staged rollout with monitoring\n- Performance optimization and load testing\n- Team training and knowledge transfer\n- 30-day post-launch support\n\n## Investment\n\nTotal project investment: $[TBD based on final scope]\n\nPayment schedule:\n- 30% upon SOW execution\n- 40% at Phase 2 midpoint\n- 30% upon project completion\n\n## Why TechVenture\n\n- **${request.industry} expertise** with 15+ successful engagements in your sector\n- **Proven methodology** delivering 94% on-time project completion\n- **Full-stack capability** from strategy through implementation and support\n- **Transparent partnership** with real-time project health dashboards\n\nWe look forward to discussing this proposal with you and tailoring it to your specific needs.\n\n${request.additionalContext ? `\n## Additional Context\n\n${request.additionalContext}` : ''}`,

    invoice: `# Invoice\n\n**From:** TechVenture Solutions LLC\n742 Innovation Drive, Suite 400\nSan Francisco, CA 94105\n\n**To:** ${request.clientName}\n\n**Invoice Date:** ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\n**Due Date:** ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\n**Payment Terms:** Net 30\n\n---\n\n## Line Items\n\n| Description | Hours | Rate | Amount |\n|---|---|---|---|\n| ${request.objectives} | — | — | $[TBD] |\n\n**Subtotal:** $[TBD]\n**Tax:** $0.00\n**Total Due:** $[TBD]\n\n---\n\n**Payment Methods:**\n- Wire Transfer: Wells Fargo, Acct #XXXX-4521\n- ACH: Same details as wire\n- Check: Payable to TechVenture Solutions LLC\n\nThank you for your business.`,

    contract: `# Service Agreement\n\n**Between:** TechVenture Solutions LLC ("Provider")\n**And:** ${request.clientName} ("Client")\n**Effective Date:** ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\n\n---\n\n## 1. Scope of Services\n\nProvider shall deliver ${request.objectives} as further detailed in attached Statements of Work.\n\n## 2. Term\n\nThis Agreement is effective for 12 months from the Effective Date and shall automatically renew for successive 12-month periods unless either party provides 60 days written notice of non-renewal.\n\n## 3. Fees & Payment\n\nFees shall be specified in each SOW. All invoices are due Net 30 from date of issuance.\n\n## 4. Intellectual Property\n\nAll work product shall become the property of Client upon full payment. Provider retains rights to pre-existing intellectual property.\n\n## 5. Confidentiality\n\nBoth parties agree to maintain confidentiality of proprietary information for 3 years following termination.\n\n## 6. Limitation of Liability\n\nProvider's total liability shall not exceed fees paid in the 12 months preceding any claim.\n\n## 7. Termination\n\nEither party may terminate with 30 days written notice. Outstanding SOWs survive termination until completion.\n\n---\n\n**Provider:** TechVenture Solutions LLC\nSignature: _________________________\nDate: _________________________\n\n**Client:** ${request.clientName}\nSignature: _________________________\nDate: _________________________`,

    report: `# Project Report\n\n**Prepared for:** ${request.clientName}\n**Date:** ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\n**Prepared by:** TechVenture Solutions\n\n---\n\n## Executive Summary\n\nThis report provides an overview of ${request.objectives} within the ${request.industry} sector. Key findings and recommendations are detailed below.\n\n## Key Metrics\n\n| Metric | Value | Trend |\n|---|---|---|\n| Project Completion | —% | — |\n| Budget Utilization | —% | — |\n| Quality Score | —/100 | — |\n\n## Findings\n\n[Detailed findings to be populated based on data analysis]\n\n## Recommendations\n\n1. [Recommendation 1]\n2. [Recommendation 2]\n3. [Recommendation 3]\n\n## Next Steps\n\n- [Action item 1 — Owner — Due date]\n- [Action item 2 — Owner — Due date]`,

    'business-plan': `# Business Plan\n\n## ${request.companyName}\n**Industry:** ${request.industry}\n**Date:** ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\n\n---\n\n## Vision\n\n${request.objectives}\n\n## Market Opportunity\n\nThe ${request.industry} market represents a significant opportunity for growth and innovation. Current market size and projected trends indicate strong demand for modern solutions.\n\n## Product / Service\n\n[Detail your core offerings, value proposition, and competitive advantages]\n\n## Go-to-Market Strategy\n\n- **Target Segments:** [Define primary and secondary segments]\n- **Channels:** [Direct sales, partnerships, digital marketing]\n- **Pricing:** [Pricing model and strategy]\n\n## Financial Projections\n\n| Year | Revenue | Expenses | Net |\n|---|---|---|---|\n| Year 1 | — | — | — |\n| Year 2 | — | — | — |\n| Year 3 | — | — | — |\n\n## Team\n\n[Key team members and their relevant experience]\n\n## Risks & Mitigations\n\n[Identify key risks and planned countermeasures]`,

    'client-update': `# Project Status Update\n\n**Client:** ${request.clientName}\n**Project:** ${request.objectives}\n**Date:** ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\n**Status:** 🟢 On Track\n\n---\n\n## Summary\n\nHere is the latest progress update on the project.\n\n## Completed This Period\n\n- ✅ [Completed item 1]\n- ✅ [Completed item 2]\n- ✅ [Completed item 3]\n\n## In Progress\n\n- 🔲 [In-progress item 1]\n- 🔲 [In-progress item 2]\n\n## Risks & Blockers\n\n| Risk | Severity | Mitigation |\n|---|---|---|\n| [Risk description] | [Low/Med/High] | [Mitigation plan] |\n\n## Budget\n\n- **Total Budget:** $[amount]\n- **Spent to Date:** $[amount] ([x]%)\n- **Remaining:** $[amount]\n\n---\n\n*Next update: [date]*`,

    'meeting-summary': `# Meeting Summary\n\n**Date:** ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\n**Attendees:** [List attendees]\n**Duration:** [Duration]\n\n---\n\n## Agenda\n\n1. [Topic 1]\n2. [Topic 2]\n3. [Topic 3]\n\n## Discussion Notes\n\n### [Topic 1]\n[Key points discussed]\n\n### [Topic 2]\n[Key points discussed]\n\n## Action Items\n\n| Action | Owner | Due Date |\n|---|---|---|\n| [Action 1] | [Owner] | [Date] |\n| [Action 2] | [Owner] | [Date] |\n\n## Next Meeting\n\n**Date:** [date]\n**Agenda Preview:** [topics]`,

    'project-doc': `# Project Documentation\n\n**Project:** ${request.objectives}\n**Client:** ${request.clientName}\n**Last Updated:** ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\n\n---\n\n## Overview\n\n[Project description and goals]\n\n## Architecture\n\n[System architecture overview]\n\n## Technical Stack\n\n- **Frontend:** [technologies]\n- **Backend:** [technologies]\n- **Infrastructure:** [technologies]\n\n## Setup Instructions\n\n1. [Step 1]\n2. [Step 2]\n3. [Step 3]\n\n## API Reference\n\n[Endpoint documentation]\n\n## Deployment\n\n[Deployment procedures and environments]`,
  };

  return templates[request.type] || templates.proposal;
}

// ─── Get Suggestions ────────────────────────────────────────────────────────

export function getSuggestions(documentId: string): AISuggestion[] {
  const suggestionSets: Record<string, AISuggestion[]> = {
    'doc-001': [
      {
        id: `sug-${uid()}`,
        type: 'wording',
        title: 'Strengthen Opening Statement',
        description: 'The executive summary uses passive voice. Rewrite with active, outcome-focused language to increase impact.',
        originalText: 'TechVenture Solutions proposes a comprehensive digital transformation engagement',
        suggestedText: 'TechVenture Solutions will accelerate Acme Corp\'s digital transformation through a proven, results-driven engagement',
        accepted: false,
        dismissed: false,
      },
      {
        id: `sug-${uid()}`,
        type: 'pricing',
        title: 'Add ROI Justification Table',
        description: 'The $485K investment lacks a detailed ROI breakdown. Add a value-vs-cost comparison to reduce sticker shock.',
        accepted: false,
        dismissed: false,
      },
      {
        id: `sug-${uid()}`,
        type: 'structure',
        title: 'Add Case Study Section',
        description: 'Including a brief case study of a similar transformation would significantly increase conversion probability.',
        accepted: false,
        dismissed: false,
      },
      {
        id: `sug-${uid()}`,
        type: 'risk',
        title: 'Address Data Migration Risks',
        description: 'The proposal doesn\'t mention data migration challenges. This is often a top concern for enterprise buyers.',
        accepted: false,
        dismissed: false,
      },
      {
        id: `sug-${uid()}`,
        type: 'tone',
        title: 'Soften Urgency in Timeline',
        description: 'The 24-week timeline feels rigid. Consider framing it as "approximately 24 weeks" to set realistic expectations.',
        originalText: 'Weeks 17–24',
        suggestedText: 'Weeks 17–24 (with flexibility for scope adjustments)',
        accepted: false,
        dismissed: false,
      },
    ],
  };

  // Return specific suggestions if available, otherwise generic ones
  return (
    suggestionSets[documentId] || [
      {
        id: `sug-${uid()}`,
        type: 'wording',
        title: 'Improve Opening Impact',
        description: 'Consider leading with a quantifiable outcome or bold statement to capture reader attention immediately.',
        accepted: false,
        dismissed: false,
      },
      {
        id: `sug-${uid()}`,
        type: 'structure',
        title: 'Add Executive Summary',
        description: 'A concise executive summary at the top helps busy decision-makers quickly grasp the key points.',
        accepted: false,
        dismissed: false,
      },
      {
        id: `sug-${uid()}`,
        type: 'tone',
        title: 'Maintain Consistent Tone',
        description: 'Some sections shift between formal and casual language. Ensure a consistently professional yet approachable tone throughout.',
        accepted: false,
        dismissed: false,
      },
      {
        id: `sug-${uid()}`,
        type: 'risk',
        title: 'Add Risk Mitigation',
        description: 'Include at least 3 identified risks with corresponding mitigation strategies to demonstrate thorough planning.',
        accepted: false,
        dismissed: false,
      },
    ]
  );
}

// ─── Get Health Score ───────────────────────────────────────────────────────

export function getHealthScore(content: string): HealthScore {
  // Simulate analysis based on content length and structure
  const wordCount = content.split(/\s+/).length;
  const hasHeadings = /^#{1,3}\s/m.test(content);
  const hasTables = /\|.*\|/m.test(content);
  const hasLists = /^[-*]\s/m.test(content);
  const hasSections = (content.match(/^#{2}\s/gm) || []).length;

  const professionalism = Math.min(98, 70 + (hasHeadings ? 10 : 0) + (hasTables ? 8 : 0) + Math.floor(wordCount / 200));
  const readability = Math.min(96, 65 + (hasLists ? 10 : 0) + (hasSections > 3 ? 10 : hasSections > 1 ? 5 : 0) + Math.floor(wordCount / 300));
  const completeness = Math.min(95, 55 + hasSections * 5 + (hasTables ? 10 : 0) + (wordCount > 500 ? 15 : wordCount > 200 ? 8 : 0));
  const conversion = Math.min(94, 60 + (hasHeadings ? 8 : 0) + (hasTables ? 7 : 0) + (hasLists ? 5 : 0) + Math.floor(wordCount / 250));

  const overall = Math.round((professionalism + readability + completeness + conversion) / 4);

  const suggestions: HealthScore['suggestions'] = [];

  if (!hasTables) {
    suggestions.push({
      id: `hs-${uid()}`,
      category: 'readability',
      message: 'Add tables to present data and comparisons more effectively.',
      priority: 'medium',
      resolved: false,
    });
  }

  if (wordCount < 300) {
    suggestions.push({
      id: `hs-${uid()}`,
      category: 'completeness',
      message: 'The document appears too short. Consider expanding key sections with more detail.',
      priority: 'high',
      resolved: false,
    });
  }

  if (hasSections < 3) {
    suggestions.push({
      id: `hs-${uid()}`,
      category: 'professionalism',
      message: 'Organize content into more clearly defined sections with descriptive headings.',
      priority: 'medium',
      resolved: false,
    });
  }

  return {
    overall,
    professionalism,
    readability,
    completeness,
    conversion,
    suggestions,
  };
}

// ─── Detect Gaps ────────────────────────────────────────────────────────────

export function detectGaps(content: string): GapDetection[] {
  const gaps: GapDetection[] = [];
  const lowerContent = content.toLowerCase();

  if (!lowerContent.includes('risk') && !lowerContent.includes('mitigation')) {
    gaps.push({
      id: `gap-${uid()}`,
      type: 'missing-section',
      severity: 'warning',
      title: 'No Risk Assessment',
      description: 'The document does not address potential risks or challenges. Decision-makers look for evidence of thorough risk analysis.',
      suggestedFix: 'Add a "Risks & Mitigations" section identifying at least 3 key risks with corresponding countermeasures.',
      resolved: false,
    });
  }

  if (!lowerContent.includes('timeline') && !lowerContent.includes('schedule') && !lowerContent.includes('phase')) {
    gaps.push({
      id: `gap-${uid()}`,
      type: 'missing-section',
      severity: 'critical',
      title: 'No Timeline or Schedule',
      description: 'The document lacks a timeline, schedule, or phased plan. This is essential for setting expectations.',
      suggestedFix: 'Add a timeline section with milestones, deliverables, and target dates for each phase.',
      resolved: false,
    });
  }

  if (!lowerContent.includes('next step') && !lowerContent.includes('action item') && !lowerContent.includes('call to action')) {
    gaps.push({
      id: `gap-${uid()}`,
      type: 'recommendation',
      severity: 'info',
      title: 'No Clear Next Steps',
      description: 'The document ends without a clear call-to-action or next steps. This can reduce conversion and follow-through.',
      suggestedFix: 'Add a "Next Steps" section with 2–3 concrete actions the reader should take, including contact information.',
      resolved: false,
    });
  }

  if (!lowerContent.includes('team') && !lowerContent.includes('who') && !lowerContent.includes('our experts')) {
    gaps.push({
      id: `gap-${uid()}`,
      type: 'incomplete',
      severity: 'warning',
      title: 'Team Information Missing',
      description: 'The document does not introduce the team or individuals involved. This is important for establishing trust and credibility.',
      suggestedFix: 'Add a "Your Team" or "About Us" section highlighting key team members and their relevant experience.',
      resolved: false,
    });
  }

  // Always return at least one gap for demo purposes
  if (gaps.length === 0) {
    gaps.push({
      id: `gap-${uid()}`,
      type: 'recommendation',
      severity: 'info',
      title: 'Consider Adding Visual Elements',
      description: 'The document is text-heavy. Adding charts, diagrams, or visual callouts can improve reader engagement.',
      suggestedFix: 'Add 2–3 visual elements such as comparison tables, process diagrams, or highlight boxes for key statistics.',
      resolved: false,
    });
  }

  return gaps;
}

// ─── Chat with AI ───────────────────────────────────────────────────────────

export async function chatWithAI(message: string, context: string): Promise<string> {
  await delay(800);

  const lowerMessage = message.toLowerCase();

  // Contextual responses based on message keywords
  if (lowerMessage.includes('improve') || lowerMessage.includes('better')) {
    return `Based on my analysis of this document, here are three high-impact improvements:\n\n**1. Strengthen the Executive Summary**\nLead with quantifiable outcomes rather than process descriptions. For example, instead of "We propose to help…" try "This engagement will deliver a projected 34% reduction in operational costs within 6 months."\n\n**2. Add Social Proof**\nInclude a brief case study or 2–3 client testimonials from similar engagements. Decision-makers in your target audience respond strongly to evidence of past success.\n\n**3. Create a Visual Timeline**\nReplace the text-based timeline with a visual Gantt chart or milestone diagram. This makes the project plan immediately scannable.\n\nWould you like me to draft any of these sections?`;
  }

  if (lowerMessage.includes('shorten') || lowerMessage.includes('concise') || lowerMessage.includes('trim')) {
    return `I can help tighten this up. Here's my analysis:\n\n**Current word count:** ~${context.split(/\s+/).length} words\n**Recommended target:** ${Math.round(context.split(/\s+/).length * 0.7)} words (30% reduction)\n\n**Sections to condense:**\n- The introduction repeats points covered in the executive summary — merge them\n- The scope section can use bullet points instead of full paragraphs\n- Remove qualifying phrases like "we believe," "it is our opinion that," etc.\n\n**Sections to keep as-is:**\n- Pricing/investment details (buyers need this specificity)\n- Contact information and next steps\n\nShall I generate a condensed version?`;
  }

  if (lowerMessage.includes('tone') || lowerMessage.includes('formal') || lowerMessage.includes('casual')) {
    return `Here's a tone analysis of the current document:\n\n**Current Tone:** Professional with moderate formality (7/10 on the formality scale)\n\n**Observations:**\n- ✅ Good use of active voice in most sections\n- ⚠️ Some sentences are overly complex — consider breaking them up\n- ⚠️ The closing section shifts to a more casual tone, creating inconsistency\n\n**Recommendations:**\n- Maintain the confident, solution-oriented voice throughout\n- Replace jargon like "leverage" and "synergize" with plain language\n- Use second person ("you/your") more frequently to make it reader-centric\n\nWould you like me to rewrite specific sections in a particular tone?`;
  }

  if (lowerMessage.includes('pricing') || lowerMessage.includes('cost') || lowerMessage.includes('budget')) {
    return `Here are some suggestions for the pricing section:\n\n**Best Practices for Pricing Presentation:**\n\n1. **Anchor with value first** — Before showing numbers, recap the ROI and business outcomes. Frame the investment against the cost of inaction.\n\n2. **Offer tiered options** — Present 3 tiers (Essential, Professional, Enterprise) to give the buyer agency and prevent an all-or-nothing decision.\n\n3. **Break down the investment** — Show per-phase or per-month costs rather than only the total. $485K feels different when presented as $20K/week over 24 weeks.\n\n4. **Include payment terms** — Flexible payment terms (30% upfront, milestone-based payments) reduce friction.\n\n5. **Add an ROI calculator** — Even a simple table showing "Investment vs. projected savings over 12/24/36 months" dramatically improves conversion.\n\nWant me to restructure the pricing section using these principles?`;
  }

  // Default response
  return `Great question! Here's my analysis:\n\nLooking at the document context, I'd recommend focusing on three areas:\n\n1. **Clarity** — Ensure every section has a clear purpose and key takeaway. Readers should be able to skim headings and get the full picture.\n\n2. **Specificity** — Replace vague language with concrete metrics, dates, and deliverables. "Improved performance" → "42% reduction in page load time."\n\n3. **Call to Action** — Make the next steps unmistakable. Include specific dates, contact methods, and what happens if they say yes today.\n\nIs there a specific section you'd like me to focus on? I can provide detailed rewrites, alternative phrasings, or structural suggestions.`;
}
