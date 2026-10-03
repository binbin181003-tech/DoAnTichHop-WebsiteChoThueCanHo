import { randomInt, randomBytes, createHash, timingSafeEqual } from 'node:crypto';
export const normalizeEmail = value => typeof value === 'string' ? value.trim().toLowerCase() : '';
export class OtpError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
const digest = (salt, code) => createHash('sha256').update(`${salt}:${code}`).digest();
// Single backend process: restarting clears pending codes and rate limits.
export class RegistrationOtpStore {
  constructor({ now = Date.now, generate = () => String(randomInt(0, 1000000)).padStart(6, '0') } = {}) {
    this.now = now; this.generate = generate; this.entries = new Map(); this.limits = new Map();
  }
  async send(rawEmail, ip, deliver) {
    const email = normalizeEmail(rawEmail), now = this.now();
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new OtpError('Email không đúng định dạng.');
    for (const [key, entry] of this.entries) if (!entry.sending && !entry.claimed && entry.expires <= now) this.entries.delete(key);
    for (const [key, value] of this.limits) if (value.until <= now) this.limits.delete(key);
    const old = this.entries.get(email);
    if (old?.sending || old?.claimed || (old && now - old.sentAt < 60000)) throw new OtpError('Vui lòng chờ 60 giây trước khi gửi lại mã.', 429);
    const keys = [`email:${email}`, `ip:${ip}`];
    for (const key of keys) {
      const limit = this.limits.get(key);
      if (limit && limit.count >= (key.startsWith('email:') ? 5 : 20)) throw new OtpError('Đã vượt số lần gửi mã. Vui lòng thử lại sau một giờ.', 429);
    }
    if (this.entries.size >= 5000 || this.limits.size >= 10000) throw new OtpError('Hệ thống đang bận. Vui lòng thử lại sau.', 503);
    // Reserve quotas before awaiting SMTP; failed requests also count to prevent abuse.
    for (const key of keys) {
      const limit = this.limits.get(key) || { count: 0, until: now + 3600000 };
      limit.count++; this.limits.set(key, limit);
    }
    const code = this.generate(), salt = randomBytes(16).toString('hex');
    const entry = { sending: true, sentAt: now, expires: now + 600000, attempts: 0, salt, hash: digest(salt, code), claimed: false };
    this.entries.set(email, entry);
    try {
      await deliver(email, code);
      entry.sending = false; entry.sentAt = this.now(); entry.expires = this.now() + 600000;
    } catch (error) {
      if (old) this.entries.set(email, old); else this.entries.delete(email);
      throw error;
    }
    return { email, expiresIn: 600, resendAfter: 60 };
  }
  claim(rawEmail, code) {
    const email = normalizeEmail(rawEmail), entry = this.entries.get(email);
    if (!entry || entry.expires <= this.now()) { this.entries.delete(email); throw new OtpError('Mã không tồn tại hoặc đã hết hạn. Vui lòng gửi lại mã.'); }
    if (entry.sending || entry.claimed) throw new OtpError('Yêu cầu đang được xử lý. Vui lòng thử lại sau.', 409);
    if (entry.attempts >= 5) throw new OtpError('Đã nhập sai quá 5 lần. Vui lòng gửi lại mã.');
    entry.attempts++;
    if (typeof code !== 'string' || !/^\d{6}$/.test(code) || !timingSafeEqual(entry.hash, digest(entry.salt, code))) throw new OtpError('Mã xác thực không đúng.');
    entry.claimed = true;
    let finished = false;
    return success => {
      if (finished) return; finished = true;
      if (success) this.entries.delete(email); else { entry.claimed = false; entry.attempts--; }
    };
  }
}
