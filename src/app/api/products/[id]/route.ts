import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === "KITCHEN" || user.role === "CASHIER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    // BRANCH_ADMIN can only update products in their branch
    if (user.role === "BRANCH_ADMIN" && user.branchId) {
      const product = await prisma.product.findUnique({ where: { id } });
      if (!product || product.branchId !== user.branchId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.price !== undefined && { price: parseFloat(body.price) }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.categoryId !== undefined && { categoryId: body.categoryId }),
      },
      include: { category: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === "KITCHEN" || user.role === "CASHIER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // BRANCH_ADMIN can only delete products in their branch
    if (user.role === "BRANCH_ADMIN" && user.branchId) {
      const product = await prisma.product.findUnique({ where: { id } });
      if (!product || product.branchId !== user.branchId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Soft delete — set isActive to false
    const deleted = await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json(deleted);
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
