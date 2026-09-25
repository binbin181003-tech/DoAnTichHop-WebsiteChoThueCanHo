// Tạo danh sách tag cho tin đăng bằng Gemini API (Google AI Studio).

export async function generateListingTags({ title, description, address, price, area, category, images }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('AI tags: thiếu GEMINI_API_KEY; đăng tin không có tag.');
    return [];
  }

  try {
    const parts = [{ text: [
      'Đọc đầy đủ ba nguồn: tiêu đề, mô tả ngắn, rồi tất cả ảnh của tin bất động sản.',
      'Tạo tối đa 10 tag tiếng Việt ngắn (ưu tiên 6-10 nếu có đủ đặc điểm rõ ràng). Chọn tag đa dạng từ mô tả và những chi tiết nhìn thấy rõ trong ảnh; chỉ dùng số tầng, vị trí hoặc công năng khi văn bản ghi rõ. Ảnh một căn phòng không chứng minh số tầng của cả ngôi nhà.',
      'Không bịa, không gắn lại nguyên tiêu đề, không lặp ý giữa các tag. Nếu chỉ có ít thông tin đáng tin cậy, trả về ít tag hơn.',
      'Trả về JSON {"tags":["sàn gỗ","tủ quần áo","nhiều ánh sáng"]}. Không thêm dấu # hoặc lời giải thích.',
      JSON.stringify({ title, description, address, price, area, category })
    ].join('\n') }];

    // Form đăng tin gửi ảnh ở dạng data:image/...;base64,...
    for (const image of Array.isArray(images) ? images : []) {
      if (typeof image !== 'string') continue;
      const match = /^data:image\/(jpeg|png|webp|gif);base64,([A-Za-z0-9+/=]+)$/i.exec(image);
      if (match) parts.push({ inline_data: { mime_type: `image/${match[1].toLowerCase()}`, data: match[2] } });
    }

    const model = process.env.GEMINI_TAG_MODEL || 'gemini-3.8-flash';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 1536 }
      }),
      signal: AbortSignal.timeout(25000)
    });
    if (!response.ok) throw new Error(`Gemini HTTP ${response.status}`);
    const data = await response.json();
    const output = (data.candidates?.[0]?.content?.parts || []).map(part => part.text || '').join('');
    const parsed = JSON.parse(output);
    if (!Array.isArray(parsed.tags)) throw new Error('Gemini trả về tag không hợp lệ');

    const tags = [...new Set(parsed.tags
      .filter(tag => typeof tag === 'string')
      .map(tag => tag.replace(/^#+/, '').replace(/[\r\n#]/g, ' ').trim().replace(/\s+/g, ' '))
      .filter(tag => tag && tag.length <= 60))].slice(0, 10);
    if (tags.length) console.info(`AI tags: tạo ${tags.length} tag cho tin đăng.`);
    return tags;
  } catch (error) {
    console.warn('AI tags không khả dụng; đăng tin không có tag:', error.message);
    return [];
  }
}
