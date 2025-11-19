import { getProducts, getCategories, getBrands } from "@/lib/catalog";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface ProductsPageProps {
  searchParams: {
    category?: string;
    brand?: string;
    search?: string;
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.tenantId) {
    redirect("/login");
  }

  const tenantId = session.user.tenantId as string;
  const { products, total } = await getProducts(tenantId, {
    category: searchParams.category,
    brand: searchParams.brand,
    search: searchParams.search,
  });

  const categories = await getCategories(tenantId);
  const brands = await getBrands(tenantId);

  return (
    <div className="flex gap-8">
      {/* Filters Sidebar */}
      <aside className="w-64 flex-shrink-0">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Category</h3>
            <div className="space-y-1">
              <Link
                href="/products"
                className={`block text-sm ${
                  !searchParams.category
                    ? "text-indigo-600 font-medium"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                All Categories
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/products?category=${encodeURIComponent(cat)}`}
                  className={`block text-sm ${
                    searchParams.category === cat
                      ? "text-indigo-600 font-medium"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          {brands.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Brand</h3>
              <div className="space-y-1">
                <Link
                  href="/products"
                  className={`block text-sm ${
                    !searchParams.brand
                      ? "text-indigo-600 font-medium"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  All Brands
                </Link>
                {brands.map((brand) => (
                  <Link
                    key={brand}
                    href={`/products?brand=${encodeURIComponent(brand)}`}
                    className={`block text-sm ${
                      searchParams.brand === brand
                        ? "text-indigo-600 font-medium"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {brand}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Products Grid */}
      <main className="flex-1">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Products {total > 0 && `(${total})`}
          </h1>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.styleCode}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                {product.imageUrl && (
                  <div className="aspect-square relative overflow-hidden rounded-t-lg">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-600">{product.styleCode}</p>
                  {product.brand && (
                    <p className="text-xs text-gray-500 mt-1">{product.brand}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

