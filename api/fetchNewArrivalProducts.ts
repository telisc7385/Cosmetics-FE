export async function getNewArrivalProducts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/product`, {
      cache: "no-store",
    });
 if (!res.ok) {
      console.error("[Server] ❌ Response not ok:", res.status);
      return [];
    }
 const data = await res.json();
  // Safely access products
    const products = data?.products;
    if (!Array.isArray(products)) {
      console.error("[Server] ❌ 'products' is not an array:", products);
      return [];
    }
    // Filter only new arrival products
    // const newArrivals = products.filter((p) => p.isNewArrival === true);
    const newArrivals = products.slice(0, 4)
    return newArrivals;
  } catch (error) {
    return [];
  }
}
