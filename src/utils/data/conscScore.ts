const HIRA_GRADE_SCORES: Record<number, number> = {
  1: 100,
  2: 80,
  3: 60,
  4: 40,
  5: 20,
};

const COMMUNITY_WEIGHT = 0.6;
const PUBLIC_DATA_WEIGHT = 0.4;

export function calculateCommunityScore(averageRating: number): number {
  return Math.min(100, Math.max(0, averageRating * 20));
}

export function calculatePublicDataScore(
  overallGrade: number | null | undefined
): number {
  if (overallGrade == null) return 0;
  return HIRA_GRADE_SCORES[overallGrade] ?? 0;
}

export function calculateConscScore(
  averageRating: number | null | undefined,
  overallGrade: number | null | undefined
): number {
  const hasRating = averageRating != null && averageRating > 0;
  const hasGrade = overallGrade != null;

  if (!hasRating && !hasGrade) return 0;

  if (hasRating && hasGrade) {
    const communityScore = calculateCommunityScore(averageRating);
    const publicScore = calculatePublicDataScore(overallGrade);
    return Math.round(
      communityScore * COMMUNITY_WEIGHT + publicScore * PUBLIC_DATA_WEIGHT
    );
  }

  if (hasRating) {
    return Math.round(calculateCommunityScore(averageRating));
  }

  return Math.round(calculatePublicDataScore(overallGrade));
}
