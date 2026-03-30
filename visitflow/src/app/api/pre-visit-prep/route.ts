import { Anthropic } from '@anthropic-ai/sdk';
import type { PatientContextPackage } from '@/lib/context-builder';
import type { PreVisitPrepQuestion } from '@/lib/types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'sk-mock',
});

// Mock pre-visit prep questions
function getMockPrepQuestions(context: PatientContextPackage): PreVisitPrepQuestion[] {
  const questions: PreVisitPrepQuestion[] = [
    {
      id: 'prep-q-1',
      question: `Is my current exercise progression (${context.currentWeek?.week || 3} weeks in, doing 20-minute walks, 5x/week) appropriate for my recovery stage?`,
      category: 'activity',
      priority: 'high',
      aiGenerated: true,
      answered: false,
    },
    {
      id: 'prep-q-2',
      question: 'Should I adjust any of my medications (Metoprolol, Aspirin, Lisinopril) based on how I feel?',
      category: 'medication',
      priority: 'high',
      aiGenerated: true,
      answered: false,
    },
    {
      id: 'prep-q-3',
      question: 'I sometimes feel breathless during walks or activity - is this normal or should I be concerned?',
      category: 'symptom',
      priority: 'high',
      aiGenerated: true,
      answered: false,
    },
    {
      id: 'prep-q-4',
      question: 'What should my sodium, fat, and calorie targets be for the next phase of recovery?',
      category: 'diet',
      priority: 'medium',
      aiGenerated: true,
      answered: false,
    },
    {
      id: 'prep-q-5',
      question: 'When can I safely return to normal activities like gardening, driving long distances, or work?',
      category: 'activity',
      priority: 'medium',
      aiGenerated: true,
      answered: false,
    },
    {
      id: 'prep-q-6',
      question: 'What are the warning signs I should watch for that would require immediate medical attention?',
      category: 'concern',
      priority: 'high',
      aiGenerated: true,
      answered: false,
    },
    {
      id: 'prep-q-7',
      question: 'I noticed occasional heart palpitations or irregular beats - should I be worried?',
      category: 'symptom',
      priority: 'medium',
      aiGenerated: true,
      answered: false,
    },
  ];
  return questions;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patientContext } = body as {
      patientContext: PatientContextPackage;
    };

    if (!patientContext) {
      return new Response(JSON.stringify({ error: 'Missing patient context' }), {
        status: 400,
      });
    }

    // Use mock questions if no API key
    if (!process.env.ANTHROPIC_API_KEY) {
      const questions = getMockPrepQuestions(patientContext);
      return new Response(JSON.stringify({ questions }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `You are a cardiac recovery assistant helping a patient prepare for an upcoming doctor's visit.

Patient: ${patientContext.patient.preferredName}, age ${patientContext.patient.age}
Diagnosis: ${patientContext.patient.diagnosisSummary}
Current Week: Week ${patientContext.currentWeek.week} of 12-week recovery program

Based on the patient's recent symptoms, setbacks, medications, and recovery progress, generate 5-7 thoughtful questions they should ask their doctor at their next visit.

Recent symptoms: breathlessness ${patientContext.recentCheckIns[patientContext.recentCheckIns.length - 1]?.breathlessness ?? 0}/4, worry ${patientContext.recentCheckIns[patientContext.recentCheckIns.length - 1]?.worry ?? 0}/4
Recent setbacks: ${patientContext.recentSetbacks.length ? patientContext.recentSetbacks[0].note : 'none'}

Make questions specific to THEIR data, not generic. Mix categories: symptoms, medications, activity progression, diet, and concerns.

Respond ONLY as a valid JSON array with this exact structure, no other text:
[
  {
    "question": "specific question text?",
    "category": "symptom|medication|activity|diet|concern",
    "priority": "high|medium|low"
  }
]`;

    const response = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 500,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: 'Generate pre-visit prep questions for my upcoming appointment.',
        },
      ],
    });

    const textContent = response.content[0];
    if (textContent.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    // Extract JSON array from response
    const jsonMatch = textContent.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Could not parse response as JSON array');
    }

    const questionsData = JSON.parse(jsonMatch[0]);

    // Transform into PreVisitPrepQuestion format
    const questions: PreVisitPrepQuestion[] = questionsData.map(
      (q: { question: string; category: string; priority: string }, index: number) => ({
        id: `prep-q-${Date.now()}-${index}`,
        question: q.question,
        category: q.category as 'symptom' | 'medication' | 'activity' | 'diet' | 'concern',
        priority: q.priority as 'high' | 'medium' | 'low',
        aiGenerated: true,
        answered: false,
      })
    );

    return new Response(JSON.stringify({ questions }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in /api/pre-visit-prep:', error);

    return new Response(
      JSON.stringify({
        error: 'Could not generate prep questions. Please try again.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
