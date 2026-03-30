import { Anthropic } from '@anthropic-ai/sdk';
import { buildSystemPrompt } from '@/lib/cardiac-knowledge';
import type { PatientContextPackage } from '@/lib/context-builder';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'sk-mock',
});

// Mock contextual responses for demo/testing
function getMockResponse(question: string, context: PatientContextPackage): string {
  const q = question.toLowerCase();
  const name = context?.patient?.preferredName || 'there';

  if (q.includes('arrhythmia') || q.includes('rhythm')) {
    return `Hi ${name}, arrhythmia means your heart rhythm is irregular. This is common after a heart attack and usually manageable with medication. Your doctor is monitoring this closely. Focus on taking your medications consistently and report any new symptoms like heart fluttering.`;
  }
  if (q.includes('medication') || q.includes('metoprolol') || q.includes('aspirin') || q.includes('lisinopril')) {
    return `Your medications are working together: Metoprolol slows your heart rate to reduce strain, Aspirin prevents blood clots, and Lisinopril helps your heart pump more efficiently. Take them exactly as prescribed. Minor side effects like mild dizziness usually improve within weeks. Contact your care team for severe symptoms.`;
  }
  if (q.includes('exercise') || q.includes('walk') || q.includes('activity') || q.includes('cardiac rehab')) {
    return `Great question! Start with 10-15 minute walks at a comfortable pace where you can still talk. Build up to 20 minutes by week 5. Use the "talk test" - if you can't speak, slow down. Aim for 5 days per week. Your wearable data helps track heart rate zones. Stop immediately if you feel chest pain or severe breathlessness.`;
  }
  if (q.includes('diet') || q.includes('salt') || q.includes('sodium') || q.includes('food')) {
    return `Your target is under 1500mg sodium daily. Focus on fresh fruits, vegetables, lean proteins, and whole grains. Avoid processed foods and canned items. The Mediterranean diet is ideal for cardiac recovery. I can suggest specific low-sodium meals if you log what you usually eat. Your sodium tracker is helping you stay on target.`;
  }
  if (q.includes('recovery') || q.includes('week') || q.includes('progress') || q.includes('timeline')) {
    return `You're in week ${context?.currentWeek?.week || 3} of your 12-week recovery. By week 6, most patients feel significantly stronger. Week 12 is when many return to normal activities. Your progress is on track - keep focusing on daily goals rather than comparing to others. Every person heals at their own pace.`;
  }
  if (q.includes('feel') || q.includes('symptom') || q.includes('dizz') || q.includes('chest') || q.includes('tired')) {
    return `I'm glad you're tracking how you feel. Any new chest discomfort, shortness of breath, unusual fatigue, or heart fluttering should go to your care team right away. For now, log your daily check-in - it helps us spot patterns. Trust your body. You're doing really well.`;
  }

  return `Thanks for asking, ${name}. Based on cardiac rehab guidelines, I'd recommend discussing this at your next visit with your care team. Keep taking your medications, logging check-ins, and walking daily. Your consistent effort is making a real difference in your recovery.`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question, context } = body as {
      question: string;
      context: PatientContextPackage;
    };

    if (!question || !context) {
      return new Response(JSON.stringify({ error: 'Missing question or context' }), {
        status: 400,
      });
    }

    // Use mock response if no API key
    if (!process.env.ANTHROPIC_API_KEY) {
      const mockResponse = getMockResponse(question, context);
      const readable = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
          // Stream the response in chunks to simulate real streaming
          let index = 0;
          const chunkSize = 15;

          const interval = setInterval(() => {
            if (index < mockResponse.length) {
              const chunk = mockResponse.slice(index, index + chunkSize);
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
              index += chunkSize;
            } else {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
              clearInterval(interval);
            }
          }, 20);
        },
      });

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    const systemPrompt = buildSystemPrompt(context);

    // Stream the response using the Anthropic SDK
    const stream = client.messages.stream({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 400,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: question,
        },
      ],
    });

    // Convert the Anthropic stream to a ReadableStream for the response
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              const text = event.delta.text;
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in /api/ask:', error);

    // Fallback response if the API call fails
    return new Response(
      JSON.stringify({
        error: 'Service temporarily unavailable. Please try again or contact your care team.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
