'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';

export default function ShopPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*');
    if (!error && data) {
      setAllProducts(data);
      const categories = [...new Set(data.map(p => p.category))];
      console.log('Available categories in database:', categories);
      console.log('Products by category:', categories.map(cat => ({ category: cat, count: data.filter(p => p.category === cat).length })));
    }
    setLoading(false);
  }

  const materials = useMemo(() => {
    const mats = new Set(allProducts.map(p => p.material).filter(Boolean));
    return ['all', ...Array.from(mats)];
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    let filtered = allProducts;

    if (category !== 'all') {
      filtered = filtered.filter(p => p.category === category);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description?.toLowerCase().includes(query)
      );
    }

    if (selectedMaterial !== 'all') {
      filtered = filtered.filter(p => p.material === selectedMaterial);
    }

    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'name': return a.name.localeCompare(b.name);
        default: return 0;
      }
    });

    return filtered;
  }, [allProducts, category, searchQuery, selectedMaterial, priceRange, sortBy]);

  const clearFilters = () => {
    setCategory('all');
    setSearchQuery('');
    setSortBy('name');
    setPriceRange([0, 10000000]);
    setSelectedMaterial('all');
  };

  const hasActiveFilters = category !== 'all' || searchQuery || selectedMaterial !== 'all' || priceRange[0] > 0 || priceRange[1] < 10000000;

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Breadcrumb */}
      <div className="border-b border-brown-200 dark:border-brown-700">
        <div className="container mx-auto px-4 md:px-8 py-4">
          <p className="text-sm text-brown-600 dark:text-cream-300">
            <span className="hover:text-gold-600 dark:hover:text-gold-400 cursor-pointer">Home</span>
            <span className="mx-2">/</span>
            <span className="text-gold-600 dark:text-gold-400">Shop</span>
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="flex items-center justify-between mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-light text-brown-900 dark:text-cream-50">Collections</h1>
          <p className="text-sm text-brown-600 dark:text-cream-300">{filteredProducts.length} pieces</p>
        </div>

        {/* Search & Sort */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search jewelry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-brown-200 dark:border-brown-700 bg-transparent text-brown-900 dark:text-cream-50 focus:border-gold-500 outline-none transition-colors"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-brown-200 dark:border-brown-700 bg-transparent text-brown-900 dark:text-cream-50 focus:border-gold-500 outline-none transition-colors"
          >
            <option value="name">Sort by Name</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        {/* Category Filters */}
        <div className="mb-6 flex gap-4 md:gap-8 flex-wrap border-b border-brown-200 dark:border-brown-700 pb-4 overflow-x-auto">
          {['all', 'ring', 'necklace', 'bracelet', 'earring', 'watch', 'pendant'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`text-sm tracking-wider transition-all pb-2 whitespace-nowrap ${
                category === cat
                  ? 'text-gold-600 dark:text-gold-400 border-b-2 border-gold-600 dark:border-gold-400'
                  : 'text-brown-600 dark:text-cream-300 hover:text-gold-600 dark:hover:text-gold-400'
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Material & Price Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-6 pb-6 border-b border-brown-200 dark:border-brown-700">
          <div className="flex-1">
            <label className="text-xs tracking-wider text-brown-600 dark:text-cream-300 mb-2 block">MATERIAL</label>
            <select
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
              className="w-full px-4 py-2 border border-brown-200 dark:border-brown-700 bg-transparent text-brown-900 dark:text-cream-50 focus:border-gold-500 outline-none transition-colors"
            >
              {materials.map(mat => (
                <option key={mat} value={mat}>{mat === 'all' ? 'All Materials' : mat}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs tracking-wider text-brown-600 dark:text-cream-300 mb-2 block">
              PRICE RANGE: ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}
            </label>
            <div className="flex gap-4">
              <input
                type="range"
                min="0"
                max="10000000"
                step="1000"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                className="flex-1"
              />
              <input
                type="range"
                min="0"
                max="10000000"
                step="1000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                className="flex-1"
              />
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="mb-6 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-brown-600 dark:text-cream-300">Active filters:</span>
            {category !== 'all' && (
              <button onClick={() => setCategory('all')} className="text-xs px-3 py-1 border border-gold-500 text-gold-600 dark:text-gold-400 hover:bg-gold-500 hover:text-white transition-colors">
                {category} ×
              </button>
            )}
            {selectedMaterial !== 'all' && (
              <button onClick={() => setSelectedMaterial('all')} className="text-xs px-3 py-1 border border-gold-500 text-gold-600 dark:text-gold-400 hover:bg-gold-500 hover:text-white transition-colors">
                {selectedMaterial} ×
              </button>
            )}
            <button onClick={clearFilters} className="text-xs text-brown-600 dark:text-cream-300 hover:text-gold-600 dark:hover:text-gold-400 underline">
              Clear all
            </button>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-32">
            <div className="w-px h-16 bg-gold-500 mx-auto animate-pulse" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-lg text-brown-600 dark:text-cream-300 mb-4">No pieces found</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-sm text-gold-600 dark:text-gold-400 hover:underline">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
