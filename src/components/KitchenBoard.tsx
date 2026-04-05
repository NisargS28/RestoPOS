"use client";

import { useEffect, useState, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";

type OrderItem = {
  id: string;
  quantity: number;
  product: { id: string; name: string };
};

type Order = {
  id: string;
  orderNumber: string;
  status: "PENDING" | "PREPARING" | "READY" | "COMPLETED";
  createdAt: string;
  items: OrderItem[];
};

type UserInfo = {
  name: string;
  role: string;
  branchId: string | null;
  branchName: string | null;
};

export default function KitchenBoard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // Fetch user info to determine branch
  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) setUserInfo(data);
      })
      .catch(console.error);
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const branchParam = userInfo?.branchId ? `?branchId=${userInfo.branchId}` : "";
      const res = await fetch(`/api/orders${branchParam}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (e) {
      console.error("Failed to fetch orders for kitchen", e);
    }
  }, [userInfo?.branchId]);

  useEffect(() => {
    if (userInfo === null) return; // wait for user info
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, [fetchOrders, userInfo]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchOrders();
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-100 border-amber-300 text-amber-900";
      case "PREPARING":
        return "bg-blue-100 border-blue-300 text-blue-900";
      case "READY":
        return "bg-green-100 border-green-300 text-green-900";
      default:
        return "bg-gray-100 border-gray-300 text-gray-900";
    }
  };

  const branchLabel = userInfo?.branchName
    ? `Kitchen – ${userInfo.branchName}`
    : "Kitchen Display";

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-3">
        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{branchLabel}</p>
        <div className="text-gray-400 font-bold text-2xl bg-white/50 px-8 py-4 rounded-xl shadow-sm border border-gray-200 border-dashed">
          No Active Orders
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      {orders.map((order) => (
        <div
          key={order.id}
          className={`rounded-2xl border-2 p-5 flex flex-col shadow-sm ${getStatusColor(order.status)}`}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-black tracking-tight">
                {order.orderNumber}
              </h2>
              <p className="text-sm font-semibold opacity-80 mt-1">
                {formatDistanceToNow(new Date(order.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/50 backdrop-blur-sm shadow-sm border border-black/5`}
            >
              {order.status}
            </div>
          </div>

          <div className="flex-1 bg-white/60 rounded-xl p-3 mb-4 border border-black/5 space-y-2">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center font-bold text-gray-800 text-lg"
              >
                <span>
                  <span className="text-blue-700">{item.quantity}x</span>{" "}
                  {item.product.name}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-auto">
            {order.status === "PENDING" && (
              <button
                onClick={() => updateStatus(order.id, "PREPARING")}
                className="col-span-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all active:scale-95 shadow-md shadow-blue-600/20"
              >
                Mark Preparing
              </button>
            )}
            {order.status === "PREPARING" && (
              <button
                onClick={() => updateStatus(order.id, "READY")}
                className="col-span-2 py-3 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl transition-all active:scale-95 shadow-md shadow-green-600/20"
              >
                Mark Ready
              </button>
            )}
            {order.status === "READY" && (
              <button
                onClick={() => updateStatus(order.id, "COMPLETED")}
                className="col-span-2 py-3 bg-gray-800 hover:bg-gray-900 text-white font-black rounded-xl transition-all active:scale-95 shadow-md shadow-gray-800/20"
              >
                Complete Order
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
