import { NextResponse } from "next/server";
import { getValidSpotifyToken } from "@/lib/spotify";

export async function GET() {
  const token = await getValidSpotifyToken();
  if (!token) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }
  return NextResponse.json({ token });
}
