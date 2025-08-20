import { useState } from 'react';
import { useActor } from '../../hooks/useActor';
import { sanitizeUrl, useInvalidateQueries } from './FileList';

const CHUNK_SIZE = 2_000_000;

export const useFileUpload = () => {
  const { actor } = useActor();
  const [isUploading, setIsUploading] = useState(false);
  const { invalidateFileList } = useInvalidateQueries();

  const uploadFile = async (
    path: string,
    mimeType: string,
    data: Uint8Array,
    onProgress?: (percentage: number) => void
  ): Promise<void> => {
    if (!actor) {
      throw new Error('Backend is not available');
    }

    setIsUploading(true);

    try {
      const totalChunks = Math.ceil(data.length / CHUNK_SIZE);

      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, data.length);
        const chunk = data.slice(start, end);
        const complete = chunkIndex === totalChunks - 1;

        let sanitizedPath = sanitizeUrl(path);
        if (!actor.fileUpload) {
          throw new Error('fileUpload method is not implemented on actor');
        }
        await actor.fileUpload(sanitizedPath, mimeType, chunk, complete);

        const progress = ((chunkIndex + 1) / totalChunks) * 100;
        onProgress?.(progress);
      }
      await invalidateFileList();
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFile, isUploading };
};
