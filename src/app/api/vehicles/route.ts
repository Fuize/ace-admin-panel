import { NextResponse } from "next/server";
import { getLegacyVehicles } from "@/lib/legacy-db-data";

export async function GET() {
  return NextResponse.json(await getLegacyVehicles());
}
