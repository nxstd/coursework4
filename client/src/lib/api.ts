export type SocialLink = {
  id: string;
  platform: string;
  url: string;
  label: string | null;
  businessCardId: string;
  createdAt: string;
  updatedAt: string;
};

export type BusinessCard = {
  id: string;
  slug: string;
  fullName: string;
  jobTitle: string | null;
  company: string | null;
  bio: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  location: string | null;
  avatarUrl: string | null;
  socialLinks: SocialLink[];
  createdAt: string;
  updatedAt: string;
};

export type SocialLinkInput = {
  platform: string;
  url: string;
  label?: string | null;
};

export type BusinessCardInput = {
  slug: string;
  fullName: string;
  jobTitle?: string | null;
  company?: string | null;
  bio?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  location?: string | null;
  avatarUrl?: string | null;
  socialLinks?: SocialLinkInput[];
};

type ApiResponse<T> = {
  data: T;
};

type ApiErrorResponse = {
  error?: {
    message?: string;
  };
};

const apiBaseUrl =
  // Server components call the API from inside Docker, while browser code uses the public URL.
  typeof window === "undefined"
    ? process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
    : process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export async function getCards() {
  const response = await apiRequest<ApiResponse<BusinessCard[]>>("/api/cards", {
    next: {
      revalidate: 0
    }
  });

  return response.data;
}

export async function getCard(id: string) {
  const response = await apiRequest<ApiResponse<BusinessCard>>(`/api/cards/${id}`, {
    next: {
      revalidate: 0
    }
  });

  return response.data;
}

export async function getCardBySlug(slug: string) {
  const response = await apiRequest<ApiResponse<BusinessCard>>(`/api/cards/slug/${slug}`, {
    next: {
      revalidate: 0
    }
  });

  return response.data;
}

export async function createCard(input: BusinessCardInput) {
  const response = await apiRequest<ApiResponse<BusinessCard>>("/api/cards", {
    body: JSON.stringify(input),
    method: "POST"
  });

  return response.data;
}

export async function updateCard(id: string, input: BusinessCardInput) {
  const response = await apiRequest<ApiResponse<BusinessCard>>(`/api/cards/${id}`, {
    body: JSON.stringify(input),
    method: "PATCH"
  });

  return response.data;
}

export async function deleteCard(id: string) {
  await apiRequest<void>(`/api/cards/${id}`, {
    method: "DELETE"
  });
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "content-type": "application/json",
      ...init?.headers
    }
  });

  if (!response.ok) {
    throw new ApiRequestError(await readErrorMessage(response), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function readErrorMessage(response: Response) {
  try {
    const body = (await response.json()) as ApiErrorResponse;
    return body.error?.message ?? "Не удалось выполнить запрос";
  } catch {
    // Some failed responses may not contain JSON, so keep a stable UI-facing message.
    return "Не удалось выполнить запрос";
  }
}
