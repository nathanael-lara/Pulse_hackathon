import { Anthropic } from '@anthropic-ai/sdk';
import type { MealLogEntry } from '@/lib/types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Mock meal suggestions based on meal type and sodium budget
function getMockMealSuggestions(
  mealType: string,
  sodiumBudgetRemaining: number
): Array<{ name: string; sodiumMg: number; caloriesEstimate: number; description: string; why: string }> {
  const suggestions: Record<
    string,
    Array<{ name: string; sodiumMg: number; caloriesEstimate: number; description: string; why: string }>
  > = {
    breakfast: [
      {
        name: 'Oatmeal with berries and honey',
        sodiumMg: 70,
        caloriesEstimate: 280,
        description: 'Steel-cut oats topped with fresh blueberries, raspberries, and a drizzle of honey',
        why: 'High in soluble fiber to lower cholesterol, rich in antioxidants, very low sodium',
      },
      {
        name: 'Egg white omelet with spinach',
        sodiumMg: 140,
        caloriesEstimate: 180,
        description: '3 egg whites with fresh spinach, mushrooms, and herbs',
        why: 'High protein supports heart muscle, spinach contains magnesium, minimal sodium',
      },
      {
        name: 'Greek yogurt parfait',
        sodiumMg: 85,
        caloriesEstimate: 220,
        description: 'Low-fat Greek yogurt with granola and fresh fruit',
        why: 'Excellent source of probiotics for gut health, calcium for bones, low sodium',
      },
    ],
    lunch: [
      {
        name: 'Grilled salmon with roasted vegetables',
        sodiumMg: 200,
        caloriesEstimate: 420,
        description: '4oz salmon, broccoli, and sweet potato, olive oil drizzle',
        why: 'Omega-3 fatty acids reduce inflammation, salmon is heart-protective, nutrient-dense',
      },
      {
        name: 'Mediterranean chickpea salad',
        sodiumMg: 180,
        caloriesEstimate: 340,
        description: 'Chickpeas, fresh vegetables, whole grain, lemon vinaigrette',
        why: 'Plant-based protein, high fiber, anti-inflammatory, no added salt',
      },
      {
        name: 'Turkey and veggie wrap',
        sodiumMg: 260,
        caloriesEstimate: 380,
        description: 'Whole wheat tortilla, low-sodium turkey, lettuce, tomato, mustard',
        why: 'Lean protein, whole grains, easy to customize, manageable sodium',
      },
    ],
    dinner: [
      {
        name: 'Herb-roasted chicken breast with quinoa',
        sodiumMg: 210,
        caloriesEstimate: 450,
        description: 'Skinless chicken with herbs, quinoa pilaf, steamed broccoli',
        why: 'Lean protein, complete amino acids from quinoa, heart-healthy preparation',
      },
      {
        name: 'Baked white fish with sweet potato',
        sodiumMg: 190,
        caloriesEstimate: 380,
        description: 'White fish with lemon, roasted sweet potato and green beans',
        why: 'Omega-3s, low calorie, nutrient-dense, naturally low sodium',
      },
      {
        name: 'Vegetarian stir-fry with tofu',
        sodiumMg: 150,
        caloriesEstimate: 320,
        description: 'Tofu, bell peppers, broccoli, and brown rice with no-salt seasoning',
        why: 'Plant-based protein, high fiber, colorful vegetables, low sodium',
      },
    ],
    snack: [
      {
        name: 'Almonds and dried berries',
        sodiumMg: 60,
        caloriesEstimate: 200,
        description: '1oz almonds with unsweetened dried blueberries',
        why: 'Heart-healthy fats, antioxidants, sustains energy, minimal sodium',
      },
      {
        name: 'Hummus with vegetable sticks',
        sodiumMg: 120,
        caloriesEstimate: 180,
        description: 'Homemade hummus with carrots, celery, bell peppers',
        why: 'Plant-based protein, fiber, satisfying crunch, low sodium option',
      },
      {
        name: 'Apple with almond butter',
        sodiumMg: 75,
        caloriesEstimate: 220,
        description: '1 medium apple with 1 tablespoon natural almond butter',
        why: 'Soluble fiber, healthy fats, natural sugars, great for sustained energy',
      },
    ],
  };

  return suggestions[mealType] || suggestions.snack;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mealType, recentMeals, sodiumBudgetRemaining } = body as {
      mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
      recentMeals: MealLogEntry[];
      sodiumBudgetRemaining: number;
    };

    if (!mealType || sodiumBudgetRemaining === undefined) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
      });
    }

    // Use mock suggestions if no API key
    if (!process.env.ANTHROPIC_API_KEY) {
      const allSuggestions = getMockMealSuggestions(mealType, sodiumBudgetRemaining);
      // Filter by budget if needed, otherwise return top 3
      const suggestions = allSuggestions.slice(0, 3);
      return new Response(JSON.stringify({ suggestions }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const recentMealDescriptions = recentMeals
      .slice(0, 5)
      .map((m) => `${m.mealType}: ${m.description} (${m.sodiumMg}mg sodium)`)
      .join(', ');

    const systemPrompt = `You are a cardiac diet advisor for post-MI recovery patients. Your job is to suggest heart-healthy meals based on sodium targets.

Cardiac diet principles for this patient:
- Target sodium: <1500mg per day (currently ${sodiumBudgetRemaining}mg remaining today)
- Mediterranean/DASH diet emphasis
- High fiber, omega-3 rich, low saturated fat
- Portion control and nutrient balance

Respond with ONLY valid JSON (no other text):
{
  "suggestions": [
    {
      "name": "meal name",
      "sodiumMg": number,
      "caloriesEstimate": number,
      "description": "short description",
      "why": "why this is good for cardiac health"
    }
  ]
}`;

    const response = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 400,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Suggest 3 ${mealType} options with remaining sodium budget of ${sodiumBudgetRemaining}mg. Recent meals: ${recentMealDescriptions || 'none logged yet'}`,
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
      throw new Error('Could not parse response as JSON');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify({ suggestions: parsed.suggestions || [] }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in /api/diet-suggest:', error);

    return new Response(
      JSON.stringify({
        error: 'Could not generate meal suggestions. Please try again.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
