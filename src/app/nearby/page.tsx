"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import TrustCard from "@/components/hospital/TrustCard";
import type { NearbyHospital } from "@/types/hospital";

const KakaoMap = dynamic(() => import("@/components/map/KakaoMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-gray-100">
      <p className="text-sm text-gray-500">지도를 불러오는 중...</p>
    </div>
  ),
});

interface NearbyResponse {
  data: NearbyHospital[];
  outOfRadius: boolean;
}

type Phase = "locating" | "loading" | "done" | "error" | "address-input";

export default function NearbyPage() {
  const [phase, setPhase] = useState<Phase>("locating");
  const [hospitals, setHospitals] = useState<NearbyHospital[]>([]);
  const [outOfRadius, setOutOfRadius] = useState(false);
  const [addressQuery, setAddressQuery] = useState("");

  const fetchNearby = useCallback(async (lat: number, lng: number) => {
    setPhase("loading");
    try {
      const res = await fetch(`/api/nearby?lat=${lat}&lng=${lng}`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const result: NearbyResponse = await res.json();
      setHospitals(result.data);
      setOutOfRadius(result.outOfRadius);
      setPhase("done");
    } catch {
      setPhase("error");
    }
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setPhase("address-input");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchNearby(position.coords.latitude, position.coords.longitude);
      },
      () => {
        setPhase("address-input");
      },
      { timeout: 5000, enableHighAccuracy: false },
    );
  }, [fetchNearby]);

  const handleAddressSearch = useCallback(async () => {
    if (!addressQuery.trim()) return;

    // Use Kakao Geocoder via global kakao SDK
    if (window.kakao?.maps?.services) {
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(addressQuery, (result: Array<{ y: string; x: string }>, status: string) => {
        if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
          const lat = parseFloat(result[0].y);
          const lng = parseFloat(result[0].x);
          fetchNearby(lat, lng);
        } else {
          alert("주소를 찾을 수 없습니다. 다시 입력해주세요.");
        }
      });
    } else {
      alert("지도 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
    }
  }, [addressQuery, fetchNearby]);

  const mapHospitals = hospitals.map((h) => ({
    id: h.id,
    name: h.name,
    address: h.address,
    latitude: h.latitude,
    longitude: h.longitude,
    conscScore: h.conscScore,
    category: h.category,
    _count: h._count,
  }));

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">
            내 주변 양심병원
          </h1>
          <Link
            href="/map"
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            전체 지도 보기
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Cards panel */}
        <div className="w-full lg:w-96 overflow-y-auto bg-gray-50 p-4 space-y-3">
          {/* Locating */}
          {phase === "locating" && (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
              <p className="mt-3 text-sm text-gray-600">
                위치를 확인하고 있어요...
              </p>
            </div>
          )}

          {/* Loading skeleton */}
          {phase === "loading" && (
            <>
              <p className="text-sm text-gray-500 text-center mb-2">
                내 주변 양심병원을 찾고 있어요...
              </p>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-gray-200 bg-white p-4 animate-pulse"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-16 w-16 rounded-full bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 rounded bg-gray-200" />
                      <div className="h-3 w-1/2 rounded bg-gray-200" />
                      <div className="h-3 w-2/3 rounded bg-gray-200" />
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Address input fallback */}
          {phase === "address-input" && (
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-600 mb-3">
                위치를 확인할 수 없어요. 주소를 입력해주세요.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={addressQuery}
                  onChange={(e) => setAddressQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddressSearch()}
                  placeholder="예: 서울시 강남구 역삼동"
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
                <button
                  type="button"
                  onClick={handleAddressSearch}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                >
                  검색
                </button>
              </div>
            </div>
          )}

          {/* Error */}
          {phase === "error" && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center">
              <p className="text-sm text-red-600">
                병원 정보를 불러오지 못했습니다.
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
              >
                다시 시도
              </button>
            </div>
          )}

          {/* Results */}
          {phase === "done" && (
            <>
              {outOfRadius && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
                  근처 5km 내 양심병원이 없어요. 가장 가까운 곳을 보여드릴게요.
                </div>
              )}

              {hospitals.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">
                    등록된 양심병원이 없어요.
                  </p>
                </div>
              ) : (
                hospitals.map((hospital, i) => (
                  <TrustCard key={hospital.id} hospital={hospital} index={i} />
                ))
              )}
            </>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 h-[50vh] lg:h-auto">
          {phase === "done" && hospitals.length > 0 ? (
            <KakaoMap hospitals={mapHospitals} autoLocate />
          ) : (
            <KakaoMap hospitals={[]} autoLocate />
          )}
        </div>
      </div>
    </div>
  );
}
