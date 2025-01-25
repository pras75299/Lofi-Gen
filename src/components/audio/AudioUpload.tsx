import React from "react";
import { Upload } from "lucide-react";

interface AudioUploadProps {
  isUploading: boolean;
  onFileChange: (file: File) => void;
}

export const AudioUpload: React.FC<AudioUploadProps> = ({
  isUploading,
  onFileChange,
}) => {
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      onFileChange(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onFileChange(e.target.files[0]);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center mb-4">
        <Upload className="w-6 h-6 text-[#8EB486] mr-2" />
        <h2 className="text-xl font-semibold">Upload Audio</h2>
      </div>
      <div
        className="border-2 border-dashed border-[#8EB486] rounded-lg p-8 text-center"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-[#8EB486] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-[#997C70]">Uploading audio file...</p>
          </div>
        ) : (
          <>
            <p className="text-[#997C70] mb-4">
              Drag and drop your audio file here, or click to browse
            </p>
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              id="audio-input"
              onChange={handleFileSelect}
            />
            <label
              htmlFor="audio-input"
              className="px-4 py-2 bg-[#8EB486] hover:bg-[#997C70] text-white rounded-md transition-colors cursor-pointer inline-block shadow-md"
            >
              Choose File
            </label>
          </>
        )}
      </div>
    </div>
  );
};
