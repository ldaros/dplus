"use client";

import { useState, useEffect, useRef } from "react";
import Hls from "hls.js";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Cookies from "js-cookie";

interface DidneyPlusPlayerProps {
  streamUrl: string;
  title: string;
  episode?: string;
  onBack: () => void;
}

export function Player({
  streamUrl,
  title,
  episode,
  onBack,
}: DidneyPlusPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const hls = new Hls();
    hls.loadSource(streamUrl);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video
        .play()
        .catch((error) => console.log("Playback was prevented:", error));
    });

    return () => {
      hls.destroy();
    };
  }, [streamUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      setProgress(video.currentTime);
      setDuration(video.duration);
    };

    video.addEventListener("timeupdate", updateProgress);
    return () => video.removeEventListener("timeupdate", updateProgress);
  }, []);

  useEffect(() => {
    const hideControlsTimer = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    if (showControls) {
      hideControlsTimer();
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = value[0];
    setProgress(value[0]);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = value[0];
    setVolume(value[0]);
    setIsMuted(value[0] === 0);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const skipForward = () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.min(video.currentTime + 10, video.duration);
  };

  const skipBackward = () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(video.currentTime - 10, 0);
  };

  const handleMouseMove = () => {
    setShowControls(true);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-black"
      onMouseMove={handleMouseMove}
    >
      <video ref={videoRef} className="w-full h-full" onClick={togglePlay} />

      {showControls && (
        <>
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
            <Slider
              value={[progress]}
              max={duration}
              step={1}
              onValueChange={handleSeek}
              className="w-full"
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" onClick={togglePlay}>
                  {isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6" />
                  )}
                </Button>
                <Button variant="ghost" size="icon" onClick={skipBackward}>
                  <SkipBack className="h-6 w-6" />
                </Button>
                <Button variant="ghost" size="icon" onClick={skipForward}>
                  <SkipForward className="h-6 w-6" />
                </Button>
                <Button variant="ghost" size="icon" onClick={toggleMute}>
                  {isMuted ? (
                    <VolumeX className="h-6 w-6" />
                  ) : (
                    <Volume2 className="h-6 w-6" />
                  )}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                  className="w-24"
                />
                <span className="text-white text-sm">
                  {formatTime(progress)} / {formatTime(duration)}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-white text-sm">
                  {title} {episode && `- ${episode}`}
                </span>
                <Button variant="ghost" size="icon">
                  <HelpCircle className="h-6 w-6" />
                </Button>
                <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                  {isFullscreen ? (
                    <Minimize className="h-6 w-6" />
                  ) : (
                    <Maximize className="h-6 w-6" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function PlayerPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [data, setData] = useState<any>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(`/api/contents/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setData(data);
      } catch (error) {
        console.error("Failed to fetch content:", error);
      }
    };

    fetchData();
  }, [id]);

  if (data?.message) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-white">
        <p className="text-2xl text-red-500">{data.message}</p>
        <Button className="mt-4" onClick={() => navigate("/browse")}>
          Back
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        <Loader2 className="animate-spin h-10 w-10" />
      </div>
    );
  }

  return (
    <Player
      streamUrl={data?.streamingUrl}
      title={data?.content?.title}
      onBack={() => navigate("/browse")}
    />
  );
}
