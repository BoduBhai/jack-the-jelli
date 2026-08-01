import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_FOLDER,
  signUploadParams,
} from "@/lib/cloudinary";

/**
 * The only route handler in the product flow (D2): the browser uploads images
 * straight to Cloudinary (D1) and needs a signature to do it. The API secret
 * never leaves the server.
 *
 * The response echoes back every signed param — the browser must send exactly
 * these or Cloudinary rejects the upload with an opaque signature error (§5).
 */
export async function POST() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY) {
    return NextResponse.json(
      { error: "Cloudinary is not configured" },
      { status: 500 },
    );
  }

  try {
    const timestamp = Math.round(Date.now() / 1000);
    const folder = CLOUDINARY_UPLOAD_FOLDER;
    const signature = signUploadParams({ folder, timestamp });

    return NextResponse.json({
      signature,
      timestamp,
      folder,
      apiKey: CLOUDINARY_API_KEY,
      cloudName: CLOUDINARY_CLOUD_NAME,
    });
  } catch (error) {
    console.error("Cloudinary signing failed", error);
    return NextResponse.json(
      { error: "Could not sign the upload" },
      { status: 500 },
    );
  }
}
