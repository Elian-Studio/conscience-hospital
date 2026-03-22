import type { Review } from "@/generated/prisma";

export type { Review };

export interface CreateReviewInput {
  rating: number;
  content?: string;
  isConsc?: boolean;
  authorName?: string;
}

export interface ReviewListParams {
  hospitalId: string;
  page?: number;
  limit?: number;
}
