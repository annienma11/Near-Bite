import { Review } from '@/types';
import StarRating from './StarRating';

interface ReviewListProps {
  reviews: Review[];
}

export default function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-brown-600 dark:text-cream-300">
        No reviews yet. Be the first to review this product!
      </div>
    );
  }

  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div>
      <div className="mb-6 pb-6 border-b border-brown-200 dark:border-brown-700">
        <div className="flex items-center gap-4">
          <div className="text-4xl font-light text-gold-600 dark:text-gold-400">
            {averageRating.toFixed(1)}
          </div>
          <div>
            <StarRating rating={Math.round(averageRating)} readonly size="md" />
            <p className="text-sm text-brown-600 dark:text-cream-300 mt-1">
              Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="pb-6 border-b border-brown-200 dark:border-brown-700 last:border-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <StarRating rating={review.rating} readonly size="sm" />
                <p className="text-sm text-brown-600 dark:text-cream-300 mt-1">
                  {review.user?.name || 'Anonymous'} • {new Date(review.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            {(review.body || review.comment) && (
              <p className="text-brown-900 dark:text-cream-50 mt-3">{review.body || review.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
