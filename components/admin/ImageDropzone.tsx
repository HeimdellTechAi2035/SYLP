"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Drag-and-drop / click-to-browse image field. Uploads immediately to
 * /api/admin/uploads (Netlify Blobs-backed) and writes the resulting /media/
 * URL into a hidden input, so it drops straight into any existing form
 * (server action or otherwise) that previously took a plain image URL.
 */
export default function ImageDropzone({
  name,
  label,
  defaultValue,
  onUploaded,
}: {
  name: string;
  label?: string;
  defaultValue?: string | null;
  onUploaded?: (url: string) => void;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(
    async (file: File) => {
      setUploading(true);
      setError(null);
      try {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/admin/uploads", { method: "POST", body });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Upload failed");
        setUrl(data.url);
        onUploaded?.(data.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [onUploaded]
  );

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) upload(file);
  };

  return (
    <div>
      {label && <label className="block text-sm font-medium text-ink mb-1">{label}</label>}
      <input type="hidden" name={name} value={url} readOnly />
      <div
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        role="button"
        tabIndex={0}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`flex items-center gap-4 rounded-lg border border-dashed px-4 py-3 cursor-pointer text-sm transition-colors ${
          dragOver ? "border-rose-dark bg-blush" : "border-ink/25 hover:border-ink/40"
        }`}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element -- live preview of a just-uploaded/arbitrary URL, not a next/image candidate
          <img src={url} alt="" className="w-14 h-14 object-cover rounded shrink-0" />
        ) : (
          <div className="w-14 h-14 rounded bg-blush flex items-center justify-center text-ink-soft text-[10px] shrink-0 text-center">
            No image
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-ink">{uploading ? "Uploading…" : "Drag & drop an image, or click to browse"}</p>
          <p className="text-xs text-ink-soft truncate">
            {url ? url : "JPG, PNG, WEBP or GIF — up to 8MB"}
          </p>
        </div>
        {url && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setUrl("");
              setError(null);
            }}
            className="text-rose-dark text-xs underline shrink-0"
          >
            Remove
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {error && <p className="text-xs text-rose-dark mt-1">{error}</p>}
    </div>
  );
}
