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

function validateEmployeeData(body: Record<string, string>): string | null {
  if (!body.username?.trim() || !/^[a-zA-Z0-9]+$/.test(body.username)) {
    return "Username is required and must be alphanumeric.";
  }
  if (!body.password || body.password.length < 6) {
    return "Password is required and must be at least 6 characters.";
  }
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
  return null;
}

export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (session?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const employees = await prisma.employee.findMany({
    include: { user: { select: { username: true } } },
    orderBy: { fullName: "asc" },
  });
  return NextResponse.json(employees);
}

export async function POST(req: NextRequest) {
  const session = getSession(req);
  if (session?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const {
    username, password, fullName, fatherName, phone, dob,
    designation, highestEducation, address, email, salary,
  } = body;

  const validationError = validateEmployeeData(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return NextResponse.json({ error: "Username already taken" }, { status: 409 });
  }

  const hashed = await hashPassword(password);

  const newEmployee = await prisma.employee.create({
    data: {
      fullName,
      fatherName: fatherName || null,
      phone: phone || null,
      dob: dob ? new Date(dob) : null,
      designation: designation || null,
      highestEducation: highestEducation || null,
      address: address || null,
      email: email || null,
      salary: salary ? parseFloat(salary) : null,
      user: {
        create: { username, password: hashed, role: "EMPLOYEE" },
      },
    },
  });

  return NextResponse.json(newEmployee, { status: 201 });
}