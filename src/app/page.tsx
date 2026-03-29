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
  const [clusterFilter, setClusterFilter] = useState<string[] | null>(null);

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

  // 카테고리/검색 변경 시 클러스터 필터 초기화
  useEffect(() => {
    setClusterFilter(null);
  }, [selectedCategory, searchQuery]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleCategorySelect = useCallback((id: string | null) => {
    setSelectedCategory(id);
  }, []);

  const handleClusterClick = useCallback((hospitalIds: string[]) => {
    setClusterFilter(hospitalIds);
    setShowList(true); // 모바일에서 자동으로 목록 패널 표시
  }, []);

  const handleClearClusterFilter = useCallback(() => {
    setClusterFilter(null);
  }, []);

  // 클러스터 필터 적용 + 양심점수 내림차순 정렬
  const displayHospitals = clusterFilter
    ? hospitals
        .filter((h) => clusterFilter.includes(h.id))
        .sort((a, b) => (b.conscScore ?? 0) - (a.conscScore ?? 0))
    : hospitals;

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
        {clusterFilter && (
          <div className="flex items-center justify-between border-b border-gray-200 bg-green-50 px-4 py-2">
            <span className="text-xs font-medium text-green-700">
              선택 영역 {displayHospitals.length}개 (양심점수순)
            </span>
            <button
              type="button"
              onClick={handleClearClusterFilter}
              className="text-xs text-green-600 hover:text-green-800 font-medium"
            >
              전체 보기
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          <HospitalList hospitals={displayHospitals} isLoading={isLoading} />
        </div>
      </aside>

      {/* Map area */}
      <div className="relative flex-1" style={{ height: "calc(100vh - 56px)" }}>
        <KakaoMap
          hospitals={hospitals}
          autoLocate
          onClusterClick={handleClusterClick}
        />

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setShowList(!showList)}
          className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-full bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-green-700 transition-colors lg:hidden"
          aria-label={showList ? "지도 보기" : "병원 리스트 보기"}
        >
          {showList ? "지도 보기" : `병원 목록 (${displayHospitals.length})`}
        </button>
      </div>
    </div>
  );
}
