import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getUserContext, getAllProducts } from '@/lib/ai-context';
import { getCheckoutGuidance } from '@/lib/checkout-assistant';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const tools = [
  {
    type: 'function',
    function: {
      name: 'add_to_cart',
      description: 'Add a product to the user\'s shopping cart. ONLY add items user explicitly requested. Default quantity is 1.',
      parameters: {
        type: 'object',
        properties: {
          product_id: { type: 'string', description: 'The product ID to add' },
          quantity: { type: 'number', description: 'Quantity to add (default: 1, only change if user specifies)' },
          confirmed: { type: 'boolean', description: 'Set true if user confirmed adding to existing cart item' },
        },
        required: ['product_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_products',
      description: 'Search for products by name, category, material, or price range',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
          minPrice: { type: 'number', description: 'Minimum price filter' },
          maxPrice: { type: 'number', description: 'Maximum price filter' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_product_details',
      description: 'Get detailed information about a specific product',
      parameters: {
        type: 'object',
        properties: {
          product_id: { type: 'string', description: 'The product ID' },
        },
        required: ['product_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'navigate_to_checkout',
      description: 'Navigate user to checkout page to complete their order',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'navigate_to_page',
      description: 'Navigate to any page on the website (Ops Mode only)',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Page path like /products, /cart, /profile' },
        },
        required: ['path'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'click_element',
      description: 'Click any button or element on the page (Ops Mode only)',
      parameters: {
        type: 'object',
        properties: {
          selector: { type: 'string', description: 'CSS selector of element to click' },
        },
        required: ['selector'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'fill_input',
      description: 'Fill any input field on the page (Ops Mode only). IMPORTANT: Call get_page_state FIRST to get correct selectors before using this.',
      parameters: {
        type: 'object',
        properties: {
          selector: { type: 'string', description: 'CSS selector of input field from get_page_state result' },
          value: { type: 'string', description: 'Value to fill' },
        },
        required: ['selector', 'value'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'scroll_to',
      description: 'Scroll to any element on the page (Ops Mode only)',
      parameters: {
        type: 'object',
        properties: {
          selector: { type: 'string', description: 'CSS selector of element to scroll to' },
        },
        required: ['selector'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'check_cart',
      description: 'Check current cart status and items',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_page_state',
      description: 'Get current page state and available input fields with their selectors (Ops Mode only). Use this BEFORE filling forms.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'autofill_form',
      description: 'Fill all checkout form fields at once (Ops Mode only). If country not provided, infer from state (US states = United States).',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Full name' },
          email: { type: 'string', description: 'Email address' },
          address: { type: 'string', description: 'Street address' },
          city: { type: 'string', description: 'City' },
          state: { type: 'string', description: 'State' },
          zip: { type: 'string', description: 'Zip code' },
          phone: { type: 'string', description: 'Phone number' },
          country: { type: 'string', description: 'Country (infer from state if not provided)' },
        },
        required: [],
      },
    },
  },
];

export async function POST(request: NextRequest) {
  try {
    const { messages, userId, executeFunction, functionResult, opsMode, currentPath } = await request.json();

    const userContext = userId ? await getUserContext(userId) : null;
    const products = await getAllProducts();

    const recentMessages = messages.slice(-25);

    const userPreferences = recentMessages
      .filter((m: any) => m.role === 'user')
      .map((m: any) => m.content)
      .join(' ');
    const deliveryPref = userPreferences.match(/\b(standard|express|overnight)\b/i)?.[0] || null;
    const paymentPref = userPreferences.match(/\b(credit card|paypal|cash on delivery|cod)\b/i)?.[0] || null;

    const systemMessage = `You are Gini AI, Auraluxe's intelligent shopping assistant. EXECUTE tasks immediately and ADAPT to changes.

User: ${(userContext?.profile as any)?.name || 'Guest'} | Orders: ${userContext?.totalOrders || 0}
Cart (${userContext?.cart.length || 0} items): ${userContext?.cart.map((c: any) => `${c.name} (qty: ${c.quantity})`).join(', ') || 'empty'}
Page: ${currentPath}
${deliveryPref ? `\nPreferred Delivery: ${deliveryPref}` : ''}
${paymentPref ? `\nPreferred Payment: ${paymentPref}` : ''}

PAGES: / /shop /cart /checkout /favorites /orders /profile

Products: ${products.slice(0, 20).map(p => `${p.id}:${p.name}($${p.price})`).join(', ')}

${opsMode ? 'OPS MODE: Full control - navigate_to_page, click_element, fill_input, scroll_to, check_cart, get_page_state. "store/shop" = /shop.' : ''}

CRITICAL RULES:
1. On /checkout: Use autofill_form to fill ALL fields at once
2. After autofill_form, call get_page_state to see clickableOptions
3. Use click_element ONCE for delivery (Standard/Express/Overnight)
4. Use click_element ONCE for payment (Credit Card/PayPal/Cash on Delivery)
5. After BOTH clicked, STOP and ask user to confirm checkout
6. NEVER click same option twice
7. If country missing, default to United States

One tool per response. Stop after delivery+payment selected.`;

    if (executeFunction && functionResult) {
      recentMessages.push({
        role: 'function',
        name: executeFunction,
        content: JSON.stringify(functionResult),
      });
      
      // Auto-proceed after autofill_form success
      if (currentPath === '/checkout' && executeFunction === 'autofill_form' && functionResult.success) {
        return NextResponse.json({
          message: 'All fields filled! Checking delivery and payment options...',
          toolCalls: [{
            id: 'auto_proceed',
            function: 'get_page_state',
            arguments: {},
          }],
        });
      }
      
      // Track delivery and payment selections
      const clickHistory = recentMessages.filter((m: any) => m.role === 'function' && m.name === 'click_element');
      const deliveryClicked = clickHistory.some((m: any) => {
        const result = JSON.parse(m.content);
        return result.clicked?.toLowerCase().includes('delivery') || result.clicked?.toLowerCase().includes('standard') || result.clicked?.toLowerCase().includes('express') || result.clicked?.toLowerCase().includes('overnight');
      });
      const paymentClicked = clickHistory.some((m: any) => {
        const result = JSON.parse(m.content);
        return result.clicked?.toLowerCase().includes('payment') || result.clicked?.toLowerCase().includes('credit') || result.clicked?.toLowerCase().includes('paypal') || result.clicked?.toLowerCase().includes('cash');
      });
      
      // After both delivery and payment selected, ask for confirmation
      if (currentPath === '/checkout' && executeFunction === 'click_element' && deliveryClicked && paymentClicked) {
        return NextResponse.json({
          message: 'Delivery and payment methods selected! Ready to complete your order? Please confirm to proceed with checkout.',
        });
      }

    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemMessage },
        ...recentMessages,
      ],
      tools: tools as any,
      tool_choice: 'auto',
      max_tokens: 300,
      temperature: 0.3,
    });

    const message = response.choices[0].message;

    // Monitor and detect loops
    if (message.tool_calls) {
      const toolCall = message.tool_calls[0] as any;
      const funcName = toolCall.function?.name;
      
      console.log('[GINI MONITOR]', {
        timestamp: new Date().toISOString(),
        user: userId || 'guest',
        page: currentPath,
        opsMode,
        toolCalls: message.tool_calls.map((tc: any) => ({
          function: tc.function?.name,
          args: JSON.parse(tc.function?.arguments || '{}'),
        })),
      });
      
      // Enforce ONE tool call only - take first one
      if (message.tool_calls.length > 1) {
        const firstTool = message.tool_calls[0] as any;
        return NextResponse.json({
          message: 'Executing one action at a time...',
          toolCalls: [{
            id: firstTool.id,
            function: firstTool.function?.name,
            arguments: JSON.parse(firstTool.function?.arguments || '{}'),
          }],
        });
      }
      
      // Check if trying to fill the SAME field again
      const lastFunc = recentMessages.slice(-1).filter((m: any) => m.role === 'function')[0];
      if (lastFunc && (lastFunc as any).name === 'fill_input' && funcName === 'fill_input') {
        const lastResult = JSON.parse(lastFunc.content);
        const currentArgs = JSON.parse(toolCall.function?.arguments || '{}');
        if (lastResult.success && lastResult.selector === currentArgs.selector) {
          return NextResponse.json({ 
            message: 'I already filled that field. Moving to next field or let me know what else to fill.' 
          });
        }
      }
      
      // Detect any action loop
      const recentCalls = recentMessages.slice(-3).filter((m: any) => m.role === 'function').map((m: any) => m.name);
      const sameActionCount = recentCalls.filter((name: any) => name === funcName).length;
      
      if (sameActionCount >= 2) {
        return NextResponse.json({ 
          message: `I seem to be repeating myself. What would you like me to do next?` 
        });
      }
    }

    if (message.tool_calls) {
      return NextResponse.json({
        message: message.content || 'Executing...',
        toolCalls: message.tool_calls.map((tc: any) => ({
          id: tc.id,
          function: tc.function?.name,
          arguments: JSON.parse(tc.function?.arguments || '{}'),
        })),
      });
    }

    return NextResponse.json({ message: message.content });
  } catch (error) {
    console.error('Gini chat error:', error);
    return NextResponse.json({ error: 'Failed to process chat' }, { status: 500 });
  }
}
