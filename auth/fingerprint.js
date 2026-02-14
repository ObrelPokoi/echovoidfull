const crypto = require('crypto');
const { runQuery, getOne, getAll } = require('../database');

// ============================================================
// РЕЖИМ РАЗРАБОТКИ — поставь false когда выпустишь в продакшн
// ============================================================
const DEV_MODE = true;

class FingerprintManager {

  static generateCompositeFingerprint(data) {
    const components = [
      data.screenResolution || '',
      data.colorDepth || '',
      data.timezone || '',
      data.language || '',
      data.platform || '',
      data.hardwareConcurrency || '',
      data.deviceMemory || '',
      data.canvasFingerprint || '',
      data.webglFingerprint || '',
      data.audioFingerprint || '',
      data.fonts || '',
      data.plugins || '',
      data.touchSupport || '',
      data.webglVendor || '',
      data.webglRenderer || ''
    ];

    return crypto
      .createHash('sha256')
      .update(components.join('|||'))
      .digest('hex');
  }

  static checkExistingFingerprint(fingerprintHash) {
    // В режиме разработки — не блокируем повторную регистрацию
    if (DEV_MODE) {
      console.log('[DEV] Проверка fingerprint пропущена (DEV_MODE = true)');
      return null;
    }

    return getOne(
      'SELECT user_id, fingerprint_type FROM fingerprint_registry WHERE fingerprint_hash = ?',
      [fingerprintHash]
    );
  }

  static checkSimilarDevice(data) {
    // В режиме разработки — не блокируем похожие устройства
    if (DEV_MODE) {
      console.log('[DEV] Проверка похожих устройств пропущена (DEV_MODE = true)');
      return { isSuspicious: false, score: 0, matches: [] };
    }

    const checks = [];

    if (data.canvasFingerprint) {
      const h = crypto.createHash('sha256').update(data.canvasFingerprint).digest('hex');
      const match = getOne('SELECT user_id FROM users WHERE canvas_fingerprint = ?', [h]);
      if (match) checks.push({ type: 'canvas', userId: match.user_id, weight: 0.35 });
    }

    if (data.webglFingerprint) {
      const h = crypto.createHash('sha256').update(data.webglFingerprint).digest('hex');
      const match = getOne('SELECT user_id FROM users WHERE webgl_fingerprint = ?', [h]);
      if (match) checks.push({ type: 'webgl', userId: match.user_id, weight: 0.25 });
    }

    if (data.audioFingerprint) {
      const h = crypto.createHash('sha256').update(data.audioFingerprint).digest('hex');
      const match = getOne('SELECT user_id FROM users WHERE audio_fingerprint = ?', [h]);
      if (match) checks.push({ type: 'audio', userId: match.user_id, weight: 0.2 });
    }

    if (data.screenResolution && data.timezone) {
      const h = crypto.createHash('sha256')
        .update(`${data.screenResolution}:${data.timezone}:${data.hardwareConcurrency}:${data.deviceMemory}`)
        .digest('hex');
      const match = getOne('SELECT user_id FROM users WHERE screen_hash = ?', [h]);
      if (match) checks.push({ type: 'screen', userId: match.user_id, weight: 0.2 });
    }

    const scores = {};
    for (const c of checks) {
      if (!scores[c.userId]) scores[c.userId] = 0;
      scores[c.userId] += c.weight;
    }

    for (const [uid, score] of Object.entries(scores)) {
      if (score > 0.6) {
        return { isSuspicious: true, existingUserId: uid, score, matches: checks };
      }
    }

    return { isSuspicious: false, score: 0, matches: checks };
  }

  static registerFingerprint(userId, fingerprintHash, type = 'composite') {
    runQuery(
      'INSERT OR REPLACE INTO fingerprint_registry (fingerprint_hash, user_id, fingerprint_type, created_at) VALUES (?, ?, ?, ?)',
      [fingerprintHash, userId, type, Math.floor(Date.now() / 1000)]
    );
  }

  static hashIP(ip) {
    return crypto
      .createHash('sha256')
      .update(ip + 'echovoid_salt_2024')
      .digest('hex');
  }
}

module.exports = FingerprintManager;