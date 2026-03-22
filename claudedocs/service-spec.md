# 양심 병원 지도 서비스 - 기획 명세서

## 1. 서비스 개요

### 1.1 서비스명 (가칭)
**양심병원 지도** - 전국 양심 병원을 지도에서 쉽게 찾을 수 있는 서비스

### 1.2 핵심 가치
- **과잉진료 없는 병원**을 쉽게 찾을 수 있도록
- 커뮤니티 추천 + 공공데이터(HIRA) 검증으로 **신뢰성 확보**
- 기존 블로그 기반 정보의 한계(검색/필터 불가)를 **지도 기반 서비스**로 해결

### 1.3 차별점
| 기존 서비스 | 양심병원 지도 |
|------------|-------------|
| 광고 기반 추천 (똑닥, 굿닥) | 커뮤니티 추천 + 공공데이터 검증 |
| 리뷰 조작 가능 | 과잉진료율 등 객관적 지표 공개 |
| 비급여/미용 시술 편중 | 일반 진료과 양심 병원 중심 |
| 리스트 형태 (블로그) | 지도 기반 위치 검색 |

---

## 2. 기술 스택

| 구분 | 기술 |
|------|------|
| **프레임워크** | Next.js 15 (App Router) |
| **언어** | TypeScript |
| **스타일링** | Tailwind CSS |
| **지도 API** | Kakao Map API (JavaScript SDK) |
| **DB** | SQLite (Prisma ORM) - MVP |
| **배포** | Vercel (예정) |
| **공공데이터** | HIRA API (건강보험심사평가원) |

---

## 3. 핵심 기능

### 3.1 지도 기반 병원 검색
- 카카오 맵에 양심 병원 마커 표시
- 현재 위치 기반 주변 양심 병원 탐색
- 지도 이동/줌에 따른 마커 동적 로드
- 마커 클러스터링 (대량 병원 표시)

### 3.2 진료과목 카테고리 필터
```
의사 전문과목 (주요)
├── 내과
├── 외과
├── 소아청소년과
├── 산부인과
├── 정형외과
├── 피부과
├── 이비인후과
├── 안과
├── 비뇨의학과
├── 신경외과
├── 정신건강의학과
└── 가정의학과

치과
├── 일반치과
├── 교정과
├── 보철과
├── 소아치과
└── 구강외과

한의원
├── 일반한의원
├── 침구과
└── 한방내과

기타
├── 동물병원
├── 약국
└── 한약국
```

### 3.3 양심 병원 점수 시스템
```
양심 점수 = (커뮤니티 점수 * 0.6) + (공공데이터 점수 * 0.4)

커뮤니티 점수 (60%):
  - 사용자 추천 수
  - 리뷰 평점
  - 재방문 의향률

공공데이터 점수 (40%) - HIRA 적정성 평가:
  - 항생제 처방률 (낮을수록 높은 점수)
  - 주사제 처방률 (낮을수록 높은 점수)
  - 약품목수 (적을수록 높은 점수)
  - 적정성 평가 종합등급 (1등급 = 최고)
```

### 3.4 병원 상세 정보
- 병원명, 주소, 전화번호, 진료시간
- 진료과목, 전문의 수
- 양심 점수 및 세부 지표
- 커뮤니티 리뷰/추천
- HIRA 적정성 평가 결과
- 길찾기 (카카오맵 연동)

### 3.5 위치 기반 추천
- GPS 기반 현재 위치 감지
- 반경 설정 (1km, 3km, 5km, 10km)
- 진료과목 + 거리 복합 필터
- "내 주변 양심 병원 TOP 5" 추천

### 3.6 사용자 참여 (커뮤니티)
- 병원 추천/제보 기능
- 리뷰 작성 (별점 + 텍스트)
- "양심적이었다" / "과잉진료 경험" 투표

---

## 4. 화면 구성

### 4.1 메인 페이지 (`/`)
```
┌─────────────────────────────────────────────┐
│  [양심병원 지도]          [카테고리] [내주변] │
├─────────────────────────────────────────────┤
│  ┌──────────────────────────────────────┐   │
│  │  검색바: "지역 또는 병원명 검색"      │   │
│  └──────────────────────────────────────┘   │
│                                             │
│  ┌──────────┐ ┌──────────────────────────┐  │
│  │          │ │                          │  │
│  │ 병원     │ │      카카오 맵           │  │
│  │ 리스트   │ │      (마커 표시)          │  │
│  │ 사이드   │ │                          │  │
│  │ 패널     │ │      [+] [-] [현위치]    │  │
│  │          │ │                          │  │
│  └──────────┘ └──────────────────────────┘  │
│                                             │
│  [카테고리 필터: 내과|외과|치과|한의원|...]   │
└─────────────────────────────────────────────┘
```

### 4.2 병원 상세 페이지 (`/hospital/[id]`)
```
┌─────────────────────────────────────────────┐
│  ← 뒤로  병원 상세                           │
├─────────────────────────────────────────────┤
│  [병원명]                    양심점수: 92    │
│  [주소] [전화번호]                           │
│  [진료과목 태그들]                            │
│                                             │
│  ┌─ HIRA 적정성 평가 ───────────────────┐   │
│  │ 항생제처방률: 1등급 ★                │   │
│  │ 주사제처방률: 2등급 ★                │   │
│  │ 약품목수: 1등급 ★                    │   │
│  └──────────────────────────────────────┘   │
│                                             │
│  ┌─ 미니맵 ────────────────────────────┐   │
│  │  [카카오맵 - 병원 위치]              │   │
│  │              [길찾기]                │   │
│  └──────────────────────────────────────┘   │
│                                             │
│  ┌─ 리뷰 ──────────────────────────────┐   │
│  │ 양심적 (23) | 과잉진료 (1)           │   │
│  │ 리뷰 목록...                         │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### 4.3 카테고리 페이지 (`/category/[slug]`)
- 진료과목별 양심 병원 목록
- 지역 필터 (시/도, 시/군/구)
- 정렬: 양심점수순, 거리순, 리뷰순

### 4.4 병원 제보 페이지 (`/recommend`)
- 병원명, 주소, 진료과목 입력
- 추천 사유 텍스트
- 제출 후 관리자 검토 → 승인 시 등록

---

## 5. 데이터 모델

### 5.1 Hospital (병원)
```
Hospital {
  id            String    @id
  name          String              // 병원명
  address       String              // 주소
  phone         String?             // 전화번호
  latitude      Float               // 위도
  longitude     Float               // 경도
  categoryId    String              // 진료과목 카테고리
  ykiho         String?             // HIRA 요양기호 (API 연계키)
  doctorCount   Int?                // 의사 수
  specialistCount Int?              // 전문의 수
  conscScore    Float?              // 양심 점수 (0-100)
  isVerified    Boolean @default(false) // 관리자 검증 여부
  source        String              // 데이터 출처 (blog, community, hira)
  createdAt     DateTime
  updatedAt     DateTime
}
```

### 5.2 Category (진료과목)
```
Category {
  id            String    @id
  name          String              // 카테고리명 (내과, 외과...)
  slug          String    @unique   // URL용 슬러그
  parentId      String?             // 상위 카테고리
  icon          String?             // 아이콘
  displayOrder  Int                 // 표시 순서
}
```

### 5.3 HiraEvaluation (HIRA 적정성 평가)
```
HiraEvaluation {
  id              String    @id
  hospitalId      String
  antibioticRate  Int?      // 항생제 처방률 등급 (1-5)
  injectionRate   Int?      // 주사제 처방률 등급 (1-5)
  medicineCount   Int?      // 약품목수 등급 (1-5)
  overallGrade    Int?      // 종합 등급 (1-5)
  evaluationYear  Int       // 평가 연도
  updatedAt       DateTime
}
```

### 5.4 Review (리뷰)
```
Review {
  id            String    @id
  hospitalId    String
  rating        Int       // 1-5 별점
  content       String?   // 리뷰 내용
  isConsc       Boolean   // 양심적이었다 (true/false)
  createdAt     DateTime
}
```

### 5.5 Recommendation (병원 제보)
```
Recommendation {
  id            String    @id
  hospitalName  String
  address       String
  category      String
  reason        String    // 추천 사유
  status        String    // pending, approved, rejected
  createdAt     DateTime
}
```

---

## 6. API 설계

### 6.1 병원 API
```
GET  /api/hospitals              - 병원 목록 (필터: 카테고리, 지역, 반경)
GET  /api/hospitals/[id]         - 병원 상세
GET  /api/hospitals/nearby       - 내 주변 병원 (lat, lng, radius)
GET  /api/hospitals/search       - 병원 검색 (keyword)
```

### 6.2 카테고리 API
```
GET  /api/categories             - 카테고리 목록
GET  /api/categories/[slug]      - 카테고리별 병원 목록
```

### 6.3 리뷰 API
```
GET  /api/hospitals/[id]/reviews - 병원 리뷰 목록
POST /api/hospitals/[id]/reviews - 리뷰 작성
```

### 6.4 제보 API
```
POST /api/recommendations        - 병원 제보
```

### 6.5 HIRA 데이터 API
```
GET  /api/hira/evaluation/[ykiho] - HIRA 적정성 평가 조회
```

---

## 7. 초기 데이터 전략

### 7.1 블로그 데이터 활용
- 기존 "양심병원리스트" 블로그의 병원 데이터를 시드 데이터로 활용
- 병원명 + 주소 → 카카오 지도 Geocoding API로 좌표 변환
- source: "blog"으로 표시

### 7.2 HIRA 공공데이터 연동
- 병원정보서비스 API로 기본 정보 보강 (의사 수, 전문의 수 등)
- 병원평가정보서비스 API로 적정성 평가 데이터 수집
- ykiho (요양기호)로 API 간 연계

### 7.3 데이터 갱신
- HIRA 데이터: 분기별 수동 갱신 (MVP)
- 커뮤니티 데이터: 실시간 (제보/리뷰)

---

## 8. 프로젝트 구조

```
good-hospital/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # 루트 레이아웃
│   │   ├── page.tsx            # 메인 (지도 + 리스트)
│   │   ├── hospital/
│   │   │   └── [id]/
│   │   │       └── page.tsx    # 병원 상세
│   │   ├── category/
│   │   │   └── [slug]/
│   │   │       └── page.tsx    # 카테고리별 목록
│   │   ├── recommend/
│   │   │   └── page.tsx        # 병원 제보
│   │   └── api/                # API Routes
│   │       ├── hospitals/
│   │       ├── categories/
│   │       ├── reviews/
│   │       ├── recommendations/
│   │       └── hira/
│   ├── components/             # UI 컴포넌트
│   │   ├── map/                # 지도 관련
│   │   ├── hospital/           # 병원 카드, 리스트
│   │   ├── category/           # 카테고리 필터
│   │   ├── review/             # 리뷰 관련
│   │   └── ui/                 # 공통 UI
│   ├── lib/                    # 유틸리티, DB 클라이언트
│   │   ├── db.ts               # Prisma 클라이언트
│   │   ├── kakao.ts            # 카카오맵 유틸
│   │   └── hira.ts             # HIRA API 클라이언트
│   ├── services/               # 비즈니스 로직
│   │   ├── hospital.ts
│   │   ├── category.ts
│   │   ├── review.ts
│   │   └── hira.ts
│   ├── types/                  # TypeScript 타입
│   └── styles/                 # 글로벌 스타일
├── prisma/
│   └── schema.prisma           # DB 스키마
├── scripts/                    # 데이터 수집 스크립트
│   ├── seed.ts                 # 시드 데이터
│   └── fetch-hira.ts           # HIRA 데이터 수집
├── data/                       # 정적 데이터
│   └── seed-hospitals.json     # 블로그 기반 초기 데이터
└── public/                     # 정적 자원
    └── icons/                  # 카테고리 아이콘
```
