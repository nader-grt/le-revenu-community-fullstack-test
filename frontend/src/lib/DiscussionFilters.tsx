"use client";
import { useState } from "react";
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
  const currentQuery = searchParams.get("q") ?? "";
  const [q, setQ] = useState(currentQuery);

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
            <form
        onSubmit={(event) => {
          event.preventDefault();

          const params = new URLSearchParams(searchParams.toString());
          const value = q.trim();

          if (value) {
            params.set("q", value);
          } else {
            params.delete("q");
          }

          params.delete("page");

          const queryString = params.toString();
          router.push(queryString ? `/?${queryString}` : "/");
        }}
        className="flex w-full flex-wrap items-end gap-2"
      >
        <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm text-gray-700">
          Rechercher une discussion
          <input
            type="search"
            value={q}

            onChange={(event) => {
  const value = event.target.value;
  setQ(value);

  if (value === "") {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.delete("page");

    const queryString = params.toString();
    router.replace(queryString ? `/?${queryString}` : "/");
  }
}}
            placeholder="Rechercher par titre..."
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2"
          />
        </label>

        <button
          type="submit"
          className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          Rechercher
        </button>
      </form>
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