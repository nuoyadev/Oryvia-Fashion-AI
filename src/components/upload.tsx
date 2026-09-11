"use client";

import { useRef, useState } from "react";
import { Spinner, cx } from "./ui";
import { CameraIcon } from "./icons";

export function UploadField({
  onFile,
  accept = "image/*",
  capture,
  label = "Prendre une photo",
  className,
}: {
  onFile: (file: File) => void;
  accept?: string;
  capture?: boolean;
  label?: string;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function handle(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setBusy(true);
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
      setBusy(false);
      onFile(file);
    };
    reader.onerror = () => setBusy(false);
    reader.readAsDataURL(file);
  }

  return (
    <div className={cx("relative", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        capture={capture ? "environment" : undefined}
        className="hidden"
        onChange={(e) => {
          handle(e.target.files);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cx(
          "flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-white/15 bg-white/[0.03] text-muted transition-colors hover:border-rose/60 hover:text-cream",
          preview ? "overflow-hidden p-0" : "p-6"
        )}
      >
        {busy ? (
          <Spinner />
        ) : preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Aperçu" className="h-full w-full object-cover" />
        ) : (
          <>
            <CameraIcon className="h-7 w-7" />
            <span className="text-sm font-medium">{label}</span>
          </>
        )}
      </button>
    </div>
  );
}
