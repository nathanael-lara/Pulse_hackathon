import { Anthropic } from '@anthropic-ai/sdk';
import type { PatientContextPackage } from '@/lib/context-builder';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'sk-mock',
});

// Mock clinical moment detection
function getMockClinicalMoment(text: string): {
  isClinical: boolean;
  clinicalMoment: string | null;
  simpleExplanation: string | null;
} {
  const lowerText = text.toLowerCase();

  // Clinical keywords/patterns
  const clinicalPatterns: Array<{
    keywords: string[];
    moment: string;
    explanation: string;
  }> = [
    {
      keywords: ['arrhythmia', 'irregular rhythm', 'afib', 'atrial fibrillation'],
      moment: 'Arrhythmia detected or discussed',
      explanation: 'Your heart rhythm is irregular, which needs monitoring but is manageable.',
    },
    {
      keywords: ['metoprolol', 'aspirin', 'lisinopril', 'dosage', 'increase', 'decrease'],
      moment: 'Medication adjustment recommended',
      explanation: 'Your doctor is adjusting your heart medications based on your progress.',
    },
    {
      keywords: ['ekг', 'ekg', 'electrocardiogram', 'stress test'],
      moment: 'Cardiac test mentioned',
      explanation: 'A test is being done to check your heart health and function.',
    },
    {
      keywords: ['exercise limit', 'max heart rate', '120 bpm', 'stop exercise'],
      moment: 'Exercise guideline given',
      explanation: 'Your doctor is setting safe limits for physical activity during recovery.',
    },
    {
      keywords: ['sodium', '1500mg', 'salt', 'low sodium diet'],
      moment: 'Dietary guidance provided',
      explanation: 'Stay under 1500mg sodium daily to protect your heart.',
    },
    {
      keywords: ['breathlessness', 'shortness of breath', 'dizzy', 'chest discomfort', 'pain'],
      moment: 'Symptom reported and noted',
      explanation: 'Your doctor is aware of your symptoms and monitoring them.',
    },
    {
      keywords: ['return to work', 'driving', 'normal activities', 'resume'],
      moment: 'Activity clearance discussed',
      explanation: 'Your doctor is clearing you to resume certain daily activities.',
    },
  ];

  for (const pattern of clinicalPatterns) {
    if (pattern.keywords.some((keyword) => lowerText.includes(keyword))) {
      return {
        isClinical: true,
        clinicalMoment: pattern.moment,
        simpleExplanation: pattern.explanation,
      };
    }
  }

  return {
    isClinical: false,
    clinicalMoment: null,
    simpleExplanation: null,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rawText, patientContext } = body as {
      rawText: string;
      patientContext: PatientContextPackage;
    };

    if (!rawText) {
      return new Response(
        JSON.stringify({ isClinical: false }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Use mock detection if no API key
    if (!process.env.ANTHROPIC_API_KEY) {
      const result = getMockClinicalMoment(rawText);
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `You are a medical transcript analyzer for cardiac patients. Your job is to quickly identify if a spoken transcript contains important clinical information.

Patient: ${patientContext.patient.preferredName}

Respond with ONLY valid JSON, no other text:
{
  "isClinical": true|false,
  "clinicalMoment": "extracted clinical info if isClinical=true, null otherwise",
  "simpleExplanation": "one sentence plain-English explanation if isClinical=true, null otherwise"
}

What counts as clinical:
- Doctor's instructions (medication changes, exercise limits, diet advice)
- Test results or diagnosis mentions
- Symptom evaluations
- Safety warnings or red flags
- Treatment plan updates

What does NOT count:
- Small talk, greetings, scheduling
- Generic pleasantries
- Patient repeating back what they heard`;

    const response = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 200,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Analyze this transcript excerpt: "${rawText}"`,
        },
      ],
    });

    const textContent = response.content[0];
    if (textContent.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    // Extract JSON from response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(
        JSON.stringify({ isClinical: false }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify({
        isClinical: parsed.isClinical ?? false,
        clinicalMoment: parsed.clinicalMoment ?? null,
        simpleExplanation: parsed.simpleExplanation ?? null,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in /api/extract-clinical-moment:', error);
    // Graceful fallback
    return new Response(
      JSON.stringify({ isClinical: false }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
}
