import { env } from "@/lib/env";

const HIRA_BASE_URL = "https://apis.data.go.kr/B551182";

interface HiraRequestParams {
  serviceKey: string;
  ykiho?: string;
  pageNo?: number;
  numOfRows?: number;
  _type?: string;
  [key: string]: string | number | undefined;
}

interface HiraHospitalInfoItem {
  ykiho: string;
  yadmNm: string;
  drTotCnt: number;
  sdrCnt: number;
}

interface HiraEvalItem {
  ykiho: string;
  yadmNm: string;
  antiRate?: string;
  injRate?: string;
  mdcinCnt?: string;
  score?: string;
}

interface HiraResponse<T> {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: { item: T | T[] } | "";
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

export interface HospitalInfoResult {
  ykiho: string;
  name: string;
  doctorCount: number;
  specialistCount: number;
}

export interface EvaluationResult {
  ykiho: string;
  name: string;
  antibioticRate: number | null;
  injectionRate: number | null;
  medicineCount: number | null;
  overallGrade: number | null;
}

function gradeFromString(value: string | undefined): number | null {
  if (!value) return null;
  const num = parseInt(value, 10);
  return isNaN(num) ? null : Math.min(5, Math.max(1, num));
}

function calculateOverallGrade(
  antibioticRate: number | null,
  injectionRate: number | null,
  medicineCount: number | null
): number | null {
  const grades = [antibioticRate, injectionRate, medicineCount].filter(
    (g): g is number => g !== null
  );
  if (grades.length === 0) return null;
  return Math.round(grades.reduce((a, b) => a + b, 0) / grades.length);
}

function buildUrl(path: string, params: HiraRequestParams): string {
  const url = new URL(`${HIRA_BASE_URL}/${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

function normalizeItems<T>(items: { item: T | T[] } | ""): T[] {
  if (items === "" || !items) return [];
  const item = items.item;
  return Array.isArray(item) ? item : [item];
}

async function fetchHira<T>(
  path: string,
  params: Omit<HiraRequestParams, "serviceKey" | "_type">
): Promise<T[]> {
  const url = buildUrl(path, {
    serviceKey: env.HIRA_API_KEY,
    _type: "json",
    numOfRows: 100,
    pageNo: 1,
    ...params,
  });

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HIRA API error: ${response.status} ${response.statusText}`);
  }

  const data: HiraResponse<T> = await response.json();

  if (data.response.header.resultCode !== "00") {
    throw new Error(
      `HIRA API error: ${data.response.header.resultCode} - ${data.response.header.resultMsg}`
    );
  }

  return normalizeItems(data.response.body.items);
}

export async function fetchHospitalInfo(
  ykiho: string
): Promise<HospitalInfoResult | null> {
  const items = await fetchHira<HiraHospitalInfoItem>(
    "hospInfoServicev2/getHospBasisList",
    { ykiho }
  );

  if (items.length === 0) return null;

  const item = items[0];
  return {
    ykiho: item.ykiho,
    name: item.yadmNm,
    doctorCount: item.drTotCnt ?? 0,
    specialistCount: item.sdrCnt ?? 0,
  };
}

export async function fetchHospitalEvaluation(
  ykiho: string
): Promise<EvaluationResult | null> {
  const items = await fetchHira<HiraEvalItem>(
    "MadmDtlInfoService2/getDiagAmtInfo2",
    { ykiho }
  );

  if (items.length === 0) return null;

  const item = items[0];
  const antibioticRate = gradeFromString(item.antiRate);
  const injectionRate = gradeFromString(item.injRate);
  const medicineCount = gradeFromString(item.mdcinCnt);

  return {
    ykiho: item.ykiho,
    name: item.yadmNm,
    antibioticRate,
    injectionRate,
    medicineCount,
    overallGrade: calculateOverallGrade(antibioticRate, injectionRate, medicineCount),
  };
}

const CACHE = new Map<string, { data: unknown; expiresAt: number }>();
const DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL_MS
): Promise<T> {
  const cached = CACHE.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data as T;
  }

  const data = await fetcher();
  CACHE.set(key, { data, expiresAt: Date.now() + ttlMs });
  return data;
}
