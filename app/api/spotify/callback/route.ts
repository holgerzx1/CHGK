import { NextRequest, NextResponse } from "next/server";
import { exchangeSpotifyCode } from "@/lib/spotify";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state") ?? "0";
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL(`/game/${state}?spotify_error=1`, req.url));
  }

  try {
    await exchangeSpotifyCode(code);
    return NextResponse.redirect(new URL(`/game/${state}?spotify_connected=1`, req.url));
  } catch {
    return NextResponse.redirect(new URL(`/game/${state}?spotify_error=1`, req.url));
  }
}
