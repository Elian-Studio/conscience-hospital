import { prisma } from "@/lib/db";
import type {
  HospitalListParams,
  HospitalWithDetails,
  HospitalListItem,
  NearbyParams,
  NearbyHospital,
  PaginatedResult,
} from "@/types/hospital";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

export async function getHospitals(
  params: HospitalListParams
): Promise<PaginatedResult<HospitalListItem>> {
  const page = params.page ?? DEFAULT_PAGE;
  const limit = params.limit ?? DEFAULT_LIMIT;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (params.categoryId) {
    where.categoryId = params.categoryId;
  }

  if (params.region) {
    where.address = { contains: params.region };
  }

  if (params.search) {
    where.OR = [
      { name: { contains: params.search } },
      { address: { contains: params.search } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.hospital.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { reviews: true } },
      },
      orderBy: [{ conscScore: "desc" }, { name: "asc" }],
      skip,
      take: limit,
    }),
    prisma.hospital.count({ where }),
  ]);

  return {
    data: data as unknown as HospitalListItem[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getHospitalById(
  id: string
): Promise<HospitalWithDetails | null> {
  const hospital = await prisma.hospital.findUnique({
    where: { id },
    include: {
      category: true,
      hiraEvaluation: true,
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  return hospital as HospitalWithDetails | null;
}

export async function searchHospitals(
  keyword: string,
  limit: number = DEFAULT_LIMIT
): Promise<HospitalListItem[]> {
  const data = await prisma.hospital.findMany({
    where: {
      OR: [
        { name: { contains: keyword } },
        { address: { contains: keyword } },
      ],
    },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      _count: { select: { reviews: true } },
    },
    orderBy: { conscScore: "desc" },
    take: limit,
  });

  return data as unknown as HospitalListItem[];
}

/**
 * Haversine formula to calculate distance between two coordinates in km
 */
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function getNearbyHospitals(
  params: NearbyParams
): Promise<NearbyHospital[]> {
  const { latitude, longitude, radius, categoryId, limit = 50 } = params;

  // Approximate bounding box for pre-filtering (1 degree latitude ~ 111km)
  const latDelta = radius / 111;
  const lonDelta = radius / (111 * Math.cos((latitude * Math.PI) / 180));

  const where: Record<string, unknown> = {
    latitude: {
      gte: latitude - latDelta,
      lte: latitude + latDelta,
    },
    longitude: {
      gte: longitude - lonDelta,
      lte: longitude + lonDelta,
    },
  };

  if (categoryId) {
    where.categoryId = categoryId;
  }

  const candidates = await prisma.hospital.findMany({
    where,
    include: {
      category: { select: { id: true, name: true, slug: true } },
      _count: { select: { reviews: true } },
    },
  });

  const withDistance = candidates.map((h) => ({
    ...h,
    distance: haversineDistance(latitude, longitude, h.latitude, h.longitude),
  }));

  const nearby = withDistance
    .filter((h) => h.distance <= radius)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);

  return nearby as unknown as NearbyHospital[];
}
