# 네이버 지도 API - Next.js 통합 리서치

> 조사일: 2026-03-22

---

## 1. 네이버 지도 API 종류

네이버 클라우드 플랫폼(NCP)에서 제공하는 Maps API는 크게 다음과 같이 분류된다.

### 1.1 Web Dynamic Map (JavaScript API v3)

- **용도**: 웹 브라우저에서 인터랙티브 지도 렌더링 (줌, 패닝, 마커, 오버레이 등)
- **로드 방식**: `<script>` 태그로 JavaScript SDK 로드
- **과금 기준**: 지도 로딩 시 1건 카운트. 로딩 후 줌/마커 등 추가 조작은 과금 안 됨
- **문서**: https://navermaps.github.io/maps.js.ncp/docs/

### 1.2 Static Map API

- **용도**: REST API 호출로 정적 지도 이미지(PNG/JPEG) 반환
- **활용**: 이메일 템플릿, 썸네일, 인쇄물 등 인터랙션 불필요한 경우
- **파라미터**: 지도 크기, 타입, 포맷, 줌 레벨, 해상도, 마커, 언어, 대중교통 정보
- **엔드포인트**: `https://naveropenapi.apigw.ntruss.com/map-static/v2`

### 1.3 Geocoding API

- **용도**: 지번 주소 또는 도로명 주소를 지도 좌표(위도/경도)로 변환
- **엔드포인트**: `https://naveropenapi.apigw.ntruss.com/map-geocode/v2`
- **활용 예**: 병원 주소를 좌표로 변환하여 지도에 마커 표시

### 1.4 Reverse Geocoding API

- **용도**: 좌표를 주소로 변환
- **엔드포인트**: `https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2`
- **활용 예**: 사용자가 지도를 클릭한 위치의 주소 표시

### 1.5 Directions API

- **Directions 5**: 경유지 최대 5개, 최적/최단/편한/경제적 경로 검색
  - 엔드포인트: `https://naveropenapi.apigw.ntruss.com/map-direction/v1`
- **Directions 15**: 경유지 최대 15개
  - 엔드포인트: `https://naveropenapi.apigw.ntruss.com/map-direction-15/v1`
- **활용 예**: 현재 위치에서 병원까지 경로 안내

### 1.6 Mobile Dynamic Map

- **용도**: 모바일 앱(Android/iOS)용 지도 SDK
- **과금 기준**: 지도 뷰 1회 생성 = 1건

---

## 2. 인증 및 설정

### 2.1 네이버 클라우드 플랫폼 가입 및 키 발급

1. [네이버 클라우드 플랫폼](https://www.ncloud.com/) 회원가입
2. 콘솔 접속 > **Service > Application Services > Maps > Application**
3. 애플리케이션 등록 (이름 지정)
4. 사용할 API 선택 (Web Dynamic Map, Geocoding 등)
5. **Client ID**와 **Client Secret** 확인

### 2.2 인증 방식

| 구분 | 용도 | 사용 위치 |
|------|------|-----------|
| **Client ID (ncpClientId)** | JavaScript API 스크립트 로드 시 쿼리 파라미터 | 프론트엔드 (공개) |
| **Client Secret** | REST API 호출 시 헤더 인증 | 백엔드 (비공개) |

- JavaScript API: `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=YOUR_CLIENT_ID`
- REST API (Geocoding 등): 헤더에 `X-NCP-APIGW-API-KEY-ID`, `X-NCP-APIGW-API-KEY` 포함

### 2.3 도메인 등록

- 애플리케이션 설정에서 **서비스 URL** 등록 필수
- 개발 환경: `http://localhost:3000` 등록
- 운영 환경: 실제 도메인 등록
- 등록되지 않은 도메인에서 호출 시 차단됨

### 2.4 주의사항

- Application 수정 화면에서 **Dynamic Map이 선택**되어 있는지 반드시 확인
- 선택되어 있지 않으면 **429 오류(Quota Exceed)** 발생
- Client ID는 프론트엔드에 노출되므로, 도메인 제한을 반드시 설정할 것

---

## 3. Next.js 통합 방법

### 3.1 React 래퍼 라이브러리

#### (A) react-naver-maps (권장)

- **패키지**: `react-naver-maps`
- **GitHub**: https://github.com/zeakd/react-naver-maps
- **문서**: https://zeakd.github.io/react-naver-maps/
- **특징**: NavermapsProvider, useNavermaps, useMap 등 React 훅 제공, 마커 클러스터링 지원

```bash
npm install react-naver-maps
```

**App Router 설정 (layout.tsx에서 Provider 래핑)**:

```tsx
// app/providers.tsx
'use client';

import { NavermapsProvider } from 'react-naver-maps';

export function MapProvider({ children }: { children: React.ReactNode }) {
  return (
    <NavermapsProvider ncpClientId={process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID!}>
      {children}
    </NavermapsProvider>
  );
}
```

```tsx
// app/layout.tsx
import { MapProvider } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <MapProvider>{children}</MapProvider>
      </body>
    </html>
  );
}
```

**지도 컴포넌트 예제**:

```tsx
// components/NaverMap.tsx
'use client';

import { Container as MapDiv, NaverMap, Marker, useNavermaps } from 'react-naver-maps';

export default function MyMap() {
  const navermaps = useNavermaps();

  return (
    <MapDiv style={{ width: '100%', height: '500px' }}>
      <NaverMap
        defaultCenter={new navermaps.LatLng(37.5665, 126.9780)}
        defaultZoom={15}
      >
        <Marker
          position={new navermaps.LatLng(37.5665, 126.9780)}
        />
      </NaverMap>
    </MapDiv>
  );
}
```

#### (B) @naver-maps/react

- **패키지**: `@naver-maps/react`
- 네이버 공식에 가까운 패키지이나, 최신 버전(1.0.0)이 2년 전 게시되어 업데이트 빈도 낮음
- react-naver-maps 대비 커뮤니티가 작음

#### (C) Script 태그 직접 로드 방식

래퍼 라이브러리 없이 직접 구현하는 방법:

```tsx
// components/NaverMapDirect.tsx
'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    naver: any;
  }
}

export default function NaverMapDirect() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}`;
    script.async = true;
    script.onload = () => {
      if (mapRef.current && window.naver) {
        const map = new window.naver.maps.Map(mapRef.current, {
          center: new window.naver.maps.LatLng(37.5665, 126.9780),
          zoom: 15,
        });

        new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(37.5665, 126.9780),
          map: map,
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return <div ref={mapRef} style={{ width: '100%', height: '500px' }} />;
}
```

또는 Next.js의 `next/script`를 활용:

```tsx
'use client';

import Script from 'next/script';
import { useRef, useState } from 'react';

export default function NaverMapWithScript() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  const initMap = () => {
    if (mapRef.current && window.naver) {
      new window.naver.maps.Map(mapRef.current, {
        center: new window.naver.maps.LatLng(37.5665, 126.9780),
        zoom: 15,
      });
    }
  };

  return (
    <>
      <Script
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}`}
        strategy="afterInteractive"
        onLoad={initMap}
      />
      <div ref={mapRef} style={{ width: '100%', height: '500px' }} />
    </>
  );
}
```

### 3.2 SSR 환경 주의사항

| 문제 | 원인 | 해결 |
|------|------|------|
| `window is not defined` | 서버 사이드에서 window 객체 없음 | `'use client'` 지시문 사용, `useEffect` 내에서만 지도 초기화 |
| `naver is not defined` | 스크립트 로드 전 접근 | `onLoad` 콜백 또는 `useNavermaps` 훅 사용 |
| 하이드레이션 불일치 | 서버/클라이언트 렌더링 차이 | `dynamic import`로 SSR 비활성화 |

**dynamic import로 SSR 비활성화**:

```tsx
// app/map/page.tsx
import dynamic from 'next/dynamic';

const NaverMap = dynamic(() => import('@/components/NaverMap'), {
  ssr: false,
  loading: () => <div style={{ height: '500px' }}>지도 로딩 중...</div>,
});

export default function MapPage() {
  return <NaverMap />;
}
```

### 3.3 환경 변수 설정

```env
# .env.local
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=your_client_id_here
NAVER_MAP_CLIENT_SECRET=your_client_secret_here  # 서버 전용 (Geocoding 등)
```

- `NEXT_PUBLIC_` 접두어: 클라이언트에 노출 (JavaScript API용 Client ID)
- 접두어 없음: 서버에서만 사용 (REST API용 Client Secret)

---

## 4. 핵심 기능 구현

### 4.1 마커(Marker) 표시 및 커스터마이징

```tsx
'use client';

import { NaverMap, Marker, useNavermaps } from 'react-naver-maps';

function HospitalMarkers({ hospitals }: { hospitals: Hospital[] }) {
  const navermaps = useNavermaps();

  return (
    <>
      {hospitals.map((hospital) => (
        <Marker
          key={hospital.id}
          position={new navermaps.LatLng(hospital.lat, hospital.lng)}
          title={hospital.name}
          icon={{
            url: '/icons/hospital-marker.png',
            size: new navermaps.Size(36, 36),
            anchor: new navermaps.Point(18, 36),
          }}
        />
      ))}
    </>
  );
}
```

### 4.2 마커 클러스터링 (대량 병원 표시)

react-naver-maps의 `makeMarkerClustering` 유틸 활용:

```tsx
'use client';

import { useNavermaps, useMap } from 'react-naver-maps';
import { useEffect } from 'react';
import { makeMarkerClustering } from 'react-naver-maps';

function MarkerCluster({ hospitals }: { hospitals: Hospital[] }) {
  const navermaps = useNavermaps();
  const map = useMap();

  useEffect(() => {
    if (!map || !navermaps) return;

    const MarkerClustering = makeMarkerClustering(window.naver);

    const markers = hospitals.map(
      (h) => new navermaps.Marker({
        position: new navermaps.LatLng(h.lat, h.lng),
        title: h.name,
      })
    );

    const cluster = new MarkerClustering({
      minClusterSize: 2,
      maxZoom: 13,
      map: map,
      markers: markers,
      disableClickZoom: false,
      gridSize: 120,
      icons: [htmlMarker1, htmlMarker2, htmlMarker3],
      indexGenerator: [10, 100, 200],
    });

    return () => {
      cluster.setMap(null);
    };
  }, [map, navermaps, hospitals]);

  return null;
}
```

공식 클러스터링 튜토리얼: https://zeakd.github.io/react-naver-maps/examples/marker-cluster-tutorial/

### 4.3 현재 위치 기반 반경 검색

```tsx
'use client';

import { useNavermaps } from 'react-naver-maps';
import { useEffect, useState } from 'react';

function useCurrentLocation() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.error('위치 정보 접근 실패:', err),
      { enableHighAccuracy: true }
    );
  }, []);

  return location;
}

// 반경 내 병원 필터링 (Haversine 공식)
function filterByRadius(
  hospitals: Hospital[],
  center: { lat: number; lng: number },
  radiusKm: number
): Hospital[] {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  return hospitals.filter((h) => {
    const dLat = toRad(h.lat - center.lat);
    const dLng = toRad(h.lng - center.lng);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(center.lat)) * Math.cos(toRad(h.lat)) * Math.sin(dLng / 2) ** 2;
    const distance = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return distance <= radiusKm;
  });
}
```

반경 시각화 (Circle 오버레이):

```tsx
import { Circle } from 'react-naver-maps';

<Circle
  center={new navermaps.LatLng(lat, lng)}
  radius={1000} // 미터 단위
  fillColor="rgba(66, 133, 244, 0.1)"
  strokeColor="#4285F4"
  strokeWeight={2}
/>
```

### 4.4 InfoWindow / Overlay 활용

```tsx
'use client';

import { Marker, useNavermaps } from 'react-naver-maps';
import { useState } from 'react';

function HospitalMarkerWithInfo({ hospital }: { hospital: Hospital }) {
  const navermaps = useNavermaps();
  const [infoWindow, setInfoWindow] = useState<any>(null);
  const [map, setMap] = useState<any>(null);

  const handleClick = (marker: any) => {
    if (infoWindow) {
      infoWindow.close();
      setInfoWindow(null);
      return;
    }
    const iw = new navermaps.InfoWindow({
      content: `
        <div style="padding: 12px; min-width: 200px;">
          <h3 style="margin: 0 0 8px;">${hospital.name}</h3>
          <p style="margin: 0; color: #666;">${hospital.address}</p>
          <p style="margin: 4px 0 0; color: #333;">${hospital.phone}</p>
        </div>
      `,
    });
    iw.open(map, marker);
    setInfoWindow(iw);
  };

  return (
    <Marker
      position={new navermaps.LatLng(hospital.lat, hospital.lng)}
      onClick={(e) => handleClick(e.overlay)}
    />
  );
}
```

### 4.5 지도 이동/줌 이벤트 핸들링

```tsx
<NaverMap
  defaultCenter={new navermaps.LatLng(37.5665, 126.9780)}
  defaultZoom={15}
  onBoundsChanged={(bounds) => {
    // 현재 보이는 영역의 병원만 로드 (성능 최적화)
    const ne = bounds.getNE();
    const sw = bounds.getSW();
    fetchHospitalsInBounds(sw.lat(), sw.lng(), ne.lat(), ne.lng());
  }}
  onZoomChanged={(zoom) => {
    console.log('현재 줌 레벨:', zoom);
  }}
  onCenterChanged={(center) => {
    console.log('중심 좌표:', center.lat(), center.lng());
  }}
/>
```

### 4.6 Geocoding (주소 -> 좌표 변환)

Geocoding/Reverse Geocoding은 REST API이므로 **서버 사이드(Route Handler)**에서 호출:

```tsx
// app/api/geocode/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address');
  if (!address) {
    return NextResponse.json({ error: 'address 파라미터 필요' }, { status: 400 });
  }

  const response = await fetch(
    `https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(address)}`,
    {
      headers: {
        'X-NCP-APIGW-API-KEY-ID': process.env.NAVER_MAP_CLIENT_ID!,
        'X-NCP-APIGW-API-KEY': process.env.NAVER_MAP_CLIENT_SECRET!,
      },
    }
  );

  const data = await response.json();
  return NextResponse.json(data);
}
```

클라이언트에서 호출:

```tsx
async function geocodeAddress(address: string) {
  const res = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
  const data = await res.json();
  if (data.addresses && data.addresses.length > 0) {
    return {
      lat: parseFloat(data.addresses[0].y),
      lng: parseFloat(data.addresses[0].x),
    };
  }
  return null;
}
```

---

## 5. 무료 사용 한도 및 요금

### 5.1 중요 공지: 무료 이용 정책 변경 (2025)

네이버 클라우드 플랫폼은 2025년 3월 24일 다음 사항을 공지했다:

- **지도 API 신규 이용 신청 차단** (신규 가입자는 Maps API 사용 불가)
- **기존 사용자 무료 이용량**: 2025년 6월 30일까지만 제공
- **2025년 7월 1일부터**: 무료 이용량 없이 전량 유료 과금

### 5.2 기존 무료 이용량 (2025년 6월 이전 기준, 참고용)

| API 종류 | 월 무료 한도 |
|----------|-------------|
| Web Dynamic Map | 무료 제공 (대표 계정 한정) |
| Static Map | 무료 제공 (대표 계정 한정) |
| Geocoding | 무료 제공 (대표 계정 한정) |
| Reverse Geocoding | 무료 제공 (대표 계정 한정) |
| Directions 5 / 15 | 별도 요금 |

- 과거 기준 일 무료 호출량: Dynamic Map 최대 20만건/일
- API 종류별로 월 3,000건 ~ 1억건까지 차등 제공

### 5.3 유료 과금 구조

- **종량제**: 요청 호출수 기준 과금
- Web Dynamic Map: 지도 로딩 1회 = 1건 (로딩 후 줌/마커 조작은 미과금)
- Static Map, Geocoding 등: API 호출 1회 = 1건
- 정확한 단가는 NCP 콘솔에서 확인 필요 (정책 변경 중)
- 사용량 한도는 NCP 웹 콘솔에서 직접 조정 가능

### 5.4 현재 상태 (2026년 3월 기준)

> 신규 신청이 차단되었으므로, 이미 등록된 애플리케이션이 없다면 네이버 Maps API를 새로 사용할 수 없을 가능성이 높다. 프로젝트 시작 전 NCP 콘솔에서 신규 등록 가능 여부를 반드시 확인해야 한다.

---

## 6. 대안 비교: 네이버 지도 vs 카카오 맵

### 6.1 비교표

| 항목 | 네이버 지도 API | 카카오 맵 API |
|------|----------------|--------------|
| **플랫폼** | 네이버 클라우드 플랫폼 (NCP) | 카카오 디벨로퍼스 |
| **JavaScript API** | Maps JavaScript API v3 | Kakao Maps SDK |
| **React 래퍼** | react-naver-maps | react-kakao-maps-sdk |
| **문서 품질** | 상세하나 분산되어 있음 | UI 깔끔, 가이드 명확 |
| **TypeScript 지원** | react-naver-maps에서 제공 | react-kakao-maps-sdk에서 제공 |
| **무료 정책** | 신규 신청 차단, 유료 전환 중 | 일 30만건 무료 (2025 기준) |
| **Geocoding** | REST API (서버 사이드) | REST API (서버 사이드) |
| **장소 검색** | 네이버 검색 API 연동 (최대 5건) | 키워드 장소 검색 내장 |
| **POI 데이터** | 네이버 포털 연동 (블로그 리뷰 등) | 카카오 플레이스 연동 |
| **항공뷰** | 지원 | 미지원 (스카이뷰는 있음) |
| **대중교통** | 지원 | 지원 |
| **클러스터링** | MarkerClustering 유틸 제공 | 별도 구현 필요 |
| **국내 점유율** | 높음 (네이버 포털 기반) | 높음 (카카오톡 기반) |

### 6.2 네이버 지도 선택 시 장점

- 네이버 포털 생태계와 연동 (블로그 리뷰, 장소 정보 등이 풍부)
- 항공뷰 제공
- 국내 POI 데이터 풍부 (특히 상업시설)
- 마커 클러스터링 내장 지원

### 6.3 네이버 지도 선택 시 단점

- **신규 신청 차단** (2025년 3월~): 가장 큰 리스크
- 무료 이용량 종료로 비용 발생
- 네이버 검색 API 장소 검색 결과가 최대 5건으로 제한적
- API 문서가 여러 곳에 분산되어 있어 찾기 어려움
- React 래퍼 라이브러리 업데이트 빈도 낮음

### 6.4 권장 사항

| 상황 | 권장 |
|------|------|
| 이미 NCP 계정에 Maps 앱이 등록되어 있음 | 네이버 지도 사용 가능 |
| 신규 프로젝트, NCP 등록 없음 | **카카오 맵 API 우선 검토** |
| 네이버 플레이스/블로그 리뷰 연동 필요 | 네이버 지도 (등록 가능 시) |
| 무료 사용량이 중요 | 카카오 맵 (일 30만건 무료) |
| 글로벌 서비스 | Google Maps API |

---

## 7. 프로젝트 적용 체크리스트

- [ ] NCP 콘솔에서 Maps API 신규 등록 가능 여부 확인
- [ ] 불가능 시 카카오 맵 API로 전환 검토
- [ ] 가능 시: Application 등록, Dynamic Map 선택, 도메인 등록
- [ ] `.env.local`에 Client ID / Secret 설정
- [ ] `react-naver-maps` 설치 및 NavermapsProvider 설정
- [ ] 지도 컴포넌트는 `'use client'` + `dynamic import (ssr: false)` 적용
- [ ] Geocoding은 Route Handler (서버 사이드)로 구현
- [ ] 마커 클러스터링 적용 (병원 대량 표시 시)

---

## Sources

- [네이버 클라우드 플랫폼 Maps](https://www.ncloud.com/v2/product/applicationService/maps)
- [Maps API 개요 - NCP 문서](https://api.ncloud-docs.com/docs/application-maps-overview)
- [클라이언트 아이디 발급 가이드](https://navermaps.github.io/maps.js.ncp/docs/tutorial-1-Getting-Client-ID.html)
- [NAVER Maps JavaScript API v3 문서](https://navermaps.github.io/maps.js.ncp/docs/)
- [react-naver-maps GitHub](https://github.com/zeakd/react-naver-maps)
- [react-naver-maps 문서](https://zeakd.github.io/react-naver-maps/)
- [react-naver-maps 클러스터링 튜토리얼](https://zeakd.github.io/react-naver-maps/examples/marker-cluster-tutorial/)
- [@naver-maps/react npm](https://www.npmjs.com/package/@naver-maps/react)
- [Maps API 무료 이용량 FAQ](https://www.ncloud-forums.com/topic/129/)
- [Maps API 요금 부과 기준 FAQ](https://www.ncloud-forums.com/topic/128/)
- [지도 API 신규 신청 차단 공지](https://www.ncloud.com/v2/support/notice/all/1930)
- [AI NAVER API 지도 무료 이용량 종료 공지](https://www.fin-ncloud.com/support/notice/all/1644)
- [Next.js 14 네이버 지도 API 통합 가이드 (Velog)](https://velog.io/@osohyun0224/Next.js-14%EB%A1%9C-%EB%84%A4%EC%9D%B4%EB%B2%84-%EC%A7%80%EB%8F%84-API%EB%A5%BC-%EC%9D%B4%EC%9A%A9%ED%95%B4-%EC%A7%80%EB%8F%84-%EA%B8%B0%EB%8A%A5-%EA%B0%9C%EB%B0%9C%ED%95%98%EA%B8%B0)
- [Next.js에 네이버맵 API 올리기 (Medium)](https://dj-min43.medium.com/next-js%EC%97%90-%EB%84%A4%EC%9D%B4%EB%B2%84%EB%A7%B5-api-%EC%98%AC%EB%A6%AC%EA%B8%B0-8ee385cbf160)
- [Nextjs에서 Naver Map 사용하기 (Velog)](https://velog.io/@min_jae/Nextjs-Nextjs%EC%97%90%EC%84%9C-Naver-Map%EC%9D%84-%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0)
- [지도 API 별 장단점 비교 (Velog)](https://velog.io/@songyeonji_/%EC%A7%80%EB%8F%84-API-%EB%B3%84-%EC%9E%A5%EB%8B%A8%EC%A0%90)
- [Next.js에서 Marker Clustering 구현 (Genspark)](https://www.genspark.ai/spark/implementing-marker-clustering-in-a-next-js-app-with-react-naver-map/76a74b19-108f-4cf8-8d9b-cb132be888d5)
