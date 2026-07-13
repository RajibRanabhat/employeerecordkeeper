import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { username, password, role } = await req.json();

  if (!username || !password || !role) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Even if username + password are correct, block login if the selected
  // "Login As" role doesn't match the account's actual role.
  if (user.role !== role) {
    return NextResponse.json(
      { error: `This account is not registered as ${role.toLowerCase()}. Please select the correct role.` },
      { status: 403 }
    );
  }

  const token = signToken({ userId: user.id, role: user.role as "ADMIN" | "EMPLOYEE" });

  const res = NextResponse.json({ role: user.role });
  res.cookies.set("session", token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}