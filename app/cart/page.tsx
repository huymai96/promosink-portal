import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { CartItemsList } from "@/components/CartItemsList";

export default async function CartPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id as string },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
          decorationMethod: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">Your cart is empty.</p>
          </div>
        </div>
      </div>
    );
  }

  const total = cart.items.reduce((sum, item) => {
    const itemTotal = (item.unitPrice + (item.decorationPrice || 0)) * item.quantity;
    return sum + itemTotal + (item.setupCharge || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart</h1>
        <CartItemsList items={cart.items} />
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-2xl font-bold">${total.toFixed(2)}</span>
          </div>
          <div className="mt-4">
            <a
              href="/checkout"
              className="block w-full text-center bg-indigo-600 text-white py-3 px-4 rounded hover:bg-indigo-700"
            >
              Proceed to Checkout
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

