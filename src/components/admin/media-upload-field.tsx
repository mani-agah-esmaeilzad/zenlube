"use client";

import { useRef, useState, type ChangeEvent } from "react";

type MediaUploadFieldProps = {
  name: string;
  label: string;
  defaultValue?: string | null;
  description?: string;
  disabled?: boolean;
};

export function MediaUploadField({ name, label, defaultValue, description, disabled }: MediaUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultValue ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || !data?.url) {
        throw new Error(data?.message ?? "آپلود فایل با خطا مواجه شد.");
      }

      setValue(data.url);
      if (inputRef.current) {
        inputRef.current.value = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "آپلود فایل با خطا مواجه شد.");
    } finally {
      setIsUploading(false);
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-slate-600" htmlFor={name}>
        {label}
      </label>
      <div className="flex gap-2">
        <input
          id={name}
          name={name}
          ref={inputRef}
          defaultValue={value}
          onChange={(event) => {
            setValue(event.target.value);
            setError(null);
          }}
          className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-sky-300 focus:outline-none"
          placeholder="https://..."
          disabled={disabled}
        />
        <button
          type="button"
          onClick={handleFileSelect}
          className="rounded-full border border-sky-200 px-4 py-2 text-xs font-semibold text-sky-600 transition hover:border-sky-300 hover:text-sky-700"
          disabled={isUploading || disabled}
        >
          {isUploading ? "در حال آپلود" : "آپلود"}
        </button>
      </div>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
      {description && <p className="text-[11px] text-slate-500">{description}</p>}
      {error && <p className="text-[11px] text-red-500">{error}</p>}
      {value && (
        <div className="mt-2 overflow-hidden rounded-2xl border border-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={label} className="h-32 w-full object-cover" />
        </div>
      )}
    </div>
  );
}
