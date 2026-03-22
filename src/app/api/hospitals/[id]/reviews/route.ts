import type { NextRequest } from "next/server";
import { getReviews, createReview } from "@/services/review";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = request.nextUrl;

    const result = await getReviews({
      hospitalId: id,
      page: searchParams.has("page")
        ? Number(searchParams.get("page"))
        : undefined,
      limit: searchParams.has("limit")
        ? Number(searchParams.get("limit"))
        : undefined,
    });

    return Response.json(result);
  } catch (error) {
    console.error("GET /api/hospitals/[id]/reviews error:", error);
    return Response.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.rating || typeof body.rating !== "number") {
      return Response.json(
        { error: "rating (number) is required" },
        { status: 400 }
      );
    }

    const review = await createReview(id, {
      rating: body.rating,
      content: body.content,
      isConsc: body.isConsc,
      authorName: body.authorName,
    });

    return Response.json(review, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create review";
    const status = message === "Hospital not found" ? 404 : 500;
    console.error("POST /api/hospitals/[id]/reviews error:", error);
    return Response.json({ error: message }, { status });
  }
}
