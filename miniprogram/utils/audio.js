const config = require('../config/index');

const speedValues = [0.8, 1, 1.25, 1.5];
const speedLabels = speedValues.map((value) => `${value}x`);

function trimSlashes(value) {
  return String(value || '').replace(/^\/+|\/+$/g, '');
}

function normalizeBaseUrl(value) {
  return String(value || '').replace(/\/+$/g, '');
}

function padDay(day) {
  return `000${Number(day)}`.slice(-3);
}

function joinUrl(baseUrl, assetPath) {
  const base = normalizeBaseUrl(baseUrl);
  const cleanPath = trimSlashes(assetPath);
  return base && cleanPath ? `${base}/${cleanPath}` : '';
}

function formatTime(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
}

function getConfiguredBaseUrl() {
  if (config.audio && config.audio.baseUrl) {
    return config.audio.baseUrl;
  }
  return config.audioBaseUrl || '';
}

function resolveLessonAudio(lesson) {
  const audio = lesson && lesson.audio ? lesson.audio : {};
  const format = audio.format || 'mp3';
  const path = audio.path || `lessons/day-${padDay(lesson.day_number)}.${format}`;
  const url = audio.url || joinUrl(getConfiguredBaseUrl(), path);
  const available = Boolean(url);

  return {
    status: available ? 'ready' : audio.status || 'planned',
    statusLabel: available ? '可播放' : '音频准备中',
    voice: audio.voice || 'natural-male',
    voiceLabel: audio.voiceLabel || (config.audio && config.audio.voiceLabel) || '自然男声',
    format,
    fileName: audio.fileName || `day-${padDay(lesson.day_number)}.${format}`,
    path,
    url,
    available,
  };
}

module.exports = {
  speedLabels,
  speedValues,
  formatTime,
  resolveLessonAudio,
};
