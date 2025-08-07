import type { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import { NextRequest, NextResponse } from "next/server";

export async function withCors(
  req: NextRequest,
  res: NextApiResponse,
  next: () => Promise<NextApiResponse>
): Promise<any> {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  ); // Allow these methods
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Allow these headers

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  return next();
}
