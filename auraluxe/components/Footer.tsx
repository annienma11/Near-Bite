'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Footer() {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const router = useRouter();

  async function handleAdminAccess() {
    setShowPasswordModal(true);
    setPassword('');
    setError('');
  }

  async function verifyPassword() {
    if (!password.trim()) return;
    
    setChecking(true);
    setError('');

    try {
      const res = await fetch('/api/admin-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.valid) {
        setShowPasswordModal(false);
        router.push('/admin');
      } else {
        setError('Invalid or expired password');
      }
    } catch (err) {
      setError('Failed to verify password');
    } finally {
      setChecking(false);
    }
  }
  return (
    <footer className="border-t border-brown-200 dark:border-brown-700 mt-32">
      <div className="container mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h3 className="text-2xl font-light tracking-widest text-gold-600 dark:text-gold-400 mb-4">AURALUXE</h3>
            <p className="text-sm text-brown-600 dark:text-cream-300 leading-relaxed">Timeless elegance, crafted with precision</p>
          </div>
          <div>
            <h4 className="text-sm tracking-wider mb-4 text-brown-900 dark:text-cream-50">COLLECTIONS</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/shop?category=ring" className="text-brown-600 dark:text-cream-300 hover:text-gold-600 dark:hover:text-gold-400 transition-colors">Rings</a></li>
              <li><a href="/shop?category=necklace" className="text-brown-600 dark:text-cream-300 hover:text-gold-600 dark:hover:text-gold-400 transition-colors">Necklaces</a></li>
              <li><a href="/shop?category=bracelet" className="text-brown-600 dark:text-cream-300 hover:text-gold-600 dark:hover:text-gold-400 transition-colors">Bracelets</a></li>
              <li><a href="/shop?category=earring" className="text-brown-600 dark:text-cream-300 hover:text-gold-600 dark:hover:text-gold-400 transition-colors">Earrings</a></li>
              <li><a href="/shop?category=pendant" className="text-brown-600 dark:text-cream-300 hover:text-gold-600 dark:hover:text-gold-400 transition-colors">Pendants</a></li>
              <li><a href="/shop?category=watch" className="text-brown-600 dark:text-cream-300 hover:text-gold-600 dark:hover:text-gold-400 transition-colors">Watches</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm tracking-wider mb-4 text-brown-900 dark:text-cream-50">SUPPORT</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-brown-600 dark:text-cream-300 hover:text-gold-600 dark:hover:text-gold-400 transition-colors">Contact</a></li>
              <li><a href="#" className="text-brown-600 dark:text-cream-300 hover:text-gold-600 dark:hover:text-gold-400 transition-colors">Shipping</a></li>
              <li><a href="#" className="text-brown-600 dark:text-cream-300 hover:text-gold-600 dark:hover:text-gold-400 transition-colors">Returns</a></li>
              <li><a href="#" className="text-brown-600 dark:text-cream-300 hover:text-gold-600 dark:hover:text-gold-400 transition-colors">Care Guide</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm tracking-wider mb-4 text-brown-900 dark:text-cream-50">CONNECT</h4>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-brown-600 dark:text-cream-300 hover:text-gold-600 dark:hover:text-gold-400 transition-colors">IG</a>
              <a href="#" className="text-brown-600 dark:text-cream-300 hover:text-gold-600 dark:hover:text-gold-400 transition-colors">FB</a>
              <a href="#" className="text-brown-600 dark:text-cream-300 hover:text-gold-600 dark:hover:text-gold-400 transition-colors">TW</a>
            </div>
          </div>
        </div>
        <div className="border-t border-brown-200 dark:border-brown-700 mt-12 pt-8 flex justify-between items-center text-xs text-brown-600 dark:text-cream-300">
          <button 
            onClick={handleAdminAccess}
            className="hover:text-gold-600 dark:hover:text-gold-400 transition-colors"
          >
            &copy; 2024 Auraluxe. All rights reserved.
          </button>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gold-600 dark:hover:text-gold-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gold-600 dark:hover:text-gold-400 transition-colors">Terms</a>
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowPasswordModal(false)}>
          <div className="bg-cream-50 dark:bg-brown-900 border border-brown-200 dark:border-brown-700 p-8 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-light text-brown-900 dark:text-cream-50 mb-4">Admin Access</h3>
            <p className="text-sm text-brown-600 dark:text-cream-300 mb-6">
              Enter the admin password to continue
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && verifyPassword()}
              placeholder="Password"
              className="w-full px-4 py-3 border border-brown-200 dark:border-brown-700 bg-transparent text-brown-900 dark:text-cream-50 focus:outline-none focus:border-gold-500 mb-4"
              autoFocus
            />
            {error && (
              <p className="text-sm text-red-600 mb-4">{error}</p>
            )}
            <div className="flex gap-4">
              <button
                onClick={verifyPassword}
                disabled={checking || !password.trim()}
                className="flex-1 px-6 py-3 border border-brown-900 dark:border-cream-50 text-brown-900 dark:text-cream-50 hover:bg-brown-900 hover:text-cream-50 dark:hover:bg-cream-50 dark:hover:text-brown-900 transition-colors disabled:opacity-50"
              >
                {checking ? 'Verifying...' : 'Access'}
              </button>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-6 py-3 text-brown-600 dark:text-cream-300 hover:text-brown-900 dark:hover:text-cream-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
