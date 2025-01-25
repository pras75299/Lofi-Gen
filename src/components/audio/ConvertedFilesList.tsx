// src/components/audio/ConvertedFilesList.tsx
import React from "react";

interface ConvertedFile {
  id: string;
  originalName: string;
  convertedUrl: string;
  createdAt: Date;
}

interface ConvertedFilesListProps {
  files: ConvertedFile[];
}

export const ConvertedFilesList: React.FC<ConvertedFilesListProps> = ({
  files,
}) => {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Your Converted Files</h2>
      <ul>
        {files.map((file) => (
          <li
            key={file.id}
            className="flex items-center justify-between mb-4 bg-white/50 
              backdrop-blur-sm rounded-lg p-3 shadow-sm border border-[#997C70]/20"
          >
            <div>
              <p className="text-[#685752] font-medium">{file.originalName}</p>
              <p className="text-sm text-[#685752]/70">
                {file.createdAt.toLocaleString()}
              </p>
            </div>
            <a
              href={file.convertedUrl}
              download
              className="px-4 py-2 bg-[#8EB486] hover:bg-[#997C70] text-white rounded-md"
            >
              Download
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
