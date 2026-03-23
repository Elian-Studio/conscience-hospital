import RecommendForm from "@/components/recommend/RecommendForm";

export default function RecommendPage() {
  return (
    <div className="mx-auto max-w-lg p-4 pb-20">
      <h1 className="text-lg font-bold text-gray-900">양심 병원 제보</h1>
      <p className="mt-1 text-sm text-gray-500">
        과잉진료 없는 양심적인 병원을 알고 계신가요? 제보해 주시면 검토 후
        등록됩니다.
      </p>
      <div className="mt-6">
        <RecommendForm />
      </div>
    </div>
  );
}
