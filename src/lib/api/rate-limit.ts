import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const DAILY_TOKEN_LIMIT = 30000;

export async function checkRateLimit(estimatedTokens: number): Promise<{ allowed: boolean; remaining: number }> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // read-only in this context
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { allowed: false, remaining: 0 };
  }

  // Fetch current usage
  const { data: usage, error } = await supabase
    .from('user_usage')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const today = new Date().toISOString().split('T')[0];

  let tokensToday = 0;
  let lastReset = today;

  if (usage) {
    // If last_reset_date is before today, reset tokens
    const usageDate = new Date(usage.last_reset_date).toISOString().split('T')[0];
    if (usageDate < today) {
      tokensToday = 0;
      lastReset = today;
    } else {
      tokensToday = usage.tokens_today;
      lastReset = usage.last_reset_date;
    }
  }

  const remaining = DAILY_TOKEN_LIMIT - tokensToday;

  if (estimatedTokens > remaining) {
    return { allowed: false, remaining };
  }

  // Optimistically update
  const newTotal = tokensToday + estimatedTokens;
  await supabase
    .from('user_usage')
    .upsert({ user_id: user.id, tokens_today: newTotal, last_reset_date: lastReset });

  return { allowed: true, remaining: DAILY_TOKEN_LIMIT - newTotal };
}
