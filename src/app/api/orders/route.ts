import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get("branchId");
    const includeCompleted = searchParams.get("includeCompleted") === "true";

    const orders = await prisma.order.findMany({
      where: {
        ...(branchId ? { branchId } : {}),
        ...(!includeCompleted
          ? { status: { in: ["PENDING", "PREPARING", "READY"] } }
          : {}),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        branch: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, total, branchId } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    if (!branchId) {
      return NextResponse.json({ error: "branchId is required" }, { status: 400 });
    }

    // Generate order number: ORD-XXXX
    const orderNumber = `ORD-${Date.now().toString().slice(-4)}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        total,
        branchId,
        items: {
          create: items.map((item: { productId: string; quantity: number; price: number }) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
