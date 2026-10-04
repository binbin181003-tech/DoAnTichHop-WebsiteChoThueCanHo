import React from 'react';
import PropertyMap from './PropertyMap';
export default function ListingMap({ latitude, longitude }) {
  if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
    return <p className="text-sm text-gray-500">Tin này chưa có vị trí trên bản đồ.</p>;
  }
  return <section className="mt-4 space-y-2">
    <h3 className="text-sm font-semibold text-gray-700">Vị trí căn hộ</h3>
    <PropertyMap latitude={latitude} longitude={longitude} />
    <p className="text-xs text-gray-500">Vị trí do người đăng tin cung cấp.</p>
  </section>;
}
