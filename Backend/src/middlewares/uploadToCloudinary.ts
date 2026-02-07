import streamifier from "streamifier";
import cloudinary from "../middlewares/cloudinary";

export const uploadToCloudinary = (
  file: Express.Multer.File,
  folder: string,
): Promise<{ secure_url: string; public_id: string }> => {
  return new Promise((resolve, reject) => {
    if (!file?.buffer) {
      return reject(new Error("File buffer is missing"));
    }

    const isImage = file.mimetype.startsWith("image/");

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: isImage ? "image" : "raw",
      },
      (error, result) => {
        if (error || !result) {
          console.error("Cloudinary error:", error);
          reject(error ?? new Error("Upload failed"));
        } else {
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        }
      },
    );

    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};
