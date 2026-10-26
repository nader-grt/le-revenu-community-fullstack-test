"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Category, DiscussionSort } from "@/lib/discussion-queries";

interface DiscussionFiltersProps {
  categories: Category[];
}

export default function DiscussionFilters({
  categories,
}: DiscussionFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const category = searchParams.get("category") ?? "";
  const sort = (searchParams.get("sort") ?? "newest") as DiscussionSort;

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    params.delete("page");

    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="mt-6 flex flex-wrap gap-4">
      <label className="flex flex-col gap-1 text-sm text-gray-700">
        Catégorie
        <select
          value={category}
          onChange={(event) => updateFilter("category", event.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((item) => (
            <option key={item.documentId} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm text-gray-700">
        Trier par date
        <select
          value={sort}
          onChange={(event) => updateFilter("sort", event.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2"
        >
          <option value="newest">Plus récentes</option>
          <option value="oldest">Plus anciennes</option>
        </select>
      </label>
    </div>
  );
}