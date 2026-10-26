
import Link from "next/link";
import { notFound } from "next/navigation";

import ReplyForm from "@/components/discussions/ReplyForm";
import { getBlockText } from "@/lib/discussion-content";
import { formatDate } from "@/lib/format-date";
import { getDiscussion } from "@/lib/discussions";

export const instant = false;

export default async function DiscussionDetailPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;

  let discussion;

  try {
    discussion = await getDiscussion(documentId);
  } catch (error) {
    console.error("Failed to load discussion:", error);

    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <Link href="/" className="text-blue-700 hover:underline">
          ← Retour aux discussions
        </Link>

        <p
          role="alert"
          className="mt-8 rounded-lg bg-red-50 p-4 text-red-700"
        >
          Impossible de charger cette discussion. Vérifiez que le serveur
          Strapi est démarré.
        </p>
      </main>
    );
  }

  if (!discussion) {
    notFound();
  }

  const content = getBlockText(discussion.content);
  const replies = discussion.replies ?? [];

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-3xl px-6 py-5">
          <Link href="/" className="text-xl font-bold text-blue-700">
            Le Revenu Community of Nader Chargui
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-6 py-10">
        <Link href="/" className="text-sm text-blue-700 hover:underline">
          ← Retour aux discussions
        </Link>

        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
              {discussion.category?.name ?? "Sans catégorie"}
            </span>

            <span className="text-sm text-gray-500">
              {discussion.type === "question" ? "Question" : "Discussion"}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-bold">{discussion.title}</h1>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
            <span>
              {discussion.author?.username
                ? `Par ${discussion.author.username}`
                : "Auteur non disponible"}
            </span>

            <span>{formatDate(discussion.publishedAt, "Non publiée")}</span>
          </div>

          <div className="mt-6 whitespace-pre-wrap leading-7 text-gray-700">
            {content || "Aucun contenu disponible."}
          </div>
        </div>

        <section className="mt-8">
          <h2 className="text-2xl font-bold">
            Réponses ({replies.length})
          </h2>

          <ReplyForm discussionDocumentId={documentId} />

          {replies.length === 0 ? (
            <p className="mt-4 rounded-lg bg-white p-5 text-gray-600">
              Aucune réponse pour le moment.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {replies.map((reply) => (
                <article
                  key={reply.documentId}
                  className="rounded-xl border border-gray-200 bg-white p-5"
                >
                  <p className="whitespace-pre-wrap leading-7 text-gray-700">
                    {getBlockText(reply.content) ||
                      "Contenu de la réponse indisponible."}
                  </p>

                  <p className="mt-3 text-xs text-gray-500">
                    {formatDate(reply.publishedAt, "Date indisponible")}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </article>
    </main>
  );
}

