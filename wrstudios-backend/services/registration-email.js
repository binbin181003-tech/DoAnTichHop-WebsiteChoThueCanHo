import nodemailer from 'nodemailer';
let transport;
export async function sendRegistrationEmail(email, code) {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS?.replace(/\s/g, '');
  if (!user || !pass) throw new Error('SMTP_NOT_CONFIGURED');
  transport ||= nodemailer.createTransport({
    host: 'smtp.gmail.com', port: 465, secure: true,
    auth: { user, pass }, connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000,
  });
  const result = await transport.sendMail({
    from: { name: 'WRStudios', address: user }, to: email,
    subject: 'Mã xác thực đăng ký WRStudios',
    text: `Mã xác thực của bạn là: ${code}\nMã có hiệu lực trong 10 phút. Không chia sẻ mã này với người khác.\nNếu bạn không đăng ký tài khoản, hãy bỏ qua thư này.`,
  });
  if (!result.accepted?.length || result.rejected?.length) throw new Error('SMTP_RECIPIENT_REJECTED');
}
