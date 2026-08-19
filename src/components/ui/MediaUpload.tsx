"use client";

import React, { useState, useEffect } from "react";
import { Upload, X, Film, Loader2 } from "lucide-react";

interface MediaUploadProps {
  label?: string;
  value?: string[];
  onChange?: (mediaList: string[]) => void;
  maxFiles?: number;
  acceptTypes?: string;
}

export default function MediaUpload({
  label = "GEAR VISUALS / MEDIA",
  value = [],
  onChange,
  maxFiles = 4,
  acceptTypes = "image/*,video/*",
}: MediaUploadProps) {
  const [mediaList, setMediaList] = useState<string[]>(value);
  const [isUploading, setIsUploading] = useState(false);

  // Sync state nội bộ khi value từ parent component thay đổi
  useEffect(() => {
    setMediaList(value);
  }, [value]);

  const isVideo = (url: string) => {
    return (
      url.startsWith("data:video") ||
      url.endsWith(".mp4") ||
      url.endsWith(".webm") ||
      url.includes("video")
    );
  };

  // Hàm upload từng file lên Cloudinary
  const uploadToCloudinary = async (file: File): Promise<string | null> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      console.error(
        "Thiếu NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME hoặc NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET trong file .env.local",
      );
      alert("Chưa cấu hình Cloudinary trong .env.local!");
      return null;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    // Tự động xác định resource_type là image hay video
    const resourceType = file.type.startsWith("video") ? "video" : "image";

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await res.json();
      if (data.secure_url) {
        return data.secure_url; // Trả về link https://res.cloudinary.com/... thật
      } else {
        console.error("Lỗi Upload Cloudinary:", data);
        return null;
      }
    } catch (err) {
      console.error("Lỗi kết nối Cloudinary:", err);
      return null;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      const uploadedUrls: string[] = [];

      const selectedFiles = Array.from(files).slice(
        0,
        maxFiles - mediaList.length,
      );

      // Upload lần lượt từng file lên Cloudinary
      for (const file of selectedFiles) {
        const url = await uploadToCloudinary(file);
        if (url) uploadedUrls.push(url);
      }

      const updated = [...mediaList, ...uploadedUrls];
      setMediaList(updated);
      if (onChange) onChange(updated);
    } finally {
      setIsUploading(false);
      // Reset input file
      e.target.value = "";
    }
  };

  const handleRemove = (index: number) => {
    const updated = mediaList.filter((_, i) => i !== index);
    setMediaList(updated);
    if (onChange) onChange(updated);
  };

  return (
    <div className="space-y-2 font-mono w-full">
      <div className="flex justify-between items-center">
        <label className="text-xs font-bold text-brand-dark uppercase block">
          {label}
        </label>
        <span className="text-[10px] text-brand-dark/60 font-bold">
          {mediaList.length}/{maxFiles} MAX
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {mediaList.map((src, idx) => (
          <div
            key={idx}
            className="relative aspect-square border-2 border-brand-dark bg-brand-ivory/30 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] group overflow-hidden"
          >
            {isVideo(src) ? (
              <div className="w-full h-full relative bg-black flex items-center justify-center">
                <video
                  src={src}
                  className="w-full h-full object-cover"
                  controls={false}
                  muted
                />
                <div className="absolute top-1 left-1 bg-black/70 text-white p-1 rounded-xs">
                  <Film size={12} />
                </div>
              </div>
            ) : (
              <img
                src={src}
                alt={`Media preview ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            )}

            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="absolute top-1 right-1 bg-rose-600 text-white p-1 border border-brand-dark shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-rose-700 transition-colors cursor-pointer z-10"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {mediaList.length < maxFiles && (
          <label className="aspect-square border-2 border-dashed border-brand-dark bg-white hover:bg-orange-500/5 hover:border-orange-600 transition-all flex flex-col items-center justify-center p-2 cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-px active:translate-y-px">
            {isUploading ? (
              <>
                <Loader2
                  size={20}
                  className="animate-spin text-orange-600 mb-1"
                />
                <span className="text-[9px] font-bold text-orange-600 uppercase">
                  UPLOADING...
                </span>
              </>
            ) : (
              <>
                <Upload size={20} className="text-brand-dark/60 mb-1" />
                <span className="text-[10px] font-bold text-brand-dark/70 uppercase text-center">
                  UPLOAD MEDIA
                </span>
                <span className="text-[8px] text-brand-dark/50">
                  IMAGE / VIDEO
                </span>
              </>
            )}
            <input
              type="file"
              accept={acceptTypes}
              multiple
              disabled={isUploading}
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        )}
      </div>
    </div>
  );
}
