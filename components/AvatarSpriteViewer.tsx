import Image from "next/image";
import avatarSpeakingWebp from "@/app/avatar_speaking.webp";
import avatarIdleWebp from "@/app/avatar_idle.png";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface AvatarSpriteViewerProps {
  isActive: boolean;
  isSounding: boolean;
  startAudio: () => Promise<void>;
}

const AvatarSpriteViewer = ({
  isActive,
  isSounding,
  startAudio,
}: AvatarSpriteViewerProps) => {
  useEffect(() => {
    startAudio();
  }, []);
  return (
    <div
      className={cn("w-[500px] aspect-square overflow-hidden", "bg-green-500")}
    >
      {!isActive ? (
        <Button
          onClick={startAudio}
          className="w-full h-full cursor-pointer bg-black/10 border-none text-white text-lg"
          variant="ghost"
          size="lg"
        >
          Click to Start Avatar
        </Button>
      ) : (
        <>
          <Image
            src={avatarSpeakingWebp}
            alt="Avatar Speaking"
            className={`w-[500px] h-[500px] `}
            style={{ display: !isSounding ? "none" : "block" }}
          />
          <Image
            src={avatarIdleWebp}
            alt="Avatar Idle"
            className={`w-[500px] h-[500px] `}
            style={{ display: isSounding ? "none" : "block" }}
          />
        </>
      )}
    </div>
  );
};

export default AvatarSpriteViewer;
