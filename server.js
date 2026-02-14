// server.js — EchoVoid: FULL + Gmail SMTP (Fix: Instant Response)

const express      = require('express');
const http         = require('http');
const WebSocket    = require('ws');
const path         = require('path');
const crypto       = require('crypto');
const fs           = require('fs');
const multer       = require('multer');
const cookieParser = require('cookie-parser');
const nodemailer   = require('nodemailer');

// UUID
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ============================
// GMAIL НАСТРОЙКИ — ЗАПОЛНИ!
// ============================
const GMAIL_USER = 'mziggboy@gmail.com';        // <--- ВПИШИ СЮДА СВОЙ EMAIL
const GMAIL_PASS = 'yypp khoi tfau eamc';         // <--- ВПИШИ СЮДА ПАРОЛЬ ПРИЛОЖЕНИЯ

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS
  }
});

// Проверяем подключение
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Gmail SMTP ошибка подключения:', error.message);
  } else {
    console.log('✅ Gmail SMTP готов к отправке писем');
  }
});

// === DATABASE ===
const sqlite3 = require('sqlite3').verbose();
const dbFile = path.join(__dirname, 'database.sqlite');
let db;

function initDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbFile, (err) => {
      if (err) return reject(err);
      db.serialize(() => {
        // Создаем таблицы (ошибки duplicate column игнорируем)
        const tables = [
          `CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT UNIQUE, email TEXT UNIQUE, display_name TEXT, avatar_url TEXT, bio TEXT DEFAULT '', is_online INTEGER DEFAULT 0, last_seen INTEGER, created_at INTEGER)`,
          `CREATE TABLE IF NOT EXISTS otp_codes (email TEXT PRIMARY KEY, code TEXT, expires_at INTEGER)`,
          `CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, user_id TEXT, token TEXT UNIQUE, created_at INTEGER, device_info TEXT)`,
          `CREATE TABLE IF NOT EXISTS rooms (id TEXT PRIMARY KEY, type TEXT, name TEXT, description TEXT, avatar_url TEXT, created_by TEXT, created_at INTEGER)`,
          `CREATE TABLE IF NOT EXISTS room_members (room_id TEXT, user_id TEXT, role TEXT DEFAULT 'member', joined_at INTEGER, PRIMARY KEY (room_id, user_id))`,
          `CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, from_user_id TEXT, room_id TEXT, content TEXT, message_type TEXT DEFAULT 'text', file_url TEXT, file_name TEXT, file_size INTEGER, duration INTEGER DEFAULT 0, created_at INTEGER, is_read INTEGER DEFAULT 0)`,
          `CREATE TABLE IF NOT EXISTS contacts (user_id TEXT, contact_id TEXT, room_id TEXT, status TEXT DEFAULT 'accepted', created_at INTEGER, PRIMARY KEY (user_id, contact_id))`,
          `CREATE TABLE IF NOT EXISTS avatar_history (id TEXT PRIMARY KEY, user_id TEXT, url TEXT, created_at INTEGER)`
        ];
        tables.forEach(t => db.run(t));
        resolve();
      });
    });
  });
}

function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        // Игнорируем ошибки дубликатов колонок при миграциях
        if (err.message.includes('duplicate column')) return resolve(this);
        console.error('❌ SQL Error:', err.message);
        reject(err);
      } else resolve(this);
    });
  });
}
function getOne(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err); else resolve(row);
    });
  });
}
function getAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err); else resolve(rows || []);
    });
  });
}

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.set('trust proxy', 1);
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// === UPLOADS ===
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.bin';
    cb(null, `${Date.now()}-${uuidv4()}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

function getMessageType(mimetype) {
  if (!mimetype) return 'file';
  if (mimetype === 'image/gif') return 'gif';
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('audio/')) return 'voice';
  return 'file';
}
function getFileIcon(filename) {
  const ext = path.extname(filename || '').toLowerCase();
  const icons = {'.pdf':'📄','.doc':'📝','.docx':'📝','.xls':'📊','.xlsx':'📊','.txt':'📃','.zip':'📦','.rar':'📦'};
  return icons[ext] || '📎';
}

// === WS ===
const connections = new Map();
function notifyUser(userId, data) {
  if (connections.has(userId)) {
    const msg = JSON.stringify(data);
    for (const ws of connections.get(userId)) {
      if (ws.readyState === WebSocket.OPEN) ws.send(msg);
    }
  }
}

// AUTH MIDDLEWARE
async function requireAuth(req, res, next) {
  const token = req.cookies?.session_token || req.headers['x-session-token'];
  if (!token) return res.status(401).json({ error: 'Требуется вход' });
  try {
    const session = await getOne(`
      SELECT s.user_id, u.username, u.display_name, u.avatar_url, u.email, u.bio
      FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ?
    `, [token]);
    if (!session) return res.status(401).json({ error: 'Сессия не найдена' });
    req.userId = session.user_id;
    req.user = session;
    next();
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

async function getOrCreateDirectRoom(userId1, userId2) {
  const existing = await getOne(`
    SELECT rm1.room_id FROM room_members rm1
    JOIN room_members rm2 ON rm1.room_id = rm2.room_id
    JOIN rooms r ON r.id = rm1.room_id
    WHERE rm1.user_id = ? AND rm2.user_id = ? AND r.type = 'direct'
  `, [userId1, userId2]);
  if (existing) return existing.room_id;
  const roomId = uuidv4();
  const now = Math.floor(Date.now() / 1000);
  await runQuery("INSERT INTO rooms (id,type,created_by,created_at) VALUES (?,'direct',?,?)", [roomId, userId1, now]);
  await runQuery("INSERT INTO room_members (room_id,user_id,role,joined_at) VALUES (?,?,'member',?)", [roomId, userId1, now]);
  await runQuery("INSERT INTO room_members (room_id,user_id,role,joined_at) VALUES (?,?,'member',?)", [roomId, userId2, now]);
  return roomId;
}

// ============ MAIN ============
async function main() {
  await initDatabase();
  console.log('✅ Database initialized');

  const migrations = [
    "ALTER TABLE contacts ADD COLUMN room_id TEXT",
    "ALTER TABLE sessions ADD COLUMN device_info TEXT",
    "ALTER TABLE rooms ADD COLUMN name TEXT",
    "ALTER TABLE rooms ADD COLUMN description TEXT",
    "ALTER TABLE rooms ADD COLUMN avatar_url TEXT",
    "ALTER TABLE room_members ADD COLUMN role TEXT DEFAULT 'member'",
    "ALTER TABLE messages ADD COLUMN file_url TEXT",
    "ALTER TABLE messages ADD COLUMN file_name TEXT",
    "ALTER TABLE messages ADD COLUMN file_size INTEGER",
    "ALTER TABLE messages ADD COLUMN duration INTEGER DEFAULT 0",
    "ALTER TABLE users ADD COLUMN bio TEXT DEFAULT ''"
  ];
  for (const m of migrations) { try { await runQuery(m); } catch(e) {} }

  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║   EchoVoid Server — Gmail SMTP (Fix)         ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  // ========== SEND CODE (ИСПРАВЛЕНО) ==========
  app.post('/api/auth/send-code', async (req, res) => {
    console.log('📧 POST /api/auth/send-code');
    try {
      const { email } = req.body;
      if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Некорректный email' });
      }
      const emailClean = email.toLowerCase().trim();
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Math.floor(Date.now() / 1000) + 300;

      await runQuery(
        'INSERT OR REPLACE INTO otp_codes (email, code, expires_at) VALUES (?,?,?)',
        [emailClean, code, expiresAt]
      );

      console.log(`🔑 CODE: ${emailClean} → ${code}`);

      // ВАЖНО: Сразу отвечаем клиенту, чтобы сайт не висел!
      res.json({ success: true });

      // Отправляем письмо В ФОНЕ (после ответа)
      transporter.sendMail({
        from: `"EchoVoid" <${GMAIL_USER}>`,
        to: emailClean,
        subject: '🔐 Код входа EchoVoid',
        html: `
          <div style="font-family:system-ui,sans-serif;padding:30px;background:#0a0a0f;color:#f9fafb;border-radius:12px">
            <h2 style="color:#e5e7eb;margin-bottom:16px">Ваш код для входа в EchoVoid</h2>
            <div style="font-size:36px;font-weight:700;letter-spacing:8px;color:#a855f7;
                        background:#1a1a2e;padding:20px;border-radius:8px;text-align:center;
                        margin:20px 0">${code}</div>
            <p style="color:#9ca3af;font-size:14px">Код действует 5 минут.</p>
          </div>
        `
      }).then(() => {
        console.log('✅ Email успешно отправлен на:', emailClean);
      }).catch(e => {
        console.error('❌ Ошибка отправки Email:', e.message);
      });

    } catch (e) {
      console.error('❌ Send code error:', e);
      // Если еще не ответили, то отвечаем ошибкой
      if (!res.headersSent) res.status(500).json({ error: 'Ошибка сервера' });
    }
  });

  // ========== LOGIN ==========
  app.post('/api/auth/login-email', async (req, res) => {
    try {
      const { email, code } = req.body;
      const emailClean = (email || '').toLowerCase().trim();
      const valid = await getOne(
        'SELECT * FROM otp_codes WHERE email=? AND code=? AND expires_at>?',
        [emailClean, code, Math.floor(Date.now() / 1000)]
      );
      if (!valid) return res.status(400).json({ error: 'Неверный или просроченный код' });

      let user = await getOne('SELECT * FROM users WHERE email=?', [emailClean]);
      if (!user) {
        const userId = uuidv4();
        const base = emailClean.split('@')[0].replace(/[^a-z0-9_]/gi,'').toLowerCase() || 'user';
        let username = base; let c = 1;
        while (await getOne('SELECT id FROM users WHERE username=?', [username])) {
          username = `${base}${c}`; c++;
        }
        const now = Math.floor(Date.now() / 1000);
        await runQuery(
          'INSERT INTO users (id,username,email,display_name,is_online,created_at) VALUES (?,?,?,?,1,?)',
          [userId, username, emailClean, username, now]
        );
        user = { id: userId, username, email: emailClean, display_name: username, avatar_url: null, bio: '' };
      } else {
        await runQuery('UPDATE users SET is_online=1 WHERE id=?', [user.id]);
      }

      await runQuery('DELETE FROM otp_codes WHERE email=?', [emailClean]);

      const sessionToken = crypto.randomBytes(48).toString('hex');
      await runQuery(
        'INSERT INTO sessions (id,user_id,token,created_at) VALUES (?,?,?,?)',
        [uuidv4(), user.id, sessionToken, Math.floor(Date.now() / 1000)]
      );

      res.cookie('session_token', sessionToken, {
        httpOnly: false, secure: false, sameSite: 'lax',
        maxAge: 10 * 365 * 24 * 60 * 60 * 1000
      });

      res.json({
        success: true,
        user: {
          id: user.id, username: user.username, email: user.email,
          display_name: user.display_name, avatar_url: user.avatar_url, bio: user.bio || ''
        }
      });
    } catch (e) {
      console.error('❌ Login error:', e);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  });

  // ========== ME / LOGOUT ==========
  app.get('/api/auth/me', requireAuth, async (req, res) => {
    const user = await getOne('SELECT id,username,email,display_name,avatar_url,bio FROM users WHERE id=?', [req.userId]);
    if (!user) return res.status(401).json({ authenticated: false });
    res.json({ authenticated: true, user });
  });

  app.post('/api/auth/logout', requireAuth, async (req, res) => {
    const token = req.cookies?.session_token;
    if (token) await runQuery('DELETE FROM sessions WHERE token=?', [token]);
    res.clearCookie('session_token');
    res.json({ success: true });
  });

  // ========== PROFILE ==========
  app.post('/api/profile/update', requireAuth, async (req, res) => {
    try {
      const { display_name, username } = req.body;
      if (username !== undefined) {
        const clean = (username||'').toLowerCase().replace(/[^a-z0-9_]/g,'');
        if (clean.length < 3) return res.status(400).json({ error: 'Username минимум 3 символа' });
        const taken = await getOne('SELECT id FROM users WHERE username=? AND id!=?', [clean, req.userId]);
        if (taken) return res.status(400).json({ error: 'Username занят' });
        await runQuery('UPDATE users SET username=? WHERE id=?', [clean, req.userId]);
      }
      if (display_name !== undefined) {
        await runQuery('UPDATE users SET display_name=? WHERE id=?', [(display_name||'').trim().substring(0,32), req.userId]);
      }
      const updated = await getOne('SELECT username,display_name,avatar_url,bio FROM users WHERE id=?', [req.userId]);
      res.json({ success: true, ...updated });
    } catch (e) {
      res.status(500).json({ error: 'Ошибка' });
    }
  });

  app.post('/api/profile/avatar', requireAuth, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'Нет файла' });
      const url = `/uploads/${req.file.filename}`;
      const cur = await getOne('SELECT avatar_url FROM users WHERE id=?', [req.userId]);
      if (cur && cur.avatar_url) {
        await runQuery('INSERT INTO avatar_history (id,user_id,url,created_at) VALUES (?,?,?,?)',
          [uuidv4(), req.userId, cur.avatar_url, Math.floor(Date.now()/1000)]);
      }
      await runQuery('UPDATE users SET avatar_url=? WHERE id=?', [url, req.userId]);
      await runQuery('INSERT INTO avatar_history (id,user_id,url,created_at) VALUES (?,?,?,?)',
        [uuidv4(), req.userId, url, Math.floor(Date.now()/1000)]);
      res.json({ success: true, avatarUrl: url });
    } catch (e) {
      res.status(500).json({ error: 'Ошибка загрузки' });
    }
  });

  app.post('/api/profile/bio', requireAuth, async (req, res) => {
    await runQuery('UPDATE users SET bio=? WHERE id=?', [(req.body.bio||'').trim().substring(0,200), req.userId]);
    res.json({ success: true });
  });

  app.get('/api/users/:userId/profile', requireAuth, async (req, res) => {
    try {
      const user = await getOne(
        "SELECT id,username,display_name,avatar_url,COALESCE(bio,'') as bio,is_online,last_seen,created_at FROM users WHERE id=?",
        [req.params.userId]
      );
      if (!user) return res.status(404).json({ error: 'Не найден' });
      let avatars = [];
      try { avatars = await getAll('SELECT url,created_at FROM avatar_history WHERE user_id=? ORDER BY created_at DESC LIMIT 20', [req.params.userId]); } catch {}
      res.json({ ...user, avatars });
    } catch (e) {
      res.status(500).json({ error: 'Ошибка' });
    }
  });

  // ========== CONTACTS ==========
  app.get('/api/contacts', requireAuth, async (req, res) => {
    try {
      const contacts = await getAll(`
        SELECT u.id AS contact_id, u.username, u.display_name, u.avatar_url, u.is_online, c.room_id,
          (SELECT content FROM messages WHERE room_id=c.room_id ORDER BY created_at DESC LIMIT 1) AS last_message,
          (SELECT message_type FROM messages WHERE room_id=c.room_id ORDER BY created_at DESC LIMIT 1) AS last_message_type,
          (SELECT created_at FROM messages WHERE room_id=c.room_id ORDER BY created_at DESC LIMIT 1) AS last_message_time,
          (SELECT COUNT(*) FROM messages WHERE room_id=c.room_id AND is_read=0 AND from_user_id!=?) AS unread_count
        FROM contacts c JOIN users u ON u.id=c.contact_id WHERE c.user_id=?
        UNION
        SELECT u.id AS contact_id, u.username, u.display_name, u.avatar_url, u.is_online, c.room_id,
          (SELECT content FROM messages WHERE room_id=c.room_id ORDER BY created_at DESC LIMIT 1) AS last_message,
          (SELECT message_type FROM messages WHERE room_id=c.room_id ORDER BY created_at DESC LIMIT 1) AS last_message_type,
          (SELECT created_at FROM messages WHERE room_id=c.room_id ORDER BY created_at DESC LIMIT 1) AS last_message_time,
          (SELECT COUNT(*) FROM messages WHERE room_id=c.room_id AND is_read=0 AND from_user_id!=?) AS unread_count
        FROM contacts c JOIN users u ON u.id=c.user_id WHERE c.contact_id=?
        ORDER BY last_message_time DESC
      `, [req.userId, req.userId, req.userId, req.userId]);
      res.json(contacts);
    } catch { res.json([]); }
  });

  app.post('/api/contacts/add', requireAuth, async (req, res) => {
    try {
      const { contactId } = req.body;
      if (!contactId) return res.status(400).json({ error: 'contactId обязателен' });
      if (contactId === req.userId) return res.status(400).json({ error: 'Нельзя добавить себя' });
      const exists = await getOne('SELECT id FROM users WHERE id=?', [contactId]);
      if (!exists) return res.status(404).json({ error: 'Не найден' });
      const roomId = await getOrCreateDirectRoom(req.userId, contactId);
      const now = Math.floor(Date.now()/1000);
      await runQuery("INSERT OR REPLACE INTO contacts (user_id,contact_id,room_id,status,created_at) VALUES (?,?,?,'accepted',?)", [req.userId, contactId, roomId, now]);
      await runQuery("INSERT OR REPLACE INTO contacts (user_id,contact_id,room_id,status,created_at) VALUES (?,?,?,'accepted',?)", [contactId, req.userId, roomId, now]);
      res.json({ success: true, roomId });
    } catch (e) {
      res.status(500).json({ error: 'Ошибка' });
    }
  });

  // ========== SEARCH ==========
  app.get('/api/users/search', requireAuth, async (req, res) => {
    const q = (req.query.q||'').trim();
    if (q.length < 2) return res.json([]);
    const s = q.startsWith('@') ? q.substring(1) : q;
    const users = await getAll(
      'SELECT id,username,display_name,avatar_url,is_online FROM users WHERE id!=? AND (username LIKE ? OR display_name LIKE ?) LIMIT 20',
      [req.userId, `%${s}%`, `%${s}%`]
    );
    res.json(users);
  });

  // ========== MESSAGES ==========
  app.get('/api/messages/:roomId', requireAuth, async (req, res) => {
    const member = await getOne('SELECT user_id FROM room_members WHERE room_id=? AND user_id=?', [req.params.roomId, req.userId]);
    if (!member) return res.status(403).json({ error: 'Нет доступа' });
    const msgs = await getAll(`
      SELECT m.*,u.username,u.display_name,u.avatar_url FROM messages m
      JOIN users u ON u.id=m.from_user_id WHERE m.room_id=?
      ORDER BY m.created_at DESC LIMIT 50
    `, [req.params.roomId]);
    res.json(msgs.reverse());
  });

  app.post('/api/messages/:roomId/read', requireAuth, async (req, res) => {
    await runQuery('UPDATE messages SET is_read=1 WHERE room_id=? AND from_user_id!=?', [req.params.roomId, req.userId]);
    res.json({ success: true });
  });

  app.post('/api/messages/upload', requireAuth, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'Файл не получен' });
      const roomId = req.body.roomId;
      if (!roomId) return res.status(400).json({ error: 'roomId обязателен' });
      const member = await getOne('SELECT user_id FROM room_members WHERE room_id=? AND user_id=?', [roomId, req.userId]);
      if (!member) return res.status(403).json({ error: 'Нет доступа' });

      let messageType = req.body.messageType;
      if (!messageType || messageType === 'auto') messageType = getMessageType(req.file.mimetype);
      const duration = parseInt(req.body.duration) || 0;
      const fileUrl = `/uploads/${req.file.filename}`;
      const msgId = uuidv4();
      const now = Math.floor(Date.now()/1000);

      await runQuery(
        'INSERT INTO messages (id,from_user_id,room_id,content,message_type,file_url,file_name,file_size,duration,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)',
        [msgId, req.userId, roomId, fileUrl, messageType, fileUrl, req.file.originalname, req.file.size, duration, now]
      );

      const user = await getOne('SELECT username,display_name,avatar_url FROM users WHERE id=?', [req.userId]);
      const outMsg = {
        type: 'new_message',
        message: {
          id: msgId, from_user_id: req.userId, room_id: roomId, content: fileUrl,
          message_type: messageType, file_url: fileUrl, file_name: req.file.originalname,
          file_size: req.file.size, duration, created_at: now,
          file_icon: messageType === 'file' ? getFileIcon(req.file.originalname) : null,
          username: user.username, display_name: user.display_name, avatar_url: user.avatar_url
        }
      };

      const members = await getAll('SELECT user_id FROM room_members WHERE room_id=?', [roomId]);
      members.forEach(m => notifyUser(m.user_id, outMsg));
      res.json({ success: true, url: fileUrl, messageId: msgId, message: outMsg.message });
    } catch (e) {
      res.status(500).json({ error: 'Ошибка: ' + e.message });
    }
  });

  // ========== WEBSOCKET ==========
  wss.on('connection', (ws) => {
    let userId = null;
    ws.on('message', async (data) => {
      try {
        const msg = JSON.parse(data);
        if (msg.type === 'auth') {
          const session = await getOne('SELECT user_id FROM sessions WHERE token=?', [msg.token]);
          if (session) {
            userId = session.user_id;
            if (!connections.has(userId)) connections.set(userId, new Set());
            connections.get(userId).add(ws);
            await runQuery('UPDATE users SET is_online=1 WHERE id=?', [userId]);
            ws.send(JSON.stringify({ type: 'auth_ok', userId }));
          } else ws.send(JSON.stringify({ type: 'auth_error' }));
        }
        if (msg.type === 'message' && userId) {
          const content = (msg.content||'').trim();
          const roomId = msg.roomId || msg.room_id;
          if (!content || !roomId) return;
          const member = await getOne('SELECT user_id FROM room_members WHERE room_id=? AND user_id=?', [roomId, userId]);
          if (!member) return;
          const msgId = uuidv4(), now = Math.floor(Date.now()/1000);
          await runQuery('INSERT INTO messages (id,from_user_id,room_id,content,message_type,created_at) VALUES (?,?,?,?,?,?)',
            [msgId, userId, roomId, content, 'text', now]);
          const user = await getOne('SELECT username,display_name,avatar_url FROM users WHERE id=?', [userId]);
          const out = {
            type: 'new_message',
            message: { id:msgId, from_user_id:userId, room_id:roomId, content, message_type:'text',
                       created_at:now, username:user.username, display_name:user.display_name, avatar_url:user.avatar_url }
          };
          const members = await getAll('SELECT user_id FROM room_members WHERE room_id=?', [roomId]);
          members.forEach(m => notifyUser(m.user_id, out));
        }
        if (msg.type === 'typing' && userId) {
          const roomId = msg.roomId || msg.room_id; if (!roomId) return;
          const user = await getOne('SELECT display_name,username FROM users WHERE id=?', [userId]);
          const members = await getAll('SELECT user_id FROM room_members WHERE room_id=? AND user_id!=?', [roomId, userId]);
          members.forEach(m => notifyUser(m.user_id, { type:'typing', userId, roomId, name:user.display_name||user.username }));
        }
      } catch(e) { console.error('WS Error:', e.message); }
    });
    ws.on('close', async () => {
      if (userId && connections.has(userId)) {
        connections.get(userId).delete(ws);
        if (connections.get(userId).size === 0) {
          connections.delete(userId);
          await runQuery('UPDATE users SET is_online=0,last_seen=? WHERE id=?', [Math.floor(Date.now()/1000), userId]);
        }
      }
    });
  });

  // FALLBACK
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    
    // KEEP-ALIVE для Render (пингует сам себя каждые 14 минут)
    if (process.env.RENDER) {
      const url = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
      setInterval(() => {
        // Используем fetch или http.get, чтобы не зависеть от Node версии
        http.get(url + '/api/auth/me', (res) => {
          // Игнорируем ответ, главное дернули сервер
        }).on('error', (e) => {});
      }, 14 * 60 * 1000); 
    }
  });
}

main().catch(err => { console.error('❌ Fatal:', err); process.exit(1); });