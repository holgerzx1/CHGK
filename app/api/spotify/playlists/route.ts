import { NextResponse } from "next/server";
import { getValidSpotifyToken, fetchSpotifyPlaylists } from "@/lib/spotify";

export async function GET() {
  const token = await getValidSpotifyToken();
  if (!token) {
    return NextResponse.json({ error: "Не авторизован в Spotify" }, { status: 401 });
  }

  const data = await fetchSpotifyPlaylists(token);
  return NextResponse.json(data);
}
