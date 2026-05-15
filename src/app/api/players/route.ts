import { NextResponse } from "next/server";
import { getLegacyPlayers } from "@/lib/legacy-db-data";

export async function GET() {
  return NextResponse.json(await getLegacyPlayers());
}
