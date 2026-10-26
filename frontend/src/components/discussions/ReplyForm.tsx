
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

type ReplyFormProps = {
  discussionDocumentId: string;
};

function getErrorMessage(
  body: { error?: { message?: string }; message?: string },
  fallback: string,
): string {
  return body.error?.message ?? body.message ?? fallback;
}

export default function ReplyForm({
  discussionDocumentId,
}: ReplyFormProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!content.trim()) {
      setErrorMessage("Veuillez saisir le contenu de votre réponse.");
      return;
    }

    // The token is read only in the browser, when the form is submitted.
    const token = sessionStorage.getItem("discussionJwt");

    if (!token) {
      setErrorMessage(
        "Vous devez vous connecter avant de publier une réponse.",
      );
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/replies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            content: [
              {
                type: "paragraph",
                children: [{ type: "text", text: content.trim() }],
              },
            ],
            discussion: discussionDocumentId,
          },
        }),
      });

      const body = await response.json();

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            body,
            "Impossible de publier votre réponse.",
          ),
        );
      }

      setContent("");
      setSuccessMessage("Votre réponse a été publiée.");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue pendant la publication.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-5 space-y-4 rounded-xl border border-gray-200 bg-white p-5"
    >
      <label
        htmlFor="reply-content"
        className="block text-sm font-medium text-gray-700"
      >
        Votre réponse
      </label>

      <textarea
        id="reply-content"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={4}
        required
        maxLength={5000}
        placeholder="Écrivez votre réponse..."
        className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
      />

      {errorMessage && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      {successMessage && (
        <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {successMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-blue-700 px-5 py-2.5 font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Publication..." : "Publier la réponse"}
      </button>
    </form>
  );
}
