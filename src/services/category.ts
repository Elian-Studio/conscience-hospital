import { prisma } from "@/lib/db";
import type { CategoryTree } from "@/types/category";

export async function getCategoryTree(): Promise<CategoryTree> {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: {
        orderBy: { displayOrder: "asc" },
      },
    },
    orderBy: { displayOrder: "asc" },
  });

  return categories;
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      children: { orderBy: { displayOrder: "asc" } },
      parent: true,
    },
  });
}
