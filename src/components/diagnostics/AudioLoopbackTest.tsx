"use client";

import React, { useState, useEffect, useRef } from "react";
import { Volume2, Mic, CheckCircle2, AlertTriangle } from "lucide-react";

interface AudioLoopbackTestProps {
  onComplete: (passed: boolean, metrics: string) => void;
  onCancel?: () => void;
}

export function AudioLoopbackTest({ onComplete, onCancel }: AudioLoopbackTestProps) {
  const [isPlayingChime, setIsPlayingChime] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [micLevel, setMicLevel] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Play harmonic frequency test chime using Web Audio API
  const playSpeakerTone = () => {
    try {
      setIsPlayingChime(true);
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();

      // Dual harmonic sine wave (440Hz + 880Hz)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(440, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.4);

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(554.37, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(1108.73, ctx.currentTime + 0.4);

      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.9);
      osc2.stop(ctx.currentTime + 0.9);

      setTimeout(() => {
        setIsPlayingChime(false);
      }, 1000);
    } catch {
      setIsPlayingChime(false);
      setErrorMsg("Web Audio API not supported on this browser.");
    }
  };

  // Start microphone test
  const startMicTest = async () => {
    try {
      setErrorMsg(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((acc, val) => acc + val, 0);
        const avg = sum / dataArray.length;
        setMicLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setRecordedAudioUrl(URL.createObjectURL(blob));
        setIsRecording(false);
      };

      recorder.start();
      setIsRecording(true);

      // Auto stop after 2.5 seconds
      setTimeout(() => {
        if (recorder.state === "recording") {
          recorder.stop();
        }
      }, 2500);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Microphone permission was denied or device not found."
      );
    }
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const handleFinish = (passed: boolean) => {
    const details = passed
      ? "Speaker chime verified + Microphone capture peak registered."
      : "Audio anomaly reported or microphone capture failed.";
    onComplete(passed, details);
  };

  return (
    <div className="flex flex-col h-full bg-[#141413] text-[#F7F5EE] p-4 rounded-xl border border-[#3A3834]">
      <div className="pb-3 border-b border-[#2C2A26]">
        <h3 className="font-serif font-bold text-lg text-[#F7F5EE] flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-[#257A72]" />
          Acoustic & Microphone Hardware Loopback
        </h3>
        <p className="text-xs text-[#A8A29E]">
          Test speaker driver clarity and microphone diaphragm sensitivity.
        </p>
      </div>

      <div className="my-4 space-y-4 flex-1">
        {/* Step A: Speaker Chime */}
        <div className="p-3 bg-[#1C1A17] rounded-lg border border-[#2C2A26] flex items-center justify-between gap-3">
          <div>
            <span className="font-mono text-xs font-bold text-[#E6E4DE] block">
              1. Loudspeaker Driver Test
            </span>
            <span className="text-xs text-[#A8A29E]">
              Plays an 880Hz harmonic test chime to check speaker membrane.
            </span>
          </div>

          <button
            type="button"
            onClick={playSpeakerTone}
            disabled={isPlayingChime}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-mono bg-[#257A72] hover:bg-[#1D6059] text-white disabled:opacity-50 shrink-0"
          >
            <Volume2 className="w-3.5 h-3.5" />
            {isPlayingChime ? "Playing..." : "Play Chime"}
          </button>
        </div>

        {/* Step B: Microphone Voice Waveform */}
        <div className="p-3 bg-[#1C1A17] rounded-lg border border-[#2C2A26] space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono text-xs font-bold text-[#E6E4DE] block">
                2. Microphone Sensitivity Test
              </span>
              <span className="text-xs text-[#A8A29E]">
                Say &quot;Testing 1 2 3&quot; to test frequency pickup.
              </span>
            </div>

            <button
              type="button"
              onClick={startMicTest}
              disabled={isRecording}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-mono text-white shrink-0 ${
                isRecording ? "bg-[#842A20] animate-pulse" : "bg-[#257A72] hover:bg-[#1D6059]"
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              {isRecording ? "Listening..." : "Record Test"}
            </button>
          </div>

          {/* Level visualizer meter */}
          <div className="h-2 w-full bg-[#282622] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#4E9B70] transition-all duration-75"
              style={{ width: `${micLevel}%` }}
            />
          </div>

          {recordedAudioUrl && (
            <div className="pt-2 flex items-center gap-2">
              <span className="text-xs text-[#4E9B70] font-mono">✓ Recorded:</span>
              <audio src={recordedAudioUrl} controls className="h-8 max-w-xs" />
            </div>
          )}
        </div>

        {errorMsg && (
          <p className="text-xs text-[#FCA5A5] bg-[#842A20]/20 p-2 rounded border border-[#842A20]/30 font-mono">
            Notice: {errorMsg}
          </p>
        )}
      </div>

      <div className="pt-2 border-t border-[#2C2A26] flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => handleFinish(false)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono bg-[#842A20]/25 hover:bg-[#842A20]/40 text-[#FCA5A5] border border-[#842A20]/40"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Speaker / Mic Crackles
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
            onClick={() => handleFinish(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold font-mono bg-[#257A72] hover:bg-[#1D6059] text-white shadow-sm"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Audio Working Perfectly
          </button>
        </div>
      </div>
    </div>
  );
}
