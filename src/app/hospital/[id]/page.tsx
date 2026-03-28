import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getHospitalById } from "@/services/hospital";
import HospitalDetail from "./HospitalDetail";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const hospital = await getHospitalById(id);

  if (!hospital) {
    return { title: "병원을 찾을 수 없습니다" };
  }

  const description = `${hospital.name} - ${hospital.address}. ${hospital.category.name} 분야의 양심병원 정보, HIRA 평가, 리뷰를 확인하세요.`;

  return {
    title: hospital.name,
    description,
    openGraph: {
      title: `${hospital.name} | 양심병원 지도`,
      description,
      type: "article",
    },
  };
}

export default async function HospitalDetailPage({ params }: Props) {
  const { id } = await params;
  const hospital = await getHospitalById(id);

  if (!hospital) {
    notFound();
  }

  const avgRating =
    hospital.reviews.length > 0
      ? hospital.reviews.reduce((sum, r) => sum + r.rating, 0) /
        hospital.reviews.length
      : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    name: hospital.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: hospital.address,
      addressCountry: "KR",
    },
    ...(hospital.phone && { telephone: hospital.phone }),
    ...(hospital.latitude &&
      hospital.longitude && {
        geo: {
          "@type": "GeoCoordinates",
          latitude: hospital.latitude,
          longitude: hospital.longitude,
        },
      }),
    ...(hospital.openTime && {
      openingHours: `Mo-Fr ${hospital.openTime}-${hospital.closeTime ?? "18:00"}`,
    }),
    ...(avgRating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating.toFixed(1),
        reviewCount: hospital.reviews.length,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };

  const serialized = JSON.parse(
    JSON.stringify({
      ...hospital,
      reviews: hospital.reviews.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      })),
    })
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HospitalDetail hospital={serialized} />
    </>
  );
}
