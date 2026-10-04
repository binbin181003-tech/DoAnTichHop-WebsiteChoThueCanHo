import React, { useEffect, useRef, useState } from 'react';
export default function EmailOtpForm({ email, initialCooldown, onClose, onBack, onResend, onVerify }) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('Vui lòng kiểm tra hộp thư và mục thư rác.');
  const [seconds, setSeconds] = useState(initialCooldown);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  useEffect(() => {
    const timer = setInterval(() => setSeconds(value => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, []);
  const perform = async (action) => {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError(''); setNotice('');
    try {
      const result = await action();
      if (!result.success) setError(result.message || 'Yêu cầu thất bại.');
      return result;
    } catch { setError('Không kết nối được backend. Vui lòng thử lại.'); }
    finally { pending.current = false; setBusy(false); }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
        <button type="button" disabled={busy} onClick={onClose} aria-label="Đóng" className="absolute top-4 right-4 text-gray-500">✕</button>
        <h2 className="text-xl font-bold mb-4">Xác thực email</h2>
        <p className="text-sm text-gray-600 mb-4">Nhập mã 6 chữ số gửi tới <strong>{email}</strong>. Mã có hiệu lực trong 10 phút.</p>
        <form onSubmit={event => { event.preventDefault(); if (/^\d{6}$/.test(otp)) perform(() => onVerify(otp)); else setError('Vui lòng nhập đủ 6 chữ số.'); }}>
          <label htmlFor="registration-otp" className="block text-sm mb-2">Mã xác thực</label>
          <input id="registration-otp" value={otp} onChange={event => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric" autoComplete="one-time-code" maxLength={6} required disabled={busy}
            className="w-full border rounded-lg px-4 py-3 text-center tracking-widest" />
          {error && <p role="alert" className="text-red-600 text-sm mt-3">{error}</p>}
          {notice && <p role="status" className="text-gray-600 text-sm mt-3">{notice}</p>}
          <button disabled={busy} type="submit" className="w-full bg-pink-500 text-white rounded-lg py-3 mt-4 disabled:opacity-50">{busy ? 'Đang xử lý...' : 'Xác nhận và tạo tài khoản'}</button>
        </form>
        <button type="button" disabled={busy || seconds > 0} className="text-pink-600 text-sm mt-4 disabled:text-gray-400" onClick={async () => {
          const result = await perform(onResend);
          if (result?.success) { setSeconds(result.resendAfter || 60); setOtp(''); setNotice('Đã yêu cầu gửi mã mới. Mã cũ không còn hiệu lực.'); }
        }}>{seconds > 0 ? `Gửi lại mã sau ${seconds}s` : 'Gửi lại mã'}</button>
        <button type="button" disabled={busy} className="block text-sm text-gray-600 mt-3" onClick={onBack}>Quay lại chỉnh thông tin</button>
      </div>
    </div>
  );
}
