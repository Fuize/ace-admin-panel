import { NextResponse } from "next/server";
import { getLegacyFractions } from "@/lib/legacy-db-data";

export async function GET() {
  return NextResponse.json(await getLegacyFractions());
}
