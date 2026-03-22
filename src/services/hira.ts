import { prisma } from "@/lib/db";
import type { HiraEvaluation } from "@/generated/prisma";

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
