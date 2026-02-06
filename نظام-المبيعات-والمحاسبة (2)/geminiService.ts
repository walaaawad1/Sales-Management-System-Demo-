
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateBusinessInsights(dashboardData: any) {
  try {
    const prompt = `
      بصفتك محلل أعمال خبير، قم بتحليل بيانات المبيعات التالية باللغة العربية:
      ${JSON.stringify(dashboardData)}
      
      المطلوب:
      1. ملخص سريع لأداء المبيعات.
      2. ثلاث نصائح لتحسين الدخل أو تقليل المنتجات المكدسة.
      3. ملاحظة حول توجهات العملاء (جدد مقابل عائدين).
      
      اجعل الرد موجزاً ومهنياً.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text;
  } catch (error) {
    console.error("Error generating insights:", error);
    return "عذراً، لم نتمكن من تحليل البيانات حالياً. يرجى المحاولة لاحقاً.";
  }
}
