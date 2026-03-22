"use client";

import { useState } from "react";

const CATEGORY_OPTIONS = [
  "내과",
  "외과",
  "소아청소년과",
  "산부인과",
  "정형외과",
  "피부과",
  "이비인후과",
  "안과",
  "비뇨의학과",
  "신경외과",
  "정신건강의학과",
  "가정의학과",
  "일반치과",
  "교정과",
  "소아치과",
  "한의원",
  "동물병원",
  "약국",
];

export default function RecommendForm() {
  const [hospitalName, setHospitalName] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hospitalName: hospitalName.trim(),
          address: address.trim(),
          category,
          reason: reason.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to submit");
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      alert("제보에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900">
          제보해 주셔서 감사합니다!
        </h2>
        <p className="text-sm text-gray-500">
          검토 후 양심병원 지도에 등록됩니다.
        </p>
        <button
          type="button"
          onClick={() => {
            setIsSuccess(false);
            setHospitalName("");
            setAddress("");
            setCategory("");
            setReason("");
          }}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
        >
          다른 병원 제보하기
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="rec-name"
          className="block text-sm font-medium text-gray-700"
        >
          병원명 <span className="text-red-500">*</span>
        </label>
        <input
          id="rec-name"
          type="text"
          required
          value={hospitalName}
          onChange={(e) => setHospitalName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          placeholder="예: 서울좋은내과의원"
        />
      </div>

      <div>
        <label
          htmlFor="rec-address"
          className="block text-sm font-medium text-gray-700"
        >
          주소 <span className="text-red-500">*</span>
        </label>
        <input
          id="rec-address"
          type="text"
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          placeholder="예: 서울시 강남구 역삼동 123-4"
        />
      </div>

      <div>
        <label
          htmlFor="rec-category"
          className="block text-sm font-medium text-gray-700"
        >
          진료과목 <span className="text-red-500">*</span>
        </label>
        <select
          id="rec-category"
          required
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
        >
          <option value="">선택해주세요</option>
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="rec-reason"
          className="block text-sm font-medium text-gray-700"
        >
          추천 사유 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="rec-reason"
          required
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          placeholder="이 병원을 양심 병원으로 추천하는 이유를 알려주세요"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
      >
        {isSubmitting ? "제출 중..." : "병원 제보하기"}
      </button>
    </form>
  );
}
