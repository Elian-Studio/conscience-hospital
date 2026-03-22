import type { NextRequest } from "next/server";
import { searchHospitals } from "@/services/hospital";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const keyword = searchParams.get("q");

    if (!keyword || keyword.trim().length === 0) {
      return Response.json(
        { error: "Search query (q) is required" },
        { status: 400 }
      );
    }

    const limit = searchParams.has("limit")
      ? Number(searchParams.get("limit"))
      : 20;

    const data = await searchHospitals(keyword.trim(), limit);

    return Response.json({ data });
  } catch (error) {
    console.error("GET /api/hospitals/search error:", error);
    return Response.json(
      { error: "Failed to search hospitals" },
      { status: 500 }
    );
  }
}
