import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { authId, email, name } = body;

    if (!authId || !email || !name) {
      return NextResponse.json(
        { error: "authId, email, and name are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { authId } });
    if (existing) {
      return NextResponse.json(existing);
    }

    // Check if this is the first user — auto-assign SUPER_ADMIN
    const userCount = await prisma.user.count();

    let role = await prisma.role.findUnique({
      where: { name: userCount === 0 ? "SUPER_ADMIN" : "CASHIER" },
    });

    // If roles don't exist yet (seed not run), create them
    if (!role) {
      role = await prisma.role.create({
        data: { name: userCount === 0 ? "SUPER_ADMIN" : "CASHIER" },
      });
    }

    const user = await prisma.user.create({
      data: {
        authId,
        email,
        name,
        roleId: role.id,
        // First user (super admin) has no branch (access to all)
        branchId: null,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json({ error: "Failed to register user" }, { status: 500 });
  }
}
