"use client";

import { useState } from "react";

interface ReviewFormProps {
  hospitalId: string;
  onSubmitted: () => void;
}

export default function ReviewForm({
  hospitalId,
  onSubmitted,
}: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [isConsc, setIsConsc] = useState(true);
  const [authorName, setAuthorName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/hospitals/${hospitalId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          content: content.trim() || undefined,
          isConsc,
          authorName: authorName.trim() || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit review");

      setContent("");
      setAuthorName("");
      setRating(5);
      setIsConsc(true);
      onSubmitted();
    } catch (err) {
      console.error(err);
      alert("리뷰 등록에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          별점
        </label>
        <div className="mt-1 flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="focus:outline-none"
              aria-label={`${star}점`}
            >
              <svg
                className={`h-7 w-7 ${star <= rating ? "text-yellow-400" : "text-gray-200"}`}
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <fieldset>
        <legend className="block text-sm font-medium text-gray-700">
          진료 경험
        </legend>
        <div className="mt-1 flex gap-3">
          <label
            className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              isConsc
                ? "border-green-500 bg-green-50 text-green-700"
                : "border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}
          >
            <input
              type="radio"
              name="isConsc"
              checked={isConsc}
              onChange={() => setIsConsc(true)}
              className="sr-only"
            />
            양심적이었다
          </label>
          <label
            className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              !isConsc
                ? "border-red-500 bg-red-50 text-red-700"
                : "border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}
          >
            <input
              type="radio"
              name="isConsc"
              checked={!isConsc}
              onChange={() => setIsConsc(false)}
              className="sr-only"
            />
            과잉진료
          </label>
        </div>
      </fieldset>

      <div>
        <label
          htmlFor="review-author"
          className="block text-sm font-medium text-gray-700"
        >
          닉네임 <span className="text-gray-400">(선택)</span>
        </label>
        <input
          id="review-author"
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          maxLength={20}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          placeholder="익명"
        />
      </div>

      <div>
        <label
          htmlFor="review-content"
          className="block text-sm font-medium text-gray-700"
        >
          리뷰 내용 <span className="text-gray-400">(선택)</span>
        </label>
        <textarea
          id="review-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          maxLength={500}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          placeholder="진료 경험을 공유해주세요"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
      >
        {isSubmitting ? "등록 중..." : "리뷰 등록"}
      </button>
    </form>
  );
}
