'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { User } from '@/types';

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (authUser) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [authUser]);

  async function fetchProfile() {
    if (!authUser) return;

    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (data) {
      setUser(data);
      setName(data.name || '');
      setAddress(data.address || '');
    }
    setLoading(false);
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!authUser) return;

    const { error } = await supabase
      .from('users')
      .update({ name, address })
      .eq('id', authUser.id);

    if (!error) {
      alert('Profile updated!');
      setEditing(false);
      fetchProfile();
    } else {
      alert('Error updating profile');
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  if (loading) return <div className="container mx-auto px-4 py-12">Loading...</div>;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl text-gold-500 mb-6">◈</div>
          <h1 className="text-4xl font-light mb-4 text-brown-900 dark:text-cream-50">Profile</h1>
          <p className="text-lg text-brown-600 dark:text-cream-300 mb-8">Please sign in to view your profile</p>
          <a href="/auth/login" className="btn-primary text-lg pb-2">Sign In</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="border-b border-brown-200 dark:border-brown-700">
        <div className="container mx-auto px-4 md:px-8 py-4">
          <p className="text-sm text-brown-600 dark:text-cream-300">
            <span className="hover:text-gold-600 dark:hover:text-gold-400 cursor-pointer">Home</span>
            <span className="mx-2">/</span>
            <span className="text-gold-600 dark:text-gold-400">Profile</span>
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-8 md:py-16">
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-light text-brown-900 dark:text-cream-50 mb-4">My Profile</h1>
          <div className="w-16 h-px bg-gold-500" />
        </div>

        <div className="max-w-2xl border border-brown-200 dark:border-brown-700 p-6 md:p-12">
        {editing ? (
          <form onSubmit={handleUpdate} className="space-y-6 md:space-y-8">
            <div>
              <label className="block text-xs tracking-wider text-brown-600 dark:text-cream-300 mb-2">NAME</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs tracking-wider text-brown-600 dark:text-cream-300 mb-2">EMAIL</label>
              <p className="text-lg text-brown-600 dark:text-cream-400 py-2">{user.email}</p>
            </div>
            <div>
              <label className="block text-xs tracking-wider text-brown-600 dark:text-cream-300 mb-2">ADDRESS</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="input"
                rows={3}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 pt-4">
              <button type="submit" className="btn-primary text-base md:text-lg pb-2">
                Save Changes
              </button>
              <button type="button" onClick={() => setEditing(false)} className="btn-secondary text-base md:text-lg pb-2">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6 md:space-y-8">
            <div>
              <label className="block text-xs tracking-wider text-brown-600 dark:text-cream-300 mb-2">NAME</label>
              <p className="text-lg text-brown-900 dark:text-cream-50">{user.name || 'Not set'}</p>
            </div>
            <div>
              <label className="block text-xs tracking-wider text-brown-600 dark:text-cream-300 mb-2">EMAIL</label>
              <p className="text-lg text-brown-900 dark:text-cream-50">{user.email}</p>
            </div>
            <div>
              <label className="block text-xs tracking-wider text-brown-600 dark:text-cream-300 mb-2">ADDRESS</label>
              <p className="text-lg text-brown-900 dark:text-cream-50">{user.address || 'Not set'}</p>
            </div>
            <div className="pt-6 md:pt-8 flex flex-col sm:flex-row gap-4 sm:gap-8">
              <button onClick={() => setEditing(true)} className="btn-primary text-base md:text-lg pb-2">
                Edit Profile
              </button>
              <button onClick={handleSignOut} className="btn-secondary text-base md:text-lg pb-2">
                Sign Out
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
