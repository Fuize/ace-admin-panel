import { NextResponse } from "next/server";
import { getLegacyLogs } from "@/lib/legacy-db-data";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") || 200), 500);
  return NextResponse.json(await getLegacyLogs(limit));
}
