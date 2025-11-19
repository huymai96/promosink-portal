"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { getShippingRates, ShippingOption } from "@/lib/easypost";

export default function CheckoutPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    shipToName: "",
    shipToAddress1: "",
    shipToAddress2: "",
    shipToCity: "",
    shipToState: "",
    shipToZip: "",
    shipToCountry: "US",
    poNumber: "",
    inHandsDate: "",
    notes: "",
  });
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingRates, setLoadingRates] = useState(false);

  useEffect(() => {
    // Load shipping rates when address is complete
    if (
      formData.shipToName &&
      formData.shipToAddress1 &&
      formData.shipToCity &&
      formData.shipToState &&
      formData.shipToZip
    ) {
      loadShippingRates();
    }
  }, [
    formData.shipToName,
    formData.shipToAddress1,
    formData.shipToCity,
    formData.shipToState,
    formData.shipToZip,
  ]);

  const loadShippingRates = async () => {
    setLoadingRates(true);
    try {
      const response = await fetch("/api/checkout/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toAddress: {
            name: formData.shipToName,
            street1: formData.shipToAddress1,
            street2: formData.shipToAddress2 || undefined,
            city: formData.shipToCity,
            state: formData.shipToState,
            zip: formData.shipToZip,
            country: formData.shipToCountry,
          },
        }),
      });

      const data = await response.json();
      if (data.options) {
        setShippingOptions(data.options);
      }
    } catch (error) {
      console.error("Failed to load shipping rates:", error);
    } finally {
      setLoadingRates(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/checkout/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          shippingMethodId: selectedShipping,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit order");
      }

      router.push("/orders");
    } catch (error) {
      alert("Failed to submit order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.shipToName}
                  onChange={(e) =>
                    setFormData({ ...formData, shipToName: e.target.value })
                  }
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.shipToAddress1}
                  onChange={(e) =>
                    setFormData({ ...formData, shipToAddress1: e.target.value })
                  }
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Address Line 2
                </label>
                <input
                  type="text"
                  value={formData.shipToAddress2}
                  onChange={(e) =>
                    setFormData({ ...formData, shipToAddress2: e.target.value })
                  }
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.shipToCity}
                    onChange={(e) =>
                      setFormData({ ...formData, shipToCity: e.target.value })
                    }
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.shipToState}
                    onChange={(e) =>
                      setFormData({ ...formData, shipToState: e.target.value })
                    }
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.shipToZip}
                  onChange={(e) =>
                    setFormData({ ...formData, shipToZip: e.target.value })
                  }
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Order Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  PO Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.poNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, poNumber: e.target.value })
                  }
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  In-Hands Date
                </label>
                <input
                  type="date"
                  value={formData.inHandsDate}
                  onChange={(e) =>
                    setFormData({ ...formData, inHandsDate: e.target.value })
                  }
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Shipping Method</h2>
            {loadingRates ? (
              <p className="text-sm text-gray-600">Loading rates...</p>
            ) : shippingOptions.length === 0 ? (
              <p className="text-sm text-gray-600">
                Complete shipping address to see rates
              </p>
            ) : (
              <div className="space-y-2">
                {shippingOptions.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center p-3 border rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="shipping"
                      value={option.id}
                      checked={selectedShipping === option.id}
                      onChange={(e) => setSelectedShipping(e.target.value)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium">
                        {option.carrier} {option.service}
                      </div>
                      {option.estimatedDays && (
                        <div className="text-sm text-gray-600">
                          Est. {option.estimatedDays} days
                        </div>
                      )}
                    </div>
                    <div className="font-semibold">${option.rate.toFixed(2)}</div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !selectedShipping}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Submitting Order..." : "Submit Order"}
          </button>
        </form>
      </div>
    </div>
  );
}

