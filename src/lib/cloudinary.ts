import { v2 as cloudinary } from "cloudinary";

// Initialize Cloudinary with server credentials from environment variables
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export { cloudinary };

export interface CloudinaryUploadResult {
  url: string;
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: string;
  bytes: number;
  original_filename: string;
  created_at: string;
}

export async function uploadToCloudinary(
  buffer: Buffer,
  options: {
    folder?: string;
    filename?: string;
    resource_type?: "auto" | "image" | "raw" | "video";
  } = {}
): Promise<CloudinaryUploadResult> {
  const { folder = "xunique-management", filename, resource_type = "auto" } = options;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type,
        use_filename: true,
        unique_filename: true,
        public_id: filename ? filename.replace(/\.[^/.]+$/, "") : undefined,
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Failed to upload to Cloudinary"));
        }
        resolve({
          url: result.url,
          secure_url: result.secure_url,
          public_id: result.public_id,
          format: result.format || "",
          resource_type: result.resource_type,
          bytes: result.bytes,
          original_filename: result.original_filename || "",
          created_at: result.created_at,
        });
      }
    );

    uploadStream.end(buffer);
  });
}
