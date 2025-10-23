'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from './AuthProvider';
import { supabase } from '@/lib/supabase';

const categories = [
  { name: 'Rings', slug: 'ring', subcategories: ['Engagement', 'Wedding', 'Statement', 'Stackable'] },
  { name: 'Necklaces', slug: 'necklace', subcategories: ['Pendants', 'Chains', 'Chokers', 'Lockets'] },
  { name: 'Bracelets', slug: 'bracelet', subcategories: ['Bangles', 'Cuffs', 'Tennis', 'Charm'] },
  { name: 'Earrings', slug: 'earring', subcategories: ['Studs', 'Hoops', 'Drops', 'Climbers'] },
  { name: 'Watches', slug: 'watch', subcategories: ['Luxury', 'Sport', 'Dress', 'Smart'] },
  { name: 'Pendants', slug: 'pendant', subcategories: ['Diamond', 'Gemstone', 'Locket', 'Cross'] },
];

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (user) fetchCartCount();
  }, [user]);

  async function fetchCartCount() {
    const { data } = await supabase
      .from('cart_items')
      .select('quantity')
      .eq('user_id', user?.id);
    if (data) {
      const total = data.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(total);
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-cream-50/95 dark:bg-brown-900/95 backdrop-blur-sm border-b border-brown-200 dark:border-brown-700 w-full">
      <nav className="container mx-auto px-4 md:px-6 py-4 md:py-6">
        <div className="flex items-center justify-between mb-0 md:mb-4">
          <Link href="/" className="text-2xl md:text-3xl font-light tracking-widest text-gold-600 dark:text-gold-400">
            AURALUXE
          </Link>

          <div className="flex items-center gap-4 md:gap-8">
            <button
              onClick={toggleTheme}
              className="text-brown-700 dark:text-cream-200 hover:text-gold-600 dark:hover:text-gold-400 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? '◐' : '◑'}
            </button>
            {user && (
              <Link href="/cart" className="relative nav-link pb-1">
                Cart
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-gold-600 dark:bg-gold-400 text-white dark:text-brown-900 text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
            {user ? (
              <Link href="/profile" className="nav-link pb-1">
                Profile
              </Link>
            ) : (
              <Link href="/auth/login" className="btn-primary pb-1">
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-brown-700 dark:text-cream-200"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-12 text-sm">
          <div className="relative group">
            <Link href="/shop" className="nav-link pb-1 inline-block">
              Shop
            </Link>
            <div className="absolute top-full left-0 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="bg-cream-50 dark:bg-brown-900 border border-brown-200 dark:border-brown-700 p-6 min-w-[600px] grid grid-cols-4 gap-6">
                {categories.map((cat) => (
                  <div key={cat.slug}>
                    <Link href={`/shop?category=${cat.slug}`} className="font-medium text-gold-600 dark:text-gold-400 hover:underline block mb-2">
                      {cat.name}
                    </Link>
                    <ul className="space-y-1">
                      {cat.subcategories.map((sub) => (
                        <li key={sub}>
                          <Link href={`/shop?category=${cat.slug}&sub=${sub.toLowerCase()}`} className="text-brown-600 dark:text-cream-300 hover:text-gold-600 dark:hover:text-gold-400 text-xs">
                            {sub}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative group">
            <span className="nav-link pb-1 inline-block cursor-pointer">
              Collections
            </span>
            <div className="absolute top-full left-0 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="bg-cream-50 dark:bg-brown-900 border border-brown-200 dark:border-brown-700 p-6 min-w-[300px]">
                <ul className="space-y-3">
                  <li><Link href="/collections/new-arrivals" className="text-brown-600 dark:text-cream-300 hover:text-gold-600 dark:hover:text-gold-400">New Arrivals</Link></li>
                  <li><Link href="/collections/bestsellers" className="text-brown-600 dark:text-cream-300 hover:text-gold-600 dark:hover:text-gold-400">Bestsellers</Link></li>
                  <li><Link href="/collections/limited-edition" className="text-brown-600 dark:text-cream-300 hover:text-gold-600 dark:hover:text-gold-400">Limited Edition</Link></li>
                  <li><Link href="/collections/bridal" className="text-brown-600 dark:text-cream-300 hover:text-gold-600 dark:hover:text-gold-400">Bridal Collection</Link></li>
                  <li><Link href="/collections/gifts" className="text-brown-600 dark:text-cream-300 hover:text-gold-600 dark:hover:text-gold-400">Gift Sets</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="relative group">
            <span className="nav-link pb-1 inline-block cursor-pointer">
              Services
            </span>
            <div className="absolute top-full left-0 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="bg-cream-50 dark:bg-brown-900 border border-brown-200 dark:border-brown-700 p-6 min-w-[300px]">
                <ul className="space-y-3">
                  <li><Link href="/style-advisor" className="text-brown-600 dark:text-cream-300 hover:text-gold-600 dark:hover:text-gold-400">AI Style Advisor</Link></li>
                  <li><Link href="/services/custom-design" className="text-brown-600 dark:text-cream-300 hover:text-gold-600 dark:hover:text-gold-400">Custom Design</Link></li>
                  <li><Link href="/services/engraving" className="text-brown-600 dark:text-cream-300 hover:text-gold-600 dark:hover:text-gold-400">Engraving</Link></li>
                  <li><Link href="/services/repair" className="text-brown-600 dark:text-cream-300 hover:text-gold-600 dark:hover:text-gold-400">Repair & Restoration</Link></li>
                  <li><Link href="/services/consultation" className="text-brown-600 dark:text-cream-300 hover:text-gold-600 dark:hover:text-gold-400">Personal Consultation</Link></li>
                </ul>
              </div>
            </div>
          </div>

          {user && (
            <>
              <Link href="/favorites" className="nav-link pb-1">
                Favorites
              </Link>
              <Link href="/orders" className="nav-link pb-1">
                Orders
              </Link>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-brown-200 dark:border-brown-700 mt-4 pt-4 pb-2">
            <div className="flex flex-col gap-4 text-sm">
              <Link href="/shop" className="nav-link pb-1" onClick={() => setMobileMenuOpen(false)}>
                Shop
              </Link>
              <Link href="/style-advisor" className="nav-link pb-1" onClick={() => setMobileMenuOpen(false)}>
                Style Advisor
              </Link>
              {user && (
                <>
                  <Link href="/favorites" className="nav-link pb-1" onClick={() => setMobileMenuOpen(false)}>
                    Favorites
                  </Link>
                  <Link href="/orders" className="nav-link pb-1" onClick={() => setMobileMenuOpen(false)}>
                    Orders
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
