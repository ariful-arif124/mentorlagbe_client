
const BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const API_URL = BASE_URL.endsWith("/api")
  ? BASE_URL
  : `${BASE_URL}/api`;

async function apiRequest(path: string) {
  const response = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.message || result?.error || `API Error: ${response.status}`
    );
  }

  return result;
}

export async function getTuitions() {
  return apiRequest("/tuitions");
}

export async function getFeaturedTuitions() {
  return apiRequest("/tuitions/featured");
}

export async function getTuitionById(id: string) {
  return apiRequest(`/tuitions/${encodeURIComponent(id)}`);
}
