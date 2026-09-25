import { GoogleGenAI } from '@google/genai';
// Dùng cho test con AI nó có chạy ko thôi, không tham gia vào chương trình. Có thể xóa đi nếu muốn.
const ai = new GoogleGenAI({ apiKey: "AIzaSyAlf6xtvr1VI-jPIpPQEBUo0Y8VtYtDC1Q" });

async function run() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: 'Nhà 4 tầng ở Hội An, Nhà cao, đẹp, sáng sủa, không ồn ào, phù hợp với người già. Yêu cầu trả lại các thẻ tag # mang đặc điểm trong nội dung như #nhà 2 tầng #ABC...',
    });
    console.log("✅ KẾT QUẢ THÀNH CÔNG:", response.text);
  } catch (error) {
    console.error("❌ LỖI:", error);
  }
}

run();