import { v2 as cloudinary } from "cloudinary";

// Cloud name and API key are NEXT_PUBLIC_ on purpose — the browser uploads
// straight to Cloudinary (D1). Only the secret stays server-side, and this
// module must never be imported from a client component.
export const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
export const CLOUDINARY_API_KEY =
  process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ?? "";
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET ?? "";

/** Every product image lands here, so cleanup and quotas stay scoped. */
export const CLOUDINARY_UPLOAD_FOLDER = "jack-the-jelli/products";

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

export type UploadSignaturePayload = Record<string, string | number>;

/**
 * Sign upload params for a direct browser upload. The browser MUST send exactly
 * the params signed here (plus file + api_key) or Cloudinary rejects it with an
 * opaque signature error.
 */
export function signUploadParams(params: UploadSignaturePayload): string {
  if (!CLOUDINARY_API_SECRET) {
    throw new Error("CLOUDINARY_API_SECRET is not configured");
  }
  return cloudinary.utils.api_sign_request(params, CLOUDINARY_API_SECRET);
}

/** Remove an asset by public id — used when an image is detached from a product. */
export async function deleteImage(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}

export default cloudinary;
