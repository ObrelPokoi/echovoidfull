const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { runQuery, getOne, getAll } = require('../database');

class RitualManager {

  static generateEchoPhrase() {
    const words = [
      'тень', 'пустота', 'эхо', 'свет', 'бездна', 'шёпот', 'волна',
      'туман', 'пепел', 'кристалл', 'вихрь', 'осколок', 'рассвет',
      'сумрак', 'пламя', 'лёд', 'буря', 'тишина', 'лунный', 'звёздный',
      'глубина', 'вечность', 'молния', 'зеркало', 'отражение', 'призрак',
      'ветер', 'обсидиан', 'аметист', 'нефрит', 'янтарь', 'опал',
      'кварц', 'оникс', 'рубин', 'сапфир', 'лазурит', 'малахит',
      'серебро', 'золото', 'медь', 'платина', 'ртуть', 'железо'
    ];

    const phrase = [];
    const usedIndices = new Set();

    for (let i = 0; i < 4; i++) {
      let idx;
      do {
        idx = crypto.randomInt(0, words.length);
      } while (usedIndices.has(idx));
      usedIndices.add(idx);
      phrase.push(words[idx]);
    }

    const number = crypto.randomInt(10, 99);
    phrase.splice(crypto.randomInt(0, phrase.length), 0, number.toString());

    return phrase.join('-');
  }

  static generateVoicePhrase() {
    const phrases = [
      "Я вхожу в пустоту и пустота принимает меня",
      "Эхо моего голоса станет моей печатью",
      "Тишина между словами хранит мою тайну",
      "Я отражение в зеркале без серебра",
      "Мой голос единственный ключ от пустоты",
      "Бездна слушает и бездна помнит",
      "Шёпот в темноте становится криком в свете",
      "Пустота не пуста когда в ней есть эхо",
      "Я тень которая отбрасывает свет",
      "Время застывает на пороге пустоты"
    ];

    return phrases[crypto.randomInt(0, phrases.length)];
  }

  static startRitual(userId, username, fingerprintData) {
    const ritualToken = uuidv4();
    const echoPhrase = this.generateEchoPhrase();
    const voicePhrase = this.generateVoicePhrase();
    const waitTime = crypto.randomInt(60, 300);

    const ritualData = {
      echoPhrase,
      voicePhrase,
      waitTime,
      patternHash: null,
      startedAt: Date.now()
    };

    runQuery(
      'UPDATE users SET ritual_step = 1, ritual_token = ?, registration_started_at = ? WHERE id = ?',
      [ritualToken, Math.floor(Date.now() / 1000), userId]
    );

    runQuery(
      'INSERT INTO ritual_logs (user_id, step, step_name, step_data, completed_at) VALUES (?, ?, ?, ?, ?)',
      [userId, 0, 'ritual_started', JSON.stringify(ritualData), Math.floor(Date.now() / 1000)]
    );

    return { ritualToken, echoPhrase, voicePhrase, waitTime, step: 1 };
  }

  static completeStep1(userId, ritualToken) {
    const user = getOne(
      'SELECT * FROM users WHERE id = ? AND ritual_token = ? AND ritual_step = 1',
      [userId, ritualToken]
    );

    if (!user) return { success: false, error: 'Недействительный ритуал' };

    const ritualLog = getOne(
      "SELECT step_data FROM ritual_logs WHERE user_id = ? AND step_name = 'ritual_started' ORDER BY completed_at DESC LIMIT 1",
      [userId]
    );

    if (!ritualLog) return { success: false, error: 'Данные ритуала не найдены' };

    const ritualData = JSON.parse(ritualLog.step_data);

    runQuery('UPDATE users SET ritual_step = 2 WHERE id = ?', [userId]);

    runQuery(
      'INSERT INTO ritual_logs (user_id, step, step_name, step_data, completed_at) VALUES (?, ?, ?, ?, ?)',
      [userId, 1, 'echo_phrase_shown', JSON.stringify({ echoPhrase: ritualData.echoPhrase }), Math.floor(Date.now() / 1000)]
    );

    return {
      success: true,
      step: 2,
      echoPhrase: ritualData.echoPhrase,
      message: 'Запомните эту эхо-фразу. Она понадобится на последнем шаге.'
    };
  }

  static completeStep2(userId, ritualToken, patternData) {
    const user = getOne(
      'SELECT * FROM users WHERE id = ? AND ritual_token = ? AND ritual_step = 2',
      [userId, ritualToken]
    );

    if (!user) return { success: false, error: 'Недействительный ритуал' };

    if (!patternData || patternData.length < 7) {
      return { success: false, error: 'Паттерн слишком простой. Минимум 7 точек.' };
    }

    const patternString = patternData.map(p => `${p.x},${p.y}`).join('|');
    const patternHash = crypto
      .createHash('sha256')
      .update(patternString + 'echovoid_pattern_salt')
      .digest('hex');

    const existingPattern = getOne(
      'SELECT id FROM users WHERE pattern_hash = ? AND id != ?',
      [patternHash, userId]
    );

    if (existingPattern) {
      return { success: false, error: 'Этот паттерн уже используется. Нарисуйте другой.' };
    }

    runQuery(
      'UPDATE users SET ritual_step = 3, pattern_hash = ? WHERE id = ?',
      [patternHash, userId]
    );

    runQuery(
      'INSERT INTO ritual_logs (user_id, step, step_name, step_data, completed_at) VALUES (?, ?, ?, ?, ?)',
      [userId, 2, 'pattern_created', JSON.stringify({ patternHash, pointCount: patternData.length }), Math.floor(Date.now() / 1000)]
    );

    const ritualLog = getOne(
      "SELECT step_data FROM ritual_logs WHERE user_id = ? AND step_name = 'ritual_started' ORDER BY completed_at DESC LIMIT 1",
      [userId]
    );

    const ritualData = JSON.parse(ritualLog.step_data);

    return {
      success: true,
      step: 3,
      voicePhrase: ritualData.voicePhrase,
      message: 'Паттерн сохранён. Теперь произнесите фразу.'
    };
  }

  static completeStep3(userId, ritualToken, voiceData) {
    const user = getOne(
      'SELECT * FROM users WHERE id = ? AND ritual_token = ? AND ritual_step = 3',
      [userId, ritualToken]
    );

    if (!user) return { success: false, error: 'Недействительный ритуал' };

    if (!voiceData || voiceData.length === 0) {
      return { success: false, error: 'Голосовая запись не получена' };
    }

    const voiceHash = crypto.createHash('sha256').update(voiceData).digest('hex');

    const ritualLog = getOne(
      "SELECT step_data FROM ritual_logs WHERE user_id = ? AND step_name = 'ritual_started' ORDER BY completed_at DESC LIMIT 1",
      [userId]
    );

    const ritualData = JSON.parse(ritualLog.step_data);
    const waitUntil = Math.floor(Date.now() / 1000) + ritualData.waitTime;

    runQuery(
      'UPDATE users SET ritual_step = 4, voice_hash = ? WHERE id = ?',
      [voiceHash, userId]
    );

    runQuery(
      'INSERT INTO ritual_logs (user_id, step, step_name, step_data, completed_at) VALUES (?, ?, ?, ?, ?)',
      [userId, 3, 'voice_recorded', JSON.stringify({ voiceHash, waitUntil }), Math.floor(Date.now() / 1000)]
    );

    const mins = Math.floor(ritualData.waitTime / 60);
    const secs = ritualData.waitTime % 60;

    return {
      success: true,
      step: 4,
      waitTime: ritualData.waitTime,
      waitUntil: waitUntil,
      message: `Голос записан. Подождите ${mins} мин. ${secs} сек.`
    };
  }

  static checkStep4(userId, ritualToken) {
    const user = getOne(
      'SELECT * FROM users WHERE id = ? AND ritual_token = ? AND ritual_step = 4',
      [userId, ritualToken]
    );

    if (!user) return { success: false, error: 'Недействительный ритуал' };

    const log = getOne(
      "SELECT step_data FROM ritual_logs WHERE user_id = ? AND step_name = 'voice_recorded' ORDER BY completed_at DESC LIMIT 1",
      [userId]
    );

    if (!log) return { success: false, error: 'Данные не найдены' };

    const data = JSON.parse(log.step_data);
    const now = Math.floor(Date.now() / 1000);

    if (now < data.waitUntil) {
      const remaining = data.waitUntil - now;
      return {
        success: false,
        step: 4,
        waiting: true,
        remainingSeconds: remaining,
        message: `Ещё не время. Осталось ${Math.floor(remaining / 60)} мин. ${remaining % 60} сек.`
      };
    }

    runQuery('UPDATE users SET ritual_step = 5 WHERE id = ?', [userId]);

    runQuery(
      'INSERT INTO ritual_logs (user_id, step, step_name, step_data, completed_at) VALUES (?, ?, ?, ?, ?)',
      [userId, 4, 'wait_completed', JSON.stringify({ completedAt: now }), now]
    );

    return {
      success: true,
      step: 5,
      message: 'Время ожидания прошло. Последний шаг — подтвердите свою идентичность.'
    };
  }

  static completeStep5(userId, ritualToken, echoPhrase, patternData) {
    const user = getOne(
      'SELECT * FROM users WHERE id = ? AND ritual_token = ? AND ritual_step = 5',
      [userId, ritualToken]
    );

    if (!user) return { success: false, error: 'Недействительный ритуал' };

    const ritualLog = getOne(
      "SELECT step_data FROM ritual_logs WHERE user_id = ? AND step_name = 'ritual_started' ORDER BY completed_at DESC LIMIT 1",
      [userId]
    );

    const ritualData = JSON.parse(ritualLog.step_data);

    if (echoPhrase !== ritualData.echoPhrase) {
      return { success: false, error: 'Неверная эхо-фраза. Ритуал провален.' };
    }

    const patternString = patternData.map(p => `${p.x},${p.y}`).join('|');
    const patternHash = crypto
      .createHash('sha256')
      .update(patternString + 'echovoid_pattern_salt')
      .digest('hex');

    if (patternHash !== user.pattern_hash) {
      return { success: false, error: 'Паттерн не совпадает. Ритуал провален.' };
    }

    runQuery(
      'UPDATE users SET is_verified = 1, ritual_step = 6, registration_completed_at = ? WHERE id = ?',
      [Math.floor(Date.now() / 1000), userId]
    );

    runQuery(
      'INSERT INTO ritual_logs (user_id, step, step_name, step_data, completed_at) VALUES (?, ?, ?, ?, ?)',
      [userId, 5, 'ritual_completed', JSON.stringify({ completedAt: Date.now() }), Math.floor(Date.now() / 1000)]
    );

    const inviteCode = this.generateInviteCode(userId);

    return {
      success: true,
      step: 6,
      inviteCode,
      message: 'Ритуал завершён. Добро пожаловать в EchoVoid.'
    };
  }

  static generateInviteCode(userId) {
    const code = 'EV-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    const expiresAt = Math.floor(Date.now() / 1000) + (30 * 24 * 3600);

    runQuery(
      'INSERT INTO invites (code, created_by, expires_at, created_at) VALUES (?, ?, ?, ?)',
      [code, userId, expiresAt, Math.floor(Date.now() / 1000)]
    );

    return code;
  }

  static validateInviteCode(code) {
    const invite = getOne(
      'SELECT * FROM invites WHERE code = ? AND is_used = 0',
      [code]
    );

    if (!invite) return { valid: false, error: 'Недействительный код приглашения' };

    const now = Math.floor(Date.now() / 1000);
    if (invite.expires_at && now > invite.expires_at) {
      return { valid: false, error: 'Срок действия кода истёк' };
    }

    return { valid: true, invite };
  }

  static useInviteCode(code, userId) {
    runQuery(
      'UPDATE invites SET is_used = 1, used_by = ? WHERE code = ?',
      [userId, code]
    );
  }
}

module.exports = RitualManager;