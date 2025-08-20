import { useActor } from '../../hooks/useActor';
import { canisterId } from '../../backend';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const network = process.env.DFX_NETWORK || (process.env.NODE_ENV === 'production' ? 'ic' : 'local');

async function loadConfig(): Promise<{
  backend_host: string;
  backend_canister_id: string;
}> {
  try {
    const response = await fetch('./env.json');
    return await response.json();
  } catch {
    return { backend_host: 'undefined', backend_canister_id: 'undefined' };
  }
}

// Simplified URL sanitization
export const sanitizeUrl = (path: string): string => {
  return path
    .trim() // Remove leading/trailing whitespace first
    .replace(/\s+/g, '-') // Replace all whitespace sequences with single hyphen
    .replace(/[^a-zA-Z0-9\-_./]/g, '') // Remove invalid characters
    .replace(/-+/g, '-') // Replace multiple consecutive hyphens with single hyphen
    .replace(/\.\./g, '') // Remove path traversal attempts
    .replace(/^[-\/]+/, '') // Remove leading hyphens and slashes
    .replace(/\/+/g, '/') // Normalize multiple slashes to single slash
    .replace(/[-\/]+$/, ''); // Remove trailing hyphens and slashes
};

// Get file URL with simplified logic
const getFileUrl = async (path: string): Promise<string> => {
  const sanitizedPath = sanitizeUrl(path);
  const config = await loadConfig();

  const backendCanisterId =
    config.backend_canister_id !== 'undefined' ? config.backend_canister_id : canisterId;

  const baseUrl =
    network === 'local'
      ? `http://${backendCanisterId}.raw.localhost:8081`
      : `https://${backendCanisterId}.raw.icp0.io`;

  return `${baseUrl}/${sanitizedPath}`;
};

// Hook to fetch the list of files
export const useFileList = () => {
  const { actor } = useActor();

  return useQuery({
    queryKey: ['fileList'],
    queryFn: async () => {
      if (!actor || !actor.fileList) throw new Error('Backend is not available');
      return await actor.fileList();
    },
    enabled: !!actor,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Unified hook for getting file URLs
export const useFileUrl = (path: string) => {
  return useQuery({
    queryKey: ['fileUrl', path],
    queryFn: () => getFileUrl(path!),
    enabled: !!path,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Utility to invalidate queries
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();

  return {
    invalidateFileList: () => queryClient.invalidateQueries({ queryKey: ['fileList'] }),
    invalidateFileUrl: (path: string) =>
      queryClient.invalidateQueries({ queryKey: ['fileUrl', path] }),
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: ['fileList'] });
      queryClient.invalidateQueries({ queryKey: ['fileUrl'] });
    },
  };
};
