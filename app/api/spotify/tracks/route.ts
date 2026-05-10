import { NextRequest, NextResponse } from "next/server";
import { getValidSpotifyToken, fetchPlaylistTracks } from "@/lib/spotify";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const playlistId = searchParams.get("playlist_id");

  if (!playlistId) {
    return NextResponse.json({ error: "playlist_id обязателен" }, { status: 400 });
  }

  const token = await getValidSpotifyToken();
  if (!token) {
    return NextResponse.json({ error: "Не авторизован в Spotify" }, { status: 401 });
  }

  const data = await fetchPlaylistTracks(token, playlistId);
  return NextResponse.json(data);
}
