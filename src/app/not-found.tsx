import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20">
      <h1 className="text-2xl font-bold text-gray-900">404</h1>
      <p className="text-gray-500">페이지를 찾을 수 없습니다.</p>
      <Link
        href="/"
        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
      >
        메인으로 돌아가기
      </Link>
    </div>
  );
}
