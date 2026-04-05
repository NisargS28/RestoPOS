import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

export interface CurrentUser {
  id: string;
  authId: string;
  email: string;
  name: string;
  role: string;       // "SUPER_ADMIN" | "BRANCH_ADMIN" | "CASHIER" | "KITCHEN"
  branchId: string | null;
  branchName: string | null;
}

/**
 * Get the currently authenticated user with their role and branch info.
 * Returns null if not authenticated or user record not found.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) return null;

    const dbUser = await prisma.user.findUnique({
      where: { authId: authUser.id },
      include: {
        role: true,
        branch: { select: { id: true, name: true } },
      },
    });

    if (!dbUser) return null;

    return {
      id: dbUser.id,
      authId: dbUser.authId,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role.name,
      branchId: dbUser.branchId,
      branchName: dbUser.branch?.name ?? null,
    };
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
}
