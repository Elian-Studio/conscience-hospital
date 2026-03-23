"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import type { HospitalListItem } from "@/types/hospital";
import type { PaginatedResult } from "@/types/hospital";
import HospitalList from "@/components/hospital/HospitalList";
import CategoryFilter from "@/components/category/CategoryFilter";
import SearchBar from "@/components/ui/SearchBar";

const KakaoMap = dynamic(() => import("@/components/map/KakaoMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-gray-100">
      <p className="text-sm text-gray-500">지도를 불러오는 중...</p>
    </div>
  ),
});

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  children?: CategoryItem[];
}

export default function HomePage() {
  const [hospitals, setHospitals] = useState<HospitalListItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data: { data: CategoryItem[] }) => {
        const flat = data.data.flatMap((parent) => [
          parent,
          ...(parent.children ?? []),
        ]);
        setCategories(flat);
      })
      .catch(console.error);
  }, []);

  const fetchHospitals = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.set("categoryId", selectedCategory);
      if (searchQuery) params.set("search", searchQuery);
      params.set("limit", "50");

      const res = await fetch(`/api/hospitals?${params}`);
      const result: PaginatedResult<HospitalListItem> = await res.json();
      setHospitals(result.data);
    } catch (err) {
      console.error("Failed to fetch hospitals:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleCategorySelect = useCallback((id: string | null) => {
    setSelectedCategory(id);
  }, []);

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      {/* Side panel */}
      <aside
        className={`${
          showList ? "translate-y-0" : "translate-y-full lg:translate-y-0"
        } fixed inset-x-0 bottom-0 z-30 flex max-h-[60vh] flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl transition-transform lg:static lg:z-auto lg:w-96 lg:max-h-none lg:rounded-none lg:shadow-none lg:border-r lg:border-gray-200`}
      >
        <SearchBar onSearch={handleSearch} />
        <CategoryFilter
          categories={categories}
          selectedId={selectedCategory}
          onSelect={handleCategorySelect}
        />
        <div className="flex-1 overflow-y-auto">
          <HospitalList hospitals={hospitals} isLoading={isLoading} />
        </div>
      </aside>

      {/* Map area */}
      <div className="relative flex-1" style={{ minHeight: "calc(100vh - 56px)" }}>
        <KakaoMap hospitals={hospitals} />

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setShowList(!showList)}
          className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-full bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-green-700 transition-colors lg:hidden"
          aria-label={showList ? "지도 보기" : "병원 리스트 보기"}
        >
          {showList ? "지도 보기" : `병원 목록 (${hospitals.length})`}
        </button>
      </div>
    </div>
  );
}
