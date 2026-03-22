import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { calculateConscScore } from "../src/utils/data/conscScore.js";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

interface CategoryData {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  icon: string | null;
  displayOrder: number;
}

interface HospitalData {
  name: string;
  address: string;
  phone: string | null;
  latitude: number;
  longitude: number;
  categorySlug: string;
  source: string;
}

const SAMPLE_REVIEWS = [
  "과잉진료 없이 꼼꼼하게 진료해주셔서 좋았습니다.",
  "필요한 검사만 하시고 솔직하게 설명해주세요.",
  "불필요한 약 처방 없이 양심적으로 진료하시는 분입니다.",
  "재방문 의향 100%. 주변에도 추천합니다.",
  "과잉 치료 없이 정확한 진단과 치료를 해주셨습니다.",
  "진료비가 합리적이고 설명을 자세히 해주십니다.",
  "아이를 데리고 갔는데 꼭 필요한 약만 처방해주셨어요.",
  "동네 주민들 사이에서 양심 병원으로 소문난 곳입니다.",
  "항생제 남용 없이 치료해주셔서 신뢰가 갑니다.",
  "검사를 강요하지 않고 환자 입장에서 생각해주세요.",
];

async function seedCategories(): Promise<void> {
  console.log("Seeding categories...");
  const raw = readFileSync(
    join(__dirname, "../data/categories.json"),
    "utf-8"
  );
  const categories: CategoryData[] = JSON.parse(raw);

  const parents = categories.filter((c) => c.parentId === null);
  const children = categories.filter((c) => c.parentId !== null);

  for (const cat of [...parents, ...children]) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        parentId: cat.parentId,
        icon: cat.icon,
        displayOrder: cat.displayOrder,
      },
      create: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        parentId: cat.parentId,
        icon: cat.icon,
        displayOrder: cat.displayOrder,
      },
    });
  }
  console.log(`  ${categories.length} categories seeded.`);
}

async function seedHospitals(): Promise<string[]> {
  console.log("Seeding hospitals...");
  const raw = readFileSync(
    join(__dirname, "../data/seed-hospitals.json"),
    "utf-8"
  );
  const hospitals: HospitalData[] = JSON.parse(raw);

  const hospitalIds: string[] = [];

  for (const h of hospitals) {
    const category = await prisma.category.findUnique({
      where: { slug: h.categorySlug },
    });
    if (!category) {
      console.warn(`  Category not found: ${h.categorySlug}, skipping ${h.name}`);
      continue;
    }

    const hospital = await prisma.hospital.create({
      data: {
        name: h.name,
        address: h.address,
        phone: h.phone,
        latitude: h.latitude,
        longitude: h.longitude,
        categoryId: category.id,
        source: h.source,
        isVerified: true,
      },
    });
    hospitalIds.push(hospital.id);
  }
  console.log(`  ${hospitalIds.length} hospitals seeded.`);
  return hospitalIds;
}

async function seedHiraEvaluations(hospitalIds: string[]): Promise<void> {
  console.log("Seeding HIRA evaluations...");
  let count = 0;

  for (const hospitalId of hospitalIds) {
    if (Math.random() > 0.7) continue;

    const grade = Math.ceil(Math.random() * 3);
    await prisma.hiraEvaluation.create({
      data: {
        hospitalId,
        antibioticRate: Math.ceil(Math.random() * 3),
        injectionRate: Math.ceil(Math.random() * 3),
        medicineCount: Math.ceil(Math.random() * 3),
        overallGrade: grade,
        evaluationYear: 2025,
      },
    });
    count++;
  }
  console.log(`  ${count} HIRA evaluations seeded.`);
}

async function seedReviews(hospitalIds: string[]): Promise<void> {
  console.log("Seeding reviews...");
  let count = 0;

  for (const hospitalId of hospitalIds) {
    const reviewCount = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < reviewCount; i++) {
      const rating = 3 + Math.floor(Math.random() * 3);
      await prisma.review.create({
        data: {
          hospitalId,
          rating,
          content:
            SAMPLE_REVIEWS[Math.floor(Math.random() * SAMPLE_REVIEWS.length)],
          isConsc: rating >= 4,
          authorName: `사용자${Math.floor(Math.random() * 1000)}`,
        },
      });
      count++;
    }
  }
  console.log(`  ${count} reviews seeded.`);
}

async function updateConscScores(): Promise<void> {
  console.log("Updating consc scores...");
  const hospitals = await prisma.hospital.findMany({
    include: {
      reviews: true,
      hiraEvaluation: true,
    },
  });

  for (const hospital of hospitals) {
    const avgRating =
      hospital.reviews.length > 0
        ? hospital.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) /
          hospital.reviews.length
        : null;

    const overallGrade = hospital.hiraEvaluation?.overallGrade ?? null;
    const score = calculateConscScore(avgRating, overallGrade);

    await prisma.hospital.update({
      where: { id: hospital.id },
      data: { conscScore: score },
    });
  }
  console.log("  Consc scores updated.");
}

async function main(): Promise<void> {
  console.log("Starting seed...\n");

  await prisma.review.deleteMany();
  await prisma.hiraEvaluation.deleteMany();
  await prisma.hospital.deleteMany();
  await prisma.category.deleteMany();

  await seedCategories();
  const hospitalIds = await seedHospitals();
  await seedHiraEvaluations(hospitalIds);
  await seedReviews(hospitalIds);
  await updateConscScores();

  console.log("\nSeed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
