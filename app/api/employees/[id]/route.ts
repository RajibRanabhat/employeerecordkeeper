import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, hashPassword } from "@/lib/auth";

function getSession(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  return token ? verifyToken(token) : null;
}

function calculateAge(dobStr: string): number {
  const dob = new Date(dobStr);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

function validateEmployeeUpdate(body: Record<string, string>): string | null {
  if (!body.fullName?.trim() || !/^[a-zA-Z\s]+$/.test(body.fullName)) {
    return "Full name is required and must contain only letters and spaces.";
  }
  if (!body.fatherName?.trim() || !/^[a-zA-Z\s]+$/.test(body.fatherName)) {
    return "Father's name is required and must contain only letters and spaces.";
  }
  if (!body.phone?.trim() || !/^\d{10}$/.test(body.phone)) {
    return "Phone number is required and must be exactly 10 digits.";
  }
  if (!body.dob) {
    return "Date of birth is required.";
  }
  const dobDate = new Date(body.dob);
  if (dobDate > new Date()) {
    return "Date of birth cannot be in the future.";
  }
  if (calculateAge(body.dob) < 18) {
    return "Employee must be at least 18 years old.";
  }
  if (!body.designation?.trim()) {
    return "Designation is required.";
  }
  if (!body.highestEducation?.trim()) {
    return "Highest education is required.";
  }
  if (!body.address?.trim()) {
    return "Address is required.";
  }
  if (!body.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return "A valid email address is required.";
  }
  const salaryNum = parseFloat(body.salary);
  if (!body.salary || isNaN(salaryNum) || salaryNum < 10000 || salaryNum > 200000) {
    return "Salary must be between Rs. 10,000 and Rs. 200,000.";
  }
  if (body.newPassword && body.newPassword.length < 6) {
    return "New password must be at least 6 characters.";
  }
  return null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = getSession(req);
  if (session?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const employee = await prisma.employee.findUnique({
    where: { id: Number(id) },
    include: { user: { select: { username: true } } },
  });

  if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(employee);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = getSession(req);
  if (session?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const validationError = validateEmployeeUpdate(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const updated = await prisma.employee.update({
    where: { id: Number(id) },
    data: {
      fullName: body.fullName,
      fatherName: body.fatherName || null,
      phone: body.phone || null,
      dob: body.dob ? new Date(body.dob) : null,
      designation: body.designation || null,
      highestEducation: body.highestEducation || null,
      address: body.address || null,
      email: body.email || null,
      salary: body.salary ? parseFloat(body.salary) : null,
    },
  });

  if (body.newPassword && body.newPassword.trim().length > 0) {
    const hashed = await hashPassword(body.newPassword);
    await prisma.user.update({
      where: { id: updated.userId },
      data: { password: hashed },
    });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = getSession(req);
  if (session?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const employee = await prisma.employee.findUnique({ where: { id: Number(id) } });
  if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.employee.delete({ where: { id: Number(id) } });
  await prisma.user.delete({ where: { id: employee.userId } });

  return NextResponse.json({ ok: true });
}