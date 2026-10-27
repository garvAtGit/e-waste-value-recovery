"use client";

import React, { useState, useEffect, useRef } from "react";
import { Camera, CheckCircle2, AlertTriangle, SwitchCamera } from "lucide-react";

interface CameraCheckTestProps {
  onComplete: (passed: boolean, details: string) => void;
  onCancel?: () => void;
}

export function CameraCheckTest({ onComplete, onCancel }: CameraCheckTestProps) {
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let active = true;

    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode } })
      .then(async (stream) => {
        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      })
      .catch((err) => {
        if (active) {
          setErrorMsg(
            err instanceof Error
              ? err.message
              : "Camera access was denied or hardware unavailable."
          );
        }
      });

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode, retryTrigger]);

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  return (
    <div className="flex flex-col h-full bg-[#141413] text-[#F7F5EE] p-4 rounded-xl border border-[#3A3834]">
      <div className="pb-3 border-b border-[#2C2A26] flex items-center justify-between">
        <div>
          <h3 className="font-serif font-bold text-lg text-[#F7F5EE] flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#257A72]" />
            Camera Optics & Focus Verification
          </h3>
          <p className="text-xs text-[#A8A29E]">
            Testing: {facingMode === "environment" ? "Rear Main Lens" : "Front Selfie Lens"}
          </p>
        </div>

        <button
          type="button"
          onClick={toggleCamera}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono bg-[#282622] hover:bg-[#34322C] text-[#E6E4DE] border border-[#3A3834]"
        >
          <SwitchCamera className="w-3.5 h-3.5" />
          Switch Lens
        </button>
      </div>

      <div className="my-3 flex-1 flex flex-col items-center justify-center relative bg-[#1C1A17] rounded-lg border border-[#2C2A26] overflow-hidden min-h-[280px]">
        {errorMsg ? (
          <div className="p-4 text-center max-w-sm">
            <AlertTriangle className="w-8 h-8 text-[#FCA5A5] mx-auto mb-2" />
            <p className="text-xs text-[#FCA5A5] font-mono">{errorMsg}</p>
            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                setRetryTrigger((c) => c + 1);
              }}
              className="mt-3 px-3 py-1.5 rounded text-xs bg-[#282622] text-[#E6E4DE] hover:bg-[#34322C]"
            >
              Retry Camera
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="w-full h-full object-cover max-h-[340px]"
            />
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center border-2 border-dashed border-white/20 m-6 rounded-lg">
              <span className="bg-black/60 backdrop-blur-sm text-[11px] font-mono px-3 py-1 rounded text-[#E6E4DE]">
                Check for blurry lens or scratched glass
              </span>
            </div>
          </>
        )}
      </div>

      <div className="pt-2 border-t border-[#2C2A26] flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onComplete(false, "Camera sensor defect or scratched lens reported")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono bg-[#842A20]/25 hover:bg-[#842A20]/40 text-[#FCA5A5] border border-[#842A20]/40"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Camera Faulty / Blurry
        </button>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 text-xs text-[#A8A29E] hover:text-[#F7F5EE]"
            >
              Skip
            </button>
          )}

          <button
            type="button"
            onClick={() => onComplete(true, "Camera feed crystal clear and focus verified")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold font-mono bg-[#257A72] hover:bg-[#1D6059] text-white shadow-sm"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Lenses Clear (Pass)
          </button>
        </div>
      </div>
    </div>
  );
}
