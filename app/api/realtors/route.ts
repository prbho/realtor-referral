import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 40;

export async function GET(request: NextRequest) {
  const page = Number(request.nextUrl.searchParams.get("page") ?? "1");
  const pageSize = Math.min(
    Math.max(
      Number(
        request.nextUrl.searchParams.get("pageSize") ??
          String(DEFAULT_PAGE_SIZE)
      ),
      1
    ),
    MAX_PAGE_SIZE
  );

  const offset = (page - 1) * pageSize;
  const state = request.nextUrl.searchParams.get("state")?.trim();

  const where: Prisma.UserWhereInput = {
    role: "REALTOR",
    hideFromDirectory: false,
    ...(state ? { state: { contains: state, mode: "insensitive" } } : {}),
  };

  const realtors = await prisma.user.findMany({
    where,
    // ✅ Add a secondary sort key to ensure deterministic pagination
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    skip: offset,
    take: pageSize,
    select: {
      id: true,
      name: true,
      image: true,
      city: true,
      state: true,
      country: true,
      phone: true,
      email: true,
      createdAt: true,
    },
  });

  const total = await prisma.user.count({ where });

  return NextResponse.json({
    items: realtors,
    page,
    pageSize,
    total,
    hasMore: offset + realtors.length < total,
  });
}
