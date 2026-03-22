"use client";

import Link from "next/link";
import type { HospitalListItem } from "@/types/hospital";

interface HospitalCardProps {
  hospital: HospitalListItem;
}

function getScoreBadge(score: number | null) {
  if (score === null)
    return { text: "미평가", bg: "bg-gray-100", color: "text-gray-500" };
  if (score >= 80)
    return {
      text: `${Math.round(score)}점`,
      bg: "bg-green-100",
      color: "text-green-700",
    };
  if (score >= 60)
    return {
      text: `${Math.round(score)}점`,
      bg: "bg-yellow-100",
      color: "text-yellow-700",
    };
  return {
    text: `${Math.round(score)}점`,
    bg: "bg-red-100",
    color: "text-red-700",
  };
}

export default function HospitalCard({ hospital }: HospitalCardProps) {
  const badge = getScoreBadge(hospital.conscScore);

  return (
    <Link
      href={`/hospital/${hospital.id}`}
      className="block rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-gray-900">
            {hospital.name}
          </h3>
          <p className="mt-1 truncate text-xs text-gray-500">
            {hospital.address}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${badge.bg} ${badge.color}`}
        >
          {badge.text}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
          {hospital.category.name}
        </span>
        {hospital.phone && (
          <span className="text-xs text-gray-400">{hospital.phone}</span>
        )}
      </div>
    </Link>
  );
}
