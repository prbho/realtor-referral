// lib/r2.ts
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

export const bucket = process.env.R2_BUCKET!;

const client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const rawPublicUrl = process.env.R2_PUBLIC_URL?.trim();
if (!rawPublicUrl) {
  throw new Error("R2_PUBLIC_URL is not configured");
}
const publicUrl = rawPublicUrl.match(/^https?:\/\//i)
  ? rawPublicUrl.replace(/\/+$/, "")
  : `https://${rawPublicUrl.replace(/\/+$/, "")}`;

export async function uploadFile(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public,max-age=31536000",
    })
  );

  return `${publicUrl}/${bucket}/${key}`;
}

export async function deleteFile(key: string): Promise<void> {
  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
}
