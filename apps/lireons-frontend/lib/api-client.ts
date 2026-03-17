export class ApiError extends Error {
  status: number;
  code?: string;
  requestId?: string;
  details?: unknown;

  constructor(message: string, status: number, extras?: { code?: string; requestId?: string; details?: unknown }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = extras?.code;
    this.requestId = extras?.requestId;
    this.details = extras?.details;
  }
}

async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function apiFetch<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);

  if (!response.ok) {
    const payload = (await safeJson(response)) as
      | {
          message?: string | string[];
          error?: { message?: string; code?: string; details?: unknown };
          requestId?: string;
        }
      | null;

    const message =
      payload?.error?.message ||
      (Array.isArray(payload?.message) ? payload?.message.join(', ') : payload?.message) ||
      `Request failed with status ${response.status}`;

    throw new ApiError(message, response.status, {
      code: payload?.error?.code,
      requestId: payload?.requestId,
      details: payload?.error?.details,
    });
  }

  return (await response.json()) as T;
}
