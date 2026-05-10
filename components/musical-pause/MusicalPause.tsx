"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SpotifyPlayer } from "./SpotifyPlayer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MusicalPauseProps {
  gameId: number;
  onContinue: () => void;
}

interface Playlist {
  id: string;
  name: string;
  tracks: { total: number };
  images: { url: string }[];
}

interface Track {
  id: string;
  name: string;
  uri: string;
  artists: { name: string }[];
}

export function MusicalPause({ gameId, onContinue }: MusicalPauseProps) {
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);

  useEffect(() => {
    fetch("/api/spotify/token")
      .then((r) => r.json())
      .then((data) => {
        setSpotifyConnected(!!data.token);
        setCheckingAuth(false);
      })
      .catch(() => setCheckingAuth(false));
  }, []);

  useEffect(() => {
    if (!spotifyConnected) return;
    fetch("/api/spotify/playlists")
      .then((r) => r.json())
      .then((data) => setPlaylists(data.items ?? []));
  }, [spotifyConnected]);

  useEffect(() => {
    if (!selectedPlaylist) return;
    setLoadingTracks(true);
    fetch(`/api/spotify/tracks?playlist_id=${selectedPlaylist}`)
      .then((r) => r.json())
      .then((data) => {
        const validTracks = (data.items ?? [])
          .map((item: { track: Track | null }) => item.track)
          .filter(Boolean) as Track[];
        setTracks(validTracks);
      })
      .finally(() => setLoadingTracks(false));
  }, [selectedPlaylist]);

  if (checkingAuth) {
    return (
      <div className="text-center py-8 text-muted-foreground animate-pulse">
        Проверяем Spotify...
      </div>
    );
  }

  return (
    <div className="border rounded-xl bg-card p-6 space-y-6 shadow-md">
      <div className="text-center space-y-2">
        <div className="text-4xl">🎵</div>
        <h2 className="text-2xl font-bold">Музыкальная пауза!</h2>
        <p className="text-muted-foreground text-sm">
          Время расслабиться перед четвёртым раундом
        </p>
      </div>

      {!spotifyConnected ? (
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Подключите Spotify для воспроизведения музыки
          </p>
          <a
            href={`/api/spotify/auth?game_id=${gameId}`}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            🎵 Войти через Spotify
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Выберите плейлист</label>
            <Select value={selectedPlaylist} onValueChange={setSelectedPlaylist}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите плейлист..." />
              </SelectTrigger>
              <SelectContent>
                {playlists.map((pl) => (
                  <SelectItem key={pl.id} value={pl.id}>
                    {pl.name} ({pl.tracks.total} треков)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPlaylist && (
            <>
              {loadingTracks ? (
                <p className="text-sm text-muted-foreground animate-pulse">
                  Загружаем треки...
                </p>
              ) : (
                <SpotifyPlayer tracks={tracks} />
              )}
            </>
          )}
        </div>
      )}

      <div className="pt-2 border-t">
        <Button onClick={onContinue} className="w-full" size="lg">
          Продолжить → Раунд 4
        </Button>
      </div>
    </div>
  );
}
