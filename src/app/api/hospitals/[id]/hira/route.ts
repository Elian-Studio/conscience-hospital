import type { NextRequest } from "next/server";
import { getHospitalById } from "@/services/hospital";
import { syncAllFromHira } from "@/services/hira";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const hospital = await getHospitalById(id);

    if (!hospital) {
      return Response.json({ error: "Hospital not found" }, { status: 404 });
    }

    if (!hospital.ykiho) {
      return Response.json(
        { error: "Hospital has no ykiho code" },
        { status: 400 }
      );
    }

    const result = await syncAllFromHira(id, hospital.ykiho);

    return Response.json({
      message: "HIRA data synced",
      hospitalId: id,
      ...result,
    });
  } catch (error) {
    console.error("POST /api/hospitals/[id]/hira error:", error);
    return Response.json(
      { error: "Failed to sync HIRA data" },
      { status: 500 }
    );
  }
}
