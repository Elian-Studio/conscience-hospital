import { prisma } from "@/lib/db";
import {
  fetchHospitalInfo,
  fetchHospitalEvaluation,
  cachedFetch,
} from "@/lib/hira-client";
import type { HiraEvaluation } from "@/generated/prisma/client";

export async function getHiraEvaluation(
  hospitalId: string
): Promise<HiraEvaluation | null> {
  return prisma.hiraEvaluation.findUnique({
    where: { hospitalId },
  });
}

export async function getHiraEvaluationByYkiho(
  ykiho: string
): Promise<HiraEvaluation | null> {
  const hospital = await prisma.hospital.findFirst({
    where: { ykiho },
    include: { hiraEvaluation: true },
  });

  return hospital?.hiraEvaluation ?? null;
}

export async function syncHospitalFromHira(
  hospitalId: string,
  ykiho: string
): Promise<{ doctorCount: number; specialistCount: number } | null> {
  const info = await cachedFetch(`hospital-info:${ykiho}`, () =>
    fetchHospitalInfo(ykiho)
  );

  if (!info) return null;

  await prisma.hospital.update({
    where: { id: hospitalId },
    data: {
      doctorCount: info.doctorCount,
      specialistCount: info.specialistCount,
    },
  });

  return {
    doctorCount: info.doctorCount,
    specialistCount: info.specialistCount,
  };
}

export async function syncEvaluationFromHira(
  hospitalId: string,
  ykiho: string
): Promise<HiraEvaluation | null> {
  const evaluation = await cachedFetch(`evaluation:${ykiho}`, () =>
    fetchHospitalEvaluation(ykiho)
  );

  if (!evaluation) return null;

  return prisma.hiraEvaluation.upsert({
    where: { hospitalId },
    update: {
      antibioticRate: evaluation.antibioticRate,
      injectionRate: evaluation.injectionRate,
      medicineCount: evaluation.medicineCount,
      overallGrade: evaluation.overallGrade,
      evaluationYear: new Date().getFullYear(),
    },
    create: {
      hospitalId,
      antibioticRate: evaluation.antibioticRate,
      injectionRate: evaluation.injectionRate,
      medicineCount: evaluation.medicineCount,
      overallGrade: evaluation.overallGrade,
      evaluationYear: new Date().getFullYear(),
    },
  });
}

export async function syncAllFromHira(hospitalId: string, ykiho: string) {
  const [info, evaluation] = await Promise.all([
    syncHospitalFromHira(hospitalId, ykiho),
    syncEvaluationFromHira(hospitalId, ykiho),
  ]);
  return { info, evaluation };
}
