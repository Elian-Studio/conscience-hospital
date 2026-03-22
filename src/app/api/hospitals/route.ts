import type { NextRequest } from "next/server";
import { getHospitals } from "@/services/hospital";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const result = await getHospitals({
      categoryId: searchParams.get("categoryId") ?? undefined,
      region: searchParams.get("region") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      page: searchParams.has("page")
        ? Number(searchParams.get("page"))
        : undefined,
      limit: searchParams.has("limit")
        ? Number(searchParams.get("limit"))
        : undefined,
    });

    return Response.json(result);
  } catch (error) {
    console.error("GET /api/hospitals error:", error);
    return Response.json(
      { error: "Failed to fetch hospitals" },
      { status: 500 }
    );
  }
}
