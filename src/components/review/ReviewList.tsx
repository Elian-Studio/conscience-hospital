interface ReviewItem {
  id: string;
  rating: number;
  content: string | null;
  isConsc: boolean;
  authorName: string | null;
  createdAt: string;
}

interface ReviewListProps {
  reviews: ReviewItem[];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`별점 ${rating}점`} role="img">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i < rating ? "text-yellow-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-gray-500">
        아직 리뷰가 없습니다. 첫 번째 리뷰를 작성해주세요!
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-100">
      {reviews.map((review) => (
        <li key={review.id} className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StarRating rating={review.rating} />
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  review.isConsc
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {review.isConsc ? "양심적" : "과잉진료"}
              </span>
            </div>
            <span className="text-xs text-gray-400">
              {new Date(review.createdAt).toLocaleDateString("ko-KR")}
            </span>
          </div>
          {review.content && (
            <p className="mt-1.5 text-sm text-gray-700">{review.content}</p>
          )}
          {review.authorName && (
            <p className="mt-1 text-xs text-gray-400">{review.authorName}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
