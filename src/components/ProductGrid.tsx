"use client";

import { useEffect, useState } from "react";
import { Product, useCartStore } from "@/store/useCartStore";

interface ProductGridProps {
  selectedCategory?: string;
}

export default function ProductGrid({ selectedCategory = "All" }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch products:", err);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500 font-medium">
        Loading menu...
      </div>
    );
  if (products.length === 0)
    return (
      <div className="p-8 text-center text-gray-500">
        No active products found.{" "}
        <a href="/api/seed" className="text-blue-600 underline font-semibold">
          Seed the database
        </a>{" "}
        first.
      </div>
    );

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p: any) => {
          const catName =
            typeof p.category === "object" ? p.category.name : p.category;
          return catName === selectedCategory;
        });

  return (
    <div>
      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {filteredProducts.map((product: any) => (
          <button
            key={product.id}
            onClick={() =>
              addItem({
                id: product.id,
                name: product.name,
                price: product.price,
                category:
                  typeof product.category === "object"
                    ? product.category.name
                    : product.category,
                isActive: product.isActive,
              })
            }
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-blue-500 hover:shadow-md transition-all text-left flex flex-col h-full active:scale-95"
          >
            <div className="text-xs font-semibold text-blue-600 bg-blue-50 w-max px-2 py-1 rounded-md mb-2">
              {typeof product.category === "object"
                ? product.category.name
                : product.category}
            </div>
            <h3 className="font-bold text-gray-800 text-lg flex-grow leading-tight">
              {product.name}
            </h3>
            <p className="text-gray-900 font-black mt-2 text-xl">
              ₹{product.price.toFixed(2)}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
