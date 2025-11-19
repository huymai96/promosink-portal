import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { ProofApproval } from "@/components/ProofApproval";

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.customerAccountId) {
    redirect("/login");
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      lines: {
        include: {
          product: true,
          variant: true,
        },
      },
      decorations: {
        include: {
          decorationMethod: true,
          artworkAssets: true,
          proofs: {
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!order || order.customerAccountId !== session.user.customerAccountId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">Order not found.</p>
          </div>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    RECEIVED: "bg-blue-100 text-blue-800",
    VALIDATED: "bg-yellow-100 text-yellow-800",
    IN_PRODUCTION: "bg-purple-100 text-purple-800",
    SHIPPED: "bg-green-100 text-green-800",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Order {order.orderNumber}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Items</h2>
              <div className="space-y-4">
                {order.lines.map((line) => (
                  <div key={line.id} className="flex gap-4 border-b pb-4">
                    <div className="flex-1">
                      <h3 className="font-medium">{line.product.name}</h3>
                      <p className="text-sm text-gray-600">
                        {line.product.styleCode} - {line.variant.color} / {line.variant.size}
                      </p>
                      <p className="text-sm text-gray-600">
                        Quantity: {line.quantity} × ${line.unitPrice.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${(line.quantity * line.unitPrice).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Decorations */}
            {order.decorations.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Decorations</h2>
                <div className="space-y-4">
                  {order.decorations.map((decoration) => (
                    <div key={decoration.id} className="border-b pb-4">
                      <h3 className="font-medium">
                        {decoration.decorationMethod.name} - {decoration.location}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Quantity: {decoration.quantity} × ${decoration.unitPrice.toFixed(2)}
                      </p>
                      {decoration.setupCharge && decoration.setupCharge > 0 && (
                        <p className="text-sm text-gray-600">
                          Setup: ${decoration.setupCharge.toFixed(2)}
                        </p>
                      )}
                      <ProofApproval decoration={decoration} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      statusColors[order.status] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {order.status.replace("_", " ")}
                  </span>
                </div>
                {order.poNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">PO Number</span>
                    <span className="font-medium">{order.poNumber}</span>
                  </div>
                )}
                {order.trackingNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tracking</span>
                    <span className="font-medium">{order.trackingNumber}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
              <div className="text-sm text-gray-600">
                <p>{order.shipToName}</p>
                <p>{order.shipToAddress1}</p>
                {order.shipToAddress2 && <p>{order.shipToAddress2}</p>}
                <p>
                  {order.shipToCity}, {order.shipToState} {order.shipToZip}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

