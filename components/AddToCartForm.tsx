"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ProductVariant {
  id: string;
  color: string;
  size: string;
  supplierSku: string;
}

interface Product {
  id: string;
  styleCode: string;
  name: string;
  variants: ProductVariant[];
}

export function AddToCartForm({ product }: { product: Product }) {
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  const colors = Array.from(new Set(product.variants.map((v) => v.color)));

  const variantsForColor = selectedColor
    ? product.variants.filter((v) => v.color === selectedColor)
    : [];

  const handleQuantityChange = (variantId: string, quantity: number) => {
    setQuantities((prev) => ({
      ...prev,
      [variantId]: Math.max(0, quantity),
    }));
  };

  const handleAddToCart = async () => {
    if (!selectedColor) {
      alert("Please select a color");
      return;
    }

    const itemsToAdd = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([variantId, quantity]) => ({
        variantId,
        quantity,
      }));

    if (itemsToAdd.length === 0) {
      alert("Please select at least one size");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          items: itemsToAdd,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add to cart");
      }

      router.push("/cart");
    } catch (error) {
      alert("Failed to add items to cart");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t pt-6">
      <h2 className="text-lg font-semibold mb-4">Add to Cart</h2>

      {/* Color Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Color
        </label>
        <div className="flex gap-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => {
                setSelectedColor(color);
                setQuantities({});
              }}
              className={`px-4 py-2 rounded border ${
                selectedColor === color
                  ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      {/* Size Selection */}
      {selectedColor && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Size & Quantity
          </label>
          <div className="space-y-2">
            {variantsForColor.map((variant) => (
              <div key={variant.id} className="flex items-center gap-4">
                <span className="w-16 text-sm">{variant.size}</span>
                <input
                  type="number"
                  min="0"
                  value={quantities[variant.id] || 0}
                  onChange={(e) =>
                    handleQuantityChange(variant.id, parseInt(e.target.value) || 0)
                  }
                  className="w-24 px-3 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleAddToCart}
        disabled={loading || !selectedColor}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Adding..." : "Add to Cart"}
      </button>
    </div>
  );
}

