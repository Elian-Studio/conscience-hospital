import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { hospitalName, address, category, reason } = body;

    if (!hospitalName || !address || !category || !reason) {
      return Response.json(
        {
          error:
            "hospitalName, address, category, and reason are all required",
        },
        { status: 400 }
      );
    }

    if (typeof hospitalName !== "string" || hospitalName.trim().length === 0) {
      return Response.json(
        { error: "hospitalName must be a non-empty string" },
        { status: 400 }
      );
    }

    const recommendation = await prisma.recommendation.create({
      data: {
        hospitalName: hospitalName.trim(),
        address: address.trim(),
        category: category.trim(),
        reason: reason.trim(),
      },
    });

    return Response.json(recommendation, { status: 201 });
  } catch (error) {
    console.error("POST /api/recommendations error:", error);
    return Response.json(
      { error: "Failed to create recommendation" },
      { status: 500 }
    );
  }
}
