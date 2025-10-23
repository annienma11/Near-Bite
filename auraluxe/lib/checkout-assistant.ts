import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getCheckoutGuidance(
  currentState: {
    filledFields: string[];
    availableInputs: any[];
    userDetails: any;
    lastAction: string;
  }
) {
  const prompt = `You are a checkout assistant helping Gini AI fill a checkout form.

Current State:
- Filled fields: ${currentState.filledFields.join(', ') || 'none'}
- Available inputs: ${currentState.availableInputs.map(i => `${i.name || i.placeholder} (${i.selector})`).join(', ')}
- User details: ${JSON.stringify(currentState.userDetails)}
- Last action: ${currentState.lastAction}

Your task: Determine the NEXT field to fill and provide the exact selector and value.

Rules:
1. Fill fields in order: name → email → address → city → state → zip → phone
2. Skip already filled fields
3. Use exact selectors from available inputs
4. Return ONLY the next field to fill

Respond with JSON:
{
  "nextField": "selector here",
  "value": "value to fill",
  "fieldName": "human readable name"
}

If all fields filled, return: {"done": true, "message": "All fields completed"}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.1,
    max_tokens: 150,
  });

  try {
    return JSON.parse(response.choices[0].message.content || '{}');
  } catch {
    return { error: 'Failed to parse guidance' };
  }
}
