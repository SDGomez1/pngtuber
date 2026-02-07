"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import test from "./sprite2.webp";
import llama2 from "./sprite1.webp";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

// We create a sub-component to handle the search params logic
function LlamaApp() {
  const searchParams = useSearchParams();
  const isSpriteOnly = searchParams.get("mode") === "sprite";

  const [isSounding, setIsSounding] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (isSpriteOnly) startAudio();
  }, [isSpriteOnly]);
  const THRESHOLD = 10;

  const startAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();

      analyser.fftSize = 256;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      setIsActive(true);

      detectAudio();
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const detectAudio = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const checkVolume = () => {
      analyserRef.current!.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      setIsSounding(average > THRESHOLD);
      animationFrameRef.current = requestAnimationFrame(checkVolume);
    };

    checkVolume();
  };

  const openSmallWindow = () => {
    const url =
      window.location.origin + window.location.pathname + "?mode=sprite";
    window.open(
      url,
      "LlamaSprite",
      "width=500,height=500,menubar=no,toolbar=no,location=no,status=no",
    );
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  // --- UI FOR SPRITE ONLY MODE ---
  if (isSpriteOnly) {
    return (
      <div
        className="w-[500px] aspect-square overflow-hidden"
        style={{
          background: "rgba(0,255,0,1)",
        }}
      >
        {!isActive ? (
          <button
            onClick={startAudio}
            style={{
              width: "100%",
              height: "100%",
              cursor: "pointer",
              background: "rgba(0,0,0,0.1)",
              border: "none",
            }}
          >
            Click to Start Sprite
          </button>
        ) : (
          <>
            <Image
              src={test}
              alt=""
              className={`w-[500px] h-[500px] ${isSounding ? "block" : "hidden"}`}
            />
            <Image
              src={llama2}
              alt=""
              className={`w-[500px] h-[500px] ${!isSounding ? "block" : "hidden"}`}
            />
          </>
        )}
      </div>
    );
  }

  // --- UI FOR MAIN CONTROL PAGE ---
  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Llama Controller</h1>
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        {!isActive && (
          <button onClick={startAudio} style={{ padding: "10px" }}>
            Enable Mic Here
          </button>
        )}
        <button
          onClick={openSmallWindow}
          style={{
            padding: "10px",
            backgroundColor: "#0070f3",
            color: "white",
          }}
        >
          Open Pop-out Sprite (500px)
        </button>
      </div>

      {isActive && (
        <div style={{ border: "1px solid #ccc", padding: "10px" }}>
          <p>Microphone is active in this tab.</p>
          <Image
            src={isSounding ? test : llama2}
            alt=""
            width={100}
            height={100}
          />
        </div>
      )}
    </div>
  );
}

// Next.js requires Suspense when using useSearchParams
export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LlamaApp />
    </Suspense>
  );
}
