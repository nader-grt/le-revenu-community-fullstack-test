import type { Discussion } from "@/lib/discussions";

const API_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

export interface Category {
  id: number;
  documentId: string;
  name: string;
  slug: string;
}

export type DiscussionSort = "newest" | "oldest";

export interface DiscussionFilters {
  category?: string;
  sort?: DiscussionSort;
  page?: number;
  pageSize?: number;
}

export interface DiscussionPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface DiscussionsResult {
  data: Discussion[];
  pagination: DiscussionPagination;
}

interface CategoriesResponse {
  data: Category[];
}

interface DiscussionsResponse {
  data: Discussion[];
  meta: {
    pagination: DiscussionPagination;
  };
}

export async function getCategories(): Promise<Category[]> {
  const params = new URLSearchParams();

  params.set("fields[0]", "name");
  params.set("fields[1]", "slug");
  params.set("pagination[pageSize]", "100");
  params.set("sort[0]", "name:asc");

  const response = await fetch(
    `${API_URL}/api/categories?${params.toString()}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch categories from Strapi");
  }

  const result: CategoriesResponse = await response.json();

  return result.data;
}

export async function getDiscussions(
  filters: DiscussionFilters = {},
): Promise<DiscussionsResult> {
  const params = new URLSearchParams();

  params.set(
    "sort[0]",
    `publishedAt:${filters.sort === "oldest" ? "asc" : "desc"}`,
  );

  params.set("populate[author]", "true");
  params.set("populate[category]", "true");
  params.set("populate[replies]", "true");

  params.set("pagination[page]", String(filters.page ?? 1));
  params.set("pagination[pageSize]", String(filters.pageSize ?? 5));

  if (filters.category) {
    params.set("filters[category][slug][$eq]", filters.category);
  }

  const response = await fetch(
    `${API_URL}/api/discussions?${params.toString()}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch discussions from Strapi");
  }

  const result: DiscussionsResponse = await response.json();

 



  return {
    data: result.data,
    pagination: result.meta.pagination,
  };
}
