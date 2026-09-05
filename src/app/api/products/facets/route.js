// Distinct brands, colours and sizes across the catalog, for the filter
// sidebar. Kept separate from /api/products so the filter list does not change
// as you page through results.
import { connectDb } from "@/lib/db";
import productService from "@/server/services/product.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDb();
    const facets = await productService.getCatalogFacets();
    return Response.json(facets, {
      // Facets change only when the catalog does; a short cache keeps the
      // sidebar from refetching on every navigation.
      headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=600" },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
