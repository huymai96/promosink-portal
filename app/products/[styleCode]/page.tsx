import { getProductByStyleCode } from "@/lib/catalog";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import { AddToCartForm } from "@/components/AddToCartForm";

export default async function ProductDetailPage({
  params,
}: {
  params: { styleCode: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.tenantId) {
    redirect("/login");
  }

  const tenantId = session.user.tenantId as string;
  const product = await getProductByStyleCode(tenantId, params.styleCode);

  if (!product) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">Product not found.</p>
      </div>
    );
  }

  // Group variants by color
  const variantsByColor = product.variants.reduce((acc, variant) => {
    if (!acc[variant.color]) {
      acc[variant.color] = [];
    }
    acc[variant.color].push(variant);
    return acc;
  }, {} as Record<string, typeof product.variants>);

  // Get unique sizes
  const sizes = Array.from(
    new Set(product.variants.map((v) => v.size))
  ).sort();

  // Get warehouses
  const warehouses = Array.from(
    new Set(
      product.variants.flatMap((v) =>
        v.inventorySnapshots.map((s) => s.warehouse)
      )
    )
  );

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
        {/* Product Image */}
        <div>
          {product.imageUrl && (
            <div className="aspect-square relative overflow-hidden rounded-lg">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <p className="text-gray-600 mb-4">Style: {product.styleCode}</p>
          {product.brand && (
            <p className="text-sm text-gray-500 mb-4">Brand: {product.brand}</p>
          )}
          {product.description && (
            <p className="text-gray-700 mb-6">{product.description}</p>
          )}

          {/* Inventory Matrix */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Inventory by Size</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">Warehouse</th>
                    {sizes.map((size) => (
                      <th key={size} className="text-center py-2 px-3">
                        {size}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {warehouses.map((warehouse) => (
                    <tr key={warehouse.id} className="border-b">
                      <td className="py-2 px-3 font-medium">{warehouse.name}</td>
                      {sizes.map((size) => {
                        const variant = product.variants.find(
                          (v) => v.size === size
                        );
                        const snapshot = variant?.inventorySnapshots.find(
                          (s) => s.warehouseId === warehouse.id
                        );
                        const onHand = snapshot?.onHand || 0;
                        return (
                          <td key={size} className="text-center py-2 px-3">
                            {onHand > 0 ? (
                              <span className="text-green-600 font-medium">
                                {onHand}
                              </span>
                            ) : (
                              <span className="text-gray-400">0</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add to Cart */}
          <AddToCartForm product={product} />
        </div>
      </div>
    </div>
  );
}

