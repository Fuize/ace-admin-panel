import { NextResponse } from "next/server";
import { getLegacyBusinesses } from "@/lib/legacy-db-data";

export async function GET() {
  return NextResponse.json(await getLegacyBusinesses());
}
