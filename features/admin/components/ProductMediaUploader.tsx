"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { CloudUpload, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = "image/jpeg,image/png";

interface MediaAsset {
  id: string;
  name: string;
  previewUrl: string;
}

interface ProductMediaUploaderProps {
  onChange?: () => void;
}

export default function ProductMediaUploader({
  onChange,
}: ProductMediaUploaderProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Preview URLs are browser resources, not render state — revoke them on unmount.
  const objectUrlsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const urls = objectUrlsRef.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const addFiles = (files: FileList | null) => {
    const images = Array.from(files ?? []).filter((file) =>
      file.type.startsWith("image/"),
    );
    if (images.length === 0) return;

    const added = images.map((file) => {
      const previewUrl = URL.createObjectURL(file);
      objectUrlsRef.current.add(previewUrl);
      return { id: crypto.randomUUID(), name: file.name, previewUrl };
    });

    setAssets((current) => [...current, ...added]);
    onChange?.();
  };

  const removeAsset = (id: string) => {
    const removed = assets.find((asset) => asset.id === id);
    if (removed) {
      URL.revokeObjectURL(removed.previewUrl);
      objectUrlsRef.current.delete(removed.previewUrl);
    }
    setAssets((current) => current.filter((asset) => asset.id !== id));
    onChange?.();
  };

  const openPicker = () => inputRef.current?.click();

  return (
    <div className="flex flex-col gap-6">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        multiple
        hidden
        onChange={(e) => {
          addFiles(e.target.files);
          // Allow re-picking the same file after a removal.
          e.target.value = "";
        }}
      />

      {/* Dropzone */}
      <button
        type="button"
        onClick={openPicker}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "group bg-muted/50 border-border hover:border-foreground flex aspect-21/9 w-full flex-col items-center justify-center border border-dashed transition-colors duration-300",
          isDragging && "border-foreground bg-muted",
        )}
      >
        <CloudUpload
          className={cn(
            "text-muted-foreground group-hover:text-foreground mb-4 size-10 transition-colors",
            isDragging && "text-foreground",
          )}
        />
        <span className="text-muted-foreground group-hover:text-foreground text-xs font-semibold tracking-widest uppercase transition-colors">
          Upload New Assets
        </span>
        <span className="text-muted-foreground/80 mt-2 text-[13px]">
          Drag and drop high-resolution JPG or PNG
        </span>
      </button>

      {/* Thumbnails */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
        {assets.map((asset, index) => (
          <div
            key={asset.id}
            className="group bg-accent border-border relative aspect-square overflow-hidden border"
          >
            <Image
              src={asset.previewUrl}
              alt={asset.name}
              fill
              sizes="(min-width: 640px) 12rem, 50vw"
              unoptimized
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {index === 0 && (
              <span className="absolute top-2 left-2 bg-black/50 px-2 py-0.5 text-[10px] font-semibold tracking-widest text-white uppercase">
                Primary
              </span>
            )}
            <div className="bg-primary/20 absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
              <button
                type="button"
                onClick={() => removeAsset(asset.id)}
                aria-label={`Remove ${asset.name}`}
                className="bg-background text-foreground hover:bg-foreground hover:text-background p-2 transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Placeholder tiles keep the grid rhythm before anything is uploaded */}
        {Array.from({ length: Math.max(0, 3 - assets.length) }).map((_, i) => (
          <div
            key={`placeholder-${i}`}
            className="bg-surface-container-highest border-border aspect-square border"
          />
        ))}

        <button
          type="button"
          onClick={openPicker}
          aria-label="Add more images"
          className="border-border text-muted-foreground hover:border-foreground hover:text-foreground flex aspect-square items-center justify-center border border-dashed transition-colors"
        >
          <Plus className="size-5" />
        </button>
      </div>
    </div>
  );
}
