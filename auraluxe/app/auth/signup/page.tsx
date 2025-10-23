'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }
    
    if (data.user) {
      const { error: profileError } = await supabase.from('users').insert({
        id: data.user.id,
        email,
        name,
      });
      
      if (profileError) {
        console.error('Profile creation error:', profileError);
      }
      
      alert('Account created successfully!');
      window.location.href = '/';
    }
    setLoading(false);
  }

  async function handleGoogleSignup() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen w-full">
        {/* Left Column - Form */}
        <div className="flex flex-col justify-center px-6 md:px-16 py-12 md:py-20 lg:border-r border-brown-200 dark:border-brown-700">
          <div className="max-w-md">
            <div className="mb-8 md:mb-12">
              <p className="text-xs md:text-sm tracking-widest text-brown-600 dark:text-cream-300 mb-2">JOIN AURALUXE</p>
              <h1 className="text-3xl md:text-5xl font-light text-brown-900 dark:text-cream-50 mb-4">Create Account</h1>
              <div className="w-16 h-px bg-gold-500" />
            </div>

            <form onSubmit={handleSignup} className="space-y-6 md:space-y-8">
              <div>
                <label className="block text-xs tracking-wider text-brown-600 dark:text-cream-300 mb-2">FULL NAME</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-xs tracking-wider text-brown-600 dark:text-cream-300 mb-2">EMAIL</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-xs tracking-wider text-brown-600 dark:text-cream-300 mb-2">PASSWORD</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  required
                  minLength={6}
                />
                <p className="text-xs text-brown-500 dark:text-cream-400 mt-2">Minimum 6 characters</p>
              </div>
              <button type="submit" className="btn-primary text-base md:text-lg pb-2" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <div className="my-8 flex items-center gap-4">
              <div className="flex-1 h-px bg-brown-200 dark:bg-brown-700" />
              <span className="text-xs text-brown-600 dark:text-cream-300">OR</span>
              <div className="flex-1 h-px bg-brown-200 dark:bg-brown-700" />
            </div>

            <button onClick={handleGoogleSignup} className="btn-secondary text-base md:text-lg pb-2 w-full text-center">
              Continue with Google
            </button>

            <p className="mt-12 text-sm text-brown-600 dark:text-cream-300">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-gold-600 dark:text-gold-400 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Right Column - Image/Content */}
        <div className="relative h-[40vh] lg:h-screen bg-gradient-to-br from-brown-800 to-brown-900 dark:from-brown-950 dark:to-black flex items-center justify-center w-full">
          <div className="text-center px-6 md:px-8">
            <div className="text-4xl md:text-6xl text-gold-400 mb-4 md:mb-6">○</div>
            <h2 className="text-2xl md:text-3xl font-light text-cream-50 mb-4">Begin Your Journey</h2>
            <p className="text-cream-200 max-w-md">Join our exclusive community and discover pieces that define your unique style</p>
          </div>
        </div>
      </div>
    </div>
  );
}
