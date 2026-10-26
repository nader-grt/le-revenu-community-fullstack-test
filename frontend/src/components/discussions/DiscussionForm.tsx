
"use client";

import { useState, type FormEvent } from "react";

export interface DiscussionCategory {
  documentId: string;
  name: string;
}

export interface DiscussionFormValues {
  title: string;
  content: string;
  category: string;
  type: "question" | "discussion";
}

interface DiscussionFormProps {
  categories: DiscussionCategory[];
  loadingCategories: boolean;
  categoriesError: string;
  submitting: boolean;
  error: string;
  authenticated: boolean;
  onSubmit: (values: DiscussionFormValues) => Promise<void>;
}

export default function DiscussionForm({
  categories,
  loadingCategories,
  categoriesError,
  submitting,
  error,
  authenticated,
  onSubmit,
}: DiscussionFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] =
    useState<"question" | "discussion">("discussion");
  const [validationError, setValidationError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError("");

    if (!authenticated) {
      setValidationError("Vous devez vous connecter avant de publier.");
      return;
    }

    if (title.trim().length < 10) {
      setValidationError(
        "Le titre doit contenir au moins 10 caractères.",
      );
      return;
    }

    if (title.trim().length > 200) {
      setValidationError(
        "Le titre ne doit pas dépasser 200 caractères.",
      );
      return;
    }

    if (!content.trim()) {
      setValidationError("Le contenu est obligatoire.");
      return;
    }

    if (!category) {
      setValidationError("Veuillez choisir une catégorie.");
      return;
    }

    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        category,
        type,
      });
    } catch {
      setValidationError(
        "Une erreur inattendue est survenue pendant la publication.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div>
        <label htmlFor="title" className="mb-1 block font-medium">
          Titre
        </label>

        <input
          id="title"
          name="title"
          type="text"
          required
          minLength={10}
          maxLength={200}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Décrivez votre question ou votre sujet"
          aria-invalid={Boolean(validationError && title.trim().length < 10)}
          className="w-full rounded border px-3 py-2"
        />

        <p className="mt-1 text-sm text-gray-500">
          Au moins 10 caractères ({title.trim().length}/200).
        </p>
      </div>

      <div>
        <label htmlFor="content" className="mb-1 block font-medium">
          Contenu
        </label>

        <textarea
          id="content"
          name="content"
          required
          rows={7}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Expliquez votre question ou votre idée..."
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="category" className="mb-1 block font-medium">
          Catégorie
        </label>

        <select
          id="category"
          name="category"
          required
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          disabled={loadingCategories || categories.length === 0}
          className="w-full rounded border px-3 py-2"
        >
          <option value="">
            {loadingCategories
              ? "Chargement des catégories..."
              : categories.length === 0
                ? "Aucune catégorie disponible"
                : "Choisir une catégorie"}
          </option>

          {categories.map((item) => (
            <option key={item.documentId} value={item.documentId}>
              {item.name}
            </option>
          ))}
        </select>

        {categoriesError && (
          <p role="alert" className="mt-1 text-sm text-red-700">
            {categoriesError}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="type" className="mb-1 block font-medium">
          Type
        </label>

        <select
          id="type"
          name="type"
          value={type}
          onChange={(event) =>
            setType(event.target.value as "question" | "discussion")
          }
          className="w-full rounded border px-3 py-2"
        >
          <option value="discussion">Discussion</option>
          <option value="question">Question</option>
        </select>
      </div>

      {(validationError || error) && (
        <p
          role="alert"
          className="whitespace-pre-wrap rounded bg-red-50 p-3 text-sm text-red-800"
        >
          {validationError || error}
        </p>
      )}

      <button
        type="submit"
        disabled={
          !authenticated ||
          submitting ||
          loadingCategories ||
          categories.length === 0
        }
        className="rounded bg-blue-700 px-5 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Publication..." : "Publier la discussion"}
      </button>

      {!authenticated && (
        <p className="text-sm text-gray-600">
          Connectez-vous pour pouvoir publier une discussion.
        </p>
      )}
    </form>
  );
}
