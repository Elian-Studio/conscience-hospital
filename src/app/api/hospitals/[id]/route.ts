import type { NextRequest } from "next/server";
import { getHospitalById } from "@/services/hospital";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const hospital = await getHospitalById(id);

    if (!hospital) {
      return Response.json({ error: "Hospital not found" }, { status: 404 });
    }

    return Response.json(hospital);
  } catch (error) {
    console.error("GET /api/hospitals/[id] error:", error);
    return Response.json(
      { error: "Failed to fetch hospital" },
      { status: 500 }
    );
  }
}
