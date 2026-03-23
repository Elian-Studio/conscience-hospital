import type { Category } from "@/generated/prisma/client";

export type CategoryWithChildren = Category & {
  children: Category[];
};

export type CategoryTree = CategoryWithChildren[];
