import React, { useState } from "react";
import { uploadProfileImage, removeProfileImage } from "../lib/firebaseUtils";
import { Photo } from "../types/schema";
import { serverTimestamp, Timestamp } from "firebase/firestore";
import Image from "next/image";

interface ImageManagerProps {
  images: Photo[];
  onImagesChange: (images: Photo[]) => void;
  userId: string;
}

export default function ImageManager({
  images,
  onImagesChange,
  userId,
}: ImageManagerProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    setIsLoading(true);
    try {
      const uploaded: Photo[] = await Promise.all(
        fileArray.map(async (file, index) => {
          const { id, url } = await uploadProfileImage(file, userId);
          return {
            id,
            storageUrl: url,
            downloadUrl: url,
            order: images.length + index,
            uploadedAt: new Date() as Date,
            isProfilePhoto: false,
          };
        })
      );

      onImagesChange([...images, ...uploaded]);
      e.target.value = "";
    } catch (error) {
      console.error("Error uploading images:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveImage = async (imageId: string) => {
    await removeProfileImage(userId, imageId);
    const updatedImages = images.filter((img) => img.id !== imageId);
    const reorderedImages = updatedImages.map((img, index) => ({
      ...img,
      order: index,
    }));
    onImagesChange(reorderedImages);
  };

  // Drag and drop handlers for reordering
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];

    // Remove dragged item
    newImages.splice(draggedIndex, 1);

    // Insert at new position
    newImages.splice(dropIndex, 0, draggedImage);

    // Update order property
    const reorderedImages = newImages.map((img, index) => ({
      ...img,
      order: index,
    }));

    onImagesChange(reorderedImages);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-foreground">
        Profiilikuvat
      </label>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`relative group cursor-move border-2 border-dashed border-gray-300 rounded-lg overflow-hidden aspect-square ${
                draggedIndex === index ? "opacity-50" : ""
              } hover:border-tuni-blue transition-colors`}
            >
              <Image
                src={image.downloadUrl}
                alt={`Profile ${index + 1}`}
                width={300}
                height={300}
                className="w-full h-full object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
                quality={25}
                loading="eager"
                priority
              />

              {/* Order indicator */}
              <div className="absolute top-2 left-2 bg-tuni-blue text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                {index + 1}
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => handleRemoveImage(image.id)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                ×
              </button>

              {/* Drag indicator */}
              <div className="absolute bottom-2 right-2 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-tuni-blue transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              className="w-8 h-8 mb-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Klikkaa ladataksesi</span> tai
              vedä ja pudota
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG tai JPEG (MAX. 10MB)
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
          />
        </label>
      </div>

      {images.length > 0 && (
        <p className="text-sm text-gray-600 mt-2">
          Vedä ja pudota kuvia järjestääksesi niitä uudelleen. Ensimmäinen kuva
          näkyy pääkuvana.
        </p>
      )}
    </div>
  );
}
