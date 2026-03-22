"use client";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

interface CategoryFilterProps {
  categories: CategoryItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export default function CategoryFilter({
  categories,
  selectedId,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div
      className="scrollbar-hide flex gap-2 overflow-x-auto px-4 py-2"
      role="listbox"
      aria-label="진료과목 필터"
    >
      <button
        type="button"
        role="option"
        aria-selected={selectedId === null}
        onClick={() => onSelect(null)}
        className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
          selectedId === null
            ? "bg-green-600 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        전체
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          role="option"
          aria-selected={selectedId === cat.id}
          onClick={() => onSelect(cat.id)}
          className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            selectedId === cat.id
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
