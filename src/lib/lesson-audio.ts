import fs from 'fs';
import path from 'path';

export interface LessonAudio {
  available: boolean;
  url: string;
  path: string;
  fileName: string;
  voice: string;
  voiceLabel: string;
  modeLabel: string;
  durationLabel: string;
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

function findLocalAudioFile(day: number): { fileName: string; path: string } | null {
  const dayLabel = padDay(day);
  const extensions = ['m4a', 'mp3', 'aac'];
  for (const extension of extensions) {
    const fileName = `day-${dayLabel}.${extension}`;
    const relativePath = `lessons/${fileName}`;
    const publicPath = path.join(process.cwd(), 'public', 'audio', relativePath);
    if (fs.existsSync(publicPath)) {
      return { fileName, path: relativePath };
    }
  }
  return null;
}

function getAudioManifestItem(day: number): { estimatedDuration?: string; mode?: string } | null {
  const manifestPath = path.join(process.cwd(), 'public', 'audio', 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    return null;
  }

  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as {
      items?: Array<{ day_number: number; estimatedDuration?: string; mode?: string }>;
    };
    return manifest.items?.find((item) => item.day_number === day) || null;
  } catch {
    return null;
  }
}

export function getLessonAudio(day: number): LessonAudio {
  const localAudio = findLocalAudioFile(day);
  const manifestItem = getAudioManifestItem(day);
  const baseUrl = process.env.NEXT_PUBLIC_LESSON_AUDIO_BASE_URL || (localAudio ? '/sobermind/audio' : '');
  const pathPrefix = trimSlashes(process.env.LESSON_AUDIO_PATH_PREFIX || 'lessons');
  const extension = process.env.LESSON_AUDIO_EXTENSION || localAudio?.fileName.split('.').pop() || 'm4a';
  const fileName = localAudio?.fileName || `day-${padDay(day)}.${extension}`;
  const path = localAudio?.path || (pathPrefix ? `${pathPrefix}/${fileName}` : fileName);
  const url = joinUrl(baseUrl, path);

  return {
    available: Boolean(url),
    url,
    path,
    fileName,
    voice: 'natural-male',
    voiceLabel: process.env.LESSON_AUDIO_VOICE_LABEL || '自然男声',
    modeLabel: manifestItem?.mode === 'full' ? '完整朗读' : manifestItem?.mode === 'academy' ? '学院式讲解' : '精华导读',
    durationLabel: manifestItem?.estimatedDuration ? `约 ${manifestItem.estimatedDuration}` : '',
    status: url ? 'ready' : 'planned',
  };
}
