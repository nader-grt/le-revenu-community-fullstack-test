import Link from "next/link";

import { Category, getCategories, getDiscussions } from "@/lib/discussion-queries";
import type { Discussion } from "@/lib/discussions";
import DiscussionPagination from "@/lib/DiscussionPagination";
import { formatDate } from "@/lib/format-date";

import DiscussionFilters from "../lib/DiscussionFilters";

interface HomeProps {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    page?: string;
    q?: string;
  }>;
}

export const instant = false;

export default async function Home({ searchParams }: HomeProps) {
  const query = await searchParams;

  const validSort = query.sort === "oldest" ? "oldest" : "newest";
  const parsedPage = Number(query.page ?? "1");
  const page = Number.isInteger(parsedPage) && parsedPage > 0
    ? parsedPage
    : 1;




    let discussions: Discussion[] = [];
  let categories: Category[] = [];
  let pageCount = 1;
  let error = false;

  try {
   // const result = await getDiscussions();
    const [categoriesResult, discussionsResult] = await Promise.all([
      getCategories(),
      getDiscussions({
        category: query.category,
        sort: validSort,
        page,
        pageSize: 10,
        q: query.q,
      }),
    ]);

    categories = categoriesResult;
    discussions = discussionsResult.data;
    pageCount = discussionsResult.pagination.pageCount;
  } catch (err) {
    console.error("Failed to load discussions:", err);
    error = true;
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xl font-bold text-blue-700">
          Nader Chargui Test in   Le Revenu Community
          </Link>

          <Link
            href="/discussions/new"
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
          >
            Nouvelle discussion
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-3xl font-bold">
          Discussions de la communauté
        </h1>

        <p className="mt-2 text-gray-600">
          Posez vos questions et échangez avec la communauté.
        </p>


<DiscussionFilters categories={categories} />
        {error ? (
          <p className="mt-8 rounded-lg bg-red-50 p-4 text-red-700">
            Impossible de charger les discussions. Vérifiez que le serveur
            Strapi est démarré.
          </p>
        ) : discussions.length === 0 ? (
          <p className="mt-8 rounded-lg bg-white p-6 text-gray-600">
            {query.q?.trim()
              ? `Aucune discussion trouvée pour « ${query.q.trim()} ».`
              : "Aucune discussion publiée pour le moment."}
          </p>
        ) : (
          <div className="mt-8 space-y-4">
            {discussions.map((discussion) => (
              <article
                key={discussion.documentId}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                    {discussion.category?.name ?? "Sans catégorie"}
                  </span>

                  <span className="text-sm text-gray-500">
                    {discussion.type === "question"
                      ? "Question"
                      : "Discussion"}
                  </span>
                </div>

                <h2 className="mt-3 text-xl font-semibold">
                  <Link
                    href={`/discussions/${discussion.documentId}`}
                    className="hover:text-blue-700 hover:underline"
                  >
                    {discussion.title}
                  </Link>
                </h2>

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
                  <span>
                    {discussion.author?.username
                      ? `Par ${discussion.author.username}`
                      : "Auteur non disponible"}
                  </span>

                  <span>
                    {/* {discussion.publishedAt
                      ? new Date(discussion.publishedAt).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            timeZone: "UTC",
                          },
                        )
                      : "Non publiée"} */}

                      {formatDate(discussion.publishedAt, "Non publiée")}
                  </span>

                  <span>
                    {discussion.replies?.length ?? 0} réponse(s)
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}

            {!error && discussions.length > 0 && (
          <DiscussionPagination
            page={page}
            pageCount={pageCount}
          />
        )}
      </section>
    </main>
  );
}