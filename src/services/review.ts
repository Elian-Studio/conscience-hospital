import { prisma } from "@/lib/db";
import type { CreateReviewInput, ReviewListParams } from "@/types/review";
import type { PaginatedResult } from "@/types/hospital";
import type { Review } from "@/generated/prisma";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

export async function getReviews(
  params: ReviewListParams
): Promise<PaginatedResult<Review>> {
  const page = params.page ?? DEFAULT_PAGE;
  const limit = params.limit ?? DEFAULT_LIMIT;
  const skip = (page - 1) * limit;

  const where = { hospitalId: params.hospitalId };

  const [data, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.review.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createReview(
  hospitalId: string,
  input: CreateReviewInput
): Promise<Review> {
  // Verify hospital exists
  const hospital = await prisma.hospital.findUnique({
    where: { id: hospitalId },
  });

  if (!hospital) {
    throw new Error("Hospital not found");
  }

  if (input.rating < 1 || input.rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  return prisma.review.create({
    data: {
      hospitalId,
      rating: input.rating,
      content: input.content ?? null,
      isConsc: input.isConsc ?? true,
      authorName: input.authorName ?? null,
    },
  });
}
