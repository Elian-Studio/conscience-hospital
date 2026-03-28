import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";

const prisma = new PrismaClient();

const HIRA_BASE_URL = "https://apis.data.go.kr/B551182";
const SERVICE_KEY = process.env.HIRA_API_KEY ?? "";
const DELAY_MS = 300; // rate limit: ~3 req/sec

interface HiraResponse<T> {
  response: {
    header: { resultCode: string; resultMsg: string };
    body: {
      items: { item: T | T[] } | "";
      totalCount: number;
    };
  };
}

interface HospInfoItem {
  ykiho: string;
  yadmNm: string;
  drTotCnt: number;
  sdrCnt: number;
}

interface EvalItem {
  ykiho: string;
  yadmNm: string;
  antiRate?: string;
  injRate?: string;
  mdcinCnt?: string;
}

function normalizeItems<T>(items: { item: T | T[] } | ""): T[] {
  if (items === "" || !items) return [];
  const item = items.item;
  return Array.isArray(item) ? item : [item];
}

function gradeFromString(value: string | undefined): number | null {
  if (!value) return null;
  const num = parseInt(value, 10);
  return isNaN(num) ? null : Math.min(5, Math.max(1, num));
}

function calculateOverallGrade(...grades: (number | null)[]): number | null {
  const valid = grades.filter((g): g is number => g !== null);
  if (valid.length === 0) return null;
  return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length);
}

async function fetchJson<T>(path: string, ykiho: string): Promise<T[]> {
  const url = new URL(`${HIRA_BASE_URL}/${path}`);
  url.searchParams.set("serviceKey", SERVICE_KEY);
  url.searchParams.set("_type", "json");
  url.searchParams.set("numOfRows", "10");
  url.searchParams.set("pageNo", "1");
  url.searchParams.set("ykiho", ykiho);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data: HiraResponse<T> = await res.json();
  if (data.response.header.resultCode !== "00") {
    throw new Error(`HIRA: ${data.response.header.resultMsg}`);
  }
  return normalizeItems(data.response.body.items);
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  if (!SERVICE_KEY) {
    console.error("HIRA_API_KEY is not set. Add it to .env");
    process.exit(1);
  }

  const hospitals = await prisma.hospital.findMany({
    where: { ykiho: { not: null } },
    select: { id: true, name: true, ykiho: true },
  });

  console.log(`Found ${hospitals.length} hospitals with ykiho\n`);

  let infoUpdated = 0;
  let evalUpdated = 0;
  let errors = 0;

  for (const hospital of hospitals) {
    const ykiho = hospital.ykiho!;
    process.stdout.write(`[${hospital.name}] (${ykiho}) ... `);

    try {
      // 1. Hospital info (doctor count)
      const infoItems = await fetchJson<HospInfoItem>(
        "hospInfoServicev2/getHospBasisList",
        ykiho
      );
      if (infoItems.length > 0) {
        const info = infoItems[0];
        await prisma.hospital.update({
          where: { id: hospital.id },
          data: {
            doctorCount: info.drTotCnt ?? 0,
            specialistCount: info.sdrCnt ?? 0,
          },
        });
        infoUpdated++;
        process.stdout.write(`info OK `);
      } else {
        process.stdout.write(`info SKIP `);
      }

      await sleep(DELAY_MS);

      // 2. Evaluation data
      const evalItems = await fetchJson<EvalItem>(
        "MadmDtlInfoService2/getDiagAmtInfo2",
        ykiho
      );
      if (evalItems.length > 0) {
        const item = evalItems[0];
        const antibioticRate = gradeFromString(item.antiRate);
        const injectionRate = gradeFromString(item.injRate);
        const medicineCount = gradeFromString(item.mdcinCnt);

        await prisma.hiraEvaluation.upsert({
          where: { hospitalId: hospital.id },
          update: {
            antibioticRate,
            injectionRate,
            medicineCount,
            overallGrade: calculateOverallGrade(
              antibioticRate,
              injectionRate,
              medicineCount
            ),
            evaluationYear: new Date().getFullYear(),
          },
          create: {
            hospitalId: hospital.id,
            antibioticRate,
            injectionRate,
            medicineCount,
            overallGrade: calculateOverallGrade(
              antibioticRate,
              injectionRate,
              medicineCount
            ),
            evaluationYear: new Date().getFullYear(),
          },
        });
        evalUpdated++;
        process.stdout.write(`eval OK\n`);
      } else {
        process.stdout.write(`eval SKIP\n`);
      }

      await sleep(DELAY_MS);
    } catch (err) {
      errors++;
      console.log(`ERROR: ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log(`\n--- Summary ---`);
  console.log(`Hospital info updated: ${infoUpdated}/${hospitals.length}`);
  console.log(`Evaluations updated:   ${evalUpdated}/${hospitals.length}`);
  console.log(`Errors:                ${errors}`);

  // Recalculate consc scores
  console.log("\nRecalculating consc scores...");
  const { calculateConscScore } = await import(
    "../src/utils/data/conscScore.js"
  );

  const allHospitals = await prisma.hospital.findMany({
    include: { reviews: true, hiraEvaluation: true },
  });

  for (const h of allHospitals) {
    const avgRating =
      h.reviews.length > 0
        ? h.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / h.reviews.length
        : null;
    const score = calculateConscScore(avgRating, h.hiraEvaluation?.overallGrade ?? null);
    await prisma.hospital.update({
      where: { id: h.id },
      data: { conscScore: score },
    });
  }

  console.log("Consc scores updated.");
}

main()
  .catch((e) => {
    console.error("Failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
