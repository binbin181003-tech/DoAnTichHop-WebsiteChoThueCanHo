import test from 'node:test';
import assert from 'node:assert/strict';
import { RegistrationOtpStore } from '../services/registration-otp-store.js';
const setup = () => {
  let time = 1000000, next = '012345';
  const store = new RegistrationOtpStore({ now: () => time, generate: () => next });
  return { store, advance: ms => { time += ms; }, code: value => { next = value; } };
};
const send = (s, deliver = async () => {}) => s.send('Test@gmail.com', 'local', deliver);
test('normalizes recipient and consumes code once', async () => {
  const {store} = setup(); let recipient, code;
  await send(store, async (e,c) => { recipient=e; code=c; });
  assert.equal(recipient,'test@gmail.com'); assert.equal(code,'012345');
  store.claim('test@gmail.com','012345')(true);
  assert.throws(() => store.claim('test@gmail.com','012345'));
});
test('expired code is rejected', async () => {
  const {store,advance} = setup(); await send(store); advance(600000);
  assert.throws(() => store.claim('test@gmail.com','012345'), /hết hạn/);
});
test('five wrong attempts block even correct code', async () => {
  const {store} = setup(); await send(store);
  for(let i=0;i<5;i++) assert.throws(() => store.claim('test@gmail.com','111111'));
  assert.throws(() => store.claim('test@gmail.com','012345'), /5 lần/);
});
test('cooldown enforced; resend invalidates old code', async () => {
  const {store,advance,code} = setup(); await send(store);
  await assert.rejects(send(store), /60 giây/);
  advance(60000); code('654321'); await send(store);
  assert.throws(() => store.claim('test@gmail.com','012345'));
  store.claim('test@gmail.com','654321')(true);
});
test('SMTP failure restores previous code', async () => {
  const {store,advance} = setup(); await send(store); advance(60000);
  await assert.rejects(send(store, async () => { throw new Error('SMTP failed'); }));
  store.claim('test@gmail.com','012345')(true);
});
test('database failure releases claim; concurrent use rejected', async () => {
  const {store} = setup(); await send(store);
  const finish = store.claim('test@gmail.com','012345');
  assert.throws(() => store.claim('test@gmail.com','012345'), /xử lý/);
  finish(false); store.claim('test@gmail.com','012345')(true);
});
test('parallel send rejected before SMTP completes', async () => {
  const {store} = setup(); let release;
  const pending = send(store, () => new Promise(resolve => {release=resolve;}));
  await assert.rejects(send(store), /60 giây/); release(); await pending;
});
test('email hourly quota and malformed addresses', async () => {
  const {store,advance} = setup();
  for(let i=0;i<5;i++) { await send(store); advance(60000); }
  await assert.rejects(send(store), /một giờ/);
  await assert.rejects(store.send('invalid','local',async()=>{}), /định dạng/);
});
