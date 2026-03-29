import { NextResponse } from 'next/server';
import {
  CARE_LOCATIONS,
  GOOGLE_MAPS_SIM_10024,
  PROVIDER_MATCHES,
  TRANSPORT_MATCHES,
} from '@/lib/mock-data';

type TripPurpose = 'rehab-center' | 'cardiologist' | 'hospital';

function fallbackPlan(zipCode: string, tripPurpose: TripPurpose) {
  const destination =
    GOOGLE_MAPS_SIM_10024.find((item) => item.kind === tripPurpose) ?? GOOGLE_MAPS_SIM_10024[1];
  const transport = TRANSPORT_MATCHES.find((item) => item.supports?.includes(tripPurpose === 'hospital' ? 'hospital' : tripPurpose === 'cardiologist' ? 'cardiology' : 'rehab'));
  const provider =
    tripPurpose === 'rehab-center'
      ? PROVIDER_MATCHES.find((item) => item.specialty.toLowerCase().includes('rehab'))
      : tripPurpose === 'cardiologist'
        ? PROVIDER_MATCHES.find((item) => item.specialty.toLowerCase().includes('cardiology'))
        : CARE_LOCATIONS.find((item) => item.kind === 'hospital');

  return [
    `• ZIP ${zipCode} simulation: the closest destination is ${destination.placeName}, about ${destination.distanceMiles} miles away and roughly ${destination.etaMinutes} minutes by car.`,
    `• Best community transport option: ${transport?.driverName ?? 'verified volunteer network'} from ${transport?.pickupArea ?? 'the local support network'} with ${transport?.availability ?? 'weekday availability'}.`,
    `• Best provider match: ${'name' in (provider ?? {}) ? (provider as { name: string }).name : 'local cardiac team'} because it aligns with the current physician-led rehab and rhythm-monitoring plan.`,
    '• This support plan stays within the physician’s existing care path and should not replace urgent evaluation if symptoms escalate.',
  ].join('\n');
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const zipCode = typeof body?.zipCode === 'string' ? body.zipCode.trim() : '';
  const tripPurpose = body?.tripPurpose as TripPurpose | undefined;
  const context = typeof body?.context === 'string' ? body.context.trim() : '';

  if (!zipCode || !tripPurpose) {
    return NextResponse.json({ error: 'zipCode and tripPurpose are required' }, { status: 400 });
  }

  if (zipCode !== '10024') {
    return NextResponse.json({
      plan: `• This demo currently simulates Google Maps style routing for ZIP 10024 only.\n• Please use 10024 to preview community transport and provider matching.`,
      provider: 'fallback',
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const relevantStops = GOOGLE_MAPS_SIM_10024.filter((item) => item.kind === tripPurpose || item.kind === 'home');
  const relevantTransport = TRANSPORT_MATCHES.filter((item) =>
    item.supports?.includes(tripPurpose === 'hospital' ? 'hospital' : tripPurpose === 'cardiologist' ? 'cardiology' : 'rehab')
  );
  const relevantProviders = tripPurpose === 'hospital'
    ? CARE_LOCATIONS.filter((item) => item.kind === 'hospital')
    : PROVIDER_MATCHES.filter((item) =>
        tripPurpose === 'rehab-center'
          ? item.specialty.toLowerCase().includes('rehab')
          : item.specialty.toLowerCase().includes('cardiology')
      );

  if (!apiKey) {
    return NextResponse.json({ plan: fallbackPlan(zipCode, tripPurpose), provider: 'fallback' });
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
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content:
              'You are generating a community transport and provider support plan for a cardiac patient. Use only the structured simulation data provided. Do not invent addresses, wait times, risks, or medical advice. Respond as 4 bullet points starting with the bullet character.',
          },
          {
            role: 'user',
            content: `Patient ZIP: ${zipCode}
Trip purpose: ${tripPurpose}
Physician context: ${context || 'Continue rehab, keep heart rate under 120 BPM, repeat EKG in 2 weeks.'}

Google Maps simulation data:
${JSON.stringify(relevantStops, null, 2)}

Community transport options:
${JSON.stringify(relevantTransport, null, 2)}

Provider matching options:
${JSON.stringify(relevantProviders, null, 2)}

Create a concise support plan that chooses one destination, one transport option, and one provider match. Keep it grounded in the data above.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ plan: fallbackPlan(zipCode, tripPurpose), provider: 'fallback' });
    }

    const data = await response.json();
    const plan = data?.choices?.[0]?.message?.content?.trim();
    return NextResponse.json({ plan: plan || fallbackPlan(zipCode, tripPurpose), provider: plan ? 'gpt-4o' : 'fallback' });
  } catch {
    return NextResponse.json({ plan: fallbackPlan(zipCode, tripPurpose), provider: 'fallback' });
  }
}
