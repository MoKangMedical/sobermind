import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'sobermind.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function initDb(): void {
  const database = getDb();

  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      streak INTEGER NOT NULL DEFAULT 0,
      total_checkins INTEGER NOT NULL DEFAULT 0,
      longest_streak INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS daily_lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day_number INTEGER UNIQUE NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      content TEXT NOT NULL,
      reading TEXT NOT NULL DEFAULT '',
      body TEXT NOT NULL DEFAULT '',
      closing TEXT NOT NULL DEFAULT '',
      exercises TEXT NOT NULL DEFAULT '[]',
      self_assessment TEXT NOT NULL DEFAULT '{}',
      action_points TEXT NOT NULL,
      question TEXT NOT NULL,
      quote TEXT NOT NULL,
      quote_author TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS checkins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      lesson_id INTEGER NOT NULL,
      day_number INTEGER NOT NULL,
      answer TEXT NOT NULL DEFAULT '',
      checked_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (lesson_id) REFERENCES daily_lessons(id) ON DELETE CASCADE,
      UNIQUE(user_id, day_number)
    );

    CREATE INDEX IF NOT EXISTS idx_checkins_user ON checkins(user_id);
    CREATE INDEX IF NOT EXISTS idx_checkins_day ON checkins(day_number);
    CREATE INDEX IF NOT EXISTS idx_checkins_date ON checkins(checked_at);
  `);

  // Seed lessons if table is empty
  const count = database.prepare('SELECT COUNT(*) as c FROM daily_lessons').get() as { c: number };
  if (count.c === 0) {
    const lessonsPath = path.join(process.cwd(), 'src', 'data', 'lessons.json');
    const raw = fs.readFileSync(lessonsPath, 'utf-8');
    const lessons = JSON.parse(raw);

    const insert = database.prepare(`
      INSERT INTO daily_lessons (day_number, title, category, content, reading, body, closing, exercises, self_assessment, action_points, question, quote, quote_author)
      VALUES (@day_number, @title, @category, @content, @reading, @body, @closing, @exercises, @self_assessment, @action_points, @question, @quote, @quote_author)
    `);

    const seedAll = database.transaction(() => {
      for (const l of lessons) {
        insert.run({
          day_number: l.day_number,
          title: l.title,
          category: l.category,
          content: l.content,
          reading: l.reading || '',
          body: l.body || '',
          closing: l.closing || '',
          exercises: JSON.stringify(l.exercises || []),
          self_assessment: JSON.stringify(l.self_assessment || {}),
          action_points: JSON.stringify(l.action_points),
          question: l.question,
          quote: l.quote,
          quote_author: l.quote_author,
        });
      }
    });

    seedAll();
    console.log(`✅ Seeded ${lessons.length} lessons into database`);
  }
}

/** Calculate and update user streak based on checkins */
export function recalcUserStreak(userId: number): { streak: number; total: number; longest: number } {
  const database = getDb();

  const checkins = database.prepare(
    'SELECT DISTINCT date(checked_at) as check_date FROM checkins WHERE user_id = ? ORDER BY check_date DESC'
  ).all(userId) as { check_date: string }[];

  const total = database.prepare(
    'SELECT COUNT(*) as c FROM checkins WHERE user_id = ?'
  ).get(userId) as { c: number };

  if (checkins.length === 0) {
    database.prepare('UPDATE users SET streak = 0 WHERE id = ?').run(userId);
    return { streak: 0, total: total.c, longest: 0 };
  }

  // Calculate current streak
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < checkins.length; i++) {
    const checkDate = new Date(checkins[i].check_date + 'T00:00:00');
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);

    if (checkDate.getTime() === expected.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  // Calculate longest streak
  let longest = 0;
  let currentRun = 1;
  for (let i = 1; i < checkins.length; i++) {
    const prev = new Date(checkins[i - 1].check_date + 'T00:00:00');
    const curr = new Date(checkins[i].check_date + 'T00:00:00');
    const diffDays = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays === 1) {
      currentRun++;
    } else {
      longest = Math.max(longest, currentRun);
      currentRun = 1;
    }
  }
  longest = Math.max(longest, currentRun, streak);

  database.prepare(
    'UPDATE users SET streak = ?, total_checkins = ?, longest_streak = MAX(longest_streak, ?) WHERE id = ?'
  ).run(streak, total.c, longest, userId);

  return { streak, total: total.c, longest: Math.max(longest, streak) };
}
