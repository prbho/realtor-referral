import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const BUCKET = "avatars";
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const STORAGE_PATH_PREFIX = `/storage/v1/object/public/${BUCKET}/`;

function hasExpectedImageSignature(buffer: Buffer, type: string): boolean {
  if (type === "image/jpeg") {
    return (
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    );
  }

  if (type === "image/png") {
    return (
      buffer.length >= 8 &&
      buffer.subarray(0, 8).equals(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
      )
    );
  }

  return (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  );
}

function getAvatarStoragePath(imageUrl: string | null): string | null {
  if (!imageUrl) return null;

  try {
    const url = new URL(imageUrl);
    if (
      !url.hostname.endsWith(".supabase.co") ||
      !url.pathname.startsWith(STORAGE_PATH_PREFIX)
    ) {
      return null;
    }

    return decodeURIComponent(url.pathname.slice(STORAGE_PATH_PREFIX.length));
  } catch {
    return null;
  }
}

async function removeAvatarFromStorage(path: string | null) {
  if (!path) return;

  const { error } = await supabaseAdmin.storage.from(BUCKET).remove([path]);
  if (error) {
    console.error("Supabase avatar cleanup failed", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const contentLength = Number(request.headers.get("content-length"));
    if (Number.isFinite(contentLength) && contentLength > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Image must be under 5MB" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Please upload a JPEG, PNG, or WebP image" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Image must be under 5MB" },
        { status: 400 }
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const extension =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "jpg";
    const path = `${session.user.id}-${Date.now()}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    if (!hasExpectedImageSignature(buffer, file.type)) {
      return NextResponse.json(
        { error: "The uploaded file does not match its declared image type" },
        { status: 400 }
      );
    }

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, buffer, { cacheControl: "3600", contentType: file.type });

    if (uploadError) {
      console.error("Supabase avatar upload failed", uploadError);
      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(path);
    const imageUrl = publicUrlData.publicUrl;

    try {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { image: imageUrl },
      });
    } catch (error) {
      await removeAvatarFromStorage(path);
      throw error;
    }

    await removeAvatarFromStorage(getAvatarStoragePath(currentUser.image));

    return NextResponse.json({ success: true, image: imageUrl });
  } catch (error) {
    console.error("Avatar upload failed", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: null },
    });
    await removeAvatarFromStorage(getAvatarStoragePath(currentUser.image));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Avatar removal failed", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
