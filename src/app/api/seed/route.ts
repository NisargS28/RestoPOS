import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Check if data already exists
    const branchCount = await prisma.branch.count();
    if (branchCount > 0) {
      const productCount = await prisma.product.count();
      return NextResponse.json({
        message: `Database already seeded. ${branchCount} branches, ${productCount} products.`,
      });
    }

    // ── Create Roles ──
    const superAdmin = await prisma.role.create({
      data: { name: "SUPER_ADMIN" },
    });
    await prisma.role.createMany({
      data: [
        { name: "BRANCH_ADMIN" },
        { name: "CASHIER" },
        { name: "KITCHEN" },
      ],
    });

    // ── Create Permissions ──
    const permissions = [
      "manage_menu",
      "manage_orders",
      "view_reports",
      "manage_expenses",
      "manage_users",
      "manage_roles",
      "manage_branches",
      "manage_settings",
    ];
    await prisma.permission.createMany({
      data: permissions.map((action) => ({ action })),
    });

    // Link all permissions to SUPER_ADMIN
    const allPerms = await prisma.permission.findMany();
    await prisma.role.update({
      where: { id: superAdmin.id },
      data: {
        permissions: {
          connect: allPerms.map((p) => ({ id: p.id })),
        },
      },
    });

    // ── Create Branches ──
    const branch1 = await prisma.branch.create({
      data: { name: "Main Branch – Ahmedabad", address: "Ahmedabad, Gujarat" },
    });
    const branch2 = await prisma.branch.create({
      data: { name: "West Branch – Surat", address: "Surat, Gujarat" },
    });
    const branch3 = await prisma.branch.create({
      data: { name: "City Center – Vadodara", address: "Vadodara, Gujarat" },
    });

    // ── Create Categories per Branch ──
    const categoryNames = ["Pizza", "Burger", "Sides", "Beverages", "Wraps", "Sandwich", "South Indian", "North Indian"];
    const allBranches = [branch1, branch2, branch3];

    for (const branch of allBranches) {
      for (let i = 0; i < categoryNames.length; i++) {
        await prisma.category.create({
          data: {
            name: categoryNames[i],
            branchId: branch.id,
            sortOrder: i,
          },
        });
      }
    }

    // ── Create Products for Branch 1 ──
    const b1Categories = await prisma.category.findMany({ where: { branchId: branch1.id } });
    const catMap = new Map(b1Categories.map((c) => [c.name, c.id]));

    const menuItems = [
      { name: "Margherita Pizza", price: 299, cat: "Pizza" },
      { name: "Farmhouse Pizza", price: 349, cat: "Pizza" },
      { name: "Peppy Paneer Pizza", price: 329, cat: "Pizza" },
      { name: "Veggie Burger", price: 149, cat: "Burger" },
      { name: "Classic Chicken Burger", price: 199, cat: "Burger" },
      { name: "French Fries", price: 99, cat: "Sides" },
      { name: "Cheese Garlic Bread", price: 129, cat: "Sides" },
      { name: "Onion Rings", price: 109, cat: "Sides" },
      { name: "Coke (300ml)", price: 60, cat: "Beverages" },
      { name: "Cold Coffee", price: 120, cat: "Beverages" },
      { name: "Mango Lassi", price: 90, cat: "Beverages" },
      { name: "Masala Chai", price: 40, cat: "Beverages" },
      { name: "Chicken Wrap", price: 189, cat: "Wraps" },
      { name: "Paneer Wrap", price: 169, cat: "Wraps" },
      { name: "Paneer Tikka Sandwich", price: 159, cat: "Sandwich" },
      { name: "Club Sandwich", price: 179, cat: "Sandwich" },
      { name: "Masala Dosa", price: 110, cat: "South Indian" },
      { name: "Idli Sambar", price: 80, cat: "South Indian" },
      { name: "Chole Bhature", price: 140, cat: "North Indian" },
      { name: "Butter Paneer Masala", price: 220, cat: "North Indian" },
      { name: "Dal Makhani", price: 180, cat: "North Indian" },
      { name: "Tandoori Roti", price: 30, cat: "North Indian" },
    ];

    for (const item of menuItems) {
      const categoryId = catMap.get(item.cat);
      if (categoryId) {
        await prisma.product.create({
          data: {
            name: item.name,
            price: item.price,
            categoryId,
            branchId: branch1.id,
          },
        });
      }
    }

    // Clone products to branch2 and branch3
    for (const branch of [branch2, branch3]) {
      const branchCats = await prisma.category.findMany({ where: { branchId: branch.id } });
      const bCatMap = new Map(branchCats.map((c) => [c.name, c.id]));

      for (const item of menuItems) {
        const categoryId = bCatMap.get(item.cat);
        if (categoryId) {
          await prisma.product.create({
            data: {
              name: item.name,
              price: item.price + Math.floor(Math.random() * 20 - 10), // slight price variation
              categoryId,
              branchId: branch.id,
            },
          });
        }
      }
    }

    const totalProducts = await prisma.product.count();

    return NextResponse.json({
      message: `Seed successful! Created 3 branches, ${categoryNames.length} categories per branch, ${totalProducts} total products, 4 roles, ${permissions.length} permissions.`,
    });
  } catch (error) {
    console.error("Error seeding:", error);
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 });
  }
}
