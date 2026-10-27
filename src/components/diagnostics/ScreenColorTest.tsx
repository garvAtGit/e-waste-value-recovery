"use client";

import React, { useState } from "react";
import { Check, X, ChevronRight, Eye } from "lucide-react";

interface ScreenColorTestProps {
  onComplete: (passed: boolean, issueObserved: string | null) => void;
  onCancel?: () => void;
}

const COLORS = [
  { name: "Pure White", hex: "#FFFFFF", note: "Look for ghost keyboard/icons (AMOLED Burn-in)" },
  { name: "Deep Black", hex: "#000000", note: "Look for backlight bleeding & glowing edges" },
  { name: "Pure Red", hex: "#FF0000", note: "Look for black dots or stuck green/blue subpixels" },
  { name: "Pure Green", hex: "#00FF00", note: "Look for dead green pixels or vertical lines" },
  { name: "Pure Blue", hex: "#0000FF", note: "Look for yellow patches or dead blue subpixels" },
];

export function ScreenColorTest({ onComplete, onCancel }: ScreenColorTestProps) {
  const [colorIndex, setColorIndex] = useState(0);

  const currentColor = COLORS[colorIndex];
  const isLast = colorIndex === COLORS.length - 1;

  const nextColor = () => {
    if (isLast) {
      onComplete(true, null);
    } else {
      setColorIndex((i) => i + 1);
    }
  };

  const handleFlagIssue = (issue: string) => {
    onComplete(false, issue);
  };

  return (
    <div className="flex flex-col h-full bg-[#141413] text-[#F7F5EE] p-4 rounded-xl border border-[#3A3834]">
      <div className="pb-3 border-b border-[#2C2A26] flex items-center justify-between">
        <div>
          <h3 className="font-serif font-bold text-lg text-[#F7F5EE] flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#257A72]" />
            Display Uniformity & Dead Pixel Check
          </h3>
          <p className="text-xs text-[#A8A29E]">
            Step {colorIndex + 1} of {COLORS.length}: Inspect screen surface under {currentColor.name}
          </p>
        </div>
        <div className="flex gap-1">
          {COLORS.map((c, i) => (
            <div
              key={c.name}
              className={`w-2.5 h-2.5 rounded-full border border-[#444] ${
                i === colorIndex
                  ? "ring-2 ring-[#257A72] scale-125"
                  : i < colorIndex
                  ? "bg-[#257A72]"
                  : "bg-[#2C2A26]"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Screen Color Box */}
      <div
        className="my-3 flex-1 rounded-lg border border-[#3A3834] flex flex-col items-center justify-center relative p-6 select-none transition-colors duration-200 min-h-[300px]"
        style={{ backgroundColor: currentColor.hex }}
        onClick={nextColor}
      >
        <div className="bg-[#141413]/85 backdrop-blur-md text-[#F7F5EE] px-4 py-2.5 rounded-lg border border-[#3A3834] text-center max-w-sm pointer-events-none shadow-xl">
          <p className="font-mono text-xs uppercase tracking-wider text-[#A8A29E]">
            {currentColor.name}
          </p>
          <p className="font-sans text-xs mt-1 text-[#E6E4DE]">{currentColor.note}</p>
          <span className="inline-block mt-2 text-[10px] text-[#A8A29E] font-mono">
            Tap anywhere to cycle next color →
          </span>
        </div>
      </div>

      <div className="pt-2 border-t border-[#2C2A26] flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleFlagIssue("dead_pixels_detected")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono bg-[#842A20]/25 hover:bg-[#842A20]/40 text-[#FCA5A5] border border-[#842A20]/40"
          >
            <X className="w-3.5 h-3.5" />
            Dead Pixels / Lines
          </button>
          <button
            type="button"
            onClick={() => handleFlagIssue("screen_burn_in_detected")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono bg-[#D97706]/20 hover:bg-[#D97706]/35 text-[#FDE68A] border border-[#D97706]/40"
          >
            <X className="w-3.5 h-3.5" />
            Burn-in / Yellow Spots
          </button>
        </div>

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
            onClick={nextColor}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold font-mono bg-[#257A72] hover:bg-[#1D6059] text-white shadow-sm"
          >
            {isLast ? (
              <>
                <Check className="w-3.5 h-3.5" />
                No Display Faults (Pass)
              </>
            ) : (
              <>
                Next Color
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
