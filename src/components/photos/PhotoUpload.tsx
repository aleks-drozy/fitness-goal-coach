"use client";

import { useRef, useState } from "react";
import Image from "next/image";

interface PhotoUploadProps {
  label: string;
  hint?: string;
  base64Value: string | null;
  onChange: (base64: string) => void;
}

export function PhotoUpload({ label, hint, base64Value, onChange }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onChange(result);
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2">
      <p className="text-[0.8125rem] font-medium" style={{ color: "var(--foreground)" }}>
        {label}
      </p>
      {hint && (
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          {hint}
        </p>
      )}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        className="relative rounded-[var(--r-card)] overflow-hidden cursor-pointer"
        style={{
          minHeight: 200,
          border: `1.5px dashed ${isDragOver ? "var(--primary)" : "var(--border)"}`,
          background: isDragOver ? "var(--accent-dim)" : "var(--surface)",
          transition: `border-color var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out)`,
        }}
      >
        {base64Value ? (
          <Image
            src={base64Value}
            alt={label}
            fill
            className="object-cover"
          />
        ) : (
          <div
            className="flex flex-col items-center justify-center h-full min-h-[200px] gap-2.5 p-4"
            style={{ color: isDragOver ? "var(--primary)" : "var(--muted-foreground)" }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span className="text-sm">Click or drag to upload</span>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
