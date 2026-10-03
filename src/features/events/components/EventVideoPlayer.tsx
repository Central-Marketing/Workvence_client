"use client";

import React from "react";
import { Video, Play } from "lucide-react";

interface EventVideoPlayerProps {
  url: string;
  title?: string;
  isReplay?: boolean;
}

export const getVideoEmbedUrl = (rawUrl: string): string | null => {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  const cleanUrl = rawUrl.trim();

  // 1. YouTube matches: watch?v=ID, youtu.be/ID, embed/ID, shorts/ID, markdown links
  const ytRegex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/i;
  const ytMatch = cleanUrl.match(ytRegex);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}`;
  }

  // 2. Vimeo matches
  const vimeoRegex = /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/\d+\/video\/|video\/|))(\d+)/i;
  const vimeoMatch = cleanUrl.match(vimeoRegex);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  // 3. Direct video file (.mp4, .webm)
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(cleanUrl)) {
    return cleanUrl;
  }

  return null;
};

export const EventVideoPlayer: React.FC<EventVideoPlayerProps> = ({
  url,
  title = "Event Video",
  isReplay = false,
}) => {
  if (!url) return null;

  const embedUrl = getVideoEmbedUrl(url);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">

        <h3 className="font-sf-pro font-semibold text-lg text-[#112131]">
          {isReplay ? "Session Replay & Recording" : "Event Preview Video"}
        </h3>
      </div>

      <div className="relative w-full aspect-[16/9] rounded-[8px] overflow-hidden bg-black shadow-xs border border-gray-200/80">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            src={url}
            controls
            className="w-full h-full object-contain"
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    </div>
  );
};
