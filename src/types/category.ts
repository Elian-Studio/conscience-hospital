import type { Category } from "@/generated/prisma";

export type CategoryWithChildren = Category & {
  children: Category[];
};

export type CategoryTree = CategoryWithChildren[];
