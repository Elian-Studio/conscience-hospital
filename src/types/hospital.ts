import type { Hospital, HiraEvaluation, Review, Category } from "@/generated/prisma/client";

export type HospitalWithCategory = Hospital & {
  category: Category;
};

export type HospitalWithDetails = Hospital & {
  category: Category;
  hiraEvaluation: HiraEvaluation | null;
  reviews: Review[];
};

export type HospitalListItem = Hospital & {
  category: Pick<Category, "id" | "name" | "slug">;
  _count?: { reviews: number };
};

export type NearbyHospital = HospitalListItem & {
  distance: number;
  hiraEvaluation: HiraEvaluation | null;
  outOfRadius?: boolean;
};

export interface HospitalListParams {
  categoryId?: string;
  region?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface NearbyParams {
  latitude: number;
  longitude: number;
  radius: number;
  categoryId?: string;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
