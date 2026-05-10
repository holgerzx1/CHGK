import { NextRequest, NextResponse } from "next/server";
import { getSpotifyAuthUrl } from "@/lib/spotify";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const gameId = searchParams.get("game_id") ?? "0";

  const url = getSpotifyAuthUrl(Number(gameId));
  return NextResponse.redirect(url);
}
