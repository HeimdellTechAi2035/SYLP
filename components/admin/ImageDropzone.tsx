"use client";

import { useCallback, useRef, useState } from "react";
import ReactCrop, { centerCrop, makeAspectCrop, cropToCanvas, type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

/**
 * Drag-and-drop / click-to-browse image field with a built-in crop step.
 * Uploads the CROPPED result to /api/admin/uploads (Netlify Blobs-backed)
 * and writes the resulting /media/ URL into a hidden input, so it drops
 * straight into any existing form (server action or otherwise) that
 * previously took a plain image URL.
 */
export default function ImageDropzone({
  name,
  label,
  defaultValue,
  onUploaded,
  aspect = 1,
}: {
  name: string;
  label?: string;
  defaultValue?: string | null;
  onUploaded?: (url: string) => void;
  /** width / height — e.g. 1 for square, 4/5 for a category tile, 4/3 for a hero image */
  aspect?: number;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Crop modal state
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [fileType, setFileType] = useState("image/jpeg");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const openCropperForFile = (file: File) => {
    setError(null);
    setFileType(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const openCropperForExistingUrl = () => {
    if (!url) return;
    setError(null);
    setFileType("image/jpeg");
    setCropSrc(url);
  };

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const initial = centerCrop(
      makeAspectCrop({ unit: "%", width: 100 }, aspect, width, height),
      width,
      height
    );
    setCrop(initial);
    setCompletedCrop({
      unit: "px",
      x: (initial.x / 100) * width,
      y: (initial.y / 100) * height,
      width: (initial.width / 100) * width,
      height: (initial.height / 100) * height,
    });
  }

  const closeCropper = () => {
    setCropSrc(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
  };

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

  async function confirmCrop() {
    const image = imgRef.current;
    const canvas = canvasRef.current;
    if (!image || !canvas || !completedCrop || completedCrop.width === 0) {
      closeCropper();
      return;
    }
    await cropToCanvas(image, canvas, completedCrop);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const ext = fileType === "image/png" ? "png" : fileType === "image/webp" ? "webp" : "jpg";
        const file = new File([blob], `cropped.${ext}`, { type: fileType });
        upload(file);
        closeCropper();
      },
      fileType,
      0.92
    );
  }

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) openCropperForFile(file);
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
          <div className="flex flex-col gap-1 items-end shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openCropperForExistingUrl();
              }}
              className="text-ink-soft text-xs underline hover:text-ink"
            >
              Recrop
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setUrl("");
                setError(null);
              }}
              className="text-rose-dark text-xs underline"
            >
              Remove
            </button>
          </div>
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

      {cropSrc && (
        <div className="fixed inset-0 z-[200] bg-ink/70 flex items-center justify-center p-4">
          <div className="bg-cream rounded-2xl p-5 max-w-lg w-full max-h-[90vh] overflow-auto">
            <p className="font-display text-lg text-ink mb-3">Crop image</p>
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(pixelCrop) => setCompletedCrop(pixelCrop)}
              aspect={aspect}
              className="max-h-[60vh]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- ReactCrop needs a plain <img>, not next/image */}
              <img ref={imgRef} src={cropSrc} alt="" onLoad={onImageLoad} className="max-h-[60vh] w-auto" />
            </ReactCrop>
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={closeCropper}
                className="px-4 py-2 rounded-full bg-blush text-ink text-sm font-medium border border-ink/15"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmCrop}
                className="px-5 py-2 rounded-full bg-rose text-ink text-sm font-semibold hover:bg-rose-dark transition-colors"
              >
                Crop &amp; Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
