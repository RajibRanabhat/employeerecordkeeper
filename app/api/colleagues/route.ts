import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

function getSession(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  return token ? verifyToken(token) : null;
}

export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const colleagues = await prisma.employee.findMany({
    select: {
      id: true,
      fullName: true,
      designation: true,
    },
    orderBy: { fullName: "asc" },
  });

  return NextResponse.json(colleagues);
}