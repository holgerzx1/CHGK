"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface Track {
  id: string;
  name: string;
  uri: string;
  artists: { name: string }[];
}

interface SpotifyPlayerProps {
  tracks: Track[];
}

declare global {
  interface Window {
    Spotify: {
      Player: new (config: {
        name: string;
        getOAuthToken: (cb: (token: string) => void) => void;
        volume: number;
      }) => SpotifyPlayerInstance;
    };
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

interface SpotifyPlayerInstance {
  connect(): Promise<boolean>;
  disconnect(): void;
  addListener(event: string, cb: (data: unknown) => void): void;
  removeListener(event: string): void;
  togglePlay(): Promise<void>;
  pause(): Promise<void>;
}

export function SpotifyPlayer({ tracks }: SpotifyPlayerProps) {
  const playerRef = useRef<SpotifyPlayerInstance | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    function initPlayer(token: string) {
      // Set callback BEFORE loading script
      window.onSpotifyWebPlaybackSDKReady = () => {
        if (!mounted) return;

        const player = new window.Spotify.Player({
          name: "ЧГК Музыкальная Пауза",
          getOAuthToken: (cb) => cb(token),
          volume: 0.8,
        });

        player.addListener("ready", (data: unknown) => {
          const d = data as { device_id: string };
          if (mounted) {
            setDeviceId(d.device_id);
            setReady(true);
          }
        });

        player.addListener("not_ready", () => {
          if (mounted) setReady(false);
        });

        player.addListener("initialization_error", () => {
          if (mounted) setError("Ошибка инициализации. Требуется Spotify Premium.");
        });

        player.addListener("authentication_error", () => {
          if (mounted) setError("Ошибка аутентификации Spotify. Переподключитесь.");
        });

        player.addListener("account_error", () => {
          if (mounted) setError("Требуется аккаунт Spotify Premium.");
        });

        player.addListener("player_state_changed", (state: unknown) => {
          if (!state) return;
          const s = state as { paused: boolean };
          if (mounted) setPlaying(!s.paused);
        });

        player.connect();
        playerRef.current = player;
      };

      // Load SDK if not already loaded
      if (!document.getElementById("spotify-sdk")) {
        const script = document.createElement("script");
        script.id = "spotify-sdk";
        script.src = "https://sdk.scdn.co/spotify-player.js";
        document.body.appendChild(script);
      } else if (window.Spotify) {
        window.onSpotifyWebPlaybackSDKReady();
      }
    }

    // Fetch token then init
    fetch("/api/spotify/token")
      .then((r) => r.json())
      .then((data) => {
        if (data.token && mounted) initPlayer(data.token);
        else if (mounted) setError("Нет токена Spotify");
      })
      .catch(() => {
        if (mounted) setError("Не удалось получить токен Spotify");
      });

    return () => {
      mounted = false;
      playerRef.current?.disconnect();
    };
  }, []);

  async function playRandomTrack() {
    if (!deviceId || tracks.length === 0) return;
    setLoading(true);
    setError("");

    const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
    setCurrentTrack(randomTrack);

    try {
      const tokenRes = await fetch("/api/spotify/token");
      const { token } = await tokenRes.json();

      const res = await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ uris: [randomTrack.uri] }),
        }
      );

      if (!res.ok && res.status !== 204) {
        setError("Не удалось запустить трек. Проверьте Spotify Premium.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function togglePlayback() {
    await playerRef.current?.togglePlay();
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!ready && (
        <p className="text-sm text-muted-foreground animate-pulse">
          Подключение к Spotify...
        </p>
      )}

      {currentTrack && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-xs text-green-600 mb-0.5">Сейчас играет:</p>
          <p className="font-medium text-sm">{currentTrack.name}</p>
          <p className="text-xs text-muted-foreground">
            {currentTrack.artists.map((a) => a.name).join(", ")}
          </p>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={playRandomTrack}
          disabled={!ready || loading || tracks.length === 0}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          🎲 Случайный трек
        </Button>

        {currentTrack && (
          <Button variant="outline" onClick={togglePlayback} disabled={!ready}>
            {playing ? "⏸ Пауза" : "▶ Продолжить"}
          </Button>
        )}
      </div>

      {tracks.length === 0 && ready && (
        <p className="text-sm text-muted-foreground">В плейлисте нет треков</p>
      )}
    </div>
  );
}
