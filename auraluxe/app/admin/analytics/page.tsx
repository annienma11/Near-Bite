'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#D4AF37', '#B87333', '#8B7355', '#6B5D4F', '#4A4238'];

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  
  const [stats, setStats] = useState({
    totalInteractions: 0,
    totalUsers: 0,
    totalProducts: 0,
    avgSessionTime: 0,
  });
  
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [interactionsByType, setInteractionsByType] = useState<any[]>([]);
  const [dailyInteractions, setDailyInteractions] = useState<any[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState<any[]>([]);
  const [recentInteractions, setRecentInteractions] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  async function loadAnalytics() {
    setLoading(true);
    try {
      const daysAgo = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const [
        interactionsRes,
        usersRes,
        productsRes,
        topProductsRes,
      ] = await Promise.all([
        supabase.from('user_interactions').select('*').gte('created_at', startDate.toISOString()),
        supabase.from('user_behavior_embeddings').select('user_id').gte('created_at', startDate.toISOString()),
        supabase.from('products').select('id, name, category'),
        supabase.from('user_interactions').select('product_id, products(name, category)').not('product_id', 'is', null).gte('created_at', startDate.toISOString()),
      ]);

      const interactions = interactionsRes.data || [];
      const products = productsRes.data || [];

      setStats({
        totalInteractions: interactions.length,
        totalUsers: new Set(usersRes.data?.map(u => u.user_id)).size,
        totalProducts: products.length,
        avgSessionTime: Math.round(interactions.length / Math.max(new Set(interactions.map(i => i.user_id)).size, 1) * 2.5),
      });

      const productClicks = topProductsRes.data?.reduce((acc: any, curr: any) => {
        if (curr.products) {
          const key = curr.products.name;
          acc[key] = (acc[key] || 0) + 1;
        }
        return acc;
      }, {});

      const topProductsData = Object.entries(productClicks || {})
        .map(([name, count]) => ({ name, clicks: count }))
        .sort((a: any, b: any) => b.clicks - a.clicks)
        .slice(0, 10);

      setTopProducts(topProductsData);

      const typeCount = interactions.reduce((acc: any, curr) => {
        acc[curr.interaction_type] = (acc[curr.interaction_type] || 0) + 1;
        return acc;
      }, {});

      setInteractionsByType(
        Object.entries(typeCount).map(([name, value]) => ({ name, value }))
      );

      const dailyData: any = {};
      interactions.forEach(i => {
        const date = new Date(i.created_at).toLocaleDateString();
        dailyData[date] = (dailyData[date] || 0) + 1;
      });

      setDailyInteractions(
        Object.entries(dailyData).map(([date, count]) => ({ date, count })).slice(-14)
      );

      const categoryCount = products.reduce((acc: any, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1;
        return acc;
      }, {});

      setCategoryDistribution(
        Object.entries(categoryCount).map(([name, value]) => ({ name, value }))
      );

      const recent = await supabase
        .from('user_interactions')
        .select('*, products(name)')
        .order('created_at', { ascending: false })
        .limit(50);

      setRecentInteractions(recent.data || []);

    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredInteractions = recentInteractions.filter(i =>
    i.interaction_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.products?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-light text-brown-900 dark:text-cream-50">Analytics Dashboard</h1>
          <div className="flex gap-2">
            <button onClick={() => setDateRange('7d')} className={`px-4 py-2 text-xs ${dateRange === '7d' ? 'bg-gold-600 text-white' : 'border border-brown-300'}`}>7 Days</button>
            <button onClick={() => setDateRange('30d')} className={`px-4 py-2 text-xs ${dateRange === '30d' ? 'bg-gold-600 text-white' : 'border border-brown-300'}`}>30 Days</button>
            <button onClick={() => setDateRange('90d')} className={`px-4 py-2 text-xs ${dateRange === '90d' ? 'bg-gold-600 text-white' : 'border border-brown-300'}`}>90 Days</button>
          </div>
        </div>

        {loading ? (
          <p className="text-brown-600 dark:text-cream-300">Loading analytics...</p>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-6 mb-8">
              <div className="border border-brown-200 dark:border-brown-700 p-6">
                <p className="text-xs text-brown-600 dark:text-cream-300 mb-2">Total Interactions</p>
                <p className="text-3xl font-light text-brown-900 dark:text-cream-50">{stats.totalInteractions.toLocaleString()}</p>
              </div>
              <div className="border border-brown-200 dark:border-brown-700 p-6">
                <p className="text-xs text-brown-600 dark:text-cream-300 mb-2">Active Users</p>
                <p className="text-3xl font-light text-brown-900 dark:text-cream-50">{stats.totalUsers}</p>
              </div>
              <div className="border border-brown-200 dark:border-brown-700 p-6">
                <p className="text-xs text-brown-600 dark:text-cream-300 mb-2">Total Products</p>
                <p className="text-3xl font-light text-brown-900 dark:text-cream-50">{stats.totalProducts}</p>
              </div>
              <div className="border border-brown-200 dark:border-brown-700 p-6">
                <p className="text-xs text-brown-600 dark:text-cream-300 mb-2">Avg Session (min)</p>
                <p className="text-3xl font-light text-brown-900 dark:text-cream-50">{stats.avgSessionTime}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="border border-brown-200 dark:border-brown-700 p-6">
                <h2 className="text-xl font-light mb-4 text-brown-900 dark:text-cream-50">Top 10 Products by Clicks</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topProducts}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#6B5D4F' : '#D4D4D4'} />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 10, fill: '#D4AF37' }} />
                    <YAxis tick={{ fill: '#D4AF37' }} />
                    <Tooltip contentStyle={{ backgroundColor: isDark ? '#3E2723' : '#FFFFFF', border: '1px solid #D4AF37', color: '#D4AF37' }} />
                    <Bar dataKey="clicks" fill="#D4AF37" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="border border-brown-200 dark:border-brown-700 p-6">
                <h2 className="text-xl font-light mb-4">Interactions by Type</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={interactionsByType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {interactionsByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="border border-brown-200 dark:border-brown-700 p-6">
                <h2 className="text-xl font-light mb-4 text-brown-900 dark:text-cream-50">Daily Interactions (Last 14 Days)</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={dailyInteractions}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#6B5D4F' : '#D4D4D4'} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#D4AF37' }} />
                    <YAxis tick={{ fill: '#D4AF37' }} />
                    <Tooltip contentStyle={{ backgroundColor: isDark ? '#3E2723' : '#FFFFFF', border: '1px solid #D4AF37', color: '#D4AF37' }} />
                    <Line type="monotone" dataKey="count" stroke="#D4AF37" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="border border-brown-200 dark:border-brown-700 p-6">
                <h2 className="text-xl font-light mb-4">Product Category Distribution</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={categoryDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="border border-brown-200 dark:border-brown-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-light">Recent Interactions</h2>
                <input
                  type="text"
                  placeholder="Search interactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-brown-200 dark:border-brown-700 bg-transparent text-brown-900 dark:text-cream-50 text-sm focus:outline-none focus:border-gold-500"
                />
              </div>
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-brown-200 dark:border-brown-700">
                    <tr>
                      <th className="text-left py-2 text-brown-900 dark:text-cream-50 font-light">Type</th>
                      <th className="text-left py-2 text-brown-900 dark:text-cream-50 font-light">Product</th>
                      <th className="text-left py-2 text-brown-900 dark:text-cream-50 font-light">User ID</th>
                      <th className="text-left py-2 text-brown-900 dark:text-cream-50 font-light">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInteractions.map((interaction) => (
                      <tr key={interaction.id} className="border-b border-brown-100 dark:border-brown-800">
                        <td className="py-2 text-brown-700 dark:text-cream-200">{interaction.interaction_type}</td>
                        <td className="py-2 text-brown-700 dark:text-cream-200">{interaction.products?.name || '-'}</td>
                        <td className="py-2 text-brown-700 dark:text-cream-200 font-mono text-xs">{interaction.user_id?.slice(0, 8)}...</td>
                        <td className="py-2 text-brown-700 dark:text-cream-200">{new Date(interaction.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        <div className="mt-12 pt-8 border-t border-brown-200 dark:border-brown-700 text-center">
          <button
            onClick={() => window.location.href = '/admin'}
            className="px-8 py-3 border border-brown-900 dark:border-cream-50 text-brown-900 dark:text-cream-50 hover:bg-brown-900 hover:text-cream-50 dark:hover:bg-cream-50 dark:hover:text-brown-900 transition-colors"
          >
            Back to Product Management
          </button>
        </div>
      </div>
    </div>
  );
}
