import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Helper to securely initialize the Gemini AI client
function getAI() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("Không tìm thấy GEMINI_API_KEY. Vui lòng cài đặt trong Settings > Secrets.");
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// Robust caller with exponential backoff and fallback model support to handle high-demand 503 issues
async function generateContentWithFallbackAndRetry(ai: any, params: any) {
  const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    let delay = 1000;
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Gemini] Calling with ${modelName} (Attempt ${attempt}/${maxRetries})...`);
        const response = await ai.models.generateContent({
          ...params,
          model: modelName,
        });
        return response;
      } catch (error: any) {
        lastError = error;
        console.warn(`[Gemini] Error with model ${modelName} on attempt ${attempt}:`, error);

        const errorMessage = String(error.message || "").toLowerCase();
        const errorStatus = error.status || (error.error && error.error.code) || 0;
        const isUnavailable = 
          errorMessage.includes("503") || 
          errorMessage.includes("unavailable") || 
          errorMessage.includes("rate limit") || 
          errorMessage.includes("demand") ||
          errorStatus === 503 ||
          errorStatus === 429;

        if (isUnavailable && attempt < maxRetries) {
          console.log(`[Gemini] Temporary overload. Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2.5;
        } else {
          break;
        }
      }
    }
  }

  throw lastError || new Error("Failed to generate content after trying multiple models.");
}

// API: Split story into structured script scenes
app.post("/api/split-script", async (req, res) => {
  try {
    const { story } = req.body;
    if (!story || typeof story !== "string") {
      return res.status(400).json({ error: "Nội dung câu chuyện không hợp lệ." });
    }

    const ai = getAI();
    const prompt = `Bạn là một chuyên gia hậu kỳ kịch bản truyện audio. Nhiệm vụ của bạn là tách câu chuyện dưới đây thành các phân cảnh kịch bản audio ngắn, gọn và mạch lạc theo đúng quy chuẩn sau:

QUY CHUẨN TÁCH KỊCH BẢN PHÂN CẢNH (BẮT BUỘC):
1. Giới Hạn Ký Tự: Mỗi phân cảnh BẮT BUỘC DƯỚI 250 KÝ TỰ, nhưng KHÔNG ĐƯỢC QUÁ NGẮN (tránh chỉ có 1 hành động/cảnh đơn lẻ cô độc).
2. Nguyên Tắc Ghép Câu: Nếu một câu gốc quá ngắn, bạn BẮT BUỘC phải ghép nó với câu tiếp theo để tạo thành một phân cảnh đầy đủ ý nghĩa, với điều kiện chúng CÙNG BỐI CẢNH và CÙNG THỜI ĐIỂM. Tuyệt đối không để các câu quá ngắn đứng độc lập.
3. Nguyên Tắc Ngắt Cảnh: Chỉ ngắt sang phân cảnh mới khi đoạn văn vừa ghép đã đạt giới hạn an toàn (gần 250 ký tự, khoảng 2 dòng), HOẶC có sự thay đổi rõ rệt về không gian hoặc thời gian bối cảnh.
4. Bảo Toàn Văn Bản (100%): Giữ nguyên văn các câu chữ trong câu chuyện gốc. Tuyệt đối KHÔNG ĐƯỢC tự ý thêm bớt, sửa đổi bất kỳ từ ngữ nào từ nguyên tác câu chuyện. Nhiệm vụ của bạn chỉ là "Cắt" và "Nối" các câu gốc lại với nhau thành các phân cảnh hợp lý.
5. Gắn Tag Nhân Vật: Sau mỗi phân cảnh được tách, bạn BẮT BUỘC viết tên những nhân vật xuất hiện hoặc có tương tác trong phân cảnh đó vào trong dấu ngoặc đơn ở cuối phân cảnh. Ví dụ: "(Lão phú ông, gia đinh)". Nếu đoạn tả ngoại cảnh không có ai xuất hiện, ghi: "(Không có nhân vật)".
6. Tuần tự: Liệt kê các phân cảnh theo đúng thứ tự cốt truyện của câu chuyện gốc từ đầu đến cuối. KHÔNG ĐƯỢC VỘI VÀNG MÀ SAI SÓT.

VĂN BẢN TRUYỆN GỐC:
"""
${story}
"""

Hãy trả về kết quả dưới dạng danh sách các phân cảnh dạng JSON.`;

    const response = await generateContentWithFallbackAndRetry(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              content: { type: Type.STRING, description: "Cảnh đầy đủ bao gồm tag nhân vật trong ngoặc đơn ở cuối" },
              textOnly: { type: Type.STRING, description: "Chỉ bao gồm văn bản gốc của cảnh, không có tag nhân vật" },
              characters: { type: Type.STRING, description: "Tên các nhân vật xuất hiện trong cảnh ngăn cách bởi dấu phẩy, hoặc 'Không có nhân vật'" }
            },
            required: ["id", "content", "textOnly", "characters"]
          }
        },
        temperature: 0.2,
      },
    });

    const result = JSON.parse(response.text || "[]");
    res.json(result);
  } catch (error: any) {
    console.error("Split script error:", error);
    res.status(500).json({ error: error.message || "Đã xảy ra lỗi khi tách kịch bản." });
  }
});

// API: Generate character/object/setting DNA based on current list of scenes
app.post("/api/generate-dna", async (req, res) => {
  try {
    const { scenes } = req.body;
    if (!scenes || !Array.isArray(scenes)) {
      return res.status(400).json({ error: "Danh sách phân cảnh không hợp lệ." });
    }

    const ai = getAI();
    const prompt = `Bạn là một chuyên gia thiết kế hình ảnh (ADN) cho phim hoạt hình Trung Quốc (Donghua). Dựa trên danh sách các phân cảnh kịch bản truyện sau đây, hãy rà soát và thiết lập hồ sơ ADN đồng nhất hình ảnh bằng TIẾNG ANH CHUYÊN SÂU cho các thực thể xuất hiện trong truyện.

QUY CHUẨN ĐỐI CHIẾU KHẮT KHE:
1. Rà soát từng phân cảnh. Nếu xuất hiện một nhân vật, đồ vật chính (Prop) hoặc bối cảnh (Setting) MỚI, bạn phải tạo hồ sơ ADN tương ứng bằng TIẾNG ANH.
2. Nếu đối tượng ĐÃ XUẤT HIỆN ở phân cảnh trước, bạn BẮT BUỘC phải dùng lại đúng ADN cũ để giữ tính nhất quán (Consistency), tuyệt đối không tạo ADN mới cho cùng một đối tượng.
3. Quy chuẩn ADN Nhân Vật (Character DNA):
   - Viết bằng tiếng Anh chuyên sâu, tối thiểu 250 từ mô tả cực kỳ chi tiết.
   - Face: Eye color, shape, expression, nose, lips, jawline, facial hair, hair (style, texture, accessories).
   - Body: Height, build, skin complexion.
   - Clothing: Detailed description from head to toe (inner/outer wear, footwear, jewelry, materials, state of wear, patterns).
   - STYLE BLOCK (BẮT BUỘC KẾT THÚC BẰNG): ", Chinese donghua animation style, manhua, modern 2D digital art, clean line art, semi-realistic character design, cel shading mixed with soft shading, muted earth tones palette, painterly background, atmospheric lighting, ancient China setting"
4. Quy chuẩn ADN Đồ Vật & Bối Cảnh (Object & Setting DNA):
   - Đồ vật (Objects): Material, color, signs of wear, unique markings (ví dụ: "a crack running down the left side...").
   - Bối cảnh (Setting): Lighting conditions, time of day, atmosphere, architecture style, key elements.

DANH SÁCH PHÂN CẢNH:
${JSON.stringify(scenes, null, 2)}

Hãy trả về danh sách hồ sơ ADN bằng JSON dưới dạng mảng các đối tượng.`;

    const response = await generateContentWithFallbackAndRetry(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING, description: "Tên của nhân vật, đồ vật hoặc bối cảnh bằng tiếng Việt" },
              type: { type: Type.STRING, description: "character, object, hoặc setting" },
              description: { type: Type.STRING, description: "Mô tả tiếng Anh chi tiết theo quy chuẩn (character bắt buộc kết thúc bằng style block và tối thiểu 250 từ)" }
            },
            required: ["id", "name", "type", "description"]
          }
        },
        temperature: 0.3,
      },
    });

    const result = JSON.parse(response.text || "[]");
    res.json(result);
  } catch (error: any) {
    console.error("Generate DNA error:", error);
    res.status(500).json({ error: error.message || "Đã xảy ra lỗi khi tạo ADN." });
  }
});

// API: Regenerate a single DNA Profile
app.post("/api/generate-single-dna", async (req, res) => {
  try {
    const { entityName, entityType, scenesContext } = req.body;
    if (!entityName || !entityType) {
      return res.status(400).json({ error: "Thông tin thực thể thiếu hoặc không hợp lệ." });
    }

    const ai = getAI();
    const prompt = `Bạn là một chuyên gia thiết kế hình ảnh (ADN) cho phim hoạt hình Trung Quốc (Donghua). Hãy tạo hồ sơ ADN đồng nhất hình ảnh bằng TIẾNG ANH CHUYÊN SÂU cho thực thể sau:

Tên thực thể: ${entityName}
Loại thực thể: ${entityType} (character, object, hoặc setting)

QUY CHUẨN THIẾT KẾ:
1. Quy chuẩn ADN Nhân Vật (Character DNA):
   - Viết bằng tiếng Anh chuyên sâu, tối thiểu 250 từ mô tả cực kỳ chi tiết.
   - Face: Eye color, shape, expression, nose, lips, jawline, facial hair, hair (style, texture, accessories).
   - Body: Height, build, skin complexion.
   - Clothing: Detailed description from head to toe (inner/outer wear, footwear, jewelry, materials, state of wear, patterns).
   - STYLE BLOCK (BẮT BUỘC KẾT THÚC BẰNG): ", Chinese donghua animation style, manhua, modern 2D digital art, clean line art, semi-realistic character design, cel shading mixed with soft shading, muted earth tones palette, painterly background, atmospheric lighting, ancient China setting"
2. Quy chuẩn ADN Đồ Vật & Bối Cảnh (Object & Setting DNA):
   - Đồ vật (Objects): Material, color, signs of wear, unique markings (ví dụ: "a crack running down the left side...").
   - Bối cảnh (Setting): Lighting conditions, time of day, atmosphere, architecture style, key elements.

BỐI CẢNH TRUYỆN THAM KHẢO (NẾU CÓ):
${JSON.stringify(scenesContext || [], null, 2)}

Hãy trả về một đối tượng JSON duy nhất có dạng:
{
  "id": "dna_${entityName.toLowerCase().replace(/\s+/g, '_')}",
  "name": "${entityName}",
  "type": "${entityType}",
  "description": "Nội dung mô tả bằng tiếng Anh chi tiết theo đúng chuẩn trên."
}`;

    const response = await generateContentWithFallbackAndRetry(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            type: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["id", "name", "type", "description"]
        },
        temperature: 0.4,
      }
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("Single DNA regeneration error:", error);
    res.status(500).json({ error: error.message || "Đã xảy ra lỗi khi tạo lại ADN." });
  }
});

// API: Parse and format custom-pasted DNA profiles
app.post("/api/parse-custom-dna", async (req, res) => {
  try {
    const { rawDnaText, scenes } = req.body;
    if (!rawDnaText || !rawDnaText.trim()) {
      return res.status(400).json({ error: "Nội dung ADN tự dán trống." });
    }

    const ai = getAI();
    const prompt = `Bạn là một chuyên gia thiết kế hình ảnh (ADN) cho kịch bản phim. Hãy nhận nội dung ADN tự nhập của người dùng dưới đây và phân tích, cấu trúc lại thành danh sách các hồ sơ ADN chuẩn mực dạng JSON.
Nếu người dùng viết sơ sài hoặc bằng tiếng Việt, hãy dịch các mô tả tạo hình sang tiếng Anh chuyên sâu chi tiết (thêm các chi tiết về tóc, khuôn mặt, trang phục, hoặc chất liệu, bối cảnh để tạo nên mô tả chất lượng cao nhất), đồng thời đảm bảo:
- Nhân vật (Character DNA) có mô tả tiếng Anh chi tiết và kết thúc bằng Style Block bắt buộc sau: ", Chinese donghua animation style, manhua, modern 2D digital art, clean line art, semi-realistic character design, cel shading mixed with soft shading, muted earth tones palette, painterly background, atmospheric lighting, ancient China setting"
- Đồ vật (Object DNA) và Bối cảnh (Setting DNA) được cấu trúc hóa rõ ràng bằng tiếng Anh.

DƯỚI ĐÂY LÀ NỘI DUNG ADN TỰ NHẬP CỦA NGƯỜI DÙNG:
"""
${rawDnaText}
"""

BỐI CẢNH KỊCH BẢN THAM KHẢO (NẾU CÓ):
${JSON.stringify(scenes || [], null, 2)}

Hãy phân tích và trả về danh sách hồ sơ ADN bằng JSON dưới dạng mảng các đối tượng chứa:
- id: chuỗi id duy nhất bắt đầu bằng "dna_" (ví dụ "dna_minh")
- name: tên thực thể (tiếng Việt có dấu nếu là tên nhân vật/bối cảnh gốc)
- type: "character" | "object" | "setting"
- description: nội dung mô tả bằng tiếng Anh chuẩn hóa chi tiết.`;

    const response = await generateContentWithFallbackAndRetry(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING, description: "Tên của nhân vật, đồ vật hoặc bối cảnh" },
              type: { type: Type.STRING, description: "character, object, hoặc setting" },
              description: { type: Type.STRING, description: "Mô tả tiếng Anh chi tiết theo quy chuẩn (character bắt buộc kết thúc bằng style block)" }
            },
            required: ["id", "name", "type", "description"]
          }
        },
        temperature: 0.3,
      },
    });

    const result = JSON.parse(response.text || "[]");
    res.json(result);
  } catch (error: any) {
    console.error("Parse custom DNA error:", error);
    res.status(500).json({ error: error.message || "Đã xảy ra lỗi khi phân tích và cấu trúc ADN tự nhập." });
  }
});

// API: Generate prompts for a batch of up to 6 scenes
app.post("/api/generate-prompts-batch", async (req, res) => {
  try {
    const { scenes, dnas } = req.body;
    if (!scenes || !Array.isArray(scenes)) {
      return res.status(400).json({ error: "Danh sách phân cảnh không hợp lệ." });
    }

    const ai = getAI();
    const prompt = `Bạn là một chuyên gia viết prompt tạo ảnh tự động cho phim hoạt hình Trung Quốc (Donghua). Hãy sử dụng dữ liệu Phân cảnh và Hồ Sơ ADN dưới đây để xây dựng prompt hình ảnh cho các phân cảnh được yêu cầu.

BỘ QUY TẮC SẢN XUẤT PROMPT TỰ ĐỘNG (BẮT BUỘC):
1. Quy tắc "Sao chép Gene" (ADN Integration):
   - Mỗi prompt BẮT BUỘC phải copy nguyên xi toàn bộ nội dung mô tả ADN (tiếng Anh) của nhân vật, đồ vật, bối cảnh xuất hiện trong phân cảnh đó vào đúng vị trí tương ứng. KHÔNG TÓM TẮT, KHÔNG VIẾT TẮT, KHÔNG THAY ĐỔI từ ngữ nào của ADN.
   - Nếu trong cảnh có nhân vật xuất hiện nhưng thiếu ADN tương ứng trong bộ dữ liệu ADN, tuyệt đối không xuất prompt hoặc để trống phần ADN Character đó.
2. Cấu trúc Prompt 11 phần (Strict Format):
   Sử dụng dấu gạch đứng | để phân tách chính xác 11 phần sau:
   Scene [Số thứ tự] | [Subject/Action/Expression] | ADN Character: [Chép y hệt 250+ từ mô tả ADN của nhân vật] | ADN Object/Setting: [Chép y hệt mô tả ADN của đồ vật hoặc bối cảnh] | Style: [ , Chinese donghua animation style, manhua, modern 2D digital art, clean line art, semi-realistic character design, cel shading mixed with soft shading, muted earth tones palette, painterly background, atmospheric lighting, ancient China setting] | Camera: [Shot/Angle/Move/Focus] | Setting: [Bối cảnh chi tiết của cảnh đó] | Mood: [Trạng thái cảm xúc] | Lighting: [Chi tiết ánh sáng] | Detail Level: [High resolution, 8k] | Composition: [Tỷ lệ khung hình và bố cục]

HỒ SƠ ADN ĐÃ CÓ:
${JSON.stringify(dnas || [], null, 2)}

CÁC PHÂN CẢNH CẦN TẠO PROMPT:
${JSON.stringify(scenes, null, 2)}

Hãy trả về kết quả dưới dạng một mảng JSON các prompt tương ứng với các sceneId đã truyền vào.`;

    const response = await generateContentWithFallbackAndRetry(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              sceneId: { type: Type.STRING },
              prompt: { type: Type.STRING, description: "Chuỗi prompt 11 phần hoàn chỉnh phân tách bằng dấu |" }
            },
            required: ["sceneId", "prompt"]
          }
        },
        temperature: 0.3,
      }
    });

    const result = JSON.parse(response.text || "[]");
    res.json(result);
  } catch (error: any) {
    console.error("Generate prompts batch error:", error);
    res.status(500).json({ error: error.message || "Đã xảy ra lỗi khi tạo prompt hàng loạt." });
  }
});

// API: Regenerate a single prompt
app.post("/api/generate-single-prompt", async (req, res) => {
  try {
    const { scene, dnas } = req.body;
    if (!scene) {
      return res.status(400).json({ error: "Thông tin phân cảnh thiếu hoặc không hợp lệ." });
    }

    const ai = getAI();
    const prompt = `Bạn là một chuyên gia viết prompt tạo ảnh tự động cho phim hoạt hình Trung Quốc (Donghua). Hãy sử dụng dữ liệu Phân cảnh đơn lẻ và Hồ Sơ ADN dưới đây để xây dựng prompt hình ảnh cho phân cảnh này.

BỘ QUY TẮC SẢN XUẤT PROMPT TỰ ĐỘNG (BẮT BUỘC):
1. Quy tắc "Sao chép Gene" (ADN Integration):
   - Mỗi prompt BẮT BUỘC phải copy nguyên xi toàn bộ nội dung mô tả ADN (tiếng Anh) của nhân vật, đồ vật, bối cảnh xuất hiện trong phân cảnh đó vào đúng vị trí tương ứng. KHÔNG TÓM TẮT, KHÔNG VIẾT TẮT, KHÔNG THAY ĐỔI từ ngữ nào của ADN.
2. Cấu trúc Prompt 11 phần (Strict Format):
   Sử dụng dấu gạch đứng | để phân tách chính xác 11 phần sau:
   Scene [Số thứ tự] | [Subject/Action/Expression] | ADN Character: [Chép y hệt 250+ từ mô tả ADN của nhân vật] | ADN Object/Setting: [Chép y hệt mô tả ADN của đồ vật hoặc bối cảnh] | Style: [ , Chinese donghua animation style, manhua, modern 2D digital art, clean line art, semi-realistic character design, cel shading mixed with soft shading, muted earth tones palette, painterly background, atmospheric lighting, ancient China setting] | Camera: [Shot/Angle/Move/Focus] | Setting: [Bối cảnh chi tiết của cảnh đó] | Mood: [Trạng thái cảm xúc] | Lighting: [Chi tiết ánh sáng] | Detail Level: [High resolution, 8k] | Composition: [Tỷ lệ khung hình và bố cục]

HỒ SƠ ADN ĐÃ CÓ:
${JSON.stringify(dnas || [], null, 2)}

PHÂN CẢNH CẦN TẠO PROMPT:
${JSON.stringify(scene, null, 2)}

Hãy trả về một đối tượng JSON duy nhất dạng:
{
  "sceneId": "${scene.id}",
  "prompt": "Scene ... | ..."
}`;

    const response = await generateContentWithFallbackAndRetry(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sceneId: { type: Type.STRING },
            prompt: { type: Type.STRING }
          },
          required: ["sceneId", "prompt"]
        },
        temperature: 0.4,
      }
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("Single prompt regeneration error:", error);
    res.status(500).json({ error: error.message || "Đã xảy ra lỗi khi tạo lại prompt." });
  }
});

// API: Generate YouTube SEO metadata description for multiple stories dasted
app.post("/api/generate-youtube-description", async (req, res) => {
  try {
    const { stories } = req.body;
    if (!stories || !Array.isArray(stories) || stories.length === 0) {
      return res.status(400).json({ error: "Danh sách truyện dán vào không hợp lệ." });
    }

    const ai = getAI();
    const prompt = `Bạn là một chuyên gia SEO YouTube chuyên nghiệp cho kênh truyện cổ tích, nhân quả, bài học cuộc sống. Hãy phân tích các câu chuyện được cung cấp dưới đây và xuất ra bộ mô tả YouTube SEO tối ưu nhất.

YÊU CẦU ĐẦU RA BẮT BUỘC:

1. Hệ Thống Tiêu Đề Cấp Độ Kép:
   - Tiêu đề trên ảnh Thumbnail: Viết 1 tiêu đề cực ngắn gọn (từ 3 đến 5 chữ), mang đậm triết lý hoài cổ và bài học nhân quả (Ví dụ: Của đi phúc đến, Lời thề dưới cầu đá, Tâm thiện sinh phúc tướng...). Tuyệt đối không dài dòng.
   - Tiêu đề Video chung: Viết 1 tiêu đề cực kỳ hấp dẫn (dưới 70 ký tự) bao quát được bài học nhân quả chung của TẤT CẢ các câu chuyện đã dán. BẮT BUỘC viết hoa các từ khóa kịch tính để thu hút người click (ví dụ: quả báo, lòng tham, tham lam, kết đắng, báo ứng, phép màu, nhân quả...).

2. Tóm Tắt Nội Dung (Dynamic Loop):
   - Với mỗi câu chuyện dán vào, hãy tạo một đoạn tóm tắt:
     + "Câu chuyện 1: [Tiêu đề truyện ngắn gọn nếu có, tóm tắt mâu thuẫn/nút thắt kịch tính tối đa 3 câu, kích thích tò mò, KHÔNG được tiết lộ cái kết]"
     + "Câu chuyện 2: [Tiêu đề truyện ngắn gọn nếu có, tóm tắt mâu thuẫn/nút thắt kịch tính tối đa 3 câu, kích thích tò mò, KHÔNG được tiết lộ cái kết]"
     + (Tiếp tục tương ứng với số truyện người dùng dán vào)

3. Cảnh Báo Nội Dung (BẢO TOÀN 100%):
   Bạn phải trích xuất nguyên văn khối cảnh báo dưới đây, cấm thay đổi hay sửa bớt bất kỳ từ ngữ nào:
   "📌 CẢNH BÁO NỘI DUNG:
   Toàn bộ nội dung câu chuyện là hư cấu, được sáng tạo để gửi gắm bài học về luật nhân quả. Mọi sự trùng hợp về tên tuổi, nhân vật hay địa danh ngoài đời thực đều là ngẫu nhiên.
   Video có sử dụng hình ảnh minh họa từ công nghệ AI kết hợp cùng tư liệu thực tế để tăng tính trải nghiệm. Kính mong quý khán giả hoan hỉ đón nhận thông điệp của video!"

4. Khối Kết Nối & Ủng Hộ:
   - Tạo một đoạn văn ngắn kêu gọi tương tác (Đăng ký kênh, thích video, chia sẻ ý kiến dưới phần bình luận).
   - Để sẵn các dòng liên kết với ký hiệu [...] ở cuối để người dùng dán link của họ:
     + 👥 Fanpage Facebook: [...]
     + 💬 Nhóm Zalo giao lưu: [...]
     + 🛒 Cửa hàng Shopee / TikTok Shop ủng hộ kênh: [...]

5. Bộ Thẻ Tag Chuẩn SEO:
   - Đề xuất chính xác 15 hashtags viết liền không dấu, bắt đầu bằng dấu #.
   - Phải bao gồm 3 tag cố định: #luatnhanqua #cauchuyncuocsong #giadinh
   - 12 tag còn lại phải được phân tích và trích xuất riêng từ nội dung cụ thể của các truyện được dán vào.

DANH SÁCH CÁC CÂU CHUYỆN ĐÃ NHẬP:
${stories.map((story, idx) => `TRUYỆN ${idx + 1}:\n${story}`).join("\n\n---\n\n")}

Hãy trả về kết quả dưới dạng đối tượng JSON.`;

    const response = await generateContentWithFallbackAndRetry(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            thumbnailTitle: { type: Type.STRING },
            videoTitle: { type: Type.STRING },
            summaries: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  index: { type: Type.INTEGER },
                  text: { type: Type.STRING }
                },
                required: ["index", "text"]
              }
            },
            warning: { type: Type.STRING },
            connection: { type: Type.STRING },
            hashtags: { type: Type.STRING }
          },
          required: ["thumbnailTitle", "videoTitle", "summaries", "warning", "connection", "hashtags"]
        },
        temperature: 0.3,
      }
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("Generate YouTube description error:", error);
    res.status(500).json({ error: error.message || "Đã xảy ra lỗi khi tạo mô tả YouTube." });
  }
});


// Serve static assets and handle routing
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
