import { prisma } from "@/lib/prisma";

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API = "https://api.spotify.com/v1";

export function getSpotifyAuthUrl(gameId: number): string {
  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    response_type: "code",
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
    scope: [
      "streaming",
      "user-read-playback-state",
      "user-modify-playback-state",
      "playlist-read-private",
      "playlist-read-collaborative",
      "user-read-email",
      "user-read-private",
    ].join(" "),
    state: String(gameId),
  });
  return `https://accounts.spotify.com/authorize?${params}`;
}

export async function exchangeSpotifyCode(code: string): Promise<void> {
  const credentials = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
    }),
  });

  if (!res.ok) throw new Error("Failed to exchange Spotify code");
  const data = await res.json();

  await prisma.spotifySession.deleteMany();
  await prisma.spotifySession.create({
    data: {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    },
  });
}

export async function getValidSpotifyToken(): Promise<string | null> {
  const session = await prisma.spotifySession.findFirst({
    orderBy: { updatedAt: "desc" },
  });
  if (!session) return null;

  // Refresh if within 5 minutes of expiry
  if (session.expiresAt.getTime() - Date.now() > 5 * 60 * 1000) {
    return session.accessToken;
  }

  const credentials = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: session.refreshToken,
    }),
  });

  if (!res.ok) return session.accessToken;
  const data = await res.json();

  await prisma.spotifySession.update({
    where: { id: session.id },
    data: {
      accessToken: data.access_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
      ...(data.refresh_token && { refreshToken: data.refresh_token }),
    },
  });

  return data.access_token;
}

export async function fetchSpotifyPlaylists(token: string) {
  const res = await fetch(`${SPOTIFY_API}/me/playlists?limit=50`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch playlists");
  return res.json();
}

export async function fetchPlaylistTracks(token: string, playlistId: string) {
  const res = await fetch(
    `${SPOTIFY_API}/playlists/${playlistId}/tracks?limit=100&fields=items(track(id,name,artists,uri,duration_ms))`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error("Failed to fetch tracks");
  return res.json();
}
