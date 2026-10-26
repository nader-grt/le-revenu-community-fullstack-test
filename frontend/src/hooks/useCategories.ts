
"use client";

import { useEffect, useState } from "react";
import { API_URL, getErrorMessage, type StrapiErrorResponse } from "../lib/api";

export interface DiscussionCategory {
  id: number;
  documentId: string;
  name: string;
  slug: string;
}

interface CategoriesResponse {
  data?: DiscussionCategory[];
  error?: StrapiErrorResponse["error"];
}

export function useCategories() {
  const [categories, setCategories] = useState<DiscussionCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadCategories() {
      try {
        setLoadingCategories(true);
        setCategoriesError("");

        const response = await fetch(
          `${API_URL}/api/categories?fields[0]=name&fields[1]=slug&pagination[pageSize]=100&sort[0]=name:asc`,
          { signal: controller.signal },
        );

        const body = (await response.json()) as CategoriesResponse;

        if (!response.ok) {
          throw new Error(
            getErrorMessage(body, "Impossible de charger les catégories."),
          );
        }

        const data = Array.isArray(body.data)
          ? body.data
          : (body as unknown as { data?: { data?: DiscussionCategory[] } })
              .data?.data;

        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        setCategoriesError(
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors du chargement des catégories.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoadingCategories(false);
        }
      }
    }

    void loadCategories();

    return () => controller.abort();
  }, []);

  return { categories, loadingCategories, categoriesError };
}
