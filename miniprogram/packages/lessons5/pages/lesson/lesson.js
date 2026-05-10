const { getLessonByDay } = require('../../data/lessons');
const { createLessonPage } = require('../../../../utils/lesson-page');

Page(createLessonPage({ getLessonByDay }));
