"use client";

import { DecorationWizard } from "./DecorationWizard";
import { useState } from "react";

interface CartItem {
  id: string;
  quantity: number;
  unitPrice: number;
  decorationPrice?: number | null;
  setupCharge?: number | null;
  product: {
    id: string;
    name: string;
    styleCode: string;
    imageUrl?: string | null;
  };
  variant: {
    id: string;
    color: string;
    size: string;
  };
  decorationMethod?: {
    id: string;
    code: string;
    name: string;
  } | null;
  decorationConfig?: any;
}

export function CartItemsList({ items }: { items: CartItem[] }) {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="divide-y">
        {items.map((item) => (
          <div key={item.id} className="p-6">
            <div className="flex gap-6">
              {item.product.imageUrl && (
                <div className="w-24 h-24 relative flex-shrink-0">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {item.product.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {item.product.styleCode} - {item.variant.color} / {item.variant.size}
                </p>
                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                {item.decorationMethod && (
                  <p className="text-sm text-indigo-600 mt-1">
                    Decoration: {item.decorationMethod.name}
                  </p>
                )}
                <div className="mt-2">
                  <p className="text-sm font-medium">
                    ${((item.unitPrice + (item.decorationPrice || 0)) * item.quantity + (item.setupCharge || 0)).toFixed(2)}
                  </p>
                </div>
              </div>
              <div>
                {!item.decorationMethod ? (
                  <button
                    onClick={() => setEditingItemId(item.id)}
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                  >
                    Add Decoration
                  </button>
                ) : (
                  <button
                    onClick={() => setEditingItemId(item.id)}
                    className="text-gray-600 hover:text-gray-700 text-sm"
                  >
                    Edit Decoration
                  </button>
                )}
              </div>
            </div>
            {editingItemId === item.id && (
              <div className="mt-4 border-t pt-4">
                <DecorationWizard
                  cartItemId={item.id}
                  onComplete={() => setEditingItemId(null)}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

