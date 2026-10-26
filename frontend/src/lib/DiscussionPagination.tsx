"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface DiscussionPaginationProps {
  page: number;
  pageCount: number;
}

export default function DiscussionPagination({
  page,
  pageCount,
}: DiscussionPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (pageCount <= 1) {
    return null;
  }

  function goToPage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));

    router.push(`/?${params.toString()}`);
  }

  return (
    <nav
      aria-label="Pagination des discussions"
      className="mt-8 flex items-center justify-center gap-4"
    >
      <button
        type="button"
        onClick={() => goToPage(page - 1)}
        disabled={page <= 1}
        className="rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Précédent
      </button>

      <span className="text-sm text-gray-600">
        Page {page} sur {pageCount}
      </span>

      <button
        type="button"
        onClick={() => goToPage(page + 1)}
        disabled={page >= pageCount}
        className="rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Suivant
      </button>
    </nav>
  );
}