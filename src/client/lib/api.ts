// Tiny fetch helpers for the Oryvia API.

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function parse<T>(res: Response): Promise<T> {
  const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: T; error?: string } | null;
  if (!res.ok || !json?.ok) {
    throw new ApiError(json?.error ?? `Erreur ${res.status}`, res.status);
  }
  return json.data as T;
}

export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(init?.headers ?? {}),
    },
  });
  return parse<T>(res);
}

export function mediaUrl(rel: string | null | undefined): string {
  return rel ? `/api/media/${rel}` : "";
}
