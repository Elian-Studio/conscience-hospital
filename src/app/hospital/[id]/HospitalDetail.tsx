"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import ConscScore from "@/components/hospital/ConscScore";
import HiraCard from "@/components/hospital/HiraCard";
import ReviewList from "@/components/review/ReviewList";
import ReviewForm from "@/components/review/ReviewForm";

const KakaoMap = dynamic(() => import("@/components/map/KakaoMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-gray-100 rounded-lg">
      <p className="text-sm text-gray-500">지도를 불러오는 중...</p>
    </div>
  ),
});

interface ReviewItem {
  id: string;
  rating: number;
  content: string | null;
  isConsc: boolean;
  authorName: string | null;
  createdAt: string;
}

interface HospitalData {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  latitude: number;
  longitude: number;
  categoryId: string;
  conscScore: number | null;
  openTime: string | null;
  closeTime: string | null;
  description: string | null;
  isVerified: boolean;
  source: string;
  category: { id: string; name: string; slug: string };
  hiraEvaluation: {
    antibioticRate: number | null;
    injectionRate: number | null;
    medicineCount: number | null;
    overallGrade: number | null;
    evaluationYear: number;
  } | null;
  reviews: ReviewItem[];
}

export default function HospitalDetail({ hospital }: { hospital: HospitalData }) {
  const [reviews, setReviews] = useState<ReviewItem[]>(hospital.reviews);

  const handleReviewSubmitted = useCallback(async () => {
    const res = await fetch(`/api/hospitals/${hospital.id}/reviews`);
    if (res.ok) {
      const result = await res.json();
      setReviews(result.data);
    }
  }, [hospital.id]);

  const conscCount = reviews.filter((r) => r.isConsc).length;
  const overCount = reviews.filter((r) => !r.isConsc).length;

  return (
    <div className="mx-auto max-w-2xl p-4 pb-20">
      {/* Back */}
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
        뒤로
      </Link>

      {/* Hospital Info */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{hospital.name}</h1>
          <p className="mt-1 text-sm text-gray-500">{hospital.address}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {hospital.category.name}
            </span>
            {hospital.phone && (
              <a
                href={`tel:${hospital.phone}`}
                className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-600 hover:bg-blue-100"
              >
                {hospital.phone}
              </a>
            )}
          </div>
          {(hospital.openTime || hospital.closeTime) && (
            <p className="mt-2 text-xs text-gray-500">
              진료시간: {hospital.openTime ?? "?"} ~ {hospital.closeTime ?? "?"}
            </p>
          )}
        </div>
        <ConscScore score={hospital.conscScore} size="md" />
      </div>

      {/* HIRA Card */}
      <div className="mt-6">
        <HiraCard evaluation={hospital.hiraEvaluation} />
      </div>

      {/* Mini Map */}
      <div className="mt-6">
        <h2 className="mb-2 text-sm font-semibold text-gray-700">위치</h2>
        <div className="h-48 overflow-hidden rounded-lg border border-gray-200">
          <KakaoMap
            hospitals={[
              {
                ...hospital,
                _count: { reviews: reviews.length },
                category: hospital.category,
              },
            ]}
            center={{ lat: hospital.latitude, lng: hospital.longitude }}
            level={3}
          />
        </div>
        <a
          href={`https://map.kakao.com/link/to/${encodeURIComponent(hospital.name)},${hospital.latitude},${hospital.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700"
        >
          길찾기
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
            />
          </svg>
        </a>
      </div>

      {/* Reviews */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">리뷰</h2>
          <div className="flex gap-3 text-xs">
            <span className="text-green-600">양심적 {conscCount}</span>
            <span className="text-red-500">과잉진료 {overCount}</span>
          </div>
        </div>
        <div className="mt-3">
          <ReviewList reviews={reviews} />
        </div>
      </div>

      {/* Review Form */}
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">
          리뷰 작성
        </h2>
        <ReviewForm
          hospitalId={hospital.id}
          onSubmitted={handleReviewSubmitted}
        />
      </div>
    </div>
  );
}
