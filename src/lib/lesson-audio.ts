export interface LessonAudio {
  available: boolean;
  url: string;
  path: string;
  fileName: string;
  voice: string;
  voiceLabel: string;
  status: 'ready' | 'planned';
}

function trimSlashes(value: string): string {
  return value.replace(/^\/+|\/+$/g, '');
}

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/g, '');
}

function padDay(day: number): string {
  return `000${day}`.slice(-3);
}

function joinUrl(baseUrl: string, assetPath: string): string {
  const cleanBase = normalizeBaseUrl(baseUrl);
  const cleanPath = trimSlashes(assetPath);
  return cleanBase && cleanPath ? `${cleanBase}/${cleanPath}` : '';
}

export function getLessonAudio(day: number): LessonAudio {
  const baseUrl = process.env.NEXT_PUBLIC_LESSON_AUDIO_BASE_URL || '';
  const pathPrefix = trimSlashes(process.env.LESSON_AUDIO_PATH_PREFIX || 'lessons');
  const fileName = `day-${padDay(day)}.mp3`;
  const path = pathPrefix ? `${pathPrefix}/${fileName}` : fileName;
  const url = joinUrl(baseUrl, path);

  return {
    available: Boolean(url),
    url,
    path,
    fileName,
    voice: 'natural-male',
    voiceLabel: process.env.LESSON_AUDIO_VOICE_LABEL || '自然男声',
    status: url ? 'ready' : 'planned',
  };
}
