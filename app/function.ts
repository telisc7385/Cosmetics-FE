// lib/fetchBanners.ts
export async function fetchBanners() {
  try {
    const res = await fetch("https://ecom-testing.up.railway.app/banners", {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const data = await res.json();
    if (!Array.isArray(data)) {
      console.warn("Expected banner data to be an array, got:", data);
      return [];
    }

    return data;
  } catch (error: unknown) {
    console.error("Failed to fetch banners:", (error as Error).message);
    return [];
  }
}


