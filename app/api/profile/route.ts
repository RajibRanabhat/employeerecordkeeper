import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

function getSession(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  return token ? verifyToken(token) : null;
}

function validateProfileUpdate(body: Record<string, string>): string | null {
  if (!body.phone?.trim() || !/^\d{10}$/.test(body.phone)) {
    return "Phone number is required and must be exactly 10 digits.";
  }
  if (!body.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return "A valid email address is required.";
  }
  if (!body.highestEducation?.trim()) {
    return "Highest education is required.";
  }
  if (!body.address?.trim()) {
    return "Address is required.";
  }
  return null;
}

export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const employee = await prisma.employee.findUnique({
    where: { userId: session.userId },
    include: { user: { select: { username: true } } },
  });

  if (!employee) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json(employee);
}

export async function PUT(req: NextRequest) {
  const session = getSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const validationError = validateProfileUpdate(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const updated = await prisma.employee.update({
    where: { userId: session.userId },
    data: {
      phone: body.phone,
      address: body.address,
      email: body.email,
      highestEducation: body.highestEducation,
    },
  });

  return NextResponse.json(updated);
}