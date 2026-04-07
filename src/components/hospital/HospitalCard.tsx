"use client";

import Link from "next/link";
import type { HospitalListItem } from "@/types/hospital";
import ConscScore from "./ConscScore";

interface HospitalCardProps {
  hospital: HospitalListItem;
}

export default function HospitalCard({ hospital }: HospitalCardProps) {
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
        <ConscScore score={hospital.conscScore ?? null} size="sm" />
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
