import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "내 주변 양심병원 찾기",
  description:
    "커뮤니티가 검증한 양심병원을 내 위치에서 바로 확인하세요. 양심점수와 HIRA 평가를 한눈에.",
  openGraph: {
    title: "내 주변 양심병원 찾기",
    description:
      "커뮤니티가 검증한 양심병원을 내 위치에서 바로 확인하세요.",
    type: "website",
  },
};

export default function NearbyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
