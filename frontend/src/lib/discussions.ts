import { getStrapiURL } from "@/lib/api";


const API_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

export interface Discussion {
  id: number;
  documentId: string;
  title: string;
  content: {
    type: string;
    children: {
      text: string;
      type: string;
    }[];
  }[];
  type: "question" | "discussion";
  createdAt: string;
  publishedAt: string | null;

  category?: {
    id: number;
    name: string;
    slug: string;
  } | null;

  replies?: {
    id: number;
    documentId: string;
    content: {
      type: string;
      children: {
        text: string;
        type: string;
      }[];
    }[];
    createdAt: string;
    publishedAt: string | null;
  }[];

  author?: {
    id: number;
    username: string;
  } | null;
}

export interface DiscussionPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

interface DiscussionsResponse {
  data: Discussion[];
  meta: {
    pagination: DiscussionPagination;
  };
}

interface DiscussionResponse {
  data: Discussion | null;
}

export type DiscussionSort = "newest" | "oldest";

export interface DiscussionFilters {
  category?: string;
  sort?: DiscussionSort;
  page?: number;
  pageSize?: number;
}

export interface DiscussionsResult {
  data: Discussion[];
  pagination: DiscussionPagination;
}

export async function getDiscussions(
  filters: DiscussionFilters = {},
): Promise<DiscussionsResult> {
  const params = new URLSearchParams();

  // Relations
  params.set("populate[author]", "true");
  params.set("populate[category]", "true");
  params.set("populate[replies]", "true");

  // Sorting by publication date
  params.set(
    "sort[0]",
    `publishedAt:${filters.sort === "oldest" ? "asc" : "desc"}`,
  );

  // Server-side pagination
  params.set("pagination[page]", String(filters.page ?? 1));
  params.set("pagination[pageSize]", String(filters.pageSize ?? 10));

  // Filter by category slug
  if (filters.category) {
    params.set("filters[category][slug][$eq]", filters.category);
  }

  const response = await fetch(
    `${getStrapiURL()}/api/discussions?${params.toString()}`,
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

export async function getDiscussion(
  documentId: string,
): Promise<Discussion | null> {
  const params = new URLSearchParams();

  params.set("populate[author]", "true");
  params.set("populate[category]", "true");
  params.set("populate[replies]", "true");

  const response = await fetch(
    `${getStrapiURL()}/api/discussions/${encodeURIComponent(documentId)}?${params.toString()}`,
    { cache: "no-store" },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to fetch discussion from Strapi");
  }

  const result: DiscussionResponse = await response.json();

  return result.data;
}


