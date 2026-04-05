import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get("branchId");

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(branchId ? { branchId } : {}),
      },
      include: {
        category: true,
      },
      orderBy: {
        category: { name: "asc" },
      },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === "KITCHEN" || user.role === "CASHIER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, price, categoryId, branchId } = body;

    // BRANCH_ADMIN can only create products in their branch
    if (user.role === "BRANCH_ADMIN" && user.branchId && branchId !== user.branchId) {
      return NextResponse.json({ error: "Forbidden - Wrong Branch" }, { status: 403 });
    }

    if (!name || !price || !categoryId || !branchId) {
      return NextResponse.json(
        { error: "name, price, categoryId, and branchId are required" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        price,
        categoryId,
        branchId,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
