"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import AvatarSpriteViewer from "@/components/AvatarSpriteViewer";
import AvatarControlPanel from "@/components/AvatarControlPanel";
import useDebounce from "@/lib/hooks/useDebounce";

const UI_UPDATE_INTERVAL = 100;

const AvatarAppClient = () => {
  const searchParams = useSearchParams();
  const userConfig = useQuery(api.usersConfig.getThreshold);
  const setThresholdMutation = useMutation(api.usersConfig.setThreshold);
  const isSpriteOnly = searchParams.get("mode") === "sprite";

  const [isSounding, setIsSounding] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [currentSliderValue, setCurrentSliderValue] = useState<
    number | undefined
  >(undefined);

  // ── Refs that the rAF loop reads (no stale closures) ──
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const thresholdRef = useRef<number>(0);
  const lastUiUpdate = useRef<number>(0);

  useEffect(() => {
    if (currentSliderValue !== undefined) {
      thresholdRef.current = currentSliderValue;
    }
  }, [currentSliderValue]);

  useEffect(() => {
    if (userConfig !== undefined && currentSliderValue === undefined) {
      const val = userConfig?.threshold ?? 0;
      setCurrentSliderValue(val);
      thresholdRef.current = val;
    }
  }, [userConfig, currentSliderValue]);

  const debouncedThreshold = useDebounce(currentSliderValue, 500);

  useEffect(() => {
    if (debouncedThreshold !== undefined && userConfig !== undefined) {
      if (debouncedThreshold !== userConfig?.threshold) {
        setThresholdMutation({ threshold: debouncedThreshold });
      }
    }
  }, [debouncedThreshold, setThresholdMutation, userConfig]);

  const startDetection = (analyser: AnalyserNode) => {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const tick = () => {
      analyser.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;

      const now = performance.now();
      if (now - lastUiUpdate.current >= UI_UPDATE_INTERVAL) {
        lastUiUpdate.current = now;
        setMicVolume(average);
        setIsSounding(average > thresholdRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);
  };

  const startAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.5;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      streamRef.current = stream;

      setIsActive(true);
      startDetection(analyser);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopAudio = () => {
    // Stop the rAF loop
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Close AudioContext
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // ★ Stop every track so the browser releases the mic
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    analyserRef.current = null;
    setIsActive(false);
    setMicVolume(0);
    setIsSounding(false);
  };

  useEffect(() => {
    return () => stopAudio();
  }, []);

  const openAvatarWindow = () => {
    const url =
      window.location.origin + window.location.pathname + "?mode=sprite";
    window.open(
      url,
      "AvatarStreamWindow",
      "width=500,height=500,menubar=no,toolbar=no,location=no,status=no",
    );
  };

  const handleSliderChange = (value: number[]) => {
    if (value && value.length > 0) {
      setCurrentSliderValue(value[0]);
    }
  };

  if (userConfig === undefined || currentSliderValue === undefined) {
    return <p>Loading avatar configuration...</p>;
  }

  if (isSpriteOnly) {
    return (
      <AvatarSpriteViewer
        isActive={isActive}
        isSounding={isSounding}
        startAudio={startAudio}
      />
    );
  }

  return (
    <AvatarControlPanel
      isActive={isActive}
      startAudio={startAudio}
      stopAudio={stopAudio}
      openAvatarWindow={openAvatarWindow}
      micVolume={micVolume}
      threshold={currentSliderValue}
      isSounding={isSounding}
      onSliderChange={handleSliderChange}
    />
  );
};

export default AvatarAppClient;
