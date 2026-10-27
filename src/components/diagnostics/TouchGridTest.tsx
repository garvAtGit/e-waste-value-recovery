"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { CheckCircle2, RotateCcw, AlertTriangle } from "lucide-react";

interface TouchGridTestProps {
  onComplete: (passed: boolean, coveragePercent: number) => void;
  onCancel?: () => void;
}

const ROWS = 12;
const COLS = 8;
const TOTAL_TILES = ROWS * COLS;

export function TouchGridTest({ onComplete, onCancel }: TouchGridTestProps) {
  const [visited, setVisited] = useState<boolean[]>(() =>
    new Array(TOTAL_TILES).fill(false)
  );
  const [isInteracting, setIsInteracting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const visitedCount = visited.filter(Boolean).length;
  const coveragePercent = Math.round((visitedCount / TOTAL_TILES) * 100);

  const markTileFromCoord = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      ) {
        return;
      }

      const relX = clientX - rect.left;
      const relY = clientY - rect.top;

      const col = Math.floor((relX / rect.width) * COLS);
      const row = Math.floor((relY / rect.height) * ROWS);

      if (col >= 0 && col < COLS && row >= 0 && row < ROWS) {
        const index = row * COLS + col;
        setVisited((prev) => {
          if (prev[index]) return prev;
          const next = [...prev];
          next[index] = true;
          return next;
        });
      }
    },
    []
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsInteracting(true);
    markTileFromCoord(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isInteracting && e.buttons === 0) return;
    markTileFromCoord(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    setIsInteracting(false);
  };

  // Auto-finish if 100% reached
  useEffect(() => {
    if (visitedCount >= TOTAL_TILES) {
      if (typeof window !== "undefined" && window.navigator?.vibrate) {
        window.navigator.vibrate(100);
      }
      const t = setTimeout(() => {
        onComplete(true, 100);
      }, 400);
      return () => clearTimeout(t);
    }
  }, [visitedCount, onComplete]);

  return (
    <div className="flex flex-col h-full bg-[#141413] text-[#F7F5EE] p-4 rounded-xl border border-[#3A3834] select-none">
      <div className="flex items-center justify-between pb-3 border-b border-[#2C2A26]">
        <div>
          <h3 className="font-serif font-bold text-lg text-[#F7F5EE]">
            Touchscreen Digitizer Surface Test
          </h3>
          <p className="text-xs text-[#A8A29E]">
            Swipe your finger or stylus across all boxes to detect dead touch zones.
          </p>
        </div>
        <div className="text-right">
          <span
            className={`font-mono font-bold text-base ${
              coveragePercent >= 95
                ? "text-[#4E9B70]"
                : coveragePercent >= 60
                ? "text-[#D97706]"
                : "text-[#E6E4DE]"
            }`}
          >
            {coveragePercent}%
          </span>
          <span className="block text-[10px] text-[#A8A29E]">
            {visitedCount}/{TOTAL_TILES} tiles
          </span>
        </div>
      </div>

      {/* Grid container with touch-action none */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="flex-1 my-3 grid grid-cols-8 grid-rows-12 gap-1.5 p-2 bg-[#1C1A17] rounded-lg border border-[#3A3834] touch-none cursor-crosshair min-h-[360px]"
      >
        {visited.map((isHit, idx) => (
          <div
            key={idx}
            className={`rounded transition-colors duration-100 flex items-center justify-center text-[10px] font-mono ${
              isHit
                ? "bg-[#257A72] text-[#F7F5EE] shadow-sm shadow-[#257A72]/50 scale-[0.98]"
                : "bg-[#282622] hover:bg-[#34322C] text-[#5A5751]"
            }`}
          >
            {isHit ? "✓" : ""}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[#2C2A26] gap-2">
        <button
          type="button"
          onClick={() => setVisited(new Array(TOTAL_TILES).fill(false))}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono bg-[#282622] hover:bg-[#34322C] text-[#E6E4DE]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Grid
        </button>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 rounded-md text-xs text-[#A8A29E] hover:text-[#F7F5EE]"
            >
              Skip
            </button>
          )}

          <button
            type="button"
            onClick={() => onComplete(coveragePercent >= 90, coveragePercent)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold font-mono transition-all ${
              coveragePercent >= 90
                ? "bg-[#257A72] hover:bg-[#1D6059] text-white"
                : "bg-[#D97706] hover:bg-[#B45309] text-white"
            }`}
          >
            {coveragePercent >= 90 ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Done ({coveragePercent}%)
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5" />
                Finish with {coveragePercent}% (Flag Dead Zones)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
