"use client";

import { useCartStore } from "@/store/useCartStore";
import { Plus, Minus } from "lucide-react";
import { useState } from "react";

export default function Cart() {
  const { items, total, updateQuantity, removeItem, clearCart } = useCartStore();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    setIsPlacingOrder(true);

    try {
      // Get the first active branch as default (will be user-scoped later)
      let branchId: string | undefined;
      try {
        const branchRes = await fetch("/api/branches");
        const branches = await branchRes.json();
        if (Array.isArray(branches) && branches.length > 0) {
          branchId = branches[0].id;
        }
      } catch {
        // Fall through — API will reject if no branchId
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          total,
          branchId,
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      });

      if (res.ok) {
        clearCart();
        // Brief success feedback
        alert("Order placed successfully!");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to place order.");
      }
    } catch (error) {
      console.error(error);
      alert("Error placing order.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-gray-400 bg-gray-50 border-l border-gray-200 shadow-xl w-full">
        <p className="font-medium">Cart is empty</p>
        <p className="text-sm mt-2">Add items from the menu to get started</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200 shadow-xl relative w-full">
      <div className="p-4 border-b border-gray-100 bg-white flex justify-between items-center shadow-sm z-10">
        <h2 className="font-black text-xl text-gray-800">Current Order</h2>
        <button
          onClick={clearCart}
          className="text-sm font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors"
        >
          Clear
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm"
          >
            <div className="flex-1 pr-2">
              <h4 className="font-bold text-gray-800 leading-tight">
                {item.name}
              </h4>
              <p className="text-blue-600 text-sm font-bold mt-0.5">
                ₹{item.price.toFixed(2)}
              </p>
            </div>

            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => {
                  if (item.quantity > 1)
                    updateQuantity(item.id, item.quantity - 1);
                  else removeItem(item.id);
                }}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white hover:text-red-600 rounded-md transition-colors hover:shadow-sm"
              >
                <Minus size={16} strokeWidth={3} />
              </button>
              <span className="w-6 text-center font-black text-gray-800">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white hover:text-blue-600 rounded-md transition-colors hover:shadow-sm"
              >
                <Plus size={16} strokeWidth={3} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] z-10 w-full relative">
        <div className="flex justify-between items-center text-xl font-black text-gray-800 mb-4">
          <span>Total:</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
        <button
          onClick={handlePlaceOrder}
          disabled={isPlacingOrder}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-lg py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center"
        >
          {isPlacingOrder ? "Placing Order..." : "Place Order (CASH)"}
        </button>
      </div>
    </div>
  );
}
