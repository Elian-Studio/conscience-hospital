"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import HospitalCard from "@/components/hospital/HospitalCard";
import type { HospitalListItem, PaginatedResult } from "@/types/hospital";

type SortKey = "conscScore" | "name";

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const [hospitals, setHospitals] = useState<HospitalListItem[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("conscScore");
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Find category by slug
      const catRes = await fetch("/api/categories");
      const catData = await catRes.json();

      interface CategoryNode {
        id: string;
        name: string;
        slug: string;
        children?: CategoryNode[];
      }

      let categoryId: string | null = null;
      let name = "";

      for (const cat of catData.data as CategoryNode[]) {
        if (cat.slug === params.slug) {
          categoryId = cat.id;
          name = cat.name;
          break;
        }
        for (const child of cat.children ?? []) {
          if (child.slug === params.slug) {
            categoryId = child.id;
            name = child.name;
            break;
          }
        }
        if (categoryId) break;
      }

      setCategoryName(name || params.slug);

      if (!categoryId) {
        setHospitals([]);
        setIsLoading(false);
        return;
      }

      const searchParams = new URLSearchParams({
        categoryId,
        limit: "100",
      });
      const res = await fetch(`/api/hospitals?${searchParams}`);
      const result: PaginatedResult<HospitalListItem> = await res.json();
      setHospitals(result.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [params.slug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const sorted = [...hospitals].sort((a, b) => {
    if (sortBy === "conscScore") {
      return (b.conscScore ?? 0) - (a.conscScore ?? 0);
    }
    return a.name.localeCompare(b.name, "ko");
  });

  return (
    <div className="mx-auto max-w-3xl p-4 pb-20">
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

      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">{categoryName}</h1>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortKey)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none"
          aria-label="정렬 기준"
        >
          <option value="conscScore">양심점수순</option>
          <option value="name">이름순</option>
        </select>
      </div>

      {isLoading ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="h-4 w-3/4 rounded bg-gray-200" />
              <div className="mt-2 h-3 w-1/2 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <p className="mt-8 text-center text-sm text-gray-500">
          해당 카테고리에 등록된 병원이 없습니다.
        </p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {sorted.map((hospital) => (
            <HospitalCard key={hospital.id} hospital={hospital} />
          ))}
        </div>
      )}
    </div>
  );
}
