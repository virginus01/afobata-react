import { NextApiRequest, NextApiResponse } from "next";
import sharp from "sharp";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { src, width, height, format = "webp" } = req.query;

    if (!src) return res.status(400).json({ error: "Missing image source" });

    let imageBuffer: Buffer;

    if ((src as string).startsWith("http")) {
      // 🔹 Fetch image from AWS S3 or any external URL
      const response = await fetch(src as string);
      if (!response.ok) throw new Error("Failed to fetch image");
      imageBuffer = Buffer.from(await response.arrayBuffer());
    } else {
      // 🔹 Fetch from local /public/ directory
      const filePath = path.join(process.cwd(), "public", src as string);
      if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Image not found" });
      imageBuffer = fs.readFileSync(filePath);
    }

    // 🔹 Convert width & height to numbers (or undefined if not provided)
    const resizeOptions: { width?: number; height?: number } = {};
    if (width) resizeOptions.width = Number(width);
    if (height) resizeOptions.height = Number(height);

    // 🔹 Process image with Sharp (resize & convert format)
    const optimizedImage = await sharp(imageBuffer)
      .resize(resizeOptions) // 🔥 Supports both width & height
      .toFormat(format as any)
      .toBuffer();

    // 🔹 Send optimized image
    res.setHeader("Content-Type", `image/${format}`);
    res.send(optimizedImage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Image processing failed" });
  }
}
