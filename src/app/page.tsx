"use client";

import { useState, useEffect } from "react";
import ProductGrid from "@/components/ProductGrid";
import Cart from "@/components/Cart";
import Sidebar from "@/components/Sidebar";

export default function CashierPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) setUserRole(data.role);
      })
      .catch(console.error);
  }, []);

  const categories = ["Burgers", "Sides", "Drinks", "Desserts", "Pizza"];
  const canAccessAdmin = userRole === "SUPER_ADMIN" || userRole === "BRANCH_ADMIN";

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar 
        categories={categories} 
        selectedCategory={selectedCategory} 
        onSelectCategory={setSelectedCategory} 
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 p-5 shadow-sm z-10 sticky top-0 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-gray-800">
              {selectedCategory === "All" ? "Menu" : selectedCategory}
            </h2>
            <p className="text-xs font-bold text-gray-400 mt-1">Select items to add to order</p>
          </div>
          <div className="flex items-center gap-4">
            <a href="/kitchen" target="_blank" className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors bg-gray-100 hover:bg-blue-50 px-3 py-1.5 rounded-lg active:scale-95">
              Kitchen ↗
            </a>
            {canAccessAdmin && (
              <a href="/admin" className="text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded-xl transition-all shadow-sm shadow-gray-900/20 active:scale-95">
                Admin Dashboard ↗
              </a>
            )}
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto w-full">
          <ProductGrid selectedCategory={selectedCategory} />
        </div>
      </main>

      <aside className="w-full md:w-[400px] h-1/2 md:h-full flex-shrink-0 z-20 border-l border-gray-200/50 bg-white">
        <Cart />
      </aside>
    </div>
  );
}
