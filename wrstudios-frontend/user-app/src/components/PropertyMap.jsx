import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;
const DEFAULT_CENTER = [108.2022, 16.0544];
const coordinatePair = (latitude, longitude) => {
  if (latitude === null || latitude === undefined || latitude === '' || longitude === null || longitude === undefined || longitude === '') return null;
  const lat = Number(latitude), lng = Number(longitude);
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? [lng, lat] : null;
};

export default function PropertyMap({ latitude, longitude, editable = false, onChange }) {
  const container = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const callback = useRef(onChange);
  const initial = useRef(coordinatePair(latitude, longitude));
  const [error, setError] = useState('');
  callback.current = onChange;

  useEffect(() => {
    if (!TOKEN || !container.current) return undefined;
    let map, observer;
    const placeMarker = (pair) => {
      if (!markerRef.current) {
        markerRef.current = new mapboxgl.Marker({ color: '#e11d48', draggable: editable }).setLngLat(pair).addTo(map);
        if (editable) markerRef.current.on('dragend', () => {
          const point = markerRef.current.getLngLat();
          const lng = ((point.lng + 180) % 360 + 360) % 360 - 180;
          markerRef.current.setLngLat([lng, point.lat]);
          callback.current?.({ latitude: Number(point.lat.toFixed(7)), longitude: Number(lng.toFixed(7)) });
        });
      } else markerRef.current.setLngLat(pair);
    };
    try {
      map = new mapboxgl.Map({ container: container.current, accessToken: TOKEN,
        style: 'mapbox://styles/mapbox/streets-v12', center: initial.current || DEFAULT_CENTER,
        zoom: initial.current ? 15 : 11, attributionControl: true });
      mapRef.current = map;
      map.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.on('load', () => { map.resize(); });
      map.on('error', () => setError('Không tải được bản đồ. Kiểm tra kết nối và token Mapbox.'));
      if (initial.current) placeMarker(initial.current);
      if (editable) {
        map.getCanvas().style.cursor = 'crosshair';
        map.on('click', event => {
          const lng = ((event.lngLat.lng + 180) % 360 + 360) % 360 - 180;
          const pair = [lng, event.lngLat.lat];
          placeMarker(pair);
          callback.current?.({ latitude: Number(pair[1].toFixed(7)), longitude: Number(pair[0].toFixed(7)) });
        });
      }
      if (typeof ResizeObserver !== 'undefined') {
        observer = new ResizeObserver(() => map.resize()); observer.observe(container.current);
      }
    } catch { setError('Trình duyệt không khởi tạo được bản đồ. Kiểm tra hỗ trợ WebGL và cấu hình Mapbox.'); }
    return () => {
      observer?.disconnect(); markerRef.current?.remove(); markerRef.current = null;
      map?.remove(); mapRef.current = null;
    };
  }, [editable]);

  useEffect(() => {
    const pair = coordinatePair(latitude, longitude);
    if (!pair) { markerRef.current?.remove(); markerRef.current = null; return; }
    if (markerRef.current) markerRef.current.setLngLat(pair);
    if (!editable && mapRef.current) mapRef.current.jumpTo({ center: pair });
  }, [latitude, longitude, editable]);

  if (!TOKEN) return <p className="text-sm text-gray-500">Bản đồ chưa được cấu hình. Bạn vẫn có thể sử dụng thông tin địa chỉ.</p>;
  return <div>
    <div ref={container} role="region" aria-label={editable ? 'Bản đồ chọn vị trí căn hộ' : 'Bản đồ vị trí căn hộ'}
      style={{ height: 300, width: '100%', borderRadius: 8, overflow: 'hidden' }} />
    {error && <p role="alert" className="text-sm text-red-600 mt-2">{error}</p>}
  </div>;
}
