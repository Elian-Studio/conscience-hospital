import { getCategoryTree } from "@/services/category";

export async function GET() {
  try {
    const categories = await getCategoryTree();
    return Response.json({ data: categories }, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return Response.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
