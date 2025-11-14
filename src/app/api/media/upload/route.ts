import { NextResponse } from "next/server";
import { saveFile } from "@/lib/storage";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ success: false, message: "فایل ارسال نشد." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ success: false, message: "فرمت فایل باید تصویر باشد." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, message: "حجم فایل نباید بیش از ۵ مگابایت باشد." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const saved = await saveFile({
      buffer,
      contentType: file.type,
      originalName: file.name,
    });

    return NextResponse.json({ success: true, url: saved.url, key: saved.key });
  } catch (error) {
    const message = error instanceof Error ? error.message : "آپلود فایل با خطا مواجه شد.";
    logger.error("Media upload failed", { error: message });
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
