'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import StarRating from './StarRating';

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted: () => void;
}

export default function ReviewForm({ productId, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Please login to submit a review');
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from('reviews').insert({
      user_id: user.id,
      product_id: productId,
      rating,
      body: comment
    });

    if (!error) {
      setComment('');
      setRating(5);
      onReviewSubmitted();
    } else {
      alert('Failed to submit review');
    }
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="border border-brown-200 dark:border-brown-700 p-6">
      <h3 className="text-lg font-light text-brown-900 dark:text-cream-50 mb-4">Write a Review</h3>
      
      <div className="mb-4">
        <label className="block text-sm text-brown-600 dark:text-cream-300 mb-2">Rating</label>
        <StarRating rating={rating} onRatingChange={setRating} size="lg" />
      </div>

      <div className="mb-4">
        <label className="block text-sm text-brown-600 dark:text-cream-300 mb-2">Your Review</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          rows={4}
          className="w-full px-4 py-2 border border-brown-200 dark:border-brown-700 bg-transparent text-brown-900 dark:text-cream-50 focus:border-gold-500 outline-none"
          placeholder="Share your thoughts about this product..."
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="px-8 py-3 border border-brown-900 dark:border-cream-50 text-brown-900 dark:text-cream-50 hover:bg-brown-900 hover:text-cream-50 dark:hover:bg-cream-50 dark:hover:text-brown-900 transition-colors disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
