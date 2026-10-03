import db from '../config/database.js';
import { RegistrationOtpStore, OtpError, normalizeEmail } from './registration-otp-store.js';
import { sendRegistrationEmail } from './registration-email.js';
const store = new RegistrationOtpStore();
export async function requestRegistrationCode(req, res) {
  try {
    const email = normalizeEmail(req.body?.email);
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new OtpError('Email không đúng định dạng.');
    const [users] = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (users.length) throw new OtpError('Email này đã được sử dụng.');
    const data = await store.send(email, req.ip, sendRegistrationEmail);
    res.json({ success: true, message: 'Yêu cầu gửi mã đã được xử lý. Vui lòng kiểm tra hộp thư và thư rác.', ...data });
  } catch (error) {
    if (!(error instanceof OtpError)) console.error('Gửi mã email thất bại:', error.code || 'SMTP_OR_DATABASE_ERROR');
    res.status(error.status || 503).json({ success: false, message: error instanceof OtpError ? error.message : 'Không gửi được mã. Vui lòng thử lại hoặc kiểm tra cấu hình Gmail trên backend.' });
  }
}
export function requireRegistrationCode(req, res, next) {
  try {
    req.body.email = normalizeEmail(req.body?.email);
    const finish = store.claim(req.body.email, req.body.otp);
    // Success consumes the code. A failed database write allows retry.
    res.once('finish', () => finish(res.statusCode === 201));
    res.once('close', () => finish(res.writableFinished && res.statusCode === 201));
    next();
  } catch (error) {
    res.status(error.status || 400).json({ success: false, message: error.message });
  }
}
