"use client";

import Link from "next/link";
import ConscScore from "./ConscScore";
import type { NearbyHospital } from "@/types/hospital";

interface TrustCardProps {
  hospital: NearbyHospital;
  index: number;
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

function gradeLabel(grade: number | null): string {
  if (grade === null) return "미평가";
  if (grade === 1) return "1등급";
  if (grade === 2) return "2등급";
  if (grade === 3) return "3등급";
  if (grade === 4) return "4등급";
  return "5등급";
}

async function handleShare(name: string) {
  const url = window.location.origin + "/nearby";
  const shareData = {
    title: "내 주변 양심병원 찾기",
    text: `${name} - 커뮤니티가 검증한 양심병원`,
    url,
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch {
      // User cancelled or share failed, fall through to clipboard
    }
  }

  await navigator.clipboard.writeText(url);
  alert("링크가 복사되었습니다!");
}

export default function TrustCard({ hospital, index }: TrustCardProps) {
  const hira = hospital.hiraEvaluation;

  return (
    <div
      className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-500 opacity-0 translate-y-4 animate-[fadeSlideIn_0.5s_ease-out_forwards]"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <Link href={`/hospital/${hospital.id}`} className="block">
        <div className="flex items-start gap-3">
          <ConscScore score={hospital.conscScore ?? null} size="sm" />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-gray-900 truncate">
              {hospital.name}
            </h3>
            <p className="mt-0.5 text-xs text-gray-500 truncate">
              {hospital.address}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                {formatDistance(hospital.distance)}
              </span>
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                {hospital.category.name}
              </span>
              {hospital.source === "community" && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  커뮤니티 검증
                </span>
              )}
              {hira && hira.overallGrade !== null && (
                <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
                  HIRA {gradeLabel(hira.overallGrade)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* One-tap actions */}
      <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
        {hospital.phone && (
          <a
            href={`tel:${hospital.phone}`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-green-50 py-2 text-xs font-semibold text-green-700 hover:bg-green-100 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
            전화
          </a>
        )}
        <a
          href={`https://map.kakao.com/link/to/${encodeURIComponent(hospital.name)},${hospital.latitude},${hospital.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-yellow-50 py-2 text-xs font-semibold text-yellow-700 hover:bg-yellow-100 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
          </svg>
          길찾기
        </a>
        <button
          type="button"
          onClick={() => handleShare(hospital.name)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gray-50 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
          </svg>
          공유
        </button>
      </div>
    </div>
  );
}
