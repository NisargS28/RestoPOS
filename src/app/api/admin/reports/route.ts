import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    if (user.role === "KITCHEN" || user.role === "CASHIER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    // BRANCH_ADMIN is always scoped to their branch
    const branchId = user.role === "BRANCH_ADMIN" ? user.branchId : searchParams.get("branchId");

    const branchFilter = branchId ? { branchId } : {};

    // ── Get all branches ──
    const branches = await prisma.branch.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
    });

    // ── Daily sales for last 30 days ──
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        status: "COMPLETED",
        ...branchFilter,
      },
      select: {
        total: true,
        createdAt: true,
        items: { select: { quantity: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    // Group orders by date
    const dailyMap = new Map<string, { revenue: number; orders: number }>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dailyMap.set(d.toISOString().split("T")[0], { revenue: 0, orders: 0 });
    }
    for (const o of orders) {
      const key = o.createdAt.toISOString().split("T")[0];
      const entry = dailyMap.get(key);
      if (entry) {
        entry.revenue += o.total;
        entry.orders += 1;
      }
    }
    const daily = Array.from(dailyMap.entries()).map(([date, d]) => ({
      date,
      revenue: Math.round(d.revenue),
      cost: Math.round(d.revenue * 0.45), // estimated 45% COGS
      profit: Math.round(d.revenue * 0.55),
      orders: d.orders,
    }));

    const totalRevenue = daily.reduce((s: number, d) => s + d.revenue, 0);
    const totalCost = daily.reduce((s: number, d) => s + d.cost, 0);
    const totalOrders = daily.reduce((s: number, d) => s + d.orders, 0);

    // ── Top products ──
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: { gte: thirtyDaysAgo },
          status: "COMPLETED",
          ...branchFilter,
        },
      },
      include: { product: true },
    });

    const productMap = new Map<string, { name: string; unitsSold: number; revenue: number }>();
    for (const item of orderItems) {
      const existing = productMap.get(item.productId);
      if (existing) {
        existing.unitsSold += item.quantity;
        existing.revenue += item.price * item.quantity;
      } else {
        productMap.set(item.productId, {
          name: item.product.name,
          unitsSold: item.quantity,
          revenue: item.price * item.quantity,
        });
      }
    }
    const topProducts = Array.from(productMap.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // ── Branch stats ──
    const branchStats = await Promise.all(
      branches.map(async (branch: { id: string; name: string }) => {
        const branchOrders = await prisma.order.findMany({
          where: {
            branchId: branch.id,
            createdAt: { gte: thirtyDaysAgo },
            status: "COMPLETED",
          },
          select: { total: true },
        });
        const revenue = branchOrders.reduce((s: number, o: { total: number }) => s + o.total, 0);
        const cost = Math.round(revenue * 0.45);
        const ordCount = branchOrders.length;
        return {
          ...branch,
          revenue: Math.round(revenue),
          cost,
          profit: Math.round(revenue - cost),
          orders: ordCount,
          avgOrderValue: ordCount > 0 ? Math.round(revenue / ordCount) : 0,
          rating: +(3.8 + Math.random() * 1.2).toFixed(1), // placeholder until reviews exist
        };
      })
    );

    // ── Hourly distribution (today) ──
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: today },
        ...branchFilter,
      },
      select: { createdAt: true },
    });
    const hourly = [];
    for (let h = 6; h <= 23; h++) {
      hourly.push({
        hour: `${h.toString().padStart(2, "0")}:00`,
        orders: todayOrders.filter((o: { createdAt: Date }) => o.createdAt.getHours() === h).length,
      });
    }

    // ── Recent orders ──
    const recentOrders = await prisma.order.findMany({
      where: branchFilter,
      include: {
        items: true,
        branch: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 12,
    });

    const activeProducts = await prisma.product.count({ where: { isActive: true, ...branchFilter } });

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalProfit: totalRevenue - totalCost,
        totalOrders,
        avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
        profitMargin: totalRevenue > 0 ? +(((totalRevenue - totalCost) / totalRevenue) * 100).toFixed(1) : 0,
        activeProducts,
        activeBranches: branches.length,
      },
      daily,
      topProducts,
      branches: branchStats,
      hourly,
      recentOrders: recentOrders.map((o) => ({
        id: o.orderNumber,
        branch: o.branch.name,
        items: o.items.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0),
        total: o.total,
        status: o.status,
        time: o.createdAt.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      })),
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
