import { NextResponse } from "next/server";
import { getLegacyMapBlips } from "@/lib/legacy-db-data";

export async function GET() {
  return NextResponse.json(await getLegacyMapBlips());
}
