export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000";

export async function parseJsonResponse<T>(
  response: Response,
): Promise<T> {
  const responseText =
    await response.text();

  try {
    return JSON.parse(
      responseText,
    ) as T;
  } catch {
    throw new Error(
      responseText ||
        "The server returned an invalid response.",
    );
  }
}