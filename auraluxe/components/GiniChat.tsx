'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import GiniCursor from './GiniCursor';

function FormattedMessage({ content }: { content: string }) {
  const [products, setProducts] = useState<any[]>([]);
  const [hoveredImg, setHoveredImg] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const productPattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+Earrings|\s+Necklace|\s+Bracelet|\s+Ring))\b/g;
      const matches = content.match(productPattern);
      if (!matches) return;

      const { data } = await supabase
        .from('products')
        .select('id, name, price, image_urls')
        .in('name', matches);
      
      if (data) setProducts(data);
    };
    fetchProducts();
  }, [content]);

  const cleanedContent = content.replace(/!\[.*?\]\(.*?\)/g, '');

  return (
    <div>
      <div className="whitespace-pre-wrap">{cleanedContent}</div>
      {products.length > 0 && (
        <div className="flex gap-2 mt-2 flex-wrap">
          {products.map((p, i) => (
            <div 
              key={i}
              className="relative"
              onMouseEnter={() => setHoveredImg(p.image_urls[0])}
              onMouseLeave={() => setHoveredImg(null)}
            >
              <img 
                src={p.image_urls[0]} 
                alt={p.name}
                className="w-[50px] h-[50px] object-cover cursor-pointer rounded border border-gold-400"
              />
              {hoveredImg === p.image_urls[0] && (
                <img 
                  src={p.image_urls[0]} 
                  alt={p.name}
                  className="absolute left-14 top-0 w-[100px] h-[100px] object-cover border-2 border-gold-500 shadow-lg z-10 rounded"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GiniChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<any>(null);
  const [alwaysAllow, setAlwaysAllow] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('gini_always_allow') === 'true';
    }
    return false;
  });
  const [opsMode, setOpsMode] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [preview, setPreview] = useState<any>(null);
  const [cursorTarget, setCursorTarget] = useState<string>('');
  const [streamingText, setStreamingText] = useState<string>('');
  const [timeoutWarning, setTimeoutWarning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const taskStartTime = useRef<number | null>(null);
  const timeoutTimer = useRef<NodeJS.Timeout | null>(null);
  const finalTimeoutTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const saved = localStorage.getItem('gini_messages');
      if (saved) setMessages(JSON.parse(saved));
    }
  }, [isOpen]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('gini_messages', JSON.stringify(messages.slice(-50)));
    }
  }, [messages]);

  async function sendMessage(executeFunc?: string, funcResult?: any) {
    if (!input.trim() && !executeFunc) return;
    if (loading) return;

    const userMessage = executeFunc ? null : { role: 'user', content: input };
    if (userMessage) {
      setMessages(prev => [...prev, userMessage]);
      taskStartTime.current = Date.now();
      
      // 3 minute warning
      timeoutTimer.current = setTimeout(() => {
        setTimeoutWarning(true);
        setMessages(prev => [...prev, { role: 'assistant', content: 'I\'ve been working for 3 minutes. Should I continue? (I\'ll stop in 2 minutes if no response)' }]);
        
        // 5 minute auto-stop
        finalTimeoutTimer.current = setTimeout(() => {
          if (loading) {
            if ((window as any).giniAbortController) {
              (window as any).giniAbortController.abort();
            }
            setLoading(false);
            setStatus('');
            setPreview(null);
            setPendingAction(null);
            setTimeoutWarning(false);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Task stopped after 5 minutes. Let me know if you need help!' }]);
          }
        }, 120000);
      }, 180000);
    }
    
    setInput('');
    setLoading(true);
    setStatus('🤔 Thinking...');

    const abortController = new AbortController();
    (window as any).giniAbortController = abortController;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const res = await fetch('/api/gini-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: userMessage ? [...messages, userMessage] : messages,
          userId: user?.id,
          executeFunction: executeFunc,
          functionResult: funcResult,
          opsMode,
          currentPath: pathname,
        }),
        signal: abortController.signal,
      });

      const data = await res.json();
      
      if (data.message && !executeFunc) {
        let text = '';
        for (let i = 0; i < data.message.length; i++) {
          text += data.message[i];
          setStreamingText(text);
          await new Promise(r => setTimeout(r, 10));
        }
        setStreamingText('');
      }

      if (data.toolCalls) {
        const storedAllow = localStorage.getItem('gini_always_allow') === 'true';
        if (storedAllow) {
          setLoading(false);
          await executeAction(true, data.toolCalls[0]);
          return;
        } else {
          setPendingAction(data.toolCalls[0]);
        }
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error.' }]);
      }
    } finally {
      setLoading(false);
      setStatus('');
      setPreview(null);
      (window as any).giniAbortController = null;
      
      if (timeoutTimer.current) {
        clearTimeout(timeoutTimer.current);
        timeoutTimer.current = null;
      }
      if (finalTimeoutTimer.current) {
        clearTimeout(finalTimeoutTimer.current);
        finalTimeoutTimer.current = null;
      }
      setTimeoutWarning(false);
      taskStartTime.current = null;
    }
  }

  async function executeAction(approved: boolean, actionOverride?: any) {
    const action = actionOverride || pendingAction;
    if (!action) {
      setPendingAction(null);
      setLoading(false);
      return;
    }
    
    if (!approved) {
      setPendingAction(null);
      setLoading(false);
      setMessages(prev => [...prev, { role: 'assistant', content: 'No problem! Let me know if you need anything else.' }]);
      return;
    }

    setPendingAction(null);
    setLoading(true);
    setStatus('🤔 Thinking...');

    try {
      let result: any = {};

      if (action.function === 'search_products') {
        setStatus('🔍 Searching products...');
        let query = supabase.from('products').select('*').ilike('name', `%${action.arguments.query}%`);
        
        if (action.arguments.minPrice) query = query.gte('price', action.arguments.minPrice);
        if (action.arguments.maxPrice) query = query.lte('price', action.arguments.maxPrice);
        
        const { data } = await query.limit(5);
        result = { products: data || [], count: data?.length || 0 };
        setPreview(data?.slice(0, 3));
      } else if (action.function === 'get_product_details') {
        setStatus('📦 Fetching product details...');
        const { data } = await supabase
          .from('products')
          .select('*')
          .eq('id', action.arguments.product_id)
          .single();
        result = { product: data };
        setPreview([data]);
      } else if (action.function === 'add_to_cart') {
        setStatus('🛒 Checking cart...');
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          result = { error: 'Please log in' };
        } else {
          const { data: existing } = await supabase.from('cart_items')
            .select('*').eq('user_id', user.id).eq('product_id', action.arguments.product_id).single();
          
          if (existing && !action.arguments.confirmed) {
            result = { alreadyInCart: true, currentQuantity: existing.quantity, needsConfirmation: true };
          } else if (existing && action.arguments.confirmed) {
            await supabase.from('cart_items').update({
              quantity: existing.quantity + (action.arguments.quantity || 1)
            }).eq('id', existing.id);
            result = { success: true, message: 'Quantity updated' };
          } else {
            await supabase.from('cart_items').insert({
              user_id: user.id,
              product_id: action.arguments.product_id,
              quantity: action.arguments.quantity || 1,
            });
            result = { success: true, message: 'Added to cart' };
          }
        }
      } else if (action.function === 'navigate_to_checkout') {
        setStatus('🚀 Navigating to checkout...');
        await new Promise(r => setTimeout(r, 500));
        router.push('/checkout');
        await new Promise(r => setTimeout(r, 1000));
        result = { success: true, navigating: true };
      } else if (action.function === 'navigate_to_page') {
        setStatus(`🚀 Navigating to ${action.arguments.path}...`);
        await new Promise(r => setTimeout(r, 500));
        router.push(action.arguments.path);
        await new Promise(r => setTimeout(r, 1000));
        result = { success: true, navigated: action.arguments.path };
      } else if (action.function === 'click_element') {
        setStatus(`👆 Clicking ${action.arguments.selector}...`);
        setCursorTarget(action.arguments.selector);
        await new Promise(r => setTimeout(r, 800));
        const el = document.querySelector(action.arguments.selector);
        if (el) {
          (el as HTMLElement).click();
          result = { success: true, clicked: action.arguments.selector };
        } else {
          result = { error: 'Element not found' };
        }
        setCursorTarget('');
      } else if (action.function === 'fill_input') {
        setStatus(`✍️ Filling ${action.arguments.selector}...`);
        setCursorTarget(action.arguments.selector);
        await new Promise(r => setTimeout(r, 800));
        const el = document.querySelector(action.arguments.selector);
        if (el) {
          (el as HTMLInputElement).value = action.arguments.value;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
          result = { success: true, filled: action.arguments.selector, value: action.arguments.value };
        } else {
          result = { error: `Input field "${action.arguments.selector}" not found on page. Available inputs: ${Array.from(document.querySelectorAll('input')).map(i => i.name || i.id || i.placeholder).filter(Boolean).join(', ')}` };
        }
        setCursorTarget('');
      } else if (action.function === 'scroll_to') {
        setStatus(`📜 Scrolling to ${action.arguments.selector}...`);
        setCursorTarget(action.arguments.selector);
        await new Promise(r => setTimeout(r, 500));
        const el = document.querySelector(action.arguments.selector);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          result = { success: true, scrolled: action.arguments.selector };
        } else {
          result = { error: 'Element not found' };
        }
        setCursorTarget('');
      } else if (action.function === 'check_cart') {
        setStatus('🛒 Checking cart...');
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          result = { cartItems: [], isEmpty: true, message: 'Please log in to view cart' };
        } else {
          const { data: cartData, error: cartError } = await supabase
            .from('cart_items')
            .select('id, quantity, product_id')
            .eq('user_id', user.id);
          
          if (cartError || !cartData || cartData.length === 0) {
            result = { 
              cartItems: [], 
              isEmpty: true, 
              totalItems: 0,
              totalQuantity: 0,
              message: 'Cart is empty'
            };
          } else {
            const productIds = cartData.map(item => item.product_id);
            const { data: products } = await supabase
              .from('products')
              .select('id, name, price')
              .in('id', productIds);
            
            const items = cartData.map(item => {
              const product = products?.find(p => p.id === item.product_id);
              return {
                id: item.id,
                product_id: item.product_id,
                name: product?.name || 'Unknown',
                quantity: item.quantity,
                price: product?.price || 0,
                total: (product?.price || 0) * item.quantity
              };
            });
            
            const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
            const totalPrice = items.reduce((sum, item) => sum + item.total, 0);
            
            result = { 
              cartItems: items,
              isEmpty: false,
              totalItems: items.length,
              totalQuantity,
              totalPrice: totalPrice.toFixed(2),
              message: `Found ${items.length} item(s) in cart with ${totalQuantity} total quantity`
            };
          }
        }
      } else if (action.function === 'autofill_form') {
        setStatus('📝 Auto-filling checkout form...');
        const details = action.arguments;
        const inputs = document.querySelectorAll('input, textarea');
        const filledFields: string[] = [];
        
        inputs.forEach((input: any) => {
          const name = input.name?.toLowerCase() || '';
          const placeholder = input.placeholder?.toLowerCase() || '';
          const id = input.id?.toLowerCase() || '';
          
          if ((name.includes('name') || placeholder.includes('name') || id.includes('name')) && details.name && !input.value) {
            input.value = details.name;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            filledFields.push('name');
          } else if ((input.type === 'email' || name.includes('email') || placeholder.includes('email')) && details.email && !input.value) {
            input.value = details.email;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            filledFields.push('email');
          } else if ((name.includes('address') || placeholder.includes('address') || id.includes('address')) && details.address && !input.value) {
            input.value = details.address;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            filledFields.push('address');
          } else if ((name.includes('city') || placeholder.includes('city')) && details.city && !input.value) {
            input.value = details.city;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            filledFields.push('city');
          } else if ((name.includes('state') || placeholder.includes('state')) && details.state && !input.value) {
            input.value = details.state;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            filledFields.push('state');
          } else if ((name.includes('zip') || name.includes('postal') || placeholder.includes('zip')) && details.zip && !input.value) {
            input.value = details.zip;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            filledFields.push('zip');
          } else if ((input.type === 'tel' || name.includes('phone') || placeholder.includes('phone')) && details.phone && !input.value) {
            input.value = details.phone;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            filledFields.push('phone');
          } else if ((name.includes('country') || placeholder.includes('country') || id.includes('country')) && !input.value) {
            const country = details.country || 'United States';
            input.value = country;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            filledFields.push('country');
          }
        });
        
        result = { success: true, filledFields, totalFilled: filledFields.length, message: `Filled ${filledFields.length} fields: ${filledFields.join(', ')}` };
      } else if (action.function === 'autofill_form') {
        setStatus('📝 Auto-filling form...');
        const details = action.arguments;
        const inputs = document.querySelectorAll('input, textarea');
        let filled = 0;
        
        inputs.forEach((input: any) => {
          const name = input.name?.toLowerCase() || '';
          const placeholder = input.placeholder?.toLowerCase() || '';
          const id = input.id?.toLowerCase() || '';
          
          if ((name.includes('name') || placeholder.includes('name') || id.includes('name')) && details.name) {
            input.value = details.name;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            filled++;
          } else if ((input.type === 'email' || name.includes('email') || placeholder.includes('email')) && details.email) {
            input.value = details.email;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            filled++;
          } else if ((name.includes('address') || placeholder.includes('address') || id.includes('address')) && details.address) {
            input.value = details.address;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            filled++;
          } else if ((name.includes('city') || placeholder.includes('city')) && details.city) {
            input.value = details.city;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            filled++;
          } else if ((name.includes('state') || placeholder.includes('state')) && details.state) {
            input.value = details.state;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            filled++;
          } else if ((name.includes('zip') || name.includes('postal') || placeholder.includes('zip')) && details.zip) {
            input.value = details.zip;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            filled++;
          } else if ((input.type === 'tel' || name.includes('phone') || placeholder.includes('phone')) && details.phone) {
            input.value = details.phone;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            filled++;
          }
        });
        
        result = { success: true, filledFields: filled, message: `Filled ${filled} fields` };
      } else if (action.function === 'get_page_state') {
        setStatus('🔍 Analyzing page...');
        const giniChatContainer = document.querySelector('.fixed.bottom-6.right-6');
        const buttons = Array.from(document.querySelectorAll('button')).map(b => b.textContent?.trim()).filter(Boolean);
        
        const allInputs = Array.from(document.querySelectorAll('input, textarea, select'))
          .filter((el: any) => {
            if (giniChatContainer && giniChatContainer.contains(el)) return false;
            if (el.placeholder?.toLowerCase().includes('ask gini')) return false;
            if (el.placeholder?.toLowerCase().includes('gini')) return false;
            if (el.type === 'radio' || el.type === 'checkbox') return false;
            return true;
          });
        
        const totalFields = allInputs.length;
        const filledFields = allInputs.filter((el: any) => el.value && el.value.trim() !== '').length;
        const emptyFields = allInputs.filter((el: any) => !el.value || el.value.trim() === '');
        
        const inputs = emptyFields.map(el => {
          const input = el as HTMLInputElement;
          return {
            type: input.type || input.tagName.toLowerCase(),
            name: input.name,
            id: input.id,
            placeholder: input.placeholder,
            selector: input.name ? `input[name="${input.name}"]` : input.id ? `#${input.id}` : input.placeholder ? `input[placeholder="${input.placeholder}"]` : null
          };
        }).filter(i => i.selector);
        
        const clickableOptions = Array.from(document.querySelectorAll('input[type="radio"], input[type="checkbox"], button'))
          .filter((el: any) => !giniChatContainer?.contains(el))
          .map((el: any) => {
            const label = el.labels?.[0]?.textContent || el.nextSibling?.textContent || el.parentElement?.textContent || '';
            return {
              type: el.type || 'button',
              value: el.value,
              label: label.trim(),
              selector: el.id ? `#${el.id}` : el.name ? `input[name="${el.name}"][value="${el.value}"]` : null
            };
          }).filter(i => i.selector && i.label);
        
        const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.textContent?.trim()).filter(Boolean);
        result = { 
          currentPage: pathname,
          availableButtons: buttons.slice(0, 10),
          availableInputs: inputs,
          clickableOptions: clickableOptions.slice(0, 20),
          pageHeadings: headings.slice(0, 5),
          totalFields,
          filledFields,
          remainingFields: inputs.length,
          allFieldsFilled: inputs.length === 0 && totalFields > 0,
          message: `Filled ${filledFields}/${totalFields} text fields. ${inputs.length} remaining. ${clickableOptions.length} clickable options available.`
        };
      }

      await sendMessage(action.function, result);
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Failed to complete action: ${error.message || 'Unknown error'}` }]);
      setLoading(false);
      setStatus('');
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gold-600 dark:bg-gold-500 text-cream-50 dark:text-brown-900 px-6 py-3 shadow-lg hover:bg-gold-700 transition-colors flex items-center gap-2"
        style={{ borderRadius: '50px', zIndex: opsMode ? 99999 : 50 }}
      >
        <span className="text-xl">✨</span>
        <span className="text-sm font-medium">Chat with Gini</span>
      </button>
    );
  }

  return (
    <>
      <GiniCursor active={opsMode && !!cursorTarget} targetSelector={cursorTarget} />
      <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-cream-50 dark:bg-brown-900 border-2 border-gold-500 shadow-2xl flex flex-col" style={{ zIndex: opsMode ? 99999 : 50 }}>
      <div className="bg-gold-600 dark:bg-gold-500 text-cream-50 dark:text-brown-900 p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-xl">✨</span>
          <span className="font-medium">Gini AI</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setMessages([]); localStorage.removeItem('gini_messages'); }} className="text-sm hover:opacity-70" title="Clear chat">🗑️</button>
          <button onClick={() => setIsOpen(false)} className="text-xl hover:opacity-70">×</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-brown-600 dark:text-cream-300 text-sm">
            Hi! I'm Gini, your shopping assistant. How can I help you today?
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx}>
            <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 text-sm ${msg.role === 'user' ? 'bg-gold-600 text-cream-50' : 'bg-brown-200 dark:bg-brown-800 text-brown-900 dark:text-cream-50'}`}>
                {msg.role === 'assistant' ? <FormattedMessage content={msg.content} /> : msg.content}
              </div>
            </div>
            {idx === messages.length - 1 && msg.role === 'user' && status && (
              <div className="mt-2 text-xs text-brown-600 dark:text-cream-400 flex items-center gap-1">
                <span className="inline-block animate-bounce">✨</span>
                <span>{status}</span>
              </div>
            )}
            {idx === messages.length - 1 && msg.role === 'user' && preview && preview.length > 0 && (
              <div className="mt-2 bg-cream-100 dark:bg-brown-800 p-2 space-y-1">
                <p className="text-xs font-medium">Preview:</p>
                {preview.map((p: any, i: number) => (
                  <div key={i} className="flex gap-2 items-center text-xs">
                    {p.image_urls?.[0] && <img src={p.image_urls[0]} alt="" className="w-8 h-8 object-cover" />}
                    <span>{p.name} - ${p.price}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {pendingAction && (
          <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-500 p-3 text-sm">
            <p className="font-medium mb-2">Permission Required:</p>
            <p className="mb-3">Allow Gini to {pendingAction.function.replace(/_/g, ' ')}?</p>
            <div className="flex gap-2">
              <button onClick={() => executeAction(true)} className="px-3 py-1 bg-green-600 text-white text-xs">Yes</button>
              <button onClick={() => executeAction(false)} className="px-3 py-1 bg-red-600 text-white text-xs">No</button>
              <label className="flex items-center gap-1 text-xs">
                <input type="checkbox" checked={alwaysAllow} onChange={(e) => {
                  const checked = e.target.checked;
                  setAlwaysAllow(checked);
                  localStorage.setItem('gini_always_allow', checked.toString());
                }} />
                Always allow
              </label>
            </div>
          </div>
        )}
        {streamingText && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-3 text-sm bg-brown-200 dark:bg-brown-800 text-brown-900 dark:text-cream-50">
              {streamingText}<span className="animate-pulse">▋</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-brown-200 dark:border-brown-700">
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setOpsMode(!opsMode)}
            className={`px-2 py-1 text-xs border ${opsMode ? 'bg-purple-600 text-white border-purple-600' : 'border-brown-300 dark:border-brown-600'}`}
            title="Ops Mode - Full UI Control"
          >
            {opsMode ? '⚡' : '⚙️'}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={opsMode ? "Ops Mode: I can control everything..." : "Ask Gini anything..."}
            className="flex-1 px-3 py-2 border border-brown-300 dark:border-brown-600 bg-transparent text-brown-900 dark:text-cream-50 text-sm focus:outline-none focus:border-gold-500"
            disabled={loading}
          />
          <button
            onClick={() => {
              if (loading) {
                if ((window as any).giniAbortController) {
                  (window as any).giniAbortController.abort();
                }
                if (timeoutTimer.current) clearTimeout(timeoutTimer.current);
                if (finalTimeoutTimer.current) clearTimeout(finalTimeoutTimer.current);
                setLoading(false);
                setStatus('');
                setPreview(null);
                setPendingAction(null);
                setTimeoutWarning(false);
              } else {
                if (timeoutWarning) {
                  setTimeoutWarning(false);
                  if (finalTimeoutTimer.current) {
                    clearTimeout(finalTimeoutTimer.current);
                    finalTimeoutTimer.current = null;
                  }
                }
                sendMessage();
              }
            }}
            className={`px-4 py-2 text-cream-50 text-sm ${loading ? 'bg-red-600 hover:bg-red-700' : 'bg-gold-600 hover:bg-gold-700'}`}
          >
            {loading ? 'Stop' : 'Send'}
          </button>
        </div>
        {opsMode && <div className="text-xs text-purple-600 dark:text-purple-400">⚡ Ops Mode Active - Full UI Control Enabled</div>}
        {timeoutWarning && <div className="text-xs text-orange-600 dark:text-orange-400">⏱️ Task running for 3+ minutes - Reply to continue or it will stop in 2 min</div>}
      </div>
    </div>
    </>
  );
}
