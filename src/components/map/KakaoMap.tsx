"use client";

import { useRef, useEffect, useCallback, useState } from "react";
interface MapHospital {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  conscScore?: number | null;
  category: { name: string };
  _count?: { reviews: number };
}

declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        Map: new (
          container: HTMLElement,
          options: { center: unknown; level: number }
        ) => KakaoMap;
        LatLng: new (lat: number, lng: number) => unknown;
        LatLngBounds: new () => KakaoLatLngBounds;
        Marker: new (options: {
          position: unknown;
          map?: KakaoMap;
        }) => KakaoMarker;
        InfoWindow: new (options: {
          content: string;
          removable?: boolean;
        }) => KakaoInfoWindow;
        MarkerClusterer: new (options: {
          map: KakaoMap;
          averageCenter: boolean;
          minLevel: number;
          markers?: KakaoMarker[];
          styles?: ClusterStyle[];
        }) => KakaoMarkerClusterer;
        event: {
          addListener: (
            target: unknown,
            type: string,
            handler: (...args: unknown[]) => void
          ) => void;
        };
        services: {
          Status: { OK: string };
        };
      };
    };
  }
}

interface ClusterStyle {
  width: string;
  height: string;
  background: string;
  borderRadius: string;
  color: string;
  textAlign: string;
  fontWeight: string;
  lineHeight: string;
  fontSize: string;
}

interface KakaoMap {
  setCenter: (latlng: unknown) => void;
  getCenter: () => { getLat: () => number; getLng: () => number };
  setLevel: (level: number) => void;
  panTo: (latlng: unknown) => void;
  getBounds: () => KakaoLatLngBounds;
}

interface KakaoLatLngBounds {
  getSouthWest: () => { getLat: () => number; getLng: () => number };
  getNorthEast: () => { getLat: () => number; getLng: () => number };
  extend: (latlng: unknown) => void;
}

interface KakaoMarker {
  setMap: (map: KakaoMap | null) => void;
  getPosition: () => { getLat: () => number; getLng: () => number };
}

interface KakaoInfoWindow {
  open: (map: KakaoMap, marker: KakaoMarker) => void;
  close: () => void;
}

interface KakaoMarkerClusterer {
  addMarkers: (markers: KakaoMarker[]) => void;
  clear: () => void;
}

interface KakaoMapProps {
  hospitals: MapHospital[];
  onHospitalClick?: (hospitalId: string) => void;
  onClusterClick?: (hospitalIds: string[]) => void;
  autoLocate?: boolean;
  center?: { lat: number; lng: number };
  level?: number;
}

export default function KakaoMap({
  hospitals,
  onHospitalClick,
  onClusterClick,
  autoLocate = false,
  center = { lat: 37.5665, lng: 126.978 },
  level = 5,
}: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMap | null>(null);
  const clustererRef = useRef<KakaoMarkerClusterer | null>(null);
  const infoWindowRef = useRef<KakaoInfoWindow | null>(null);
  const markerHospitalMap = useRef<Map<KakaoMarker, string>>(new Map());
  const [isLoaded, setIsLoaded] = useState(false);

  const getScoreColor = (score: number | null) => {
    if (!score) return "#9ca3af";
    if (score >= 80) return "#16a34a";
    if (score >= 60) return "#f59e0b";
    return "#dc2626";
  };

  const clusterStyles: ClusterStyle[] = [
    {
      width: "40px",
      height: "40px",
      background: "rgba(22, 163, 74, 0.8)",
      borderRadius: "50%",
      color: "#fff",
      textAlign: "center",
      fontWeight: "700",
      lineHeight: "40px",
      fontSize: "14px",
    },
    {
      width: "50px",
      height: "50px",
      background: "rgba(22, 163, 74, 0.85)",
      borderRadius: "50%",
      color: "#fff",
      textAlign: "center",
      fontWeight: "700",
      lineHeight: "50px",
      fontSize: "15px",
    },
    {
      width: "60px",
      height: "60px",
      background: "rgba(22, 163, 74, 0.9)",
      borderRadius: "50%",
      color: "#fff",
      textAlign: "center",
      fontWeight: "700",
      lineHeight: "60px",
      fontSize: "16px",
    },
  ];

  const initMap = useCallback(() => {
    if (!containerRef.current || !window.kakao?.maps) return;

    window.kakao.maps.load(() => {
      const latlng = new window.kakao.maps.LatLng(center.lat, center.lng);
      const map = new window.kakao.maps.Map(containerRef.current!, {
        center: latlng,
        level,
      });
      mapRef.current = map;

      const clusterer = new window.kakao.maps.MarkerClusterer({
        map,
        averageCenter: true,
        minLevel: 4,
        styles: clusterStyles,
      });
      clustererRef.current = clusterer;

      // 클러스터 클릭 시 해당 클러스터의 마커들을 콜백으로 전달
      if (onClusterClick) {
        window.kakao.maps.event.addListener(
          clusterer,
          "clusterclick",
          (cluster: { getMarkers: () => KakaoMarker[] }) => {
            const clusterMarkers = cluster.getMarkers();
            const ids: string[] = [];
            for (const marker of clusterMarkers) {
              const id = markerHospitalMap.current.get(marker);
              if (id) ids.push(id);
            }
            onClusterClick(ids);
          }
        );
      }

      setIsLoaded(true);

      // 자동 현재 위치 이동
      if (autoLocate) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const userLatLng = new window.kakao.maps.LatLng(
              pos.coords.latitude,
              pos.coords.longitude
            );
            map.panTo(userLatLng);
            map.setLevel(4);
          },
          () => {
            // 위치 권한 거부 시 기본 위치 유지
          }
        );
      }
    });
  }, [center.lat, center.lng, level, autoLocate, onClusterClick]);

  useEffect(() => {
    const checkKakao = setInterval(() => {
      if (window.kakao?.maps) {
        clearInterval(checkKakao);
        initMap();
      }
    }, 100);
    return () => clearInterval(checkKakao);
  }, [initMap]);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !clustererRef.current) return;

    const map = mapRef.current;
    const clusterer = clustererRef.current;
    clusterer.clear();
    markerHospitalMap.current.clear();

    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }

    const markers = hospitals.map((hospital) => {
      const position = new window.kakao.maps.LatLng(
        hospital.latitude,
        hospital.longitude
      );
      const marker = new window.kakao.maps.Marker({ position });

      // 마커 ↔ 병원 ID 매핑 저장
      markerHospitalMap.current.set(marker, hospital.id);

      const scoreColor = getScoreColor(hospital.conscScore ?? null);
      const scoreText =
        hospital.conscScore != null
          ? `${Math.round(hospital.conscScore)}점`
          : "미평가";

      const content = `
        <div style="padding:12px;min-width:200px;font-family:sans-serif;">
          <p style="font-weight:700;font-size:14px;margin:0 0 4px;">${hospital.name}</p>
          <p style="font-size:12px;color:#6b7280;margin:0 0 6px;">${hospital.category.name}</p>
          <span style="display:inline-block;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;color:white;background:${scoreColor};">
            양심점수 ${scoreText}
          </span>
        </div>
      `;

      const infoWindow = new window.kakao.maps.InfoWindow({
        content,
        removable: true,
      });

      window.kakao.maps.event.addListener(marker, "click", () => {
        if (infoWindowRef.current) infoWindowRef.current.close();
        infoWindow.open(map, marker);
        infoWindowRef.current = infoWindow;
        onHospitalClick?.(hospital.id);
      });

      return marker;
    });

    clusterer.addMarkers(markers);
  }, [hospitals, isLoaded, onHospitalClick]);

  const handleLocate = useCallback(() => {
    if (!mapRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latlng = new window.kakao.maps.LatLng(
          pos.coords.latitude,
          pos.coords.longitude
        );
        mapRef.current!.panTo(latlng);
        mapRef.current!.setLevel(4);
      },
      () => {
        alert("위치 정보를 가져올 수 없습니다.");
      }
    );
  }, []);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <p className="text-sm text-gray-500">지도를 불러오는 중...</p>
        </div>
      )}
      <button
        type="button"
        onClick={handleLocate}
        className="absolute bottom-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors"
        aria-label="현재 위치로 이동"
      >
        <svg
          className="h-5 w-5 text-gray-700"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
          />
        </svg>
      </button>
    </div>
  );
}
