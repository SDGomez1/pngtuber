import Image from "next/image";
import avatarSpeakingWebp from "@/app/avatar_speaking.webp";
import avatarIdle from "@/app/avatar_idle.png";
import { Slider } from "@/components/ui/slider";
import MicVolumeViewer from "@/components/MicVolumeViewer";
import { Button } from "@/components/ui/button";

interface AvatarControlPanelProps {
  isActive: boolean;
  startAudio: () => Promise<void>;
  stopAudio: () => void;
  openAvatarWindow: () => void;
  micVolume: number;
  threshold: number;
  isSounding: boolean;
  onSliderChange: (value: number[]) => void;
}

const AvatarControlPanel = ({
  isActive,
  startAudio,
  stopAudio,
  openAvatarWindow,
  micVolume,
  threshold,
  isSounding,
  onSliderChange,
}: AvatarControlPanelProps) => {
  return (
    <div className="p-5 font-sans">
      <h1 className="text-2xl font-bold mb-4">Avatar Controller</h1>
      <div className="flex gap-2 mb-5">
        {!isActive && <Button onClick={startAudio}>Enable Mic Here</Button>}
        {isActive && (
          <Button onClick={stopAudio} variant="destructive">
            Stop Mic
          </Button>
        )}
        <Button onClick={openAvatarWindow} variant="default">
          Open Pop-out Avatar (500px)
        </Button>
      </div>

      <div className="border border-gray-300 p-4 mt-5 rounded-lg bg-gray-50">
        <h2 className="text-xl font-semibold mb-3">Configuration Panel</h2>
        <p className="mb-2">
          <strong>Microphone Status:</strong> {isActive ? "Active" : "Inactive"}
        </p>

        {isActive && (
          <>
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-1">Current Mic Volume</h3>
              <MicVolumeViewer volume={micVolume} threshold={threshold} />
            </div>

            <div className=" mt-5">
              <h3 className="text-lg font-medium mb-1">Threshold Setting</h3>
              <p className="mb-2">Current Threshold: {threshold}</p>
              <Slider
                defaultValue={[threshold]}
                value={[threshold]}
                max={100}
                step={1}
                onValueChange={onSliderChange}
              />
            </div>

            <div className="mt-5">
              <h3 className="text-lg font-medium mb-2">Avatar Preview</h3>
              <Image
                src={avatarIdle}
                alt=""
                width={100}
                height={100}
                className="border border-gray-200"
                unoptimized
                style={{ display: isSounding ? "none" : "block" }}
              />
              <Image
                src={avatarSpeakingWebp}
                alt=""
                width={100}
                height={100}
                className="border border-gray-200"
                unoptimized
                style={{ display: !isSounding ? "none" : "block" }}
              />
              <p className="text-xs text-gray-600 mt-1">
                {isSounding
                  ? "Speaking (above threshold)"
                  : "Silent (below threshold)"}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AvatarControlPanel;
