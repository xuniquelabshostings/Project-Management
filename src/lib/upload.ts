export interface UploadResult {
  url: string;
  secure_url: string;
  public_id: string;
  format: string;
  bytes: number;
  original_filename: string;
}

export async function uploadFileToCloudinary(
  file: File,
  folder: string = "xunique-management/documents"
): Promise<UploadResult> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  // 1. Direct Cloudinary Client Upload (Unsigned Upload Preset - ideal for static exports like GitHub Pages)
  if (cloudName && uploadPreset) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", folder);

    const isImage = file.type.startsWith("image/");
    const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/${isImage ? "image" : "raw"}/upload`;

    const res = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(data.error?.message || "Direct Cloudinary upload failed.");
    }

    return {
      url: data.secure_url || data.url,
      secure_url: data.secure_url || data.url,
      public_id: data.public_id,
      format: data.format || file.name.split(".").pop() || "",
      bytes: data.bytes || file.size,
      original_filename: data.original_filename || file.name,
    };
  }

  // 2. Next.js Server Upload Route (/api/upload)
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      if (!data.error) {
        return data;
      }
    }
  } catch {
    // Server route unavailable (e.g. running as pure static export)
  }

  // 3. Fallback for static demo / local preview without cloud storage keys configured
  if (file.size > 5 * 1024 * 1024) {
    throw new Error(
      "File size exceeds 5MB limit. Please configure Cloudinary environment variables for larger storage."
    );
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      resolve({
        url: dataUrl,
        secure_url: dataUrl,
        public_id: `local_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9]/g, "_")}`,
        format: file.name.split(".").pop() || "",
        bytes: file.size,
        original_filename: file.name,
      });
    };
    reader.onerror = () => reject(new Error("Failed to read file for local preview."));
    reader.readAsDataURL(file);
  });
}
