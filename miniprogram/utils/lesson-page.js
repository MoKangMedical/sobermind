const audioUtils = require('./audio');
const lessonUtils = require('./lesson-utils');

function splitParagraphs(text) {
  return String(text || '')
    .split(/\n\s*\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseBody(text) {
  return splitParagraphs(text).map((section) => {
    if (section.indexOf('## ') === 0) {
      return {
        type: 'h2',
        text: section.replace(/^##\s+/, '').replace(/^[一二三四五六七八九十]、/, '').trim(),
      };
    }
    if (section.indexOf('### ') === 0) {
      return {
        type: 'h3',
        text: section.replace(/^###\s+/, '').trim(),
      };
    }
    return {
      type: 'p',
      text: section,
    };
  });
}

function getSavedState(day) {
  const completed = wx.getStorageSync('completedLessons') || {};
  const lessonState = wx.getStorageSync(`lessonState:${day}`) || {};
  return {
    completed: Boolean(completed[day]),
    checkedCriteria: lessonState.checkedCriteria || [],
    reflection: lessonState.reflection || '',
  };
}

function getDefaultAudioState() {
  return {
    loading: false,
    playing: false,
    current: 0,
    duration: 0,
    currentText: '00:00',
    durationText: '--:--',
    error: '',
  };
}

function createLessonPage({ getLessonByDay }) {
  return {
    data: {
      day: 1,
      totalDays: 1,
      lesson: null,
      readingBlocks: [],
      bodyBlocks: [],
      closingBlocks: [],
      criteria: [],
      checkedCriteria: [],
      reflection: '',
      completed: false,
      audio: null,
      audioState: getDefaultAudioState(),
      speedLabels: audioUtils.speedLabels,
      speedIndex: 1,
    },

    onLoad(options) {
      const day = Number(options.day || 1);
      this.loadLesson(day);
    },

    onHide() {
      this.pauseAudio();
    },

    onUnload() {
      this.destroyAudio();
    },

    loadLesson(day) {
      const lesson = getLessonByDay(day);
      if (!lesson) {
        wx.showToast({ title: '课程不存在', icon: 'none' });
        return;
      }

      this.destroyAudio();

      const saved = getSavedState(day);
      const criteria = (lesson.self_assessment && lesson.self_assessment.criteria ? lesson.self_assessment.criteria : []).map((text, index) => ({
        text,
        value: String(index),
        checked: saved.checkedCriteria.indexOf(String(index)) !== -1,
      }));
      const audio = audioUtils.resolveLessonAudio(lesson);

      wx.setNavigationBarTitle({
        title: `Day ${day}`,
      });

      this.setData({
        day,
        totalDays: lessonUtils.getTotalDays(),
        lesson,
        readingBlocks: splitParagraphs(lesson.reading),
        bodyBlocks: parseBody(lesson.body),
        closingBlocks: splitParagraphs(lesson.closing),
        criteria,
        checkedCriteria: saved.checkedCriteria,
        reflection: saved.reflection,
        completed: saved.completed,
        audio,
        audioState: getDefaultAudioState(),
        speedIndex: 1,
      });

      if (audio.available) {
        this.setupAudio(audio.url);
      }
    },

    setupAudio(src) {
      const audioContext = wx.createInnerAudioContext();
      this.audioContext = audioContext;
      this.audioSeeking = false;
      audioContext.src = src;
      audioContext.obeyMuteSwitch = false;
      audioContext.playbackRate = audioUtils.speedValues[this.data.speedIndex] || 1;

      audioContext.onCanplay(() => {
        const duration = Number(audioContext.duration) || this.data.audioState.duration || 0;
        this.setAudioState({
          loading: false,
          duration,
          durationText: duration ? audioUtils.formatTime(duration) : '--:--',
        });
      });

      audioContext.onPlay(() => {
        this.setAudioState({ loading: false, playing: true, error: '' });
      });

      audioContext.onPause(() => {
        this.setAudioState({ playing: false });
      });

      audioContext.onStop(() => {
        this.setAudioState({ playing: false });
      });

      audioContext.onEnded(() => {
        this.setAudioState({
          playing: false,
          current: 0,
          currentText: '00:00',
        });
      });

      audioContext.onError(() => {
        this.setAudioState({
          loading: false,
          playing: false,
          error: '音频暂时无法播放',
        });
      });

      audioContext.onTimeUpdate(() => {
        if (this.audioSeeking) {
          return;
        }
        const current = Number(audioContext.currentTime) || 0;
        const duration = Number(audioContext.duration) || this.data.audioState.duration || 0;
        this.setAudioState({
          current,
          duration,
          currentText: audioUtils.formatTime(current),
          durationText: duration ? audioUtils.formatTime(duration) : '--:--',
        });
      });
    },

    setAudioState(partialState) {
      this.setData({
        audioState: {
          ...this.data.audioState,
          ...partialState,
        },
      });
    },

    toggleAudio() {
      if (!this.data.audio || !this.data.audio.available || !this.audioContext) {
        wx.showToast({ title: '音频准备中', icon: 'none' });
        return;
      }

      if (this.data.audioState.playing) {
        this.audioContext.pause();
        return;
      }

      this.setAudioState({ loading: true, error: '' });
      this.audioContext.play();
    },

    pauseAudio() {
      if (this.audioContext && this.data.audioState.playing) {
        this.audioContext.pause();
      }
    },

    onAudioSeeking() {
      this.audioSeeking = true;
    },

    onAudioSeek(event) {
      const current = Number(event.detail.value) || 0;
      this.audioSeeking = false;
      if (this.audioContext) {
        this.audioContext.seek(current);
      }
      this.setAudioState({
        current,
        currentText: audioUtils.formatTime(current),
      });
    },

    onSpeedChange(event) {
      const speedIndex = Number(event.detail.value) || 0;
      const speed = audioUtils.speedValues[speedIndex] || 1;
      if (this.audioContext) {
        this.audioContext.playbackRate = speed;
      }
      this.setData({ speedIndex });
    },

    destroyAudio() {
      if (this.audioContext) {
        this.audioContext.destroy();
        this.audioContext = null;
      }
      this.audioSeeking = false;
    },

    openCategory() {
      wx.navigateTo({
        url: `/pages/category/category?name=${encodeURIComponent(this.data.lesson.category)}`,
      });
    },

    onCriteriaChange(event) {
      const checkedCriteria = event.detail.value;
      const criteria = this.data.criteria.map((item) => ({
        ...item,
        checked: checkedCriteria.indexOf(item.value) !== -1,
      }));

      this.setData({ checkedCriteria, criteria });
      this.saveState(false);
    },

    onReflectionInput(event) {
      this.setData({ reflection: event.detail.value });
    },

    saveReflection() {
      this.saveState(true);
    },

    toggleComplete() {
      const completed = !this.data.completed;
      const allCompleted = wx.getStorageSync('completedLessons') || {};
      if (completed) {
        allCompleted[this.data.day] = Date.now();
      } else {
        delete allCompleted[this.data.day];
      }

      wx.setStorageSync('completedLessons', allCompleted);
      this.setData({ completed });
      this.saveState(false);
    },

    saveState(showToast) {
      wx.setStorageSync(`lessonState:${this.data.day}`, {
        checkedCriteria: this.data.checkedCriteria,
        reflection: this.data.reflection,
        updatedAt: Date.now(),
      });

      if (showToast) {
        wx.showToast({ title: '已保存', icon: 'success' });
      }
    },

    goPrev() {
      const prev = this.data.day <= 1 ? this.data.totalDays : this.data.day - 1;
      lessonUtils.navigateToLesson(prev, 'redirectTo');
    },

    goNext() {
      const next = this.data.day >= this.data.totalDays ? 1 : this.data.day + 1;
      lessonUtils.navigateToLesson(next, 'redirectTo');
    },

    onShareAppMessage() {
      return {
        title: `Day ${this.data.day} · ${this.data.lesson.title}`,
        path: lessonUtils.getLessonPath(this.data.day),
      };
    },
  };
}

module.exports = {
  createLessonPage,
};
