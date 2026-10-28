
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

//import { API_URL, getErrorMessage, type StrapiErrorResponse } from "../../../lib/api";

import {
  getStrapiURL,
  getErrorMessage,
  type StrapiErrorResponse,
} from "../../../lib/api";
import { useCategories } from "../../../hooks/useCategories";
import { useDiscussionAuth } from "../../../hooks/useDiscussionAuth";
import DiscussionForm, {
  type DiscussionFormValues,
} from "../../../components/discussions/DiscussionForm";

interface CreateDiscussionResponse extends StrapiErrorResponse {
  data?: {
    documentId?: string;
  };
}

export default function NewDiscussionPage() {
  const router = useRouter();

  const {
    categories,
    loadingCategories,
    categoriesError,
  } = useCategories();

  const {
    token,
    username,
    email,
    setEmail,
    password,
    setPassword,
    authError,
    loggingIn,
    handleLogin,
  } = useDiscussionAuth();

  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await handleLogin();
  }

  async function handleSubmit(values: DiscussionFormValues) {
    setFormError("");

    if (!token) {
      setFormError("Vous devez vous connecter avant de publier.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${getStrapiURL()}/api/discussions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            title: values.title.trim(),
            content: [
              {
                type: "paragraph",
                children: [
                  {
                    type: "text",
                    text: values.content.trim(),
                  },
                ],
              },
            ],
            category: {
              connect: [values.category],
            },
            type: values.type,
          },
        }),
      });

      const body = (await response.json()) as CreateDiscussionResponse;

      if (!response.ok) {
        throw new Error(
          getErrorMessage(body, "Impossible de créer la discussion."),
        );
      }

      const documentId = body.data?.documentId;

      if (!documentId) {
        throw new Error(
          "La discussion a été créée, mais son identifiant est absent de la réponse.",
        );
      }

      router.push(`/discussions/${encodeURIComponent(documentId)}`);
      router.refresh();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue pendant la publication.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href="/"
        className="text-sm text-blue-700 hover:underline"
      >
        ← Retour aux discussions
      </Link>

      <h1 className="mt-6 text-3xl font-bold">
        Créer une discussion
      </h1>

      <p className="mt-2 text-gray-600">
        Connectez-vous pour publier une question ou démarrer une discussion.
      </p>

      {!token ? (
        <section className="mt-8 rounded-lg border p-5">
          <h2 className="text-xl font-semibold">Connexion</h2>

          <form onSubmit={onLoginSubmit} className="mt-4 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block font-medium">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded border px-3 py-2"
              />
            </div>

            {authError && (
              <p role="alert" className="text-sm text-red-700">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={loggingIn}
              className="rounded bg-blue-700 px-4 py-2 text-white disabled:opacity-50"
            >
              {loggingIn ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </section>
      ) : (
        <p className="mt-5 rounded bg-green-50 p-3 text-sm text-green-800">
          Connecté en tant que {username}. Le backend déterminera l’auteur.
        </p>
      )}

      <DiscussionForm
        categories={categories}
        loadingCategories={loadingCategories}
        authenticated={Boolean(token)}
        categoriesError={categoriesError}
        submitting={submitting}
        error={formError}
        onSubmit={handleSubmit}
      />
    </main>
  );
}


