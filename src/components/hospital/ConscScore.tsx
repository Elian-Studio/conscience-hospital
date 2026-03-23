"use client";

interface ConscScoreProps {
  score: number | null;
  size?: "sm" | "md" | "lg";
}

export default function ConscScore({ score, size = "md" }: ConscScoreProps) {
  const displayScore = score !== null ? Math.round(score) : null;

  const dimensions = {
    sm: { svg: 64, r: 26, stroke: 5, text: "text-sm" },
    md: { svg: 96, r: 38, stroke: 6, text: "text-xl" },
    lg: { svg: 128, r: 52, stroke: 7, text: "text-2xl" },
  }[size];

  const circumference = 2 * Math.PI * dimensions.r;
  const progress = displayScore !== null ? displayScore / 100 : 0;
  const dashOffset = circumference * (1 - progress);

  const getColor = () => {
    if (displayScore === null) return "#9ca3af";
    if (displayScore >= 80) return "#16a34a";
    if (displayScore >= 60) return "#f59e0b";
    return "#dc2626";
  };

  const getLabel = () => {
    if (displayScore === null) return "미평가";
    if (displayScore >= 80) return "양심적";
    if (displayScore >= 60) return "보통";
    return "주의";
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        width={dimensions.svg}
        height={dimensions.svg}
        viewBox={`0 0 ${dimensions.svg} ${dimensions.svg}`}
        className="-rotate-90"
        role="img"
        aria-label={`양심 점수 ${displayScore !== null ? `${displayScore}점` : "미평가"}`}
      >
        <circle
          cx={dimensions.svg / 2}
          cy={dimensions.svg / 2}
          r={dimensions.r}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={dimensions.stroke}
        />
        <circle
          cx={dimensions.svg / 2}
          cy={dimensions.svg / 2}
          r={dimensions.r}
          fill="none"
          stroke={getColor()}
          strokeWidth={dimensions.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-all duration-700"
        />
        <text
          x={dimensions.svg / 2}
          y={dimensions.svg / 2}
          textAnchor="middle"
          dominantBaseline="central"
          className={`${dimensions.text} font-bold rotate-90`}
          style={{
            transformOrigin: "center",
            fill: getColor(),
          }}
        >
          {displayScore !== null ? displayScore : "?"}
        </text>
      </svg>
      <span className="text-xs font-medium text-gray-500">{getLabel()}</span>
    </div>
  );
}
