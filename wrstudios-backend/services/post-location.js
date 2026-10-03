// Missing coordinates are optional. Never coerce blanks into (0, 0).
export function parsePostLocation(body) {
  const empty = value => value === undefined || value === null || value === '';
  if (empty(body.latitude) && empty(body.longitude)) return { latitude: null, longitude: null };
  const valid = value => (typeof value === 'number' || (typeof value === 'string' && value.trim() !== '')) && Number.isFinite(Number(value));
  if (!valid(body.latitude) || !valid(body.longitude)) throw new Error('Vui lòng cung cấp đủ vĩ độ và kinh độ hợp lệ.');
  const latitude = Number(body.latitude), longitude = Number(body.longitude);
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) throw new Error('Tọa độ nằm ngoài phạm vi hợp lệ.');
  return { latitude, longitude };
}
