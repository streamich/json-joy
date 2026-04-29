export const formatFileSize = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes < 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

const IMAGE_MIME_RE = /^image\//i;
const AUDIO_MIME_RE = /^audio\//i;
const VIDEO_MIME_RE = /^video\//i;

export const isImageMime = (mime?: string): boolean => !!mime && IMAGE_MIME_RE.test(mime);
export const isAudioMime = (mime?: string): boolean => !!mime && AUDIO_MIME_RE.test(mime);
export const isVideoMime = (mime?: string): boolean => !!mime && VIDEO_MIME_RE.test(mime);
