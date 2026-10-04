import React from 'react';
import PropertyMap from './PropertyMap';
export default function LocationPicker({ value, onChange }) {
  return <section className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">Vị trí trên bản đồ (không bắt buộc)</label>
    <p className="text-xs text-gray-500">Phóng to, bấm vào vị trí căn hộ để đặt ghim hoặc kéo ghim để điều chỉnh. Bản đồ ban đầu mở ở Đà Nẵng; chưa có vị trí nào được chọn. Địa chỉ nhập ở trên vẫn được giữ nguyên.</p>
    <PropertyMap editable latitude={value?.latitude} longitude={value?.longitude} onChange={onChange} />
    {value && <div className="flex items-center justify-between gap-2 text-xs text-gray-600">
      <span>Vĩ độ: {value.latitude} · Kinh độ: {value.longitude}</span>
      <button type="button" onClick={() => onChange(null)} className="text-red-600">Bỏ vị trí</button>
    </div>}
  </section>;
}
