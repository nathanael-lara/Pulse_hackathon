import { Anthropic } from '@anthropic-ai/sdk';
import type { DailyBrief } from '@/lib/types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'sk-mock',
});

// Mock daily brief responses
function getMockDailyBrief(
  patientName: string,
  recoveryWeek: number,
  recentMoodScore?: number,
  sodiumBudgetRemaining?: number
): { headline: string; encouragement: string; nextBestAction: string } {
  const briefOptions = {
    1: {
      headline: 'Welcome to cardiac recovery, ' + patientName + '.',
      encouragement: 'Your first week is about rest and adjustment. Your heart is healing. Be gentle with yourself and follow your medications perfectly.',
      nextBestAction: 'Take your medications on time and do your symptom check-in.',
    },
    2: {
      headline: 'You made it through week one.',
      encouragement: "Now that the shock has passed, focus on building small habits. Gentle movements matter more than speed or distance right now.",
      nextBestAction: 'Go for a 10-minute easy walk if your doctor approved it.',
    },
    3: {
      headline: 'Week three - your body is adapting.',
      encouragement: 'You should feel a bit stronger now. Keep your routine consistent and celebrate small wins like taking all your medications or logging meals.',
      nextBestAction: 'Check your sodium tracker and log today\'s meals.',
    },
    4: {
      headline: 'You\'re becoming a recovery expert.',
      encouragement: 'By now you know your patterns. Use what you\'ve learned to guide your day. Your consistent effort is working.',
      nextBestAction: 'Extend your walk by 2-3 minutes if you feel strong.',
    },
    6: {
      headline: 'You\'re nearing the halfway point.',
      encouragement: 'Week six is often when people feel noticeably better. Keep riding this momentum with your walking, diet, and medications.',
      nextBestAction: 'Log a quick heart rate check during activity to see your progress.',
    },
  };

  const moodNote =
    recentMoodScore && recentMoodScore <= 1 ? ' Take something small and good for yourself today.' : '';

  const sodiumNote =
    sodiumBudgetRemaining && sodiumBudgetRemaining < 300
      ? ' Watch your sodium at lunch and dinner.'
      : '';

  const selectedBrief = briefOptions[recoveryWeek as keyof typeof briefOptions] || briefOptions[3];

  return {
    headline: selectedBrief.headline,
    encouragement: selectedBrief.encouragement + moodNote,
    nextBestAction: selectedBrief.nextBestAction + sodiumNote,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patientName, recoveryWeek, recentMoodScore, sodiumBudgetRemaining } = body as {
      patientName: string;
      recoveryWeek: number;
      recentMoodScore?: number;
      sodiumBudgetRemaining: number;
    };

    // Use mock brief if no API key
    if (!process.env.ANTHROPIC_API_KEY) {
      const brief = getMockDailyBrief(patientName, recoveryWeek, recentMoodScore, sodiumBudgetRemaining);
      return new Response(JSON.stringify(brief), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `You are CorVas, a compassionate cardiac recovery companion. Generate an uplifting daily brief for a post-MI patient.

Respond with ONLY valid JSON (no other text):
{
  "headline": "A 1-sentence motivational headline (max 12 words)",
  "encouragement": "A 2-3 sentence message tailored to today's mood and progress",
  "nextBestAction": "A specific, achievable action (e.g., '20-min walk' or 'Log breakfast')"
}`;

    const response = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 200,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Generate a daily brief for ${patientName} on recovery week ${recoveryWeek}. They have ${sodiumBudgetRemaining}mg sodium remaining today.${recentMoodScore ? ` Their mood score was ${recentMoodScore}/4 yesterday.` : ''}`,
        },
      ],
    });

    const textContent = response.content[0];
    if (textContent.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse response as JSON');
    }

    const parsed = JSON.parse(jsonMatch[0]) as DailyBrief;

    return new Response(JSON.stringify(parsed), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in /api/daily-brief:', error);

    return new Response(
      JSON.stringify({
        headline: "You've got this today.",
        encouragement: "Every step forward counts. Take it one gentle moment at a time.",
        nextBestAction: "Start your day with a few minutes of deep breathing.",
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
