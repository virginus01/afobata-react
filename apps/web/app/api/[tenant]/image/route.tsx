import sharp from "sharp";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const src = searchParams.get("src");
    const width = searchParams.get("width");
    const height = searchParams.get("height");
    const format = searchParams.get("format") || "webp";

    if (!src) {
      return NextResponse.json(
        { error: "Missing image source" },
        { status: 400 }
      );
    }

    let imageBuffer: Buffer;

    if (src.startsWith("http")) {
      const response = await fetch(src);
      if (!response.ok) throw new Error("Failed to fetch image");
      imageBuffer = Buffer.from(await response.arrayBuffer());
    } else {
      const filePath = path.join(process.cwd(), "public", src);
      if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: "Image not found" }, { status: 404 });
      }
      imageBuffer = fs.readFileSync(filePath);
    }

    const resizeOptions: { width?: number; height?: number } = {};
    if (width) resizeOptions.width = Number(width);
    if (height) resizeOptions.height = Number(height);

    const optimizedImage = await sharp(imageBuffer)
      .resize(resizeOptions)
      .toFormat(format as any)
      .toBuffer();

    return new NextResponse(optimizedImage, {
      headers: {
        "Content-Type": `image/${format}`,
        "Cache-Control": "public, max-age=31536000", // optional: cache
      },
    });
  } catch (error) {
    console.error("Image processing failed:", error);
    return NextResponse.json(
      { error: "Image processing failed" },
      { status: 500 }
    );
  }
}
