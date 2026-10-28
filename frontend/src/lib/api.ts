
//export const API_URL =
  //process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

export interface StrapiErrorResponse {
  error?: {
    message?: string;
    details?: {
      errors?: Array<{
        message?: string;
      }>;
    };
  };
  message?: string;
}

export function getErrorMessage(
  body: StrapiErrorResponse,
  fallback: string,
): string {
  const validationErrors = body.error?.details?.errors
    ?.map((item) => item.message)
    .filter((message): message is string => Boolean(message));

  if (validationErrors?.length) {
    return validationErrors.join("\n");
  }

  return body.error?.message || body.message || fallback;
}



export function getStrapiURL(): string {
  if (typeof window !== "undefined") {
    // Browser: the browser accesses the published host port.
    return process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
  }

  // Next.js Server Components inside Docker.
  return (
    process.env.STRAPI_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_STRAPI_URL ||
    "http://localhost:1337"
  );
}

export const API_URL = getStrapiURL();