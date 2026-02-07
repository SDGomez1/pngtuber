// components/MicVolumeViewer.tsx
import { cn } from "@/lib/utils";

interface MicVolumeViewerProps {
  volume: number;
  threshold: number;
}

const MicVolumeViewer = ({ volume, threshold }: MicVolumeViewerProps) => {
  const normalizedVolume = Math.min(Math.max(volume, 0), 100);
  const normalizedThreshold = Math.min(Math.max(threshold, 0), 100);

  return (
    <div className="w-80 h-8 bg-gray-200 border border-gray-300 rounded overflow-hidden relative mb-2">
      <div
        className={cn(
          "h-full transition-all duration-100 ease-out",
          normalizedVolume > normalizedThreshold
            ? "bg-green-500"
            : "bg-orange-400",
        )}
        style={{ width: `${normalizedVolume}%` }}
      />
      <div
        className={cn("absolute top-0 bottom-0 w-0.5 bg-red-600")}
        style={{ left: `${threshold}%` }}
        title={`Threshold: ${threshold}`}
      />
    </div>
  );
};

export default MicVolumeViewer;
