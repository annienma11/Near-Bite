'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image_urls: string[];
  processed?: boolean;
  failed?: boolean;
  error?: string;
}

export default function AdminPage() {
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [showDetails, setShowDetails] = useState(false);
  const [liveProgress, setLiveProgress] = useState<any[]>([]);
  const [liveLogs, setLiveLogs] = useState<any[]>([]);
  const [terminalRef, setTerminalRef] = useState<HTMLDivElement | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'processed' | 'unprocessed' | 'failed'>('all');
  const [newProduct, setNewProduct] = useState({ name: '', category: '', price: '', material: '', description: '', image_url: '', youtube_url: '' });
  const [uploadFiles, setUploadFiles] = useState<{
    mainImage?: File;
    albumImages: File[];
    view360Images: File[];
    video?: File;
  }>({ albumImages: [], view360Images: [] });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [batchDeleting, setBatchDeleting] = useState(false);
  const [selectCount, setSelectCount] = useState(5);
  const [refreshingPassword, setRefreshingPassword] = useState(false);

  useEffect(() => {
    async function rotatePassword() {
      try {
        const res = await fetch('/api/admin-password');
        const data = await res.json();
        setCurrentPassword(data.password);
        
        if (data.rotated) {
          console.log('New admin password generated:', data.password);
        }
      } catch (error) {
        console.error('Failed to rotate password:', error);
      }
    }
    rotatePassword();
    loadProducts();
  }, []);

  async function forceRefreshPassword() {
    setRefreshingPassword(true);
    try {
      await supabase.from('admin_password').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      const res = await fetch('/api/admin-password');
      const data = await res.json();
      setCurrentPassword(data.password);
    } catch (error) {
      console.error('Failed to refresh password:', error);
      alert('Failed to refresh password');
    } finally {
      setRefreshingPassword(false);
    }
  }

  async function loadProducts() {
    setLoading(true);
    try {
      const { data: allProducts, error: prodError } = await supabase
        .from('products')
        .select('id, name, category, price, image_urls')
        .order('created_at', { ascending: false });

      if (prodError) {
        console.error('Products error:', prodError);
      }

      const { data: processedEmbeddings, error: embError } = await supabase
        .from('product_visual_embeddings')
        .select('product_id, status, error_message');

      if (embError) {
        console.error('Embeddings error:', embError);
      }

      console.log('Total products:', allProducts?.length);
      console.log('Processed embeddings:', processedEmbeddings?.length);

      const embeddingMap = new Map(
        (processedEmbeddings || []).map(e => [e.product_id, { status: e.status, error: e.error_message }])
      );

      const productsWithStatus = (allProducts || []).map(p => {
        const embedding = embeddingMap.get(p.id);
        return {
          ...p,
          processed: embedding?.status === 'success',
          failed: embedding?.status === 'failed',
          error: embedding?.error
        };
      });

      console.log('Products with status:', productsWithStatus.filter(p => p.processed).length, 'processed', productsWithStatus.filter(p => p.failed).length, 'failed');

      setProducts(productsWithStatus);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  }

  function toggleProduct(id: string) {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedProducts(newSelected);
  }

  async function openProductModal(product: Product) {
    setSelectedProduct(product);
    setEditProduct({
      name: product.name,
      category: product.category,
      price: product.price,
      material: '',
      description: '',
      image_url: product.image_urls[0] || ''
    });

    const { data: fullProduct } = await supabase
      .from('products')
      .select('*')
      .eq('id', product.id)
      .single();

    if (fullProduct) {
      setEditProduct({
        name: fullProduct.name,
        category: fullProduct.category,
        price: fullProduct.price,
        material: fullProduct.material || '',
        description: fullProduct.description || '',
        image_url: fullProduct.image_urls[0] || ''
      });
    }

    const [favCount, orderCount, viewCount, clickCount, cartAddCount, aiRecCount] = await Promise.all([
      supabase.from('favorites').select('id', { count: 'exact', head: true }).eq('product_id', product.id),
      supabase.from('order_items').select('id', { count: 'exact', head: true }).eq('product_id', product.id),
      supabase.from('analytics_events').select('id', { count: 'exact', head: true }).eq('product_id', product.id).eq('event_type', 'product_view'),
      supabase.from('analytics_events').select('id', { count: 'exact', head: true }).eq('product_id', product.id).eq('event_type', 'product_click'),
      supabase.from('analytics_events').select('id', { count: 'exact', head: true }).eq('product_id', product.id).eq('event_type', 'add_to_cart'),
      supabase.from('analytics_events').select('id', { count: 'exact', head: true }).eq('product_id', product.id).eq('event_type', 'ai_recommendation')
    ]);

    setAnalytics({
      favorites: favCount.count || 0,
      orders: orderCount.count || 0,
      views: viewCount.count || 0,
      clicks: clickCount.count || 0,
      cartAdds: cartAddCount.count || 0,
      aiRecommendations: aiRecCount.count || 0
    });
  }

  async function saveProduct() {
    if (!selectedProduct || !editProduct.name || !editProduct.price) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: editProduct.name,
          slug: editProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
          category: editProduct.category,
          price: parseFloat(editProduct.price),
          material: editProduct.material,
          description: editProduct.description || null,
          image_urls: editProduct.image_url ? [editProduct.image_url] : []
        })
        .eq('id', selectedProduct.id);

      if (error) throw error;

      setSelectedProduct(null);
      await loadProducts();
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Failed to save product');
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct() {
    if (!selectedProduct || !confirm(`Delete ${selectedProduct.name}?`)) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', selectedProduct.id);

      if (error) throw error;

      setSelectedProduct(null);
      await loadProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product');
    } finally {
      setDeleting(false);
    }
  }

  async function batchDeleteProducts() {
    if (selectedProducts.size === 0 || !confirm(`Delete ${selectedProducts.size} products?`)) return;

    setBatchDeleting(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', Array.from(selectedProducts));

      if (error) throw error;

      setSelectedProducts(new Set());
      await loadProducts();
    } catch (error) {
      console.error('Failed to delete products:', error);
      alert('Failed to delete products');
    } finally {
      setBatchDeleting(false);
    }
  }

  function selectUnprocessed(count: number) {
    const unprocessed = products.filter(p => !p.processed).slice(0, count);
    setSelectedProducts(new Set(unprocessed.map(p => p.id)));
    setSelectCount(count);
  }

  function addMore5() {
    const newCount = selectCount + 5;
    selectUnprocessed(newCount);
  }

  function remove5() {
    const newCount = Math.max(5, selectCount - 5);
    selectUnprocessed(newCount);
  }

  function selectAll() {
    setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
  }

  async function addProduct() {
    if (!newProduct.name || !newProduct.category || !newProduct.price) return;
    if (!uploadFiles.mainImage && !newProduct.image_url) {
      alert('Please upload a main image or provide an image URL');
      return;
    }
    
    setAdding(true);
    setUploading(true);
    
    try {
      let imageUrls: string[] = [];
      let view360Urls: string[] = [];
      let videoUrl = newProduct.youtube_url || '';

      if (uploadFiles.mainImage || uploadFiles.albumImages.length > 0 || uploadFiles.view360Images.length > 0 || uploadFiles.video) {
        const { uploadProductImages } = await import('@/lib/upload-helper');
        const urls = await uploadProductImages(
          newProduct.name,
          uploadFiles,
          setUploadProgress
        );

        if (urls.mainImage) imageUrls.push(urls.mainImage);
        if (urls.albumImages) imageUrls.push(...urls.albumImages);
        if (urls.view360Images) view360Urls = urls.view360Images;
        if (urls.videoUrl) videoUrl = urls.videoUrl;
      } else if (newProduct.image_url) {
        imageUrls = [newProduct.image_url];
      }

      const { data, error } = await supabase
        .from('products')
        .insert({
          name: newProduct.name,
          slug: newProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
          category: newProduct.category,
          price: parseFloat(newProduct.price),
          material: newProduct.material || 'gold',
          description: newProduct.description || null,
          image_urls: imageUrls,
          view_360_images: view360Urls,
          youtube_url: videoUrl || null,
          stock: 10
        })
        .select()
        .single();

      if (error) throw error;

      setNewProduct({ name: '', category: '', price: '', material: '', description: '', image_url: '', youtube_url: '' });
      setUploadFiles({ albumImages: [], view360Images: [] });
      setUploadProgress(0);
      await loadProducts();
    } catch (error) {
      console.error('Failed to add product:', error);
      alert('Failed to add product');
    } finally {
      setAdding(false);
      setUploading(false);
    }
  }

  function stopProcessing() {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setProcessing(false);
      setResults({ message: 'Processing stopped by user', results: liveProgress });
    }
  }

  async function processSelectedProducts() {
    if (selectedProducts.size === 0) {
      alert('Please select products to process');
      return;
    }

    const controller = new AbortController();
    setAbortController(controller);
    setProcessing(true);
    setResults(null);
    setLiveProgress([]);
    setLiveLogs([]);
    setShowDetails(true);

    try {
      const res = await fetch('/api/batch-process-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: Array.from(selectedProducts) }),
        signal: controller.signal,
      });
      
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim()) {
              try {
                const data = JSON.parse(line);
                if (data.log) {
                  setLiveLogs(prev => [...prev, { log: data.log, subProgress: data.subProgress }]);
                } else if (data.progress) {
                  setLiveProgress(prev => [...prev, data.progress]);
                } else if (data.complete) {
                  setResults(data.complete);
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setResults({ message: 'Processing stopped', results: liveProgress });
      } else {
        setResults({ error: String(error) });
      }
    } finally {
      setProcessing(false);
      setAbortController(null);
      await loadProducts();
      setSelectedProducts(new Set());
    }
  }

  const filteredProducts = products.filter(p => {
    if (filter === 'processed') return p.processed;
    if (filter === 'failed') return p.failed;
    if (filter === 'unprocessed') return !p.processed && !p.failed;
    return true;
  });

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-light text-brown-900 dark:text-cream-50">
            Admin - Product Management
          </h1>
          <a
            href="/admin/analytics"
            className="px-6 py-3 border border-gold-600 text-gold-600 hover:bg-gold-600 hover:text-white transition-colors text-sm"
          >
            View Analytics
          </a>
        </div>

        {currentPassword && (
          <div className="mb-6 p-4 border border-gold-500 bg-gold-50 dark:bg-brown-800">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm text-brown-900 dark:text-cream-50">
                  <span className="font-light">Current Admin Password:</span> 
                  <code className="ml-2 px-2 py-1 bg-brown-100 dark:bg-brown-700 text-gold-600 dark:text-gold-400 font-mono">
                    {currentPassword}
                  </code>
                </p>
                <p className="text-xs text-brown-600 dark:text-cream-300 mt-2">
                  Save this password. It expires in 24 hours.
                </p>
              </div>
              <button
                onClick={forceRefreshPassword}
                disabled={refreshingPassword}
                className="ml-4 px-4 py-2 text-xs border border-gold-600 text-gold-600 hover:bg-gold-600 hover:text-white transition-colors disabled:opacity-50 flex items-center gap-2"
                title="Generate new password and reset 24h timer"
              >
                {refreshingPassword ? (
                  '...'
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="border border-brown-200 dark:border-brown-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-light">Products ({filteredProducts.length})</h2>
                <div className="flex gap-2">
                  <button onClick={() => setFilter('all')} className={`px-3 py-1 text-xs ${filter === 'all' ? 'bg-gold-600 text-white' : 'border border-brown-300 dark:border-brown-600'}`}>All</button>
                  <button onClick={() => setFilter('unprocessed')} className={`px-3 py-1 text-xs ${filter === 'unprocessed' ? 'bg-gold-600 text-white' : 'border border-brown-300 dark:border-brown-600'}`}>Unprocessed</button>
                  <button onClick={() => setFilter('processed')} className={`px-3 py-1 text-xs ${filter === 'processed' ? 'bg-gold-600 text-white' : 'border border-brown-300 dark:border-brown-600'}`}>Processed</button>
                  <button onClick={() => setFilter('failed')} className={`px-3 py-1 text-xs ${filter === 'failed' ? 'bg-gold-600 text-white' : 'border border-brown-300 dark:border-brown-600'}`}>Failed</button>
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <div className="flex border border-brown-300 dark:border-brown-600">
                  <button onClick={selectAll} className="px-3 py-2 text-xs hover:bg-brown-100 dark:hover:bg-brown-800 border-r border-brown-300 dark:border-brown-600">All</button>
                  <button onClick={() => selectUnprocessed(5)} className="px-3 py-2 text-xs hover:bg-brown-100 dark:hover:bg-brown-800">{selectCount} Unprocessed</button>
                </div>
                {selectedProducts.size > 0 && selectedProducts.size === selectCount && (
                  <div className="flex border border-brown-300 dark:border-brown-600">
                    {selectCount >= 10 && (
                      <button onClick={remove5} className="px-2 py-2 text-xs hover:bg-brown-100 dark:hover:bg-brown-800 border-r border-brown-300 dark:border-brown-600">−</button>
                    )}
                    <button onClick={addMore5} className="px-2 py-2 text-xs hover:bg-brown-100 dark:hover:bg-brown-800">+</button>
                  </div>
                )}
                <button onClick={() => setSelectedProducts(new Set())} className="px-4 py-2 text-xs border border-brown-300 dark:border-brown-600 hover:bg-brown-100 dark:hover:bg-brown-800">Clear</button>
                {selectedProducts.size > 0 && (
                  <>
                    <button 
                      onClick={batchDeleteProducts}
                      disabled={batchDeleting}
                      className="px-4 py-2 text-xs border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50"
                    >
                      {batchDeleting ? 'Deleting...' : `Delete ${selectedProducts.size}`}
                    </button>
                    <button 
                      onClick={processSelectedProducts}
                      disabled={processing}
                      className="px-4 py-2 text-xs border border-gold-600 text-gold-600 hover:bg-gold-600 hover:text-white transition-colors disabled:opacity-50"
                    >
                      {processing ? 'Processing...' : `Process ${selectedProducts.size}`}
                    </button>
                  </>
                )}
              </div>

              {loading ? (
                <p className="text-brown-600 dark:text-cream-300">Loading products...</p>
              ) : (
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredProducts.map(product => (
                    <div key={product.id} className="flex items-center gap-3 p-3 border border-brown-200 dark:border-brown-700 hover:bg-brown-50 dark:hover:bg-brown-800">
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.id)}
                        onChange={() => toggleProduct(product.id)}
                        className="w-4 h-4"
                      />
                      <div className="flex-1 flex items-center gap-3 cursor-pointer" onClick={() => openProductModal(product)}>
                        {product.image_urls[0] && (
                          <img src={product.image_urls[0]} alt={product.name} className="w-12 h-12 object-cover" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm text-brown-900 dark:text-cream-50">{product.name}</p>
                          <p className="text-xs text-brown-600 dark:text-cream-300">{product.category} - ${product.price}</p>
                          {product.failed && product.error && (
                            <p className="text-xs text-red-600 mt-1 truncate" title={product.error}>{product.error}</p>
                          )}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 ${product.processed ? 'bg-green-100 text-green-700' : product.failed ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {product.processed ? '✓ Processed' : product.failed ? '✗ Failed' : '○ Unprocessed'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border border-brown-200 dark:border-brown-700 p-6">
              <h2 className="text-xl font-light mb-4">Process Selected Products</h2>
              <p className="text-sm text-brown-600 dark:text-cream-300 mb-4">
                Selected: {selectedProducts.size} products
              </p>

              <div className="flex gap-4">
                <button
                  onClick={processSelectedProducts}
                  disabled={processing || selectedProducts.size === 0}
                  className="px-8 py-3 border border-brown-900 dark:border-cream-50 text-brown-900 dark:text-cream-50 hover:bg-brown-900 hover:text-cream-50 dark:hover:bg-cream-50 dark:hover:text-brown-900 transition-colors disabled:opacity-50"
                >
                  {processing ? 'Processing...' : `Process ${selectedProducts.size} Products`}
                </button>
                {processing && (
                  <>
                    <button
                      onClick={stopProcessing}
                      className="px-6 py-3 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors text-sm"
                    >
                      Stop
                    </button>
                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className="px-6 py-3 text-brown-600 dark:text-cream-300 hover:text-brown-900 dark:hover:text-cream-50 transition-colors text-sm"
                    >
                      {showDetails ? 'Hide Details' : 'Show Details'}
                    </button>
                  </>
                )}
              </div>

              {showDetails && liveLogs.length > 0 && (
                <div 
                  ref={(el) => {
                    setTerminalRef(el);
                    if (el) el.scrollTop = el.scrollHeight;
                  }}
                  className="mt-6 p-4 border border-brown-200 dark:border-brown-700 max-h-96 overflow-y-auto bg-black"
                >
                  <div className="space-y-0 text-xs font-mono">
                    {liveLogs.map((item, idx) => (
                      <div key={idx} className="text-green-400">
                        {item.log}
                        {item.subProgress !== undefined && (
                          <span className="ml-2 text-gray-500">[{item.subProgress}%]</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {processing && !showDetails && (
                <div className="mt-6">
                  <div className="w-1 h-20 bg-gold-500 animate-bounce-vertical" />
                  <p className="text-brown-600 dark:text-cream-300 mt-4">
                    Processing {liveProgress.length} products...
                  </p>
                </div>
              )}

              {results && (
                <div className="mt-6 p-4 border border-brown-200 dark:border-brown-700">
                  <h3 className="font-light mb-2">Results:</h3>
                  {results.error ? (
                    <p className="text-red-600">{results.error}</p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-brown-900 dark:text-cream-50">{results.message}</p>
                      <p className="text-brown-900 dark:text-cream-50">
                        Successful: {results.results?.filter((r: any) => r.success).length}
                      </p>
                      <p className="text-brown-900 dark:text-cream-50">
                        Failed: {results.results?.filter((r: any) => !r.success).length}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="border border-brown-200 dark:border-brown-700 p-6 max-h-[600px] overflow-y-auto">
            <h2 className="text-xl font-light mb-4">Add New Product</h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Product Name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="w-full px-3 py-2 border border-brown-200 dark:border-brown-700 bg-transparent text-brown-900 dark:text-cream-50 text-sm focus:outline-none focus:border-gold-500"
              />
              <select
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                className="w-full px-3 py-2 border border-brown-200 dark:border-brown-700 bg-transparent text-brown-900 dark:text-cream-50 text-sm focus:outline-none focus:border-gold-500"
              >
                <option value="">Select Category</option>
                <option value="ring">Ring</option>
                <option value="necklace">Necklace</option>
                <option value="bracelet">Bracelet</option>
                <option value="earring">Earring</option>
                <option value="pendant">Pendant</option>
                <option value="watch">Watch</option>
              </select>
              <input
                type="number"
                placeholder="Price"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                className="w-full px-3 py-2 border border-brown-200 dark:border-brown-700 bg-transparent text-brown-900 dark:text-cream-50 text-sm focus:outline-none focus:border-gold-500"
              />
              <input
                type="text"
                placeholder="Material (e.g., gold, silver)"
                value={newProduct.material}
                onChange={(e) => setNewProduct({ ...newProduct, material: e.target.value })}
                className="w-full px-3 py-2 border border-brown-200 dark:border-brown-700 bg-transparent text-brown-900 dark:text-cream-50 text-sm focus:outline-none focus:border-gold-500"
              />
              <textarea
                placeholder="Description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                className="w-full px-3 py-2 border border-brown-200 dark:border-brown-700 bg-transparent text-brown-900 dark:text-cream-50 text-sm focus:outline-none focus:border-gold-500 resize-none"
                rows={3}
              />
              <div>
                <label className="text-xs text-brown-600 dark:text-cream-300 mb-1 block">Main Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setUploadFiles({ ...uploadFiles, mainImage: file });
                  }}
                  className="w-full px-3 py-2 border border-brown-200 dark:border-brown-700 bg-transparent text-brown-900 dark:text-cream-50 text-xs focus:outline-none focus:border-gold-500"
                />
                {uploadFiles.mainImage && (
                  <img src={URL.createObjectURL(uploadFiles.mainImage)} alt="Preview" className="mt-2 w-8 h-8 object-cover border border-brown-200" />
                )}
              </div>

              <div>
                <label className="text-xs text-brown-600 dark:text-cream-300 mb-1 block">Album Images (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setUploadFiles({ ...uploadFiles, albumImages: files });
                  }}
                  className="w-full px-3 py-2 border border-brown-200 dark:border-brown-700 bg-transparent text-brown-900 dark:text-cream-50 text-xs focus:outline-none focus:border-gold-500"
                />
                {uploadFiles.albumImages.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {uploadFiles.albumImages.map((file, idx) => (
                      <img key={idx} src={URL.createObjectURL(file)} alt={`Album ${idx}`} className="w-8 h-8 object-cover border border-brown-200" />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs text-brown-600 dark:text-cream-300 mb-1 block">360° Images (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setUploadFiles({ ...uploadFiles, view360Images: files });
                  }}
                  className="w-full px-3 py-2 border border-brown-200 dark:border-brown-700 bg-transparent text-brown-900 dark:text-cream-50 text-xs focus:outline-none focus:border-gold-500"
                />
                {uploadFiles.view360Images.length > 0 && (
                  <p className="text-xs text-brown-600 dark:text-cream-300 mt-1">{uploadFiles.view360Images.length} images selected</p>
                )}
              </div>

              <div>
                <label className="text-xs text-brown-600 dark:text-cream-300 mb-1 block">Video (optional)</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setUploadFiles({ ...uploadFiles, video: file });
                  }}
                  className="w-full px-3 py-2 border border-brown-200 dark:border-brown-700 bg-transparent text-brown-900 dark:text-cream-50 text-xs focus:outline-none focus:border-gold-500"
                />
                {uploadFiles.video && (
                  <p className="text-xs text-brown-600 dark:text-cream-300 mt-1">{uploadFiles.video.name}</p>
                )}
              </div>

              <input
                type="text"
                placeholder="YouTube URL (optional)"
                value={newProduct.youtube_url}
                onChange={(e) => setNewProduct({ ...newProduct, youtube_url: e.target.value })}
                className="w-full px-3 py-2 border border-brown-200 dark:border-brown-700 bg-transparent text-brown-900 dark:text-cream-50 text-sm focus:outline-none focus:border-gold-500"
              />

              <input
                type="text"
                placeholder="Or Image URL"
                value={newProduct.image_url}
                onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                className="w-full px-3 py-2 border border-brown-200 dark:border-brown-700 bg-transparent text-brown-900 dark:text-cream-50 text-sm focus:outline-none focus:border-gold-500"
              />
              {uploading && uploadProgress > 0 && (
                <div className="w-full">
                  <div className="w-full bg-brown-200 dark:bg-brown-700 h-2">
                    <div className="bg-gold-600 h-2 transition-all" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <p className="text-xs text-brown-600 dark:text-cream-300 mt-1 text-center">{uploadProgress}%</p>
                </div>
              )}

              <button
                onClick={addProduct}
                disabled={adding || !newProduct.name || !newProduct.category || !newProduct.price}
                className="w-full px-6 py-3 border border-brown-900 dark:border-cream-50 text-brown-900 dark:text-cream-50 hover:bg-brown-900 hover:text-cream-50 dark:hover:bg-cream-50 dark:hover:text-brown-900 transition-colors disabled:opacity-50 text-sm"
              >
                {adding ? (uploading ? `Uploading... ${uploadProgress}%` : 'Adding...') : 'Add Product'}
              </button>
            </div>
          </div>
        </div>

        {selectedProduct && editProduct && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedProduct(null)}>
            <div className="bg-cream-50 dark:bg-brown-900 border border-brown-200 dark:border-brown-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-light text-brown-900 dark:text-cream-50">{selectedProduct.name}</h2>
                  <button onClick={() => setSelectedProduct(null)} className="text-brown-600 dark:text-cream-300 hover:text-brown-900 dark:hover:text-cream-50">✕</button>
                </div>

                {analytics && (
                  <div className="mb-6 p-4 border border-brown-200 dark:border-brown-700">
                    <p className="text-xs text-brown-600 dark:text-cream-300 mb-3">Product Analytics</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-brown-600 dark:text-cream-300">Views</p>
                        <p className="text-2xl font-light text-brown-900 dark:text-cream-50">{analytics.views}</p>
                      </div>
                      <div>
                        <p className="text-xs text-brown-600 dark:text-cream-300">Clicks</p>
                        <p className="text-2xl font-light text-brown-900 dark:text-cream-50">{analytics.clicks}</p>
                      </div>
                      <div>
                        <p className="text-xs text-brown-600 dark:text-cream-300">Cart Adds</p>
                        <p className="text-2xl font-light text-brown-900 dark:text-cream-50">{analytics.cartAdds}</p>
                      </div>
                      <div>
                        <p className="text-xs text-brown-600 dark:text-cream-300">Favorites</p>
                        <p className="text-2xl font-light text-brown-900 dark:text-cream-50">{analytics.favorites}</p>
                      </div>
                      <div>
                        <p className="text-xs text-brown-600 dark:text-cream-300">Orders</p>
                        <p className="text-2xl font-light text-brown-900 dark:text-cream-50">{analytics.orders}</p>
                      </div>
                      <div>
                        <p className="text-xs text-brown-600 dark:text-cream-300">AI Recommendations</p>
                        <p className="text-2xl font-light text-brown-900 dark:text-cream-50">{analytics.aiRecommendations}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-brown-600 dark:text-cream-300 mb-1 block">Product Name</label>
                    <input
                      type="text"
                      value={editProduct.name}
                      onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                      className="w-full px-3 py-2 border border-brown-200 dark:border-brown-700 bg-transparent text-brown-900 dark:text-cream-50 text-sm focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-brown-600 dark:text-cream-300 mb-1 block">Category</label>
                    <select
                      value={editProduct.category}
                      onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
                      className="w-full px-3 py-2 border border-brown-200 dark:border-brown-700 bg-transparent text-brown-900 dark:text-cream-50 text-sm focus:outline-none focus:border-gold-500"
                    >
                      <option value="ring">Ring</option>
                      <option value="necklace">Necklace</option>
                      <option value="bracelet">Bracelet</option>
                      <option value="earring">Earring</option>
                      <option value="pendant">Pendant</option>
                      <option value="watch">Watch</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-brown-600 dark:text-cream-300 mb-1 block">Price</label>
                      <input
                        type="number"
                        value={editProduct.price}
                        onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                        className="w-full px-3 py-2 border border-brown-200 dark:border-brown-700 bg-transparent text-brown-900 dark:text-cream-50 text-sm focus:outline-none focus:border-gold-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-brown-600 dark:text-cream-300 mb-1 block">Material</label>
                      <input
                        type="text"
                        value={editProduct.material}
                        onChange={(e) => setEditProduct({ ...editProduct, material: e.target.value })}
                        className="w-full px-3 py-2 border border-brown-200 dark:border-brown-700 bg-transparent text-brown-900 dark:text-cream-50 text-sm focus:outline-none focus:border-gold-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-brown-600 dark:text-cream-300 mb-1 block">Description</label>
                    <textarea
                      value={editProduct.description}
                      onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                      className="w-full px-3 py-2 border border-brown-200 dark:border-brown-700 bg-transparent text-brown-900 dark:text-cream-50 text-sm focus:outline-none focus:border-gold-500 resize-none"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="text-xs text-brown-600 dark:text-cream-300 mb-1 block">Image URL</label>
                    <input
                      type="text"
                      value={editProduct.image_url}
                      onChange={(e) => setEditProduct({ ...editProduct, image_url: e.target.value })}
                      className="w-full px-3 py-2 border border-brown-200 dark:border-brown-700 bg-transparent text-brown-900 dark:text-cream-50 text-sm focus:outline-none focus:border-gold-500"
                    />
                    {editProduct.image_url && (
                      <img src={editProduct.image_url} alt="Preview" className="mt-2 w-32 h-32 object-cover border border-brown-200 dark:border-brown-700" />
                    )}
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={saveProduct}
                    disabled={saving}
                    className="flex-1 px-6 py-3 border border-brown-900 dark:border-cream-50 text-brown-900 dark:text-cream-50 hover:bg-brown-900 hover:text-cream-50 dark:hover:bg-cream-50 dark:hover:text-brown-900 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={deleteProduct}
                    disabled={deleting}
                    className="px-6 py-3 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-brown-200 dark:border-brown-700 text-center">
          <button
            onClick={() => window.location.href = '/'}
            className="px-8 py-3 border border-brown-900 dark:border-cream-50 text-brown-900 dark:text-cream-50 hover:bg-brown-900 hover:text-cream-50 dark:hover:bg-cream-50 dark:hover:text-brown-900 transition-colors"
          >
            Exit Admin
          </button>
        </div>
      </div>
    </div>
  );
}
