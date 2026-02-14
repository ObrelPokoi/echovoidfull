const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'echovoid.db');

let db = null;
let dbReady = null;

function initDatabase() {
  if (dbReady) return dbReady;

  dbReady = new Promise(async (resolve, reject) => {
    try {
      console.log('[DB] Инициализация sql.js...');
      const SQL = await initSqlJs();
      console.log('[DB] sql.js загружен');

      if (fs.existsSync(DB_PATH)) {
        console.log('[DB] Загружаю существующую БД...');
        const buffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(buffer);
      } else {
        console.log('[DB] Создаю новую БД...');
        db = new SQL.Database();
      }

      // Создание таблиц
      const tables = [
        `CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          display_name TEXT,
          avatar_color TEXT DEFAULT '#8b5cf6',
          device_fingerprint TEXT NOT NULL,
          pattern_hash TEXT NOT NULL,
          voice_hash TEXT,
          registration_started_at INTEGER NOT NULL,
          registration_completed_at INTEGER,
          ritual_step INTEGER DEFAULT 0,
          ritual_token TEXT,
          is_verified INTEGER DEFAULT 0,
          is_online INTEGER DEFAULT 0,
          last_seen INTEGER,
          created_at INTEGER,
          ip_hash TEXT,
          screen_hash TEXT,
          timezone TEXT,
          browser_hash TEXT,
          canvas_fingerprint TEXT,
          webgl_fingerprint TEXT,
          audio_fingerprint TEXT,
          trust_score REAL DEFAULT 0.0
        )`,
        `CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          token TEXT UNIQUE NOT NULL,
          device_fingerprint TEXT,
          ip_hash TEXT,
          created_at INTEGER,
          expires_at INTEGER NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          from_user_id TEXT NOT NULL,
          to_user_id TEXT,
          room_id TEXT,
          content TEXT NOT NULL,
          message_type TEXT DEFAULT 'text',
          is_read INTEGER DEFAULT 0,
          created_at INTEGER
        )`,
        `CREATE TABLE IF NOT EXISTS rooms (
          id TEXT PRIMARY KEY,
          name TEXT,
          type TEXT DEFAULT 'direct',
          created_by TEXT,
          created_at INTEGER
        )`,
        `CREATE TABLE IF NOT EXISTS room_members (
          room_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          role TEXT DEFAULT 'member',
          joined_at INTEGER,
          PRIMARY KEY (room_id, user_id)
        )`,
        `CREATE TABLE IF NOT EXISTS contacts (
          user_id TEXT NOT NULL,
          contact_id TEXT NOT NULL,
          status TEXT DEFAULT 'pending',
          created_at INTEGER,
          PRIMARY KEY (user_id, contact_id)
        )`,
        `CREATE TABLE IF NOT EXISTS fingerprint_registry (
          fingerprint_hash TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          fingerprint_type TEXT NOT NULL,
          created_at INTEGER
        )`,
        `CREATE TABLE IF NOT EXISTS ritual_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          step INTEGER NOT NULL,
          step_name TEXT NOT NULL,
          step_data TEXT,
          completed_at INTEGER
        )`,
        `CREATE TABLE IF NOT EXISTS invites (
          code TEXT PRIMARY KEY,
          created_by TEXT,
          used_by TEXT,
          is_used INTEGER DEFAULT 0,
          created_at INTEGER,
          expires_at INTEGER
        )`
      ];

      for (const sql of tables) {
        db.run(sql);
      }

      saveDb();
      console.log('[DB] База данных готова');
      resolve(db);
    } catch (err) {
      console.error('[DB] ОШИБКА:', err);
      reject(err);
    }
  });

  return dbReady;
}

function saveDb() {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  } catch (err) {
    console.error('[DB] Ошибка сохранения:', err);
  }
}

function runQuery(sql, params = []) {
  if (!db) {
    console.error('[DB] БД не инициализирована! Запрос:', sql);
    return;
  }
  try {
    db.run(sql, params);
    saveDb();
  } catch (err) {
    console.error('[DB] Ошибка запроса:', sql, err.message);
  }
}

function getOne(sql, params = []) {
  if (!db) {
    console.error('[DB] БД не инициализирована! Запрос:', sql);
    return null;
  }
  try {
    const stmt = db.prepare(sql);
    if (params.length > 0) stmt.bind(params);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  } catch (err) {
    console.error('[DB] Ошибка запроса:', sql, err.message);
    return null;
  }
}

function getAll(sql, params = []) {
  if (!db) {
    console.error('[DB] БД не инициализирована! Запрос:', sql);
    return [];
  }
  try {
    const results = [];
    const stmt = db.prepare(sql);
    if (params.length > 0) stmt.bind(params);
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  } catch (err) {
    console.error('[DB] Ошибка запроса:', sql, err.message);
    return [];
  }
}

module.exports = { initDatabase, saveDb, runQuery, getOne, getAll };