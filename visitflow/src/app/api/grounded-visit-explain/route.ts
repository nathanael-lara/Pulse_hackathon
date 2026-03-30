import { Anthropic } from '@anthropic-ai/sdk';
import type { PatientContextPackage } from '@/lib/context-builder';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'sk-mock',
});

// Mock plain-language translations of medical terms
function getMockExplanation(clinicalText: string): {
  simpleText: string;
  followUpQuestions: string[];
} {
  const text = clinicalText.toLowerCase();

  const explanations: Array<{
    keywords: string[];
    simple: string;
    questions: string[];
  }> = [
    {
      keywords: ['arrhythmia', 'irregular rhythm'],
      simple: "Your heart's rhythm is occasionally irregular. This is common after heart attack recovery and is usually manageable with medication. Your doctor will continue monitoring it.",
      questions: [
        'Should I be concerned if I feel my heart flutter or skip a beat?',
        'Do I need any changes to my medications for this?',
      ],
    },
    {
      keywords: ['ejection fraction'],
      simple: "This is a measure of how well your heart is pumping blood. A higher percentage is better. We'll track this to see how your heart is recovering.",
      questions: [
        'What is my target ejection fraction?',
        'How often should we check this?',
      ],
    },
    {
      keywords: ['coronary artery', 'blockage', 'stenosis'],
      simple: 'One of the arteries that supplies blood to your heart had reduced flow, which is what caused your heart attack. We are managing this with medication and lifestyle changes.',
      questions: [
        'Will the blockage improve with medication?',
        'Do I need another procedure?',
      ],
    },
    {
      keywords: ['antiplatelet', 'anticoagulant', 'blood thinner'],
      simple: "This medication helps prevent blood clots, which is important for protecting your heart. It's a key part of your recovery plan.",
      questions: [
        'For how long will I need to take this medication?',
        'What are signs of bleeding I should watch for?',
      ],
    },
    {
      keywords: ['hypertension', 'blood pressure'],
      simple: 'Your blood pressure is higher than ideal. Managing it with your medications and diet is important to protect your heart.',
      questions: [
        'What blood pressure targets am I aiming for?',
        'Should I monitor it at home?',
      ],
    },
    {
      keywords: ['cardiac', 'exercise', 'rehabilitation', 'walking'],
      simple: 'Gentle movement and walking are one of the best ways to help your heart heal. Your doctor has given you safe guidelines to follow.',
      questions: [
        'How do I know if I am exercising at the right level?',
        'Can I gradually increase my activity?',
      ],
    },
  ];

  for (const exp of explanations) {
    if (exp.keywords.some((keyword) => text.includes(keyword))) {
      return {
        simpleText: exp.simple,
        followUpQuestions: exp.questions,
      };
    }
  }

  return {
    simpleText: 'This is an important medical detail related to your heart recovery. Ask your doctor to explain what this means for your specific situation and recovery plan.',
    followUpQuestions: [
      'How does this affect my recovery?',
      'What should I do about this?',
    ],
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { segmentId, clinicalText, patientContext } = body as {
      segmentId: string;
      clinicalText: string;
      patientContext: PatientContextPackage;
    };

    if (!clinicalText || !patientContext) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
      });
    }

    // Use mock explanation if no API key
    if (!process.env.ANTHROPIC_API_KEY) {
      const explanation = getMockExplanation(clinicalText);
      return new Response(JSON.stringify(explanation), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `You are a cardiac recovery assistant. Your job is to translate medical language into plain English that a cardiac patient can understand.

Patient: ${patientContext.patient.preferredName}, age ${patientContext.patient.age}

Translate the following clinical statement into 1-2 sentences of plain English that explains what it means WITHOUT using medical jargon. Be warm and reassuring.

Then provide 2 follow-up questions the patient might want to ask their doctor about this topic.

Respond as JSON with this exact structure (no markdown, no extra text):
{
  "simpleText": "plain English explanation here",
  "followUpQuestions": [
    "question 1?",
    "question 2?"
  ]
}`;

    const response = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 300,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Please explain this medical statement: "${clinicalText}"`,
        },
      ],
    });

    const textContent = response.content[0];
    if (textContent.type !== 'text') {
      throw new Error('Unexpected response type from API');
    }

    // Parse the JSON response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse LLM response as JSON');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify({
        simpleText: parsed.simpleText || 'Unable to simplify this statement.',
        followUpQuestions: parsed.followUpQuestions || [],
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in /api/grounded-visit-explain:', error);

    return new Response(
      JSON.stringify({
        error: 'Could not process this statement. Please contact your care team.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
