import type { NextRequest } from "next/server";
import { getNearbyHospitals } from "@/services/hospital";

const DEFAULT_RADIUS = 5; // km
const DEFAULT_LIMIT = 3;

// Korea coordinate bounds
const LAT_MIN = 33;
const LAT_MAX = 39;
const LNG_MIN = 124;
const LNG_MAX = 132;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const latStr = searchParams.get("lat");
    const lngStr = searchParams.get("lng");

    if (!latStr || !lngStr) {
      return Response.json(
        { error: "lat and lng parameters are required" },
        { status: 400 },
      );
    }

    const lat = Number(latStr);
    const lng = Number(lngStr);

    if (
      Number.isNaN(lat) ||
      Number.isNaN(lng) ||
      lat < LAT_MIN ||
      lat > LAT_MAX ||
      lng < LNG_MIN ||
      lng > LNG_MAX
    ) {
      return Response.json(
        { error: "Invalid coordinates. Must be within Korea bounds." },
        { status: 400 },
      );
    }

    const limit = searchParams.has("limit")
      ? Math.min(Math.max(Number(searchParams.get("limit")), 1), 10)
      : DEFAULT_LIMIT;

    const categoryId = searchParams.get("categoryId") ?? undefined;

    const { hospitals, outOfRadius } = await getNearbyHospitals({
      latitude: lat,
      longitude: lng,
      radius: DEFAULT_RADIUS,
      categoryId,
      limit,
    });

    return Response.json(
      { data: hospitals, outOfRadius },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    console.error("GET /api/nearby error:", error);
    return Response.json(
      { error: "Failed to fetch nearby hospitals" },
      { status: 500 },
    );
  }
}
