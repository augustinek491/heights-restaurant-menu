// Serves the read-only prototype images at assets/menu/*.jpg through the Next
// app without copying or modifying anything under assets/. In production,
// seeded Firestore `menuImages.storageUrl` values point at Cloud Storage
// instead — this route only matters for local dev / fallback rendering
// before the seed script has been run against a live project.

import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const MENU_DIR = path.join(process.cwd(), "assets", "menu");

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  // Guard against path traversal; only allow plain "name.jpg" style segments.
  if (!/^[a-zA-Z0-9_-]+\.jpg$/.test(filename)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const filePath = path.join(MENU_DIR, filename);
  if (!existsSync(filePath)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const file = await readFile(filePath);
  return new NextResponse(file, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
