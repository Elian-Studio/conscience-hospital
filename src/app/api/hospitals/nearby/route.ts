import type { NextRequest } from "next/server";
import { getNearbyHospitals } from "@/services/hospital";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const radius = searchParams.get("radius");

    if (!lat || !lng) {
      return Response.json(
        { error: "lat and lng are required" },
        { status: 400 }
      );
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusKm = radius ? parseFloat(radius) : 3;

    if (isNaN(latitude) || isNaN(longitude)) {
      return Response.json(
        { error: "lat and lng must be valid numbers" },
        { status: 400 }
      );
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return Response.json(
        { error: "Invalid coordinate range" },
        { status: 400 }
      );
    }

    const result = await getNearbyHospitals({
      latitude,
      longitude,
      radius: radiusKm,
      categoryId: searchParams.get("categoryId") ?? undefined,
      limit: searchParams.has("limit")
        ? Number(searchParams.get("limit"))
        : undefined,
    });

    return Response.json({ data: result });
  } catch (error) {
    console.error("GET /api/hospitals/nearby error:", error);
    return Response.json(
      { error: "Failed to fetch nearby hospitals" },
      { status: 500 }
    );
  }
}
