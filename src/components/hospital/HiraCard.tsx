interface HiraEvaluation {
  antibioticRate: number | null;
  injectionRate: number | null;
  medicineCount: number | null;
  overallGrade: number | null;
  evaluationYear: number;
}

interface HiraCardProps {
  evaluation: HiraEvaluation | null;
}

function gradeToLabel(grade: number | null) {
  if (grade === null) return { text: "미평가", color: "bg-gray-100 text-gray-500" };
  if (grade === 1) return { text: "1등급", color: "bg-green-100 text-green-700" };
  if (grade === 2) return { text: "2등급", color: "bg-emerald-100 text-emerald-700" };
  if (grade === 3) return { text: "3등급", color: "bg-yellow-100 text-yellow-700" };
  if (grade === 4) return { text: "4등급", color: "bg-orange-100 text-orange-700" };
  return { text: "5등급", color: "bg-red-100 text-red-700" };
}

const metrics = [
  { key: "antibioticRate" as const, label: "항생제 처방률" },
  { key: "injectionRate" as const, label: "주사제 처방률" },
  { key: "medicineCount" as const, label: "약품목수" },
  { key: "overallGrade" as const, label: "종합 등급" },
];

export default function HiraCard({ evaluation }: HiraCardProps) {
  if (!evaluation) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="text-sm font-semibold text-gray-700">
          HIRA 적정성 평가
        </h3>
        <p className="mt-2 text-sm text-gray-500">평가 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">
          HIRA 적정성 평가
        </h3>
        <span className="text-xs text-gray-400">
          {evaluation.evaluationYear}년
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {metrics.map(({ key, label }) => {
          const grade = gradeToLabel(evaluation[key]);
          return (
            <div key={key} className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">{label}</span>
              <span
                className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-semibold ${grade.color}`}
              >
                {grade.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
