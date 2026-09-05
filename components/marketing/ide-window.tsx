"use client";

import * as React from "react";
import {
  FileText,
  RotateCcw,
  Pencil,
} from "lucide-react";

const INITIAL_FILES: Record<string, string> = {
  "card.tsx": `// DevTrace Live Journal UI (Production Ready)

import React from "react";

export default function DevTraceScore() {
  const metrics = {
    tasks: "#9/12 done",
    streak: "5 days active",
    shipScore: 74,
    blockers: "0 active",
    status: "ready-to-deploy",
  };

  return (
    <div className="ship-card">
      <h2>DevTrace Highlights</h2>
      {Object.entries(metrics).map(([key, val]) => (
        <div key={key} style={{ display: "flex", alignItems: "center" }}>
          <ShipScoreBadge value={val} />
        </div>
      ))}
    </div>
  );
}`,
  "ship-score.tsx": `// DevTrace Ship Score Engine

export function calculateShipScore(tasksDone: number, totalTasks: number) {
  const taskWeight = (tasksDone / totalTasks) * 60;
  const streakBonus = 20; // 5-day active streak
  const blockerPenalty = 0; // 0 active blockers

  const finalScore = Math.min(100, Math.round(taskWeight + streakBonus - blockerPenalty));
  return {
    score: finalScore,
    status: finalScore >= 70 ? "Ready to ship" : "Needs attention",
  };
}`,
  "button.tsx": `// DevTrace Custom Button Component

export function DevButton({ label }: { label: string }) {
  return (
    <button className="rounded bg-black px-6 py-2.5 text-xs font-semibold text-white transition hover:bg-neutral-800">
      {label}
    </button>
  );
}`,
};

function renderSyntaxTokens(line: string) {
  if (!line) return <span>&nbsp;</span>;

  // Full comment line
  const trimmed = line.trimStart();
  if (trimmed.startsWith("//")) {
    const indentCount = line.length - trimmed.length;
    return (
      <>
        {indentCount > 0 && <span>{" ".repeat(indentCount)}</span>}
        <span className="text-neutral-400 italic">{trimmed}</span>
      </>
    );
  }

  // Regex token split
  const tokenRegex =
    /(\/\/[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b(?:import|export|default|function|const|return|from|let|var|if|else|typeof|new)\b|\b\d+\b|<\/?[A-Za-z0-9_]+|[{}()[\],;]|\S+|\s+)/g;

  const tokens = line.match(tokenRegex) || [line];

  return (
    <>
      {tokens.map((token, i) => {
        if (token.startsWith("//")) {
          return (
            <span key={i} className="text-neutral-400 italic">
              {token}
            </span>
          );
        }
        if (
          (token.startsWith('"') && token.endsWith('"')) ||
          (token.startsWith("'") && token.endsWith("'")) ||
          (token.startsWith("`") && token.endsWith("`"))
        ) {
          return (
            <span key={i} className="text-amber-700 font-normal">
              {token}
            </span>
          );
        }
        if (
          /^(import|export|default|function|const|return|from|let|var|if|else|typeof|new)$/.test(
            token
          )
        ) {
          return (
            <span key={i} className="text-blue-600 font-semibold">
              {token}
            </span>
          );
        }
        if (/^\d+$/.test(token)) {
          return (
            <span key={i} className="text-emerald-600 font-semibold">
              {token}
            </span>
          );
        }
        if (/^<\/?[A-Za-z0-9_]+$/.test(token)) {
          return (
            <span key={i} className="text-blue-600 font-semibold">
              {token}
            </span>
          );
        }
        if (/^[{}()[\],;]$/.test(token)) {
          return (
            <span key={i} className="text-neutral-600">
              {token}
            </span>
          );
        }
        return <span key={i}>{token}</span>;
      })}
    </>
  );
}

export function IdeWindow() {
  const [activeFile, setActiveFile] = React.useState<string>("card.tsx");
  const [files, setFiles] = React.useState(INITIAL_FILES);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const preRef = React.useRef<HTMLPreElement>(null);
  const lineNumbersRef = React.useRef<HTMLDivElement>(null);

  const code = files[activeFile] || "";
  const lines = code.split("\n");

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setFiles((prev) => ({
      ...prev,
      [activeFile]: val,
    }));
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const { scrollTop, scrollLeft } = e.currentTarget;
    if (preRef.current) {
      preRef.current.scrollTop = scrollTop;
      preRef.current.scrollLeft = scrollLeft;
    }
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = scrollTop;
    }
  };

  const handleReset = () => {
    setFiles((prev) => ({
      ...prev,
      [activeFile]: INITIAL_FILES[activeFile],
    }));
  };

  return (
    <div className="mx-auto w-full max-w-[94%] sm:max-w-[90%] lg:max-w-[86%] 2xl:max-w-[1300px] overflow-hidden rounded-t-xl rounded-b-none border border-neutral-300 border-b-0 bg-white text-left shadow-2xl">
      {/* Top Window Header matching reference image */}
      <div className="flex items-center justify-between border-b border-neutral-200 bg-[#FAFAFA] px-4 py-2 select-none">
        <div className="flex items-center gap-2">
          <div className="size-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
          <div className="size-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
          <div className="size-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
        </div>

        {/* Status / Edit hint */}
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-neutral-500 bg-neutral-100 px-2.5 py-0.5 rounded border border-neutral-200">
            <Pencil className="size-3 text-neutral-600" />
            <span className="hidden sm:inline">editable console &bull; click inside to type</span>
            <span className="sm:hidden">editable</span>
          </span>

          <button
            onClick={handleReset}
            title="Reset to default code"
            className="flex items-center gap-1 text-[11px] font-mono text-neutral-500 hover:text-black transition-colors"
          >
            <RotateCcw className="size-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="grid grid-cols-1 md:grid-cols-[210px_1fr] bg-white">
        {/* Left Column: File Manager */}
        <div className="hidden md:flex flex-col border-r border-neutral-200 bg-white p-3.5 font-mono text-xs text-neutral-600 select-none">
          <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-1">
            File Manager
          </div>
          <div className="font-bold text-neutral-900 text-xs sm:text-[13px] mb-3">
            DEVTRACE-APP
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-neutral-400 hover:text-neutral-700 cursor-pointer text-xs">
              <span className="text-[10px]">&rsaquo;</span>
              <span>.github</span>
            </div>
            <div className="flex items-center gap-1.5 text-neutral-400 hover:text-neutral-700 cursor-pointer text-xs">
              <span className="text-[10px]">&rsaquo;</span>
              <span>.drizzle</span>
            </div>
            <div className="flex items-center gap-1.5 text-neutral-400 hover:text-neutral-700 cursor-pointer text-xs">
              <span className="text-[10px]">&rsaquo;</span>
              <span>node_modules</span>
            </div>
            <div className="flex items-center gap-1.5 text-neutral-800 font-semibold cursor-pointer text-xs">
              <span className="text-[10px]">&#8964;</span>
              <span>.src</span>
            </div>
            <div className="flex flex-col pl-3 gap-1.5">
              <div className="flex items-center gap-1.5 text-neutral-700 font-medium cursor-pointer text-xs">
                <span className="text-[10px]">&#8964;</span>
                <span>.features</span>
              </div>
              <div className="flex flex-col pl-3 gap-1">
                <div className="flex items-center gap-1.5 text-neutral-700 font-medium cursor-pointer text-xs">
                  <span className="text-[10px]">&#8964;</span>
                  <span>.snippets</span>
                </div>
                <div className="flex flex-col pl-2 gap-1 text-neutral-500">
                  <button
                    onClick={() => setActiveFile("button.tsx")}
                    className={`flex items-center gap-1.5 text-left px-2 py-1 rounded text-xs transition ${
                      activeFile === "button.tsx"
                        ? "bg-neutral-100 text-neutral-900 font-semibold"
                        : "hover:text-neutral-900 hover:bg-neutral-50"
                    }`}
                  >
                    <span className="text-neutral-400">&#128441;</span>
                    <span>button.tsx</span>
                  </button>
                  <button
                    onClick={() => setActiveFile("card.tsx")}
                    className={`flex items-center gap-1.5 text-left px-2 py-1 rounded text-xs transition ${
                      activeFile === "card.tsx"
                        ? "bg-neutral-100 text-neutral-900 font-semibold"
                        : "hover:text-neutral-900 hover:bg-neutral-50"
                    }`}
                  >
                    <span className="text-neutral-400">&#128441;</span>
                    <span>card.tsx</span>
                  </button>
                  <button
                    onClick={() => setActiveFile("ship-score.tsx")}
                    className={`flex items-center gap-1.5 text-left px-2 py-1 rounded text-xs transition ${
                      activeFile === "ship-score.tsx"
                        ? "bg-neutral-100 text-neutral-900 font-semibold"
                        : "hover:text-neutral-900 hover:bg-neutral-50"
                    }`}
                  >
                    <span className="text-neutral-400">&#128441;</span>
                    <span>ship-score.tsx</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Code Editor */}
        <div className="flex flex-col min-w-0 bg-white">
          {/* Editor Tab Bar */}
          <div className="flex items-center justify-between border-b border-neutral-200 bg-[#FAFAFA] px-4 py-2 select-none">
            <div className="flex items-center gap-2">
              <FileText className="size-3.5 text-neutral-400" />
              <span className="font-mono text-xs sm:text-[13px] text-neutral-800 font-medium">
                {activeFile}
              </span>
            </div>
            <span className="font-mono text-[11px] text-neutral-400">
              {lines.length} lines &bull; TypeScript
            </span>
          </div>

          {/* Editor Grid: Synchronized Line Numbers + Live Code Overlay */}
          <div className="relative flex h-[380px] sm:h-[420px] lg:h-[450px] xl:h-[470px] bg-white font-mono text-xs sm:text-[13px] md:text-[13.5px] leading-[1.65]">
            {/* Dynamic Line Numbers */}
            <div
              ref={lineNumbersRef}
              aria-hidden="true"
              className="w-10 sm:w-11 select-none overflow-hidden border-r border-neutral-100 bg-[#FAFAFA] py-3 text-right pr-3 font-mono text-[11px] sm:text-xs text-neutral-400"
            >
              {lines.map((_, i) => (
                <div key={i} className="min-h-[1.65em]">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Code Surface Container */}
            <div className="relative flex-1 overflow-hidden">
              {/* Syntax Highlighted View underneath */}
              <pre
                ref={preRef}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 select-none m-0 overflow-hidden py-3 px-4 font-mono text-xs sm:text-[13px] md:text-[13.5px] leading-[1.65] text-neutral-800 whitespace-pre"
              >
                {lines.map((line, i) => (
                  <div key={i} className="min-h-[1.65em]">
                    {renderSyntaxTokens(line)}
                  </div>
                ))}
              </pre>

              {/* Transparent Interactive Textarea on top */}
              <textarea
                ref={textareaRef}
                value={code}
                onChange={handleCodeChange}
                onScroll={handleScroll}
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                aria-label="Editable Code Console"
                className="absolute inset-0 h-full w-full resize-none border-0 bg-transparent py-3 px-4 font-mono text-xs sm:text-[13px] md:text-[13.5px] leading-[1.65] text-transparent caret-neutral-900 outline-none selection:bg-neutral-200/80 selection:text-transparent overflow-auto whitespace-pre z-10 [scrollbar-width:thin] [scrollbar-color:#d4d4d8_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
