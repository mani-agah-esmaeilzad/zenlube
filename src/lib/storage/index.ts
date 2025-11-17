import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import crypto from "crypto";

import { config } from "../config";
import { logger } from "../logger";

type SaveFileArgs = {
  buffer: Buffer;
  contentType: string;
  originalName: string;
};

type StorageResult = {
  key: string;
  url: string;
};

const uploadDir = path.join(process.cwd(), "public", "uploads");

function encodeRfc3986(input: string) {
  return encodeURIComponent(input).replace(/%2F/g, "/");
}

function hashSha256(content: Buffer | string) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

function getSignatureKey(key: string, dateStamp: string, region: string, service: string) {
  const kDate = crypto.createHmac("sha256", `AWS4${key}`).update(dateStamp).digest();
  const kRegion = crypto.createHmac("sha256", kDate).update(region).digest();
  const kService = crypto.createHmac("sha256", kRegion).update(service).digest();
  return crypto.createHmac("sha256", kService).update("aws4_request").digest();
}

async function saveToLocal({ buffer, originalName }: SaveFileArgs): Promise<StorageResult> {
  await fs.mkdir(uploadDir, { recursive: true });
  const extension = path.extname(originalName) || ".bin";
  const key = `${randomUUID()}${extension}`;
  const filePath = path.join(uploadDir, key);
  await fs.writeFile(filePath, buffer);
  return { key, url: `/uploads/${key}` };
}

async function saveToS3({ buffer, contentType, originalName }: SaveFileArgs): Promise<StorageResult> {
  const bucket = config.STORAGE_BUCKET as string;
  const region = config.AWS_REGION as string;
  const accessKeyId = config.AWS_ACCESS_KEY_ID as string;
  const secretAccessKey = config.AWS_SECRET_ACCESS_KEY as string;

  const extension = path.extname(originalName) || ".bin";
  const key = `${randomUUID()}${extension}`;
  const host = `${bucket}.s3.${region}.amazonaws.com`;
  const url = `https://${host}/${key}`;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
  const payloadHash = hashSha256(buffer);
  const canonicalHeaders = `host:${host}\n` + `x-amz-content-sha256:${payloadHash}\n` + `x-amz-date:${amzDate}\n`;
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = [
    "PUT",
    `/${encodeRfc3986(key)}`,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    hashSha256(canonicalRequest),
  ].join("\n");
  const signingKey = getSignatureKey(secretAccessKey, dateStamp, region, "s3");
  const signature = crypto.createHmac("sha256", signingKey).update(stringToSign).digest("hex");
  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
      "x-amz-date": amzDate,
      "x-amz-content-sha256": payloadHash,
      Authorization: authorization,
    },
    body: new Uint8Array(buffer),
  });

  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(`S3 upload failed with status ${response.status}: ${bodyText}`);
  }

  return { key, url };
}

export async function saveFile(args: SaveFileArgs): Promise<StorageResult> {
  if (config.STORAGE_DRIVER === "s3") {
    try {
      return await saveToS3(args);
    } catch (error) {
      logger.error("Failed to persist file to S3", { error: error instanceof Error ? error.message : error });
      throw new Error("ذخیره فایل روی فضای ابری با خطا مواجه شد.");
    }
  }

  return saveToLocal(args);
}
